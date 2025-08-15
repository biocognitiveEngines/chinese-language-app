from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import openai
import os
import json
import re
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

class ChineseLanguageTutor:
    def __init__(self):
        self.client = openai.AzureOpenAI(
            api_key=os.getenv("AZURE_OPENAI_API_KEY"),
            api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-01"),
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
        )
        self.deployment_name = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4")
        
        self.system_prompt = """You are an expert Chinese language tutor. Your role is to:

1. Have natural conversations in Chinese with the student
2. Provide corrections when they make mistakes
3. Offer helpful explanations
4. Encourage learning while being patient and supportive
5. Adjust difficulty based on the student's level
6. Keep your responses very short and simple
7. Speak very simply, like to a 5 year old child

Guidelines:
- Respond ONLY in Chinese characters - do NOT include any English in your main response
- Correct grammar, pronunciation (when possible), and word choice errors
- Provide context and cultural insights
- Ask engaging questions to continue conversation
- Be encouraging and patient
- Offer 1-2 suggestions maximum

IMPORTANT: Your response should contain ONLY Chinese characters (汉字/中文). 
Do not mix English words or translations in your Chinese response.
English translations will be handled separately by the system.

Always be supportive and educational while maintaining natural conversation flow."""

    def process_message(self, user_message, conversation_history):
        try:
            messages = [{"role": "system", "content": self.system_prompt}]
            
            for msg in conversation_history[-10:]:
                if msg['sender'] == 'user':
                    messages.append({"role": "user", "content": msg['message']})
                elif msg['sender'] == 'ai':
                    messages.append({"role": "assistant", "content": msg['message']})
            
            messages.append({"role": "user", "content": user_message})
            
            analysis_prompt = f"""
            Analyze this Chinese text for errors: "{user_message}"
            
            Provide:
            1. A natural conversational response in Chinese
            2. English translation of your response
            3. If there are errors, provide correction details
            4. Respond with short simple sentences
            
            Format your response as JSON:
            {{
                "response": "Chinese response here",
                "translation": "English translation here",
                "has_errors": true/false,
                "correction": {{
                    "original": "original text with errors",
                    "corrected": "corrected version",
                    "explanation": "explanation of the correction"
                }}
            }}
            
            If no errors, omit the correction field.
            """
            
            response = self.client.chat.completions.create(
                model=self.deployment_name,
                messages=[
                    {"role": "system", "content": analysis_prompt},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            result = response.choices[0].message.content.strip()
            
            try:
                parsed_result = json.loads(result)
                return parsed_result
            except json.JSONDecodeError:
                return self._fallback_response(user_message, result)
                
        except Exception as e:
            print(f"Error processing message: {e}")
            return {
                "response": "抱歉，我现在无法回应。请再试一次。",
                "translation": "Sorry, I can't respond right now. Please try again.",
                "has_errors": False
            }

    def _fallback_response(self, user_message, ai_response):
        chinese_response = ai_response
        if '\n' in ai_response:
            lines = ai_response.split('\n')
            chinese_response = lines[0] if lines[0] else ai_response
        
        return {
            "response": chinese_response,
            "translation": "I understand what you said. Let's continue our conversation!",
            "has_errors": False
        }

    def get_conversation_response(self, user_message, conversation_history):
        try:
            messages = [{"role": "system", "content": self.system_prompt}]
            
            # Only include previous messages, not the current one
            # The current message is already in conversation_history from the frontend
            for msg in conversation_history[:-1][-8:]:
                if msg['sender'] == 'user':
                    messages.append({"role": "user", "content": msg['message']})
                elif msg['sender'] == 'ai':
                    messages.append({"role": "assistant", "content": msg['message']})
            
            # Add the current message
            messages.append({"role": "user", "content": user_message})
            
            print(f"DEBUG: Sending request to Azure OpenAI...")
            print(f"DEBUG: Deployment: {self.deployment_name}")
            print(f"DEBUG: Message: {user_message}")
            
            response = self.client.chat.completions.create(
                model=self.deployment_name,
                messages=messages,
                temperature=0.8,
                max_tokens=800
            )
            
            ai_response = response.choices[0].message.content.strip()
            print(f"DEBUG: Received response: {ai_response[:100]}...")
            
            correction = self._analyze_for_corrections(user_message)
            
            return {
                "response": ai_response,
                "translation": self._get_translation(ai_response),
                "correction": correction
            }
            
        except Exception as e:
            print(f"ERROR in get_conversation_response: {e}")
            import traceback
            traceback.print_exc()
            return {
                "response": "很好！让我们继续对话。",
                "translation": "Great! Let's continue our conversation."
            }

    def _detect_english_interjections(self, text):
        """Detect English words in Chinese text that might be interjections"""
        import string
        
        # Simple regex to find English words (letters only, not mixed with Chinese)
        english_words = re.findall(r'\b[a-zA-Z]+\b', text)
        
        if english_words:
            return {
                "has_interjections": True,
                "english_words": english_words,
                "original_text": text
            }
        return None

    def _analyze_for_corrections(self, text):
        try:
            # First check for English interjections
            interjections = self._detect_english_interjections(text)
            
            if interjections:
                # Handle interjections - get translations for English words
                english_words_str = ", ".join(interjections["english_words"])
                interjection_prompt = f"""
                The student used these English words in their Chinese sentence: {english_words_str}
                Original sentence: "{text}"
                
                Please help them by:
                1. Providing Chinese translations for the English words
                2. Showing how to incorporate them naturally into Chinese
                
                Respond with JSON:
                {{
                    "type": "interjection_help",
                    "english_words": [list of English words],
                    "translations": [list of Chinese translations for each word],
                    "suggested_sentence": "suggested Chinese sentence using the translations",
                    "explanation": "brief explanation of how to use these words in Chinese"
                }}
                """
                
                response = self.client.chat.completions.create(
                    model=self.deployment_name,
                    messages=[{"role": "user", "content": interjection_prompt}],
                    temperature=0.3,
                    max_tokens=400
                )
                
                result = response.choices[0].message.content.strip()
                
                try:
                    return json.loads(result)
                except json.JSONDecodeError:
                    # Fallback for interjections
                    return {
                        "type": "interjection_help",
                        "english_words": interjections["english_words"],
                        "explanation": f"I noticed you used English words: {english_words_str}. Let me help you say those in Chinese!"
                    }
            
            # Regular grammar correction analysis
            correction_prompt = f"""
            Analyze this Chinese text for grammatical errors, pronunciation issues, or better word choices: "{text}"
            
            If there are errors or improvements, respond with JSON:
            {{
                "type": "grammar_correction",
                "original": "original text",
                "corrected": "corrected version", 
                "explanation": "explanation of what was wrong and why"
            }}
            
            If the Chinese is correct, respond with: null
            """
            
            response = self.client.chat.completions.create(
                model=self.deployment_name,
                messages=[{"role": "user", "content": correction_prompt}],
                temperature=0.3,
                max_tokens=300
            )
            
            result = response.choices[0].message.content.strip()
            
            if result.lower() == 'null' or 'null' in result.lower():
                return None
                
            try:
                parsed = json.loads(result)
                if not parsed.get("type"):
                    parsed["type"] = "grammar_correction"
                return parsed
            except json.JSONDecodeError:
                return None
                
        except Exception as e:
            print(f"Error analyzing corrections: {e}")
            return None

    def _get_translation(self, chinese_text):
        try:
            translation_prompt = f"Translate this Chinese text to natural English: {chinese_text}"
            
            response = self.client.chat.completions.create(
                model=self.deployment_name,
                messages=[{"role": "user", "content": translation_prompt}],
                temperature=0.3,
                max_tokens=200
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"Error getting translation: {e}")
            return "Translation not available"

    def get_random_conversation_topic(self):
        try:
            import random
            import time
            
            # Add randomness to the prompt itself
            topic_categories = [
                "food and cooking, favorite dishes, restaurants",
                "weather, seasons, outdoor activities", 
                "hobbies, interests, free time activities",
                "travel, places visited, dream destinations",
                "family, friends, relationships",
                "work, studies, daily routines",
                "entertainment, movies, music, books",
                "holidays, festivals, celebrations",
                "sports, exercise, health",
                "pets, animals, nature"
            ]
            
            question_styles = [
                "Ask an interesting question about",
                "Start a conversation about", 
                "Make a comment or observation about",
                "Ask for their opinion on",
                "Ask about their experience with"
            ]
            
            selected_category = random.choice(topic_categories)
            selected_style = random.choice(question_styles)
            
            # Use current timestamp for additional randomness
            timestamp_seed = str(int(time.time() * 1000))[-4:]
            
            topic_prompt = f"""You are generating conversation starter #{timestamp_seed}. 
            {selected_style} {selected_category}.
            
            Create a unique, engaging conversation starter for a Chinese language learning student.
            Requirements:
            - Simple enough for beginners to intermediate learners
            - Culturally relevant and engaging  
            - Written in simplified Chinese characters
            - One question or statement to start a conversation
            - Make it different from typical examples
            - Be creative and varied
            
            Respond with ONLY the Chinese text, nothing else."""
            
            response = self.client.chat.completions.create(
                model=self.deployment_name,
                messages=[{"role": "user", "content": topic_prompt}],
                temperature=1.0,  # Increased temperature for more randomness
                max_tokens=100,
                seed=None  # Ensure no seed is set for maximum randomness
            )
            
            chinese_topic = response.choices[0].message.content.strip()
            english_translation = self._get_translation(chinese_topic)
            
            return {
                "topic": chinese_topic,
                "translation": english_translation
            }
            
        except Exception as e:
            print(f"Error getting random topic: {e}")
            # Even fallback should have some variety
            import random
            fallback_topics = [
                {"topic": "你今天做了什么有趣的事情？", "translation": "What interesting things did you do today?"},
                {"topic": "你最喜欢吃什么菜？", "translation": "What's your favorite dish?"},
                {"topic": "周末你通常做什么？", "translation": "What do you usually do on weekends?"},
                {"topic": "你觉得今天的天气怎么样？", "translation": "How do you think today's weather is?"},
                {"topic": "你有什么爱好吗？", "translation": "Do you have any hobbies?"}
            ]
            return random.choice(fallback_topics)

tutor = ChineseLanguageTutor()

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        conversation_history = data.get('conversation_history', [])
        
        if not user_message:
            return jsonify({"error": "Message is required"}), 400
        
        result = tutor.get_conversation_response(user_message, conversation_history)
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Chat endpoint error: {e}")
        return jsonify({
            "error": "An error occurred processing your message",
            "response": "抱歉，出现了错误。",
            "translation": "Sorry, an error occurred."
        }), 500

@app.route('/api/random-topic', methods=['GET'])
def random_topic():
    try:
        result = tutor.get_random_conversation_topic()
        return jsonify(result)
    except Exception as e:
        print(f"Random topic endpoint error: {e}")
        return jsonify({
            "error": "An error occurred getting a random topic",
            "topic": "我们聊聊今天的天气吧？",
            "translation": "How about we talk about today's weather?"
        }), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

if __name__ == '__main__':
    required_env_vars = [
        'AZURE_OPENAI_API_KEY',
        'AZURE_OPENAI_ENDPOINT'
    ]
    
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]
    if missing_vars:
        print(f"Missing required environment variables: {missing_vars}")
        print("Please set these environment variables:")
        print("export AZURE_OPENAI_API_KEY='your-api-key'")
        print("export AZURE_OPENAI_ENDPOINT='your-endpoint'")
        print("export AZURE_OPENAI_DEPLOYMENT_NAME='your-deployment-name'")
        print("export AZURE_OPENAI_API_VERSION='2024-02-01'")
        exit(1)
    
    print("Starting Chinese Language Learning App...")
    print("Open http://localhost:5000 in your browser")
    app.run(debug=True, host='0.0.0.0', port=5000)