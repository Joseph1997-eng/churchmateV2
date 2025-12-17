/**
 * Bible XML Parser Script
 * 
 * This script parses the Hakha Bible XML file and outputs JSON data
 * that can be used to seed the SQLite database.
 * 
 * Usage:
 *   node scripts/parseBible.js path/to/Hakha_Bible_(HCL).xml
 */

const fs = require('fs');
const path = require('path');

// Simple XML parser function
function parseXML(xmlContent) {
    const books = [];
    const verses = [];

    // Extract books using regex
    const bookRegex = /<b[^>]*n="([^"]+)"[^>]*>([\s\S]*?)<\/b>/g;
    let bookMatch;
    let bookId = 0;

    while ((bookMatch = bookRegex.exec(xmlContent)) !== null) {
        bookId++;
        const bookName = bookMatch[1];
        const bookContent = bookMatch[2];

        // Extract chapters
        const chapterRegex = /<c[^>]*n="(\d+)"[^>]*>([\s\S]*?)<\/c>/g;
        let chapterMatch;
        let chapterCount = 0;

        while ((chapterMatch = chapterRegex.exec(bookContent)) !== null) {
            chapterCount++;
            const chapterNum = parseInt(chapterMatch[1]);
            const chapterContent = chapterMatch[2];

            // Extract verses
            const verseRegex = /<v[^>]*n="(\d+)"[^>]*>([\s\S]*?)<\/v>/g;
            let verseMatch;

            while ((verseMatch = verseRegex.exec(chapterContent)) !== null) {
                const verseNum = parseInt(verseMatch[1]);
                const verseText = verseMatch[2]
                    .replace(/<[^>]+>/g, '') // Remove any HTML tags
                    .trim();

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

// Main execution
function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.error('Usage: node parseBible.js <path-to-xml-file>');
        console.error('Example: node parseBible.js ../Hakha_Bible_(HCL).xml');
        process.exit(1);
    }

    const xmlFilePath = args[0];

    if (!fs.existsSync(xmlFilePath)) {
        console.error(`Error: File not found: ${xmlFilePath}`);
        process.exit(1);
    }

    console.log('Reading XML file...');
    const xmlContent = fs.readFileSync(xmlFilePath, 'utf-8');

    console.log('Parsing XML...');
    const { books, verses } = parseXML(xmlContent);

    console.log(`\nParsing complete!`);
    console.log(`- Books: ${books.length}`);
    console.log(`- Verses: ${verses.length}`);

    // Save to JSON files
    const outputDir = path.join(__dirname, '../bible-data');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const booksPath = path.join(outputDir, 'books.json');
    const versesPath = path.join(outputDir, 'verses.json');

    fs.writeFileSync(booksPath, JSON.stringify(books, null, 2));
    fs.writeFileSync(versesPath, JSON.stringify(verses, null, 2));

    console.log(`\nData saved to:`);
    console.log(`- ${booksPath}`);
    console.log(`- ${versesPath}`);
    console.log(`\nYou can now import this data in your app!`);
}

main();
