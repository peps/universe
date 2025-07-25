import { useUIStore } from '@app/store/useUIStore';

import { DialogContent, Dialog } from '@app/components/elements/dialog/Dialog';
import { memo, useCallback, useEffect, useState } from 'react';
import { ButtonWrapper, CountdownNumber, KeepButton, RevertButton, Text, TextWrapper, Title, Wrapper } from './styles';
import { useTranslation } from 'react-i18next';
import { setDialogToShow } from '@app/store/actions';
import { selectMiningMode } from '@app/store/actions/appConfigStoreActions';

const Countdown = memo(function Countdown({ onComplete }: { onComplete: () => void }) {
    const [count, setCount] = useState(30);

    useEffect(() => {
        if (count === 0) {
            onComplete();
            return;
        }
        const timer = setTimeout(() => setCount(count - 1), 1000);
        return () => clearTimeout(timer);
    }, [count, onComplete]);

    return <CountdownNumber>{count < 10 ? `0${count}` : count}</CountdownNumber>;
});

const LudicrousCofirmationDialog = memo(function LudicrousCofirmationDialog() {
    const { t } = useTranslation('components', { useSuspense: false });
    const open = useUIStore((s) => s.dialogToShow === 'ludicrousConfirmation');

    const handleClose = useCallback(() => {
        setDialogToShow(null);
    }, []);

    const handleChange = useCallback(async () => {
        await selectMiningMode('Ludicrous');
        setDialogToShow(null);
    }, []);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <Wrapper>
                    <TextWrapper>
                        <Title>{t('ludicrousConfirmationDialog.title')}</Title>
                        <Text>
                            {t('ludicrousConfirmationDialog.description')} <Countdown onComplete={handleClose} />{' '}
                            {t('ludicrousConfirmationDialog.seconds')}.
                        </Text>
                    </TextWrapper>
                    <ButtonWrapper>
                        <KeepButton onClick={handleChange}>
                            <span>🔥</span> {t('ludicrousConfirmationDialog.keepChanges')}
                        </KeepButton>
                        <RevertButton onClick={handleClose}>{t('ludicrousConfirmationDialog.cancel')}</RevertButton>
                    </ButtonWrapper>
                </Wrapper>
            </DialogContent>
        </Dialog>
    );
});

export default LudicrousCofirmationDialog;
