import styled from 'styled-components';
import * as m from 'motion/react-m';

export const SplashScreenContainer = styled(m.div)`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    min-height: 100vh;
    min-width: 100vw;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10000;
    background: ${({ theme }) => theme.palette.base};
`;

export const LottieWrapper = styled.div`
    display: flex;
    height: 300px;
    width: 300px;
`;
