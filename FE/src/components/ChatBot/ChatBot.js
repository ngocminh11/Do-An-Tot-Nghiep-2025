import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import './ChatBot.scss';

// API URL configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatId, setChatId] = useState(null);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const { user } = useAuth();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && !chatId) {
            startChat();
        }
    }, [isOpen, chatId]);

    const startChat = async () => {
        try {
            setError(null);
            setIsLoading(true);
            console.log('Starting chat with API:', `${API_URL}/api/chat/start`);
            const response = await axios.get(`${API_URL}/api/chat/start`, {
                timeout: 5000 // 5 seconds timeout
            });

            if (response.data.success) {
                setChatId(response.data.data.chatId);
                setMessages([{
                    content: response.data.data.message,
                    sender: 'bot',
                    timestamp: new Date().toISOString()
                }]);
            } else {
                throw new Error(response.data.error || 'Failed to start chat');
            }
        } catch (error) {
            console.error('Error starting chat:', error);
            let errorMessage = 'Không thể kết nối với chat. Vui lòng thử lại sau.';

            if (error.code === 'ECONNABORTED') {
                errorMessage = 'Kết nối quá thời gian. Vui lòng kiểm tra lại kết nối mạng.';
            } else if (error.response) {
                errorMessage = error.response.data.error || errorMessage;
            }

            setError(errorMessage);
            setMessages([{
                content: 'Xin lỗi, có lỗi xảy ra khi khởi tạo chat. Vui lòng thử lại sau.',
                sender: 'bot',
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || isLoading) return;

        const newMessage = {
            content: inputMessage,
            sender: 'user',
            timestamp: new Date().toISOString(),
            user: user ? {
                id: user.id,
                username: user.username
            } : null
        };

        setMessages(prev => [...prev, newMessage]);
        setInputMessage('');
        setIsLoading(true);
        setError(null);

        try {
            console.log('Sending message to API:', `${API_URL}/api/chat/send`);
            const response = await axios.post(`${API_URL}/api/chat/send`, {
                message: inputMessage,
                chatId: chatId
            }, {
                timeout: 5000, // 5 seconds timeout
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                const botMessage = {
                    content: response.data.data.message,
                    sender: 'bot',
                    timestamp: new Date().toISOString()
                };
                setMessages(prev => [...prev, botMessage]);
            } else {
                throw new Error(response.data.error || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            let errorMessage = 'Không thể gửi tin nhắn. Vui lòng thử lại sau.';

            if (error.code === 'ECONNABORTED') {
                errorMessage = 'Kết nối quá thời gian. Vui lòng kiểm tra lại kết nối mạng.';
            } else if (error.response) {
                errorMessage = error.response.data.error || errorMessage;
            }

            setError(errorMessage);
            const errorMessageObj = {
                content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
                sender: 'bot',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessageObj]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        setChatId(null);
        setMessages([]);
        setError(null);
        setInputMessage('');
    };

    return (
        <div className="chatbot-container">
            {!isOpen && (
                <button
                    className="chat-button"
                    onClick={() => setIsOpen(true)}
                >
                    <i className="fas fa-comments"></i>
                </button>
            )}

            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <h3>Trợ lý chăm sóc da</h3>
                        {user && (
                            <div className="user-info">
                                Xin chào, {user.username}
                            </div>
                        )}
                        <button
                            className="close-button"
                            onClick={handleClose}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    <div className="chat-messages">
                        {messages.length === 0 && !error && !isLoading && (
                            <div className="welcome-message">
                                Xin chào! Tôi là trợ lý chăm sóc da của bạn. Tôi có thể giúp bạn:
                                <ul>
                                    <li>Tư vấn về các loại da</li>
                                    <li>Hướng dẫn quy trình chăm sóc da</li>
                                    <li>Giải thích về các sản phẩm và thành phần</li>
                                    <li>Giải đáp các vấn đề về da</li>
                                </ul>
                                Bạn có thể hỏi tôi bất cứ điều gì về chăm sóc da!
                            </div>
                        )}
                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`message ${message.sender}`}
                            >
                                {message.sender === 'user' && message.user && (
                                    <div className="message-user">
                                        {message.user.username}
                                    </div>
                                )}
                                <div className="message-content">
                                    {message.content}
                                </div>
                                <div className="message-time">
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message bot">
                                <div className="message-content">
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="chat-input">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Nhập tin nhắn của bạn..."
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !inputMessage.trim()}
                            className={isLoading || !inputMessage.trim() ? 'disabled' : ''}
                        >
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatBot; 