/**
 * 🎛️ AUDIO CONTROLS - Volume and Audio Control Panel
 * 
 * Fitur:
 * - Volume sliders untuk master, music, dan SFX
 * - Mute/unmute button
 * - Audio settings panel
 * - Responsive design
 */

class AudioControls {
    constructor(container = null) {
        this.container = container || document.body;
        this.isVisible = false;
        this.audioManager = window.audioManager;
        
        this.createAudioPanel();
        this.bindEvents();
        this.updateDisplay();
    }
    
    /**
     * Create audio control panel
     */
    createAudioPanel() {
        // Create main container
        this.panel = document.createElement('div');
        this.panel.className = 'audio-controls-panel';
        this.panel.innerHTML = `
            <div class="audio-controls-header">
                <h3>🎵 Audio Settings</h3>
                <button class="audio-close-btn" id="audioCloseBtn">&times;</button>
            </div>
            
            <div class="audio-controls-content">
                <div class="audio-control-group">
                    <label for="masterVolume">Master Volume</label>
                    <div class="volume-control">
                        <input type="range" id="masterVolume" min="0" max="100" value="100" class="volume-slider">
                        <span class="volume-value">70%</span>
                    </div>
                </div>
                
                <div class="audio-control-group">
                    <label for="musicVolume">Music Volume</label>
                    <div class="volume-control">
                        <input type="range" id="musicVolume" min="0" max="100" value="90" class="volume-slider">
                        <span class="volume-value">50%</span>
                    </div>
                </div>
                
                <div class="audio-control-group">
                    <label for="sfxVolume">SFX Volume</label>
                    <div class="volume-control">
                        <input type="range" id="sfxVolume" min="0" max="100" value="100" class="volume-slider">
                        <span class="volume-value">80%</span>
                    </div>
                </div>
                
                <div class="audio-control-group">
                    <button id="muteBtn" class="mute-btn">
                        <span class="mute-icon">🔊</span>
                        <span class="mute-text">Mute</span>
                    </button>
                </div>
            </div>
        `;
        
        // Create toggle button
        this.toggleBtn = document.createElement('button');
        this.toggleBtn.className = 'audio-toggle-btn';
        this.toggleBtn.innerHTML = '🎵';
        this.toggleBtn.title = 'Audio Settings';
        
        // Add to container
        this.container.appendChild(this.toggleBtn);
        this.container.appendChild(this.panel);
        
        // Initially hide panel
        this.panel.style.display = 'none';
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Toggle button
        this.toggleBtn.addEventListener('click', () => this.togglePanel());
        
        // Close button
        const closeBtn = this.panel.querySelector('#audioCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hidePanel());
        }
        
        // Volume sliders
        const masterSlider = this.panel.querySelector('#masterVolume');
        const musicSlider = this.panel.querySelector('#musicVolume');
        const sfxSlider = this.panel.querySelector('#sfxVolume');
        
        if (masterSlider) {
            masterSlider.addEventListener('input', (e) => {
                const volume = e.target.value / 100;
                this.audioManager.setMasterVolume(volume);
                this.updateVolumeDisplay('masterVolume', e.target.value);
            });
        }
        
        if (musicSlider) {
            musicSlider.addEventListener('input', (e) => {
                const volume = e.target.value / 100;
                this.audioManager.setMusicVolume(volume);
                this.updateVolumeDisplay('musicVolume', e.target.value);
            });
        }
        
        if (sfxSlider) {
            sfxSlider.addEventListener('input', (e) => {
                const volume = e.target.value / 100;
                this.audioManager.setSFXVolume(volume);
                this.updateVolumeDisplay('sfxVolume', e.target.value);
            });
        }
        
        // Mute button
        const muteBtn = this.panel.querySelector('#muteBtn');
        if (muteBtn) {
            muteBtn.addEventListener('click', () => this.toggleMute());
        }
        
        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!this.panel.contains(e.target) && !this.toggleBtn.contains(e.target)) {
                this.hidePanel();
            }
        });
    }
    
    /**
     * Toggle audio panel visibility
     */
    togglePanel() {
        if (this.isVisible) {
            this.hidePanel();
        } else {
            this.showPanel();
        }
    }
    
    /**
     * Show audio panel
     */
    showPanel() {
        this.panel.style.display = 'block';
        this.isVisible = true;
        this.toggleBtn.classList.add('active');
        
        // Play hover sound
        this.audioManager.playAction('hover');
    }
    
    /**
     * Hide audio panel
     */
    hidePanel() {
        this.panel.style.display = 'none';
        this.isVisible = false;
        this.toggleBtn.classList.remove('active');
    }
    
    /**
     * Toggle mute/unmute
     */
    toggleMute() {
        const isMuted = this.audioManager.toggleMute();
        this.updateMuteButton(isMuted);
        
        // Play click sound
        this.audioManager.playAction('click');
    }
    
    /**
     * Update mute button display
     */
    updateMuteButton(isMuted) {
        const muteBtn = this.panel.querySelector('#muteBtn');
        const muteIcon = muteBtn.querySelector('.mute-icon');
        const muteText = muteBtn.querySelector('.mute-text');
        
        if (isMuted) {
            muteIcon.textContent = '🔇';
            muteText.textContent = 'Unmute';
            muteBtn.classList.add('muted');
        } else {
            muteIcon.textContent = '🔊';
            muteText.textContent = 'Mute';
            muteBtn.classList.remove('muted');
        }
    }
    
    /**
     * Update volume display
     */
    updateVolumeDisplay(sliderId, value) {
        const volumeValue = this.panel.querySelector(`#${sliderId}`).nextElementSibling;
        if (volumeValue) {
            volumeValue.textContent = `${value}%`;
        }
    }
    
    /**
     * Update all displays
     */
    updateDisplay() {
        if (!this.audioManager) return;
        
        const volumes = this.audioManager.getVolumes();
        
        // Update sliders
        const masterSlider = this.panel.querySelector('#masterVolume');
        const musicSlider = this.panel.querySelector('#musicVolume');
        const sfxSlider = this.panel.querySelector('#sfxVolume');
        
        if (masterSlider) {
            masterSlider.value = Math.round(volumes.master * 100);
            this.updateVolumeDisplay('masterVolume', masterSlider.value);
        }
        
        if (musicSlider) {
            musicSlider.value = Math.round(volumes.music * 100);
            this.updateVolumeDisplay('musicVolume', musicSlider.value);
        }
        
        if (sfxSlider) {
            sfxSlider.value = Math.round(volumes.sfx * 100);
            this.updateVolumeDisplay('sfxVolume', sfxSlider.value);
        }
        
        // Update mute button
        this.updateMuteButton(this.audioManager.isAudioMuted());
    }
    
    /**
     * Set container for audio controls
     */
    setContainer(container) {
        if (this.container !== container) {
            this.container.removeChild(this.toggleBtn);
            this.container.removeChild(this.panel);
            
            this.container = container;
            this.container.appendChild(this.toggleBtn);
            this.container.appendChild(this.panel);
        }
    }
    
    /**
     * Destroy audio controls
     */
    destroy() {
        if (this.toggleBtn && this.toggleBtn.parentNode) {
            this.toggleBtn.parentNode.removeChild(this.toggleBtn);
        }
        if (this.panel && this.panel.parentNode) {
            this.panel.parentNode.removeChild(this.panel);
        }
    }
}

// Create global audio controls instance
window.AudioControls = AudioControls;
window.audioControls = new AudioControls();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioControls;
}
