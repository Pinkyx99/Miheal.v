// Defines the wager thresholds and calculation logic for the player leveling system.
import { ROYALTY_RANKS } from '../constants';
import { RoyaltyRank } from '../types';

// Cumulative wager amounts required to reach each level. Index represents the level.
// LEVEL_THRESHOLDS[1] is the wager required to reach level 1.
export const LEVEL_THRESHOLDS: number[] = [];

// Initialize thresholds
const initialIncrements = [60, 84, 108, 126, 150, 240, 300, 360, 420, 480, 540, 600, 624, 660, 696, 720, 750, 930, 960, 1020, 1080, 1140, 1200];
let cumulativeWager = 0;
LEVEL_THRESHOLDS.push(cumulativeWager); // Level 0 requires $0

initialIncrements.forEach(inc => {
    cumulativeWager += inc;
    LEVEL_THRESHOLDS.push(cumulativeWager);
});

// For levels beyond the initial set (24 to 200)
for (let i = 24; i <= 200; i++) {
    // Increment increases by $180 for each level after 23 (previously $150)
    const increment = 1200 + (i - 24) * 180;
    cumulativeWager += increment;
    LEVEL_THRESHOLDS.push(cumulativeWager);
}


/**
 * Calculates a user's level information based on their total wagered amount.
 * @param wagered The total amount wagered by the user.
 * @returns An object containing the user's level, progress percentage to the next level,
 *          the wager amount required for the current level, and for the next level.
 */
export const calculateLevelInfo = (wagered: number) => {
    if (wagered < 0) wagered = 0;

    let level = 0;
    // Find the current level by checking which threshold has been passed
    while (level < LEVEL_THRESHOLDS.length - 1 && wagered >= LEVEL_THRESHOLDS[level + 1]) {
        level++;
    }

    const currentLevelWager = LEVEL_THRESHOLDS[level];
    const nextLevelWager = LEVEL_THRESHOLDS[level + 1];

    // Handle max level case
    if (nextLevelWager === undefined) {
        return {
            level,
            progress: 100,
            currentLevelWager,
            nextLevelWager: currentLevelWager // At max level, next target is the same as current
        };
    }

    const wagerInCurrentLevel = wagered - currentLevelWager;
    const wagerForNextLevel = nextLevelWager - currentLevelWager;

    // Handle case where wagerForNextLevel could be 0 if thresholds are configured improperly
    const progress = wagerForNextLevel > 0 ? (wagerInCurrentLevel / wagerForNextLevel) * 100 : 0;

    return {
        level,
        progress: Math.min(100, progress), // Cap progress at 100%
        currentLevelWager,
        nextLevelWager
    };
};

/**
 * Gets the highest rank a user has achieved based on their level.
 * @param level The user's current level.
 * @returns The corresponding RoyaltyRank object or null if no rank is achieved.
 */
export const getRankForLevel = (level: number): RoyaltyRank | null => {
    // Ranks are sorted by requirement, so iterate backwards to find the highest achieved rank
    for (let i = ROYALTY_RANKS.length - 1; i >= 0; i--) {
        if (level >= ROYALTY_RANKS[i].levelRequirement) {
            return ROYALTY_RANKS[i];
        }
    }
    return null;
};