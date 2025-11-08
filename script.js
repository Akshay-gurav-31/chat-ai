// Gemini API configuration
const GEMINI_API_KEY = 'AIzaSyDuKp55evDPdgH7AvJ9Mjks5rCP1AkHQqA';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const messagesContainer = document.getElementById('messagesContainer');
const clearChatBtn = document.getElementById('clearChatBtn');

// Store conversation history
let conversationHistory = [];

// Theme Toggle
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const icon = themeToggle.querySelector('.fa-moon, .fa-sun');
    const text = themeToggle.querySelector('span');
    
    if (document.body.classList.contains('dark-mode')) {
        icon.classList.replace('fa-moon', 'fa-sun');
        text.textContent = 'Light Mode';
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
        text.textContent = 'Dark Mode';
    }
});

// Clear Chat Functionality
clearChatBtn.addEventListener('click', () => {
    // Clear conversation history
    conversationHistory = [];
    
    // Clear all messages
    messagesContainer.innerHTML = '';
    
    // Add a new welcome message
    addMessage("Hello! I'm Chat Bot, your professional assistant. How can I help you today?", 'assistant');
});

// Auto-resize textarea
messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Send message function
async function sendMessage() {
    const message = messageInput.value.trim();
    if (message === '') return;
    
    // Add user message
    addMessage(message, 'user');
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Disable send button while processing
    sendButton.disabled = true;
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Add user message to conversation history
        conversationHistory.push({
            role: "user",
            parts: [{ text: message }]
        });
        
        // Get response from Gemini API
        const response = await getGeminiResponse(conversationHistory);
        
        // Add assistant message to conversation history
        conversationHistory.push({
            role: "model",
            parts: [{ text: response }]
        });
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add AI response
        addMessage(response, 'assistant');
    } catch (error) {
        // Remove typing indicator
        removeTypingIndicator();
        
        // Show error message
        addMessage("Sorry, I encountered an error. Please try again.", 'assistant');
        console.error("Error:", error);
    }
    
    // Re-enable send button
    sendButton.disabled = false;
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Get response from Gemini API
async function getGeminiResponse(history) {
    const lastMessage = history[history.length - 1].parts[0].text.toLowerCase();
    
    // Check for specific questions about identity
    if (lastMessage.includes('who are you') || 
        lastMessage.includes('who developed you') || 
        lastMessage.includes('who created you') ||
        lastMessage.includes('kon hain') ||
        lastMessage.includes('kaun ho') ||
        lastMessage.includes('developer')) {
        
        // Special responses for identity questions
        if (lastMessage.includes('who developed you') || 
            lastMessage.includes('who created you') ||
            lastMessage.includes('developer')) {
                    return "I am Chat Bot, an AI assistant developed by Akshay Gurav. I'm here to help you with your queries!";
                } else {
                    return "I am Chat Bot, your AI assistant. I'm here to help you with your queries and tasks. How can I assist you today?";
                }
            }
            
            // For all other queries, use the Gemini API
            const requestBody = {
                contents: history,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000
                }
            };
            
            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.candidates && data.candidates.length > 0) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error("No response from AI");
            }
        }

// Add message to chat
function addMessage(content, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    
    const avatar = document.createElement('div');
    avatar.classList.add('avatar');
    avatar.textContent = sender === 'user' ? 'U' : 'B';
    
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    
    // Format the content to support basic markdown
    const formattedContent = formatMessageContent(content);
    messageContent.innerHTML = formattedContent;
    
    messageElement.appendChild(avatar);
    messageElement.appendChild(messageContent);
    
    messagesContainer.appendChild(messageElement);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Format message content to support basic markdown
function formatMessageContent(content) {
    // Convert markdown bold (**text** or __text__) to HTML bold
    let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Convert markdown italic (*text* or _text_) to HTML italic
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Convert line breaks to <br> tags
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
}

// Show typing indicator
function showTypingIndicator() {
    const typingElement = document.createElement('div');
    typingElement.classList.add('message', 'assistant');
    typingElement.id = 'typingIndicator';
    
    const avatar = document.createElement('div');
    avatar.classList.add('avatar');
    avatar.textContent = 'B';
    
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content', 'typing-indicator');
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.classList.add('typing-dot');
        messageContent.appendChild(dot);
    }
    
    typingElement.appendChild(avatar);
    typingElement.appendChild(messageContent);
    
    messagesContainer.appendChild(typingElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Event Listeners
sendButton.addEventListener('click', sendMessage);

messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Initialize with dark mode off
document.body.classList.remove('dark-mode');

// Add welcome message when page loads
window.addEventListener('DOMContentLoaded', () => {
    addMessage("Hello! I'm Chat Bot, your professional assistant. How can I help you today?", 'assistant');
    
    // Set initial viewport height
    setViewportProperty();
});

// Set viewport height property to handle mobile browser issues
function setViewportProperty() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Handle viewport resize events for mobile browsers
window.addEventListener('resize', () => {
    setViewportProperty();
});

// Handle orientation change for mobile devices
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        setViewportProperty();
        // Scroll to bottom when orientation changes
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 300);
});

// Handle focus events for input area
messageInput.addEventListener('focus', () => {
    // Small delay to ensure keyboard is up
    setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 300);
});

// Handle blur events for input area
messageInput.addEventListener('blur', () => {
    // Small delay to ensure keyboard is down
    setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 300);
});
