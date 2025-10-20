import { RouletteColor } from './types';

// --- Core Game Constants ---
export const ROULETTE_NUMBERS = Array.from({ length: 37 }, (_, i) => i);
export const ROULETTE_ORDER = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
export const TILE_WIDTH = 80;
export const TILE_GAP = 8;
export const TILE_STEP = TILE_WIDTH + TILE_GAP;

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

/**
 * Determines the color of a given roulette number.
 * @param {number} num - The roulette number (0-36).
 * @returns {RouletteColor} 'red', 'green', or 'black'.
 */
export const getNumberColor = (num: number): RouletteColor => {
    if (num === 0) return 'green';
    if (RED_NUMBERS.includes(num)) return 'red';
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

async function hmacSha256(secret: string, message: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey( "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
    return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates the winning roulette number based on seeds and nonce for a 37-number wheel.
 */
export async function getWinningNumber(serverSeed: string, clientSeed: string, nonce: number): Promise<number> {
    const message = `${clientSeed}-${nonce}`;
    const hash = await hmacSha256(serverSeed, message);
    const subHash = hash.substring(0, 8);
    const intValue = parseInt(subHash, 16);
    return intValue % 37;
}