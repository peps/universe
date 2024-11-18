import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { IconImage, MarkdownWrapper, Text, TextWrapper, Title, VersionWrapper, Wrapper } from './styles';
import { AccordionItem } from './AccordionItem/AccordionItem';
import tariIcon from './tari-icon.png';
import packageInfo from '../../../../../../package.json';
import { useTranslation } from 'react-i18next';

const appVersion = packageInfo.version;
const versionString = `v${appVersion}`;

const parseMarkdownSections = (markdown: string): ReleaseSection[] => {
    const sections = markdown.split(/\n---\n/);

    return sections.map((block) => {
        const lines = block.trim().split('\n');
        const title = lines[0].replace(/^#+\s*/, '').trim();

        const dateLine = lines.find((line, index) => index > 0 && line.trim().match(/^_.*_$/));
        const date = dateLine?.replace(/^_|_$/g, '').trim() || '';

        const contentStartIndex = lines.findIndex((line) => line === dateLine) + 1;
        const content = lines.slice(contentStartIndex).join('\n').trim();

        return { title, date, content };
    });
};

interface ReleaseSection {
    title: string;
    date: string;
    content: string;
}

export const ReleaseNotes = () => {
    const [sections, setSections] = useState<ReleaseSection[]>([]);
    const [openSectionIndex, setOpenSectionIndex] = useState<number | null>(0);

    const { t } = useTranslation(['common', 'settings'], { useSuspense: false });

    useEffect(() => {
        const loadReleaseNotes = async () => {
            try {
                const response = await fetch('/ReleaseNotes.md');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const text = await response.text();
                setSections(parseMarkdownSections(text));
            } catch (err) {
                console.error('Error loading release notes:', err);
            }
        };

        loadReleaseNotes();
    }, []);

    const toggleSection = (index: number) => {
        setOpenSectionIndex(openSectionIndex === index ? null : index);
    };

    return (
        <Wrapper>
            <VersionWrapper>
                <IconImage src={tariIcon} alt="Tari Icon" />
                <TextWrapper>
                    <Title>{t('settings:tabs.releaseNotes')}</Title>
                    <Text>
                        {t('tari-universe')} - {t('testnet')} {versionString}
                    </Text>
                </TextWrapper>
            </VersionWrapper>

            <MarkdownWrapper>
                {sections.map((section, index) => (
                    <AccordionItem
                        key={index}
                        title={section.title}
                        subtitle={section.date}
                        content={<ReactMarkdown>{section.content}</ReactMarkdown>}
                        isOpen={openSectionIndex === index}
                        onToggle={() => toggleSection(index)}
                    />
                ))}
            </MarkdownWrapper>
        </Wrapper>
    );
};
