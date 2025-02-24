const { checkBadWords, addBadWords,removeBadWords,getBadWords } = require("@sit-sandbox/thai-bad-words");
const BadWordModel = require("../models/badword");

async function loadBadWordsFromDB() {
    try {
        const badwordGroups = await BadWordModel.find();
        const allBadWords = badwordGroups.flatMap(group => group.words);
        const currentBadWords = getBadWords();
        removeBadWords(currentBadWords);  
        addBadWords(allBadWords);
        console.log("✅ Loaded bad words from database");
    } catch (error) {
        console.error("❌ Error loading bad words from DB:", error);
    }
}

loadBadWordsFromDB();

async function BadWordScanner(input) {
    for (const key in input) {
        if (input.hasOwnProperty(key)) {
            const value = input[key];

            if (typeof value === "object" && value !== null) {
                if (Array.isArray(value)) {
                    for (const item of value) {
                        if (typeof item === "string") {
                            checkBadWords(item);
                        } else if (typeof item === "object" && item !== null) {
                            await BadWordScanner(item);
                        }
                    }
                } else {
                    await BadWordScanner(value);
                }
            } else if (typeof value === "string") {
                checkBadWords(value);
            }
        }
    }
}

module.exports = BadWordScanner;
module.exports.loadBadWordsFromDB = loadBadWordsFromDB;
