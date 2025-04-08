import { InputHTMLAttributes, ReactNode, ChangeEvent, useRef, useState } from 'react';

import {
    Wrapper,
    IconWrapper,
    ContentWrapper,
    StyledInput,
    Label,
    AccentWrapper,
    CheckIconWrapper,
} from './TxInput.style.ts';
import CheckIcon from './CheckIcon.tsx';
import { AnimatePresence } from 'motion/react';

type TxInputBase = Omit<InputHTMLAttributes<HTMLInputElement>, 'name'>;
export interface TxInputProps extends TxInputBase {
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    name: string;
    placeholder: string;
    icon?: ReactNode;
    accent?: ReactNode;
    label?: string;
    errorMessage?: string;
    autoFocus?: boolean;
    truncateOnBlur?: boolean;
    truncateText?: string;
    isValid?: boolean;
}

export function TxInput({
    value,
    onChange,
    onBlur,
    name,
    placeholder,
    icon,
    accent,
    label,
    errorMessage,
    autoFocus,
    truncateOnBlur,
    truncateText,
    isValid,
    ...rest
}: TxInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const ref = useRef<HTMLInputElement | null>(null);

    const handleFocus = () => {
        setIsFocused(true);
        ref.current?.focus();
    };

    const handleBlur = () => {
        setIsFocused(false);
        onBlur();
    };

    const displayValue =
        !isFocused && truncateOnBlur && truncateText
            ? truncateText.length > 15
                ? `${truncateText.substring(0, 7)}...${truncateText.substring(truncateText.length - 7)}`
                : truncateText
            : value;

    return (
        <Wrapper key={name} onClick={handleFocus} $hasError={!!errorMessage}>
            {accent && <AccentWrapper>{accent}</AccentWrapper>}
            {label && <Label>{label}</Label>}
            <ContentWrapper>
                {icon ? <IconWrapper>{icon}</IconWrapper> : null}
                <StyledInput
                    as="input"
                    ref={ref}
                    id={name}
                    name={name}
                    type="text"
                    value={displayValue}
                    onChange={onChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    $hasIcon={!!icon}
                    {...rest}
                    aria-errormessage={errorMessage}
                />
                <AnimatePresence>
                    {isValid && (
                        <CheckIconWrapper
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                        >
                            <CheckIcon />
                        </CheckIconWrapper>
                    )}
                </AnimatePresence>
            </ContentWrapper>
        </Wrapper>
    );
}
