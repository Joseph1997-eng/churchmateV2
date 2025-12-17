import { BibleBook, BibleVerse } from '../types';

interface ParsedBibleData {
    books: BibleBook[];
    verses: BibleVerse[];
}

/**
 * Parse Hakha Bible XML file
 * Expected structure: <bible><b n="BookName"><c n="1"><v n="1">Text</v>...</c>...</b>...</bible>
 */
export async function parseXMLBible(xmlContent: string): Promise<ParsedBibleData> {
    const books: BibleBook[] = [];
    const verses: BibleVerse[] = [];

    try {
        // Simple XML parsing using DOMParser (available in React Native)
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

        const bookElements = xmlDoc.getElementsByTagName('b');

        for (let i = 0; i < bookElements.length; i++) {
            const bookElement = bookElements[i];
            const bookName = bookElement.getAttribute('n') || `Book ${i + 1}`;
            const bookId = i + 1;

            const chapterElements = bookElement.getElementsByTagName('c');
            const totalChapters = chapterElements.length;

            // Add book
            books.push({
                id: bookId,
                name: bookName,
                chapters: totalChapters,
            });

            // Parse chapters and verses
            for (let j = 0; j < chapterElements.length; j++) {
                const chapterElement = chapterElements[j];
                const chapterNum = parseInt(chapterElement.getAttribute('n') || `${j + 1}`);

                const verseElements = chapterElement.getElementsByTagName('v');

                for (let k = 0; k < verseElements.length; k++) {
                    const verseElement = verseElements[k];
                    const verseNum = parseInt(verseElement.getAttribute('n') || `${k + 1}`);
                    const verseText = verseElement.textContent || '';

                    verses.push({
                        id: verses.length + 1,
                        bookId,
                        bookName,
                        chapter: chapterNum,
                        verse: verseNum,
                        text: verseText.trim(),
                    });
                }
            }
        }

        console.log(`Parsed ${books.length} books and ${verses.length} verses`);
        return { books, verses };

    } catch (error) {
        console.error('Error parsing XML:', error);
        throw new Error('Failed to parse Bible XML file');
    }
}

/**
 * Alternative parser using regex for simpler XML structures
 */
export function parseXMLBibleSimple(xmlContent: string): ParsedBibleData {
    const books: BibleBook[] = [];
    const verses: BibleVerse[] = [];

    // This is a fallback parser - adjust regex based on actual XML structure
    const bookRegex = /<b[^>]*n="([^"]+)"[^>]*>([\s\S]*?)<\/b>/g;
    const chapterRegex = /<c[^>]*n="(\d+)"[^>]*>([\s\S]*?)<\/c>/g;
    const verseRegex = /<v[^>]*n="(\d+)"[^>]*>([\s\S]*?)<\/v>/g;

    let bookMatch;
    let bookId = 0;

    while ((bookMatch = bookRegex.exec(xmlContent)) !== null) {
        bookId++;
        const bookName = bookMatch[1];
        const bookContent = bookMatch[2];

        let chapterCount = 0;
        let chapterMatch;

        while ((chapterMatch = chapterRegex.exec(bookContent)) !== null) {
            chapterCount++;
            const chapterNum = parseInt(chapterMatch[1]);
            const chapterContent = chapterMatch[2];

            let verseMatch;
            while ((verseMatch = verseRegex.exec(chapterContent)) !== null) {
                const verseNum = parseInt(verseMatch[1]);
                const verseText = verseMatch[2].trim();

                verses.push({
                    id: verses.length + 1,
                    bookId,
                    bookName,
                    chapter: chapterNum,
                    verse: verseNum,
                    text: verseText,
                });
            }
        }

        books.push({
            id: bookId,
            name: bookName,
            chapters: chapterCount,
        });
    }

    return { books, verses };
}
