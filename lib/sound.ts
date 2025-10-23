// Using reliable CDN links for audio assets
export const SOUNDS = {
    CHIP_PLACE: 'https://cdn.pixabay.com/audio/2022/03/15/audio_73ed8c34f8.mp3',
    ROULETTE_SPIN: 'https://cdn.pixabay.com/audio/2021/08/04/audio_99c3c137df.mp3',
    ROULETTE_LAND: 'https://cdn.pixabay.com/audio/2022/03/22/audio_f833b1e32e.mp3',
    DICE_ROLL: 'https://cdn.pixabay.com/audio/2022/03/10/audio_974729a071.mp3',
    GEM_REVEAL: 'https://cdn.pixabay.com/audio/2022/03/10/audio_19b78e388c.mp3',
    MINE_REVEAL: 'https://cdn.pixabay.com/audio/2022/03/13/audio_22883a4788.mp3',
    CASHOUT: 'https://cdn.pixabay.com/audio/2022/03/10/audio_e6e06c152a.mp3',
    BLACKJACK_WIN: 'https://cdn.pixabay.com/audio/2022/03/17/audio_ab91e641cd.mp3',
    CARD_DEAL: 'https://cdn.pixabay.com/audio/2022/03/09/audio_7f9cd29413.mp3',
    CRASH_TICK: 'https://cdn.pixabay.com/audio/2022/11/17/audio_8783088b9c.mp3',
    CRASH_EXPLODE: 'https://cdn.pixabay.com/audio/2022/03/21/audio_a18118d09a.mp3',
} as const;

type SoundURL = typeof SOUNDS[keyof typeof SOUNDS];

class SoundManager {
    private isMuted: boolean = false;
    private audioCache: Map<SoundURL, HTMLAudioElement> = new Map();
    private activeSounds: Set<HTMLAudioElement> = new Set();
    private loopingSounds: Map<SoundURL, HTMLAudioElement> = new Map();

    constructor() {
        try {
            const storedMute = localStorage.getItem('isSoundMuted');
            this.isMuted = storedMute ? JSON.parse(storedMute) : false;
        } catch (e) {
            console.error("Could not load sound mute state from localStorage", e);
            this.isMuted = false;
        }
    }
    
    // Preload sounds for better performance
    public preload(sounds: SoundURL[]) {
        sounds.forEach(url => this.getAudio(url));
    }

    private getAudio(src: SoundURL): HTMLAudioElement {
        if (this.audioCache.has(src)) {
            return this.audioCache.get(src)!.cloneNode() as HTMLAudioElement;
        }
        const audio = new Audio(src);
        audio.preload = 'auto';
        this.audioCache.set(src, audio);
        return audio.cloneNode() as HTMLAudioElement;
    }

    getMuteState = (): boolean => {
        return this.isMuted;
    }

    toggleMute = (): boolean => {
        this.isMuted = !this.isMuted;
        try {
            localStorage.setItem('isSoundMuted', JSON.stringify(this.isMuted));
        } catch (e) {
            console.error("Could not save sound mute state to localStorage", e);
        }
        
        if (this.isMuted) {
            this.activeSounds.forEach(audio => {
                if (!audio.paused) {
                    audio.pause();
                    audio.currentTime = 0;
                }
            });
            this.activeSounds.clear();
            this.stopAllLoops();
        }

        return this.isMuted;
    }

    play = (soundUrl: SoundURL, options: { volume?: number; duration?: number } = {}) => {
        if (this.isMuted) return;

        const { volume = 0.5, duration } = options;

        try {
            const audio = this.getAudio(soundUrl);
            audio.volume = volume;

            const playPromise = audio.play();

            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn(`Audio playback was prevented for ${soundUrl}. This is common in browsers until the user interacts with the page.`, error);
                });
            }
            
            this.activeSounds.add(audio);

            const onEnded = () => {
                this.activeSounds.delete(audio);
                audio.removeEventListener('ended', onEnded);
            };
            audio.addEventListener('ended', onEnded);
            
            if (duration) {
                setTimeout(() => {
                    if (!audio.paused) {
                        audio.pause();
                        audio.currentTime = 0; 
                        this.activeSounds.delete(audio);
                        // Manually trigger the ended event logic in case it hasn't fired
                        onEnded();
                    }
                }, duration);
            }
        } catch (error) {
            console.error(`Error playing sound: ${soundUrl}`, error);
        }
    }

    playLoop = (soundUrl: SoundURL, volume: number = 0.2) => {
        if (this.isMuted || this.loopingSounds.has(soundUrl)) return;
        
        try {
            const audio = this.getAudio(soundUrl);
            audio.volume = volume;
            audio.loop = true;
            audio.play().catch(e => console.warn(`Looping audio playback was prevented for ${soundUrl}:`, e));
            this.loopingSounds.set(soundUrl, audio);
        } catch (error) {
            console.error(`Error playing loop sound: ${soundUrl}`, error);
        }
    }
    
    stopLoop = (soundUrl: SoundURL) => {
        const audio = this.loopingSounds.get(soundUrl);
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
            this.loopingSounds.delete(soundUrl);
        }
    }
    
    stopAllLoops = () => {
        this.loopingSounds.forEach((audio) => {
            audio.pause();
            audio.currentTime = 0;
        });
        this.loopingSounds.clear();
    }
}

export const soundManager = new SoundManager();