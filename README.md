<div align="center">
  <h1>KU Javadoc - VS Code Extension</h1>
  <p>KU Javadoc is a Visual Studio Code extension that generates Javadoc comments for Java files using an AI model.</p>
  <div>

---
![GitHub Release](https://img.shields.io/github/v/release/jaynightmare/doc-generator-Generator?style=flat-square)
    <a href="https://marketplace.visualstudio.com/items?itemName=jaynightmare.doc-generator">
      <img src="https://img.shields.io/visual-studio-marketplace/v/jaynightmare.doc-generator?label=VS%20Code%20Marketplace&style=flat-square" alt="VS Code Marketplace" />
    </a>
    
---

  </div>
</div>

Right–click any `.java` file (or press the icon on the toolbar), choose **"Generate Javadoc for File"**, and the extension will:

1. Send the file contents to an AI model.
2. Insert appropriate Javadoc comments into the code.
3. Replace the original file with the documented version.

This tool is designed for teaching and learning: students keep control of their own API keys and can use free-tier access from OpenRouter, Groq, or any OpenAI-compatible provider.

---

## Table of Contents
- [Table of Contents](#table-of-contents)
- [Features](#features)
- [Requirements](#requirements)
- [First-time setup](#first-time-setup)
- [Extension Settings](#extension-settings)
- [Prompt Used for Javadoc Generation](#prompt-used-for-javadoc-generation)
- [Known Issues](#known-issues)

---

## Features

- **Context menu integration**
  - Right–click in the **editor** on a Java file.
  - Or right–click a `.java` file in the **Explorer**.
  - Choose **"Generate Javadoc for File"**.
- **Toolbar button**
  - Click the button in the top-right corner of the editor when a Java file is open.
- **Automatic Javadoc generation**
  - Javadoc for:
    - Public classes, interfaces, enums
    - Public and protected methods & constructors
    - Important fields where helpful
- **Non-destructive behaviour (by design of prompt)**
  - The extension asks the model **not to rename or remove** classes, methods, or fields.
- **Provider-agnostic**
  - Defaults to Groq.
  - Can be pointed at any OpenAI-compatible endpoint (OpenAI, OpenRouter, etc.) via settings.

---

## Requirements

- **Visual Studio Code** `^1.106.1` (Latest stable version recommended)
- **Internet connection** (for API calls)
- **OpenAI-compatible API key**
  - Recommended: free-tier key from [OpenRouter](https://openrouter.ai/keys) (defaults ship with their endpoints/models).
  - You can point the extension at Groq or any other OpenAI-compatible host.

---

## First-time setup
1. Launch the command palette and run **KU Javadoc: Open Setup** (also available from the `Get Started` walkthrough card).
2. Enter the author name you want to appear in the `@author` tag.
3. Paste your OpenRouter (or other provider) API key.
4. Keep the default endpoint/model, or adjust them if you prefer another host.
5. Press **Save settings**.

You can reopen the setup panel at any time via the same command.

To verify everything, right–click a Java file and choose **"Generate Javadoc for File"**. If configuration is complete, the extension will process the file and add Javadoc comments.

---

## Extension Settings
This extension contributes the following settings:
* `doc-generator.apiKey`: Your API key for the AI provider (e.g., OpenRouter or Groq).
* `doc-generator.endpoint`: The API endpoint URL for the provider (defaults to OpenRouter-compatible Groq endpoint).
* `doc-generator.model`: The model name to use for generating Javadoc (default is OpenRouter's `llama-3.1-8b-instant`).
* `doc-generator.name`: Optional author name inserted into generated comments.

---

## Prompt Used for Javadoc Generation
The extension uses the following prompt to guide the AI model in generating Javadoc comments:

```javascript
const prompt = [
    "You are a Java documentation assistant.",
    "Insert Javadoc comments into the provided Java source while preserving behavior and formatting.",
    "",
    "Coverage requirements (nothing should be missed):",
    "- Document every top-level and nested: class, interface, enum (and record/annotation types if present).",
    "- Document every constructor and every method (all visibilities: public, protected, package-private, private).",
    "",
    "For each type (class/interface/enum/record/annotation):",
    "- Provide a concise summary of purpose and responsibilities.",
    "- Include @param <T> tags for all type parameters when generics are used.",
    "",
    "For each method/constructor:",
    "- Start with a concise summary sentence.",
    "- Include @param for each parameter (use meaningful descriptions).",
    "- Include @return for all non-void methods.",
    "- Include @throws for each declared exception.",
    "- Include @param <T> for method type parameters when generics are used.",
    "- Base descriptions strictly on the code and names; avoid speculation.",
    "",
    "Editing rules:",
    "- Preserve the original code, ordering, identifiers, and behavior.",
    "- Do not add, remove, or rename any declarations.",
    "- If @author doesn't exist, include the users name (username)",
    "- Preserve package/imports and existing formatting/indentation.",
    "- Place Javadoc immediately above each declaration.",
    "- If Javadoc already exists, refine/complete it without removing correct information.",
    "- Do NOT output HTML tags.",
    "- Output ONLY the full updated Java file content—no explanations, no markdown, no code fences.",
    "",
    "Username:",
    "```",
    username ? username : "None Provided",
    "```",
    "",
    "Java file:",
    "```java",
    originalText,
    "```",
].join("\n");
```

---

## Known Issues
- The extension relies on the AI model's understanding of Java; results may vary based on the model's capabilities.
  - I recommend testing with small files first to verify quality
  - and also using the default model provided.
- Pressing the "Generate Javadoc for File" command repeatedly in quick succession causes file "corruption" (e.g., missing code sections due to the model replacing lines that don't exist).
  - **Avoid** rapid repeated invocations to prevent this issue.
  - **Consider** saving your work before generating Javadoc to avoid data loss.
  - **WAIT** for one generation to complete before starting another.
- Network issues or invalid API keys will prevent Javadoc generation.
  - Ensure your API key is correct and your network connection is stable.

If you encounter any issues or have suggestions for improvement, please open an issue on the [GitHub repository](https://github.com/jaynightmare/doc-generator-Generator/issues).