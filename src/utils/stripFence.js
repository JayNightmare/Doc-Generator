export default function stripMarkdownCodeFence(text) {
    const fencePattern = /```(?:java)?\s*([\s\S]*?)```/i;
    const match = text.match(fencePattern);
    if (match && match[1]) {
        return match[1].trimStart();
    }
    return text;
}
