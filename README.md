# Chinese Language Learning App

A full-stack web application for practicing Chinese conversation with AI-powered corrections and feedback.

## Features

- **Speech Recognition**: Speak in Chinese using your microphone
- **Text-to-Speech**: Hear AI responses in Chinese
- **Real-time Corrections**: Get immediate feedback on grammar and pronunciation
- **Conversation History**: Track your learning progress
- **Mobile Responsive**: Use on desktop, tablet, or phone

## Setup Instructions

### 1. Prerequisites

- Python 3.8+
- Modern web browser with microphone access
- Azure OpenAI account and API credentials

### 2. Installation

1. Clone or download the application files
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your Azure OpenAI credentials
   ```

### 3. Configuration

Edit the `.env` file with your Azure OpenAI credentials:

```env
AZURE_OPENAI_API_KEY=your_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
AZURE_OPENAI_API_VERSION=2024-02-01
```

### 4. Running the Application

```bash
python app.py
```

Open your browser to `http://localhost:5000`

## Usage

1. **Speaking Practice**: Hold the microphone button and speak in Chinese
2. **Text Input**: Type Chinese characters in the text input field
3. **Listen to Responses**: AI responses are automatically spoken in Chinese
4. **View Corrections**: Corrections appear in the side panel when errors are detected
5. **Clear History**: Use the "Clear Chat" button to start a new conversation

## Browser Compatibility

- **Speech Recognition**: Chrome, Edge (Chromium-based browsers)
- **Text-to-Speech**: All modern browsers
- **Microphone Access**: HTTPS required for production use

## Troubleshooting

- **Microphone not working**: Ensure browser permissions are granted
- **Speech recognition not starting**: Try using Chrome or Edge
- **API errors**: Check your Azure OpenAI credentials in `.env`
- **No audio output**: Check browser audio settings and Chinese voice availability

## Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (Web Speech API)
- **Backend**: Python Flask
- **AI**: Azure OpenAI GPT-4
- **Speech**: Browser-native Web Speech API

## License

This project is for educational purposes.