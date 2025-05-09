import { handleWinRecap, useBlockchainVisualisationStore } from '@app/store/useBlockchainVisualisationStore.ts';
import { useCallback, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { useWalletStore } from '@app/store/useWalletStore.ts';

export default function useEarningsRecap() {
    const recapIds = useBlockchainVisualisationStore((s) => s.recapIds);
    const coinbase_transactions = useWalletStore((s) => s.coinbase_transactions);

    const getMissedEarnings = useCallback(() => {
        if (recapIds.length && coinbase_transactions.length) {
            const missedWins = coinbase_transactions.filter((tx) => recapIds.includes(tx.tx_id));
            const count = missedWins.length;
            if (count > 0) {
                const totalEarnings = missedWins.reduce((earnings, cur) => earnings + cur.amount, 0);
                handleWinRecap({ count, totalEarnings });
            }
        }
    }, [recapIds, coinbase_transactions]);

    useEffect(() => {
        const listener = listen<string>('tauri://focus', () => {
            const documentIsVisible = document?.visibilityState === 'visible' || false;
            if (documentIsVisible) {
                getMissedEarnings();
            }
        });

        return () => {
            listener.then((unlisten) => unlisten());
        };
    }, [getMissedEarnings, recapIds]);
}
