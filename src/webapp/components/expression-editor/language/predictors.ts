import { languages } from "monaco-editor";

export const PredictorsLanguageConfiguration: languages.LanguageConfiguration = {
    wordPattern: /(-?\d*\.\d\w*)|([^`~!@%^&*()\-=+\\|#{};:'",.<>/?\s]+)/g,
    brackets: [["(", ")"]],
    autoClosingPairs: [
        { open: "{", close: "}" },
        { open: "[", close: "]" },
        { open: "(", close: ")" },
        { open: '"', close: '"', notIn: ["string"] },
        { open: "'", close: "'", notIn: ["string", "comment"] },
        { open: "`", close: "`", notIn: ["string", "comment"] },
    ],
};
