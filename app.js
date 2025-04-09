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

// Check if mobile device
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Initialize system
function initialize() {
    // Check if secure context (HTTPS)
    if (window.isSecureContext === false && !window.location.hostname.includes('localhost')) {
        content.textContent = 'Please use HTTPS for microphone access';
        return;
    }

    // Mobile-specific instructions
    if (isMobile()) {
        content.textContent = 'Tap the mic button to speak';
    }

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
        let maleVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('male') && 
            voice.lang.includes('en')
        );
        
        if (!maleVoice) {
            maleVoice = voices.find(voice => 
                voice.name.includes('UK English') || 
                voice.name.includes('US English')
            );
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

// Speech recognition handlers
recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    content.textContent = transcript;
    addToHistory(transcript);
    takeCommand(transcript.toLowerCase());
    commandInput.classList.remove('listening');
    isListening = false;
};

recognition.onerror = (event) => {
    console.error('Speech recognition error', event.error);
    let errorMessage = `Error: ${event.error}. Try again.`;
    
    if (event.error === 'not-allowed') {
        errorMessage = 'Microphone access denied. Please allow microphone permissions.';
    } else if (event.error === 'no-speech') {
        errorMessage = 'No speech detected. Try again.';
    }
    
    content.textContent = errorMessage;
    commandInput.classList.remove('listening');
    isListening = false;
    
    setTimeout(() => {
        content.textContent = isMobile() ? 'Tap the mic button to speak' : 'Click button to speak';
    }, 3000);
};

recognition.onend = () => {
    if (isListening) {
        // If still listening but recognition ended, try restarting
        setTimeout(() => {
            if (isListening) {
                recognition.start();
            }
        }, 100);
    } else {
        commandInput.classList.remove('listening');
    }
};

// Button event handlers
async function handleMicButton() {
    try {
        // Request microphone permission explicitly
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        if (isListening) {
            recognition.stop();
            isListening = false;
            commandInput.classList.remove('listening');
            content.textContent = isMobile() ? 'Tap the mic button to speak' : 'Click button to speak';
        } else {
            recognition.start();
            isListening = true;
            commandInput.classList.add('listening');
            content.textContent = 'Listening...';
            
            // Mobile vibration feedback
            if (isMobile() && navigator.vibrate) {
                navigator.vibrate(50);
            }
        }
    } catch (err) {
        console.error('Microphone access error:', err);
        content.textContent = 'Microphone access was denied. Please enable microphone permissions.';
        isListening = false;
        commandInput.classList.remove('listening');
    }
}

// Set up event listeners
btn.addEventListener('click', handleMicButton);

// Add touch support for mobile
btn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleMicButton();
}, { passive: false });

// Handle commands
function takeCommand(message) {
    const cleanMessage = message.trim().toLowerCase();
    const openSite = (url, response) => {
        window.open(url, '_blank');
        speak(response);
    };

    if (/^(hey|hello|hi)\s*(jarvis)?$/.test(cleanMessage) || cleanMessage === 'jarvis') {
        speak("Hello Sir");
    }
    else if (cleanMessage.includes('who are you')) {
        speak("I am JARVIS, your personal AI assistant.");
    }
    else if (cleanMessage.includes('who made you')) {
        speak("I was designed to serve as your virtual assistant.");
    }
    else if (cleanMessage.includes('open google')) {
        openSite('https://google.com', 'Opening Google');
    }
    else if (cleanMessage.includes('open youtube')) {
        openSite('https://youtube.com', 'Opening YouTube');
    }
    else if (cleanMessage.includes('open facebook')) {
        openSite('https://facebook.com', 'Opening Facebook');
    }
    else if (cleanMessage.includes('open instagram')) {
        openSite('https://instagram.com', 'Opening Instagram');
    }
    else if (cleanMessage.includes('open twitter') || cleanMessage.includes('open x')) {
        openSite('https://twitter.com', 'Opening Twitter');
    }
    else if (cleanMessage.includes('open github')) {
        openSite('https://github.com', 'Opening GitHub');
    }
    else if (cleanMessage.includes('open netflix')) {
        openSite('https://netflix.com', 'Opening Netflix');
    }
    else if (cleanMessage.includes('open spotify')) {
        openSite('https://open.spotify.com', "Opening Spotify");
    }
    else if (cleanMessage.startsWith('search for ')) {
        const query = cleanMessage.replace('search for', '').trim();
        openSite(`https://www.google.com/search?q=${encodeURIComponent(query)}`, `Searching for ${query}`);
    }
    else if (cleanMessage.includes('play') && cleanMessage.includes('on youtube')) {
        const query = cleanMessage.replace('play', '').replace('on youtube', '').trim();
        openSite(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, `Searching YouTube for ${query}`);
    }
    else if (cleanMessage.includes('wikipedia')) {
        const query = cleanMessage.replace('wikipedia', '').trim();
        openSite(`https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`, `Searching Wikipedia for ${query}`);
    }
    else if (cleanMessage.includes('what time') || cleanMessage.includes('the time')) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        speak(`It's ${time}`);
    }
    else if (cleanMessage.includes('what day') || cleanMessage.includes('what date')) {
        const date = new Date().toLocaleDateString('en-US', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
        speak(`Today is ${date}`);
    }
    else if (cleanMessage.startsWith('calculate ')) {
        try {
            const expression = cleanMessage.replace('calculate', '').trim();
            const result = new Function('return ' + expression)();
            speak(`Result: ${expression} = ${result}`);
        } catch {
            speak("I couldn't calculate that");
        }
    }
    else if (cleanMessage.startsWith('set timer for ')) {
        const match = cleanMessage.match(/set timer for (\d+) minutes?/);
        if (match) {
            const minutes = parseInt(match[1]);
            speak(`Timer set for ${minutes} minutes`);
            setTimeout(() => speak(`Timer completed: ${minutes} minutes have passed`), minutes * 60000);
        } else {
            speak("Please specify timer duration like 'set timer for 5 minutes'");
        }
    }
    else if (cleanMessage.includes('clear history')) {
        commandHistory = [];
        saveCommandHistory();
        updateHistoryUI();
        speak("History cleared");
    }
    else if (cleanMessage.includes('goodbye') || cleanMessage.includes('bye') || cleanMessage.includes('exit')) {
        speak("Goodbye sir");
    }
    else if (cleanMessage.includes('thank you') || cleanMessage.includes('thanks')) {
        speak("You're welcome");
    }
    else if (cleanMessage.includes('tell me a joke') || cleanMessage.includes('say a joke')) {
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
    }
    else {
        const searchQuery = cleanMessage.trim();
        if (searchQuery) {
            openSite(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, 
                   `I didn't understand that. Searching for "${searchQuery}"`);
        }
    }
}

// Initialize on load
window.addEventListener('load', initialize);