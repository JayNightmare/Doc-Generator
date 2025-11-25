// src/libs/prompts.js

const COMMON_RULES = [
    "Preserve the original code, ordering, identifiers, and behavior.",
    "Do not add, remove, or rename any declarations.",
    "Preserve package/imports and existing formatting/indentation.",
    "If documentation already exists, refine/complete it without removing correct information.",
    "Do NOT output HTML tags unless standard for the language.",
    "Output ONLY the full updated file content—no explanations, no markdown, no code fences.",
];

const LANGUAGE_CONFIGS = {
    java: {
        name: "Java",
        assistant: "Java documentation assistant",
        action: "Insert Javadoc comments",
        coverage: [
            "Document every top-level and nested: class, interface, enum (and record/annotation types if present).",
            "Document every constructor and every method (all visibilities: public, protected, package-private, private).",
        ],
        typeRules: [
            "Provide a concise summary of purpose and responsibilities.",
            "Include @param <T> tags for all type parameters when generics are used.",
        ],
        methodRules: [
            "Start with a concise summary sentence.",
            "Include @param for each parameter (use meaningful descriptions).",
            "Include @return for all non-void methods.",
            "Include @throws for each declared exception.",
            "Include @param <T> for method type parameters when generics are used.",
            "Base descriptions strictly on the code and names; avoid speculation.",
        ],
        extraRules: [
            "Place Javadoc immediately above each declaration.",
            "If @author doesn't exist, include the users name (username)",
        ],
    },
    javascript: {
        name: "JavaScript",
        assistant: "JavaScript documentation assistant",
        action: "Insert JSDoc comments",
        coverage: [
            "Document every class, function, and method.",
            "Document exported variables/constants if complex.",
        ],
        typeRules: ["Provide a concise summary of purpose."],
        methodRules: [
            "Start with a concise summary.",
            "Include @param {Type} name - description for each parameter. Infer types if possible.",
            "Include @returns {Type} description for return values.",
            "Include @throws {Type} description for exceptions.",
        ],
        extraRules: [
            "Place JSDoc (/** ... */) immediately above each declaration.",
            "If @author doesn't exist, include the users name (username)",
        ],
    },
    typescript: {
        name: "TypeScript",
        assistant: "TypeScript documentation assistant",
        action: "Insert TSDoc/JSDoc comments",
        coverage: [
            "Document every class, interface, enum, function, and method.",
            "Document exported types and variables.",
        ],
        typeRules: [
            "Provide a concise summary of purpose.",
            "Include @template T tags for generic type parameters.",
        ],
        methodRules: [
            "Start with a concise summary.",
            "Include @param name - description for each parameter. Do not include types in tags (TypeScript handles this).",
            "Include @returns description for return values.",
            "Include @throws description for exceptions.",
        ],
        extraRules: [
            "Place TSDoc/JSDoc (/** ... */) immediately above each declaration.",
            "If @author doesn't exist, include the users name (username)",
        ],
    },
    python: {
        name: "Python",
        assistant: "Python documentation assistant",
        action: "Insert Docstrings",
        coverage: ["Document every module, class, function, and method."],
        typeRules: ["Provide a concise summary of purpose."],
        methodRules: [
            "Start with a concise summary.",
            "Use Google style or NumPy style docstrings (unless file uses another style consistently).",
            "Include Args: section for parameters.",
            "Include Returns: section for return values.",
            "Include Raises: section for exceptions.",
        ],
        extraRules: [
            'Place docstrings (""" ... """) immediately inside the declaration.',
            "Preserve indentation carefully.",
        ],
    },
    csharp: {
        name: "C#",
        assistant: "C# documentation assistant",
        action: "Insert XML documentation comments",
        coverage: [
            "Document every class, interface, struct, enum, method, and property.",
        ],
        typeRules: [
            "Use <summary> tags for description.",
            "Use <typeparam> tags for generics.",
        ],
        methodRules: [
            "Use <summary> tags for description.",
            "Use <param> tags for parameters.",
            "Use <returns> tags for return values.",
            "Use <exception> tags for exceptions.",
        ],
        extraRules: [
            "Place XML comments (///) immediately above each declaration.",
        ],
    },
};

export function getPrompt(languageId, originalText, username) {
    const config = LANGUAGE_CONFIGS[languageId];

    if (!config) {
        throw new Error(`Language '${languageId}' is not currently supported.`);
    }

    return [
        `You are a ${config.assistant}.`,
        `${config.action} into the provided ${config.name} source while preserving behavior and formatting.`,
        "",
        "Coverage requirements:",
        ...config.coverage.map((r) => `- ${r}`),
        "",
        "For types/classes:",
        ...config.typeRules.map((r) => `- ${r}`),
        "",
        "For methods/functions:",
        ...config.methodRules.map((r) => `- ${r}`),
        "",
        "Editing rules:",
        ...COMMON_RULES.map((r) => `- ${r}`),
        ...config.extraRules.map((r) => `- ${r}`),
        "",
        "Username:",
        "```",
        username ? username : "None Provided",
        "```",
        "",
        `${config.name} file:`,
        "```" + (languageId === "csharp" ? "csharp" : languageId),
        originalText,
        "```",
    ].join("\n");
}
