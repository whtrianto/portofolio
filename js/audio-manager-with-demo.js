/**
 * 🎵 AUDIO MANAGER - Centralized Audio System (With Demo Audio)
 * 
 * Fitur:
 * - Background music untuk setiap game
 * - Sound effects untuk berbagai event
 * - Volume control
 * - Demo audio built-in untuk testing
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
     * Create demo audio using Web Audio API
     */
    createDemoAudio(key, type = 'tone') {
        if (!this.audioContext) {
            console.warn('⚠️ Web Audio API not available for demo audio');
            return null;
        }
        
        try {
            const audioBuffer = this.audioContext.createBuffer(1, 44100 * 2, 44100); // 2 seconds
            const channelData = audioBuffer.getChannelData(0);
            
            let frequency = 440; // A4 note
            let duration = 2; // 2 seconds
            
            switch (type) {
                case 'music':
                    // Create a simple melody for background music
                    frequency = 220;
                    duration = 3;
                    for (let i = 0; i < audioBuffer.length; i++) {
                        const time = i / audioBuffer.sampleRate;
                        const note = Math.floor(time * 4) % 8; // 8 notes
                        const noteFreq = [220, 246.94, 277.18, 293.66, 329.63, 369.99, 415.30, 440][note];
                        channelData[i] = Math.sin(2 * Math.PI * noteFreq * time) * 0.3;
                    }
                    break;
                    
                case 'click':
                    // Create click sound
                    frequency = 800;
                    duration = 0.1;
                    for (let i = 0; i < audioBuffer.length * 0.05; i++) {
                        channelData[i] = Math.sin(2 * Math.PI * frequency * i / audioBuffer.sampleRate) * 0.5;
                    }
                    break;
                    
                case 'hover':
                    // Create hover sound
                    frequency = 600;
                    duration = 0.2;
                    for (let i = 0; i < audioBuffer.length * 0.1; i++) {
                        channelData[i] = Math.sin(2 * Math.PI * frequency * i / audioBuffer.sampleRate) * 0.3;
                    }
                    break;
                    
                case 'eat':
                    // Create eat sound
                    frequency = 400;
                    duration = 0.3;
                    for (let i = 0; i < audioBuffer.length * 0.15; i++) {
                        channelData[i] = Math.sin(2 * Math.PI * frequency * i / audioBuffer.sampleRate) * 0.4;
                    }
                    break;
                    
                case 'move':
                    // Create move sound
                    frequency = 300;
                    duration = 0.15;
                    for (let i = 0; i < audioBuffer.length * 0.075; i++) {
                        channelData[i] = Math.sin(2 * Math.PI * frequency * i / audioBuffer.sampleRate) * 0.3;
                    }
                    break;
                    
                case 'win':
                    // Create victory sound
                    frequency = 523.25; // C5
                    duration = 1;
                    for (let i = 0; i < audioBuffer.length * 0.5; i++) {
                        const time = i / audioBuffer.sampleRate;
                        const note = Math.floor(time * 3) % 3; // 3 notes
                        const noteFreq = [523.25, 659.25, 783.99][note]; // C5, E5, G5
                        channelData[i] = Math.sin(2 * Math.PI * noteFreq * time) * 0.4;
                    }
                    break;
                    
                case 'over':
                    // Create game over sound
                    frequency = 110; // A2
                    duration = 1;
                    for (let i = 0; i < audioBuffer.length * 0.5; i++) {
                        const time = i / audioBuffer.sampleRate;
                        channelData[i] = Math.sin(2 * Math.PI * frequency * time) * 0.4 * Math.exp(-time * 2);
                    }
                    break;
                    
                default:
                    // Default tone
                    for (let i = 0; i < audioBuffer.length; i++) {
                        const time = i / audioBuffer.sampleRate;
                        channelData[i] = Math.sin(2 * Math.PI * frequency * time) * 0.3;
                    }
            }
            
            // Create audio source
            const audioSource = this.audioContext.createBufferSource();
            audioSource.buffer = audioBuffer;
            audioSource.loop = type === 'music';
            
            // Create gain node for volume control
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = this.getVolumeForType(key);
            
            // Connect nodes
            audioSource.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            return {
                source: audioSource,
                gain: gainNode,
                type: 'demo',
                key: key
            };
            
        } catch (error) {
            console.warn(`⚠️ Failed to create demo audio: ${key}`, error);
            return null;
        }
    }
    
    /**
     * Preload all audio files
     */
    preloadAudio() {
        // Determine the correct path based on current location
        const isInGamesFolder = window.location.pathname.includes('/games/');
        const audioPath = isInGamesFolder ? '../audio/' : 'audio/';
        
        const audioFiles = {
            // Background Music
            'snake-bg': audioPath + 'snake-background.mp3',
            'tictactoe-bg': audioPath + 'tictactoe-background.mp3',
            'memory-bg': audioPath + 'memory-background.mp3',
            'flappy-bg': audioPath + 'flappy-background.mp3',
            'breakout-bg': audioPath + 'breakout-background.mp3',
            'puzzle-bg': audioPath + 'puzzle-background.mp3',
            'color-bg': audioPath + 'color-background.mp3',
            'rps-bg': audioPath + 'rps-background.mp3',
            'number-bg': audioPath + 'number-background.mp3',
            
            // Sound Effects - Game Events
            'game-start': audioPath + 'game-start.mp3',
            'game-over': audioPath + 'game-over.mp3',
            'game-win': audioPath + 'game-win.mp3',
            'game-draw': audioPath + 'game-draw.mp3',
            'game-pause': audioPath + 'game-pause.mp3',
            'game-resume': audioPath + 'game-resume.mp3',
            
            // Sound Effects - Actions
            'click': audioPath + 'click.mp3',
            'hover': audioPath + 'hover.mp3',
            'eat': audioPath + 'eat.mp3',
            'move': audioPath + 'move.mp3',
            'jump': audioPath + 'jump.mp3',
            'collect': audioPath + 'collect.mp3',
            'break': audioPath + 'break.mp3',
            'match': audioPath + 'match.mp3',
            'wrong': audioPath + 'wrong.mp3',
            'correct': audioPath + 'correct.mp3',
            'victory': audioPath + 'victory.mp3',
            'defeat': audioPath + 'defeat.mp3'
        };
        
        console.log('🎵 Starting audio preload...');
        console.log(`📍 Audio path: ${audioPath}`);
        console.log(`📍 Current location: ${window.location.pathname}`);
        
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
                console.warn(`⚠️ Audio failed to load: ${key}, creating demo audio...`);
                this.audioErrors.push(key);
                
                // Create demo audio as fallback
                const demoAudio = this.createDemoAudio(key, this.getAudioType(key));
                if (demoAudio) {
                    this.audioElements[key] = demoAudio;
                    console.log(`✅ Demo audio created for: ${key}`);
                }
            });
            
            // Preload audio
            audio.load();
            
        } catch (error) {
            console.warn(`⚠️ Failed to create audio element: ${key}`, error);
            this.audioErrors.push(key);
            
            // Create demo audio as fallback
            const demoAudio = this.createDemoAudio(key, this.getAudioType(key));
            if (demoAudio) {
                this.audioElements[key] = demoAudio;
                console.log(`✅ Demo audio created for: ${key}`);
            }
        }
    }
    
    /**
     * Get audio type for demo creation
     */
    getAudioType(key) {
        if (key.includes('-bg')) return 'music';
        if (key === 'click') return 'click';
        if (key === 'hover') return 'hover';
        if (key === 'eat') return 'eat';
        if (key === 'move') return 'move';
        if (key === 'game-win' || key === 'victory') return 'win';
        if (key === 'game-over' || key === 'defeat') return 'over';
        return 'tone';
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
            console.log('💡 Demo audio created as fallback for testing');
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
                this.stopBackgroundMusic();
            }
            
            // Play new music
            if (music.type === 'demo') {
                // Demo audio using Web Audio API
                music.source.loop = true;
                music.gain.gain.value = this.musicVolume * this.masterVolume;
                music.source.start();
                this.currentMusic = music;
                console.log(`🎵 Playing demo background music: ${gameType}`);
            } else {
                // Regular HTML5 Audio
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
                if (this.currentMusic.type === 'demo') {
                    // Demo audio
                    this.currentMusic.source.stop();
                } else {
                    // Regular HTML5 Audio
                    this.currentMusic.pause();
                    this.currentMusic.currentTime = 0;
                }
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
            if (sound.type === 'demo') {
                // Demo audio using Web Audio API
                const newSource = this.audioContext.createBufferSource();
                newSource.buffer = sound.source.buffer;
                newSource.connect(sound.gain);
                sound.gain.gain.value = this.sfxVolume * this.masterVolume;
                newSource.start();
                console.log(`🔊 Playing demo sound: ${soundKey}`);
            } else {
                // Regular HTML5 Audio
                sound.currentTime = 0;
                sound.volume = this.sfxVolume * this.masterVolume;
                
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
                if (audio.type === 'demo') {
                    audio.gain.gain.value = this.getVolumeForType(key);
                } else {
                    audio.volume = this.getVolumeForType(key);
                }
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
            if (this.currentMusic.type === 'demo') {
                this.currentMusic.source.start();
            } else {
                this.currentMusic.play().catch(() => {});
            }
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
            if (audio && audio.type === 'demo') {
                try {
                    audio.source.stop();
                } catch (e) {}
            } else if (audio) {
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
