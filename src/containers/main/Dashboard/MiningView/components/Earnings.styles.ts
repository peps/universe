import * as m from 'motion/react-m';
import styled from 'styled-components';
export const EarningsContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
`;

export const RecapText = styled.div`
    display: flex;
    font-family: DrukWide, sans-serif;
    font-weight: 800;
    font-size: 22px;
    text-transform: uppercase;
    text-align: center;
    letter-spacing: -0.3px;
    span {
        background: #c2d41a;
        display: flex;
        margin-right: 3px;
        padding: 0 3px;
    }
    @media (max-width: 1200px) {
        font-size: 16px;
    }
`;

export const WinText = styled.div`
    text-transform: uppercase;
    display: flex;
    font-family: DrukWide, sans-serif;
    font-weight: 800;
    font-size: 14px;
    letter-spacing: -0.1px;
    white-space: pre;
    @media (max-width: 1200px) {
        font-size: 12px;
    }
`;
export const WinWrapper = styled.div`
    align-items: center;
    display: flex;
    flex-direction: row;
`;
export const AmtWrapper = styled.div`
    font-size: 70px;
    line-height: 1;
    display: flex;
    letter-spacing: 1px;
    font-family: DrukWide, sans-serif;
    font-weight: 900;
    padding: 0 5px 0 10px;
    text-transform: lowercase;
    @media (max-width: 1200px) {
        font-size: 60px;
    }
`;

export const EarningsWrapper = styled(m.div)`
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: flex-end;
    position: relative;
`;
