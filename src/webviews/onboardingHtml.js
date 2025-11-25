function getNonce() {
    const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let text = "";
    for (let i = 0; i < 32; i += 1) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export default function getOnboardingHtml(webview, initialValues) {
    const nonce = getNonce();
    const state = {
        name: initialValues.name || "",
        apiKey: initialValues.apiKey || "",
        endpoint:
            initialValues.endpoint ||
            "https://api.groq.com/openai/v1/chat/completions",
        model: initialValues.model || "llama-3.1-8b-instant",
    };

    const stateJson = JSON.stringify(state).replace(/</g, "\\u003c");

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} https:;" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>KU Javadoc Setup</title>
<style>
body {
    font-family: var(--vscode-font-family);
    background: var(--vscode-editor-background);
    color: var(--vscode-editor-foreground);
    margin: 0;
    padding: 24px;
}
main {
    max-width: 520px;
    margin: 0 auto;
}
h1 {
    font-size: 1.4rem;
    margin-bottom: 0.5rem;
}
p.description {
    margin-top: 0;
    color: var(--vscode-descriptionForeground);
}
form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 1.5rem;
}
label {
    font-weight: 600;
}
input {
    width: 100%;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid var(--vscode-input-border, var(--vscode-editorWidget-border));
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
}
input:focus {
    outline: 1px solid var(--vscode-focusBorder);
}
small {
    color: var(--vscode-descriptionForeground);
}
.actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}
button {
    border: none;
    border-radius: 4px;
    padding: 6px 14px;
    cursor: pointer;
}
button.primary {
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
}
button.primary:disabled {
    opacity: 0.4;
    cursor: default;
}
button.secondary {
    background: transparent;
    color: var(--vscode-button-secondaryForeground, var(--vscode-button-background));
    border: 1px solid var(--vscode-button-border, var(--vscode-button-background));
}
.alert {
    margin-top: 12px;
    padding: 8px 12px;
    border-radius: 4px;
}
.alert.error {
    background: var(--vscode-inputValidation-errorBackground);
    color: var(--vscode-inputValidation-errorForeground);
}
.alert.success {
    background: var(--vscode-inputValidation-infoBackground);
    color: var(--vscode-inputValidation-infoForeground);
}
</style>
</head>
<body>
<main>
    <h1>Finish setting up KU Javadoc</h1>
    <p class="description">
        Provide your author details and API credentials once. You can edit these later from VS Code settings.
    </p>
    <form id="doc-generator-form">
        <div>
            <label for="name">Author name (optional)</label>
            <input id="name" name="name" type="text" placeholder="e.g. Jane Doe" />
            <small>Used to populate the @author tag.</small>
        </div>
        <div>
            <label for="apiKey">OpenRouter API key *</label>
            <input id="apiKey" name="apiKey" type="password" placeholder="sk-..." required />
            <small>Generate a key at <a href="https://openrouter.ai/keys" target="_blank" rel="noopener">openrouter.ai</a>.</small>
        </div>
        <div>
            <label for="endpoint">Endpoint URL</label>
            <input id="endpoint" name="endpoint" type="text" />
            <small>OpenAI-compatible chat completions endpoint.</small>
        </div>
        <div>
            <label for="model">Model</label>
            <input id="model" name="model" type="text" />
            <small>Pick any OpenRouter-supported model.</small>
        </div>
        <div class="actions">
            <button class="primary" type="submit" id="save-btn">Save settings</button>
            <button class="secondary" type="button" id="close-btn">Close</button>
        </div>
        <div id="status" class="alert" hidden></div>
    </form>
</main>
<script nonce="${nonce}">
const vscode = acquireVsCodeApi();
const initialState = ${stateJson};

const form = document.getElementById("doc-generator-form");
const statusNode = document.getElementById("status");
const saveBtn = document.getElementById("save-btn");
const closeBtn = document.getElementById("close-btn");

function setStatus(message, type) {
    if (!message) {
        statusNode.hidden = true;
        statusNode.textContent = "";
        statusNode.className = "alert";
        return;
    }
    statusNode.hidden = false;
    statusNode.textContent = message;
    statusNode.className = \`alert \${type}\`;
}

function fillInitialValues() {
    form.name.value = initialState.name || "";
    form.apiKey.value = initialState.apiKey || "";
    form.endpoint.value = initialState.endpoint || "";
    form.model.value = initialState.model || "";
}

function toggleSaving(isSaving) {
    saveBtn.disabled = isSaving;
    saveBtn.textContent = isSaving ? "Saving…" : "Save settings";
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const payload = {
        name: form.name.value.trim(),
        apiKey: form.apiKey.value.trim(),
        endpoint: form.endpoint.value.trim(),
        model: form.model.value.trim(),
    };

    if (!payload.apiKey) {
        setStatus("API key is required.", "error");
        return;
    }

    toggleSaving(true);
    setStatus("", "");
    vscode.postMessage({ type: "save", payload });
});

closeBtn.addEventListener("click", () => {
    vscode.postMessage({ type: "close" });
});

window.addEventListener("message", (event) => {
    const message = event.data;
    if (!message) {
        return;
    }

    if (message.type === "saveResult") {
        toggleSaving(false);
        if (message.success) {
            setStatus("Settings saved. You're ready to generate docs!", "success");
        } else {
            setStatus(message.error || "Failed to save settings.", "error");
        }
    }
});

fillInitialValues();
</script>
</body>
</html>`;
}
