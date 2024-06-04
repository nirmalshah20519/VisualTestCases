import { Label } from "./types";

// src/utils.ts
export function positionOfNextToken(sentence: string, cursor: number, token: string): number {
    // Simple implementation assuming tokens are separated by spaces
    const subSentence = sentence.substring(cursor);
    const tokenIndex = subSentence.indexOf(token);
    return tokenIndex >= 0 ? tokenIndex : subSentence.length;
}

export function isEvent(label: string): boolean {
    return label.includes("Event");
}

export function connectLabels(labels: Label[]): void {
    // Implementation can connect labels as necessary
    // This is a placeholder to illustrate functionality
}
