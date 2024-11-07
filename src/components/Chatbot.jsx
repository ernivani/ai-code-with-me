import React, { useState, useCallback } from "react";
import ollama from "ollama/browser"; // Import the browser-specific module
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FiCopy, FiCheck } from "react-icons/fi"; // Import icons for copy and check

function Chatbot() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false); // To manage loading state
    const [copiedMessageIndex, setCopiedMessageIndex] = useState(null); // Track copied messages
    const [copiedCodeIndices, setCopiedCodeIndices] = useState({}); // Track copied code blocks

    const sendMessage = async () => {
        if (input.trim() === "") return;

        // Add user's message with 'role' and 'content'
        setMessages((prevMessages) => [
            ...prevMessages,
            { role: "user", content: input },
        ]);

        setIsLoading(true); // Start loading

        try {
            const response = await ollama.chat({
                model: "llama3.2", // Ensure the model name matches your setup
                messages: [{ role: "user", content: input }],
                stream: true, // Enable streaming
            });

            // Iterate over the async generator
            for await (const part of response) {
                // Each 'part' contains partial response from the model
                if (part.message && part.message.content) {
                    setMessages((prevMessages) => {
                        // Check if the last message is from the bot
                        const lastMessage =
                            prevMessages[prevMessages.length - 1];
                        if (lastMessage && lastMessage.role === "assistant") {
                            // Append to the last assistant message
                            const updatedMessages = [...prevMessages];
                            updatedMessages[updatedMessages.length - 1] = {
                                ...lastMessage,
                                content:
                                    lastMessage.content + part.message.content,
                            };
                            return updatedMessages;
                        } else {
                            // Add a new assistant message
                            return [
                                ...prevMessages,
                                {
                                    role: "assistant",
                                    content: part.message.content,
                                },
                            ];
                        }
                    });
                }
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    role: "assistant",
                    content:
                        "Sorry, there was an error processing your request.",
                },
            ]);
        }

        setIsLoading(false); // End loading
        setInput(""); // Clear input field
    };

    // Function to copy entire message
    const copyMessage = (content, index) => {
        navigator.clipboard
            .writeText(content)
            .then(() => {
                setCopiedMessageIndex(index);
                setTimeout(() => setCopiedMessageIndex(null), 2000); // Reset after 2 seconds
            })
            .catch((err) => {
                console.error("Could not copy text: ", err);
            });
    };

    // Function to copy code blocks
    const copyCode = useCallback((code, messageIndex, codeIndex) => {
        navigator.clipboard
            .writeText(code)
            .then(() => {
                setCopiedCodeIndices((prev) => ({
                    ...prev,
                    [`${messageIndex}-${codeIndex}`]: true,
                }));
                setTimeout(() => {
                    setCopiedCodeIndices((prev) => ({
                        ...prev,
                        [`${messageIndex}-${codeIndex}`]: false,
                    }));
                }, 2000); // Reset after 2 seconds
            })
            .catch((err) => {
                console.error("Could not copy code: ", err);
            });
    }, []);

    return (
        <div className="h-full w-1/2 bg-vs-black text-gray-100 flex flex-col">
            <div
                className="p-4 overflow-y-auto flex-grow"
                style={{ height: "calc(100% - 4rem)" }}
            >
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`my-2 p-2 rounded relative ${
                            message.role === "user"
                                ? "bg-vs-selected-file text-white"
                                : "bg-vs-behind-editor text-gray-100"
                        }`}
                    >
                        {/* Copy button for entire message */}
                        <button
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
                            onClick={() => copyMessage(message.content, index)}
                            aria-label="Copy message"
                        >
                            {copiedMessageIndex === index ? (
                                <FiCheck />
                            ) : (
                                <FiCopy />
                            )}
                        </button>
                        <ReactMarkdown
                            children={message.content}
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code({
                                    node,
                                    inline,
                                    className,
                                    children,
                                    ...props
                                }) {
                                    const match = /language-(\w+)/.exec(
                                        className || ""
                                    );
                                    const codeContent = String(
                                        children
                                    ).replace(/\n$/, "");
                                    const codeIndex = node.position
                                        ? node.position.start.line
                                        : 0;
                                    const uniqueKey = `${index}-${codeIndex}`;
                                    return !inline && match ? (
                                        <div className="relative">
                                            <SyntaxHighlighter
                                                style={materialDark}
                                                language={match[1]}
                                                PreTag="div"
                                                {...props}
                                            >
                                                {codeContent}
                                            </SyntaxHighlighter>
                                            <button
                                                className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
                                                onClick={() =>
                                                    copyCode(
                                                        codeContent,
                                                        index,
                                                        codeIndex
                                                    )
                                                }
                                                aria-label="Copy code"
                                            >
                                                {copiedCodeIndices[
                                                    uniqueKey
                                                ] ? (
                                                    <FiCheck />
                                                ) : (
                                                    <FiCopy />
                                                )}
                                            </button>
                                        </div>
                                    ) : (
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    );
                                },
                            }}
                        />
                    </div>
                ))}
            </div>
            <div className="p-4 flex bg-vs-window">
                <input
                    type="text"
                    className="flex-grow p-2 rounded bg-vs-hover-file text-gray-100 outline-none"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type your message..."
                />
                <button
                    className="ml-2 p-2 bg-vs-selected-file rounded text-white"
                    onClick={sendMessage}
                    disabled={isLoading} // Disable button while loading
                >
                    {isLoading ? "Sending..." : "Send"}
                </button>
            </div>
        </div>
    );
}

export default Chatbot;
