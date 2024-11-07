import React, { useState, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";

// vs-dark background color: #1e1e1e

function CodeEditor({
    openFiles,
    activeFile,
    onFileSelect,
    onCloseFile,
    isReadOnly,
}) {
    const [fileContents, setFileContents] = useState({}); // Contains the content of each file

    // Load file content from LocalStorage when opened
    useEffect(() => {
        openFiles.forEach((file) => {
            if (!fileContents[file]) {
                const savedCode =
                    localStorage.getItem(file) || `// New file: ${file}`;
                setFileContents((prev) => ({ ...prev, [file]: savedCode }));
            }
        });
    }, [openFiles, fileContents]);

    const handleEditorChange = (value) => {
        setFileContents((prev) => ({ ...prev, [activeFile]: value }));
        if (activeFile) {
            localStorage.setItem(activeFile, value);
        }
    };

    return (
        <div className="flex flex-col h-full bg-vs-behind-editor text-gray-100 relative">
            <div className="flex justify-between items-center pt-2 bg-behind-editor">
                <div className="flex">
                    {openFiles.map((file) => (
                        <div
                            key={file}
                            onClick={() => onFileSelect(file)}
                            onAuxClick={(e) => {
                                if (e.button === 1) {
                                    onCloseFile(file);
                                }
                            }}
                            className={`px-4 py-1 cursor-pointer 
                                ${
                                    file === activeFile
                                        ? "bg-vs-black text-white"
                                        : "bg-vs-window text-gray-300"
                                } flex items-center`}
                        >
                            {file}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCloseFile(file);
                                }}
                                className="ml-2 hover:bg-vs-selected-file hover:text-white px-2 rounded-lg flex items-center justify-center"
                            >
                                x
                            </button>
                        </div>
                    ))}
                </div>
                {/* Optional: Add toggle edit mode button here */}
            </div>

            {activeFile ? (
                <MonacoEditor
                    language="javascript"
                    theme="vs-dark"
                    value={fileContents[activeFile] || ""}
                    options={{ readOnly: isReadOnly }}
                    onChange={handleEditorChange}
                    className="w-full h-full"
                />
            ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                    Aucun fichier sélectionné
                </div>
            )}
        </div>
    );
}

export default CodeEditor;
