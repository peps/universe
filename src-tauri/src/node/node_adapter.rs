// Copyright 2024. The Tari Project
//
// Redistribution and use in source and binary forms, with or without modification, are permitted provided that the
// following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following
// disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the
// following disclaimer in the documentation and/or other materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote
// products derived from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
// INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
// WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE
// USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

use crate::ab_test_selector::ABTestSelector;
use crate::node::node_manager::NodeType;
use crate::process_adapter::{HealthStatus, StatusMonitor};
use anyhow::{anyhow, Error};
use async_trait::async_trait;
use minotari_node_grpc_client::grpc::{
    BlockHeader, Empty, GetBlocksRequest, GetNetworkStateRequest, SyncState,
};
use std::path::PathBuf;
use std::time::{Duration, SystemTime};
use tari_utilities::epoch_time::EpochTime;
use tokio::fs;

use chrono::{NaiveDateTime, TimeZone, Utc};
use log::{error, info, warn};
use minotari_node_grpc_client::BaseNodeGrpcClient;
use serde::Serialize;
use std::collections::HashMap;
use std::fmt::Write as _;
use std::sync::atomic::AtomicU64;
use std::sync::Arc;
use tari_common::configuration::Network;
use tari_core::transactions::tari_amount::MicroMinotari;
use tari_crypto::ristretto::RistrettoPublicKey;
use tari_shutdown::ShutdownSignal;
use tari_utilities::hex::Hex;
use tari_utilities::ByteArray;
use tokio::sync::watch;
use tokio::time::timeout;

use crate::network_utils::{get_best_block_from_block_scan, get_block_info_from_block_scan};

const LOG_TARGET: &str = "tari::universe::minotari_node_adapter";

#[async_trait]
pub trait NodeAdapter {
    fn get_grpc_address(&self) -> Option<(String, u16)>;
    fn set_grpc_address(&mut self, grpc_address: String) -> Result<(), anyhow::Error>;
    fn get_service(&self) -> Option<NodeAdapterService>;
    async fn get_connection_details(&self) -> Result<(RistrettoPublicKey, String), anyhow::Error>;
    fn get_http_api_url(&self) -> String;
    fn use_tor(&mut self, use_tor: bool);
    fn set_tor_control_port(&mut self, tor_control_port: Option<u16>);
    fn set_ab_group(&mut self, ab_group: ABTestSelector);
}

#[derive(Debug, Clone)]
pub(crate) struct NodeAdapterService {
    connection_address: String,
    required_sync_peers: u32,
}

impl NodeAdapterService {
    pub fn new(connection_address: String, required_sync_peers: u32) -> Self {
        Self {
            connection_address,
            required_sync_peers,
        }
    }

    pub async fn get_network_state(&self) -> Result<BaseNodeStatus, NodeStatusMonitorError> {
        let mut client = BaseNodeGrpcClient::connect(self.connection_address.clone())
            .await
            .map_err(|_| NodeStatusMonitorError::NodeNotStarted)?;

        let res = client
            .get_network_state(GetNetworkStateRequest {})
            .await
            .map_err(|e| NodeStatusMonitorError::UnknownError(e.into()))?;
        let res = res.into_inner();

        let block_height = res
            .metadata
            .as_ref()
            .map(|m| m.best_block_height)
            .unwrap_or(0);
        let block_time = res.metadata.as_ref().map(|m| m.timestamp).unwrap_or(0);

        Ok(BaseNodeStatus {
            sha_network_hashrate: res.sha3x_estimated_hash_rate,
            tari_randomx_network_hashrate: res.tari_randomx_estimated_hash_rate,
            monero_randomx_network_hashrate: res.monero_randomx_estimated_hash_rate,
            block_reward: MicroMinotari(res.reward),
            block_height,
            block_time,
            is_synced: res.initial_sync_achieved,
            num_connections: res.num_connections,
            readiness_status: res
                .readiness_status
                .map(|s| s.into())
                .unwrap_or(ReadinessStatus::NOT_READY),
        })
    }

    pub async fn get_historical_blocks(
        &self,
        heights: Vec<u64>,
    ) -> Result<Vec<(u64, String)>, Error> {
        let mut client = BaseNodeGrpcClient::connect(self.connection_address.clone()).await?;

        let mut res = client
            .get_blocks(GetBlocksRequest { heights })
            .await?
            .into_inner();

        let mut blocks: Vec<(u64, String)> = Vec::new();
        while let Some(block) = res.message().await? {
            let BlockHeader { height, hash, .. } = block
                .block
                .clone()
                .expect("Failed to get block data")
                .header
                .expect("Failed to get block header data");
            let hash: String = hash.iter().fold(String::new(), |mut acc, x| {
                write!(acc, "{x:02x}").expect("Unable to write");
                acc
            });

            blocks.push((height, hash));
        }
        Ok(blocks)
    }

    pub async fn get_identity(&self) -> Result<NodeIdentity, Error> {
        let mut client = BaseNodeGrpcClient::connect(self.connection_address.clone()).await?;
        let id = client.identify(Empty {}).await?;
        let res = id.into_inner();

        Ok(NodeIdentity {
            public_key: RistrettoPublicKey::from_canonical_bytes(&res.public_key)
                .map_err(|e| anyhow!(e.to_string()))?,
            public_addresses: res.public_addresses,
        })
    }

    #[allow(clippy::too_many_lines)]
    pub async fn wait_synced(
        &self,
        progress_params_tx: &watch::Sender<HashMap<String, String>>,
        progress_percentage_tx: &watch::Sender<f64>,
        shutdown_signal: ShutdownSignal,
    ) -> Result<u64, NodeStatusMonitorError> {
        let mut client = BaseNodeGrpcClient::connect(self.connection_address.clone())
            .await
            .map_err(|_e| NodeStatusMonitorError::NodeNotStarted)?;

        loop {
            if shutdown_signal.is_triggered() {
                return Ok(0);
            }

            let tip = client
                .get_tip_info(Empty {})
                .await
                .map_err(|e| NodeStatusMonitorError::UnknownError(e.into()))?;
            let sync_progress = client
                .get_sync_progress(Empty {})
                .await
                .map_err(|e| NodeStatusMonitorError::UnknownError(e.into()))?;

            let tip_res = tip.into_inner();
            let sync_progress = sync_progress.into_inner();

            let mut progress_params: HashMap<String, String> = HashMap::new();
            let mut percentage = 0f64;

            if sync_progress.state == SyncState::Startup as i32 {
                percentage = sync_progress.initial_connected_peers as f64
                    / f64::from(self.required_sync_peers);
                progress_params.insert("step".to_string(), "Startup".to_string());
                progress_params.insert(
                    "initial_connected_peers".to_string(),
                    sync_progress.initial_connected_peers.to_string(),
                );
                progress_params.insert(
                    "required_peers".to_string(),
                    self.required_sync_peers.to_string(),
                );
            }
            if sync_progress.state == SyncState::Header as i32 {
                percentage = sync_progress.local_height as f64 / sync_progress.tip_height as f64;
                progress_params.insert("step".to_string(), "Header".to_string());
                progress_params.insert(
                    "local_header_height".to_string(),
                    sync_progress.local_height.to_string(),
                );
                progress_params.insert(
                    "tip_header_height".to_string(),
                    sync_progress.tip_height.to_string(),
                );
                progress_params.insert("local_block_height".to_string(), "0".to_string());
                progress_params.insert(
                    "tip_block_height".to_string(),
                    sync_progress.tip_height.to_string(),
                );
                // Keep these fields for old translations that have not been updated
                progress_params.insert(
                    "local_height".to_string(),
                    sync_progress.local_height.to_string(),
                );
                progress_params.insert(
                    "tip_height".to_string(),
                    sync_progress.tip_height.to_string(),
                );
            }
            if sync_progress.state == SyncState::Block as i32 {
                percentage = sync_progress.local_height as f64 / sync_progress.tip_height as f64;
                progress_params.insert("step".to_string(), "Block".to_string());
                progress_params.insert(
                    "local_header_height".to_string(),
                    sync_progress.tip_height.to_string(),
                );
                progress_params.insert(
                    "tip_header_height".to_string(),
                    sync_progress.tip_height.to_string(),
                );
                progress_params.insert(
                    "local_block_height".to_string(),
                    sync_progress.local_height.to_string(),
                );
                progress_params.insert(
                    "tip_block_height".to_string(),
                    sync_progress.tip_height.to_string(),
                );
                // Keep these fields for old translations that have not been updated
                progress_params.insert(
                    "local_height".to_string(),
                    sync_progress.local_height.to_string(),
                );
                progress_params.insert(
                    "tip_height".to_string(),
                    sync_progress.tip_height.to_string(),
                );
            }

            progress_percentage_tx.send(percentage).ok();
            progress_params_tx.send(progress_params).ok();

            if tip_res.initial_sync_achieved
                && tip_res
                    .metadata
                    .clone()
                    .is_some_and(|metadata| metadata.best_block_height > 0)
            {
                info!(target: LOG_TARGET, "Initial sync achieved");
                let tip_height = match tip_res.metadata {
                    Some(metadata) => metadata.best_block_height,
                    None => 0,
                };
                return Ok(tip_height);
            }

            tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
        }
    }

    pub async fn list_connected_peers(&self) -> Result<Vec<String>, anyhow::Error> {
        let mut client = BaseNodeGrpcClient::connect(self.connection_address.clone()).await?;
        let peers_list = client
            .list_connected_peers(Empty {})
            .await
            .map_err(|e| anyhow::anyhow!("Error list_connected_peers: {}", e))?
            .into_inner()
            .connected_peers;

        let connected_peers = peers_list
            .iter()
            .filter(|peer| {
                let since = match NaiveDateTime::parse_from_str(
                    peer.addresses[0].last_seen.as_str(),
                    "%Y-%m-%d %H:%M:%S%.f",
                ) {
                    Ok(datetime) => datetime,
                    Err(_e) => {
                        return false;
                    }
                };
                let since = Utc.from_utc_datetime(&since);
                let duration = SystemTime::now()
                    .duration_since(since.into())
                    .unwrap_or_default();
                duration.as_secs() < 60
            })
            .cloned()
            .map(|peer| peer.addresses[0].address.to_hex())
            .collect::<Vec<String>>();

        Ok(connected_peers)
    }

    pub async fn check_if_is_orphan_chain(&self) -> Result<bool, anyhow::Error> {
        let BaseNodeStatus { is_synced, .. } = self.get_network_state().await?;
        if !is_synced {
            info!(target: LOG_TARGET, "Node is not synced, skipping orphan chain check");
            return Ok(false);
        }

        let network = Network::get_current_or_user_setting_or_default();
        let block_scan_tip = get_best_block_from_block_scan(network).await?;
        let heights: Vec<u64> = vec![
            block_scan_tip.saturating_sub(50),
            block_scan_tip.saturating_sub(100),
            block_scan_tip.saturating_sub(200),
        ];
        let mut block_scan_blocks: Vec<(u64, String)> = vec![];

        for height in &heights {
            let block_scan_block = get_block_info_from_block_scan(network, height).await?;
            block_scan_blocks.push(block_scan_block);
        }

        let local_blocks = self.get_historical_blocks(heights).await?;
        for block_scan_block in &block_scan_blocks {
            if !local_blocks
                .iter()
                .any(|local_block| block_scan_block.1 == local_block.1)
            {
                let local_block = local_blocks.iter().find(|b| b.0 == block_scan_block.0);
                error!(target: LOG_TARGET, "Miner is stuck on orphan chain. Block at height: {} and hash: {} does not exist locally", block_scan_block.0, block_scan_block.1);
                if let Some(local_block) = local_block {
                    error!(target: LOG_TARGET, "Local block at height: {} and hash: {}", local_block.0, local_block.1);
                }
                return Ok(true);
            }
        }

        Ok(false)
    }
}

#[derive(Clone)]
pub(crate) struct NodeStatusMonitor {
    node_type: NodeType,
    node_service: NodeAdapterService,
    status_broadcast: watch::Sender<BaseNodeStatus>,
    last_block_time: Arc<AtomicU64>,
    base_path: Option<PathBuf>,
}

impl NodeStatusMonitor {
    pub fn new(
        node_type: NodeType,
        node_service: NodeAdapterService,
        status_broadcast: watch::Sender<BaseNodeStatus>,
        last_block_time: Arc<AtomicU64>,
        base_path: Option<PathBuf>,
    ) -> Self {
        Self {
            node_type,
            node_service,
            status_broadcast,
            last_block_time,
            base_path,
        }
    }
}

#[async_trait]
impl StatusMonitor for NodeStatusMonitor {
    async fn check_health(&self, uptime: Duration, timeout_duration: Duration) -> HealthStatus {
        match timeout(timeout_duration, self.node_service.get_network_state()).await {
            Ok(res) => match res {
                Ok(status) => {
                    let _res = self.status_broadcast.send(status);
                    if status.readiness_status.is_initializing() {
                        info!(
                            "{:?} Node Health Check: Not ready yet | status: {:?}",
                            self.node_type,
                            status.clone()
                        );
                        return HealthStatus::Initializing;
                    }

                    if status.num_connections == 0 {
                        warn!(
                            "{:?} Node Health Check Warning: No connections | status: {:?}",
                            self.node_type,
                            status.clone()
                        );
                        return HealthStatus::Warning;
                    }

                    if self
                        .last_block_time
                        .load(std::sync::atomic::Ordering::SeqCst)
                        == status.block_time
                    {
                        if uptime.as_secs() > 3600
                            && EpochTime::now()
                                .checked_sub(EpochTime::from_secs_since_epoch(status.block_time))
                                .unwrap_or(EpochTime::from(0))
                                .as_u64()
                                > 3600
                        {
                            warn!(target: LOG_TARGET, "Base node height has not changed in an hour");
                            return HealthStatus::Unhealthy;
                        }
                    } else {
                        self.last_block_time
                            .store(status.block_time, std::sync::atomic::Ordering::SeqCst);
                    }
                    HealthStatus::Healthy
                }
                Err(e) => {
                    warn!(
                        "{:?} Node Health Check Error: checking base node status: {:?}",
                        self.node_type, e
                    );
                    HealthStatus::Unhealthy
                }
            },
            Err(e) => {
                warn!(
                    "{:?} Node Health Check (get_network_state) error: {:?}",
                    self.node_type, e
                );
                match self.node_service.get_identity().await {
                    Ok(identity) => {
                        info!(target: LOG_TARGET, "{:?} Node checking base node identity success: {:?}", self.node_type, identity);
                        return HealthStatus::Warning;
                    }
                    Err(e) => {
                        warn!(
                            "{:?} Node Health Check Error: checking base node identity: {:?}",
                            self.node_type, e
                        );
                        return HealthStatus::Unhealthy;
                    }
                }
            }
        }
    }

    async fn handle_unhealthy(&self) -> Result<(), anyhow::Error> {
        if self.node_type == NodeType::Remote {
            // Do not clear local node files for remote nodes
            return Ok(());
        }

        if let Some(ref base_path) = self.base_path {
            let _unused = fs::remove_dir_all(
                base_path
                    .join("node")
                    .join(Network::get_current().to_string().to_lowercase())
                    .join("peer_db"),
            )
            .await;
            let _unused = fs::remove_dir_all(
                base_path
                    .join("node")
                    .join(Network::get_current().to_string().to_lowercase())
                    .join("libtor"),
            )
            .await;
            let _unused = fs::remove_dir_all(base_path.join("tor-data")).await;
        }

        Ok(())
    }
}

#[derive(Clone, Debug, Serialize)]
pub struct NodeIdentity {
    pub public_key: RistrettoPublicKey,
    pub public_addresses: Vec<String>,
}

#[derive(Clone, Copy, Debug, serde::Deserialize, serde::Serialize)]
pub struct MigrationProgress {
    pub current_block: u64,
    pub total_blocks: u64,
    pub progress_percentage: f64,
    pub current_db_version: u64,
    pub target_db_version: u64,
}

#[derive(Clone, Copy, Debug, serde::Deserialize, serde::Serialize)]
pub enum ReadinessStatus {
    State(i32),
    Migration(MigrationProgress),
}

impl ReadinessStatus {
    // Constants for all state variants - updated to match new values
    pub const NOT_READY: Self = Self::State(0);
    pub const STARTING_UP: Self = Self::State(1);
    pub const DATABASE_INITIALIZING: Self = Self::State(10);
    pub const RECOVERING_PREPARING: Self = Self::State(20);
    pub const RECOVERING_REBUILDING: Self = Self::State(21);
    pub const RECOVERING_REBUILDING_DATABASE: Self = Self::State(22);
    pub const BUILDING_CONTEXT_BLOCKCHAIN: Self = Self::State(32);
    pub const BUILDING_CONTEXT_BOOTSTRAP: Self = Self::State(34);
    pub const READY: Self = Self::State(100);

    /// Check if the node is ready
    pub fn is_ready(&self) -> bool {
        matches!(self, Self::State(100))
    }

    /// Check if the node is not ready
    pub fn is_initializing(&self) -> bool {
        !self.is_ready()
    }

    /// Get the raw i32 value for state, or a representative value for migration
    pub fn as_i32(&self) -> i32 {
        match self {
            Self::State(value) => *value,
            Self::Migration(_) => 50, // Representative value for migration
        }
    }

    /// Get a human-readable status string
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::State(0) => "Not Ready",
            Self::State(1) => "Starting Up",
            Self::State(10) => "Database Initializing",
            Self::State(20) => "Recovering - Preparing",
            Self::State(21) => "Recovering - Rebuilding",
            Self::State(22) => "Recovering - Rebuilding Database",
            Self::State(32) => "Building Context - Blockchain",
            Self::State(34) => "Building Context - Bootstrap",
            Self::State(100) => "Ready",
            Self::State(_) => "Unknown State",
            Self::Migration(_) => "Migrating Database",
        }
    }
}

impl From<minotari_node_grpc_client::grpc::ReadinessStatus> for ReadinessStatus {
    fn from(status: minotari_node_grpc_client::grpc::ReadinessStatus) -> Self {
        if let Some(status_oneof) = status.status {
            match status_oneof {
                minotari_node_grpc_client::grpc::readiness_status::Status::State(state) => {
                    Self::State(state)
                }
                minotari_node_grpc_client::grpc::readiness_status::Status::Migration(migration) => {
                    Self::Migration(MigrationProgress {
                        current_block: migration.current_block,
                        total_blocks: migration.total_blocks,
                        progress_percentage: migration.progress_percentage,
                        current_db_version: migration.current_db_version,
                        target_db_version: migration.target_db_version,
                    })
                }
            }
        } else {
            Self::NOT_READY
        }
    }
}

impl From<i32> for ReadinessStatus {
    fn from(value: i32) -> Self {
        Self::State(value)
    }
}

impl From<ReadinessStatus> for minotari_node_grpc_client::grpc::ReadinessStatus {
    fn from(status: ReadinessStatus) -> Self {
        let status_oneof = match status {
            ReadinessStatus::State(state_value) => {
                minotari_node_grpc_client::grpc::readiness_status::Status::State(state_value)
            }
            ReadinessStatus::Migration(migration) => {
                let migration_proto = minotari_node_grpc_client::grpc::MigrationProgress {
                    current_block: migration.current_block,
                    total_blocks: migration.total_blocks,
                    progress_percentage: migration.progress_percentage,
                    current_db_version: migration.current_db_version,
                    target_db_version: migration.target_db_version,
                };
                minotari_node_grpc_client::grpc::readiness_status::Status::Migration(
                    migration_proto,
                )
            }
        };

        minotari_node_grpc_client::grpc::ReadinessStatus {
            status: Some(status_oneof),
            timestamp: 0, // Default timestamp value
        }
    }
}

impl ReadinessStatus {
    /// Get detailed status information including migration progress
    pub fn detailed_str(&self) -> String {
        match self {
            Self::State(0) => "Not Ready".to_string(),
            Self::State(1) => "Starting Up".to_string(),
            Self::State(10) => "Database Initializing".to_string(),
            Self::State(20) => "Recovering - Preparing".to_string(),
            Self::State(21) => "Recovering - Rebuilding".to_string(),
            Self::State(22) => "Recovering - Rebuilding Database".to_string(),
            Self::State(32) => "Building Context - Blockchain".to_string(),
            Self::State(34) => "Building Context - Bootstrap".to_string(),
            Self::State(100) => "Ready".to_string(),
            Self::State(value) => format!("Unknown State ({value})"),
            Self::Migration(progress) => {
                format!(
                    "Migrating DB v{} -> v{} ({:.1}% - {}/{})",
                    progress.current_db_version,
                    progress.target_db_version,
                    progress.progress_percentage,
                    progress.current_block,
                    progress.total_blocks
                )
            }
        }
    }

    /// Get migration progress if status is migrating
    pub fn migration_progress(&self) -> Option<&MigrationProgress> {
        match self {
            Self::Migration(progress) => Some(progress),
            _ => None,
        }
    }
}

impl std::fmt::Display for ReadinessStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.detailed_str())
    }
}

#[derive(Clone, Copy, Debug, Serialize)]
pub(crate) struct BaseNodeStatus {
    pub sha_network_hashrate: u64,
    pub monero_randomx_network_hashrate: u64,
    pub tari_randomx_network_hashrate: u64,
    pub block_reward: MicroMinotari,
    pub block_height: u64,
    pub block_time: u64,
    pub is_synced: bool,
    pub num_connections: u64,
    pub readiness_status: ReadinessStatus,
}

impl Default for BaseNodeStatus {
    fn default() -> Self {
        Self {
            sha_network_hashrate: 0,
            monero_randomx_network_hashrate: 0,
            tari_randomx_network_hashrate: 0,
            block_reward: MicroMinotari(0),
            block_height: 0,
            block_time: 0,
            is_synced: false,
            num_connections: 0,
            readiness_status: ReadinessStatus::NOT_READY,
        }
    }
}

#[derive(Debug, thiserror::Error)]
pub enum NodeStatusMonitorError {
    #[error("Unknown error: {0}")]
    UnknownError(#[from] anyhow::Error),
    #[error("Node not started")]
    NodeNotStarted,
}
