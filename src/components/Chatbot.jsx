import React, { useState, useCallback } from "react";
import ollama from "ollama/browser"; // Import the browser-specific module
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FiCopy, FiCheck } from "react-icons/fi"; // Import icons for copy and check

const jsonExemplar = [
    {
        name: "src",
        type: "folder",
        children: [],
    },
    {
        name: "index.js",
        type: "file",
        content: "This is the main entry point of the app.",
    },
];

function Chatbot({ folderStructure, setFolderStructure }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false); // To manage loading state
    const [copiedMessageIndex, setCopiedMessageIndex] = useState(null); // Track copied messages
    const [copiedCodeIndices, setCopiedCodeIndices] = useState({}); // Track copied code blocks

    const sendMessage = async () => {
        if (input.trim() === "") return;

        // Add user's message
        setMessages((prevMessages) => [
            ...prevMessages,
            { role: "user", content: input },
        ]);

        setIsLoading(true);

        try {
            // Define the system message based on existing folder structure
            const systemMessage = `
                You are a helpful assistant managing a project folder structure.

                Current folder structure (if any):
                ${
                    folderStructure.length > 0
                        ? JSON.stringify(folderStructure, null, 2)
                        : "None"
                }

                User request:
                - Perform the user's request by creating, modifying, or deleting files/folders as instructed.
                - Return the updated folder structure in JSON format only.

                Reference example (for structure formatting only):
                ${JSON.stringify(jsonExemplar, null, 2)}
                `;

            const response = await ollama.chat({
                model: "llama3.2",
                messages: [
                    { role: "system", content: systemMessage },
                    { role: "user", content: input },
                ],
                stream: true,
            });

            let assistantMessage = "";

            for await (const part of response) {
                if (part.message && part.message.content) {
                    assistantMessage += part.message.content;
                    setMessages((prevMessages) => {
                        const lastMessage =
                            prevMessages[prevMessages.length - 1];
                        if (lastMessage && lastMessage.role === "assistant") {
                            return [
                                ...prevMessages.slice(0, -1),
                                {
                                    ...lastMessage,
                                    content:
                                        lastMessage.content +
                                        part.message.content,
                                },
                            ];
                        } else {
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

            // Function to extract JSON from the assistantMessage
            const extractJSON = (text) => {
                try {
                    // Attempt to parse the entire text as JSON
                    return JSON.parse(text);
                } catch (e) {
                    // If parsing fails, try to extract JSON within code blocks
                    const jsonRegex = /```json\s*([\s\S]*?)```/;
                    const match = text.match(jsonRegex);
                    if (match && match[1]) {
                        return JSON.parse(match[1]);
                    }

                    // Fallback: Attempt to extract JSON between the first [ and the last ]
                    const firstBracket = text.indexOf("[");
                    const lastBracket = text.lastIndexOf("]");
                    if (
                        firstBracket !== -1 &&
                        lastBracket !== -1 &&
                        lastBracket > firstBracket
                    ) {
                        const jsonString = text.substring(
                            firstBracket,
                            lastBracket + 1
                        );
                        return JSON.parse(jsonString);
                    }

                    return null;
                }
            };

            // Extract JSON from the assistant's message
            const extractedJSON = extractJSON(assistantMessage.trim());

            if (extractedJSON) {
                // Validate that it's an array
                if (Array.isArray(extractedJSON)) {
                    // Optionally: Validate the structure of the objects
                    const isValid = extractedJSON.every(
                        (item) =>
                            typeof item.name === "string" &&
                            (item.type === "file" || item.type === "folder") &&
                            (item.type === "file"
                                ? typeof item.content === "string"
                                : true)
                    );

                    if (isValid) {
                        setFolderStructure(extractedJSON); // Update central state
                        setMessages((prevMessages) => [
                            ...prevMessages,
                            {
                                role: "assistant",
                                content:
                                    "Folder structure updated successfully.",
                            },
                        ]);
                    } else {
                        throw new Error("The JSON structure is invalid.");
                    }
                } else {
                    throw new Error("The parsed JSON is not an array.");
                }
            } else {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        role: "assistant",
                        content:
                            "Failed to extract folder structure. Please ensure the AI returned valid JSON.",
                    },
                ]);
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

        setIsLoading(false);
        setInput("");
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

    // Optional: Function to display current folder structure (for debugging)
    const displayFolderStructure = () => {
        if (folderStructure.length === 0) {
            return <p>No folder structure available.</p>;
        }

        const renderFolder = (items, depth = 0) => {
            return items.map((item, index) => {
                if (item.type === "folder") {
                    return (
                        <div
                            key={`${depth}-${index}`}
                            style={{ marginLeft: depth * 20 }}
                        >
                            <strong>{item.name}/</strong>
                            {item.children &&
                                renderFolder(item.children, depth + 1)}
                        </div>
                    );
                } else if (item.type === "file") {
                    return (
                        <div
                            key={`${depth}-${index}`}
                            style={{ marginLeft: depth * 20 }}
                        >
                            {item.name}: {item.content}
                        </div>
                    );
                } else {
                    return null;
                }
            });
        };

        return <div>{renderFolder(folderStructure)}</div>;
    };

    return (
        <div className="h-full w-1/2 bg-vs-black text-gray-100 flex flex-col max-w-3xl">
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
                <div className="my-2 p-2 rounded bg-vs-behind-editor text-gray-100">
                    <h3 className="text-lg font-bold mb-2">
                        Ask me anything about the folder structure!
                        <p className="text-sm text-gray-400">
                            (e.g., create a folder, delete a file, etc.)
                        </p>
                    </h3>
                </div>
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
