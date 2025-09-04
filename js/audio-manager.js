/**
 * 🎵 AUDIO MANAGER - Centralized Audio System
 * 
 * Fitur:
 * - Background music untuk setiap game
 * - Sound effects untuk berbagai event
 * - Volume control
 * - Audio preloading
 * - Cross-browser compatibility
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
            console.log('Audio context initialized successfully');
        } catch (error) {
            console.warn('Web Audio API not supported, falling back to HTML5 Audio');
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
        
        // Create and preload audio elements
        Object.keys(audioFiles).forEach(key => {
            this.createAudioElement(key, audioFiles[key]);
        });
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
            
            // Preload audio
            audio.load();
            
            console.log(`Audio preloaded: ${key}`);
        } catch (error) {
            console.warn(`Failed to preload audio: ${key}`, error);
        }
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
        
        if (music && !this.isMuted) {
            // Stop current music if playing
            if (this.currentMusic && this.currentMusic !== music) {
                this.currentMusic.pause();
                this.currentMusic.currentTime = 0;
            }
            
            // Play new music
            music.loop = true;
            music.volume = this.musicVolume * this.masterVolume;
            music.play().catch(error => {
                console.warn('Failed to play background music:', error);
            });
            
            this.currentMusic = music;
            console.log(`Playing background music: ${gameType}`);
        }
    }
    
    /**
     * Stop background music
     */
    stopBackgroundMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
            this.currentMusic = null;
            console.log('Background music stopped');
        }
    }
    
    /**
     * Play sound effect
     */
    playSound(soundKey) {
        const sound = this.audioElements[soundKey];
        
        if (sound && !this.isMuted) {
            // Reset audio to beginning
            sound.currentTime = 0;
            sound.volume = this.sfxVolume * this.masterVolume;
            
            // Play sound
            sound.play().catch(error => {
                console.warn('Failed to play sound:', error);
            });
            
            console.log(`Playing sound: ${soundKey}`);
        }
    }
    
    /**
     * Play game event sound
     */
    playGameEvent(event) {
        switch (event) {
            case 'start':
                this.playSound('game-start');
                break;
            case 'over':
                this.playSound('game-over');
                break;
            case 'win':
                this.playSound('game-win');
                break;
            case 'draw':
                this.playSound('game-draw');
                break;
            case 'pause':
                this.playSound('game-pause');
                break;
            case 'resume':
                this.playSound('game-resume');
                break;
        }
    }
    
    /**
     * Play action sound
     */
    playAction(action) {
        switch (action) {
            case 'click':
                this.playSound('click');
                break;
            case 'hover':
                this.playSound('hover');
                break;
            case 'eat':
                this.playSound('eat');
                break;
            case 'move':
                this.playSound('move');
                break;
            case 'jump':
                this.playSound('jump');
                break;
            case 'collect':
                this.playSound('collect');
                break;
            case 'break':
                this.playSound('break');
                break;
            case 'match':
                this.playSound('match');
                break;
            case 'wrong':
                this.playSound('wrong');
                break;
            case 'correct':
                this.playSound('correct');
                break;
            case 'victory':
                this.playSound('victory');
                break;
            case 'defeat':
                this.playSound('defeat');
                break;
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
        
        console.log(`Audio ${this.isMuted ? 'muted' : 'unmuted'}`);
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
