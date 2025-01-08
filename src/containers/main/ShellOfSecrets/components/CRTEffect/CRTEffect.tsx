import { AnimatePresence } from 'framer-motion';
import { Wrapper } from './styles';
import { useEffect, useState } from 'react';

interface Props {
    children: React.ReactNode;
}

const CRTEffect = ({ children }: Props) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 320);

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence mode="wait">
            {isVisible && (
                <Wrapper
                    initial={{ opacity: 0, scaleY: 0, scaleX: 0.8 }}
                    animate={{ opacity: 1, scaleY: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleY: 0, scaleX: 0.8 }}
                >
                    {children}
                </Wrapper>
            )}
        </AnimatePresence>
    );
};

export default CRTEffect;
