import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import './ChatBot.scss';
import { MessageOutlined, UserOutlined, RobotOutlined, ShoppingOutlined, CustomerServiceOutlined, QuestionCircleOutlined, SendOutlined, CloseOutlined, CheckCircleOutlined, HeartOutlined, GiftOutlined } from '@ant-design/icons';
import productService, { getImageUrl } from '../../services/productService';

// Function to convert markdown to HTML
const convertMarkdownToHTML = (text) => {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
        .replace(/\n/g, '<br>'); // Line breaks
};

// API URL configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const { user } = useAuth();
    const [suggestedProducts, setSuggestedProducts] = useState([]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
        setSuggestedProducts([]);

        try {
            const response = await axios.post(`${API_URL}/api/chatbot/ask`, {
                message: newMessage.content
            }, {
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && response.data.reply) {
                const botMessage = {
                    content: response.data.reply,
                    sender: 'bot',
                    timestamp: new Date().toISOString()
                };
                setMessages(prev => [...prev, botMessage]);

                // Nếu có sản phẩm gợi ý, set vào state
                if (response.data.products && Array.isArray(response.data.products)) {
                    setSuggestedProducts(response.data.products);
                } else {
                    setSuggestedProducts([]);
                }
            } else {
                throw new Error('Không nhận được phản hồi từ chatbot.');
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

    return (
        <div className="chatbot-container">
            {!isOpen && (
                <button
                    className="chat-button"
                    onClick={() => setIsOpen(true)}
                >
                    <CustomerServiceOutlined style={{ fontSize: 28 }} />
                </button>
            )}

            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <h3><RobotOutlined style={{ marginRight: 8, fontSize: 22 }} />Trợ lý chăm sóc da</h3>
                        {user && (
                            <div className="user-info">
                                <UserOutlined style={{ marginRight: 4 }} />Xin chào, {user.username}
                            </div>
                        )}
                        <button
                            className="close-button"
                            onClick={handleClose}
                        >
                            <CloseOutlined />
                        </button>
                    </div>

                    <div className="chat-messages">
                        {messages.length === 0 && !error && !isLoading && (
                            <div className="welcome-message">
                                <h4><CheckCircleOutlined style={{ color: 'var(--cocoon-gold)', marginRight: 6 }} />Xin chào! Tôi là trợ lý chăm sóc da của bạn.</h4>
                                <p><HeartOutlined style={{ color: 'var(--cocoon-gold)', marginRight: 6 }} />Tôi có thể giúp bạn với các vấn đề:</p>
                                <ul>
                                    <li><CheckCircleOutlined style={{ color: 'var(--cocoon-gold)', marginRight: 4 }} />Phân tích và tư vấn loại da</li>
                                    <li><CheckCircleOutlined style={{ color: 'var(--cocoon-gold)', marginRight: 4 }} />Gợi ý sản phẩm phù hợp</li>
                                    <li><CheckCircleOutlined style={{ color: 'var(--cocoon-gold)', marginRight: 4 }} />Hướng dẫn quy trình skincare</li>
                                    <li><CheckCircleOutlined style={{ color: 'var(--cocoon-gold)', marginRight: 4 }} />Giải đáp về thành phần mỹ phẩm</li>
                                    <li><CheckCircleOutlined style={{ color: 'var(--cocoon-gold)', marginRight: 4 }} />Xử lý các vấn đề về da</li>
                                </ul>
                                <div className="suggested-questions">
                                    <p><QuestionCircleOutlined style={{ color: 'var(--cocoon-gold)', marginRight: 4 }} />Bạn có thể hỏi những câu như:</p>
                                    <button
                                        onClick={() => {
                                            setInputMessage("Làm sao để xác định loại da của tôi?");
                                            handleSendMessage({ preventDefault: () => { } });
                                        }}
                                        className="question-suggestion"
                                    >
                                        <QuestionCircleOutlined style={{ marginRight: 6 }} />Làm sao để xác định loại da của tôi?
                                    </button>
                                    <button
                                        onClick={() => {
                                            setInputMessage("Quy trình chăm sóc da cơ bản buổi tối?");
                                            handleSendMessage({ preventDefault: () => { } });
                                        }}
                                        className="question-suggestion"
                                    >
                                        <QuestionCircleOutlined style={{ marginRight: 6 }} />Quy trình chăm sóc da cơ bản buổi tối?
                                    </button>
                                    <button
                                        onClick={() => {
                                            setInputMessage("Thành phần nào tốt cho da mụn?");
                                            handleSendMessage({ preventDefault: () => { } });
                                        }}
                                        className="question-suggestion"
                                    >
                                        <QuestionCircleOutlined style={{ marginRight: 6 }} />Thành phần nào tốt cho da mụn?
                                    </button>
                                    <button
                                        onClick={() => {
                                            setInputMessage("Cách chọn kem chống nắng phù hợp?");
                                            handleSendMessage({ preventDefault: () => { } });
                                        }}
                                        className="question-suggestion"
                                    >
                                        <QuestionCircleOutlined style={{ marginRight: 6 }} />Cách chọn kem chống nắng phù hợp?
                                    </button>
                                </div>
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
                                <div className="message-avatar">
                                    {message.sender === 'user' ? (
                                        <UserOutlined style={{ fontSize: 22, color: '#2980b9' }} />
                                    ) : (
                                        <RobotOutlined style={{ fontSize: 22, color: '#16a085' }} />
                                    )}
                                </div>
                                <div className="message-bubble">
                                    <div
                                        className="message-content"
                                        dangerouslySetInnerHTML={{
                                            __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                        }}
                                        style={{
                                            maxHeight: 'none',
                                            overflow: 'visible',
                                            wordBreak: 'break-word'
                                        }}
                                    />
                                    <div className="message-time">{new Date(message.timestamp).toLocaleTimeString()}</div>
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
                        {suggestedProducts.length > 0 && (
                            <div className="suggested-products">
                                <strong><ShoppingOutlined style={{ color: 'var(--cocoon-gold)', marginRight: 4 }} />Sản phẩm gợi ý:</strong>
                                <div className="suggested-product-list">
                                    {suggestedProducts.map((prod, idx) => (
                                        <div className="suggested-product-card" key={idx}>
                                            {prod.mainImageId && (
                                                <img
                                                    src={prod.mainImageId.toString().length === 24 ? `${API_URL}/api/media/${prod.mainImageId}` : prod.mainImageId}
                                                    alt={prod.name}
                                                    className="suggested-product-img"
                                                />
                                            )}
                                            <div className="suggested-product-info">
                                                <div className="suggested-product-name">{prod.name}</div>
                                                {prod.shortDescription && <div className="suggested-product-desc">{prod.shortDescription}</div>}
                                                <a href={prod.url} target="_blank" rel="noopener noreferrer" className="suggested-product-link">
                                                    Xem chi tiết
                                                </a>
                                            </div>
                                        </div>
                                    ))}
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
                            <SendOutlined />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatBot; 