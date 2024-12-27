import { m } from 'framer-motion';
import styled, { css, keyframes } from 'styled-components';

export const Wrapper = styled(m.div)`
    position: fixed;
    top: 47px;
    right: 40px;
    z-index: 4;

    width: 311px;

    border-radius: 19.438px;
    background: linear-gradient(180deg, #c9eb00 32.79%, #fff 69.42%);
    box-shadow: 15.55px 15.55px 42.763px 0px rgba(0, 0, 0, 0.1);

    padding: 10px;

    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const float = keyframes`
  0% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-5px) rotate(2.5deg);
  }
  100% {
    transform: translateY(0) rotate(0deg);
  }
`;

export const Gem1 = styled('img')`
    position: absolute;
    top: 0;
    left: -20px;
    animation: ${float} 3s ease-in-out infinite;
    width: 121px;
    rotate: -40deg;
`;

export const Gem2 = styled('img')`
    position: absolute;
    top: 25px;
    right: 40px;

    width: 42px;
    rotate: 10deg;
    animation: ${float} 3.2s ease-in-out infinite;
`;

export const Gem3 = styled('img')`
    position: absolute;
    bottom: -10px;
    right: -14px;
    width: 80px;
    rotate: 5deg;
    animation: ${float} 3.8s ease-in-out infinite;
`;

export const Avatar = styled('div')<{ $image: string }>`
    width: 88px;
    height: 88px;
    border-radius: 100%;

    position: absolute;
    top: 60px;
    left: 50%;
    transform: translateX(-50%);

    ${({ $image }) => css`
        background-image: url(${$image});
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        background-color: rgba(0, 0, 0, 0.2);
    `}
`;

export const TextWrapper = styled('div')`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;

    padding-top: 112px;
`;

export const CopyWrapper = styled('button')<{ $copied: boolean }>`
    position: relative;
    border-radius: 100px;
    background: #000;
    box-shadow: 15.517px 15.517px 42.672px 0px rgba(0, 0, 0, 0.1);
    padding: 8px 8px 8px 20px;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;

    transition: transform 0.2s ease;
    overflow: hidden;

    &:hover {
        transform: scale(1.025);
    }

    ${({ $copied }) =>
        $copied &&
        css`
            background: #c9eb00;
        `}
`;

export const CopyText = styled('div')`
    color: #c9eb00;
    font-size: 13px;
    font-weight: 600;
    line-height: 99.7%;

    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`;

export const CopyButton = styled('div')`
    border-radius: 100px;
    background: #fff;
    width: 77px;
    height: 28px;
    flex-shrink: 0;

    color: #000;
    font-size: 13px;
    font-weight: 600;
    line-height: 99.7%;

    display: flex;
    align-items: center;
    justify-content: center;
`;

export const Copied = styled(m.div)`
    position: absolute;
    inset: 0;
    background-color: #c9eb00;
    color: #000;

    font-size: 13px;
    font-weight: 600;
    line-height: 99.7%;

    display: flex;
    align-items: center;
    justify-content: center;
`;