// //
// * File Imports * //
import stripMarkdownCodeFence from "../utils/stripFence.js";

// * External Imports * //
import * as vscode from "vscode";
// //

export const GENERATING_CONTEXT_KEY = "kuJavadoc.generating";
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
            "Javadoc generation is already in progress."
        );
        return;
    }

    const editor = vscode.window.activeTextEditor;

    const targetUri =
        uri || (editor && editor.document && editor.document.uri) || undefined;

    if (!targetUri) {
        vscode.window.showErrorMessage("No Java file selected or active.");
        return;
    }

    const document = await vscode.workspace.openTextDocument(targetUri);

    if (
        document.languageId !== "java" &&
        !document.fileName.endsWith(".java")
    ) {
        vscode.window.showErrorMessage("Selected file is not a Java file.");
        return;
    }

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
        await setGeneratingState(true);
        statusBar = vscode.window.setStatusBarMessage(
            "$(sparkle) Generating Javadoc…"
        );

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
                            "You rewrite Java code by inserting appropriate Javadoc comments while preserving the code behaviour.",
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
                `KU Javadoc: API call failed (${response.status}). See Output panel for details.`
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
                "KU Javadoc: Empty response from model."
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
            vscode.window.showErrorMessage("KU Javadoc: Failed to apply edit.");
            return;
        }

        await document.save();
        vscode.window.showInformationMessage("Javadoc generated successfully.");
    } catch (err) {
        vscode.window.showErrorMessage(
            `KU Javadoc: ${String(err && err.message ? err.message : err)}`
        );
    } finally {
        if (statusBar) {
            statusBar.dispose();
        }

        await setGeneratingState(false);
    }
}
