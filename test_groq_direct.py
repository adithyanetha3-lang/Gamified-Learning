#!/usr/bin/env python3
"""Test Groq API directly to verify the key works"""

import requests
import json

API_KEY = "YOUR_GROQ_API_KEY_HERE"  # Replace with your actual key
API_URL = "https://api.groq.com/openai/v1/chat/completions"

print("🧪 Testing Groq API Key Directly...\n")

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

payload = {
    "model": "llama-3.3-70b-versatile",
    "messages": [
        {
            "role": "system",
            "content": "You are a chemistry teacher."
        },
        {
            "role": "user",
            "content": "Explain coordination compounds in 2 sentences."
        }
    ],
    "temperature": 0.7,
    "max_tokens": 100
}

try:
    print("📡 Calling Groq API...")
    response = requests.post(API_URL, headers=headers, json=payload, timeout=10)
    
    print(f"📊 Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        content = data['choices'][0]['message']['content']
        print("\n✅ API KEY WORKS!")
        print(f"📝 Response: {content}\n")
        print("🎯 Conclusion: Groq API key is VALID and working!")
    else:
        print(f"\n❌ API Error: {response.status_code}")
        print(f"Response: {response.text}")
        print("\n🎯 Conclusion: API key might be invalid or rate limited")
        
except Exception as e:
    print(f"\n❌ Error: {e}")
    print("\n🎯 Conclusion: Network issue or API key problem")
