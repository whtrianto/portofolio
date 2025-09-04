        // Initialize audio for main page
        document.addEventListener('DOMContentLoaded', () => {
            // Set audio controls container to main container
            if (window.audioControls) {
                window.audioControls.setContainer(document.querySelector('.container'));
            }
            
            // Flag to track if user has interacted
            let userHasInteracted = false;
            
            // Function to enable audio after user interaction
            function enableAudio() {
                if (!userHasInteracted) {
                    userHasInteracted = true;
                    console.log('👆 User interaction detected, enabling audio...');
                    
                    // Resume audio context if needed
                    if (window.audioManager && window.audioManager.audioContext) {
                        if (window.audioManager.audioContext.state === 'suspended') {
                            window.audioManager.audioContext.resume().then(() => {
                                console.log('✅ Audio context resumed');
                            });
                        }
                    }
                }
            }
            
            // Add click sounds to game cards
            const gameCards = document.querySelectorAll('.game-card');
            gameCards.forEach(card => {
                card.addEventListener('click', () => {
                    enableAudio(); // Enable audio on first interaction
                    console.log('🎮 Game card clicked!');
                    if (window.audioManager) {
                        console.log('🔊 Audio manager found, playing click sound...');
                        window.audioManager.playAction('click');
                    } else {
                        console.warn('⚠️ Audio manager not found!');
                    }
                });
                
                card.addEventListener('mouseenter', () => {
                    if (window.audioManager && userHasInteracted) {
                        window.audioManager.playAction('hover');
                    }
                });
            });
            
            // Add click sounds to buttons
            const buttons = document.querySelectorAll('.btn');
            buttons.forEach(button => {
                button.addEventListener('click', (e) => {
                    enableAudio(); // Enable audio on first interaction
                    console.log('🔘 Button clicked!');
                    
                    // Prevent default navigation temporarily
                    e.preventDefault();
                    
                    // Add visual feedback
                    button.style.transform = 'scale(0.95)';
                    button.style.transition = 'transform 0.5s ease';
                    
                    if (window.audioManager) {
                        console.log('🔊 Audio manager found, playing click sound...');
                        window.audioManager.playAction('click');
                        
                        // Wait a short time for audio to play, then navigate
                        setTimeout(() => {
                            window.location.href = button.href;
                        }, 300); // 150ms delay
                    } else {
                        console.warn('⚠️ Audio manager not found!');
                        // Navigate immediately if no audio manager
                        setTimeout(() => {
                            window.location.href = button.href;
                        }, 50); // Short delay for visual feedback
                    }
                });
            });
            
            
            testButton.addEventListener('click', () => {
                enableAudio(); // Enable audio on first interaction
                console.log('🧪 Testing audio...');
                if (window.audioManager) {
                    console.log('✅ Audio manager is available');
                    console.log('🔊 Playing click sound...');
                    const result = window.audioManager.playAction('click');
                    console.log('Result:', result);
                } else {
                    console.error('❌ Audio manager not available');
                }
            });
            document.body.appendChild(testButton);
            
            // Add click listener to entire document to enable audio
            document.addEventListener('click', enableAudio, { once: true });
            
            // Check audio manager status after a delay
            setTimeout(() => {
                console.log('🔍 Checking audio manager status...');
                if (window.audioManager) {
                    console.log('✅ Audio manager initialized');
                    console.log('Audio elements:', Object.keys(window.audioManager.audioElements));
                    console.log('Audio context state:', window.audioManager.audioContext?.state);
                } else {
                    console.error('❌ Audio manager not initialized');
                }
            }, 1000);
        });