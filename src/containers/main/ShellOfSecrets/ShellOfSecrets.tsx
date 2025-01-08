import SoSWidget from './SoSWidget/SoSWidget';
import SoSIntro from './SoSIntro/SoSIntro';
import { useShellOfSecretsStore } from '../../../store/useShellOfSecretsStore';
import { AnimatePresence } from 'framer-motion';

export default function ShellOfSecrets() {
    const { showWidget, showIntro } = useShellOfSecretsStore();

    return (
        <>
            <AnimatePresence>{showWidget && <SoSWidget />}</AnimatePresence>
            <AnimatePresence>{showIntro && <SoSIntro />}</AnimatePresence>
        </>
    );
}
