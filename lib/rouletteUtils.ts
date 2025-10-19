import { RouletteColor } from './types';

// --- Core Game Constants ---
// As specified in the Gamdom UI visual spec
export const ROULETTE_ORDER = [0, 11, 5, 10, 6, 9, 7, 8, 1, 14, 2, 13, 3, 12, 4];
export const TILE_WIDTH = 80; // in px
export const TILE_GAP = 8; // in px
export const TILE_STEP = TILE_WIDTH + TILE_GAP; // 88px

// --- Helper Functions ---

/**
 * Determines the color of a given roulette number.
 * @param {number} num - The roulette number (0-14).
 * @returns {RouletteColor} 'red', 'green', or 'black'.
 */
export const getNumberColor = (num: number): RouletteColor => {
    if (num === 0) return 'green';
    if (num >= 1 && num <= 7) return 'red';
    return 'black';
};

/**
 * Returns the Tailwind CSS background color class for a given number.
 * @param {number} num - The roulette number.
 * @returns {string} The Tailwind class string.
 */
export const getNumberColorClass = (num: number): string => {
    const color = getNumberColor(num);
    switch (color) {
        case 'green': return 'bg-[#00C17B]';
        case 'red': return 'bg-[#F44336]';
        case 'black': return 'bg-[#212832]';
    }
};

// --- Provably Fair Cryptography ---

/**
 * Generates a cryptographically secure random string to be used as a server seed.
 * @returns {string} A 32-character hex string.
 */
export const generateServerSeed = (): string => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Computes an HMAC-SHA256 hash.
 * @param secret The secret key (server seed).
 * @param message The message to hash (client seed + nonce).
 * @returns A promise that resolves to the hex-encoded hash string.
 */
async function hmacSha256(secret: string, message: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
    return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates the winning roulette number based on seeds and nonce.
 * This function is the core of the provably fair system.
 * It takes the server seed, client seed, and a nonce, combines them,
 * and uses a standard HMAC-SHA256 hash to produce a deterministic outcome.
 * @param serverSeed The server's secret seed for the round.
 * @param clientSeed The user-provided client seed.
 * @param nonce The round number for the current seed pair.
 * @returns A promise that resolves to the winning number (0-14).
 */
export async function getWinningNumber(serverSeed: string, clientSeed: string, nonce: number): Promise<number> {
    const message = `${clientSeed}-${nonce}`;
    const hash = await hmacSha256(serverSeed, message);
    // Use first 8 chars (32 bits) for a large integer range.
    const subHash = hash.substring(0, 8);
    const intValue = parseInt(subHash, 16);
    // The result is the remainder when divided by the number of outcomes (15).
    return intValue % 15;
}