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
    // Only add if command is not empty
    if (command.trim() === '') return;
    
    commandHistory.unshift(command); // Add to beginning
    
    // Keep only last 5 commands
    if (commandHistory.length > 5) {
        commandHistory.pop();
    }
    
    saveCommandHistory();
    updateHistoryUI();
}

// Update the history UI
function updateHistoryUI() {
    historyList.innerHTML = '';
    
    commandHistory.forEach(cmd => {
        const li = document.createElement('li');
        li.textContent = cmd;
        
        // Make history items clickable to repeat commands
        li.addEventListener('click', () => {
            content.textContent = cmd;
            takeCommand(cmd.toLowerCase());
        });
        
        historyList.appendChild(li);
    });
}

// Text-to-speech function with male voice preference
function speak(text) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set a moderate speaking rate
    utterance.rate = 1;
    utterance.volume = 1;
    utterance.pitch = 0.8; // Lower pitch for more masculine voice
    
    // Get available voices
    let voices = window.speechSynthesis.getVoices();
    
    // If voices haven't loaded yet, wait a moment and try again
    if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices();
            setMaleVoice();
        };
    } else {
        setMaleVoice();
    }
    
    function setMaleVoice() {
        // Try to find a male English voice
        // Look for voices with "male" in the name
        let maleVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('male') && 
            voice.lang.includes('en')
        );
        
        // If no explicitly male voice found, try deeper voices like "Google UK English"
        if (!maleVoice) {
            maleVoice = voices.find(voice => 
                voice.name.includes('UK English') || 
                voice.name.includes('US English')
            );
        }
        
        // Fallback to any English voice
        if (!maleVoice) {
            maleVoice = voices.find(voice => voice.lang.includes('en'));
        }
        
        if (maleVoice) {
            utterance.voice = maleVoice;
        }
        
        // Add visual feedback during speech
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

// Speech recognition result handler
recognition.onresult = (event) => {
    const currentIndex = event.resultIndex;
    const transcript = event.results[currentIndex][0].transcript;
    
    content.textContent = transcript;
    addToHistory(transcript);
    takeCommand(transcript.toLowerCase());
    
    commandInput.classList.remove('listening');
    isListening = false;
};

// Speech recognition error handler
recognition.onerror = (event) => {
    console.error('Speech recognition error', event.error);
    content.textContent = `Error: ${event.error}. Try again.`;
    
    commandInput.classList.remove('listening');
    isListening = false;
    
    setTimeout(() => {
        content.textContent = 'Click button to speak';
    }, 3000);
};

// When recognition ends
recognition.onend = () => {
    commandInput.classList.remove('listening');
    isListening = false;
};

// Listen button event
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
    // Clean the message by removing extra spaces and making lowercase
    const cleanMessage = message.trim().toLowerCase();
    
    // Pure greetings only (when message is exactly or nearly a greeting)
    if (/^(hey|hello|hi)\s*(jarvis)?$/.test(cleanMessage) || 
        /^(hey|hello|hi)\s*(there)?$/.test(cleanMessage) ||
        cleanMessage === 'jarvis') {
        speak("Hello Sir");
    }
    
    // About JARVIS
    else if (cleanMessage.includes('who are you') || cleanMessage.includes('what are you')) {
        speak("I am JARVIS, your personal AI assistant.");
    }
    else if (cleanMessage.includes('who made you') || cleanMessage.includes('who created you')) {
        speak("I was designed to serve as your virtual assistant.");
    }
    
    // Web navigation
    else if (cleanMessage.includes('open google')) {
        window.open("https://google.com", "_blank");
        speak("Opening Google");
    }
    else if (cleanMessage.includes('open youtube')) {
        window.open("https://youtube.com", "_blank");
        speak("Opening YouTube");
    }
    else if (cleanMessage.includes('open facebook')) {
        window.open("https://facebook.com", "_blank");
        speak("Opening Facebook");
    }
    else if (cleanMessage.includes('open instagram')) {
        window.open("https://instagram.com", "_blank");
        speak("Opening Instagram");
    }
    else if (cleanMessage.includes('open twitter') || cleanMessage.includes('open x')) {
        window.open("https://twitter.com", "_blank");
        speak("Opening Twitter");
    }
    else if (cleanMessage.includes('open github')) {
        window.open("https://github.com", "_blank");
        speak("Opening GitHub");
    }
    else if (cleanMessage.includes('open netflix')) {
        window.open("https://netflix.com", "_blank");
        speak("Opening Netflix");
    }
    else if (cleanMessage.includes('open spotify')) {
        window.open("https://open.spotify.com", "_blank");
        speak("Opening Spotify");
    }
    
    // Search commands
    else if (cleanMessage.startsWith('search for ')) {
        const searchQuery = cleanMessage.replace('search for', '').trim();
        window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, "_blank");
        speak(`Searching for ${searchQuery}`);
    }
    else if (cleanMessage.includes('play') && cleanMessage.includes('on youtube')) {
        const searchQuery = cleanMessage.replace('play', '').replace('on youtube', '').trim();
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`, "_blank");
        speak(`Searching YouTube for ${searchQuery}`);
    }
    else if (cleanMessage.includes('wikipedia')) {
        const searchQuery = cleanMessage.replace('wikipedia', '').trim();
        window.open(`https://en.wikipedia.org/wiki/${encodeURIComponent(searchQuery)}`, "_blank");
        speak(`Searching Wikipedia for ${searchQuery}`);
    }
    
    // Utility commands
    else if (cleanMessage.includes('what time') || cleanMessage.includes('the time')) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        speak(`It's ${time}`);
    }
    else if (cleanMessage.includes('what day') || cleanMessage.includes('what date')) {
        const date = new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
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
    
    // System commands
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
    
    // Default action for all other commands - search Google
    else {
        const searchQuery = cleanMessage.trim();
        if (searchQuery) {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, "_blank");
            speak(`Searching for ${searchQuery}`);
        }
    }
}

// Initialize on load
window.addEventListener('load', initialize);