import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../utils/adminApi";
import "./AIAssistant.css";

const greeting = { id: 1, sender: "ai", text: "Hello! 👋 I am your Smart City Assistant. How can I help you today?" };
const AIAssistant = () => {
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const requestRef = useRef(null);
    const inFlightRef = useRef(false);
    const nextId = useRef(2);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [connection, setConnection] = useState("Ready to help");
    const [messages, setMessages] = useState([greeting]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView?.({ behavior: "smooth" });
    }, [messages, loading]);
    useEffect(() => () => requestRef.current?.abort(), []);

    const sendMessage = async (customMessage = null) => {
        if (inFlightRef.current) return;
        const finalMessage = (typeof customMessage === "string" ? customMessage : message).trim();
        if (!finalMessage || finalMessage.length > 2000) return;
        const token = localStorage.getItem("smartCityToken");
        let user;
        try { user = JSON.parse(localStorage.getItem("smartCityUser") || "null"); } catch { user = null; }
        if (!token || !user) { navigate("/login", { replace: true }); return; }

        inFlightRef.current = true;
        setMessages(previous => [...previous, { id: nextId.current++, sender: "user", text: finalMessage }]);
        setMessage(""); setLoading(true); setConnection("Replying...");
        const controller = new AbortController();
        requestRef.current = controller;
        const timeout = setTimeout(() => controller.abort(), 30000);
        try {
            const response = await fetch(`${API_URL}/api/ai/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ message: finalMessage }),
                signal: controller.signal
            });
            if (response.status === 401) {
                localStorage.removeItem("smartCityToken"); localStorage.removeItem("smartCityUser");
                navigate("/login", { replace: true }); return;
            }
            let data;
            try { data = await response.json(); } catch { throw new Error("The assistant returned an unreadable response. Please try again."); }
            if (!response.ok || !data.success || typeof data.reply !== "string" || !data.reply.trim()) {
                throw new Error(data.message || "The assistant is temporarily unavailable. Please try again.");
            }
            setMessages(previous => [...previous, { id: nextId.current++, sender: "ai", text: data.reply }]);
            setConnection("Ready to help");
        } catch (error) {
            setConnection("Connection problem · You can retry");
            const text = error.name === "AbortError"
                ? "The assistant took too long to reply. Please try your question again."
                : error instanceof TypeError
                    ? "Unable to connect to the assistant. Check your connection and try again. If you are using a preview link, try the main website."
                    : error.message || "Unable to get a reply. Please try again.";
            setMessages(previous => [...previous, { id: nextId.current++, sender: "ai", text }]);
            setMessage(current => current || finalMessage);
        } finally {
            clearTimeout(timeout); requestRef.current = null; inFlightRef.current = false; setLoading(false);
        }
    };
    const handleKeyDown = event => {
        if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent?.isComposing) {
            event.preventDefault(); sendMessage();
        }
    };
    const quickQuestions = [
        "What city services are available?", "How can I apply for a service?",
        "How can I track my application?", "How can I submit a complaint?",
        "How can I make a payment?", "What can I do with digital documents?"
    ];
    const clearChat = () => { if (!inFlightRef.current) { setMessages([greeting]); setMessage(""); setConnection("Ready to help"); } };
    const handleLogout = () => {
        requestRef.current?.abort();
        ["smartCityUser", "smartCityToken", "user", "token"].forEach(key => localStorage.removeItem(key));
        navigate("/login", { replace: true });
    };

    return (

        <div className="ai-page">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="ai-sidebar">

                <div className="ai-logo">

                    <div className="ai-logo-icon">
                        SC
                    </div>

                    <div>

                        <strong>
                            Smart City
                        </strong>

                        <span>
                            Citizen Portal
                        </span>

                    </div>

                </div>


                <nav className="ai-menu">

                    <button
                        onClick={() =>
                            navigate(
                                "/dashboard"
                            )
                        }
                    >
                        🏠 Dashboard
                    </button>


                    <button
                        onClick={() =>
                            navigate(
                                "/city-services"
                            )
                        }
                    >
                        🏙️ City Services
                    </button>


                    <button
                        onClick={() =>
                            navigate(
                                "/my-applications"
                            )
                        }
                    >
                        📋 My Applications
                    </button>


                    <button
                        onClick={() =>
                            navigate(
                                "/my-complaints"
                            )
                        }
                    >
                        📢 My Complaints
                    </button>


                    <button
                        onClick={() =>
                            navigate(
                                "/payments"
                            )
                        }
                    >
                        💳 Payments
                    </button>


                    <button
                        onClick={() =>
                            navigate(
                                "/notifications"
                            )
                        }
                    >
                        🔔 Notifications
                    </button>


                    <button
                        className="active"
                    >
                        🤖 AI Assistant
                    </button>


                    <button
                        onClick={() =>
                            navigate(
                                "/profile"
                            )
                        }
                    >
                        👤 Profile
                    </button>

                </nav>


                <button
                    className="ai-logout"
                    onClick={
                        handleLogout
                    }
                >
                    🚪 Logout
                </button>

            </aside>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="ai-main">


                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="ai-header">

                    <div>

                        <h1>
                            AI Assistant
                        </h1>

                        <p>
                            Your Smart City digital assistant
                        </p>

                    </div>


                    <button
                        className="clear-chat-btn"
                        disabled={loading}
                        onClick={
                            clearChat
                        }
                    >
                        🗑️ Clear Chat
                    </button>

                </header>


                {/* =================================================
                    AI STATUS
                ================================================= */}

                <div className="ai-status">

                    <div className="ai-status-icon">
                        🤖
                    </div>

                    <div>

                        <strong>
                            Smart City Assistant
                        </strong>

                        <span>
                            {connection}
                        </span>

                    </div>

                </div>


                {/* =================================================
                    CHAT
                ================================================= */}

                <section className="ai-chat-card">


                    <div className="ai-chat-body" role="log" aria-live="polite" aria-label="Assistant conversation">

                        {messages.map(
                            item => (

                                <div
                                    key={
                                        item.id
                                    }
                                    className={
                                        item.sender ===
                                        "user"
                                            ? "chat-row user-row"
                                            : "chat-row ai-row"
                                    }
                                >

                                    {item.sender ===
                                        "ai" && (

                                        <div className="chat-avatar">
                                            🤖
                                        </div>

                                    )}


                                    <div
                                        className={
                                            item.sender ===
                                            "user"
                                                ? "chat-bubble user-bubble"
                                                : "chat-bubble ai-bubble"
                                        }
                                    >
                                        {
                                            item.text
                                        }
                                    </div>


                                    {item.sender ===
                                        "user" && (

                                        <div className="chat-avatar user-avatar">
                                            👤
                                        </div>

                                    )}

                                </div>

                            )
                        )}


                        {loading && (

                            <div className="chat-row ai-row">

                                <div className="chat-avatar">
                                    🤖
                                </div>

                                <div className="chat-bubble ai-bubble typing">

                                    <span></span>
                                    <span></span>
                                    <span></span>

                                </div>

                            </div>

                        )}


                        <div
                            ref={
                                messagesEndRef
                            }
                        />

                    </div>


                    {/* =================================================
                        QUICK QUESTIONS
                    ================================================= */}

                    <div className="quick-questions">

                        <div className="quick-title">
                            Quick Questions
                        </div>


                        <div className="quick-list">

                            {quickQuestions.map(
                                question => (

                                    <button
                                        key={
                                            question
                                        }
                                        disabled={loading}
                                        onClick={() =>
                                            sendMessage(
                                                question
                                            )
                                        }
                                    >
                                        {question}
                                    </button>

                                )
                            )}

                        </div>

                    </div>


                    {/* =================================================
                        INPUT
                    ================================================= */}

                    <div className="ai-input-area">

                        <textarea
                            aria-label="Your question"
                            value={
                                message
                            }
                            onChange={
                                e =>
                                    setMessage(
                                        e.target.value.slice(0, 2000)
                                    )
                            }
                            onKeyDown={
                                handleKeyDown
                            }
                            placeholder="Ask me anything about Smart City services..."
                            rows="1"
                        />


                        <button
                            className="send-ai-btn"
                            aria-label="Send message"
                            onClick={() =>
                                sendMessage()
                            }
                            disabled={
                                loading ||
                                !message.trim()
                            }
                        >
                            ➤
                        </button>

                    </div>


                    <div className="ai-footer-note">

                        🤖 Smart City Assistant provides general
                        portal guidance. For official information,
                        please refer to the relevant city department.

                    </div>

                </section>

            </main>

        </div>

    );

};


export default AIAssistant;
