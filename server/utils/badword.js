const { checkBadWords, addBadWords } = require("@sit-sandbox/thai-bad-words");

addBadWords(['พ่อมึงตาย', 'แม่มึงตาย', 'ไอสันดาน', 'ไอสันขวาน', 'เอ๋อ', 'fuck']);

async function BadWordScanner(input) {
    for (const key in input) {
        if (input.hasOwnProperty(key)) {
            const value = input[key];

            if (typeof value === 'object' && value !== null) {
                if (Array.isArray(value)) {
                    for (const item of value) {
                        if (typeof item === 'string') {
                            checkBadWords(item);
                        } else if (typeof item === 'object' && item !== null) {
                            await BadWordScanner(item);
                        }
                    }
                } else {
                    await BadWordScanner(value);
                }
            } else if (typeof value === 'string') {
                checkBadWords(value);
            }
        }
    }
}

module.exports = BadWordScanner;
