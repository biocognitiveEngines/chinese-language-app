#!/usr/bin/env python3
"""Direct test of Azure OpenAI connection"""

import os
from dotenv import load_dotenv
import openai

# Load environment variables
load_dotenv()

print("Testing Azure OpenAI connection...")
print("-" * 50)

# Create client
try:
    client = openai.AzureOpenAI(
        api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-01"),
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
    )
    print("✓ Client created successfully")
    
    deployment_name = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4")
    print(f"✓ Using deployment: {deployment_name}")
    
    # Test simple completion
    print("\nTesting chat completion...")
    response = client.chat.completions.create(
        model=deployment_name,
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Say 'Hello World' in Chinese"}
        ],
        temperature=0.7,
        max_tokens=100
    )
    
    print(f"✓ Response received: {response.choices[0].message.content}")
    
except Exception as e:
    print(f"✗ Error: {e}")
    print(f"  Error type: {type(e).__name__}")
    import traceback
    traceback.print_exc()

print("-" * 50)
print("Test complete!")