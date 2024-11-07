import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFolder,
    faFolderOpen,
    faFile,
} from "@fortawesome/free-solid-svg-icons";

// FileNode Component remains unchanged
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
                        {node.children && node.children.length === 0 && (
                            <div className="ml-4"></div>
                        )}

                        {node.children &&
                            node.children.map((childNode, index) => (
                                <FileNode
                                    key={`${fullPath}/${childNode.name}-${index}`}
                                    node={childNode}
                                    onFileSelect={onFileSelect}
                                    isActive={
                                        isActive ===
                                        `${fullPath}/${childNode.name}`
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

// Helper function to parse GitHub URL
const parseGitHubUrl = (url) => {
    const regex =
        /https?:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?(?:\/|$)/;
    const match = url.match(regex);
    if (match) {
        return {
            owner: match[1],
            repo: match[2].replace(/\.git$/, ""),
        };
    }
    return null;
};

// Enhanced Helper function to process GitHub tree data into folderStructure format with parallel fetching
const processGitHubTree = async (tree, owner, repo, branch) => {
    const folderMap = {};

    // Initialize the root
    const root = { name: repo, type: "folder", children: [] };
    folderMap[""] = root;

    // Collect file blobs to fetch their content later
    const fileBlobs = [];

    // First pass: Build folder structure and collect files
    for (const item of tree) {
        const pathParts = item.path.split("/");
        const fileName = pathParts.pop();
        const parentPath = pathParts.join("/");

        // Ensure the parent folder exists
        if (!folderMap[parentPath]) {
            folderMap[parentPath] = {
                name: pathParts[pathParts.length - 1] || repo,
                type: "folder",
                children: [],
            };
        }

        const parent = folderMap[parentPath];

        if (item.type === "tree") {
            // It's a folder
            const newFolder = { name: fileName, type: "folder", children: [] };
            parent.children.push(newFolder);
            folderMap[item.path] = newFolder;
        } else if (item.type === "blob") {
            // It's a file
            fileBlobs.push(item.path);
        }
    }

    // Second pass: Fetch file contents in parallel
    const filePromises = fileBlobs.map(async (filePath) => {
        let content = "";
        try {
            const fileResponse = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`
            );
            if (fileResponse.ok) {
                const fileData = await fileResponse.json();
                if (fileData.encoding === "base64") {
                    content = atob(fileData.content.replace(/\n/g, ""));
                } else {
                    content = fileData.content;
                }
            } else {
                console.error(`Failed to fetch content for ${filePath}`);
            }
        } catch (error) {
            console.error(`Error fetching content for ${filePath}:`, error);
        }

        return { path: filePath, content };
    });

    const filesWithContent = await Promise.all(filePromises);

    // Assign file contents to the folder structure
    filesWithContent.forEach(({ path, content }) => {
        const pathParts = path.split("/");
        const fileName = pathParts.pop();
        const parentPath = pathParts.join("/");

        const parent = folderMap[parentPath];
        if (parent) {
            parent.children.push({
                name: fileName,
                type: "file",
                content: content,
                children: [],
            });
        }
    });

    return root.children;
};

function FileExplorer({
    onFileSelect,
    activeFile,
    setIsReadOnly,
    isReadOnly,
    folderStructure,
    setFolderStructure,
}) {
    const [gitUrl, setGitUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Function to handle importing from Git
    const handleImportFromGit = async () => {
        setError(null);

        const parsed = parseGitHubUrl(gitUrl.trim());
        if (!parsed) {
            setError("Invalid GitHub URL.");
            return;
        }

        const { owner, repo } = parsed;
        const branch = prompt("Enter the branch name:", "main") || "main";

        setIsLoading(true);

        try {
            // Fetch the repository's tree
            const treeResponse = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
            );

            if (!treeResponse.ok) {
                throw new Error(
                    `Failed to fetch repository tree: ${treeResponse.statusText}`
                );
            }

            const treeData = await treeResponse.json();

            if (!treeData.tree) {
                throw new Error("Invalid tree data received from GitHub.");
            }

            // Process the tree data to match folderStructure format
            const processedData = await processGitHubTree(
                treeData.tree,
                owner,
                repo,
                branch
            );

            setFolderStructure(processedData);
        } catch (err) {
            console.error(err);
            setError(
                err.message || "An error occurred while importing from Git."
            );
        } finally {
            setIsLoading(false);
        }
    };

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
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 space-y-4 md:space-y-0">
                <h2 className="text-lg font-bold">File Explorer</h2>
                <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4">
                    <div className="flex items-center">
                        <span className="mr-2 text-sm">Read Only</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isReadOnly}
                                onChange={(e) =>
                                    setIsReadOnly(e.target.checked)
                                }
                                className="sr-only peer"
                            />
                            <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-blue-500 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 transition duration-300"></div>
                            <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-0.5 peer-checked:translate-x-full transform transition duration-300"></div>
                        </label>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <input
                    type="text"
                    value={gitUrl}
                    onChange={(e) => setGitUrl(e.target.value)}
                    placeholder="Enter GitHub repository URL"
                    className="px-3 py-2 border border-vs-black bg-vs-window text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
                <button
                    onClick={handleImportFromGit}
                    className={`flex items-center px-4 py-2 border border-vs-black bg-vs-window text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                            ${
                                isLoading ? "cursor-not-allowed opacity-50" : ""
                            }`}
                    disabled={isLoading}
                >
                    {isLoading ? "Importing..." : "Import from Git"}
                </button>
            </div>

            {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 border border-red-400 rounded">
                    {error}
                </div>
            )}
            <div>{renderFileTree(folderStructure)}</div>
        </div>
    );
}

export default FileExplorer;
