/**
 * 🎵 AUDIO MANAGER - Centralized Audio System (Fixed Version)
 * 
 * Fitur:
 * - Background music untuk setiap game
 * - Sound effects untuk berbagai event
 * - Volume control
 * - Audio preloading dengan fallback
 * - Cross-browser compatibility
 * - Error handling yang lebih baik
 */

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.7;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.8;
        this.isMuted = false;
        
        // Audio elements storage
        this.audioElements = {};
        this.currentMusic = null;
        
        // Audio status
        this.audioLoaded = false;
        this.audioErrors = [];
        
        // Initialize audio context
        this.initAudioContext();
        
        // Preload all audio files
        this.preloadAudio();
    }
    
    /**
     * Initialize Web Audio API context
     */
    initAudioContext() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            console.log('🎵 Audio context initialized successfully');
        } catch (error) {
            console.warn('⚠️ Web Audio API not supported, falling back to HTML5 Audio');
        }
    }
    
    /**
     * Preload all audio files
     */
    preloadAudio() {
        const audioFiles = {
            // Background Music
            'snake-bg': 'audio/snake-background.mp3',
            'tictactoe-bg': 'audio/tictactoe-background.mp3',
            'memory-bg': 'audio/memory-background.mp3',
            'flappy-bg': 'audio/flappy-background.mp3',
            'breakout-bg': 'audio/breakout-background.mp3',
            'puzzle-bg': 'audio/puzzle-background.mp3',
            'color-bg': 'audio/color-background.mp3',
            'rps-bg': 'audio/rps-background.mp3',
            'number-bg': 'audio/number-background.mp3',
            
            // Sound Effects - Game Events
            'game-start': 'audio/game-start.mp3',
            'game-over': 'audio/game-over.mp3',
            'game-win': 'audio/game-win.mp3',
            'game-draw': 'audio/game-draw.mp3',
            'game-pause': 'audio/game-pause.mp3',
            'game-resume': 'audio/game-resume.mp3',
            
            // Sound Effects - Actions
            'click': 'audio/click.mp3',
            'hover': 'audio/hover.mp3',
            'eat': 'audio/eat.mp3',
            'move': 'audio/move.mp3',
            'jump': 'audio/jump.mp3',
            'collect': 'audio/collect.mp3',
            'break': 'audio/break.mp3',
            'match': 'audio/match.mp3',
            'wrong': 'audio/wrong.mp3',
            'correct': 'audio/correct.mp3',
            'victory': 'audio/victory.mp3',
            'defeat': 'audio/defeat.mp3'
        };
        
        console.log('🎵 Starting audio preload...');
        
        // Create and preload audio elements
        Object.keys(audioFiles).forEach(key => {
            this.createAudioElement(key, audioFiles[key]);
        });
        
        // Check audio status after a delay
        setTimeout(() => {
            this.checkAudioStatus();
        }, 2000);
    }
    
    /**
     * Create and preload audio element
     */
    createAudioElement(key, src) {
        try {
            const audio = new Audio();
            audio.src = src;
            audio.preload = 'auto';
            audio.volume = this.getVolumeForType(key);
            
            // Add to storage
            this.audioElements[key] = audio;
            
            // Add event listeners for better error handling
            audio.addEventListener('canplaythrough', () => {
                console.log(`✅ Audio loaded: ${key}`);
            });
            
            audio.addEventListener('error', (e) => {
                console.warn(`⚠️ Audio failed to load: ${key}`, e);
                this.audioErrors.push(key);
            });
            
            // Preload audio
            audio.load();
            
        } catch (error) {
            console.warn(`⚠️ Failed to create audio element: ${key}`, error);
            this.audioErrors.push(key);
        }
    }
    
    /**
     * Check audio loading status
     */
    checkAudioStatus() {
        const totalAudio = Object.keys(this.audioElements).length;
        const loadedAudio = totalAudio - this.audioErrors.length;
        
        console.log(`🎵 Audio Status: ${loadedAudio}/${totalAudio} loaded successfully`);
        
        if (this.audioErrors.length > 0) {
            console.warn('⚠️ Audio files that failed to load:', this.audioErrors);
            console.log('💡 Tip: Add audio files to the audio/ directory or check file paths');
        }
        
        this.audioLoaded = loadedAudio > 0;
    }
    
    /**
     * Get appropriate volume for audio type
     */
    getVolumeForType(key) {
        if (key.includes('-bg')) {
            return this.musicVolume * this.masterVolume;
        } else {
            return this.sfxVolume * this.masterVolume;
        }
    }
    
    /**
     * Play background music for specific game
     */
    playBackgroundMusic(gameType) {
        const musicKey = `${gameType}-bg`;
        const music = this.audioElements[musicKey];
        
        if (!music) {
            console.warn(`⚠️ Background music not found: ${musicKey}`);
            return false;
        }
        
        if (this.isMuted) {
            console.log(`🔇 Audio muted, skipping background music: ${gameType}`);
            return false;
        }
        
        try {
            // Stop current music if playing
            if (this.currentMusic && this.currentMusic !== music) {
                this.currentMusic.pause();
                this.currentMusic.currentTime = 0;
            }
            
            // Play new music
            music.loop = true;
            music.volume = this.musicVolume * this.masterVolume;
            
            const playPromise = music.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        this.currentMusic = music;
                        console.log(`🎵 Playing background music: ${gameType}`);
                    })
                    .catch(error => {
                        console.warn(`⚠️ Failed to play background music: ${gameType}`, error);
                        // Try to resume audio context if suspended
                        if (this.audioContext && this.audioContext.state === 'suspended') {
                            this.audioContext.resume();
                        }
                    });
            }
            
            return true;
        } catch (error) {
            console.warn(`⚠️ Error playing background music: ${gameType}`, error);
            return false;
        }
    }
    
    /**
     * Stop background music
     */
    stopBackgroundMusic() {
        if (this.currentMusic) {
            try {
                this.currentMusic.pause();
                this.currentMusic.currentTime = 0;
                this.currentMusic = null;
                console.log('🔇 Background music stopped');
            } catch (error) {
                console.warn('⚠️ Error stopping background music:', error);
            }
        }
    }
    
    /**
     * Play sound effect
     */
    playSound(soundKey) {
        const sound = this.audioElements[soundKey];
        
        if (!sound) {
            console.warn(`⚠️ Sound effect not found: ${soundKey}`);
            return false;
        }
        
        if (this.isMuted) {
            return false;
        }
        
        try {
            // Reset audio to beginning
            sound.currentTime = 0;
            sound.volume = this.sfxVolume * this.masterVolume;
            
            // Play sound
            const playPromise = sound.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log(`🔊 Playing sound: ${soundKey}`);
                    })
                    .catch(error => {
                        console.warn(`⚠️ Failed to play sound: ${soundKey}`, error);
                    });
            }
            
            return true;
        } catch (error) {
            console.warn(`⚠️ Error playing sound: ${soundKey}`, error);
            return false;
        }
    }
    
    /**
     * Play game event sound
     */
    playGameEvent(event) {
        switch (event) {
            case 'start':
                return this.playSound('game-start');
            case 'over':
                return this.playSound('game-over');
            case 'win':
                return this.playSound('game-win');
            case 'draw':
                return this.playSound('game-draw');
            case 'pause':
                return this.playSound('game-pause');
            case 'resume':
                return this.playSound('game-resume');
            default:
                console.warn(`⚠️ Unknown game event: ${event}`);
                return false;
        }
    }
    
    /**
     * Play action sound
     */
    playAction(action) {
        switch (action) {
            case 'click':
                return this.playSound('click');
            case 'hover':
                return this.playSound('hover');
            case 'eat':
                return this.playSound('eat');
            case 'move':
                return this.playSound('move');
            case 'jump':
                return this.playSound('jump');
            case 'collect':
                return this.playSound('collect');
            case 'break':
                return this.playSound('break');
            case 'match':
                return this.playSound('match');
            case 'wrong':
                return this.playSound('wrong');
            case 'correct':
                return this.playSound('correct');
            case 'victory':
                return this.playSound('victory');
            case 'defeat':
                return this.playSound('defeat');
            default:
                console.warn(`⚠️ Unknown action: ${action}`);
                return false;
        }
    }
    
    /**
     * Set master volume
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
    }
    
    /**
     * Set music volume
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
    }
    
    /**
     * Set SFX volume
     */
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
    }
    
    /**
     * Update all audio volumes
     */
    updateAllVolumes() {
        Object.keys(this.audioElements).forEach(key => {
            const audio = this.audioElements[key];
            if (audio) {
                audio.volume = this.getVolumeForType(key);
            }
        });
    }
    
    /**
     * Mute/Unmute all audio
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.stopBackgroundMusic();
        } else if (this.currentMusic) {
            this.currentMusic.play().catch(() => {});
        }
        
        console.log(`🔇 Audio ${this.isMuted ? 'muted' : 'unmuted'}`);
        return this.isMuted;
    }
    
    /**
     * Get current mute status
     */
    isAudioMuted() {
        return this.isMuted;
    }
    
    /**
     * Get current volumes
     */
    getVolumes() {
        return {
            master: this.masterVolume,
            music: this.musicVolume,
            sfx: this.sfxVolume
        };
    }
    
    /**
     * Get audio status
     */
    getAudioStatus() {
        return {
            loaded: this.audioLoaded,
            totalFiles: Object.keys(this.audioElements).length,
            errorFiles: this.audioErrors.length,
            errors: this.audioErrors
        };
    }
    
    /**
     * Test audio playback
     */
    testAudioPlayback() {
        console.log('🧪 Testing audio playback...');
        
        // Test a simple sound effect
        if (this.playSound('click')) {
            console.log('✅ Audio playback test successful');
        } else {
            console.log('❌ Audio playback test failed');
        }
    }
    
    /**
     * Cleanup audio resources
     */
    cleanup() {
        this.stopBackgroundMusic();
        
        Object.values(this.audioElements).forEach(audio => {
            if (audio) {
                audio.pause();
                audio.src = '';
            }
        });
        
        this.audioElements = {};
        
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// Create global audio manager instance
window.AudioManager = AudioManager;
window.audioManager = new AudioManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
}
