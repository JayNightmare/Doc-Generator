<div align="center">
  <h1>Doc Generator - VS Code Extension</h1>
  <p>Doc Generator is a Visual Studio Code extension that generates documentation comments for files using an AI model.</p>
  <div>

---
![GitHub Release](https://img.shields.io/github/v/release/jaynightmare/doc-generator-Generator?style=flat-square)
    <a href="https://marketplace.visualstudio.com/items?itemName=jaynightmare.doc-generator">
      <img src="https://img.shields.io/visual-studio-marketplace/v/jaynightmare.doc-generator?label=VS%20Code%20Marketplace&style=flat-square" alt="VS Code Marketplace" />
    </a>
    
---

  </div>
</div>

Right–click any file (or press the icon on the toolbar), choose **"Generate documentation for File"**, and the extension will:

1. Send the file contents to an AI model.
2. Insert appropriate documentation comments into the code.
3. Replace the original file with the documented version.

This tool is designed for teaching and learning: students keep control of their own API keys and can use free-tier access from OpenRouter, Groq, or any OpenAI-compatible provider.

---

## Table of Contents
- [Table of Contents](#table-of-contents)
- [Features](#features)
- [Requirements](#requirements)
- [First-time setup](#first-time-setup)
- [Extension Settings](#extension-settings)
- [Prompt Used for documentation Generation](#prompt-used-for-documentation-generation)
- [Known Issues](#known-issues)

---

## Features

- **Context menu integration**
  - Right–click in the **editor** on a file.
  - Choose **"Generate documentation for File"**.
- **Toolbar button**
  - Click the button in the top-right corner of the editor when a file is open.
- **Automatic documentation generation**
  - documentation for:
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
1. Launch the command palette and run **Doc Generator: Open Setup** (also available from the `Get Started` walkthrough card).
2. Enter the author name you want to appear in the `@author` tag.
3. Paste your OpenRouter (or other provider) API key.
4. Keep the default endpoint/model, or adjust them if you prefer another host.
5. Press **Save settings**.

You can reopen the setup panel at any time via the same command.

To verify everything, right–click a file and choose **"Generate documentation for File"**. If configuration is complete, the extension will process the file and add documentation comments.

---

## Extension Settings
This extension contributes the following settings:
* `doc-generator.apiKey`: Your API key for the AI provider (e.g., OpenRouter or Groq).
* `doc-generator.endpoint`: The API endpoint URL for the provider (defaults to OpenRouter-compatible Groq endpoint).
* `doc-generator.model`: The model name to use for generating documentation (default is OpenRouter's `llama-3.1-8b-instant`).
* `doc-generator.name`: Optional author name inserted into generated comments.

---

## Prompt Used for documentation Generation
The extension uses different configurations for different languages; The prompts for each language are stored in the [`prompts.js`](https://github.com/JayNightmare/Doc-Generator/blob/main/src/libs/prompts.js) file 

---

## Known Issues
- The extension relies on the AI model's understanding of the file; results may vary based on the model's capabilities.
  - I recommend testing with small files first to verify quality
  - and also using the default model provided.
- Pressing the "Generate documentation for File" command repeatedly in quick succession causes file "corruption" (e.g., missing code sections due to the model replacing lines that don't exist).
  - **Avoid** rapid repeated invocations to prevent this issue.
  - **Consider** saving your work before generating documentation to avoid data loss.
  - **WAIT** for one generation to complete before starting another.
- Network issues or invalid API keys will prevent documentation generation.
  - Ensure your API key is correct and your network connection is stable.

If you encounter any issues or have suggestions for improvement, please open an issue on the [GitHub repository](https://github.com/jaynightmare/doc-generator-Generator/issues).