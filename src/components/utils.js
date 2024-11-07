import languageMap from "language-map";

const getLanguageByExtension = (fileName) => {
    const extension = fileName.split(".").pop();
    for (const [language, { extensions }] of Object.entries(languageMap)) {
        if (extensions && extensions.includes(`.${extension}`)) {
            return language.toLowerCase();
        }
    }
    return "plaintext"; // Default if no match found
};

function parseMalformedJson(malformedJson) {
    let fixedJson = "";
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < malformedJson.length; i++) {
        const char = malformedJson[i];

        if (escapeNext) {
            fixedJson += char;
            escapeNext = false;
            continue;
        }

        if (char === "\\") {
            fixedJson += char;
            escapeNext = true;
            continue;
        }

        if (char === '"' && !escapeNext) {
            inString = !inString;
            fixedJson += char;
            continue;
        }

        if (inString) {
            if (char === "\n" || char === "\r") {
                fixedJson += "\\n";
                continue;
            }
        }

        fixedJson += char;
    }

    try {
        return JSON.parse(fixedJson);
    } catch (error) {
        throw new Error(
            "Failed to parse JSON after fixing formatting issues: " +
                error.message
        );
    }
}

export { getLanguageByExtension, parseMalformedJson };
