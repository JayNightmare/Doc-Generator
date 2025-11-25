// //
// * File Imports * //
import generateJavadocCommand, {
    GENERATING_CONTEXT_KEY,
} from "./libs/generateCommand.js";
import getOnboardingHtml from "./webviews/onboardingHtml.js";

// * External Imports * //
import * as vscode from "vscode";
// //

let onboardingPanel;

export function activate(context) {
    const disposable = vscode.commands.registerCommand(
        "doc-generator.generateFileDocs",
        generateJavadocCommand
    );

    const busyDisposable = vscode.commands.registerCommand(
        "doc-generator.generateFileDocsBusy",
        () => {
            vscode.window.showInformationMessage(
                "Documentation generation is already in progress."
            );
        }
    );

    const onboardingDisposable = vscode.commands.registerCommand(
        "doc-generator.openOnboarding",
        () => {
            openOnboardingPanel(context);
        }
    );

    void vscode.commands.executeCommand(
        "setContext",
        GENERATING_CONTEXT_KEY,
        false
    );

    void promptForSetupIfNeeded();

    context.subscriptions.push(
        disposable,
        busyDisposable,
        onboardingDisposable
    );
}

export function deactivate() {}

function openOnboardingPanel(context) {
    if (onboardingPanel) {
        onboardingPanel.reveal();
        return;
    }

    onboardingPanel = vscode.window.createWebviewPanel(
        "kuJavadocSetup",
        "Doc Generator Setup",
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            retainContextWhenHidden: true,
        }
    );

    onboardingPanel.iconPath = vscode.Uri.joinPath(
        context.extensionUri,
        "src",
        "images",
        "public",
        "doc-generator.png"
    );

    const currentSettings = getCurrentSettings();
    onboardingPanel.webview.html = getOnboardingHtml(
        onboardingPanel.webview,
        currentSettings
    );

    onboardingPanel.onDidDispose(() => {
        onboardingPanel = undefined;
    });

    onboardingPanel.webview.onDidReceiveMessage((message) => {
        handleOnboardingMessage(message, onboardingPanel);
    });
}

function getCurrentSettings() {
    const config = vscode.workspace.getConfiguration("doc-generator");
    return {
        name: config.get("name") || "",
        apiKey: config.get("apiKey") || "",
        endpoint: config.get("endpoint") || "",
        model: config.get("model") || "",
    };
}

async function handleOnboardingMessage(message, panel) {
    if (!message || typeof message !== "object") {
        return;
    }

    if (message.type === "close") {
        panel.dispose();
        return;
    }

    if (message.type === "save") {
        const result = await persistSettings(message.payload);
        panel.webview.postMessage({
            type: "saveResult",
            success: result.success,
            error: result.error,
        });

        if (result.success) {
            vscode.window.showInformationMessage(
                "Doc Generator settings saved."
            );
        }
        return;
    }
}

async function persistSettings(payload) {
    const config = vscode.workspace.getConfiguration("doc-generator");
    const nextValues = {
        name: (payload?.name || "").trim(),
        apiKey: (payload?.apiKey || "").trim(),
        endpoint: (payload?.endpoint || "").trim(),
        model: (payload?.model || "").trim(),
    };

    if (!nextValues.apiKey) {
        return { success: false, error: "API key is required." };
    }

    try {
        await Promise.all([
            config.update(
                "name",
                nextValues.name,
                vscode.ConfigurationTarget.Global
            ),
            config.update(
                "apiKey",
                nextValues.apiKey,
                vscode.ConfigurationTarget.Global
            ),
            config.update(
                "endpoint",
                nextValues.endpoint,
                vscode.ConfigurationTarget.Global
            ),
            config.update(
                "model",
                nextValues.model,
                vscode.ConfigurationTarget.Global
            ),
        ]);

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error && error.message ? error.message : String(error),
        };
    }
}

async function promptForSetupIfNeeded() {
    const config = vscode.workspace.getConfiguration("doc-generator");
    if (config.get("apiKey")) {
        return;
    }

    const selection = await vscode.window.showInformationMessage(
        "Provide your OpenRouter API key to finish setting up Doc Generator.",
        "Open setup",
        "Dismiss"
    );

    if (selection === "Open setup") {
        await vscode.commands.executeCommand("doc-generator.openOnboarding");
    }
}
