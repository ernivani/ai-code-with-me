import React, { useState } from "react";

function Console() {
    const [logs, setLogs] = useState([
        "Console : Bienvenue dans l'éditeur",
    ]);

    return (
        <div className="h-1/4 bg-gray-900 text-gray-200 p-2 overflow-y-auto">
            <h2 className="text-lg font-bold mb-2">Console</h2>
            <div>
                {logs.map((log, index) => (
                    <p key={index}>{log}</p>
                ))}
            </div>
        </div>
    );
}

export default Console;
