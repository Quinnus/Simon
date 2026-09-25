// localStorage can be missing or throw (private browsing, blocked storage), so fall back quietly
export function loadValue(key, fallback) {
    try {
        const stored = localStorage.getItem(key);
        return stored === null ? fallback : JSON.parse(stored);
    } catch {
        return fallback;
    }
}

export function saveValue(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Not saved; the game still works
    }
}
