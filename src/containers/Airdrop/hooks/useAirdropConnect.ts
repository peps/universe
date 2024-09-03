import { useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAirdropStore } from '@app/store/useAirdropStore';
import { open } from '@tauri-apps/api/shell';

const useAirdropConnect = () => {
    const { authUuid, setAuthUuid, setAirdropTokens } = useAirdropStore();

    const handleAuth = useCallback(() => {
        const token = uuidv4();
        setAuthUuid(token);
        open(`https://airdrop.tari.com?tari=${token}`);
    }, [setAuthUuid]);

    useEffect(() => {
        if (authUuid) {
            const interval = setInterval(() => {
                if (authUuid) {
                    fetch(`https://airdrop.tari.com/api/auth/twitter/get-token/${authUuid}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })
                        .then((response) => response.json())
                        .then((data) => {
                            if (!data.error) {
                                clearInterval(interval);
                                setAirdropTokens(data);
                            }
                        });
                }
            }, 1000);
            const timeout = setTimeout(
                () => {
                    clearInterval(interval);
                    setAuthUuid('');
                },
                1000 * 60 * 5
            );

            return () => {
                clearInterval(interval);
                clearTimeout(timeout);
            };
        }
    }, [authUuid, setAirdropTokens, setAuthUuid]);

    return { handleAuth };
};

export default useAirdropConnect;
