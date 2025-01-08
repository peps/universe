import { useCallback } from 'react';
import {
    Wrapper,
    Cover,
    BoxWrapper,
    SoonImg,
    SoonImageWrapper,
    SoonImgBlur,
    ContentWrapper,
    SoonImgPlaceholder,
    JewelImage,
    GateImage,
} from './styles';
import { useShellOfSecretsStore } from '@app/store/useShellOfSecretsStore';

import Scanlines from '../components/Scanlines/Scanlines';
import BottomSvg from './svgs/BottomSvg';
import GlitchEffect from '../components/GlitchEffect/GlitchEffect';
import CRTEffect from '../components/CRTEffect/CRTEffect';

import jewelImage from '../SoSWidget/images/jewel.png';
import gateImage from '../SoSWidget/images/gate.png';
import soooonnnnxcv1 from './images/soooonnnnxcv1.png';

export default function SoSIntro() {
    const { setShowIntro } = useShellOfSecretsStore();

    const onClose = useCallback(() => {
        setShowIntro(false);
    }, [setShowIntro]);

    return (
        <Wrapper>
            <BoxWrapper initial={{ opacity: 0, y: '100px' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <JewelImage src={jewelImage} alt="" />
                <GateImage src={gateImage} alt="" />

                <ContentWrapper>
                    <SoonImageWrapper>
                        <CRTEffect>
                            <GlitchEffect>
                                <SoonImg src={soooonnnnxcv1} alt="" />
                            </GlitchEffect>
                            <SoonImgBlur src={soooonnnnxcv1} alt="" />
                        </CRTEffect>

                        <SoonImgPlaceholder src={soooonnnnxcv1} alt="" />
                    </SoonImageWrapper>

                    <BottomSvg />
                    <Scanlines />
                </ContentWrapper>
            </BoxWrapper>

            <Cover onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
        </Wrapper>
    );
}
