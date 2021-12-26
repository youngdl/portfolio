'use strict';
const quotes = [
    'When you have eliminated the impossible, whatever remains, however improbable, must be the truth.',
    'There is nothing more deceptive than an obvious fact.',
    'I ought to know by this time that when a fact appears to be opposed to a long train of deductions it invariably proves to be capable of bearing some other interpretation.',
    'I never make exceptions. An exception disproves the rule.',
    'What one man can invent another can discover.',
    'Nothing clears up a case so much as stating it to another person.',
    'Education never ends, Watson. It is a series of lessons, with the greatest for the last.',
];
let words = [];
let wordIndex = 0;
let startTime = Date.now();
let finishMonth;  
let finishDate;
let finishHours;
let finishMinutes;
let elapsedTime;
let timeSpans = [];
let last_ranking = '';
const rankingElement = document.getElementById('ranking-content')
const mainPartElement = document.getElementById('main_part');
const quoteElement = document.getElementById('quote');
const messageElement = document.getElementById('message');
const messageContentElement = document.getElementById('message-content');
const typedValueElement = document.getElementById('typed-value');
const saveRankingButton = document.getElementById('save');
// show ranking
rankingElement.innerHTML = localStorage.getItem('last_ranking');

document.getElementById('start').addEventListener('click', startGame);
document.getElementById('once-more').addEventListener('click', startGame);
function startGame() {
    // get quote
    messageElement.style.display = 'none';
    mainPartElement.style.opacity = 1;
    const quoteIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[quoteIndex];
    words = quote.split(' ');
    wordIndex = 0;
    // UI update
    // create an array of <span> elements
    const spanWords = words.map(function(word) { return `<span>${word} </span>`});
    quoteElement.innerHTML = spanWords.join(' ');
    quoteElement.childNodes[0].className = 'highlight';
    messageContentElement.innerText = '';
    typedValueElement.disabled = false;
    saveRankingButton.disabled = false;
    typedValueElement.value = '';
    typedValueElement.className = '';
    typedValueElement.focus();
    startTime = new Date().getTime();
}

document.getElementById('typed-value').addEventListener('input', () => {
    const currentWord = words[wordIndex];
    const typedValue = typedValueElement.value;
    if (typedValue === currentWord && wordIndex === words.length - 1) {
        finishMonth = new Date().getMonth();
        finishDate = new Date().getDate();
        finishHours = new Date().getHours();
        finishMinutes = new Date().getMinutes();
        elapsedTime = new Date().getTime() - startTime;
        const message = `CONGRATULATIONS! You finished in <b>${elapsedTime / 1000}</b> seconds.`;
        messageContentElement.innerHTML = message;
        messageElement.style.display = 'flex';
        mainPartElement.style.opacity = 0.2;
        // quoteElement.childNodes[-2].className = '';
        typedValueElement.disabled = true;
    } else if (typedValue.endsWith(' ') && typedValue.trim() === currentWord) {
        typedValueElement.value = '';
        wordIndex++;
        for (const wordElement of quoteElement.childNodes) {
            wordElement.className = '';
        }
        quoteElement.childNodes[2 * wordIndex].className = 'highlight';
    } else if (currentWord.startsWith(typedValue)) {
        typedValueElement.className = '';
    } else {
        let errorIndex = typedValue.length - 1;
        typedValueElement.className = 'error';
        let errorWord = quoteElement.childNodes[2 * wordIndex];
        errorWord.innerHTML = `<span>${currentWord.slice(0, errorIndex)}</span>` +
            `<span class='error_char'>${currentWord[errorIndex]}</span><span>${currentWord.slice(errorIndex+1)} </span>`;
    }
});

document.getElementById('X-button').addEventListener('click', endGame);
document.getElementById('that-it').addEventListener('click', endGame);
document.getElementById('save').addEventListener('click', saveToRank);
function endGame() {
    messageElement.style.display = 'none';
    mainPartElement.style.opacity = 1;
    localStorage.setItem('last_ranking', last_ranking);
}

function saveToRank() {
    saveRankingButton.disabled = true;
    const finishTime = `${finishMonth+1}/${finishDate}-${finishHours}:${finishMinutes}`;
    debugger;
    if (timeSpans.length === 0 || (timeSpans.length < 10 && elapsedTime > timeSpans[timeSpans.length-1])) {
        timeSpans.push(elapsedTime);
        localStorage.setItem(`${elapsedTime}`, finishTime);
        rankingElement.innerHTML = rankingElement.innerHTML + `<li>${elapsedTime/1000} seconds @ ${finishTime}</li>`
        last_ranking = rankingElement.innerHTML;
    } else if (timeSpans.length === 10 && elapsedTime > timeSpans){}
    else {
        localStorage.setItem(`${elapsedTime}`, finishTime);
        timeSpans.push(elapsedTime);
        timeSpans.sort((a, b) => a - b);
        while (timeSpans.length > 10) {
            let last_item = timeSpans.pop();
            localStorage.removeItem(last_item);
        }
        rankingElement.innerHTML = '';
        for (let time of timeSpans) {
            let finish = localStorage.getItem(time);
            rankingElement.innerHTML = rankingElement.innerHTML + `<li>${time/1000} seconds @ ${finish}</li>`;
        }
        last_ranking = rankingElement.innerHTML;
    }
}
