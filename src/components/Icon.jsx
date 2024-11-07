import React from "react";

function Icon({ name, onMouseOverEvent, onMouseOutEvent }) {
    return (
        <span
            onMouseOver={onMouseOverEvent}
            onMouseOut={onMouseOutEvent}
            className="cursor-pointer text-gray-500 hover:text-blue-500 transition-colors duration-200"
        >
            {name === "github" ? "🐱" : "🎨"}
        </span>
    );
}

export default Icon;
