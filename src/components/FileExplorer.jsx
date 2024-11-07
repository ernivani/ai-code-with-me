import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFolder,
    faFolderOpen,
    faFile,
} from "@fortawesome/free-solid-svg-icons";

const fileStructure = [
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
                        children: [{ name: "Icon.jsx", type: "file" }],
                    },
                ],
            },
            { name: "test.js", type: "file" },
        ],
    },
    { name: "main.js", type: "file" },
];

function FileExplorer({ onFileSelect, activeFile, setIsReadOnly, isReadOnly }) {
    const renderFileTree = (nodes) => {
        return nodes.map((node, index) => (
            <FileNode
                key={index}
                node={node}
                onFileSelect={onFileSelect}
                isActive={activeFile === node.name}
            />
        ));
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Explorateur de fichiers</h2>
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
            <div>{renderFileTree(fileStructure)}</div>
        </div>
    );
}

function FileNode({ node, onFileSelect, isActive }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleFolder = () => {
        setIsOpen(!isOpen);
    };

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
                                key={index}
                                node={childNode}
                                onFileSelect={onFileSelect}
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
            onClick={() => onFileSelect(node.name)}
        >
            <FontAwesomeIcon icon={faFile} className="mr-2" />
            <span>{node.name}</span>
        </div>
    );
}

export default FileExplorer;
