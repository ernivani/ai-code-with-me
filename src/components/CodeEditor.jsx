import React, { useState, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
[
    {
        name: "components",
        type: "folder",
        children: [
            {
                name: "assets",
                type: "folder",
                children: [
                    {
                        name: "icons",
                        type: "folder",
                        children: [
                            { name: "Icon.jsx", type: "file", content: "test" },
                        ],
                    },
                ],
            },
            { name: "test.js", type: "file", content: "a" },
        ],
    },
    { name: "main.js", type: "file", content: "test" },
];
const getFilesContent = (path) => {
    const folderStructure = localStorage.getItem("three");
    const pathArray = path.split("/");
    let current = JSON.parse(folderStructure);

    for (let segment of pathArray) {
        if (Array.isArray(current)) {
            current = current.find((item) => item.name == segment);
            if (!current) return null;
        } else {
        }
        if (current.type === "file") {
            return current.content;
        }
        if (current.type === "folder") {
            current = current.children;
        }
    }
    return null;
};

const setFilesContent = (path, content) => {
    const folderStructure = JSON.parse(localStorage.getItem("three"));
    const pathArray = path.split("/");
    let current = folderStructure;

    for (let i = 0; i < pathArray.length; i++) {
        const segment = pathArray[i];
        if (Array.isArray(current)) {
            current = current.find((item) => item.name === segment);
            if (!current) return null;
        }
        if (current.type === "file" && i === pathArray.length - 1) {
            current.content = content;
            localStorage.setItem("three", JSON.stringify(folderStructure));
            return;
        }
        if (current.type === "folder") {
            current = current.children;
        }
    }
    return null;
};

function CodeEditor({
    openFiles,
    activeFile,
    onFileSelect,
    onCloseFile,
    isReadOnly,
}) {
    const [fileContents, setFileContents] = useState({});

    useEffect(() => {
        openFiles.forEach((file) => {
            if (!(file in fileContents)) {
                const savedCode = getFilesContent(file);
                setFileContents((prev) => ({ ...prev, [file]: savedCode }));
            }
        });
    }, [openFiles]); // Removed `fileContents` to prevent infinite loop.

    const handleEditorChange = (value) => {
        setFileContents((prev) => ({ ...prev, [activeFile]: value }));
        if (activeFile) {
            setFilesContent(activeFile, value);
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
