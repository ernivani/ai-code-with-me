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

export { getLanguageByExtension };
