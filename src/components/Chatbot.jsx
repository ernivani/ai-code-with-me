import React, { useState } from "react";
import axios from "axios";

function Chatbot() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const sendMessage = async () => {
        if (input.trim() === "") return;

        const userMessage = { sender: "user", text: input };
        setMessages([...messages, userMessage]);

        try {
            const response = await axios.post(
                "https://api.openai.com/v1/engines/davinci-codex/completions",
                {
                    prompt: input,
                    max_tokens: 150,
                    n: 1,
                    stop: null,
                    temperature: 0.7,
                },
                {
                    headers: {
                        Authorization: `Bearer YOUR_OPENAI_API_KEY`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const botMessage = {
                sender: "bot",
                text: response.data.choices[0].text.trim(),
            };
            setMessages([...messages, userMessage, botMessage]);
        } catch (error) {
            console.error("Error fetching response from OpenAI:", error);
        }

        setInput("");
    };

    return (
        <div className="h-full w-1/2 bg-vs-black text-gray-100">
            <div
                className="p-4 overflow-y-auto"
                style={{ height: "calc(100% - 4rem)" }}
            >
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`my-2 p-2 rounded ${
                            message.sender === "user"
                                ? "bg-vs-selected-file text-white"
                                : "bg-vs-behind-editor text-gray-100"
                        }`}
                    >
                        {message.text}
                    </div>
                ))}
            </div>
            <div className="p-4 flex bg-vs-window">
                <input
                    type="text"
                    className="flex-grow p-2 rounded bg-vs-hover-file text-gray-100 outline-none"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                    className="ml-2 p-2 bg-vs-selected-file rounded text-white"
                    onClick={sendMessage}
                >
                    Send
                </button>
            </div>
        </div>
    );
}

export default Chatbot;
