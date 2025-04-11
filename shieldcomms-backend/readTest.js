const fs = require('fs');
const path = require('path');

const tokenizerPath = path.join(__dirname, 'tokenizer.json');

try {
    const tokenizerData = fs.readFileSync(tokenizerPath, { encoding: 'utf-8' });
    console.log('📄 Raw Tokenizer Data:', tokenizerData);

    const parsedTokenizer = JSON.parse(tokenizerData.trim());
    console.log('✅ Tokenizer parsed successfully.');
} catch (error) {
    console.error('❌ Error reading or parsing tokenizer:', error.message);
}
