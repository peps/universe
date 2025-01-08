import { useState, useEffect } from 'react';
import { Layer, Wrapper } from './styles';

interface Props {
    children: React.ReactNode;
}

const GlitchEffect = ({ children }: Props) => {
    const [offset1, setOffset1] = useState(0);
    const [offset2, setOffset2] = useState(0);
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        const glitchInterval = setInterval(() => {
            if (Math.random() > 0.92) {
                setOffset1(Math.random() * 20 - 10);
                setOffset2(Math.random() * -20 + 10);
                setOpacity(0.9);

                setTimeout(() => {
                    setOffset1(0);
                    setOffset2(0);
                    setOpacity(1);
                }, 150);
            }
        }, 50);

        return () => clearInterval(glitchInterval);
    }, []);

    return (
        <Wrapper>
            <Layer>{children}</Layer>
            <Layer $isColorChannel $offset={offset1} $glitchOpacity={opacity}>
                {children}
            </Layer>
            <Layer $isColorChannel $offset={offset2} $glitchOpacity={opacity}>
                {children}
            </Layer>
        </Wrapper>
    );
};

export default GlitchEffect;
