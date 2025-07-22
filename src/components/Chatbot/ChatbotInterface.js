import React, { useState, useEffect, useRef } from 'react';
import './ChatbotInterface.css';
import { 
  MdSend, 
  MdSmartToy,
  MdPerson,
  MdOutlineApi,
  MdError,
  MdAssistant
} from 'react-icons/md';

const ChatbotInterface = () => {
  // Configure Gemini API details here - updated API endpoint
  const GEMINI_API_KEY = 'AIzaSyCDGVc1IiJDSNeIcnI-xAK1gMN9u6dI6wo';
  // Updated to correct endpoint format
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent?key=${GEMINI_API_KEY}`;
  
  const [messages, setMessages] = useState([
    { role: 'model', parts: [{ text: 'Welcome to the SphereNex Agriculture AI Assistant. How can I help you today?' }] }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Convert messages to Gemini format for API request
  const formatMessagesForGemini = (messageHistory) => {
    const systemPrompt = "You are an agricultural assistant specialized in crop management, pest control, irrigation, soil health, and sustainable farming practices. You provide helpful, accurate information to farmers in clear, actionable terms. You offer advice specific to the Indian agricultural context, including information about crops suitable for different regions in India, local farming practices, and solutions to common agricultural challenges in the country.";
    
    // Format for Gemini API
    const contents = [];
    
    // Add system prompt
    contents.push({
      role: "user",
      parts: [{ text: systemPrompt }]
    });
    
    // Add conversation history (skip the welcome message)
    messageHistory.forEach((msg, index) => {
      if (index === 0) return; // Skip welcome message
      
      const role = msg.role === 'user' ? 'user' : 'model';
      const text = msg.parts ? msg.parts[0].text : msg.content;
      
      contents.push({
        role: role,
        parts: [{ text: text }]
      });
    });
    
    return contents;
  };

  // Function to handle sending message to Gemini API
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // Add user message to chat
    const userMessage = { role: 'user', parts: [{ text: inputMessage }] };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);
    
    try {
      // Format messages for Gemini API
      const contents = formatMessagesForGemini([...messages, userMessage]);
      
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
            topP: 0.95,
            topK: 40
          }
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Error communicating with Gemini AI');
      }
      
      // Handle Gemini response format
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const modelResponse = {
          role: 'model',
          parts: data.candidates[0].content.parts
        };
        setMessages(prev => [...prev, modelResponse]);
      } else {
        throw new Error('Unexpected response format from Gemini AI');
      }
    } catch (err) {
      console.error('Error calling Gemini API:', err);
      setError(err.message || 'Error communicating with the AI service');
      
      // If there's an API error, fall back to a simple response
      const fallbackResponse = {
        role: 'model',
        parts: [{ text: "I'm sorry, I couldn't process your request due to a technical issue. As your agricultural assistant, I'd be happy to help with your farming questions once the connection is restored. Please try again later or ask a different question." }]
      };
      
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Get message content accounting for different formats
  const getMessageContent = (message) => {
    if (message.content) {
      return message.content;
    } else if (message.parts && message.parts.length > 0) {
      return message.parts[0].text;
    }
    return '';
  };

  // Check if message is from user
  const isUserMessage = (message) => {
    return message.role === 'user';
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="chatbot-title">
          <MdAssistant className="chatbot-icon" />
          <h2>SphereNex Agriculture AI Assistant</h2>
        </div>
        <div className="api-status">
          <span className="api-active"><MdOutlineApi /> Gemini AI Connected</span>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${isUserMessage(message) ? 'user-message' : 'ai-message'}`}
          >
            <div className="message-avatar">
              {isUserMessage(message) ? (
                <MdPerson className="avatar-icon user-icon" />
              ) : (
                <MdSmartToy className="avatar-icon ai-icon" />
              )}
            </div>
            <div className="message-content">
              {getMessageContent(message)}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message ai-message">
            <div className="message-avatar">
              <MdSmartToy className="avatar-icon ai-icon" />
            </div>
            <div className="message-content typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="message-input-container">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask anything about agriculture, farming or crops..."
          className="message-input"
          rows={1}
          disabled={isLoading}
        />
        <button 
          className="send-button" 
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
        >
          <MdSend />
        </button>
      </div>
      
      {error && (
        <div className="error-banner">
          <MdError className="error-icon" /> {error}
        </div>
      )}
    </div>
  );
};

export default ChatbotInterface;