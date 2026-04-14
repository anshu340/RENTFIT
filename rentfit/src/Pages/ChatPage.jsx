import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance'; 
import { chatService } from '../services/chatAxiosInstance.js';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import DashboardSidebar from '../Components/DashboardSidebar.jsx';
import StoreSidebar from '../Components/StoreSidebar.jsx';
import { FaPaperPlane, FaUserCircle, FaStore, FaClock } from 'react-icons/fa';

const ChatPage = () => {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [previousMsgCount, setPreviousMsgCount] = useState(0);

    // Fetch user info and conversations on mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Get current user role/id from token or profile endpoint if needed
                const profileRes = await axiosInstance.get('accounts/profile/'); // Adjust endpoint if needed
                setCurrentUser(profileRes.data);

                const convRes = await chatService.getConversations();
                setConversations(convRes.data || convRes);

                if (conversationId) {
                    const found = (convRes.data || convRes).find(c => c.id === parseInt(conversationId));
                    if (found) setActiveConversation(found);
                }
            } catch (error) {
                console.error("Error fetching chat data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [conversationId]);

    // Polling for messages
    useEffect(() => {
        if (!activeConversation) return;

        const fetchMessages = async () => {
            try {
                const res = await chatService.getMessages(activeConversation.id);
                setMessages(res.data || res);
            } catch (error) {
                console.error("Error fetching messages", error);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // 5s polling

        return () => clearInterval(interval);
    }, [activeConversation]);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (messages.length > previousMsgCount || previousMsgCount === 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            setPreviousMsgCount(messages.length);
        }
    }, [messages, previousMsgCount]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation) return;

        try {
            await chatService.sendMessage(activeConversation.id, newMessage);
            setNewMessage("");
            // Refresh immediately
            const res = await chatService.getMessages(activeConversation.id);
            setMessages(res.data || res);
        } catch (error) {
            console.error("Error sending message", error);
            if (error.response) {
                console.error("Backend error details:", error.response.data);
            }
        }
    };

    const handleSelectConversation = (conv) => {
        setActiveConversation(conv);
        navigate(`/chat/${conv.id}`);
    };

    const formatTime = (isoString) => {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getOtherParticipantName = (conv) => {
        // If I am customer, show store name. If I am store, show customer name.
        // Fallback logic if currentUser is not fully loaded yet:
        // We can't strictly know who "we" are without checking currentUser.id vs conv.customer/store
        // But from the serializer we have both names.

        // Simple heuristic: If the user is a Store, show customer_name.
        // We can check localStorage 'role'.
        const role = localStorage.getItem('role');
        return role === 'Store' ? (conv.customer_name || 'Customer') : (conv.store_name || 'Store');
    };

    const getOtherParticipantImage = (conv) => {
        const role = localStorage.getItem('role');
        return role === 'Store' ? conv.customer_image : conv.store_image;
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading chats...</div>;

    const role = localStorage.getItem('role');

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex flex-1">
                {role === 'Store' ? <StoreSidebar /> : <DashboardSidebar />}
                <main className="flex-1 pt-8 pb-12 px-4 min-w-0">
                    <div className="max-w-6xl mx-auto h-[80vh]">
                        <div className="grid grid-cols-1 md:grid-cols-4 bg-white rounded-2xl shadow-xl border border-gray-100 h-full overflow-hidden">

                        {/* Sidebar - Conversation List */}
                        <div className="col-span-1 border-r border-gray-100 flex flex-col bg-gray-50 min-h-0">
                            <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
                                <h2 className="font-bold text-gray-800 text-lg">Messages</h2>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {conversations.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500 text-sm">
                                        No conversations yet.
                                    </div>
                                ) : (
                                    conversations.map(conv => (
                                        <div
                                            key={conv.id}
                                            onClick={() => handleSelectConversation(conv)}
                                            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-white transition-colors ${activeConversation?.id === conv.id ? 'bg-white border-l-4 border-l-purple-600 shadow-sm' : ''}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 bg-purple-100 text-purple-600">
                                                    {getOtherParticipantImage(conv) ? (
                                                        <img src={getOtherParticipantImage(conv)} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        localStorage.getItem('role') === 'Store' ? <FaUserCircle size={20} /> : <FaStore size={20} />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-gray-800 truncate text-sm">
                                                        {getOtherParticipantName(conv)}
                                                    </h3>
                                                    {conv.last_message && (
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {conv.last_message.text}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="col-span-1 md:col-span-3 flex flex-col bg-white min-h-0">
                            {activeConversation ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shadow-sm z-10 flex-shrink-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 bg-purple-600 text-white">
                                                {getOtherParticipantImage(activeConversation) ? (
                                                    <img src={getOtherParticipantImage(activeConversation)} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    localStorage.getItem('role') === 'Store' ? <FaUserCircle size={20} /> : <FaStore size={20} />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800">
                                                    {getOtherParticipantName(activeConversation)}
                                                </h3>
                                                <span className="text-xs text-green-500 flex items-center gap-1">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                    Online
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Messages List */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                                        {messages.map((msg, idx) => {
                                            const isMe = msg.sender === currentUser?.id || (localStorage.getItem('role') === 'Store' && msg.sender_email === currentUser?.email) || (localStorage.getItem('role') === 'Customer' && msg.sender_email === currentUser?.email);
                                            // Fallback logic for isMe check if IDs get tricky: compare sender_name or rely on a "is_me" field if added
                                            // Here assuming we might need robust check. 
                                            // Let's rely on simple email check if currentUser loaded
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
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Input Area */}
                                    <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
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
            </main>
        </div>
            <Footer />
        </div>
    );
};

export default ChatPage;
