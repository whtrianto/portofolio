irm https://raw.githubusercontent.com/yuaotian/go-cursor-help/refs/heads/master/scripts/run/cursor_win_id_modifier.ps1 | iex

# 🎵 Audio Files untuk Game

Direktori ini berisi semua file audio yang dibutuhkan untuk game. Berikut adalah daftar file yang diperlukan:

## 🎼 Background Music

### Game-specific Background Music

- `snake-background.mp3` - Musik ambient untuk Snake Game (looping)
- `tictactoe-background.mp3` - Musik tenang untuk Tic Tac Toe
- `memory-background.mp3` - Musik santai untuk Memory Game
- `flappy-background.mp3` - Musik upbeat untuk Flappy Bird
- `breakout-background.mp3` - Musik arcade untuk Breakout
- `puzzle-background.mp3` - Musik puzzle untuk 2048
- `color-background.mp3` - Musik energik untuk Color Match
- `rps-background.mp3` - Musik fun untuk Rock Paper Scissors
- `number-background.mp3` - Musik misteri untuk Number Guessing

## 🔊 Sound Effects - Game Events

### Game State Sounds

- `game-start.mp3` - Suara saat game dimulai
- `game-over.mp3` - Suara saat game berakhir (kalah)
- `game-win.mp3` - Suara saat menang
- `game-draw.mp3` - Suara saat seri

- `game-pause.mp3` - Suara saat pause
- `game-resume.mp3` - Suara saat resume

## 🎯 Sound Effects - Actions

### User Interaction

- `click.mp3` - Suara klik tombol
- `hover.mp3` - Suara hover mouse

### Game Actions

- `eat.mp3` - Suara makan (Snake Game)

- `move.mp3` - Suara bergerak
- `jump.mp3` - Suara lompat (Flappy Bird)
- `collect.mp3` - Suara mengumpulkan item
- `break.mp3` - Suara memecahkan blok (Breakout)
- `match.mp3` - Suara kartu cocok (Memory Game)
- `wrong.mp3` - Suara jawaban salah
- `correct.mp3` - Suara jawaban benar
- `victory.mp3` - Suara kemenangan
- `defeat.mp3` - Suara kekalahan

## 📋 Spesifikasi Audio

### Format

- **Format**: MP3
- **Bitrate**: 128-192 kbps
- **Sample Rate**: 44.1 kHz
- **Channels**: Stereo (untuk musik), Mono (untuk SFX)

### Durasi

- **Background Music**: 1-3 menit (akan di-loop)
- **Game Events**: 1-3 detik
- **Action Sounds**: 0.5-2 detik

### Volume Levels

- **Background Music**: -20 dB (relatif tenang)
- **Game Events**: -10 dB (sedang)
- **Action Sounds**: -5 dB (keras)

## 🎨 Karakteristik Audio

### Background Music

- **Snake**: Ambient, cyberpunk, looping
- **Tic Tac Toe**: Tenang, strategis, minimalis
- **Memory**: Santai, puzzle, relaxing
- **Flappy Bird**: Upbeat, arcade, energik
- **Breakout**: Retro arcade, 8-bit style
- **2048 Puzzle**: Intelektual, puzzle, modern
- **Color Match**: Fast-paced, action, dynamic
- **Rock Paper Scissors**: Fun, playful, casual
- **Number Guessing**: Misteri, suspense, intriguing

### Sound Effects

- **Click**: Sharp, responsive, digital
- **Hover**: Soft, subtle, feedback
- **Eat**: Crunchy, satisfying, game-like
- **Move**: Smooth, fluid, movement
- **Jump**: Energetic, upward, bouncy
- **Collect**: Positive, rewarding, chime
- **Break**: Destructive, satisfying, impact
- **Match**: Success, harmony, completion
- **Wrong**: Error, negative, buzzer
- **Correct**: Success, positive, ding
- **Victory**: Triumphant, celebration, fanfare
- **Defeat**: Sad, failure, game over

## 🔧 Cara Mendapatkan Audio

### Opsi 1: Free Sound Libraries

- **Freesound.org** - Library audio gratis
- **OpenGameArt.org** - Game audio gratis
- **Zapsplat.com** - Audio library gratis (dengan registrasi)

### Opsi 2: Royalty-Free Audio

- **AudioJungle** - Audio berkualitas tinggi
- **Pond5** - Library audio profesional
- **PremiumBeat** - Audio premium

### Opsi 3: Create Your Own

- **Audacity** - Software audio editing gratis
- **GarageBand** - Mac audio creation
- **FL Studio** - Professional audio production

## 📁 Struktur Direktori

```
audio/
├── README.md
├── snake-background.mp3
├── tictactoe-background.mp3
├── memory-background.mp3
├── flappy-background.mp3
├── breakout-background.mp3
├── puzzle-background.mp3
├── color-background.mp3
├── rps-background.mp3
├── number-background.mp3
├── game-start.mp3
├── game-over.mp3
├── game-win.mp3
├── game-draw.mp3
├── game-pause.mp3
├── game-resume.mp3
├── click.mp3
├── hover.mp3
├── eat.mp3
├── move.mp3
├── jump.mp3
├── collect.mp3
├── break.mp3
├── match.mp3
├── wrong.mp3
├── correct.mp3
├── victory.mp3
└── defeat.mp3
```

## ⚠️ Catatan Penting

1. **Copyright**: Pastikan semua audio yang digunakan bebas dari hak cipta
2. **File Size**: Usahakan total audio tidak melebihi 10MB untuk performa web
3. **Compatibility**: Test audio di berbagai browser (Chrome, Firefox, Safari, Edge)
4. **Mobile**: Pastikan audio berfungsi di perangkat mobile
5. **Fallback**: Audio Manager sudah memiliki fallback jika file tidak ditemukan

## 🚀 Implementasi

Setelah semua file audio tersedia, Audio Manager akan otomatis:

1. Preload semua audio file
2. Mengatur volume yang sesuai
3. Memainkan audio berdasarkan game dan event
4. Mengelola background music dan sound effects

Audio akan mulai berfungsi segera setelah file audio ditempatkan di direktori ini!
