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