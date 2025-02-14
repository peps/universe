export enum WebsocketEventNames {
    COMPLETED_QUEST = 'completed_quest',
    MINING_STATUS_CREW_UPDATE = 'mining_status_crew_update',
    MINING_STATUS_CREW_DISCONNECTED = 'mining_status_crew_disconnected',
    REFERRAL_INSTALL_REWARD = 'referral_install_reward',
    MINING_STATUS_USER_UPDATE = 'mining_status_user_update',
}

export interface QuestCompletedEvent {
    name: WebsocketEventNames.COMPLETED_QUEST;
    data: {
        questName: string;
        userId: string;
        questPointType?: unknown;
        quetPoints?: number;
        userPoints?: {
            gems: number;
            shells: number;
            hammers: number;
        };
    };
}

export interface CrewMember {
    imageUrl: string | null;
    id: string;
    name: string;
    profileImageUrl: string | null;
    lastHandshakeAt: Date | null;
    active?: boolean;
}

export interface MiningStatusCrewUpdateEvent {
    name: WebsocketEventNames.MINING_STATUS_CREW_UPDATE;
    data: {
        totalTimeBonusMs: number;
        crewMember: { id: string };
    };
}

export interface MiningStatusUserUpdateEvent {
    name: WebsocketEventNames.MINING_STATUS_USER_UPDATE;
    data: {
        totalTimeBonusMs: number;
    };
}

export interface MiningStatusCrewDisconnectedEvent {
    name: WebsocketEventNames.MINING_STATUS_CREW_DISCONNECTED;
    data: {
        crewMemberId: string;
    };
}

export interface ReferralInstallRewardEvent {
    name: WebsocketEventNames.REFERRAL_INSTALL_REWARD;
}

export type WebsocketUserEvent =
    | ReferralInstallRewardEvent
    | QuestCompletedEvent
    | MiningStatusCrewUpdateEvent
    | MiningStatusUserUpdateEvent
    | MiningStatusCrewDisconnectedEvent;
