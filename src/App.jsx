import React, { useState } from "react";
import FileExplorer from "./components/FileExplorer";
import CodeEditor from "./components/CodeEditor";
import Console from "./components/Console";
import Chatbot from "./components/Chatbot";

function App() {
    const [openFiles, setOpenFiles] = useState([]);
    const [activeFile, setActiveFile] = useState(null);
    const [isReadOnly, setIsReadOnly] = useState(false);

    const handleFileSelect = (fileName) => {
        if (!openFiles.includes(fileName)) {
            setOpenFiles([...openFiles, fileName]);
        }
        setActiveFile(fileName);
    };

    const handleCloseFile = (fileName) => {
        const filteredFiles = openFiles.filter((file) => file !== fileName);
        setOpenFiles(filteredFiles);

        if (activeFile === fileName) {
            setActiveFile(filteredFiles.length > 0 ? filteredFiles[0] : null);
        }
    };

    return (
        <div className="h-screen flex flex-row">
            <Chatbot />
            <div className="flex h-screen w-full bg-vs-black text-gray-100">
                <div className="w-1/3 bg-vs-behind-editor text-gray-200 p-4">
                    <FileExplorer
                        onFileSelect={handleFileSelect}
                        activeFile={activeFile}
                        setIsReadOnly={setIsReadOnly}
                        isReadOnly={isReadOnly}
                    />
                </div>

                <div className="flex flex-col w-2/3">
                    <CodeEditor
                        openFiles={openFiles}
                        activeFile={activeFile}
                        onFileSelect={setActiveFile}
                        onCloseFile={handleCloseFile}
                        isReadOnly={isReadOnly}
                    />
                    <Console />
                </div>
            </div>
        </div>
    );
}

export default App;
