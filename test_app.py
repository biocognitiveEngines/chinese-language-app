#!/usr/bin/env python3
"""
Test script for Chinese Language Learning App
Tests all API endpoints and various conversation scenarios
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:5000"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_test_header(test_name):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.BLUE}Testing: {test_name}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.ENDC}")

def print_success(message):
    print(f"{Colors.GREEN}✓ {message}{Colors.ENDC}")

def print_error(message):
    print(f"{Colors.RED}✗ {message}{Colors.ENDC}")

def print_info(message):
    print(f"{Colors.YELLOW}ℹ {message}{Colors.ENDC}")

def test_health_endpoint():
    """Test the health check endpoint"""
    print_test_header("Health Endpoint")
    
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        if response.status_code == 200:
            data = response.json()
            print_success(f"Health check passed: {data['status']}")
            print_info(f"Timestamp: {data['timestamp']}")
            return True
        else:
            print_error(f"Health check failed with status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Health check error: {e}")
        return False

def test_chat_endpoint():
    """Test the chat endpoint with various Chinese inputs"""
    print_test_header("Chat Endpoint")
    
    test_cases = [
        {
            "name": "Basic greeting",
            "message": "你好",
            "conversation_history": []
        },
        {
            "name": "Self introduction with error",
            "message": "我叫李明，我是学生的",
            "conversation_history": []
        },
        {
            "name": "Question about weather",
            "message": "今天天气怎么样？",
            "conversation_history": []
        },
        {
            "name": "Conversation with context",
            "message": "我喜欢吃中国菜",
            "conversation_history": [
                {"sender": "user", "message": "你好"},
                {"sender": "ai", "message": "你好！很高兴认识你。你学中文多久了？"}
            ]
        },
        {
            "name": "Grammar error test",
            "message": "我昨天去了商店买东西了",
            "conversation_history": []
        },
        {
            "name": "English interjection test",
            "message": "我想要一个 hamburger 和一些 coffee",
            "conversation_history": []
        },
        {
            "name": "Multiple English words interjection",
            "message": "I want to practice Chinese but sometimes I need help with words like computer and smartphone",
            "conversation_history": []
        }
    ]
    
    all_passed = True
    
    for test_case in test_cases:
        print(f"\n{Colors.BOLD}Test: {test_case['name']}{Colors.ENDC}")
        print(f"Input: {test_case['message']}")
        
        try:
            response = requests.post(
                f"{BASE_URL}/api/chat",
                json={
                    "message": test_case["message"],
                    "conversation_history": test_case["conversation_history"]
                },
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                print_success("Request successful")
                print(f"Response: {data.get('response', 'No response')[:100]}...")
                
                if 'translation' in data and data['translation']:
                    print(f"Translation: {data['translation'][:100]}...")
                
                if 'correction' in data and data['correction']:
                    correction = data['correction']
                    correction_type = correction.get('type', 'unknown')
                    
                    if correction_type == 'interjection_help':
                        print_info("English interjection help detected:")
                        if 'english_words' in correction:
                            print(f"  English words: {', '.join(correction['english_words'])}")
                        if 'translations' in correction:
                            print(f"  Chinese translations: {', '.join(correction['translations'])}")
                        if 'suggested_sentence' in correction:
                            print(f"  Suggested sentence: {correction['suggested_sentence']}")
                        print(f"  Explanation: {correction.get('explanation', '')[:100]}...")
                    else:
                        print_info("Grammar correction detected:")
                        print(f"  Original: {correction.get('original', '')}")
                        print(f"  Corrected: {correction.get('corrected', '')}")
                        print(f"  Explanation: {correction.get('explanation', '')[:100]}...")
            else:
                print_error(f"Request failed with status {response.status_code}")
                all_passed = False
                
        except Exception as e:
            print_error(f"Test failed: {e}")
            all_passed = False
        
        time.sleep(1)  # Rate limiting
    
    return all_passed

def test_error_handling():
    """Test error handling with invalid inputs"""
    print_test_header("Error Handling")
    
    test_cases = [
        {
            "name": "Empty message",
            "payload": {"message": "", "conversation_history": []},
            "expected_status": 400
        },
        {
            "name": "Missing message field",
            "payload": {"conversation_history": []},
            "expected_status": 400
        },
        {
            "name": "Invalid JSON",
            "payload": "invalid json",
            "expected_status": 400
        }
    ]
    
    all_passed = True
    
    for test_case in test_cases:
        print(f"\n{Colors.BOLD}Test: {test_case['name']}{Colors.ENDC}")
        
        try:
            if test_case["payload"] == "invalid json":
                response = requests.post(
                    f"{BASE_URL}/api/chat",
                    data=test_case["payload"],
                    headers={"Content-Type": "application/json"}
                )
            else:
                response = requests.post(
                    f"{BASE_URL}/api/chat",
                    json=test_case["payload"],
                    headers={"Content-Type": "application/json"}
                )
            
            if response.status_code == test_case["expected_status"]:
                print_success(f"Correctly returned status {response.status_code}")
            else:
                print_error(f"Expected status {test_case['expected_status']}, got {response.status_code}")
                all_passed = False
                
        except Exception as e:
            print_error(f"Test failed: {e}")
            all_passed = False
    
    return all_passed

def test_static_files():
    """Test static file serving"""
    print_test_header("Static Files")
    
    files_to_test = ["/", "/index.html", "/styles.css", "/app.js"]
    all_passed = True
    
    for file_path in files_to_test:
        try:
            response = requests.get(f"{BASE_URL}{file_path}")
            if response.status_code == 200:
                print_success(f"Successfully served: {file_path}")
            else:
                print_error(f"Failed to serve {file_path}: status {response.status_code}")
                all_passed = False
        except Exception as e:
            print_error(f"Error accessing {file_path}: {e}")
            all_passed = False
    
    return all_passed

def run_all_tests():
    """Run all tests and provide summary"""
    print(f"\n{Colors.BOLD}{Colors.YELLOW}Starting Chinese Language Learning App Tests{Colors.ENDC}")
    print(f"Testing server at: {BASE_URL}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = {
        "Health Check": test_health_endpoint(),
        "Static Files": test_static_files(),
        "Chat Functionality": test_chat_endpoint(),
        "Error Handling": test_error_handling()
    }
    
    # Summary
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.BLUE}Test Summary{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.ENDC}")
    
    total_tests = len(results)
    passed_tests = sum(1 for v in results.values() if v)
    
    for test_name, passed in results.items():
        status = f"{Colors.GREEN}PASSED{Colors.ENDC}" if passed else f"{Colors.RED}FAILED{Colors.ENDC}"
        print(f"{test_name}: {status}")
    
    print(f"\n{Colors.BOLD}Total: {passed_tests}/{total_tests} tests passed{Colors.ENDC}")
    
    if passed_tests == total_tests:
        print(f"{Colors.GREEN}{Colors.BOLD}✓ All tests passed successfully!{Colors.ENDC}")
    else:
        print(f"{Colors.RED}{Colors.BOLD}✗ Some tests failed. Please review the output above.{Colors.ENDC}")
    
    return passed_tests == total_tests

if __name__ == "__main__":
    # Check if server is running
    print_info("Checking if server is running...")
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=2)
        print_success("Server is running!")
    except:
        print_error("Server is not running. Please start the Flask app first:")
        print("  python app.py")
        exit(1)
    
    # Run tests
    success = run_all_tests()
    exit(0 if success else 1)