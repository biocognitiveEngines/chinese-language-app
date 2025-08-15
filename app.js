class ChineseLanguageApp {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.conversationHistory = [];
        this.isListening = false;
        this.finalTranscript = '';
        this.recordedMessage = '';
        this.isProcessing = false;
        this.initializeElements();
        this.setupEventListeners();
        this.initializeSpeechRecognition();
    }

    initializeElements() {
        this.micButton = document.getElementById('mic-button');
        this.speechStatus = document.getElementById('speech-status');
        this.conversationHistoryEl = document.getElementById('conversation-history');
        this.textInput = document.getElementById('text-input');
        this.sendButton = document.getElementById('send-button');
        this.clearButton = document.getElementById('clear-button');
        this.speakLastButton = document.getElementById('speak-last');
        this.randomTopicButton = document.getElementById('random-topic');
        this.autoSpeakCheckbox = document.getElementById('auto-speak');
        this.correctionPanel = document.getElementById('correction-panel');
        this.correctionContent = document.getElementById('correction-content');
        this.loading = document.getElementById('loading');
    }

    setupEventListeners() {
        this.micButton.addEventListener('mousedown', () => this.startListening());
        this.micButton.addEventListener('mouseup', () => this.stopListening());
        this.micButton.addEventListener('mouseleave', () => this.stopListening());
        
        this.micButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startListening();
        });
        this.micButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopListening();
        });

        this.sendButton.addEventListener('click', () => this.sendTextMessage());
        this.textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendTextMessage();
        });

        // Global Enter key listener for recorded messages
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.recordedMessage) {
                this.sendRecordedMessage();
            }
        });

        this.clearButton.addEventListener('click', () => this.clearConversation());
        this.speakLastButton.addEventListener('click', () => this.speakLastMessage());
        this.randomTopicButton.addEventListener('click', () => this.getRandomTopic());
        
        // Add event listener for existing replay button (if any)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('replay-button')) {
                e.stopPropagation();
                const textToSpeak = e.target.getAttribute('data-text');
                if (textToSpeak) {
                    this.speakText(textToSpeak);
                }
            }
        });
    }

    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'zh-CN';

            this.recognition.onstart = () => {
                this.speechStatus.textContent = 'Listening...';
                this.micButton.classList.add('listening');
            };

            this.recognition.onresult = (event) => {
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        this.finalTranscript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }

                this.speechStatus.textContent = this.finalTranscript + interimTranscript || 'Listening...';
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.speechStatus.textContent = `Error: ${event.error}`;
                this.micButton.classList.remove('listening');
                this.isListening = false;
            };

            this.recognition.onend = () => {
                this.speechStatus.textContent = 'Ready to listen';
                this.micButton.classList.remove('listening');
                this.isListening = false;
                
                // Store the transcribed text without sending
                if (this.finalTranscript.trim()) {
                    this.recordedMessage = this.finalTranscript.trim();
                    this.finalTranscript = '';
                    this.showRecordedMessage();
                }
            };
        } else {
            console.warn('Speech recognition not supported');
            this.speechStatus.textContent = 'Speech recognition not supported';
        }
    }

    startListening() {
        if (this.recognition && !this.isListening) {
            this.isListening = true;
            this.finalTranscript = '';
            this.recognition.start();
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            // Message will be sent in the onend handler
        }
    }

    sendTextMessage() {
        const message = this.textInput.value.trim();
        if (message) {
            this.processUserMessage(message);
            this.textInput.value = '';
        }
    }

    async processUserMessage(message) {
        // Prevent duplicate processing
        if (this.isProcessing) {
            console.log('Already processing a message, ignoring duplicate call');
            return;
        }
        
        this.isProcessing = true;
        this.addMessageToHistory('user', message);
        this.showLoading(true);

        try {
            console.log('Sending message to API:', message);
            console.log('Conversation history:', this.conversationHistory);
            
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    conversation_history: this.conversationHistory
                })
            });

            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Response data:', data);
            
            if (data.error) {
                throw new Error(data.error);
            }

            if (!data.response) {
                console.error('No response field in data:', data);
                throw new Error('Invalid response format from server');
            }

            this.addMessageToHistory('ai', data.response, data.translation);
            
            if (data.correction) {
                this.showCorrection(data.correction);
            }

            if (this.autoSpeakCheckbox.checked && data.response) {
                this.speakText(data.response);
            }

        } catch (error) {
            console.error('Full error details:', error);
            console.error('Error stack:', error.stack);
            this.addMessageToHistory('ai', '抱歉，出现了错误。请再试一次。', 'Sorry, there was an error. Please try again.');
        }
        
        this.isProcessing = false;
        this.showLoading(false);
    }

    addMessageToHistory(sender, message, translation = null) {
        const messageGroupDiv = document.createElement('div');
        messageGroupDiv.className = `message-group ${sender}-message-group`;

        // Create Chinese message bubble
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';

        const messageP = document.createElement('p');
        messageP.textContent = message;
        messageContent.appendChild(messageP);

        const timestamp = document.createElement('span');
        timestamp.className = 'timestamp';
        timestamp.textContent = new Date().toLocaleTimeString();
        messageContent.appendChild(timestamp);

        // Add replay button for AI messages with Chinese text
        if (sender === 'ai' && this.containsChinese(message)) {
            const replayButton = document.createElement('button');
            replayButton.className = 'replay-button';
            replayButton.setAttribute('data-text', message);
            replayButton.setAttribute('title', 'Replay audio');
            replayButton.textContent = '🔊';
            replayButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.speakText(message);
            });
            messageContent.appendChild(replayButton);
        }

        messageDiv.appendChild(messageContent);
        messageGroupDiv.appendChild(messageDiv);

        // Create translation bubble if translation exists
        if (translation) {
            const translationDiv = document.createElement('div');
            translationDiv.className = `message ${sender}-message translation-message`;

            const translationContent = document.createElement('div');
            translationContent.className = 'message-content translation-content';

            const translationP = document.createElement('p');
            translationP.textContent = translation;
            translationContent.appendChild(translationP);

            translationDiv.appendChild(translationContent);
            messageGroupDiv.appendChild(translationDiv);
        }

        this.conversationHistoryEl.appendChild(messageGroupDiv);
        this.conversationHistoryEl.scrollTop = this.conversationHistoryEl.scrollHeight;

        this.conversationHistory.push({ sender, message, translation, timestamp: new Date().toISOString() });
    }

    showCorrection(correction) {
        let correctionHTML = '';
        
        if (correction.type === 'interjection_help') {
            // Handle English interjection help
            correctionHTML = `
                <div class="correction-item interjection-help">
                    <h4>🔤 English Word Help</h4>
                    <p class="explanation">${correction.explanation}</p>
            `;
            
            if (correction.english_words && correction.translations) {
                correctionHTML += '<div class="word-translations">';
                for (let i = 0; i < correction.english_words.length; i++) {
                    const englishWord = correction.english_words[i];
                    const chineseTranslation = correction.translations[i] || 'Translation not available';
                    correctionHTML += `
                        <div class="word-pair">
                            <span class="english-word">${englishWord}</span> → 
                            <span class="chinese-translation">${chineseTranslation}</span>
                        </div>
                    `;
                }
                correctionHTML += '</div>';
            }
            
            if (correction.suggested_sentence) {
                correctionHTML += `
                    <h4>Suggested sentence:</h4>
                    <p class="suggested-sentence">${correction.suggested_sentence}</p>
                `;
            }
            
            correctionHTML += '</div>';
            
        } else {
            // Handle regular grammar corrections
            correctionHTML = `
                <div class="correction-item">
                    <h4>Original:</h4>
                    <p>${correction.original}</p>
                    <h4>Corrected:</h4>
                    <p class="corrected-text">${correction.corrected}</p>
                    <h4>Explanation:</h4>
                    <p class="explanation">${correction.explanation}</p>
                </div>
            `;
        }
        
        this.correctionContent.innerHTML = correctionHTML;
        this.correctionPanel.style.display = 'block';
        
        // Show longer for interjection help since it's more informative
        const displayTime = correction.type === 'interjection_help' ? 15000 : 10000;
        setTimeout(() => {
            this.correctionPanel.style.display = 'none';
        }, displayTime);
    }

    containsChinese(text) {
        // Check if text contains Chinese characters (CJK Unified Ideographs)
        return /[\u4e00-\u9fff]/.test(text);
    }

    speakText(text) {
        if (this.synthesis) {
            const chineseOnly = text.replace(/[a-zA-Z0-9\s.,!?;:'"()\-–—\[\]{}\/\\@#$%^&*+=_`~<>|]+/g, '').trim();
            
            if (!chineseOnly) {
                console.log('No Chinese characters found to speak');
                return;
            }
            
            this.synthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(chineseOnly);
            utterance.lang = 'zh-CN';
            utterance.rate = 0.8;
            utterance.pitch = 1;
            
            const voices = this.synthesis.getVoices();
            const chineseVoice = voices.find(voice => voice.lang.includes('zh'));
            if (chineseVoice) {
                utterance.voice = chineseVoice;
            }
            
            this.synthesis.speak(utterance);
        }
    }

    speakLastMessage() {
        const lastAiMessage = [...this.conversationHistory].reverse().find(msg => msg.sender === 'ai');
        if (lastAiMessage) {
            this.speakText(lastAiMessage.message);
        }
    }

    clearConversation() {
        if (confirm('Are you sure you want to clear the conversation?')) {
            this.conversationHistory = [];
            this.conversationHistoryEl.innerHTML = `
                <div class="message-group ai-message-group">
                    <div class="message ai-message">
                        <div class="message-content">
                            <p>你好！我是你的中文老师。让我们开始对话吧！</p>
                            <span class="timestamp"></span>
                            <button class="replay-button" data-text="你好！我是你的中文老师。让我们开始对话吧！" title="Replay audio">🔊</button>
                        </div>
                    </div>
                    <div class="message ai-message translation-message">
                        <div class="message-content translation-content">
                            <p>Hello! I'm your Chinese teacher. Let's start our conversation!</p>
                        </div>
                    </div>
                </div>
            `;
            this.correctionPanel.style.display = 'none';
        }
    }

    async getRandomTopic() {
        try {
            this.showLoading(true);
            const response = await fetch('/api/random-topic', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            // Add the random topic as an AI message to start the conversation
            this.addMessageToHistory('ai', data.topic, data.translation);
            
            if (this.autoSpeakCheckbox.checked && data.topic) {
                this.speakText(data.topic);
            }

        } catch (error) {
            console.error('Error getting random topic:', error);
            this.addMessageToHistory('ai', '我们聊聊今天的天气吧？', 'How about we talk about today\'s weather?');
        }
        
        this.showLoading(false);
    }

    showRecordedMessage() {
        if (this.recordedMessage) {
            this.speechStatus.innerHTML = `
                <div class="recorded-message-container">
                    <div class="recorded-message">"${this.recordedMessage}"</div>
                    <div class="recorded-message-actions">
                        <button id="send-recorded" class="action-button send-button">Send</button>
                        <button id="redo-recording" class="action-button redo-button">Redo</button>
                    </div>
                </div>
            `;
            
            // Add event listeners for the new buttons
            document.getElementById('send-recorded').addEventListener('click', () => this.sendRecordedMessage());
            document.getElementById('redo-recording').addEventListener('click', () => this.redoRecording());
        }
    }

    sendRecordedMessage() {
        if (this.recordedMessage) {
            this.processUserMessage(this.recordedMessage);
            this.clearRecordedMessage();
        }
    }

    redoRecording() {
        this.clearRecordedMessage();
        this.startListening();
    }

    clearRecordedMessage() {
        this.recordedMessage = '';
        this.speechStatus.textContent = 'Ready to listen';
    }

    showLoading(show) {
        this.loading.style.display = show ? 'flex' : 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ChineseLanguageApp();
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}