import styled, { css } from 'styled-components';

export const Wrapper = styled.div<{ $customStyles?: string }>`
    position: relative;
    width: 100%;
    height: 100%;
    z-index: 1;
    ${({ $customStyles }) => $customStyles};
`;

export const Layer = styled.div<{
    $isColorChannel?: boolean;
    $offset?: number;
    $glitchOpacity?: number;
    $hueRotate?: number;
}>`
    position: absolute;
    width: 100%;
    height: 100%;
    ${({ $isColorChannel, $offset, $glitchOpacity }) =>
        $isColorChannel &&
        css`
            mix-blend-mode: overlay;
            transform: translate(${$offset ?? 0}px, ${($offset ?? 0) * 0.5}px);
            opacity: ${$glitchOpacity};
        `}
`;
