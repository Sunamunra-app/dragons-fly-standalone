// Патч для game.js - добавляет новые функции без изменения существующего кода
// Просто добавьте этот код в конец game.js перед последней строкой

// Добавляем новые методы к классу Game через prototype
(function patchGame() {
    const originalConstructor = Game.prototype.constructor;
    
    // Расширяем конструктор
    Game.prototype._initManagers = function() {
        console.log('🔧 Initializing new managers...');
        
        // Создаем менеджеры
        this.audioManager = new AudioManager();
        this.levelsManager = new LevelsManager();
        this.sdkManager = new SDKManager();
        
        // Флаг инициализации аудио
        this._audioInitialized = false;
        
        console.log('✅ Managers created');
    };
    
    // Инициализация аудио при первом клике
    Game.prototype.initAudioOnce = async function() {
        if (this._audioInitialized) return;
        
        try {
            await this.audioManager.init();
            
            // Загружаем звуки
            await this.audioManager.loadSounds([
                { name: 'fly', url: 'sound_fly.mp3' },
                { name: 'fireball', url: 'sound_fireball.mp3' },
                { name: 'egg', url: 'sound_egg.mp3' },
                { name: 'break', url: 'sound_break.mp3' },
                { name: 'arrowBreak', url: 'sound_arrow_break.mp3' },
                { name: 'backgroundMusic', url: 'background_music.mp3' },
                { name: 'wind', url: 'wind.mp3' }
            ]);
            
            // Запускаем фоновую музыку
            this.audioManager.playBackgroundMusic('backgroundMusic');
            
            this._audioInitialized = true;
            console.log('🎵 Web Audio API initialized');
        } catch (e) {
            console.warn('⚠️ Web Audio API not available, using fallback');
        }
    };
    
    // Обертка для звуков с fallback
    const originalPlaySound = Game.prototype.playSound;
    Game.prototype.playSound = function(name, volume = 1.0) {
        // Пытаемся использовать Web Audio API
        if (this.audioManager && this.audioManager.audioContext) {
            this.audioManager.playSFX(name, volume);
        } 
        // Fallback на старую систему
        else if (originalPlaySound) {
            originalPlaySound.call(this, name);
        }
        // Последний fallback
        else if (this.soundPool && this.soundPool[name]) {
            const pool = this.soundPool[name];
            const index = this.soundPoolIndex[name] || 0;
            const sound = pool[index];
            
            if (sound) {
                sound.currentTime = 0;
                sound.volume = volume;
                sound.play().catch(() => {});
                
                this.soundPoolIndex[name] = (index + 1) % pool.length;
            }
        }
    };
    
    // Система уровней в update
    Game.prototype.updateLevelSystem = function() {
        if (!this.levelsManager) return;
        
        // Обновляем уровень
        const levelData = this.levelsManager.updateLevel(this.eggsCollected);
        if (levelData.levelUp) {
            this.showLevelUpNotification(levelData.level);
            this.applyLevelSettings(levelData.level);
        }
        
        // Проверяем достижения
        const newAchievements = this.levelsManager.checkAchievements();
        newAchievements.forEach(achievement => {
            this.showAchievementNotification(achievement);
        });
    };
    
    // Применение параметров уровня
    Game.prototype.applyLevelSettings = function(levelData) {
        console.log(`⚡ Level ${levelData.level}: ${levelData.name}`);
        // Параметры уже автоматически применяются через levelsManager
    };
    
    // Уведомление о повышении уровня
    Game.prototype.showLevelUpNotification = function(levelData) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: #FFD700;
            padding: 20px 40px;
            border-radius: 10px;
            font-size: 24px;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
        `;
        notification.innerHTML = `🎉 ${levelData.reward.title}<br><small style="font-size:16px">+${levelData.reward.coins} монет</small>`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.5s';
                setTimeout(() => document.body.removeChild(notification), 500);
            }
        }, 2500);
    };
    
    // Уведомление о достижении
    Game.prototype.showAchievementNotification = function(achievement) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            color: #000;
            padding: 15px 30px;
            border-radius: 8px;
            font-size: 18px;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            animation: slideInRight 0.5s ease-out;
        `;
        notification.textContent = `${achievement.icon} ${achievement.title} (+${achievement.reward} монет)`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.5s';
                setTimeout(() => document.body.removeChild(notification), 500);
            }
        }, 3500);
    };
    
    // Обновление статистики при сборе яйца
    const originalCollectEgg = Game.prototype.collectEgg;
    if (originalCollectEgg) {
        Game.prototype.collectEgg = function() {
            const result = originalCollectEgg.call(this);
            
            if (this.levelsManager) {
                this.levelsManager.updateStats('eggsCollected', 1);
            }
            
            return result;
        };
    }
    
    // Обновление checkAllSpritesLoaded с Game Ready
    const originalCheckAllSpritesLoaded = Game.prototype.checkAllSpritesLoaded;
    if (originalCheckAllSpritesLoaded) {
        Game.prototype.checkAllSpritesLoaded = function() {
            originalCheckAllSpritesLoaded.call(this);
            
            if (this.allSpritesLoaded && this.sdkManager) {
                this.sdkManager.gameReady();
                console.log('✅ Game Ready sent to SDK');
            }
        };
    }
    
    // Сохранение рекорда при Game Over
    const originalGameOver = Game.prototype.gameOver;
    if (originalGameOver) {
        Game.prototype.gameOver = async function() {
            // Останавливаем музыку через новый audioManager
            if (this.audioManager && this.audioManager.audioContext) {
                this.audioManager.pauseBackgroundMusic();
            }
            
            // Обновляем статистику
            if (this.levelsManager) {
                this.levelsManager.updateStats('gamesPlayed', 1);
            }
            
            // Сохраняем рекорд через SDK
            if (this.eggsCollected > this.bestScore) {
                this.bestScore = this.eggsCollected;
                
                if (this.sdkManager) {
                    await this.sdkManager.saveScore(this.bestScore);
                    await this.sdkManager.submitScore('best_score', this.bestScore);
                }
            }
            
            // Показываем рекламу
            this.gamesPlayedCount++;
            if (this.gamesPlayedCount % this.showAdEvery === 0 && this.sdkManager) {
                await this.sdkManager.showAd('interstitial');
            }
            
            // Вызываем оригинальную логику
            if (originalGameOver) {
                originalGameOver.call(this);
            }
        };
    }
    
    // Добавляем CSS для анимаций
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
        
        @keyframes slideInRight {
            0% { transform: translateX(400px); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    console.log('✅ Game patched successfully!');
})();

// Инициализация при загрузке
window.addEventListener('DOMContentLoaded', () => {
    console.log('📱 Initializing enhanced game features...');
    
    // Патчим существующий экземпляр Game
    if (window.game && typeof window.game._initManagers === 'function') {
        window.game._initManagers();
        
        // Инициализируем SDK
        window.game.sdkManager.init().then(() => {
            return window.game.sdkManager.loadScore();
        }).then(score => {
            if (score) {
                window.game.bestScore = score;
                console.log(`✅ Best score loaded: ${score}`);
            }
        });
    }
});

// Добавляем инициализацию аудио при клике на кнопку "Играть"
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        const originalOnClick = startBtn.onclick;
        startBtn.onclick = async function(e) {
            // Инициализируем аудио при первом клике
            if (window.game && typeof window.game.initAudioOnce === 'function') {
                await window.game.initAudioOnce();
            }
            
            // Вызываем оригинальный обработчик
            if (originalOnClick) {
                originalOnClick.call(this, e);
            }
        };
    }
});
