import { getLanguageByExtension } from "./utils";
import React, { useState, useEffect, useCallback } from "react";
import MonacoEditor from "@monaco-editor/react";

const getFilesContent = (folderStructure, path) => {
    const pathArray = path.split("/");
    let current = folderStructure;

    for (let segment of pathArray) {
        if (Array.isArray(current)) {
            current = current.find((item) => item.name === segment);
            if (!current) return null;
        } else {
            return null;
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

const setFilesContent = (folderStructure, path, content) => {
    const pathArray = path.split("/");
    let current = folderStructure;

    for (let i = 0; i < pathArray.length; i++) {
        const segment = pathArray[i];
        if (Array.isArray(current)) {
            current = current.find((item) => item.name === segment);
            if (!current) return false;
        }
        if (current.type === "file" && i === pathArray.length - 1) {
            current.content = content;
            return true;
        }
        if (current.type === "folder") {
            current = current.children;
        }
    }
    return false;
};

function CodeEditor({
    openFiles,
    activeFile,
    onFileSelect,
    onCloseFile,
    isReadOnly,
    folderStructure,
    setFolderStructure,
}) {
    const [fileContents, setFileContents] = useState({});

    // Initialize fileContents when openFiles or folderStructure changes
    useEffect(() => {
        openFiles.forEach((file) => {
            const currentContent = getFilesContent(folderStructure, file);
            setFileContents((prev) => ({
                ...prev,
                [file]: currentContent !== undefined ? currentContent : "",
            }));
        });
    }, [openFiles, folderStructure]);

    // Synchronize fileContents with folderStructure updates
    useEffect(() => {
        openFiles.forEach((file) => {
            const updatedContent = getFilesContent(folderStructure, file);
            setFileContents((prev) => {
                // Update only if the content has changed externally
                if (prev[file] !== updatedContent) {
                    return { ...prev, [file]: updatedContent || "" };
                }
                return prev;
            });
        });
    }, [folderStructure, openFiles]);

    const handleEditorChange = (value) => {
        setFileContents((prev) => ({ ...prev, [activeFile]: value }));
        if (activeFile) {
            const updatedStructure = JSON.parse(
                JSON.stringify(folderStructure)
            ); // Deep copy
            const success = setFilesContent(
                updatedStructure,
                activeFile,
                value
            );
            if (success) {
                setFolderStructure(updatedStructure);
            }
        }
    };

    const handleFileUpdateExternally = useCallback((filePath, newContent) => {
        setFileContents((prev) => ({
            ...prev,
            [filePath]: newContent,
        }));
    }, []);

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
                    language={getLanguageByExtension(activeFile)}
                    theme="vs-dark"
                    value={fileContents[activeFile] || ""}
                    options={{ readOnly: isReadOnly }}
                    onChange={handleEditorChange}
                    className="w-full h-full"
                />
            ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                    No file selected
                </div>
            )}
        </div>
    );
}

export default CodeEditor;
