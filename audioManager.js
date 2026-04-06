// Web Audio API Manager для Dragon's Fly
class AudioManager {
    constructor() {
        // Создаем AudioContext
        this.audioContext = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        
        // Буферы звуков
        this.soundBuffers = {};
        this.loadedSounds = 0;
        this.totalSounds = 0;
        
        // Текущая фоновая музыка
        this.backgroundMusicSource = null;
        this.backgroundMusicBuffer = null;
        
        // Состояние
        this.isMuted = false;
        this.isPaused = false;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.7;
        
        // Обработка видимости страницы
        this.setupVisibilityHandlers();
    }
    
    // Инициализация AudioContext (вызывается после первого взаимодействия пользователя)
    init() {
        if (this.audioContext) return Promise.resolve();
        
        try {
            // Создаем AudioContext
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // Создаем gain nodes
            this.masterGain = this.audioContext.createGain();
            this.musicGain = this.audioContext.createGain();
            this.sfxGain = this.audioContext.createGain();
            
            // Подключаем цепочку
            this.musicGain.connect(this.masterGain);
            this.sfxGain.connect(this.masterGain);
            this.masterGain.connect(this.audioContext.destination);
            
            // Устанавливаем начальную громкость
            this.musicGain.gain.value = this.musicVolume;
            this.sfxGain.gain.value = this.sfxVolume;
            this.masterGain.gain.value = 1.0;
            
            console.log('✅ Web Audio API initialized');
            return Promise.resolve();
        } catch (error) {
            console.error('❌ Web Audio API initialization failed:', error);
            return Promise.reject(error);
        }
    }
    
    // Загрузка звуков
    async loadSounds(soundList) {
        if (!this.audioContext) {
            await this.init();
        }
        
        this.totalSounds = soundList.length;
        const loadPromises = soundList.map(sound => this.loadSound(sound.name, sound.url));
        
        try {
            await Promise.all(loadPromises);
            console.log(`✅ Loaded ${this.loadedSounds}/${this.totalSounds} sounds`);
            return true;
        } catch (error) {
            console.error('❌ Failed to load some sounds:', error);
            return false;
        }
    }
    
    // Загрузка одного звука
    async loadSound(name, url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            this.soundBuffers[name] = audioBuffer;
            this.loadedSounds++;
            
            return audioBuffer;
        } catch (error) {
            console.error(`❌ Failed to load sound: ${name}`, error);
            throw error;
        }
    }
    
    // Воспроизведение звукового эффекта
    playSFX(name, volume = 1.0) {
        if (!this.audioContext || this.isMuted || !this.soundBuffers[name]) return null;
        
        try {
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = this.soundBuffers[name];
            gainNode.gain.value = volume;
            
            source.connect(gainNode);
            gainNode.connect(this.sfxGain);
            
            source.start(0);
            return source;
        } catch (error) {
            console.error(`❌ Failed to play SFX: ${name}`, error);
            return null;
        }
    }
    
    // Воспроизведение фоновой музыки (с зацикливанием)
    playBackgroundMusic(name, loop = true) {
        if (!this.audioContext || this.isMuted || !this.soundBuffers[name]) return;
        
        // Останавливаем предыдущую музыку
        this.stopBackgroundMusic();
        
        try {
            this.backgroundMusicSource = this.audioContext.createBufferSource();
            this.backgroundMusicSource.buffer = this.soundBuffers[name];
            this.backgroundMusicSource.loop = loop;
            
            this.backgroundMusicSource.connect(this.musicGain);
            this.backgroundMusicSource.start(0);
            
            console.log(`🎵 Playing background music: ${name}`);
        } catch (error) {
            console.error(`❌ Failed to play background music: ${name}`, error);
        }
    }
    
    // Остановка фоновой музыки
    stopBackgroundMusic() {
        if (this.backgroundMusicSource) {
            try {
                this.backgroundMusicSource.stop();
                this.backgroundMusicSource.disconnect();
            } catch (e) {
                // Игнорируем ошибки если уже остановлено
            }
            this.backgroundMusicSource = null;
        }
    }
    
    // Пауза фоновой музыки
    pauseBackgroundMusic() {
        if (this.audioContext && this.audioContext.state === 'running') {
            this.audioContext.suspend();
            this.isPaused = true;
            console.log('⏸️ Background music paused');
        }
    }
    
    // Возобновление фоновой музыки
    resumeBackgroundMusic() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
            this.isPaused = false;
            console.log('▶️ Background music resumed');
        }
    }
    
    // Установка громкости музыки
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.musicGain) {
            this.musicGain.gain.value = this.musicVolume;
        }
    }
    
    // Установка громкости звуковых эффектов
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        if (this.sfxGain) {
            this.sfxGain.gain.value = this.sfxVolume;
        }
    }
    
    // Вкл/Выкл звука
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain) {
            this.masterGain.gain.value = this.isMuted ? 0 : 1;
        }
        console.log(`🔇 Sound ${this.isMuted ? 'muted' : 'unmuted'}`);
        return this.isMuted;
    }
    
    // Обработка видимости страницы (пауза при сворачивании/смене вкладки)
    setupVisibilityHandlers() {
        // Обработка смены вкладок
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseBackgroundMusic();
                console.log('📑 Tab hidden - music paused');
            } else {
                this.resumeBackgroundMusic();
                console.log('📑 Tab visible - music resumed');
            }
        });
        
        // Обработка потери фокуса окна
        window.addEventListener('blur', () => {
            this.pauseBackgroundMusic();
            console.log('👁️ Window blur - music paused');
        });
        
        window.addEventListener('focus', () => {
            this.resumeBackgroundMusic();
            console.log('👁️ Window focus - music resumed');
        });
        
        // Обработка сворачивания страницы (Page Visibility API)
        document.addEventListener('pagehide', () => {
            this.pauseBackgroundMusic();
            console.log('📄 Page hidden - music paused');
        });
        
        document.addEventListener('pageshow', () => {
            this.resumeBackgroundMusic();
            console.log('📄 Page shown - music resumed');
        });
    }
    
    // Очистка ресурсов
    cleanup() {
        this.stopBackgroundMusic();
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        console.log('🧹 Audio resources cleaned up');
    }
}

// Экспорт для использования в game.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
}
