/* eslint-disable i18next/no-literal-string */
import { useCallback, useEffect, useState } from 'react';
import {
    Wrapper,
    Cover,
    BoxWrapper,
    SoonImg,
    SoonImageWrapper,
    SoonImgBlur,
    InsideWrapper,
    JewelImage,
    GateImage,
    ContentWrapper,
    Title,
    TextWrapper,
    Text,
    Button,
    ButtonWrapper,
} from './styles';
import { useShellOfSecretsStore } from '@app/store/useShellOfSecretsStore';

import Scanlines from '../components/Scanlines/Scanlines';
import BottomSvg from './svgs/BottomSvg';
import GlitchEffect from '../components/GlitchEffect/GlitchEffect';
import CRTEffect from '../components/CRTEffect/CRTEffect';

import jewelImage from '../SoSWidget/images/jewel.png';
import gateImage from '../SoSWidget/images/gate.png';
import soooonnnnxcv1 from './images/soooonnnnxcv1.png';
import DotsSvg from './svgs/DotsSvg';

const CONTENT_DELAY = 3500;

export default function SoSIntro() {
    const { setShowIntro } = useShellOfSecretsStore();
    const [showContent, setShowContent] = useState(false);

    const onClose = useCallback(() => {
        setShowIntro(false);
    }, [setShowIntro]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowContent(true);
        }, CONTENT_DELAY);

        return () => clearTimeout(timer);
    }, []);

    return (
        <Wrapper>
            <BoxWrapper
                initial={{ opacity: 0, scaleY: 0, scaleX: 0.8 }}
                animate={{ opacity: 1, scaleY: 1, scaleX: 1 }}
                exit={{ opacity: 0, scaleY: 0, scaleX: 0.8 }}
            >
                <JewelImage src={jewelImage} alt="" />
                <GateImage src={gateImage} alt="" />

                <InsideWrapper>
                    <SoonImageWrapper
                        animate={showContent ? { maxWidth: '76px', left: '30px', transform: 'translateX(0)' } : {}}
                    >
                        <CRTEffect>
                            <GlitchEffect>
                                <SoonImg src={soooonnnnxcv1} alt="" />
                            </GlitchEffect>
                            <SoonImgBlur src={soooonnnnxcv1} alt="" />
                        </CRTEffect>
                    </SoonImageWrapper>

                    <ContentWrapper
                        initial={{ opacity: 0 }}
                        animate={showContent ? { opacity: 1 } : {}}
                        exit={{ opacity: 0 }}
                    >
                        <TextWrapper>
                            <Title>HEY ANON!</Title>
                            <Text>
                                <p>This is the Shell of Secrets, the $1M global scavenger hunt! </p>

                                <p>
                                    My name is Soon, and I’m stranded in the year 2032. I can’t explain everything right
                                    now, but I need your help to bring me back to the present. The first person to
                                    rescue me and uncover my secret location will win a $1M prize. No tricks, no
                                    gimmicks—this is real. Are you ready to change history?
                                </p>
                            </Text>
                        </TextWrapper>

                        <ButtonWrapper>
                            <DotsSvg
                                style={{
                                    position: 'absolute',
                                    top: -14,
                                    right: 0,
                                }}
                            />
                            <Button>
                                <span>Got it</span>
                            </Button>
                            <DotsSvg
                                style={{
                                    position: 'absolute',
                                    bottom: -14,
                                    left: 0,
                                }}
                            />
                        </ButtonWrapper>
                    </ContentWrapper>

                    <BottomSvg />
                    <Scanlines />
                </InsideWrapper>
            </BoxWrapper>

            <Cover onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
        </Wrapper>
    );
}
