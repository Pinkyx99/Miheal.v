/**
 * Parses a duration string (e.g., "5m", "1h", "7d") into a PostgreSQL interval string.
 * @param durationStr The duration string to parse.
 * @returns A string formatted for PostgreSQL interval type, or null if the format is invalid.
 */
export function parseDurationToPostgresInterval(durationStr: string): string | null {
    if (durationStr.toLowerCase() === 'perm' || durationStr.toLowerCase() === 'permanent') {
        return 'infinity';
    }

    const match = durationStr.match(/^(\d+)(s|m|h|d|w|M|y)$/i);
    if (!match) return null; // Invalid format
    
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    switch (unit) {
        case 's': return `${value} seconds`;
        case 'm': return `${value} minutes`;
        case 'h': return `${value} hours`;
        case 'd': return `${value} days`;
        case 'w': return `${value} weeks`;
        case 'M': return `${value} months`;
        case 'y': return `${value} years`;
        default: return null;
    }
}

/**
 * Calculates an expiration timestamp from a duration string.
 * @param durationStr The duration string (e.g., "30m", "12h", "7d", "perm").
 * @returns An ISO string for the future date, or null for a permanent duration.
 */
export function calculateExpiryDate(durationStr: string): string | null {
    if (!durationStr || durationStr.toLowerCase() === 'perm' || durationStr.toLowerCase() === 'permanent') {
        return null; // Permanent
    }

    const match = durationStr.match(/^(\d+)(m|h|d|w)$/i); // minutes, hours, days, weeks
    if (!match) {
        // As a safeguard, return null (permanent) for invalid formats to avoid accidentally short-lived announcements
        return null;
    }

    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    const date = new Date();

    switch (unit) {
        case 'm': date.setMinutes(date.getMinutes() + value); break;
        case 'h': date.setHours(date.getHours() + value); break;
        case 'd': date.setDate(date.getDate() + value); break;
        case 'w': date.setDate(date.getDate() + value * 7); break;
        default: return null;
    }

    return date.toISOString();
}
