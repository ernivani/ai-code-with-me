import React, { useState, useEffect } from "react";
import FileExplorer from "./components/FileExplorer";
import CodeEditor from "./components/CodeEditor";
import Console from "./components/Console";
import Chatbot from "./components/Chatbot";

function App() {
    const [openFiles, setOpenFiles] = useState([]);
    const [activeFile, setActiveFile] = useState(null);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [folderStructure, setFolderStructure] = useState(() => {
        const stored = localStorage.getItem("three");
        return stored ? JSON.parse(stored) : [];
    });

    // Update localStorage whenever folderStructure changes
    useEffect(() => {
        localStorage.setItem("three", JSON.stringify(folderStructure));
    }, [folderStructure]);

    const handleFileSelect = (filePath) => {
        if (!openFiles.includes(filePath)) {
            setOpenFiles([...openFiles, filePath]);
        }
        setActiveFile(filePath);
    };

    const handleCloseFile = (filePath) => {
        const filteredFiles = openFiles.filter((file) => file !== filePath);
        setOpenFiles(filteredFiles);

        if (activeFile === filePath) {
            setActiveFile(filteredFiles.length > 0 ? filteredFiles[0] : null);
        }
    };

    return (
        <div className="h-screen flex flex-row">
            <Chatbot
                folderStructure={folderStructure}
                setFolderStructure={setFolderStructure}
            />
            <div className="flex h-screen w-full bg-vs-black text-gray-100">
                <div className="w-1/3 bg-vs-behind-editor text-gray-200 p-4">
                    <FileExplorer
                        onFileSelect={handleFileSelect}
                        activeFile={activeFile}
                        setIsReadOnly={setIsReadOnly}
                        isReadOnly={isReadOnly}
                        folderStructure={folderStructure}
                        setFolderStructure={setFolderStructure}
                    />
                </div>

                <div className="flex flex-col w-2/3">
                    <CodeEditor
                        openFiles={openFiles}
                        activeFile={activeFile}
                        onFileSelect={setActiveFile}
                        onCloseFile={handleCloseFile}
                        isReadOnly={isReadOnly}
                        folderStructure={folderStructure}
                        setFolderStructure={setFolderStructure}
                    />
                    <Console />
                </div>
            </div>
        </div>
    );
}

export default App;
