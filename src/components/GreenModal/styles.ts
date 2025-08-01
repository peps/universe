import * as m from 'motion/react-m';
import styled, { css } from 'styled-components';

export const Wrapper = styled('div')`
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 101;

    display: flex;
    justify-content: center;
    align-items: center;

    pointer-events: all;

    overflow: hidden;
    overflow-y: auto;
`;

export const Cover = styled(m.div)`
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 0;
    cursor: pointer;

    backdrop-filter: blur(10px);
`;

export const BoxWrapper = styled(m.div)<{ $boxWidth?: number; $padding?: number }>`
    width: 100%;
    flex-shrink: 0;
    border-radius: 35px;
    background: linear-gradient(180deg, #c9eb00 32.79%, #fff 92.04%);
    box-shadow: 28px 28px 77px 0 rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 40px;
    max-width: 635px;
    padding: 50px;

    @media (max-height: 900px) {
        gap: 20px;
        padding: 20px;
    }

    ${({ $boxWidth }) =>
        $boxWidth &&
        css`
            max-width: ${$boxWidth}px;
        `}

    ${({ $padding }) =>
        $padding &&
        css`
            padding: ${$padding}px;
        `}
`;

export const CloseButton = styled('button')`
    cursor: pointer;
    position: absolute;
    top: -20px;
    left: 100%;
    margin-left: 5px;
    color: rgba(255, 255, 255, 0.5);
    transition:
        color 0.2s ease,
        transform 0.2s ease;

    &:hover {
        color: #fff;
        transform: scale(1.1);
    }
`;
