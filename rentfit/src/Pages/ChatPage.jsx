import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import chatAxiosInstance from '../services/chatAxiosInstance';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import DashboardSidebar from '../Components/DashboardSidebar';
import StoreSidebar from '../Components/StoreSidebar';
import { FaPaperPlane, FaUserCircle, FaStore, FaClock, FaCheck, FaCheckDouble, FaExclamationTriangle } from 'react-icons/fa';

const ChatPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [myRentals, setMyRentals] = useState([]);

    // 1. Fetch user info and conversations ONLY ONCE on mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const profileResponse = await axiosInstance.get('accounts/profile/');
                setCurrentUser(profileResponse.data);

                const convRes = await chatAxiosInstance.get('chat/my/');
                setConversations(convRes.data);

                // Fetch rentals to check for overdue items
                if (localStorage.getItem('role') === 'Customer') {
                    const rentalRes = await chatAxiosInstance.get('rentals/my/');
                    setMyRentals(Array.isArray(rentalRes.data) ? rentalRes.data : (rentalRes.data.results || []));
                }
            } catch (error) {
                console.error("Error fetching chat data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // 2. Sync Active Conversation with URL ID
    useEffect(() => {
        if (id && conversations.length > 0) {
            const found = conversations.find(c => c.id === parseInt(id));
            if (found) {
                setActiveConversation(found);
            }
        }
    }, [id, conversations]);

    // Polling for messages
    useEffect(() => {
        if (!activeConversation) return;

        const fetchMessages = async () => {
            try {
                const res = await chatAxiosInstance.get(`chat/${activeConversation.id}/`);
                setMessages(res.data);
            } catch (error) {
                console.error("Error fetching messages", error);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // 5s polling

        return () => clearInterval(interval);
    }, [activeConversation]);

    // 3. Container-only Scroll Fix (Prevents page jumping)
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Auto-scroll to bottom of the panel only
        container.scrollTop = container.scrollHeight;
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation) return;

        try {
            await chatAxiosInstance.post(`chat/${activeConversation.id}/send/`, {
                text: newMessage
            });
            setNewMessage("");
            const res = await chatAxiosInstance.get(`chat/${activeConversation.id}/`);
            setMessages(res.data);
        } catch (error) {
            console.error("Error sending message", error);
        }
    };

    const handleSelectConversation = (conv) => {
        navigate(`/chat/${conv.id}`);
    };

    const formatTime = (isoString) => {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getOtherUser = (conv) => {
        const role = localStorage.getItem('role');
        if (role === 'Store') {
            return {
                name: conv.customer_name || 'Customer',
                image: conv.customer_image
            };
        }
        return {
            name: conv.store_name || 'Store',
            image: conv.store_image
        };
    };

    const isConversationOverdue = (conv) => {
        if (!conv || localStorage.getItem('role') !== 'Customer') return false;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return myRentals.some(r =>
            r.store === conv.store &&
            ['rented', 'approved'].includes(r.status) &&
            new Date(r.rent_end_date) < today
        );
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading chats...</div>;

    return (
        <>
            <Navbar />
            <div className="flex min-h-screen bg-gray-50 text-gray-800">
                {localStorage.getItem('role') === 'Store' ? <StoreSidebar /> : <DashboardSidebar />}

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-h-screen" style={{ height: "calc(100vh - 120px)" }}>
                    <div className="max-w-6xl mx-auto px-4 w-full h-full">
                        <div className="chat-wrapper grid grid-cols-1 md:grid-cols-4 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-full">

                            {/* Sidebar - Conversation List */}
                            <div className="col-span-1 border-r border-gray-100 flex flex-col bg-gray-50 overflow-hidden">
                                <div className="p-4 border-b border-gray-200 bg-white">
                                    <h2 className="font-bold text-gray-800 text-lg">Messages</h2>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    {conversations.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500 text-sm">
                                            No conversations yet.
                                        </div>
                                    ) : (
                                        conversations.map(conv => {
                                            const other = getOtherUser(conv);
                                            return (
                                                <div
                                                    key={conv.id}
                                                    onClick={() => handleSelectConversation(conv)}
                                                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-white transition-colors ${activeConversation?.id === conv.id ? 'bg-white border-l-4 border-l-purple-600 shadow-sm' : ''}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 overflow-hidden">
                                                            {other.image ? (
                                                                <img src={other.image} alt={other.name} className="chat-avatar w-full h-full object-cover" />
                                                            ) : (
                                                                localStorage.getItem('role') === 'Store' ? <FaUserCircle size={24} /> : <FaStore size={24} />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-bold text-gray-800 truncate text-sm">
                                                                {other.name}
                                                            </h3>
                                                            {conv.last_message && (
                                                                <p className="text-xs text-gray-500 truncate">
                                                                    {conv.last_message.text}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Chat Area */}
                            <div className="col-span-1 md:col-span-3 flex flex-col bg-white overflow-hidden h-full">
                                {activeConversation ? (
                                    <>
                                        {/* Chat Header */}
                                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shadow-sm z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center overflow-hidden">
                                                    {getOtherUser(activeConversation).image ? (
                                                        <img src={getOtherUser(activeConversation).image} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        localStorage.getItem('role') === 'Store' ? <FaUserCircle /> : <FaStore />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800">
                                                        {getOtherUser(activeConversation).name}
                                                    </h3>
                                                    <span className="text-xs text-green-500 flex items-center gap-1">
                                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                        Online
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Overdue Warning Banner */}
                                        {isConversationOverdue(activeConversation) && (
                                            <div className="bg-red-600 border-b border-red-700 p-3 flex flex-wrap items-center justify-center gap-4 shadow-lg sticky top-0 z-20">
                                                <div className="flex items-center gap-2 text-white">
                                                    <FaExclamationTriangle className="text-white animate-bounce" size={18} />
                                                    <p className="text-sm font-black tracking-tight">
                                                        THIS RENTAL IS OVERDUE! Please return the item immediately to avoid additional penalties.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => navigate('/myrentals')}
                                                    className="bg-white text-red-600 px-4 py-1.5 rounded-lg font-black text-xs hover:bg-gray-50 transition shadow-md whitespace-nowrap"
                                                >
                                                    Return Now
                                                </button>
                                            </div>
                                        )}

                                        {/* Messages List - Container Only Scrolling */}
                                        <div ref={containerRef} className="messages flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                                            {messages.map((msg) => {
                                                const isMyMessage = currentUser ? msg.sender === currentUser.id : false;

                                                return (
                                                    <div key={msg.id} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${isMyMessage
                                                            ? 'bg-purple-600 text-white rounded-tr-none'
                                                            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                                            }`}>
                                                            <p className="text-sm leading-relaxed">{msg.text}</p>
                                                            <div className={`text-[10px] mt-2 flex items-center gap-1 ${isMyMessage ? 'text-purple-200 justify-end' : 'text-gray-400'}`}>
                                                                <FaClock size={10} />
                                                                {formatTime(msg.timestamp)}
                                                                {isMyMessage && (
                                                                    <span className="ml-1">
                                                                        {msg.is_read ? (
                                                                            <FaCheckDouble className="text-blue-300" title="Read" />
                                                                        ) : (
                                                                            <FaCheck className="text-purple-300" title="Sent" />
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Input Area */}
                                        <div className="p-4 bg-white border-t border-gray-100">
                                            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                                <input
                                                    type="text"
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    placeholder="Type your message..."
                                                    className="flex-1 px-6 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!newMessage.trim()}
                                                    className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors shadow-lg disabled:opacity-50 disabled:shadow-none"
                                                >
                                                    <FaPaperPlane />
                                                </button>
                                            </form>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                            <FaPaperPlane size={30} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-600 mb-2">Select a conversation</h3>
                                        <p className="max-w-md">Choose a chat from the sidebar to start messaging with store owners or customers.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />

        </>
    );
};

export default ChatPage;