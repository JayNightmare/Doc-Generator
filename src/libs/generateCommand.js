// //
// * File Imports * //
import stripMarkdownCodeFence from "../utils/stripFence.js";
import { getPrompt } from "./prompts.js";

// * External Imports * //
import * as vscode from "vscode";
// //

export const GENERATING_CONTEXT_KEY = "doc-generator.generating";
let isGenerating = false;

async function setGeneratingState(value) {
    isGenerating = value;
    await vscode.commands.executeCommand(
        "setContext",
        GENERATING_CONTEXT_KEY,
        value
    );
}

export default async function generateJavadocCommand(uri) {
    if (isGenerating) {
        vscode.window.showInformationMessage(
            "Documentation generation is already in progress."
        );
        return;
    }

    const editor = vscode.window.activeTextEditor;

    const targetUri =
        uri || (editor && editor.document && editor.document.uri) || undefined;

    if (!targetUri) {
        vscode.window.showErrorMessage("No file selected or active.");
        return;
    }

    const document = await vscode.workspace.openTextDocument(targetUri);

    const originalText = document.getText();
    if (!originalText.trim()) {
        vscode.window.showWarningMessage("File is empty; nothing to document.");
        return;
    }

    const config = vscode.workspace.getConfiguration("doc-generator");
    const apiKey = config.get("apiKey");
    const model = config.get("model") || "gpt-4.1-mini";
    const endpoint =
        config.get("endpoint") || "https://api.openai.com/v1/chat/completions";
    const username = config.get("name");

    if (!apiKey) {
        const action = await vscode.window.showErrorMessage(
            "Set doc-generator.apiKey in Settings before using this command.",
            "Open setup"
        );
        if (action === "Open setup") {
            await vscode.commands.executeCommand(
                "doc-generator.openOnboarding"
            );
        }
        return;
    }

    let statusBar;

    try {
        const prompt = getPrompt(document.languageId, originalText, username);

        await setGeneratingState(true);
        statusBar = vscode.window.setStatusBarMessage(
            "$(sparkle) Generating Documentation…"
        );

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages: [
                    {
                        role: "system",
                        content:
                            "You rewrite code by inserting appropriate documentation comments while preserving the code behaviour.",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
            }),
        });

        if (!response.ok) {
            const body = await response.text();
            vscode.window.showErrorMessage(
                `Doc Generator: API call failed (${response.status}). See Output panel for details.`
            );
            const channel = vscode.window.createOutputChannel("doc-generator");
            channel.appendLine(`HTTP ${response.status}`);
            channel.appendLine(body);
            channel.show(true);
            return;
        }

        const data = await response.json();
        const updated =
            data &&
            // @ts-ignore
            data.choices &&
            // @ts-ignore
            data.choices[0] &&
            // @ts-ignore
            data.choices[0].message &&
            // @ts-ignore
            data.choices[0].message.content;

        if (typeof updated !== "string" || !updated.trim()) {
            vscode.window.showErrorMessage(
                "Doc Generator: Empty response from model."
            );
            return;
        }

        const cleaned = stripMarkdownCodeFence(updated);

        const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(originalText.length)
        );

        const edit = new vscode.WorkspaceEdit();
        edit.replace(targetUri, fullRange, cleaned);

        const applied = await vscode.workspace.applyEdit(edit);

        if (!applied) {
            vscode.window.showErrorMessage(
                "Doc Generator: Failed to apply edit."
            );
            return;
        }

        await document.save();
        vscode.window.showInformationMessage(
            "Documentation generated successfully."
        );
    } catch (err) {
        vscode.window.showErrorMessage(
            `Doc Generator: ${String(err && err.message ? err.message : err)}`
        );
    } finally {
        if (statusBar) {
            statusBar.dispose();
        }

        await setGeneratingState(false);
    }
}
