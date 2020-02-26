
const speechSynthesis = window.speechSynthesis;

export function speakText(text: string): void {
    if (!speechSynthesis || !speechSynthesis.speak) {
        alert('Speech synthesis is disabled or not supported in your browser.');
        return;
    }

    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.pitch = 1; // 0-2
    utterance.rate = 1.4; // 0.1-10
    utterance.volume = 0.8; // 0-1

    speechSynthesis.speak(utterance);
}

export function cancelSpeech(): void {
    speechSynthesis.cancel();
}
