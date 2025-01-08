import { AnimatePresence } from 'framer-motion';
import { Wrapper } from './styles';
import { useEffect, useState } from 'react';

const variants = {
    hidden: {
        opacity: 0,
        scaleY: 0,
        scaleX: 0.8,
    },
    visible: {
        opacity: 1,
        scaleY: 1,
        scaleX: 1,
    },
    exit: {
        opacity: 0,
        scaleY: 0,
        scaleX: 0.8,
    },
};

interface Props {
    children: React.ReactNode;
}

const CRTEffect = ({ children }: Props) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence mode="wait">
            {isVisible && (
                <Wrapper initial="hidden" animate="visible" exit="exit" variants={variants}>
                    {children}
                </Wrapper>
            )}
        </AnimatePresence>
    );
};

export default CRTEffect;
