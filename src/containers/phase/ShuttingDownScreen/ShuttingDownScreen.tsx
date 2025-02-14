import { CircularProgress } from '@app/components/elements/CircularProgress.tsx';
import { Typography } from '@app/components/elements/Typography.tsx';
import { useTranslation } from 'react-i18next';
import { ShuttingDownScreenContainer } from './ShuttingDownScreen.styles';

export default function ShuttingDownScreen() {
    const { t } = useTranslation('common', { useSuspense: false });

    return (
        <ShuttingDownScreenContainer>
            <CircularProgress />
            <Typography variant="h4">{t('shutting-down')}</Typography>
        </ShuttingDownScreenContainer>
    );
}
