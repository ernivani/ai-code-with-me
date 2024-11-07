import React, { useState } from "react";

function Console() {
    const [logs, setLogs] = useState([
        "La console est temporairement désactivée.",
    ]);

    return (
        <>
            <div className="h-1 bg-vs-behind-editor"></div>
            <div className="h-1/4 bg-vs-black text-gray-200 p-2 overflow-y-auto">
                <h2 className="text-lg font-bold mb-2">Console</h2>
                <div>
                    {logs.map((log, index) => (
                        <p key={index}>{log}</p>
                    ))}
                </div>
            </div>
        </>
    );
}

export default Console;
