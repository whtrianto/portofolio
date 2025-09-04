// /**
//  * 🚀 QUICK AUDIO TEST - Simple Audio Testing Script
//  * 
//  * Script ini memungkinkan testing audio dengan mudah tanpa perlu
//  * file MP3 eksternal. Menggunakan Web Audio API untuk generate audio.
//  */

// class QuickAudioTest {
//     constructor() {
//         this.audioContext = null;
//         this.isInitialized = false;
//         this.init();
//     }
    
//     init() {
//         try {
//             const AudioContext = window.AudioContext || window.webkitAudioContext;
//             this.audioContext = new AudioContext;
//             this.isInitialized = true;
//             console.log('🚀 Quick Audio Test initialized successfully');
            
//             // Resume audio context if suspended
//             if (this.audioContext.state === 'suspended') {
//                 this.audioContext.resume();
//             }
//         } catch (error) {
//             console.error('❌ Failed to initialize Quick Audio Test:', error);
//         }
//     }
    
//     /**
//      * Play a simple tone
//      */
//     playTone(frequency = 440, duration = 0.5, volume = 0.3) {
//         if (!this.isInitialized || !this.audioContext) {
//             console.warn('⚠️ Quick Audio Test not initialized');
//             return false;
//         }
        
//         try {
//             const oscillator = this.audioContext.createOscillator();
//             const gainNode = this.audioContext.createGain();
            
//             oscillator.frequency.value = frequency;
//             oscillator.type = 'sine';
            
//             gainNode.gain.value = volume;
            
//             oscillator.connect(gainNode);
//             gainNode.connect(this.audioContext.destination);
            
//             oscillator.start();
//             oscillator.stop(this.audioContext.currentTime + duration);
            
//             console.log(`🔊 Playing tone: ${frequency}Hz for ${duration}s`);
//             return true;
//         } catch (error) {
//             console.error('❌ Error playing tone:', error);
//             return false;
//         }
//     }
    
//     /**
//      * Play a melody (sequence of notes)
//      */
//     playMelody(notes = [440, 494, 523, 587], noteDuration = 0.3) {
//         if (!this.isInitialized || !this.audioContext) {
//             console.warn('⚠️ Quick Audio Test not initialized');
//             return false;
//         }
        
//         try {
//             notes.forEach((frequency, index) => {
//                 setTimeout(() => {
//                     this.playTone(frequency, noteDuration, 0.2);
//                 }, index * noteDuration * 1000);
//             });
            
//             console.log(`🎵 Playing melody with ${notes.length} notes`);
//             return true;
//         } catch (error) {
//             console.error('❌ Error playing melody:', error);
//             return false;
//         }
//     }
    
//     /**
//      * Test different sound types
//      */
//     testSounds() {
//         console.log('🧪 Testing different sound types...');
        
//         // Test 1: Low tone (bass)
//         setTimeout(() => this.playTone(110, 0.3, 0.3), 0);
        
//         // Test 2: Medium tone
//         setTimeout(() => this.playTone(440, 0.3, 0.3), 400);
        
//         // Test 3: High tone
//         setTimeout(() => this.playTone(880, 0.3, 0.3), 800);
        
//         // Test 4: Melody
//         setTimeout(() => this.playMelody([523, 659, 784, 1047], 0.2), 1200);
//     }
    
//     /**
//      * Test game-like sounds
//      */
//     testGameSounds() {
//         console.log('🎮 Testing game-like sounds...');
        
//         // Click sound
//         setTimeout(() => this.playTone(800, 0.1, 0.4), 0);
        
//         // Hover sound
//         setTimeout(() => this.playTone(600, 0.15, 0.3), 200);
        
//         // Eat sound
//         setTimeout(() => this.playTone(400, 0.2, 0.4), 400);
        
//         // Move sound
//         setTimeout(() => this.playTone(300, 0.1, 0.3), 700);
        
//         // Victory sound
//         setTimeout(() => this.playMelody([523, 659, 784], 0.2), 1000);
        
//         // Game over sound
//         setTimeout(() => this.playTone(110, 0.5, 0.4), 1600);
//     }
    
//     /**
//      * Test background music (looping)
//      */
//     testBackgroundMusic() {
//         if (!this.isInitialized || !this.audioContext) {
//             console.warn('⚠️ Quick Audio Test not initialized');
//             return false;
//         }
        
//         try {
//             console.log('🎵 Testing background music...');
            
//             // Create a simple looping melody
//             const notes = [220, 246.94, 277.18, 293.66, 329.63, 369.99, 415.30, 440];
//             let currentNote = 0;
            
//             const playNextNote = () => {
//                 if (currentNote < notes.length) {
//                     this.playTone(notes[currentNote], 0.4, 0.2);
//                     currentNote++;
//                 } else {
//                     currentNote = 0; // Loop back to start
//                 }
//             };
            
//             // Play notes with intervals
//             const interval = setInterval(playNextNote, 400);
            
//             // Stop after 10 seconds
//             setTimeout(() => {
//                 clearInterval(interval);
//                 console.log('🔇 Background music test stopped');
//             }, 10000);
            
//             return true;
//         } catch (error) {
//             console.error('❌ Error testing background music:', error);
//             return false;
//         }
//     }
    
//     /**
//      * Interactive test panel
//      */
//     createTestPanel() {
//         const panel = document.createElement('div');
//         panel.style.cssText = `
//             position: fixed;
//             top: 150px;
//             left: 20px;
//             background: rgba(0, 0, 0, 0.9);
//             color: white;
//             padding: 20px;
//             border-radius: 15px;
//             font-family: monospace;
//             font-size: 14px;
//             z-index: 10000;
//             min-width: 250px;
//             box-shadow: 0 10px 30px rgba(0,0,0,0.5);
//         `;
        
//         panel.innerHTML = `
//             <h3 style="margin: 0 0 15px 0; color: #00ff00; text-align: center;">🚀 Quick Audio Test</h3>
            
//             <div style="margin-bottom: 15px;">
//                 <button onclick="window.quickAudioTest.testSounds()" 
//                         style="width: 100%; padding: 8px; margin: 2px 0; background: #0077ff; border: none; color: white; border-radius: 5px; cursor: pointer;">
//                     🔊 Test Basic Sounds
//                 </button>
                
//                 <button onclick="window.quickAudioTest.testGameSounds()" 
//                         style="width: 100%; padding: 8px; margin: 2px 0; background: #00aa00; border: none; color: white; border-radius: 5px; cursor: pointer;">
//                     🎮 Test Game Sounds
//                 </button>
                
//                 <button onclick="window.quickAudioTest.testBackgroundMusic()" 
//                         style="width: 100%; padding: 8px; margin: 2px 0; background: #ff7700; border: none; color: white; border-radius: 5px; cursor: pointer;">
//                     🎵 Test Background Music
//                 </button>
//             </div>
            
//             <div style="margin-bottom: 15px;">
//                 <label style="display: block; margin-bottom: 5px;">Custom Tone:</label>
//                 <input type="range" id="freqSlider" min="100" max="1000" value="440" 
//                        style="width: 100%; margin-bottom: 10px;">
//                 <span id="freqValue">440 Hz</span>
//                 <button onclick="window.quickAudioTest.playTone(parseInt(document.getElementById('freqSlider').value), 0.5, 0.3)" 
//                         style="width: 100%; padding: 8px; background: #aa00aa; border: none; color: white; border-radius: 5px; cursor: pointer;">
//                     🎵 Play Tone
//                 </button>
//             </div>
            
//             <button onclick="this.parentElement.remove()" 
//                     style="width: 100%; padding: 8px; background: #ff4400; border: none; color: white; border-radius: 5px; cursor: pointer;">
//                 ❌ Close Panel
//             </button>
//         `;
        
//         document.body.appendChild(panel);
        
//         // Update frequency display
//         const freqSlider = panel.querySelector('#freqSlider');
//         const freqValue = panel.querySelector('#freqValue');
//         freqSlider.addEventListener('input', (e) => {
//             freqValue.textContent = `${e.target.value} Hz`;
//         });
        
//         return panel;
//     }
// }

// // Initialize when DOM is loaded
// document.addEventListener('DOMContentLoaded', () => {
//     // Wait a bit for page to fully load
//     setTimeout(() => {
//         window.quickAudioTest = new QuickAudioTest();
//         console.log('🚀 Quick Audio Test ready! Use window.quickAudioTest to test audio');
        
//         // Add test button to page
//         const testBtn = document.createElement('button');
//         testBtn.innerHTML = '🚀';
//         testBtn.title = 'Quick Audio Test';
//         testBtn.style.cssText = `
//             position: fixed;
//             top: 70px;
//             left: 20px;
//             width: 40px;
//             height: 40px;
//             border-radius: 50%;
//             background: #ff7700;
//             border: none;
//             color: white;
//             font-size: 16px;
//             cursor: pointer;
//             z-index: 10001;
//         `;
        
//         testBtn.onclick = () => window.quickAudioTest.createTestPanel();
//         document.body.appendChild(testBtn);
        
//     }, 1000);
// });

// // Global helper functions
// window.testAudio = {
//     tone: (freq = 440) => {
//         if (window.quickAudioTest) {
//             window.quickAudioTest.playTone(freq, 0.5, 0.3);
//         }
//     },
//     melody: () => {
//         if (window.quickAudioTest) {
//             window.quickAudioTest.playMelody([440, 494, 523, 587], 0.3);
//         }
//     },
//     game: () => {
//         if (window.quickAudioTest) {
//             window.quickAudioTest.testGameSounds();
//         }
//     },
//     music: () => {
//         if (window.quickAudioTest) {
//             window.quickAudioTest.testBackgroundMusic();
//         }
//     },
//     panel: () => {
//         if (window.quickAudioTest) {
//             window.quickAudioTest.createTestPanel();
//         }
//     }
// };
