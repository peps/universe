import { m } from 'framer-motion';
import styled from 'styled-components';

export const Wrapper = styled('div')`
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 99999;

    display: flex;
    justify-content: center;
    align-items: center;

    pointer-events: all;

    overflow: hidden;
    overflow-y: auto;

    padding: 140px 40px;
`;

export const Cover = styled(m.div)`
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 0;
    cursor: pointer;

    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(6px);
`;

export const BoxWrapper = styled(m.div)`
    width: 100%;
    max-width: 491px;

    flex-shrink: 0;

    border-radius: 15px;
    border: 1px solid #484848;
    background: radial-gradient(50% 50% at 50% 50%, rgba(26, 32, 44, 0) 0%, #181f2d 100%), #0d0b07;

    position: relative;
    z-index: 1;
`;

export const InsideWrapper = styled('div')`
    width: 100%;
    position: relative;

    display: flex;
    flex-direction: column;
    align-items: center;

    gap: 20px;

    padding: 30px;
    padding-top: 40px;

    border-radius: 15px;
    overflow: hidden;
`;

export const SoonImageWrapper = styled(m.div)`
    width: 100%;
    max-width: 282px;
    position: absolute;

    transform-origin: center center;
`;

export const SoonImg = styled('img')`
    width: 100%;
`;

export const SoonImgBlur = styled('img')`
    width: 100%;
    filter: blur(30px);
    z-index: 0;
    opacity: 0.5;

    position: absolute;
    top: 0;
`;

export const JewelImage = styled('img')`
    position: absolute;
    left: 50%;
    bottom: 100%;
    transform: translateX(-50%);
    z-index: 3;
    margin-bottom: -25px;
`;

export const GateImage = styled('img')`
    position: absolute;
    left: 50%;
    bottom: 100%;
    transform: translateX(-50%) rotate(90deg);
    z-index: 2;
    margin-bottom: -77px;
`;

export const ContentWrapper = styled(m.div)`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    position: relative;
    z-index: 2;
`;

export const TextWrapper = styled('div')`
    display: flex;
    flex-direction: column;
    padding-left: 98px;
`;

export const Title = styled('div')`
    color: #e6ff47;
    font-family: 'IBM Plex Mono', sans-serif;
    font-size: 33px;
    font-weight: 700;
    line-height: 129.623%;
    text-transform: uppercase;
`;

export const Text = styled('div')`
    color: #e6ff47;
    font-family: 'IBM Plex Mono', sans-serif;
    font-size: 13px;
    font-weight: 700;
    line-height: 129.623%;
`;

export const ButtonWrapper = styled('div')`
    position: relative;
    width: 100%;
    margin-bottom: 10px;
`;

export const Button = styled('button')`
    background: #e6ff47;
    width: 100%;
    height: 47px;

    display: flex;
    align-items: center;
    justify-content: center;

    color: #000;
    font-size: 22px;
    font-weight: 700;
    text-transform: uppercase;
    font-family: 'IBM Plex Mono', sans-serif;

    span {
        display: inline-block;
        transition: transform 0.3s ease;
    }

    &:hover {
        span {
            transform: scale(1.05);
        }
    }
`;
