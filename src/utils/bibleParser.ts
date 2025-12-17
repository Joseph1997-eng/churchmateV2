import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';
import { BibleBook, BibleVerse } from '../types';

interface ParsedBible {
    books: BibleBook[];
    verses: BibleVerse[];
}

/**
 * Parse Bible XML files (Standard format)
 * Both Myanmar and Hakha now use: <b n="BookName"><c n="1"><v n="1">text</v></c></b>
 */
export async function parseBibleXML(language: 'myanmar' | 'hakha'): Promise<ParsedBible> {
    try {
        console.log(`Starting ${language} Bible XML parsing...`);

        // Load XML file from assets
        const asset = Asset.fromModule(
            language === 'myanmar'
                ? require('../../assets/bibles/myanmar.xml')
                : require('../../assets/bibles/hakha.xml')
        );

        await asset.downloadAsync();

        if (!asset.localUri) {
            throw new Error(`Failed to load ${language} Bible XML`);
        }

        const xmlContent = await FileSystem.readAsStringAsync(asset.localUri);

        const books: BibleBook[] = [];
        const verses: BibleVerse[] = [];
        let bookId = language === 'myanmar' ? 1000 : 2000; // Different ID ranges

        // Parse books - both formats now use n="BookName"
        const bookMatches = xmlContent.matchAll(/<b n="([^"]+)">([\s\S]*?)<\/b>/g);

        for (const bookMatch of bookMatches) {
            const bookName = bookMatch[1];
            const bookContent = bookMatch[2];

            // Count chapters
            const chapterMatches = [...bookContent.matchAll(/<c n="(\d+)">/g)];
            const chapterCount = chapterMatches.length;

            books.push({
                id: bookId,
                name: bookName,
                chapters: chapterCount,
            });

            // Parse chapters and verses
            const chapterBlocks = bookContent.matchAll(/<c n="(\d+)">([\s\S]*?)<\/c>/g);

            for (const chapterBlock of chapterBlocks) {
                const chapterNum = parseInt(chapterBlock[1]);
                const chapterContent = chapterBlock[2];

                // Parse verses
                const verseMatches = chapterContent.matchAll(/<v n="(\d+)">([^<]+)<\/v>/g);

                for (const verseMatch of verseMatches) {
                    const verseNum = parseInt(verseMatch[1]);
                    const verseText = verseMatch[2]
                        .replace(/&quot;/g, '"')
                        .replace(/&amp;/g, '&')
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .trim();

                    verses.push({
                        id: 0, // Will be auto-generated
                        bookId,
                        bookName,
                        chapter: chapterNum,
                        verse: verseNum,
                        text: verseText,
                    });
                }
            }

            bookId++;
        }

        console.log(`${language} Bible parsed: ${books.length} books, ${verses.length} verses`);

        return { books, verses };
    } catch (error) {
        console.error(`Error parsing ${language} Bible XML:`, error);
        throw error;
    }
}

/**
 * Parse both Myanmar and Hakha Bibles
 */
export async function parseAllBibles(): Promise<{
    myanmar: ParsedBible;
    hakha: ParsedBible;
}> {
    console.log('Parsing all Bible translations...');

    const [myanmar, hakha] = await Promise.all([
        parseBibleXML('myanmar'),
        parseBibleXML('hakha'),
    ]);

    return { myanmar, hakha };
}
