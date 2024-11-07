import React, { useState } from "react";
import FileExplorer from "./components/FileExplorer";
import CodeEditor from "./components/CodeEditor";
import Console from "./components/Console";

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
        <div className="flex h-screen bg-vs-black text-gray-100">
            {/* Colonne gauche : Explorateur de fichiers */}
            <div className="w-1/5 bg-vs-behind-editor text-gray-200 p-4">
                <FileExplorer
                    onFileSelect={handleFileSelect}
                    setIsReadOnly={setIsReadOnly}
                    isReadOnly={isReadOnly}
                />
            </div>

            {/* Section centrale : Éditeur de code */}
            <div className="flex-1 flex flex-col">
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
    );
}

export default App;
