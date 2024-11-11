import { useState } from 'react';

import { AnimatePresence } from 'framer-motion';

import { Toast } from './Toast/Toast';
import { useToastStore } from './useToastStore';

import { Inside, Wrapper } from './styles';
import { ToastTesting } from './ToastTesting';

export const ToastStack = () => {
    const { toasts } = useToastStore();
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const reversedToasts = [...toasts].reverse();

    return (
        <>
            <Wrapper>
                <Inside onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                    <AnimatePresence>
                        {reversedToasts.map(({ id, title, text, timeout, type }, index) => (
                            <Toast
                                key={`toast-${id}-${title}`}
                                id={id || 0}
                                title={title}
                                text={text}
                                timeout={timeout}
                                type={type}
                                index={index}
                                isHovered={isHovered}
                            />
                        ))}
                    </AnimatePresence>
                </Inside>
            </Wrapper>

            <ToastTesting />
        </>
    );
};
