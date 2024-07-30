let words = [];
let currentWordIndex = -1;
let attempts = 0;
let mistakes = 0;
let incorrectWords = [];
let incorrectEntries = new Set();
let timerInterval;
let totalTime = 0;
let lastUsedFile = null;

document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        lastUsedFile = file;
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            parseTXT(content);
        };
        reader.readAsText(file);
    }
});

document.getElementById('userInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        checkAnswer();
    }
});

function parseTXT(data) {
    words = [];
    const lines = data.split('\n');
    for (let line of lines) {
        const [hanzi, meaning, pinyin, difficulty] = line.split(',');
        if (hanzi && meaning && pinyin) {
            words.push({ hanzi: hanzi.trim(), meaning: meaning.trim(), pinyin: pinyin.trim(), difficulty: difficulty ? difficulty.trim() : 'none' });
        }
    }
}

function startTraining() {
    if (words.length === 0 && !lastUsedFile) {
        alert('Please upload a TXT file with Hanzi words, meanings, pinyin, and optionally difficulty levels.');
        return;
    }

    if (lastUsedFile && words.length === 0) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            parseTXT(content);
            startTrainingInternal();
        };
        reader.readAsText(lastUsedFile);
    } else {
        startTrainingInternal();
    }
}

function startTrainingInternal() {
    const selectedDifficulty = document.getElementById('difficultySelect').value;
    let filteredWords = words;
    if (selectedDifficulty !== 'none') {
        filteredWords = words.filter(word => word.difficulty === selectedDifficulty);
    }

    if (filteredWords.length === 0) {
        alert('No words found for the selected difficulty level.');
        return;
    }

    document.getElementById('startButton').classList.add('hidden');
    document.getElementById('fileInput').classList.add('hidden');
    document.getElementById('difficultySelect').classList.add('hidden');
    document.getElementById('trainingSection').classList.remove('hidden');
    attempts = 0;
    mistakes = 0;
    incorrectWords = [];
    incorrectEntries.clear();
    startTimer();
    words = filteredWords;
    nextWord();
}

function startTimer() {
    totalTime = 0;
    timerInterval = setInterval(() => {
        totalTime++;
        document.getElementById('timer').innerText = `Time: ${totalTime} seconds`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function nextWord() {
    if (words.length === 0 && incorrectWords.length === 0) {
        stopTimer();
        showResults();
        return;
    }

    let wordList = words.length > 0 ? words : incorrectWords;
    currentWordIndex = Math.floor(Math.random() * wordList.length);
    document.getElementById('meaning').innerText = 'Meaning: ' + wordList[currentWordIndex].meaning;
    document.getElementById('userInput').value = '';
    document.getElementById('feedback').innerText = '';
    document.getElementById('feedback').className = '';
}

function checkAnswer() {
    const userInput = document.getElementById('userInput').value.trim();
    attempts++;
    let wordList = words.length > 0 ? words : incorrectWords;
    let currentWord = wordList[currentWordIndex];

    if (userInput === currentWord.hanzi) {
        document.getElementById('feedback').innerText = 'Correct!';
        document.getElementById('feedback').className = 'correct';
        wordList.splice(currentWordIndex, 1);
        setTimeout(nextWord, 1000); // Wait for 1 second before showing the next word
    } else {
        document.getElementById('feedback').innerText = `Incorrect. The correct answer is: ${currentWord.hanzi} (${currentWord.pinyin})`;
        document.getElementById('feedback').className = 'incorrect';
        mistakes++;
        incorrectEntries.add(currentWord);
        if (words.length > 0) {
            incorrectWords.push(currentWord);
            words.splice(currentWordIndex, 1);
        }
        setTimeout(nextWord, 3000); // Wait for 3 seconds before showing the next word
    }
}

function showResults() {
    document.getElementById('trainingSection').classList.add('hidden');
    document.getElementById('resultsSection').classList.remove('hidden');
    document.getElementById('score').innerText = `Attempts: ${attempts}, Mistakes: ${mistakes}, Time: ${totalTime} seconds`;
    const wrongAnswersList = document.getElementById('wrongAnswersList');
    wrongAnswersList.innerHTML = '';
    incorrectEntries.forEach(entry => {
        const listItem = document.createElement('li');
        listItem.innerText = `${entry.hanzi} (${entry.pinyin}): ${entry.meaning}`;
        wrongAnswersList.appendChild(listItem);
    });

    const restartButton = document.getElementById('restartButton');
    if (mistakes === 0) {
        restartButton.classList.add('hidden');
    } else {
        restartButton.classList.remove('hidden');
    }
}


    function restartTraining() {
        document.getElementById('resultsSection').classList.add('hidden');
        document.getElementById('startButton').classList.remove('hidden');
        document.getElementById('fileInput').classList.remove('hidden');
        document.getElementById('difficultySelect').classList.remove('hidden');
        words = [...incorrectEntries];
        attempts = 0;
        mistakes = 0;
        incorrectWords = [];
        incorrectEntries.clear();
        startTraining();
    }
    
    function exitTraining() {
        document.getElementById('resultsSection').classList.add('hidden');
        document.getElementById('startButton').classList.remove('hidden');
        document.getElementById('fileInput').classList.remove('hidden');
        document.getElementById('difficultySelect').classList.remove('hidden');
        stopTimer();
        words = [];
        incorrectWords = [];
        incorrectEntries.clear();
    }
    
    document.getElementById('startButton').addEventListener('click', () => {
        if (lastUsedFile && words.length === 0) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const content = e.target.result;
                parseTXT(content);
                startTrainingInternal();
            };
            reader.readAsText(lastUsedFile);
        } else {
            startTrainingInternal();
        }
    });
    