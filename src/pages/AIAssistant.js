import React, {
    useEffect,
    useRef,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import "./AIAssistant.css";


const AIAssistant = () => {

    const navigate = useNavigate();

    const messagesEndRef =
        useRef(null);


    const [
        message,
        setMessage
    ] = useState("");


    const [
        loading,
        setLoading
    ] = useState(false);


    const [
        messages,
        setMessages
    ] = useState([
        {
            id: 1,
            sender: "ai",
            text:
                "Hello! 👋 I am your Smart City Assistant. How can I help you today?"
        }
    ]);


    // ========================================================
    // USER
    // ========================================================

    const getUser = () => {

        try {

            const storedUser =
                localStorage.getItem(
                    "user"
                );


            if (!storedUser) {
                return null;
            }


            return JSON.parse(
                storedUser
            );

        } catch (error) {

            return null;

        }

    };


    // ========================================================
    // AUTO SCROLL
    // ========================================================

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });

    }, [messages]);


    // ========================================================
    // SEND MESSAGE
    // ========================================================

    const sendMessage =
        async (
            customMessage = null
        ) => {

            const finalMessage =
                (
                    customMessage !== null
                        ? customMessage
                        : message
                ).trim();


            if (!finalMessage) {
                return;
            }


            const user =
                getUser();


            if (!user) {

                navigate(
                    "/login"
                );

                return;

            }


            const userMessage = {

                id:
                    Date.now(),

                sender:
                    "user",

                text:
                    finalMessage

            };


            setMessages(
                previous => [
                    ...previous,
                    userMessage
                ]
            );


            setMessage("");

            setLoading(true);


            try {

                const response =
                    await fetch(
                        "http://localhost:5000/api/ai/chat",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    message:
                                        finalMessage
                                })
                        }
                    );


                const data =
                    await response.json();


                if (
                    response.ok &&
                    data.success
                ) {

                    const aiMessage = {

                        id:
                            Date.now() + 1,

                        sender:
                            "ai",

                        text:
                            data.reply

                    };


                    setMessages(
                        previous => [
                            ...previous,
                            aiMessage
                        ]
                    );

                } else {

                    setMessages(
                        previous => [
                            ...previous,
                            {
                                id:
                                    Date.now() + 1,

                                sender:
                                    "ai",

                                text:
                                    "Sorry, I couldn't process your request right now."
                            }
                        ]
                    );

                }

            } catch (error) {

                console.error(
                    "AI chat error:",
                    error
                );


                setMessages(
                    previous => [
                        ...previous,
                        {
                            id:
                                Date.now() + 1,

                            sender:
                                "ai",

                            text:
                                "⚠️ Unable to connect to the Smart City Assistant. Please make sure the backend server is running."
                        }
                    ]
                );

            } finally {

                setLoading(false);

            }

        };


    // ========================================================
    // ENTER KEY
    // ========================================================

    const handleKeyDown =
        (e) => {

            if (
                e.key === "Enter" &&
                !e.shiftKey
            ) {

                e.preventDefault();

                sendMessage();

            }

        };


    // ========================================================
    // QUICK QUESTIONS
    // ========================================================

    const quickQuestions = [

        "What city services are available?",

        "How can I apply for a service?",

        "How can I track my application?",

        "How can I submit a complaint?",

        "How can I make a payment?",

        "What can I do with digital documents?"

    ];


    // ========================================================
    // CLEAR CHAT
    // ========================================================

    const clearChat =
        () => {

            setMessages([
                {
                    id: 1,
                    sender: "ai",
                    text:
                        "Hello! 👋 I am your Smart City Assistant. How can I help you today?"
                }
            ]);

        };


    // ========================================================
    // LOGOUT
    // ========================================================

    const handleLogout =
        () => {

            localStorage.removeItem(
                "user"
            );

            localStorage.removeItem(
                "token"
            );

            navigate(
                "/login"
            );

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
                            ● Online • Ready to help
                        </span>

                    </div>

                </div>


                {/* =================================================
                    CHAT
                ================================================= */}

                <section className="ai-chat-card">


                    <div className="ai-chat-body">

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
                            value={
                                message
                            }
                            onChange={
                                e =>
                                    setMessage(
                                        e.target.value
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