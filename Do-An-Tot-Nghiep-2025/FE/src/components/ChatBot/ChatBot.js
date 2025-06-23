import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import './ChatBot.scss';
import { v4 as uuidv4 } from 'uuid';
import { UserOutlined, RobotOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

// API URL configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const { user } = useAuth();

    // Các câu hỏi gợi ý phổ biến
    const suggestions = [
        'Da dầu nên dùng sản phẩm nào?',
        'Quy trình skincare cơ bản gồm những bước gì?',
        'Serum Vitamin C của CoCoo có tác dụng gì?',
        'Cách trị mụn hiệu quả?',
        'Kem chống nắng nào phù hợp cho da nhạy cảm?',
        'Da khô nên chăm sóc như thế nào?',
        'Có nên dùng toner mỗi ngày không?',
        'Sản phẩm nào giúp làm sáng da?',
        'Cách phân biệt các loại da?',
        'Thứ tự dùng serum và kem dưỡng?'
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen) {
            let storedSessionId = localStorage.getItem('chatbot_sessionId');
            if (!storedSessionId) {
                storedSessionId = uuidv4();
                localStorage.setItem('chatbot_sessionId', storedSessionId);
            }
            setSessionId(storedSessionId);
            fetchHistory(storedSessionId);
        }
    }, [isOpen]);

    const fetchHistory = async (sid) => {
        try {
            setIsLoading(true);
            setError(null);
            const res = await axios.get(`${API_URL}/api/chatbot/history/${sid}`);
            if (res.data && res.data.messages) {
                setMessages(res.data.messages.map(m => ({
                    content: m.content,
                    sender: m.role === 'user' ? 'user' : 'bot',
                    timestamp: m.timestamp || new Date().toISOString()
                })));
            } else {
                setMessages([]);
            }
        } catch (err) {
            setMessages([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Gửi nhanh từ suggestion
    const handleSuggestionClick = (text) => {
        setInputMessage(text);
        setTimeout(() => {
            document.getElementById('chatbot-input-box')?.focus();
            // Gửi luôn nếu muốn tự động gửi
            handleSendMessage({ preventDefault: () => { } }, text);
        }, 100);
    };

    // Sửa handleSendMessage để nhận text tuỳ chọn
    const handleSendMessage = async (e, customText) => {
        e.preventDefault();
        const msg = customText !== undefined ? customText : inputMessage;
        if (!msg.trim() || isLoading) return;

        const newMessage = {
            content: msg,
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
            const response = await axios.post(`${API_URL}/api/chatbot/send`, {
                message: msg,
                sessionId: sessionId
            }, {
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && response.data.response) {
                const botMessage = {
                    content: response.data.response,
                    sender: 'bot',
                    timestamp: new Date().toISOString()
                };
                setMessages(prev => [...prev, botMessage]);
            } else {
                throw new Error('Không nhận được phản hồi từ chatbot');
            }
        } catch (error) {
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
        setMessages([]);
        setError(null);
        setInputMessage('');
    };

    // Hàm xóa lịch sử trò chuyện
    const handleDeleteHistory = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await axios.delete(`${API_URL}/api/chatbot/history`);
            setMessages([]);
            // Tạo sessionId mới để không load lại lịch sử cũ
            const newSessionId = uuidv4();
            setSessionId(newSessionId);
            localStorage.setItem('chatbot_sessionId', newSessionId);
        } catch (err) {
            setError('Không thể xóa lịch sử. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chatbot-container">
            {!isOpen && (
                <button
                    className="chat-button"
                    onClick={() => setIsOpen(true)}
                    aria-label="Mở chat bot"
                >
                    <i className="fas fa-comments"></i>
                </button>
            )}

            {isOpen && (
                <div className="chat-window animate__animated animate__fadeInUp">
                    <div className="chat-header">
                        <div className="bot-info">
                            <span className="bot-avatar">
                                <RobotOutlined style={{ fontSize: 28, color: '#1976d2' }} />
                            </span>
                            <span className="bot-name">CoCoo AI - Trợ lý chăm sóc da</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <Tooltip title="Xóa lịch sử trò chuyện" placement="bottom">
                                <button
                                    className="delete-history-button"
                                    onClick={handleDeleteHistory}
                                    aria-label="Xóa lịch sử trò chuyện"
                                    disabled={isLoading || messages.length === 0}
                                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 22 }}
                                >
                                    <DeleteOutlined />
                                </button>
                            </Tooltip>
                            <button
                                className="close-button"
                                onClick={handleClose}
                                aria-label="Đóng chat bot"
                            >
                                <CloseOutlined style={{ fontSize: 22 }} />
                            </button>
                        </div>
                    </div>
                    <div className="chat-messages">
                        {messages.length === 0 && !error && !isLoading && (
                            <div className="welcome-message">
                                <b>Xin chào! Tôi là trợ lý chăm sóc da CoCoo AI.</b>
                                <ul>
                                    <li>Tư vấn về các loại da</li>
                                    <li>Hướng dẫn quy trình chăm sóc da</li>
                                    <li>Giải thích về các sản phẩm và thành phần</li>
                                    <li>Giải đáp các vấn đề về da</li>
                                </ul>
                                <span style={{ color: '#1976d2' }}>Bạn có thể hỏi tôi bất cứ điều gì về chăm sóc da!</span>
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
                                        <UserOutlined style={{ marginRight: 4 }} />
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
                    {/* Dải câu hỏi gợi ý */}
                    <div className="chat-suggestions">
                        {suggestions.map((s, idx) => (
                            <button
                                key={idx}
                                className="suggestion-btn"
                                onClick={() => handleSuggestionClick(s)}
                                disabled={isLoading}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    <form onSubmit={handleSendMessage} className="chat-input">
                        <input
                            id="chatbot-input-box"
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Nhập tin nhắn của bạn..."
                            disabled={isLoading}
                            className="chat-input-box"
                        />
                        <Tooltip title="Gửi" placement="top">
                            <button
                                type="submit"
                                disabled={isLoading || !inputMessage.trim()}
                                className={isLoading || !inputMessage.trim() ? 'disabled' : 'send-btn'}
                                aria-label="Gửi tin nhắn"
                                style={{ position: 'relative', transition: 'all 0.2s' }}
                            >
                                <span className="send-icon-anim">
                                    <i className="fas fa-paper-plane"></i>
                                </span>
                            </button>
                        </Tooltip>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatBot; 