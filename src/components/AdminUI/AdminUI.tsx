/* eslint-disable i18next/no-literal-string */
import { MenuWrapper, MenuContent, ToggleButton } from './styles';
import { useFloating, offset, shift, flip, useClick, useInteractions, useDismiss } from '@floating-ui/react';
import { useState } from 'react';
import { ThemeGroup } from './groups/ThemeGroup';
import { DialogsGroup } from './groups/DialogsGroup';
import { GreenModalsGroup } from './groups/GreenModalsGroup';
import { ToastsGroup } from './groups/ToastsGroup';
import { OtherUIGroup } from './groups/OtherUIGroup';

export default function AdminUI() {
    const [isOpen, setIsOpen] = useState(false);

    const { refs, floatingStyles, context } = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
        middleware: [offset(10), flip(), shift()],
        placement: 'bottom-end',
    });

    const click = useClick(context);
    const dismiss = useDismiss(context);
    const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

    return (
        <>
            <ToggleButton ref={refs.setReference} {...getReferenceProps()}>
                UI Debug
            </ToggleButton>
            {isOpen && (
                <MenuWrapper ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()}>
                    <MenuContent>
                        <ThemeGroup />
                        <DialogsGroup />
                        <GreenModalsGroup />
                        <ToastsGroup />
                        <OtherUIGroup />
                    </MenuContent>
                </MenuWrapper>
            )}
        </>
    );
}
