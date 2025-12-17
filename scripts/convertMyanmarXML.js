const fs = require('fs');
const path = require('path');

/**
 * Convert Myanmar Bible XML to Standard Format
 * Myanmar XML doesn't have booknames - using standard 66 Bible books
 */

const inputFile = path.join(__dirname, '../assets/bibles/myanmar.xml');
const outputFile = path.join(__dirname, '../assets/bibles/myanmar_standard.xml');
const backupFile = path.join(__dirname, '../assets/bibles/myanmar_original_backup.xml');

// Standard 66 Bible book names in Myanmar
const bookNames = [
    // Old Testament (39 books)
    'ကမ္ဘာဦး', 'ထွက်မြောက်ရာ', 'ဝတ်ပြုရာ', 'တောလည်ရာ', 'တရားဟောရာ',
    'ယောရှု', 'တရားသူကြီး', 'ရုသ', '၁ ရာမု', '၂ ရာမု',
    '၁ ရာဇဝင်', '၂ ရာဇဝင်', '၁ ရာဇဝင်ချုပ်', '၂ ရာဇဝင်ချုပ်', 'ဧဇရ',
    'နေဟမိ', 'ဧသတာ', 'ယောဘ', 'ဆာလံ', 'သုတ္တံ',
    'ဒေသနာ', 'ရှောလမုန်သီချင်း', 'ဟေရှာယ', 'ယေရမိ', 'ယေရမိမြည်တမ်း',
    'ယေဇကျေလ', 'ဒံယေလ', 'ဟောရှေ', 'ယောလ', 'အာမုတ်',
    'ဩဗဒိ', 'ယောန', 'မိက္ခာ', 'နာဟုံ', 'ဟဗက္ကုတ်',
    'ဇေဖနိ', 'ဟဂ္ဂဲ', 'ဇာခရိ', 'မာလခိ',
    // New Testament (27 books)
    'မဿဲ', 'မာကု', 'လုကာ', 'ယောဟန်', 'တမန်',
    'ရောမ', '၁ ကော', '၂ ကော', 'ဂလာတိ', 'ဧဖက်',
    'ဖိလိပ္ပိ', 'ကောလောသဲ', '၁ သက်', '၂ သက်', '၁ တိမောသေ',
    '၂ တိမောသေ', 'တိတု', 'ဖိလေမုန်', 'ဟေဗြဲ', 'ယာကုပ်',
    '၁ ပေတရု', '၂ ပေတရု', '၁ ယောဟန်', '၂ ယောဟန်', '၃ ယောဟန်',
    'ယုဒ', 'ဗျာဒိတ်'
];

console.log('Starting Myanmar Bible XML conversion...\n');

// Read the XML file
let xmlContent = fs.readFileSync(inputFile, 'utf8');

// Backup original file
fs.writeFileSync(backupFile, xmlContent);
console.log('✓ Original file backed up');
console.log(`✓ Using ${bookNames.length} standard Bible book names\n`);

// Process each book
let bookIndex = 0;
let totalChapters = 0;
let totalVerses = 0;

xmlContent = xmlContent.replace(/<b>([\s\S]*?)<\/b>/g, (match, bookContent) => {
    if (bookIndex >= bookNames.length) {
        console.warn(`Warning: More books than expected (${bookIndex + 1})`);
        return match; // Keep original if out of range
    }

    const bookName = bookNames[bookIndex];
    console.log(`Processing ${bookIndex + 1}/66: ${bookName}`);

    // Add chapter numbers
    let chapterNum = 0;
    let processedBook = bookContent.replace(/<c>/g, () => {
        chapterNum++;
        totalChapters++;
        return `<c n="${chapterNum}">`;
    });

    // Process verses in each chapter
    processedBook = processedBook.replace(/<c n="(\d+)">([\s\S]*?)<\/c>/g, (chapterMatch, chNum, chapterContent) => {
        let verseNum = 0;

        // Add verse numbers and remove CDATA
        const processedChapter = chapterContent.replace(/<v>([\s\S]*?)<\/v>/g, (verseMatch, verseContent) => {
            verseNum++;
            totalVerses++;

            // Extract text from CDATA if present
            let verseText = verseContent;
            const cdataMatch = verseContent.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
            if (cdataMatch) {
                verseText = cdataMatch[1];
            }

            // Clean up whitespace
            verseText = verseText.trim();

            return `<v n="${verseNum}">${verseText}</v>`;
        });

        return `<c n="${chNum}">${processedChapter}</c>`;
    });

    bookIndex++;
    return `<b n="${bookName}">${processedBook}</b>`;
});

// Write the converted file
fs.writeFileSync(outputFile, xmlContent);

// Get file sizes
const originalSize = fs.statSync(inputFile).size;
const convertedSize = fs.statSync(outputFile).size;

console.log('\n=== Conversion Complete ===');
console.log(`Books processed: ${bookIndex}/66`);
console.log(`Total chapters: ${totalChapters}`);
console.log(`Total verses: ${totalVerses}`);
console.log(`Original size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`Converted size: ${(convertedSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`\n✓ Converted file: assets/bibles/myanmar_standard.xml`);
console.log(`✓ Backup file: assets/bibles/myanmar_original_backup.xml`);
console.log('\nNext steps:');
console.log('1. Verify myanmar_standard.xml');
console.log('2. Replace: move-item myanmar_standard.xml myanmar.xml -Force');
console.log('3. Clean up: remove-item myanmar_original_backup.xml');
