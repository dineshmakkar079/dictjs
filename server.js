const axios = require('axios');
const { exec } = require('child_process');
const { CronJob }  = require('cron');
const wordList = require('./words');
const { formatString, capitalizeString } = require('./utils');
const fs = require('fs');

const totalWords = wordList.length;
const API_KEY = process.env.WORDNIK_API_KEY;

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

function getMeaningTask() {
    const word = getRandomWord().toLowerCase();
    console.log(word);
    const getMeaningPromise = !!wordMeaningMap[word] ? // if already fetched, use cached result
        Promise.resolve({ data: wordMeaningMap[word] }) : 
        axios.get(getUrl(word));
    getMeaningPromise.
    then((resp) => {
        wordMeaningMap[word] = resp.data;
        let meanings = resp.data.map(el => el.text).filter(a => !!a);
        meanings = formatString(meanings.join(" OR "));
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
const writeDataJob = new CronJob('0 * 11 * * *', writeDataTask);
writeDataJob.start();