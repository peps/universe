/* eslint-disable i18next/no-literal-string */
import { AddNewButton, PlaceholderText, ScrollArea, Wrapper } from './styles.ts';

import { useAnimationFrame } from 'framer-motion';

import data from './data.ts';
import { useEffect, useState, useRef } from 'react';
import Member from '../Member/Member';
import PlusIcon from '../../icons/PlusIcon.tsx';

interface Member {
    image: string;
    isNew: boolean;
    isOnline: boolean;
    miningRate: number;
    id: string;
    name: string;
}

export default function CrewList() {
    const [members, setMembers] = useState<Member[]>([]);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [scrollDirection, setScrollDirection] = useState<number>(0);
    const [scrollSpeed, setScrollSpeed] = useState<number>(0);

    useEffect(() => {
        setMembers(data.members);
    }, []);

    const handleMouseMove = (event: React.MouseEvent) => {
        const { clientX, currentTarget } = event;
        const { left, right } = currentTarget.getBoundingClientRect();
        const edgeThreshold = 200;
        const fastScrollThreshold = 100;

        if (clientX < left + fastScrollThreshold) {
            setScrollDirection(-1);
            setScrollSpeed(4);
        } else if (clientX < left + edgeThreshold) {
            setScrollDirection(-1);
            setScrollSpeed(2);
        } else if (clientX > right - fastScrollThreshold) {
            setScrollDirection(1);
            setScrollSpeed(4);
        } else if (clientX > right - edgeThreshold) {
            setScrollDirection(1);
            setScrollSpeed(2);
        } else {
            setScrollDirection(0);
            setScrollSpeed(0);
        }
    };

    const handleMouseLeave = () => {
        setScrollDirection(0);
        setScrollSpeed(0);
    };

    useAnimationFrame(() => {
        const scrollArea = scrollAreaRef.current;
        if (scrollArea && scrollDirection !== 0) {
            const maxScrollLeft = scrollArea.scrollWidth - scrollArea.clientWidth;
            const newScrollLeft = scrollArea.scrollLeft + scrollDirection * scrollSpeed;
            scrollArea.scrollLeft = Math.max(0, Math.min(newScrollLeft, maxScrollLeft));
        }
    });

    return (
        <Wrapper $noMembers={members.length === 0}>
            {members.length !== 0 && (
                <ScrollArea ref={scrollAreaRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                    {members.map((member) => (
                        <Member key={member.id} member={member} />
                    ))}
                </ScrollArea>
            )}

            <AddNewButton $noMembers={members.length === 0}>
                <PlusIcon />
            </AddNewButton>

            {members.length === 0 && <PlaceholderText>Invite your first crew member</PlaceholderText>}
        </Wrapper>
    );
}
