import { AnimatePresence } from 'motion/react';
import { Menu, Text, Title, Trigger, Wrapper } from './styles';
import { ReactNode, useState } from 'react';
import { autoUpdate, offset, safePolygon, shift, useFloating, useHover, useInteractions } from '@floating-ui/react';

interface Props {
    trigger: ReactNode;
    title: string | ReactNode;
    text: string | ReactNode;
}

export default function SyncTooltip({ trigger, title, text }: Props) {
    const [expanded, setExpanded] = useState(false);

    const { refs, context, floatingStyles } = useFloating({
        open: expanded,
        onOpenChange: setExpanded,
        placement: 'top',
        strategy: 'fixed',
        middleware: [offset(5), shift()],
        whileElementsMounted(referenceEl, floatingEl, update) {
            return autoUpdate(referenceEl, floatingEl, update, {
                layoutShift: false,
            });
        },
    });

    const hover = useHover(context, {
        move: !expanded,
        handleClose: safePolygon(),
    });

    const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

    return (
        <Wrapper>
            <Trigger ref={refs.setReference} {...getReferenceProps()}>
                {trigger}
            </Trigger>

            <AnimatePresence mode="sync">
                {expanded && (
                    <Menu
                        ref={refs.setFloating}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={floatingStyles}
                        {...getFloatingProps()}
                    >
                        <Title>{title}</Title>
                        <Text>{text}</Text>
                    </Menu>
                )}
            </AnimatePresence>
        </Wrapper>
    );
}
