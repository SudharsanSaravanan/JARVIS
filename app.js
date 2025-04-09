// DOM Elements
const btn = document.querySelector('.talk');
const content = document.querySelector('.content');
const historyList = document.getElementById('history-list');
const jarvisAnimation = document.getElementById('jarvis-animation');
const commandInput = document.querySelector('.command-input');
const quickCommandButtons = document.querySelectorAll('.cmd-btn');

// Settings
let commandHistory = [];
let isListening = false;

// Initialize system
function initialize() {
    loadCommandHistory();
    speak("JARVIS system ready");

    // Set up quick command buttons
    quickCommandButtons.forEach(button => {
        button.addEventListener('click', () => {
            const command = button.getAttribute('data-command');
            content.textContent = command;
            addToHistory(command);
            takeCommand(command.toLowerCase());
        });
    });
}

// Save command history to local storage
function saveCommandHistory() {
    localStorage.setItem('jarvisCommandHistory', JSON.stringify(commandHistory));
}

// Load command history from local storage
function loadCommandHistory() {
    const saved = localStorage.getItem('jarvisCommandHistory');
    if (saved) {
        commandHistory = JSON.parse(saved);
        updateHistoryUI();
    }
}

// Add command to history
function addToHistory(command) {
    if (command.trim() === '') return;
    commandHistory.unshift(command);
    if (commandHistory.length > 5) commandHistory.pop();
    saveCommandHistory();
    updateHistoryUI();
}

// Update the history UI
function updateHistoryUI() {
    historyList.innerHTML = '';
    commandHistory.forEach(cmd => {
        const li = document.createElement('li');
        li.textContent = cmd;
        li.addEventListener('click', () => {
            content.textContent = cmd;
            takeCommand(cmd.toLowerCase());
        });
        historyList.appendChild(li);
    });
}

// Text-to-speech function with male voice preference
function speak(text) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.volume = 1;
    utterance.pitch = 0.8;

    let voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices();
            setMaleVoice();
        };
    } else {
        setMaleVoice();
    }

    function setMaleVoice() {
        let maleVoice = voices.find(voice => voice.name.toLowerCase().includes('male') && voice.lang.includes('en'));
        if (!maleVoice) {
            maleVoice = voices.find(voice => voice.name.includes('UK English') || voice.name.includes('US English'));
        }
        if (!maleVoice) {
            maleVoice = voices.find(voice => voice.lang.includes('en'));
        }
        if (maleVoice) utterance.voice = maleVoice;

        if (jarvisAnimation) {
            jarvisAnimation.style.transform = 'scale(1.05)';
            utterance.onend = () => {
                jarvisAnimation.style.transform = 'scale(1)';
            };
        }

        window.speechSynthesis.speak(utterance);
    }
}

// Set up Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

recognition.onresult = (event) => {
    const transcript = event.results[event.resultIndex][0].transcript;
    content.textContent = transcript;
    addToHistory(transcript);
    takeCommand(transcript.toLowerCase());
    commandInput.classList.remove('listening');
    isListening = false;
};

recognition.onerror = (event) => {
    console.error('Speech recognition error', event.error);
    content.textContent = `Error: ${event.error}. Try again.`;
    commandInput.classList.remove('listening');
    isListening = false;
    setTimeout(() => {
        content.textContent = 'Click button to speak';
    }, 3000);
};

recognition.onend = () => {
    commandInput.classList.remove('listening');
    isListening = false;
};

btn.addEventListener('click', () => {
    if (isListening) {
        recognition.stop();
        isListening = false;
        commandInput.classList.remove('listening');
        content.textContent = 'Click button to speak';
    } else {
        recognition.start();
        isListening = true;
        commandInput.classList.add('listening');
        content.textContent = 'Listening...';
    }
});

// Handle commands
function takeCommand(message) {
    const openSite = (url, response) => {
        window.open(url, '_blank');
        speak(response);
    };

    if (/\b(hey|hello|hi)\b.*\bjarvis\b/.test(message)) speak("Hello Sir, How may I help you?");
    else if (/\bwho (are|is).*you\b/.test(message)) speak("I am JARVIS, your personal AI assistant. I was designed to help you with various tasks.");
    else if (/\bwho.*(created|programmed|made).*you\b/.test(message)) speak("I was programmed and designed to serve as your helpful virtual assistant.");
    else if (message.includes('open google')) openSite('https://google.com', 'Opening Google for you.');
    else if (message.includes('open youtube')) openSite('https://youtube.com', 'Opening YouTube. What would you like to watch?');
    else if (message.includes('open facebook')) openSite('https://facebook.com', 'Opening Facebook.');
    else if (message.includes('open instagram')) openSite('https://instagram.com', 'Opening Instagram.');
    else if (message.includes('open twitter') || message.includes('open x')) openSite('https://twitter.com', 'Opening Twitter for you.');
    else if (message.includes('open github')) openSite('https://github.com', 'Opening GitHub. Time for some coding?');
    else if (message.includes('open netflix')) openSite('https://netflix.com', 'Opening Netflix. Enjoy your show!');
    else if (message.includes('open spotify')) openSite('https://open.spotify.com', "Opening Spotify. Let's listen to some music!");
    else if (message.includes('search for')) {
        const query = message.replace('search for', '').trim();
        openSite(`https://www.google.com/search?q=${query.replace(/\s/g, "+")}`, `Searching for ${query}`);
    } else if (message.includes('play') && message.includes('on youtube')) {
        const query = message.replace('play', '').replace('on youtube', '').trim();
        openSite(`https://www.youtube.com/results?search_query=${query.replace(/\s/g, "+")}`, `Looking for ${query} on YouTube`);
    } else if (message.includes('wikipedia')) {
        const query = message.replace('wikipedia', '').trim();
        openSite(`https://en.wikipedia.org/wiki/${query.replace(/\s/g, "_")}`, `Here's what I found on Wikipedia about ${query}`);
    } else if (message.includes('what time') || message.includes('the time')) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        speak(`The current time is ${time}`);
    } else if (message.includes('what day') || message.includes('what date')) {
        const date = new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        speak(`Today is ${date}`);
    } else if (message.includes('calculate')) {
        try {
            const expression = message.replace('calculate', '').trim();
            const result = new Function('return ' + expression)();
            speak(`The result of ${expression} is ${result}`);
        } catch {
            speak("I couldn't calculate that. Please try again with a simpler expression.");
        }
    } else if (message.includes('set timer for')) {
        const match = message.match(/timer for (\d+)/);
        if (match && match[1]) {
            const minutes = parseInt(match[1]);
            speak(`Setting a timer for ${minutes} minutes.`);
            setTimeout(() => speak(`Your ${minutes} minute timer is complete!`), minutes * 60000);
        } else {
            speak("I couldn't understand the timer duration. Please say 'set timer for X minutes'.");
        }
    } else if (message.includes('tell me a joke') || message.includes('say a joke')) {
        const jokes = [
            "Why don't scientists trust atoms? Because they make up everything!",
            "Why did the scarecrow win an award? Because he was outstanding in his field!",
            "I told my wife she was drawing her eyebrows too high. She looked surprised.",
            "What do you call a fake noodle? An impasta!",
            "Why couldn't the bicycle stand up by itself? It was two tired!",
            "What's the best thing about Switzerland? I don't know, but the flag is a big plus.",
            "Did you hear about the mathematician who's afraid of negative numbers? He'll stop at nothing to avoid them.",
            "Why did the programmer quit his job? Because he didn't get arrays!"
        ];
        speak(jokes[Math.floor(Math.random() * jokes.length)]);
    } else if (message.includes('clear history')) {
        commandHistory = [];
        saveCommandHistory();
        updateHistoryUI();
        speak("Command history cleared.");
    } else if (message.includes('goodbye') || message.includes('bye') || message.includes('exit')) {
        speak("Goodbye sir. I'll be here when you need me.");
    } else if (message.includes('thank you') || message.includes('thanks')) {
        speak("You're welcome, sir. I'm happy to assist.");
    } else if (message.includes('play music')) {
        openSite("https://open.spotify.com", "Opening Spotify for you to play some music.");
    } else if (message.includes('open email') || message.includes('check email')) {
        openSite("https://gmail.com", "Opening your email.");
    } else if (message.includes('news') || message.includes('headlines')) {
        openSite("https://news.google.com", "Opening Google News so you can check the latest headlines.");
    } else if (message.includes('open maps') || message.includes('directions')) {
        openSite("https://maps.google.com", "Opening Google Maps for directions.");
    } else {
        speak("I'm sorry, I didn't understand that command.");
    }
}

// Start JARVIS system
document.addEventListener('DOMContentLoaded', initialize);
