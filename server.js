const axios = require('axios');
const { exec } = require('child_process');
const { CronJob }  = require('cron');
const wordList = require('./words');
const { convertArrayToString, capitalizeString } = require('./utils');
const fs = require('fs');

const totalWords = wordList.length;
const API_KEY = process.env.WORDNIK_API_KEY;
console.log(`PROCESS PID: ${process.pid}`)

const getUrl = (word) => {
    return `http://api.wordnik.com/v4/word.json/${word}/definitions?limit=3&includeRelated=true&useCanonical=false&includeTags=false&api_key=${API_KEY}`;   
}

// Initialize map after reading from file
let wordMeaningMap = {};
fs.readFile('./wordMeaningMap.js', (err, data) => {
    if (err) {
        console.log("Error occured while initializing map from file", err);
    } else {
        try {
            wordMeaningMap = JSON.parse(data);
        } catch (e) {
            console.log('Error occured while parsing data from file', e);
        }
    }
});

async function getNewMeaning() {
    let word = getRandomWord().toLowerCase();
    let promise;
    if (!!wordMeaningMap[word]) {
        promise = Promise.resolve({ data: wordMeaningMap[word] });
    } else {
        try {
            let resp = await axios.get(getUrl(word));
            promise = Promise.resolve(resp);
        } catch (e) {
            console.log(`Failed API call for ${word} at ${(new Date())}`);
            // select random from wordMeaningMap
            let cachedWords = Object.keys(wordMeaningMap);
            word = cachedWords[Math.floor((Math.random() * cachedWords.length )) || 0];
            promise = Promise.resolve({ data: wordMeaningMap[word] });
        }
    }
    return {
        word,
        promise
    };
}

async function getMeaningTask() {
    let { promise : getMeaningPromise, word } = await getNewMeaning();
    getMeaningPromise = Promise.resolve(getMeaningPromise);
    getMeaningPromise.then((resp) => {
        wordMeaningMap[word] = resp.data;
        let meanings = resp.data.map(el => el.text).filter(a => !!a);
        meanings = convertArrayToString(meanings);
        const popupCommandString = `osascript -e 'display alert "${capitalizeString(word)}" message "${meanings}"'`;
        exec(popupCommandString);
    });
}

/**
 * Returns random word from list of words stored locally
 */
function getRandomWord() {
    try {
        const randomIndex = Math.floor((Math.random() * totalWords ));
        return wordList[randomIndex] || wordList[0];
    } catch (e) {
        return wordList[0];
    }
}

// runs the job every 30 minutes
const getMeaningJob = new CronJob('0 */30 * * * *', getMeaningTask);
getMeaningJob.start();

// write wordMeaningMap from in memory to file
function writeDataTask() {
    fs.writeFile('./wordMeaningMap.js', JSON.stringify(wordMeaningMap), { flag: 'w' },(err) => {
        if (err) {
            console.log('Error occured while writing to file', err);
        }
    });
}

// runs writeData task every morning 11AM
const writeDataJob = new CronJob('0 0 11 * * *', writeDataTask);
writeDataJob.start();