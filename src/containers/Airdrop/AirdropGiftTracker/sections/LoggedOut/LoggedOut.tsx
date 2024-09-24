import { GIFT_GEMS, useAirdropStore } from '@app/store/useAirdropStore';
import Gems from '../../components/Gems/Gems';
import { ClaimButton, Wrapper } from './styles';
import { useCallback, useEffect, useState } from 'react';
import { open } from '@tauri-apps/api/shell';
import { v4 as uuidv4 } from 'uuid';
import ClaimModal from '../../components/Claimmodal/ClaimModal';

export default function LoggedOut() {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const { authUuid, setAuthUuid, setAirdropTokens, setUserPoints, backendInMemoryConfig } = useAirdropStore();

    const handleAuth = useCallback(
        (code?: string) => {
            const token = uuidv4();
            if (backendInMemoryConfig?.airdropTwitterAuthUrl) {
                setAuthUuid(token);
                open(
                    `${backendInMemoryConfig?.airdropTwitterAuthUrl}/auth?tauri=${token}${code ? `&universeReferral=${code}` : ''}`
                );
            }
        },
        [backendInMemoryConfig?.airdropTwitterAuthUrl, setAuthUuid]
    );

    useEffect(() => {
        if (authUuid && backendInMemoryConfig?.airdropApiUrl) {
            const interval = setInterval(() => {
                if (authUuid) {
                    fetch(`${backendInMemoryConfig?.airdropApiUrl}/auth/twitter/get-token/${authUuid}`, {
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
    }, [authUuid, backendInMemoryConfig?.airdropApiUrl, setAirdropTokens, setAuthUuid, setUserPoints]);

    return (
        <>
            <Wrapper>
                <ClaimButton onClick={() => setModalIsOpen(true)}>
                    <span>Claim Gems</span>
                </ClaimButton>

                <Gems number={GIFT_GEMS} label={`Unclaimed Gems`} />
            </Wrapper>
            {modalIsOpen && <ClaimModal onSubmit={handleAuth} onClose={() => setModalIsOpen(false)} />}
        </>
    );
}
