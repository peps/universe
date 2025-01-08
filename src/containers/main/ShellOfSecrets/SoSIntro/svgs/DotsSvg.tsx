import React from 'react';

interface DotsSvgProps {
    style?: React.CSSProperties;
}

const DotsSvg: React.FC<DotsSvgProps> = ({ style }) => (
    <svg style={style} xmlns="http://www.w3.org/2000/svg" width="43" height="8" viewBox="0 0 43 8" fill="none">
        <circle cx="41.7826" cy="6.47595" r="0.5885" transform="rotate(180 41.7826 6.47595)" fill="#89BC97" />
        <circle cx="18.2396" cy="6.47595" r="0.5885" transform="rotate(180 18.2396 6.47595)" fill="#89BC97" />
        <circle cx="30.0131" cy="6.47595" r="0.5885" transform="rotate(180 30.0131 6.47595)" fill="#89BC97" />
        <circle cx="6.47009" cy="6.47595" r="0.5885" transform="rotate(180 6.47009 6.47595)" fill="#89BC97" />
        <circle cx="41.7826" cy="0.589234" r="0.5885" transform="rotate(180 41.7826 0.589234)" fill="#89BC97" />
        <circle cx="18.2396" cy="0.589234" r="0.5885" transform="rotate(180 18.2396 0.589234)" fill="#89BC97" />
        <circle cx="30.0131" cy="0.591188" r="0.5885" transform="rotate(180 30.0131 0.591188)" fill="#89BC97" />
        <circle cx="6.47009" cy="0.591188" r="0.5885" transform="rotate(180 6.47009 0.591188)" fill="#89BC97" />
        <circle cx="35.8998" cy="6.47595" r="0.5885" transform="rotate(180 35.8998 6.47595)" fill="#89BC97" />
        <circle cx="12.3568" cy="6.47595" r="0.5885" transform="rotate(180 12.3568 6.47595)" fill="#89BC97" />
        <circle cx="24.1263" cy="6.47595" r="0.5885" transform="rotate(180 24.1263 6.47595)" fill="#89BC97" />
        <circle cx="0.587281" cy="6.47595" r="0.5885" transform="rotate(180 0.587281 6.47595)" fill="#89BC97" />
        <circle cx="35.8959" cy="0.591188" r="0.5885" transform="rotate(180 35.8959 0.591188)" fill="#89BC97" />
        <circle cx="12.3568" cy="0.589234" r="0.5885" transform="rotate(180 12.3568 0.589234)" fill="#89BC97" />
        <circle cx="24.1263" cy="0.589234" r="0.5885" transform="rotate(180 24.1263 0.589234)" fill="#89BC97" />
        <circle cx="0.587281" cy="0.591188" r="0.5885" transform="rotate(180 0.587281 0.591188)" fill="#89BC97" />
    </svg>
);

export default DotsSvg;
