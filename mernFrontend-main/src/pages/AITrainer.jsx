import { useState } from "react";
import Navbar from "../components/Navbar";

function AITrainer() {

    const [message, setMessage] = useState("");

    const [messages, setMessages] = useState([]);

    const [loading, setLoading] = useState(false);


    // User information
    // Later we will get this from your logged-in user
    const user = {
        age: 21,
        gender: "male",
        height: 175,
        weight: 75,
        goal: "weight loss",
        experience: "beginner",
        equipment: "dumbbells",
        diet: "vegetarian"
    };


    const sendMessage = async () => {

        if (!message.trim()) {
            return;
        }


        const userMessage = {
            role: "user",
            content: message
        };


        const updatedMessages = [
            ...messages,
            userMessage
        ];


        setMessages(updatedMessages);

        setMessage("");

        setLoading(true);


        try {

            const response = await fetch(
                "http://localhost:5000/api/ai/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        user: user,

                        message: message,

                        conversation: messages

                    })
                }
            );


            const data = await response.json();


            if (data.success) {

                const aiMessage = {
                    role: "assistant",
                    content: data.reply
                };


                setMessages([
                    ...updatedMessages,
                    aiMessage
                ]);

            } else {

                setMessages([
                    ...updatedMessages,
                    {
                        role: "assistant",
                        content: "Sorry, I couldn't generate a response."
                    }
                ]);

            }


        } catch (error) {

            console.error("AI Trainer Error:", error);

            setMessages([
                ...updatedMessages,
                {
                    role: "assistant",
                    content: "Unable to connect to AI Trainer."
                }
            ]);

        }


        setLoading(false);

    };


    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
            <Navbar />
            <div className="max-w-2xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--primary)' }}>
                    🤖 FitnessPass AI Trainer
                </h1>


                <div className="glass rounded-2xl p-6 mb-6 min-h-[400px] flex flex-col"
                    style={{ borderColor: 'var(--border)' }}>

                    {messages.length === 0 && (

                        <div className="text-center flex-1 flex flex-col justify-center">

                            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                                Hello! I'm your FitnessPass AI Trainer.
                            </h3>

                            <p style={{ color: 'var(--text-secondary)' }}>
                                Ask me about workouts, exercises,
                                nutrition or fitness.
                            </p>

                        </div>

                    )}


                    {messages.map((msg, index) => (

                        <div
                            key={index}
                            className="mb-4 p-4 rounded-lg"
                            style={{
                                background:
                                    msg.role === "user"
                                        ? "rgba(108, 99, 255, 0.15)"
                                        : "rgba(108, 99, 255, 0.08)",
                                borderLeft: `3px solid ${msg.role === "user" ? "var(--primary)" : "var(--text-secondary)"}`
                            }}
                        >

                            <strong style={{ color: msg.role === "user" ? "var(--primary)" : "var(--text-secondary)" }}>
                                {msg.role === "user"
                                    ? "You"
                                    : "🤖 AI Trainer"}
                            </strong>

                            <p style={{ color: 'var(--text-primary)', marginTop: '8px' }}>
                                {msg.content}
                            </p>

                        </div>

                    ))}


                    {loading && (

                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
                            🤖 AI Trainer is thinking...
                        </p>

                    )}

                </div>

                <div className="flex gap-3">

                    <input
                        type="text"
                        value={message}
                        onChange={(e) =>
                            setMessage(e.target.value)
                        }
                        onKeyDown={(e) => {

                            if (e.key === "Enter") {
                                sendMessage();
                            }

                        }}
                        placeholder="Ask your AI Trainer..."
                        className="input-field flex-1"
                    />

                    <button
                        onClick={sendMessage}
                        disabled={loading}
                        className="btn-gradient px-6 py-3 rounded-lg font-semibold text-white transition-all"
                        style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                    >
                        Send
                    </button>

                </div>

            </div>

        </div>

    );
}

export default AITrainer;