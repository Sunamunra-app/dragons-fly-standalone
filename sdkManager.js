// SDK Manager для Dragon's Fly (Яндекс.Игры + VK Bridge)
class SDKManager {
    constructor() {
        this.yandexSDK = null;
        this.vkBridge = null;
        this.isYandex = false;
        this.isVK = false;
        this.isReady = false;
        this.lang = 'ru'; // Язык по умолчанию
        this.userInfo = null;
        
        // Переводы
        this.translations = {
            ru: {
                play: 'Играть',
                restart: 'Начать заново',
                score: 'Счет',
                best: 'Рекорд',
                lives: 'Жизни',
                level: 'Уровень',
                coins: 'Монеты',
                gameOver: 'Игра окончена',
                achievement: 'Достижение',
                levelUp: 'Новый уровень'
            },
            en: {
                play: 'Play',
                restart: 'Restart',
                score: 'Score',
                best: 'Best',
                lives: 'Lives',
                level: 'Level',
                coins: 'Coins',
                gameOver: 'Game Over',
                achievement: 'Achievement',
                levelUp: 'Level Up'
            },
            tr: {
                play: 'Oyna',
                restart: 'Yeniden başla',
                score: 'Skor',
                best: 'En iyi',
                lives: 'Canlar',
                level: 'Seviye',
                coins: 'Madeni paralar',
                gameOver: 'Oyun bitti',
                achievement: 'Başarı',
                levelUp: 'Seviye atla'
            }
        };
    }
    
    // Инициализация SDK
    async init() {
        console.log('🚀 Initializing SDK...');
        
        // Проверяем Яндекс.Игры
        if (typeof YaGames !== 'undefined') {
            await this.initYandexSDK();
        }
        // Проверяем VK Bridge
        else if (typeof vkBridge !== 'undefined') {
            await this.initVKBridge();
        }
        // Standalone режим
        else {
            console.log('📱 Running in standalone mode');
            this.detectLanguage();
            this.isReady = true;
        }
        
        return this.isReady;
    }
    
    // Инициализация Яндекс.SDK
    async initYandexSDK() {
        try {
            console.log('🎮 Initializing Yandex SDK...');
            
            // Инициализируем SDK
            this.yandexSDK = await YaGames.init();
            this.isYandex = true;
            
            // Определяем язык
            const environment = await this.yandexSDK.getEnvironment();
            this.lang = environment.i18n.lang || 'ru';
            console.log(`🌍 Language detected: ${this.lang}`);
            
            // Получаем информацию о игроке
            try {
                const player = await this.yandexSDK.getPlayer({ signed: true });
                this.userInfo = {
                    id: player.getUniqueID(),
                    name: player.getName() || 'Player',
                    photo: player.getPhoto('small')
                };
                console.log('👤 Player info:', this.userInfo);
            } catch (e) {
                console.warn('⚠️ Failed to get player info:', e);
            }
            
            // Отправляем Game Ready
            this.gameReady();
            
            this.isReady = true;
            console.log('✅ Yandex SDK initialized');
            
            return true;
        } catch (error) {
            console.error('❌ Yandex SDK initialization failed:', error);
            this.isYandex = false;
            this.detectLanguage();
            this.isReady = true;
            return false;
        }
    }
    
    // Инициализация VK Bridge
    async initVKBridge() {
        try {
            console.log('🎮 Initializing VK Bridge...');
            
            this.vkBridge = vkBridge;
            await this.vkBridge.send('VKWebAppInit');
            this.isVK = true;
            
            // Получаем информацию о пользователе
            try {
                const userInfo = await this.vkBridge.send('VKWebAppGetUserInfo');
                this.userInfo = {
                    id: userInfo.id,
                    name: `${userInfo.first_name} ${userInfo.last_name}`,
                    photo: userInfo.photo_100
                };
                console.log('👤 VK user info:', this.userInfo);
                
                // Определяем язык из VK
                this.lang = userInfo.language || 'ru';
            } catch (e) {
                console.warn('⚠️ Failed to get VK user info:', e);
            }
            
            this.isReady = true;
            console.log('✅ VK Bridge initialized');
            
            return true;
        } catch (error) {
            console.error('❌ VK Bridge initialization failed:', error);
            this.isVK = false;
            this.detectLanguage();
            this.isReady = true;
            return false;
        }
    }
    
    // Отправка Game Ready в Яндекс.Игры
    gameReady() {
        if (this.isYandex && this.yandexSDK) {
            try {
                this.yandexSDK.features.LoadingAPI?.ready();
                console.log('✅ Game Ready sent to Yandex');
            } catch (e) {
                console.warn('⚠️ Failed to send Game Ready:', e);
            }
        }
    }
    
    // Автоопределение языка браузера (fallback)
    detectLanguage() {
        const browserLang = navigator.language || navigator.userLanguage || 'ru';
        this.lang = browserLang.split('-')[0]; // 'ru-RU' -> 'ru'
        
        // Проверяем поддержку языка
        if (!this.translations[this.lang]) {
            this.lang = 'ru'; // Fallback на русский
        }
        
        console.log(`🌍 Language detected (browser): ${this.lang}`);
    }
    
    // Получить перевод
    t(key) {
        return this.translations[this.lang]?.[key] || this.translations.ru[key] || key;
    }
    
    // Сохранение рекорда
    async saveScore(score) {
        try {
            // Яндекс.Игры - leaderboard
            if (this.isYandex && this.yandexSDK) {
                const lb = await this.yandexSDK.getLeaderboards();
                await lb.setLeaderboardScore('best_score', score);
                console.log(`✅ Score saved to Yandex leaderboard: ${score}`);
            }
            
            // VK - Storage
            if (this.isVK && this.vkBridge) {
                await this.vkBridge.send('VKWebAppStorageSet', {
                    key: 'best_score',
                    value: score.toString()
                });
                console.log(`✅ Score saved to VK storage: ${score}`);
            }
            
            // Локальное хранилище (fallback)
            localStorage.setItem('best_score', score.toString());
            
            return true;
        } catch (error) {
            console.error('❌ Failed to save score:', error);
            
            // Fallback на localStorage
            localStorage.setItem('best_score', score.toString());
            return false;
        }
    }
    
    // Загрузка рекорда
    async loadScore() {
        try {
            // VK - Storage
            if (this.isVK && this.vkBridge) {
                const result = await this.vkBridge.send('VKWebAppStorageGet', {
                    keys: ['best_score']
                });
                if (result.keys[0]?.value) {
                    const score = parseInt(result.keys[0].value);
                    console.log(`✅ Score loaded from VK: ${score}`);
                    return score;
                }
            }
            
            // Локальное хранилище
            const localScore = localStorage.getItem('best_score');
            if (localScore) {
                return parseInt(localScore);
            }
            
            return 0;
        } catch (error) {
            console.error('❌ Failed to load score:', error);
            
            // Fallback на localStorage
            const localScore = localStorage.getItem('best_score');
            return localScore ? parseInt(localScore) : 0;
        }
    }
    
    // Показ рекламы
    async showAd(type = 'interstitial') {
        try {
            // Яндекс.Игры - fullscreen ad
            if (this.isYandex && this.yandexSDK) {
                const adv = this.yandexSDK.adv;
                
                return new Promise((resolve) => {
                    adv.showFullscreenAdv({
                        callbacks: {
                            onOpen: () => {
                                console.log('📺 Yandex ad opened');
                                // Игра должна поставить на паузу
                            },
                            onClose: (wasShown) => {
                                console.log(`📺 Yandex ad closed (shown: ${wasShown})`);
                                resolve(wasShown);
                            },
                            onError: (error) => {
                                console.error('❌ Yandex ad error:', error);
                                resolve(false);
                            }
                        }
                    });
                });
            }
            
            // VK Bridge - native ads
            if (this.isVK && this.vkBridge) {
                await this.vkBridge.send('VKWebAppShowNativeAds', {
                    ad_format: type
                });
                console.log('📺 VK ad shown');
                return true;
            }
            
            console.log('⚠️ No ad platform available');
            return false;
        } catch (error) {
            console.error('❌ Failed to show ad:', error);
            return false;
        }
    }
    
    // Показ rewarded video
    async showRewardedAd() {
        try {
            if (this.isYandex && this.yandexSDK) {
                const adv = this.yandexSDK.adv;
                
                return new Promise((resolve) => {
                    adv.showRewardedVideo({
                        callbacks: {
                            onOpen: () => {
                                console.log('📺 Rewarded video opened');
                            },
                            onRewarded: () => {
                                console.log('🎁 Reward granted');
                                resolve(true);
                            },
                            onClose: () => {
                                console.log('📺 Rewarded video closed');
                                resolve(false);
                            },
                            onError: (error) => {
                                console.error('❌ Rewarded video error:', error);
                                resolve(false);
                            }
                        }
                    });
                });
            }
            
            console.log('⚠️ Rewarded ads not available');
            return false;
        } catch (error) {
            console.error('❌ Failed to show rewarded ad:', error);
            return false;
        }
    }
    
    // Запись в таблицу лидеров
    async submitScore(leaderboardName, score) {
        try {
            if (this.isYandex && this.yandexSDK) {
                const lb = await this.yandexSDK.getLeaderboards();
                await lb.setLeaderboardScore(leaderboardName, score);
                console.log(`✅ Score ${score} submitted to ${leaderboardName}`);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('❌ Failed to submit score:', error);
            return false;
        }
    }
}

// Экспорт для использования в game.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SDKManager;
}
