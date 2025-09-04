/**
 * Audio Integration Helper
 *
 * Ensures background music starts after a user gesture
 * even when the page is refreshed (autoplay restrictions).
 */

(function () {
	function detectGameKey() {
		try {
			const path = (window.location.pathname || '').toLowerCase();
			if (path.includes('snake-game')) return 'snake';
			if (path.includes('tic-tac-toe')) return 'tictactoe';
			if (path.includes('memory-game')) return 'memory';
			if (path.includes('flappy-bird')) return 'flappy';
			if (path.includes('breakout')) return 'breakout';
			if (path.includes('2048-puzzle')) return 'puzzle';
			if (path.includes('color-match')) return 'color';
			if (path.includes('rock-paper-scissors')) return 'rps';
			if (path.includes('number-guessing')) return 'number';
			// Balap Mobil: gunakan musik background Snake
			if (path.includes('balap-mobil')) return 'snake';
		} catch (e) { }
		return null;
	}

	function setupUnlock(gameKey) {
		if (!gameKey) return;

		const unlock = () => {
			try {
				const am = window.audioManager;
				if (!am) return;

				if (am.audioContext && am.audioContext.state === 'suspended') {
					am.audioContext.resume().catch(() => { });
				}

				am.playBackgroundMusic(gameKey);
			} catch (e) { }
		};

		// Use { once: true } to auto-remove; add multiple gesture types for reliability
		document.addEventListener('click', unlock, { once: true });
		document.addEventListener('keydown', unlock, { once: true });
		document.addEventListener('touchstart', unlock, { once: true, passive: true });
	}

	document.addEventListener('DOMContentLoaded', function () {
		const key = detectGameKey();
		setupUnlock(key);
	});
})();



