import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFolder,
    faFolderOpen,
    faFile,
} from "@fortawesome/free-solid-svg-icons";

function FileNode({
    node,
    onFileSelect,
    isActive,
    setFolderStructure,
    folderStructure,
    parentPath,
}) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleFolder = () => {
        setIsOpen(!isOpen);
    };

    const fullPath = parentPath ? `${parentPath}/${node.name}` : node.name;

    if (node.type === "folder") {
        return (
            <div className="ml-4">
                <div
                    className="flex items-center cursor-pointer"
                    onClick={toggleFolder}
                >
                    <FontAwesomeIcon
                        icon={isOpen ? faFolderOpen : faFolder}
                        className="mr-2"
                    />
                    <span className="font-semibold">{node.name}</span>
                </div>
                {isOpen && (
                    <div className="ml-4">
                        {node.children.map((childNode, index) => (
                            <FileNode
                                key={`${fullPath}/${childNode.name}-${index}`}
                                node={childNode}
                                onFileSelect={onFileSelect}
                                isActive={
                                    isActive === `${fullPath}/${childNode.name}`
                                }
                                setFolderStructure={setFolderStructure}
                                folderStructure={folderStructure}
                                parentPath={fullPath}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            className={`flex items-center ml-4 cursor-pointer hover:bg-vs-hover-file ${
                isActive ? "bg-vs-selected-file text-white" : ""
            }`}
            onClick={() => onFileSelect(fullPath)}
        >
            <FontAwesomeIcon icon={faFile} className="mr-2" />
            <span>{node.name}</span>
        </div>
    );
}

function FileExplorer({
    onFileSelect,
    activeFile,
    setIsReadOnly,
    isReadOnly,
    folderStructure,
    setFolderStructure,
}) {
    const renderFileTree = (nodes, parentPath = "") => {
        return nodes.map((node, index) => (
            <FileNode
                key={`${parentPath}/${node.name}-${index}`}
                node={node}
                onFileSelect={onFileSelect}
                isActive={activeFile === `${parentPath}/${node.name}`}
                setFolderStructure={setFolderStructure}
                folderStructure={folderStructure}
                parentPath={parentPath}
            />
        ));
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">File Explorer</h2>
                <div className="flex items-center">
                    <span className="mr-2 text-sm">Read Only</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isReadOnly}
                            onChange={(e) => setIsReadOnly(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-blue-500 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 transition duration-300"></div>
                        <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-0.5 peer-checked:translate-x-full transform transition duration-300"></div>
                    </label>
                </div>
            </div>
            <div>{renderFileTree(folderStructure)}</div>
        </div>
    );
}

export default FileExplorer;
