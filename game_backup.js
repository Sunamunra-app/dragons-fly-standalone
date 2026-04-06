// Dragon Runner Game - Pixel Art Edition
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Game state
        this.gameState = 'start'; // start, playing, gameover
        this.gamePausedForAd = false;  // Пауза для рекламы
        this.lives = 3;
        this.eggsCollected = 0;
        this.bestScore = 0;  // Лучший результат (по количеству яиц)
        this.timeOfDay = 0; // 0-1 (0=day, 0.5=sunset, 1=night)
        this.dayNightSpeed = 0.00007; // Уменьшено для длительных фаз (~2 минуты каждая)
        
        // VK Integration
        this.vkBridge = null;
        this.isVK = false;
        this.vkUserInfo = null;
        
        // Yandex Games Integration
        this.yandexSDK = null;
        this.isYandex = false;
        
        // Реклама (VK + Yandex)
        this.gamesPlayedCount = 0;  // Счётчик игр
        this.showAdEvery = 3;  // Показывать рекламу каждые 3 игры
        this.adShownThisSession = false;  // Показана ли реклама в этой сессии
        
        // Система загрузки спрайтов
        this.totalSprites = 0;      // Общее количество спрайтов для загрузки
        this.loadedSprites = 0;     // Загружено спрайтов
        this.allSpritesLoaded = false;  // Все спрайты загружены
        
        // Dragon sprite sheet
        this.totalSprites++;  // Считаем спрайт дракона
        this.dragonSprite = new Image();
        this.dragonSprite.src = 'dragon_spritesheet.png';
        this.dragonSpriteLoaded = false;
        this.dragonSprite.onload = () => {
            this.dragonSpriteLoaded = true;
            this.loadedSprites++;
            this.checkAllSpritesLoaded();
        };
        
        // Egg sprite
        this.totalSprites++;
        this.eggSprite = new Image();
        this.eggSprite.src = 'egg.png';
        this.eggSpriteLoaded = false;
        this.eggSprite.onload = () => {
            this.eggSpriteLoaded = true;
            this.loadedSprites++;
            this.checkAllSpritesLoaded();
        };
        
        // UI Icons - сердце и яйцо для интерфейса
        this.totalSprites++;
        this.heartIcon = new Image();
        this.heartIcon.src = 'heart.png';
        this.heartIconLoaded = false;
        this.heartIcon.onload = () => {
            this.heartIconLoaded = true;
            this.loadedSprites++;
            this.checkAllSpritesLoaded();
        };
        
        this.totalSprites++;
        this.eggIcon = new Image();
        this.eggIcon.src = 'egg_icon.png';
        this.eggIconLoaded = false;
        this.eggIcon.onload = () => {
            this.eggIconLoaded = true;
            this.loadedSprites++;
            this.checkAllSpritesLoaded();
        };
        
        // Apple sprite (яблоко для лечения)
        this.totalSprites++;
        this.appleSprite = new Image();
        this.appleSprite.src = 'Apple.png';
        this.appleSpriteLoaded = false;
        this.appleSprite.onload = () => {
            this.appleSpriteLoaded = true;
            this.loadedSprites++;
            this.checkAllSpritesLoaded();
        };
        
        // Apple tree sprite (яблоня)
        this.totalSprites++;
        this.appleTreeSprite = new Image();
        this.appleTreeSprite.src = 'Apple_tree.png';
        this.appleTreeSpriteLoaded = false;
        this.appleTreeSprite.onload = () => {
            this.appleTreeSpriteLoaded = true;
            this.loadedSprites++;
            this.checkAllSpritesLoaded();
        };
        
        // Arrow sprite (стрелы)
        this.totalSprites++;
        this.arrowSprite = new Image();
        this.arrowSprite.src = 'Arrows.png';
        this.arrowSpriteLoaded = false;
        this.arrowSprite.onload = () => {
            this.arrowSpriteLoaded = true;
            this.loadedSprites++;
            this.checkAllSpritesLoaded();
        };
        
        // Cloud sprites (27 новых облаков в большем разрешении из Clouds big 2.zip)
        this.cloudSprites = [];
        this.cloudSpritesLoaded = 0;
        this.cloudSpritesMeta = []; // Метаданные облаков (ширина, высота)
        
        // Загружаем 27 облаков (индексы 2-28)
        this.totalSprites += 27;  // 27 облаков
        for (let i = 2; i <= 28; i++) {
            const cloud = new Image();
            cloud.src = `cloud-${i}.png`;
            cloud.onload = () => {
                this.cloudSpritesLoaded++;
                this.loadedSprites++;
                this.checkAllSpritesLoaded();
                // Сохраняем реальные размеры облака
                this.cloudSpritesMeta.push({
                    width: cloud.naturalWidth,
                    height: cloud.naturalHeight
                });
            };
            this.cloudSprites.push(cloud);
        }
        
        // Rock sprites - ДВА ТИПА КАМНЕЙ
        // Big rocks (медленные, 3 выстрела) - 5 вариантов
        this.rockBigSprites = [];
        this.rockBigSpritesLoaded = 0;
        this.rockBigSpritesMeta = []; // Метаданные больших камней
        this.totalSprites += 5;  // 5 больших камней
        for (let i = 1; i <= 5; i++) {
            const rock = new Image();
            const index = i - 1; // Индекс в массиве (0-4)
            rock.src = `rock-big-${i}.png`;
            rock.onload = () => {
                this.rockBigSpritesLoaded++;
                this.loadedSprites++;
                this.checkAllSpritesLoaded();
                // Сохраняем метаданные по правильному индексу
                this.rockBigSpritesMeta[index] = {
                    width: rock.naturalWidth,
                    height: rock.naturalHeight
                };
            };
            this.rockBigSprites.push(rock);
        }
        
        // Little rocks (быстрые, 1 выстрел) - 6 вариантов
        this.rockLittleSprites = [];
        this.rockLittleSpritesLoaded = 0;
        this.rockLittleSpritesMeta = []; // Метаданные маленьких камней
        this.totalSprites += 6;  // 6 маленьких камней
        for (let i = 1; i <= 6; i++) {
            const rock = new Image();
            const index = i - 1; // Индекс в массиве (0-5)
            rock.src = `rock-little-${i}.png`;
            rock.onload = () => {
                this.rockLittleSpritesLoaded++;
                this.loadedSprites++;
                this.checkAllSpritesLoaded();
                // Сохраняем метаданные по правильному индексу
                this.rockLittleSpritesMeta[index] = {
                    width: rock.naturalWidth,
                    height: rock.naturalHeight
                };
            };
            this.rockLittleSprites.push(rock);
        }
        
        // Sound effects (ВСЕ ФАЙЛЫ КОНВЕРТИРОВАНЫ В MP3 для совместимости с iOS/iPad)
        this.sounds = {
            fly: new Audio('sound_fly.mp3'),
            fireball: new Audio('sound_fireball.mp3'),
            egg: new Audio('sound_egg.mp3'),
            break: new Audio('sound_break.mp3'),
            arrowBreak: new Audio('sound_arrow_break.mp3')  // Звук разлома стрел
        };
        
        // ПУЛ ЗВУКОВ для мгновенного воспроизведения (без задержек)
        // Создаём несколько копий каждого звука, чтобы они могли играть одновременно
        this.soundPool = {
            fireball: [],
            egg: [],
            break: [],
            arrowBreak: []  // Пул для звуков стрел
        };
        
        // Создаём по 5 копий каждого звука
        for (let i = 0; i < 5; i++) {
            this.soundPool.fireball.push(new Audio('sound_fireball.mp3'));
            this.soundPool.egg.push(new Audio('sound_egg.mp3'));
            this.soundPool.break.push(new Audio('sound_break.mp3'));
            this.soundPool.arrowBreak.push(new Audio('sound_arrow_break.mp3'));
        }
        
        // Устанавливаем громкость для всех звуков в пуле
        this.soundPool.fireball.forEach(s => s.volume = 0.5);
        this.soundPool.egg.forEach(s => s.volume = 0.7);
        this.soundPool.break.forEach(s => s.volume = 0.6);
        this.soundPool.arrowBreak.forEach(s => s.volume = 0.6);
        
        // Индексы текущего звука в пуле (для ротации)
        this.soundPoolIndex = {
            fireball: 0,
            egg: 0,
            break: 0,
            arrowBreak: 0
        };
        
        // Фоновая музыка
        this.bgMusic = new Audio('background_music.mp3');
        this.bgMusic.loop = true;
        this.bgMusic.volume = 0.3; // Тише чем звуковые эффекты
        this.musicEnabled = true; // Музыка включена по умолчанию
        
        // Звук ветра (фоновый эмбиент)
        this.windSound = new Audio('wind.mp3');
        this.windSound.loop = true;
        this.windSound.volume = 0.2; // Тихий фоновый звук
        
        // Громкость звуков
        this.sounds.fly.volume = 0.5;
        this.sounds.fireball.volume = 0.5;
        this.sounds.egg.volume = 0.7;
        this.sounds.break.volume = 0.6;
        
        // Звук полёта с петлёй
        this.sounds.fly.loop = true;
        // Скорость звука полёта = скорость анимации дракона (0.22)
        // Но для звука нужно больше, иначе будет очень медленно
        // Попробуем 1.2x для синхронизации с взмахами крыльев
        this.sounds.fly.playbackRate = 1.2;
        
        // Флаг инициализации звуков (для iOS/iPad)
        this.soundsInitialized = false;
        
        // Система deltaTime для одинаковой скорости на всех устройствах
        this.lastTime = performance.now();
        this.targetFPS = 60; // Целевой FPS
        this.deltaTime = 0;
        this.maxFPS = 60; // Максимальный FPS (оптимизация)
        this.frameTime = 1000 / this.maxFPS; // Минимальное время между кадрами
        
        // Sprite sheet settings (4x4 grid, 16 frames total)
        // Новый дракон из GIF: каждый кадр 800x450px (пропорции ~1.78:1)
        this.spriteSheet = {
            frameWidth: 800,
            frameHeight: 450,
            cols: 4,
            rows: 4,
            totalFrames: 16
        };
        
        // Player (Dragon)
        // УВЕЛИЧЕН В 1.2 РАЗА: 533x300 -> 640x360
        this.player = {
            x: 0,  // Плотно к левому краю
            y: this.height / 2,
            width: 640,  // 533 * 1.2
            height: 360, // 300 * 1.2
            velocityY: 0,
            velocityX: 0,
            targetX: 0,
            gravity: 0.3,
            jumpPower: -6,
            maxVelocity: 12,
            damping: 0.92,
            animFrame: 0,
            animSpeed: 0.22,
            animTimer: 0,
            // Система мигания при получении урона (как в Mario)
            invincible: false,
            invincibleTime: 0,
            invincibleDuration: 90, // 90 кадров = ~1.5 секунды
            blinkInterval: 4 // Мигать каждые 4 кадра
        };
        
        // Управление зажатием
        this.touchHolding = {
            left: false,  // Зажата левая сторона (подъем)
            right: false  // НЕ ИСПОЛЬЗУЕТСЯ - стрельба по тапу
        };
        
        // СИСТЕМА ЗАРЯДА ФАЕРБОЛОВ (0-100)
        this.fireballCharge = 100; // Текущий заряд
        this.fireballChargeMax = 100; // Максимальный заряд
        this.fireballChargeCost = 8; // Стоимость одного выстрела (уменьшено с 12 до 8)
        this.fireballChargeRegenRate = 0.4; // Скорость восстановления за кадр (увеличено с 0.2 до 0.4)
        this.fireballCooldown = 0; // Кулдаун между выстрелами (в кадрах)
        this.fireballCooldownMax = 10; // Минимальная задержка между выстрелами (10 кадров = ~0.17 сек)
        
        // Game objects
        this.fireballs = [];
        this.eggs = [];
        this.obstacles = [];
        this.clouds = [];
        this.particles = [];
        this.apples = [];      // Яблоки для лечения
        this.arrows = [];      // Стрелы
        
        // Spawn timers
        this.eggSpawnTimer = 0;
        this.obstacleSpawnTimer = 0;
        this.appleTreeSpawnTimer = 0;  // Отдельный таймер для яблонь
        this.cloudSpawnTimer = 0;
        this.arrowSpawnTimer = 0;  // Таймер спавна стрел
        
        // Speed multiplier system (increases every 50 eggs, max 3x)
        // УВЕЛИЧЕНА БАЗОВАЯ СКОРОСТЬ ДО 1.5 (было 1.0)
        this.baseSpeedMultiplier = 1.5;
        this.maxSpeedMultiplier = 4.5; // Максимум тоже увеличен пропорционально
        
        // Input
        this.keys = {};
        
        // Setup
        this.initSDK();  // Инициализация VK Bridge и Yandex SDK
        this.setupControls();
        this.initClouds();
        this.gameLoop();
    }
    
    async initSDK() {
        // Инициализируем доступные SDK (VK и/или Яндекс.Игры)
        await Promise.all([
            this.initVK(),
            this.initYandex()
        ]);
        
        // Загружаем лучший счёт из доступного SDK
        await this.loadBestScore();
    }
    
    async initYandex() {
        // Проверяем, доступен ли Yandex Games SDK
        if (typeof window.yandexGamesSDK !== 'undefined') {
            try {
                this.yandexSDK = window.yandexGamesSDK;
                
                // SDK уже инициализирован в yandex-sdk.js при загрузке страницы
                if (this.yandexSDK.isReady()) {
                    this.isYandex = true;
                    const playerInfo = this.yandexSDK.getPlayerInfo();
                    console.log('✅ Яндекс.Игры SDK готов:', playerInfo.name);
                } else {
                    console.log('ℹ️ Яндекс SDK еще инициализируется...');
                }
                
            } catch (error) {
                console.log('ℹ️ Яндекс.Игры SDK недоступен:', error);
                this.isYandex = false;
            }
        } else {
            console.log('ℹ️ Яндекс.Игры SDK не найден');
            this.isYandex = false;
        }
    }
    
    async initVK() {
        // Проверяем, доступен ли VK Bridge
        if (typeof window.vkBridge !== 'undefined') {
            try {
                this.vkBridge = window.vkBridge;
                await this.vkBridge.send('VKWebAppInit');
                this.isVK = true;
                
                // Получаем информацию о пользователе
                try {
                    this.vkUserInfo = await this.vkBridge.send('VKWebAppGetUserInfo');
                    console.log('✅ VK Bridge инициализирован:', this.vkUserInfo.first_name);
                } catch (e) {
                    console.log('ℹ️ VK User Info недоступен (возможно, тестирование)');
                }
                
            } catch (error) {
                console.log('ℹ️ VK Bridge недоступен, работаем в обычном режиме');
                this.isVK = false;
            }
        } else {
            console.log('ℹ️ VK Bridge не найден, работаем без VK интеграции');
            this.isVK = false;
        }
    }
    
    async loadBestScore() {
        // Приоритет: Яндекс.Игры > VK > localStorage
        
        // Яндекс.Игры
        if (this.isYandex && this.yandexSDK) {
            try {
                const score = await this.yandexSDK.loadScore();
                this.bestScore = score;
                console.log('📊 Лучший счёт загружен из Яндекс.Игры:', this.bestScore);
                return;
            } catch (error) {
                console.log('⚠️ Ошибка загрузки счёта из Яндекс.Игры:', error);
            }
        }
        
        // VK
        if (this.isVK && this.vkBridge) {
            try {
                const result = await this.vkBridge.send('VKWebAppStorageGet', {
                    keys: ['bestScore']
                });
                
                if (result.keys && result.keys.length > 0) {
                    this.bestScore = parseInt(result.keys[0].value) || 0;
                    console.log('📊 Лучший счёт загружен из VK:', this.bestScore);
                    return;
                }
            } catch (error) {
                console.log('⚠️ Ошибка загрузки счёта из VK Storage:', error);
            }
        }
        
        // localStorage (fallback)
        this.loadBestScoreLocal();
    }
    
    loadBestScoreLocal() {
        try {
            const saved = localStorage.getItem('dragonRunnerBestScore');
            this.bestScore = saved ? parseInt(saved) : 0;
            console.log('📊 Лучший счёт загружен из localStorage:', this.bestScore);
        } catch (e) {
            this.bestScore = 0;
        }
    }
    
    async saveBestScore() {
        // Сохраняем во все доступные хранилища
        
        // Яндекс.Игры
        if (this.isYandex && this.yandexSDK) {
            try {
                await this.yandexSDK.saveScore(this.bestScore);
                // Также отправляем в таблицу лидеров
                await this.yandexSDK.submitToLeaderboard(this.bestScore);
                console.log('💾 Рекорд сохранён в Яндекс.Игры:', this.bestScore);
            } catch (error) {
                console.log('⚠️ Ошибка сохранения в Яндекс.Игры:', error);
            }
        }
        
        // VK
        if (this.isVK && this.vkBridge) {
            try {
                await this.vkBridge.send('VKWebAppStorageSet', {
                    key: 'bestScore',
                    value: this.bestScore.toString()
                });
                console.log('💾 Рекорд сохранён в VK Storage:', this.bestScore);
            } catch (error) {
                console.log('⚠️ Ошибка сохранения в VK Storage:', error);
            }
        }
        
        // localStorage (всегда сохраняем как fallback)
        try {
            localStorage.setItem('dragonRunnerBestScore', this.bestScore.toString());
            console.log('💾 Рекорд сохранён в localStorage:', this.bestScore);
        } catch (e) {
            console.log('⚠️ Ошибка сохранения в localStorage');
        }
    }
    
    async showAd() {
        // Показываем рекламу в VK или Яндекс.Играх
        
        // Яндекс.Игры имеет приоритет
        if (this.isYandex && this.yandexSDK) {
            try {
                console.log('📺 Показываем рекламу Яндекс.Игры...');
                const success = await this.yandexSDK.showFullscreenAd();
                if (success) {
                    console.log('✅ Реклама Яндекс показана успешно');
                    return true;
                }
            } catch (error) {
                console.log('⚠️ Ошибка показа рекламы Яндекс:', error);
            }
        }
        
        // VK реклама
        if (this.isVK && this.vkBridge) {
            try {
                console.log('📺 Показываем рекламу VK...');
                
                // Показываем межстраничную рекламу (Interstitial)
                const result = await this.vkBridge.send('VKWebAppShowNativeAds', {
                    ad_format: 'interstitial'
                });
                
                console.log('✅ Реклама VK показана успешно:', result);
                return true;
                
            } catch (error) {
                console.log('⚠️ Ошибка показа рекламы VK:', error);
                
                // Пробуем показать reward-рекламу как fallback
                try {
                    const rewardResult = await this.vkBridge.send('VKWebAppShowNativeAds', {
                        ad_format: 'reward'
                    });
                    console.log('✅ VK Reward реклама показана:', rewardResult);
                    return true;
                } catch (rewardError) {
                    console.log('⚠️ VK Reward реклама тоже недоступна:', rewardError);
                }
            }
        }
        
        console.log('ℹ️ Реклама недоступна (не VK и не Яндекс.Игры)');
        return false;
    }
    
    async checkAndShowAd() {
        // Проверяем, нужно ли показывать рекламу
        this.gamesPlayedCount++;
        
        console.log(`🎮 Игр сыграно: ${this.gamesPlayedCount} (реклама каждые ${this.showAdEvery})`);
        
        // Показываем рекламу каждые N игр
        if (this.gamesPlayedCount % this.showAdEvery === 0) {
            await this.showAd();
        }
    }
    
    checkAllSpritesLoaded() {
        // Проверяем, все ли спрайты загружены
        if (this.loadedSprites >= this.totalSprites && !this.allSpritesLoaded) {
            this.allSpritesLoaded = true;
            console.log(`✅ Все спрайты загружены: ${this.loadedSprites}/${this.totalSprites}`);
            // Включаем кнопку "Играть"
            const startButton = document.querySelector('#startScreen button');
            if (startButton) {
                startButton.disabled = false;
                startButton.style.opacity = '1';
                startButton.style.cursor = 'pointer';
            }
        }
    }
    
    setupControls() {
        // Keyboard controls (for desktop)
        document.addEventListener('keydown', (e) => {
            if (this.gameState === 'playing') {
                if (e.key === ' ') {
                    e.preventDefault();
                    this.touchHolding.left = true; // Зажатие пробела = подъем
                }
                if (e.key === 'f' || e.key === 'F') {
                    e.preventDefault();
                    this.shoot(); // ВЫСТРЕЛ ПО НАЖАТИЮ F
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.key === ' ') {
                this.touchHolding.left = false;
            }
        });
        
        // Touch controls - ТАП (не зажатие!)
        // Левая сторона экрана = тап для подъема, Правая сторона = тап для выстрела
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            
            // Инициализация звуков при первом касании (для iOS/iPad)
            if (!this.soundsInitialized) {
                this.soundsInitialized = true;
                Object.values(this.sounds).forEach(sound => {
                    sound.load();
                });
                console.log('Звуки разблокированы для iOS/iPad');
            }
            
            if (this.gameState === 'playing') {
                Array.from(e.touches).forEach(touch => {
                    const rect = this.canvas.getBoundingClientRect();
                    const touchX = touch.clientX - rect.left;
                    
                    // Тап на левой половине экрана - подъем
                    if (touchX < this.width / 2) {
                        this.touchHolding.left = true;
                    } 
                    // Тап на правой половине экрана - выстрел фаерболом
                    else {
                        this.shoot(); // ВЫСТРЕЛ ПО ТАПУ
                    }
                });
            }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            // Проверяем оставшиеся касания
            const remainingTouches = Array.from(e.touches);
            if (remainingTouches.length === 0) {
                // Все пальцы убраны - отпускаем подъем
                this.touchHolding.left = false;
            } else {
                // Проверяем, остались ли касания на левой стороне
                let hasLeft = false;
                remainingTouches.forEach(touch => {
                    const rect = this.canvas.getBoundingClientRect();
                    const touchX = touch.clientX - rect.left;
                    if (touchX < this.width / 2) hasLeft = true;
                });
                this.touchHolding.left = hasLeft;
            }
        });
        
        // Mouse controls - КЛИК (не зажатие!)
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.gameState === 'playing') {
                const rect = this.canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                
                // Клик на левой половине экрана - начать подъем
                if (mouseX < this.width / 2) {
                    this.touchHolding.left = true;
                } 
                // Клик на правой половине экрана - выстрел
                else {
                    this.shoot(); // ВЫСТРЕЛ ПО КЛИКУ
                }
            }
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            
            // Отпускаем только левую сторону (подъем)
            if (mouseX < this.width / 2) {
                this.touchHolding.left = false;
            }
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            // Отпускаем все при выходе курсора
            this.touchHolding.left = false;
            this.touchHolding.right = false;
        });
        
        // Button controls
        document.getElementById('startBtn').addEventListener('click', () => {
            console.log('🎮 Кнопка ИГРАТЬ нажата');
            
            // Инициализация звуков при клике на кнопку (для iOS/iPad)
            if (!this.soundsInitialized) {
                this.soundsInitialized = true;
                console.log('🔊 Загружаем звуки...');
                
                Object.values(this.sounds).forEach(sound => {
                    sound.load();
                });
                
                // Загружаем все звуки из пула
                Object.values(this.soundPool).forEach(pool => {
                    pool.forEach(sound => sound.load());
                });
                
                this.bgMusic.load(); // Загружаем фоновую музыку
                this.windSound.load(); // Загружаем звук ветра
                
                console.log('✅ Звуки разблокированы при нажатии Играть');
            }
            
            // КРИТИЧНО для iOS: запускаем звуки СИНХРОННО с кликом
            console.log('▶️ Запускаем звук полёта...');
            this.sounds.fly.currentTime = 0;
            this.sounds.fly.play()
                .then(() => console.log('✅ Звук полёта запущен'))
                .catch(e => console.error('❌ Fly sound error:', e));
            
            // Запускаем звук ветра (фоновый эмбиент)
            console.log('▶️ Запускаем звук ветра...');
            this.windSound.currentTime = 0;
            this.windSound.play()
                .then(() => console.log('✅ Звук ветра запущен'))
                .catch(e => console.error('❌ Wind sound error:', e));
            
            // Запускаем фоновую музыку
            if (this.musicEnabled) {
                console.log('▶️ Запускаем фоновую музыку...');
                // ВАЖНО: Останавливаем музыку перед запуском, чтобы избежать двойного проигрывания
                this.bgMusic.pause();
                this.bgMusic.currentTime = 0;
                this.bgMusic.play()
                    .then(() => console.log('✅ Фоновая музыка запущена'))
                    .catch(e => console.error('❌ Background music error:', e));
            }
            
            this.startGame();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            // КРИТИЧНО для iOS: запускаем звуки СИНХРОННО с кликом
            this.sounds.fly.currentTime = 0;
            this.sounds.fly.play().catch(e => console.warn('Fly sound error:', e));
            
            // Перезапускаем звук ветра
            this.windSound.currentTime = 0;
            this.windSound.play().catch(e => console.warn('Wind sound error:', e));
            
            this.restartGame();
        });
    }
    
    flap() {
        // Взлет как в Flappy Bird
        this.player.velocityY = this.player.jumpPower;
    }
    
    startGame() {
        document.getElementById('startScreen').style.display = 'none';
        this.gameState = 'playing';
        // Инициализируем заряд
        this.fireballCharge = 100;
        this.fireballCooldown = 0;
        // Сбрасываем неуязвимость
        this.player.invincible = false;
        this.player.invincibleTime = 0;
        
        // НАЧАЛЬНЫЙ СПАВН убран - пусть объекты появляются по таймеру
        
        // СБРОС ТАЙМЕРОВ СПАВНА при старте игры
        this.eggSpawnTimer = 0;
        this.obstacleSpawnTimer = 0;
        this.appleTreeSpawnTimer = 0;
        this.arrowSpawnTimer = 0;
        
        // Звук полёта уже запущен в обработчике кнопки
        this.updateUI();
    }
    
    restartGame() {
        document.getElementById('gameOver').style.display = 'none';
        this.gameState = 'playing';
        this.lives = 3;
        this.eggsCollected = 0;
        this.player.y = this.height / 2;
        this.player.velocityY = 0;
        this.fireballs = [];
        this.eggs = [];
        this.obstacles = [];
        this.particles = [];
        this.apples = [];      // Очищаем яблоки
        this.arrows = [];      // Очищаем стрелы
        // Восстанавливаем заряд
        this.fireballCharge = 100;
        this.fireballCooldown = 0;
        // Сбрасываем неуязвимость
        this.player.invincible = false;
        this.player.invincibleTime = 0;
        // СБРОС ТАЙМЕРОВ СПАВНА
        this.eggSpawnTimer = 0;
        this.obstacleSpawnTimer = 0;
        this.appleTreeSpawnTimer = 0;  // ВАЖНО: сброс таймера яблони
        this.arrowSpawnTimer = 0;
        // Звук полёта уже запущен в обработчике кнопки
        this.updateUI();
    }
    
    initClouds() {
        // Создаем облака на 4 слоях (по глубине) - ГУСТОЕ ЗАПОЛНЕНИЕ
        // Слой 0 (задний фон) - очень медленные, прозрачные, большие
        // Слой 1 (дальний) - медленные, прозрачные, средние
        // Слой 2 (средний) - средние по скорости и размеру
        // Слой 3 (ближний) - быстрые, яркие, большие
        // Слой 4 (ПЕРЕДНИЙ) - очень быстрые, полупрозрачные, ПЕРЕД ИГРОКОМ
        
        const layers = [
            { count: 5, speedRange: [0.2, 0.4], scaleRange: [2.5, 4.0], depth: 0.2, alpha: 0.4, background: true },  // задний фон - БОЛЬШИЕ
            { count: 4, speedRange: [0.3, 0.6], scaleRange: [1.5, 2.5], depth: 0.4, alpha: 0.5, background: true },  // дальний
            { count: 4, speedRange: [0.6, 1.0], scaleRange: [2.0, 3.5], depth: 0.6, alpha: 0.7, background: true },  // средний
            { count: 4, speedRange: [1.0, 1.5], scaleRange: [3.0, 4.5], depth: 0.8, alpha: 0.85, background: true }, // ближний
            { count: 2, speedRange: [1.5, 2.0], scaleRange: [2.0, 3.0], depth: 1.5, alpha: 0.7, background: false } // ПЕРЕДНИЙ слой - непрозрачность 70%
        ];
        
        layers.forEach((layer, layerIndex) => {
            for (let i = 0; i < layer.count; i++) {
                // Выбираем случайный тип облака
                const cloudType = Math.floor(Math.random() * this.cloudSprites.length);
                const scale = layer.scaleRange[0] + Math.random() * (layer.scaleRange[1] - layer.scaleRange[0]);
                
                this.clouds.push({
                    x: Math.random() * this.width * 1.5, // разбросаны по экрану
                    y: Math.random() * this.height * 0.9, // 90% экрана для лучшего заполнения
                    scale: scale, // масштаб облака
                    speed: layer.speedRange[0] + Math.random() * (layer.speedRange[1] - layer.speedRange[0]),
                    layer: layerIndex,
                    depth: layer.depth,
                    type: cloudType, // индекс спрайта
                    alpha: layer.alpha, // прозрачность слоя
                    background: layer.background // true = за объектами, false = перед объектами
                });
            }
        });
    }
    
    shoot() {
        // Проверяем кулдаун и заряд
        if (this.fireballCooldown > 0) return; // Еще не готов
        if (this.fireballCharge < this.fireballChargeCost) return; // Недостаточно заряда
        
        // МГНОВЕННОЕ воспроизведение через ПУЛ ЗВУКОВ
        const soundIndex = this.soundPoolIndex.fireball;
        const sound = this.soundPool.fireball[soundIndex];
        sound.currentTime = 0; // Сбрасываем на начало
        sound.play().catch(() => {}); // Без логирования для скорости
        
        // Переключаем на следующий звук в пуле (ротация)
        this.soundPoolIndex.fireball = (soundIndex + 1) % this.soundPool.fireball.length;
        
        // Расходуем заряд
        this.fireballCharge -= this.fireballChargeCost;
        
        // Устанавливаем кулдаун
        this.fireballCooldown = this.fireballCooldownMax;
        
        // Создаем фаербол
        this.fireballs.push({
            x: this.player.x + this.player.width,
            y: this.player.y + this.player.height / 2,
            width: 48,  // УВЕЛИЧЕН для более крупного фаербола
            height: 32, // УВЕЛИЧЕН для более крупного фаербола
            speed: 12   // Увеличена скорость для более динамичного полета
        });
        
        // Обновляем UI
        this.updateUI();
    }
    
    
    update() {
        // Если игра на паузе (реклама), не обновляем геймплей
        if (this.gamePausedForAd) return;
        
        if (this.gameState !== 'playing') return;
        
        // Update time of day
        this.timeOfDay = (this.timeOfDay + this.dayNightSpeed) % 1;
        
        // СИСТЕМА ЗАРЯДА ФАЕРБОЛОВ
        // Уменьшаем кулдаун
        if (this.fireballCooldown > 0) {
            this.fireballCooldown -= this.deltaTime;
        }
        
        // Восстанавливаем заряд постепенно (если не на максимуме)
        if (this.fireballCharge < this.fireballChargeMax) {
            this.fireballCharge += this.fireballChargeRegenRate * this.deltaTime;
            if (this.fireballCharge > this.fireballChargeMax) {
                this.fireballCharge = this.fireballChargeMax;
            }
            this.updateUI(); // Обновляем UI при изменении заряда
        }
        
        // Обработка зажатия для подъема (левая сторона)
        if (this.touchHolding.left) {
            // Постоянная сила подъема при зажатии
            this.player.velocityY += this.player.jumpPower * 0.3 * this.deltaTime;
        }
        
        // Player movement - Плавный полет без резких движений
        // Применяем гравитацию
        this.player.velocityY += this.player.gravity * this.deltaTime;
        
        // Применяем демпфирование для плавности
        this.player.velocityY *= Math.pow(this.player.damping, this.deltaTime);
        
        // Ограничиваем максимальную скорость
        if (this.player.velocityY > this.player.maxVelocity) {
            this.player.velocityY = this.player.maxVelocity;
        }
        if (this.player.velocityY < -this.player.maxVelocity) {
            this.player.velocityY = -this.player.maxVelocity;
        }
        
        this.player.y += this.player.velocityY * this.deltaTime;
        
        // Горизонтальное движение - вправо при взлете, назад при падении
        if (this.player.velocityY < 0) {
            // Поднимается - двигаемся вправо
            this.player.targetX = 100;
        } else {
            // Падает - возвращаемся к левому краю
            this.player.targetX = 0;
        }
        
        // Плавное движение к целевой позиции
        const dx = this.player.targetX - this.player.x;
        this.player.x += dx * 0.1 * this.deltaTime; // Плавное смещение
        
        // Keep player in bounds - разрешаем выход на 1/3 тела за экран сверху/снизу
        const allowedOverflow = this.player.height / 3;
        if (this.player.y < -allowedOverflow) {
            this.player.y = -allowedOverflow;
            this.player.velocityY = Math.max(0, this.player.velocityY);
        }
        if (this.player.y > this.height - this.player.height + allowedOverflow) {
            this.player.y = this.height - this.player.height + allowedOverflow;
            this.player.velocityY = Math.min(0, this.player.velocityY);
        }
        
        // Обновление таймера неуязвимости (мигание после удара)
        if (this.player.invincible) {
            this.player.invincibleTime += this.deltaTime;
            if (this.player.invincibleTime >= this.player.invincibleDuration) {
                this.player.invincible = false;
                this.player.invincibleTime = 0;
            }
        }
        
        // Animate player - плавная последовательная смена кадров
        this.player.animTimer += this.player.animSpeed * this.deltaTime;
        if (this.player.animTimer >= 1) {
            this.player.animFrame = (this.player.animFrame + 1) % this.spriteSheet.totalFrames;
            this.player.animTimer = 0;
        }
        
        // Update clouds
        this.clouds.forEach(cloud => {
            cloud.x -= cloud.speed * (1 + (this.baseSpeedMultiplier - 1) * 0.3) * this.deltaTime; // Облака ускоряются медленнее (30% от общего ускорения)
            // Получаем ширину облака из спрайта
            const sprite = this.cloudSprites[cloud.type];
            const cloudWidth = sprite ? sprite.naturalWidth * cloud.scale : 100;
            
            if (cloud.x < -cloudWidth) {
                cloud.x = this.width;
                cloud.y = Math.random() * this.height * 0.75; // 75% экрана
            }
        });
        
        // Update fireballs
        this.fireballs = this.fireballs.filter(fb => {
            fb.x += fb.speed * this.deltaTime;
            return fb.x < this.width;
        });
        
        // Spawn eggs - оптимальный спавн (каждые 2.5 секунды)
        this.eggSpawnTimer += this.deltaTime;
        if (this.eggSpawnTimer > 150) {  // Спавн каждые 2.5 секунды (150 кадров @ 60 FPS)
            this.eggSpawnTimer = 0;
            this.eggs.push({
                x: this.width,
                y: 50 + Math.random() * (this.height - 100),
                width: 81,  // Размер нового яйца
                height: 81,
                speed: 4    // Удвоенная скорость для динамичности
            });
        }
        
        // Spawn obstacles (КАМНИ) - как было раньше (каждые 3 секунды)
        this.obstacleSpawnTimer += this.deltaTime;
        if (this.obstacleSpawnTimer > 180) {  // Спавн каждые 3 секунды (180 кадров @ 60 FPS)
            this.obstacleSpawnTimer = 0;
            
            // Случайный выбор типа камня (50% big, 50% little)
            const isBigRock = Math.random() < 0.5;
            
            if (isBigRock && this.rockBigSpritesLoaded > 0) {
                // БОЛЬШОЙ КАМЕНЬ: медленный, 3 выстрела
                const rockType = Math.floor(Math.random() * 5); // 0-4 (5 вариантов)
                const meta = this.rockBigSpritesMeta[rockType];
                
                // Используем реальные размеры спрайта * 2 (целое число для плавности)
                const baseWidth = meta ? meta.width : 100;
                const baseHeight = meta ? meta.height : 150;
                const width = baseWidth * 2;
                const height = baseHeight * 2;
                
                this.obstacles.push({
                    x: this.width,
                    y: 50 + Math.random() * (this.height - height - 50),
                    width: width,
                    height: height,
                    speed: 4,     // Удвоенная скорость
                    health: 3,    // 3 выстрела для разрушения
                    type: 'big',
                    rockType: rockType
                });
            } else if (this.rockLittleSpritesLoaded > 0) {
                // МАЛЕНЬКИЙ КАМЕНЬ: быстрый, 1 выстрел
                const rockType = Math.floor(Math.random() * 6); // 0-5 (6 вариантов)
                const meta = this.rockLittleSpritesMeta[rockType];
                
                // Используем реальные размеры спрайта * 2 (целое число для плавности)
                const baseWidth = meta ? meta.width : 40;
                const baseHeight = meta ? meta.height : 60;
                const width = baseWidth * 2;
                const height = baseHeight * 2;
                
                this.obstacles.push({
                    x: this.width,
                    y: 50 + Math.random() * (this.height - height - 50),
                    width: width,
                    height: height,
                    speed: 10,    // Удвоенная скорость
                    health: 1,    // 1 выстрел для разрушения
                    type: 'little',
                    rockType: rockType
                });
            }
        }
        
        // Spawn APPLE TREE (ЯБЛОНЯ) - ОТДЕЛЬНЫЙ ТАЙМЕР (раз в 40 секунд)
        this.appleTreeSpawnTimer += this.deltaTime;
        
        if (this.appleTreeSpawnTimer > 2400) {  // Спавн каждые 40 секунд (2400 кадров @ 60 FPS)
            this.appleTreeSpawnTimer = 0;
            
            if (this.appleTreeSpriteLoaded) {
                // ЯБЛОНЯ: редкая, 3 выстрела, даёт яблоко
                this.obstacles.push({
                    x: this.width,
                    y: 50 + Math.random() * (this.height - 200),
                    width: 119 * 2,  // Размер яблони из файла * 2
                    height: 167 * 2,
                    speed: 4,
                    health: 3,       // 3 выстрела как у больших камней
                    maxHealth: 3,
                    type: 'appletree'
                });
            }
        }
        
        // Update eggs
        this.eggs = this.eggs.filter(egg => {
            egg.x -= egg.speed * this.baseSpeedMultiplier * this.deltaTime;
            
            // Check collision with player
            if (this.checkDragonCollision(this.player, egg)) {
                this.eggsCollected++;
                
                // Воспроизводим звук сбора яйца
                this.playSound('egg');
                
                // Плавное увеличение скорости каждые 50 яиц (максимум 3x)
                const targetSpeed = Math.min(
                    1.0 + Math.floor(this.eggsCollected / 50) * 0.5, // +0.5x каждые 50 яиц
                    this.maxSpeedMultiplier
                );
                // Плавный переход к целевой скорости
                this.baseSpeedMultiplier += (targetSpeed - this.baseSpeedMultiplier) * 0.05;
                
                this.updateUI();
                this.createParticles(egg.x, egg.y, '#FFD700');
                return false;
            }
            
            return egg.x > -egg.width;
        });
        
        // Update obstacles
        this.obstacles = this.obstacles.filter(obs => {
            obs.x -= obs.speed * this.baseSpeedMultiplier * this.deltaTime;
            // Убрано вращение для простой траектории
            
            // Check collision with fireballs
            for (let i = this.fireballs.length - 1; i >= 0; i--) {
                if (this.checkCollision(this.fireballs[i], obs)) {
                    obs.health--;
                    this.fireballs.splice(i, 1);
                    this.createParticles(obs.x, obs.y, '#FF4500');
                    
                    if (obs.health <= 0) {
                        // Score removed
                        // Воспроизводим звук разрушения камня
                        this.playSound('break');
                        
                        // ЕСЛИ ЭТО ЯБЛОНЯ - СПАВНИМ ЯБЛОКО!
                        if (obs.type === 'appletree') {
                            this.apples.push({
                                x: obs.x + obs.width / 2,
                                y: obs.y + obs.height / 2,
                                width: 25 * 2,   // Новый размер яблока: 25x32 → 50x64
                                height: 32 * 2,
                                speed: obs.speed  // Наследуем скорость от яблони (только движение влево)
                            });
                        }
                        
                        this.updateUI();
                        return false;
                    }
                }
            }
            
            // Check collision with player - УРОН ТЕПЕРЬ ВСЕГДА 1 ЖИЗНЬ
            if (!this.player.invincible && this.checkDragonCollision(this.player, obs)) {
                this.lives -= 1;  // Всегда отнимаем только 1 жизнь
                this.updateUI();
                this.createParticles(obs.x, obs.y, '#FF0000');
                
                // Воспроизводим звук получения урона
                // Звук урона (нет в списке)
                
                // Активируем неуязвимость и мигание
                this.player.invincible = true;
                this.player.invincibleTime = 0;
                
                if (this.lives <= 0) {
                    this.gameOver();
                    return false; // Удаляем препятствие только при Game Over
                }
                // НЕ удаляем препятствие, оно продолжит движение
            }
            
            return obs.x > -obs.width;
        });
        
        // Update apples (яблоки)
        this.apples = this.apples.filter(apple => {
            // Движение только влево (без гравитации - яблоко остается на месте по Y)
            apple.x -= apple.speed * this.baseSpeedMultiplier * this.deltaTime;
            // Гравитация и velocityY удалены - яблоко остается на своей высоте
            
            // Проверка столкновения с игроком
            if (this.checkDragonCollision(this.player, apple)) {
                // ЛЕЧИМ 1 ЖИЗНЬ (максимум 3)
                if (this.lives < 3) {
                    this.lives++;
                }
                // ПОЛНОСТЬЮ ВОССТАНАВЛИВАЕМ ЭНЕРГИЮ
                this.fireballCharge = this.fireballChargeMax;
                
                this.playSound('egg');  // Звук сбора (пока используем звук яйца)
                this.updateUI();
                this.createParticles(apple.x, apple.y, '#00FF00');
                return false;
            }
            
            // Удаляем если вылетело за экран или упало
            return apple.x > -apple.width && apple.y < this.height + 50;
        });
        
        // Spawn arrows (стрелы атакуют снизу справа)
        this.arrowSpawnTimer += this.deltaTime;
        if (this.arrowSpawnTimer > 240) {  // Каждые 4 секунды (240 кадров)
            this.arrowSpawnTimer = 0;
            
            if (this.arrowSpriteLoaded) {
                // Стрела летит из правого нижнего угла в сторону дракона
                const targetX = this.player.x + this.player.width / 2;
                const targetY = this.player.y + this.player.height / 2;
                const startX = this.width + 50;
                const startY = this.height - 50;
                
                // Вычисляем направление
                const dx = targetX - startX;
                const dy = targetY - startY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const arrowSpeed = 8;
                
                this.arrows.push({
                    x: startX,
                    y: startY,
                    width: 156,  // Новый размер стрел: 156x70
                    height: 70,
                    velocityX: (dx / dist) * arrowSpeed,
                    velocityY: (dy / dist) * arrowSpeed,
                    angle: Math.atan2(dy, dx),  // Угол поворота стрелы
                    health: 1  // Стрелу можно сбить 1 выстрелом
                });
            }
        }
        
        // Update arrows
        this.arrows = this.arrows.filter(arrow => {
            arrow.x += arrow.velocityX * this.deltaTime;
            arrow.y += arrow.velocityY * this.deltaTime;
            
            // ПРОВЕРКА СТОЛКНОВЕНИЯ С ФАЕРБОЛАМИ - МОЖНО СБИТЬ!
            for (let i = this.fireballs.length - 1; i >= 0; i--) {
                if (this.checkCollision(this.fireballs[i], arrow)) {
                    arrow.health--;
                    this.fireballs.splice(i, 1);
                    this.createParticles(arrow.x, arrow.y, '#FF4500');
                    
                    if (arrow.health <= 0) {
                        this.playSound('arrowBreak');  // Звук уничтожения стрелы
                        return false;  // Удаляем стрелу
                    }
                }
            }
            
            // Проверка столкновения с игроком - УРОН 1 ЖИЗНЬ
            if (!this.player.invincible && this.checkDragonCollision(this.player, arrow)) {
                this.lives -= 1;
                this.updateUI();
                this.createParticles(arrow.x, arrow.y, '#8B4513');
                
                // Активируем неуязвимость
                this.player.invincible = true;
                this.player.invincibleTime = 0;
                
                if (this.lives <= 0) {
                    this.gameOver();
                }
                return false;
            }
            
            // Удаляем если вылетело за экран
            return arrow.x > -arrow.width && arrow.x < this.width + 100 &&
                   arrow.y > -arrow.height && arrow.y < this.height + 100;
        });
        
        // Update particles
        this.particles = this.particles.filter(p => {
            p.x += p.vx * this.deltaTime;
            p.y += p.vy * this.deltaTime;
            p.life -= this.deltaTime;
            return p.life > 0;
        });
    }
    
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    checkDragonCollision(dragon, obj) {
        // ТОЧНЫЙ коллайдер дракона - описывает реальную форму тела
        // Дракон 640x360, учитываем хвост и форму тела
        const dragonHitbox = {
            x: dragon.x + dragon.width * 0.3,   // Отступ слева (хвост длинный)
            y: dragon.y + dragon.height * 0.25, // Отступ сверху (крылья)
            width: dragon.width * 0.45,         // Только тело и голова
            height: dragon.height * 0.5         // Центральная часть
        };
        
        return dragonHitbox.x < obj.x + obj.width &&
               dragonHitbox.x + dragonHitbox.width > obj.x &&
               dragonHitbox.y < obj.y + obj.height &&
               dragonHitbox.y + dragonHitbox.height > obj.y;
    }
    
    
    createParticles(x, y, color) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                color: color,
                life: 30
            });
        }
    }
    
    draw() {
        // ВАЖНО: Очищаем весь canvas перед отрисовкой нового кадра
        // Это предотвращает наложение предыдущих кадров анимации
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Устанавливаем режим композитинга по умолчанию
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.globalAlpha = 1;
        
        // Draw sky with time of day
        this.drawSky();
        
        // Draw BACKGROUND clouds (за всеми объектами)
        this.drawClouds(true);
        
        // Draw game objects
        this.eggs.forEach(egg => this.drawEgg(egg));
        this.obstacles.forEach(obs => this.drawObstacle(obs));
        this.fireballs.forEach(fb => this.drawFireball(fb));
        this.apples.forEach(apple => this.drawApple(apple));      // Яблоки
        this.arrows.forEach(arrow => this.drawArrow(arrow));      // Стрелы
        
        this.particles.forEach(p => this.drawParticle(p));
        
        // Draw player
        this.drawDragon();
        
        // Draw FOREGROUND clouds (перед всеми объектами, полупрозрачные)
        this.drawClouds(false);
        
        // Применяем цветовой фильтр в зависимости от времени суток
        this.applyTimeOfDayFilter();
        
        // Draw UI overlay (поверх всего)
        this.drawUI();
    }
    
    applyTimeOfDayFilter() {
        // Легкий цветовой оттенок в зависимости от времени суток
        let filterColor = null;
        let filterAlpha = 0;
        
        if (this.timeOfDay >= 0.25 && this.timeOfDay < 0.4) {
            // Sunset - теплый оранжево-розовый оттенок
            const t = (this.timeOfDay - 0.25) / 0.15;
            filterColor = `rgba(255, 150, 100, ${0.1 * t})`; // Теплый оранжевый
        } else if (this.timeOfDay >= 0.4 && this.timeOfDay < 0.6) {
            // Dusk - фиолетово-синий оттенок
            const t = (this.timeOfDay - 0.4) / 0.2;
            filterColor = `rgba(100, 100, 180, ${0.1 + 0.05 * t})`; // Холодный синий
        } else if (this.timeOfDay >= 0.6 && this.timeOfDay < 0.85) {
            // Night - тёмно-синий оттенок
            filterColor = 'rgba(50, 50, 100, 0.15)';
        } else if (this.timeOfDay >= 0.85) {
            // Dawn - лёгкий розово-золотистый оттенок
            const t = (this.timeOfDay - 0.85) / 0.15;
            filterColor = `rgba(255, 200, 150, ${0.1 * (1 - t)})`; // Утренний свет
        }
        
        if (filterColor) {
            this.ctx.fillStyle = filterColor;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
    }
    
    // Пиксель-арт шрифт 5x7 (цифры 0-9)
    getPixelDigit(digit) {
        const digits = {
            '0': [
                '0111',
                '1001',
                '1001',
                '1001',
                '1001',
                '1001',
                '0110'
            ],
            '1': [
                '0010',
                '0110',
                '0010',
                '0010',
                '0010',
                '0010',
                '0111'
            ],
            '2': [
                '0110',
                '1001',
                '0001',
                '0010',
                '0100',
                '1000',
                '1111'
            ],
            '3': [
                '1110',
                '0001',
                '0001',
                '0110',
                '0001',
                '0001',
                '1110'
            ],
            '4': [
                '0010',
                '0110',
                '1010',
                '1010',
                '1111',
                '0010',
                '0010'
            ],
            '5': [
                '1111',
                '1000',
                '1110',
                '0001',
                '0001',
                '1001',
                '0110'
            ],
            '6': [
                '0110',
                '1000',
                '1000',
                '1110',
                '1001',
                '1001',
                '0110'
            ],
            '7': [
                '1111',
                '0001',
                '0010',
                '0010',
                '0100',
                '0100',
                '0100'
            ],
            '8': [
                '0110',
                '1001',
                '1001',
                '0110',
                '1001',
                '1001',
                '0110'
            ],
            '9': [
                '0110',
                '1001',
                '1001',
                '0111',
                '0001',
                '0001',
                '0110'
            ]
        };
        return digits[digit.toString()] || digits['0'];
    }
    
    // Отрисовка пиксель-арт числа
    drawPixelNumber(x, y, number, pixelSize = 3, color = '#FFFFFF') {
        const numStr = number.toString();
        const digitWidth = 4;
        const digitHeight = 7;
        const spacing = 1;
        
        this.ctx.save();
        this.ctx.imageSmoothingEnabled = false;
        
        let offsetX = 0;
        for (let i = 0; i < numStr.length; i++) {
            const digitPattern = this.getPixelDigit(numStr[i]);
            
            for (let row = 0; row < digitHeight; row++) {
                for (let col = 0; col < digitWidth; col++) {
                    if (digitPattern[row][col] === '1') {
                        this.ctx.fillStyle = color;
                        this.ctx.fillRect(
                            x + offsetX + col * pixelSize,
                            y + row * pixelSize,
                            pixelSize,
                            pixelSize
                        );
                    }
                }
            }
            
            offsetX += (digitWidth + spacing) * pixelSize;
        }
        
        this.ctx.restore();
    }
    
    // Отрисовка UI поверх игрового поля
    drawUI() {
        this.ctx.save();
        this.ctx.imageSmoothingEnabled = false;
        
        const padding = 20;
        
        // 3 СЕРДЦА ПО ЦЕНТРУ СВЕРХУ
        if (this.heartIconLoaded) {
            const heartWidth = this.heartIcon.width; // Иконки уже увеличены в 2×
            const heartHeight = this.heartIcon.height;
            const heartSpacing = 10;
            const totalWidth = heartWidth * 3 + heartSpacing * 2;
            const startX = (this.width - totalWidth) / 2;
            const heartY = padding;
            
            for (let i = 0; i < 3; i++) {
                const x = startX + i * (heartWidth + heartSpacing);
                
                // Если жизней меньше, рисуем полупрозрачное сердце
                if (i < this.lives) {
                    this.ctx.globalAlpha = 1.0;
                } else {
                    this.ctx.globalAlpha = 0.3;
                }
                
                this.ctx.drawImage(
                    this.heartIcon,
                    x, heartY,
                    heartWidth, heartHeight
                );
            }
            
            this.ctx.globalAlpha = 1.0;
        }
        
        // ЯЙЦО И СЧЁТ ПОД СЕРДЦАМИ ПО ЦЕНТРУ
        if (this.eggIconLoaded && this.heartIconLoaded) {
            const eggWidth = this.eggIcon.width; // Иконки уже увеличены в 2×
            const eggHeight = this.eggIcon.height;
            const heartHeight = this.heartIcon.height;
            
            // Позиция под сердцами
            const eggY = padding + heartHeight + 15; // 15px отступ от сердец
            
            // Ширина блока (иконка + отступ + цифры)
            // Примерная ширина для 2-3 цифр
            const numberWidth = this.eggsCollected.toString().length * 15;
            const totalEggWidth = eggWidth + 10 + numberWidth;
            
            // Центрируем весь блок
            const eggX = (this.width - totalEggWidth) / 2;
            
            // Рисуем иконку яйца
            this.ctx.drawImage(
                this.eggIcon,
                eggX, eggY,
                eggWidth, eggHeight
            );
            
            // Рисуем счёт яиц справа от иконки
            const numberX = eggX + eggWidth + 10;
            const numberY = eggY + (eggHeight / 2) - 10; // Центрируем по вертикали
            this.drawPixelNumber(numberX, numberY, this.eggsCollected, 3, '#FFFFFF');
        }
        
        // ЗАРЯД ФАЕРБОЛОВ ВНИЗУ СПРАВА
        const chargeBarWidth = 200;
        const chargeBarHeight = 20;
        const chargeX = this.width - chargeBarWidth - padding;
        const chargeY = this.height - chargeBarHeight - padding;
        
        // Фон шкалы
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(chargeX - 5, chargeY - 5, chargeBarWidth + 10, chargeBarHeight + 10);
        
        // Граница
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(chargeX, chargeY, chargeBarWidth, chargeBarHeight);
        
        // Заполнение
        const fillWidth = (this.fireballCharge / this.fireballChargeMax) * chargeBarWidth;
        const gradient = this.ctx.createLinearGradient(chargeX, 0, chargeX + chargeBarWidth, 0);
        gradient.addColorStop(0, '#FF4500');
        gradient.addColorStop(0.5, '#FF6B00');
        gradient.addColorStop(1, '#FFD700');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(chargeX, chargeY, fillWidth, chargeBarHeight);
        
        // Текст значения
        const chargeText = Math.floor(this.fireballCharge);
        const textX = chargeX + chargeBarWidth / 2 - 15;
        const textY = chargeY - 10;
        this.drawPixelNumber(textX, textY, chargeText, 2, '#FFFFFF');
        
        this.ctx.restore();
    }
    
    drawSky() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        
        if (this.timeOfDay < 0.25) {
            // Day (0.0 - 0.25)
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#E0F6FF');
        } else if (this.timeOfDay < 0.4) {
            // Sunset - яркий закат как на фото (0.25 - 0.4)
            const t = (this.timeOfDay - 0.25) / 0.15;
            gradient.addColorStop(0, this.interpolateColor('#87CEEB', '#5B4B8A', t)); // голубой -> сине-фиолетовый
            gradient.addColorStop(0.3, this.interpolateColor('#87CEEB', '#C44569', t)); // -> красно-розовый
            gradient.addColorStop(0.6, this.interpolateColor('#E0F6FF', '#FF6B6B', t)); // светлый -> коралловый
            gradient.addColorStop(0.85, this.interpolateColor('#E0F6FF', '#FFB347', t)); // -> оранжевый
            gradient.addColorStop(1, this.interpolateColor('#E0F6FF', '#FFD700', t)); // -> золотой
        } else if (this.timeOfDay < 0.6) {
            // Dusk - плавный переход к ночи (0.4 - 0.6)
            const t = (this.timeOfDay - 0.4) / 0.2;
            gradient.addColorStop(0, this.interpolateColor('#5B4B8A', '#1a1a3e', t)); // сине-фиолетовый -> тёмно-синий
            gradient.addColorStop(0.5, this.interpolateColor('#FF6B6B', '#2e3a59', t)); // коралловый -> серо-синий
            gradient.addColorStop(1, this.interpolateColor('#FFD700', '#1a1a2e', t)); // золотой -> почти чёрный
        } else if (this.timeOfDay < 0.85) {
            // Night (0.6 - 0.85)
            gradient.addColorStop(0, '#191970');
            gradient.addColorStop(1, '#000033');
        } else {
            // Dawn - плавный рассвет (0.85 - 1.0)
            const t = (this.timeOfDay - 0.85) / 0.15;
            gradient.addColorStop(0, this.interpolateColor('#191970', '#87CEEB', t)); // тёмно-синий -> голубой
            gradient.addColorStop(1, this.interpolateColor('#000033', '#E0F6FF', t)); // чёрно-синий -> светлый
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw stars at night with smooth fade in/out
        let starAlpha = 0;
        if (this.timeOfDay >= 0.5 && this.timeOfDay <= 0.65) {
            // Fade in stars (0.5 - 0.65)
            starAlpha = (this.timeOfDay - 0.5) / 0.15;
        } else if (this.timeOfDay > 0.65 && this.timeOfDay < 0.9) {
            // Full stars (0.65 - 0.9)
            starAlpha = 1.0;
        } else if (this.timeOfDay >= 0.9) {
            // Fade out stars (0.9 - 1.0)
            starAlpha = 1.0 - (this.timeOfDay - 0.9) / 0.1;
        }
        
        if (starAlpha > 0) {
            for (let i = 0; i < 50; i++) {
                const x = (i * 47) % this.width;
                const y = (i * 73) % (this.height * 0.5);
                const twinkle = Math.sin(Date.now() * 0.003 + i) * 0.5 + 0.5;
                this.ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * starAlpha * twinkle})`;
                this.ctx.fillRect(x, y, 2, 2);
            }
        }
        this.ctx.globalAlpha = 1;
    }
    
    interpolateColor(color1, color2, t) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);
        const r = Math.round(c1.r + (c2.r - c1.r) * t);
        const g = Math.round(c1.g + (c2.g - c1.g) * t);
        const b = Math.round(c1.b + (c2.b - c1.b) * t);
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    drawClouds(drawBackground = true) {
        if (this.cloudSpritesLoaded < 20) {
            // Пока большинство облаков (75% из 27) не загрузились, не рисуем
            return;
        }
        
        // Рисуем облака в зависимости от режима:
        // drawBackground = true: рисуем только фоновые облака (background: true)
        // drawBackground = false: рисуем только передние облака (background: false)
        this.clouds.forEach(cloud => {
            // Фильтруем облака по слою
            if (cloud.background !== drawBackground) {
                return; // Пропускаем облака другого слоя
            }
            
            this.ctx.save();
            
            // Устанавливаем прозрачность в зависимости от слоя
            this.ctx.globalAlpha = cloud.alpha;
            
            // Отключаем сглаживание для четких пикселей
            this.ctx.imageSmoothingEnabled = false;
            
            // Рисуем спрайт облака С ОРИГИНАЛЬНЫМ РАЗМЕРОМ (только масштаб)
            const sprite = this.cloudSprites[cloud.type];
            if (sprite && sprite.complete) {
                const width = sprite.naturalWidth * cloud.scale;
                const height = sprite.naturalHeight * cloud.scale;
                
                // Округляем координаты для плавности движения
                const x = Math.round(cloud.x);
                const y = Math.round(cloud.y);
                const w = Math.round(width);
                const h = Math.round(height);
                
                this.ctx.drawImage(
                    sprite,
                    x, y,
                    w, h
                );
            }
            
            this.ctx.restore();
        });
    }
    
    drawDragon() {
        // ВРЕМЕННЫЙ FALLBACK: рисуем простой квадрат, если спрайт не загружен
        if (!this.dragonSpriteLoaded) {
            this.ctx.save();
            this.ctx.imageSmoothingEnabled = false;
            this.ctx.fillStyle = '#8B4513'; // Коричневый цвет
            this.ctx.fillRect(
                Math.round(this.player.x),
                Math.round(this.player.y),
                Math.round(this.player.width),
                Math.round(this.player.height)
            );
            this.ctx.restore();
            return;
        }
        
        // Используем целочисленный кадр (0-15) без дробной части
        const currentFrame = Math.floor(this.player.animFrame);
        
        // Вычисляем позицию кадра в sprite sheet
        const col = currentFrame % this.spriteSheet.cols;
        const row = Math.floor(currentFrame / this.spriteSheet.cols);
        
        // Координаты на sprite sheet
        const sx = col * this.spriteSheet.frameWidth;
        const sy = row * this.spriteSheet.frameHeight;
        
        // Рисуем кадр из sprite sheet
        this.ctx.save();
        
        // ОТКЛЮЧАЕМ сглаживание для четких пикселей!
        this.ctx.imageSmoothingEnabled = false;
        
        // ПЛАВНОЕ МИГАНИЕ при неуязвимости через прозрачность
        if (this.player.invincible) {
            // Плавное мерцание: alternating между 0.3 и 1.0
            const cycle = Math.floor(this.player.invincibleTime / this.player.blinkInterval) % 2;
            this.ctx.globalAlpha = cycle === 0 ? 0.3 : 1.0;
        } else {
            this.ctx.globalAlpha = 1.0;
        }
        this.ctx.globalCompositeOperation = 'source-over';
        
        // Округляем координаты до целых пикселей для четкости
        const x = Math.round(this.player.x);
        const y = Math.round(this.player.y);
        const width = Math.round(this.player.width);
        const height = Math.round(this.player.height);
        
        this.ctx.drawImage(
            this.dragonSprite,
            sx, sy, // Источник: позиция на sprite sheet
            this.spriteSheet.frameWidth, 
            this.spriteSheet.frameHeight,
            x, 
            y, // Назначение: позиция на canvas (округлённая)
            width, 
            height
        );
        
        this.ctx.restore();
    }
    
    drawEgg(egg) {
        this.ctx.save();
        
        if (this.eggSpriteLoaded) {
            const centerX = egg.x + egg.width / 2;
            const centerY = egg.y + egg.height / 2;
            const time = Date.now() / 1000;
            const px = 3; // УМЕНЬШЕН размер пикселя для лучей (было 4)
            
            const pulse = Math.sin(time * 3) * 0.3 + 0.7; // пульсация 0.4-1.0
            
            // ЛЕГКОЕ СВЕЧЕНИЕ вокруг яйца (УМЕНЬШЕНО и более прозрачное)
            const glowRadius = egg.width * 0.4; // УМЕНЬШЕНО с 0.6
            const gradient = this.ctx.createRadialGradient(
                centerX, centerY, egg.width * 0.2,
                centerX, centerY, glowRadius
            );
            gradient.addColorStop(0, `rgba(255, 215, 0, ${0.25 * pulse})`); // ПРОЗРАЧНЕЕ (было 0.4)
            gradient.addColorStop(0.6, `rgba(255, 215, 0, ${0.12 * pulse})`); // ПРОЗРАЧНЕЕ (было 0.2)
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // ПИКСЕЛЬНЫЕ ЛУЧИ, ИСХОДЯЩИЕ ИЗ ЯЙЦА (8 направлений - УМЕНЬШЕНО с 12)
            const numRays = 8;
            const rayRotation = time * 0.2; // медленное вращение
            
            // Основные лучи (КОРОЧЕ и прозрачнее)
            for (let i = 0; i < numRays; i++) {
                const angle = (i / numRays) * Math.PI * 2 + rayRotation;
                const rayLength = 10; // УМЕНЬШЕНО с 16
                const startDistance = egg.width * 0.45; // начинаем от края яйца
                
                // Рисуем луч как пиксельные блоки
                for (let j = 0; j < rayLength; j++) {
                    const distance = startDistance + j * px * 1.2;
                    const x = centerX + Math.cos(angle) * distance;
                    const y = centerY + Math.sin(angle) * distance;
                    
                    // Затухание луча по длине (БОЛЬШЕ прозрачности)
                    const alpha = (1 - j / rayLength) * 0.5 * pulse; // ПРОЗРАЧНЕЕ (было 0.85)
                    
                    // Размер пикселей уменьшается к концу луча
                    const pixelSize = px * (1 - j / rayLength * 0.4);
                    
                    // Цвет от золотого к оранжевому
                    const colorMix = j / rayLength;
                    const r = 255;
                    const g = Math.floor(215 - colorMix * 80); // 215 -> 135
                    const b = 0;
                    
                    this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                    this.ctx.fillRect(
                        Math.floor(x - pixelSize/2), 
                        Math.floor(y - pixelSize/2), 
                        Math.ceil(pixelSize), 
                        Math.ceil(pixelSize)
                    );
                }
            }
            
            // Короткие лучи между основными (КОРОЧЕ и прозрачнее)
            for (let i = 0; i < numRays; i++) {
                const angle = (i / numRays) * Math.PI * 2 + rayRotation + Math.PI / numRays;
                const rayLength = 5; // УМЕНЬШЕНО с 8
                const startDistance = egg.width * 0.45;
                
                for (let j = 0; j < rayLength; j++) {
                    const distance = startDistance + j * px * 1.4;
                    const x = centerX + Math.cos(angle) * distance;
                    const y = centerY + Math.sin(angle) * distance;
                    const alpha = (1 - j / rayLength) * 0.4 * pulse; // ПРОЗРАЧНЕЕ (было 0.7)
                    const pixelSize = px * 0.7 * (1 - j / rayLength * 0.3);
                    
                    this.ctx.fillStyle = `rgba(255, 200, 0, ${alpha})`;
                    this.ctx.fillRect(
                        Math.floor(x - pixelSize/2), 
                        Math.floor(y - pixelSize/2), 
                        Math.ceil(pixelSize), 
                        Math.ceil(pixelSize)
                    );
                }
            }
            
            // Рисуем яйцо из изображения
            this.ctx.imageSmoothingEnabled = false;
            
            // Округляем координаты для четкости
            const eggX = Math.round(egg.x);
            const eggY = Math.round(egg.y);
            const eggWidth = Math.round(egg.width);
            const eggHeight = Math.round(egg.height);
            
            this.ctx.drawImage(
                this.eggSprite,
                eggX, eggY,
                eggWidth, eggHeight
            );
        } else {
            // Fallback: простое желтое яйцо
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.ellipse(egg.x + egg.width/2, egg.y + egg.height/2, 
                            egg.width/2, egg.height/2, 0, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    drawObstacle(obs) {
        this.ctx.save();
        this.ctx.imageSmoothingEnabled = false; // Отключаем сглаживание для пиксель-арта
        
        // Округляем координаты до целых пикселей для плавного движения
        const x = Math.round(obs.x);
        const y = Math.round(obs.y);
        const width = Math.round(obs.width);
        const height = Math.round(obs.height);
        
        // Проверяем, какой тип камня
        if (obs.type === 'appletree' && this.appleTreeSpriteLoaded) {
            // ЯБЛОНЯ - рисуем спрайт яблони
            this.ctx.drawImage(this.appleTreeSprite, x, y, width, height);
        } else if (obs.type === 'big' && this.rockBigSpritesLoaded > 0) {
            // БОЛЬШОЙ КАМЕНЬ - рисуем спрайт с масштабированием 1.5x (nearest-neighbor)
            const sprite = this.rockBigSprites[obs.rockType];
            if (sprite && sprite.complete) {
                // Рисуем спрайт с масштабированием до obs.width x obs.height (1.5x от оригинала)
                this.ctx.drawImage(sprite, x, y, width, height);
            }
        } else if (obs.type === 'little' && this.rockLittleSpritesLoaded > 0) {
            // МАЛЕНЬКИЙ КАМЕНЬ - рисуем спрайт с масштабированием 1.5x (nearest-neighbor)
            const sprite = this.rockLittleSprites[obs.rockType];
            if (sprite && sprite.complete) {
                // Рисуем спрайт с масштабированием до obs.width x obs.height (1.5x от оригинала)
                this.ctx.drawImage(sprite, x, y, width, height);
            }
        } else {
            // Fallback - простой квадрат если спрайты не загружены
            const px = 4;
            this.ctx.translate(x, y);
            this.ctx.fillStyle = obs.health > 1 ? '#696969' : '#A9A9A9';
            this.ctx.fillRect(px, 0, px * 6, px * 2);
            this.ctx.fillRect(0, px * 2, px * 8, px * 4);
            this.ctx.fillRect(px, px * 6, px * 6, px * 2);
            
            this.ctx.fillStyle = '#4B4B4B';
            this.ctx.fillRect(px * 3, px, px, px * 6);
            this.ctx.fillRect(px * 5, px * 2, px, px * 4);
        }
        
        this.ctx.restore();
    }
    
    drawFireball(fb) {
        const px = 5; // УВЕЛИЧЕННЫЙ pixel size для большого фаербола
        const time = Date.now() / 100; // для анимации
        
        this.ctx.save();
        this.ctx.translate(fb.x, fb.y);
        
        // БОЛЬШОЙ ПИКСЕЛЬ-АРТ ФАЕРБОЛ
        // Структура: внешнее пламя (красное) -> среднее (оранжевое) -> ядро (желтое) + свечение
        
        // Свечение вокруг фаербола (мягкое)
        const glowGradient = this.ctx.createRadialGradient(px * 3, px * 2, px, px * 3, px * 2, px * 7);
        glowGradient.addColorStop(0, 'rgba(255, 140, 0, 0.6)');
        glowGradient.addColorStop(0.5, 'rgba(255, 69, 0, 0.3)');
        glowGradient.addColorStop(1, 'rgba(255, 69, 0, 0)');
        this.ctx.fillStyle = glowGradient;
        this.ctx.fillRect(-px * 2, -px, px * 12, px * 8);
        
        // Хвост пламени (анимированный, волнистый)
        const tailOffset = Math.sin(time * 0.5) * px;
        this.ctx.fillStyle = '#FF4500'; // красно-оранжевый
        this.ctx.fillRect(-px * 3 + tailOffset, px, px, px * 3);
        this.ctx.fillRect(-px * 2 + tailOffset, px * 0.5, px, px * 4);
        this.ctx.fillRect(-px + tailOffset, px * 1.5, px, px * 2);
        
        // Внешнее пламя (красное) — УВЕЛИЧЕНО
        this.ctx.fillStyle = '#FF4500';
        // Верх
        this.ctx.fillRect(px, -px * 1.5, px * 4, px * 1.5);
        this.ctx.fillRect(0, -px * 0.5, px * 6, px);
        // Середина (основное тело)
        this.ctx.fillRect(-px, px * 0.5, px * 8, px * 1.5);
        this.ctx.fillRect(-px * 1.5, px * 2, px * 9, px * 1.5);
        this.ctx.fillRect(-px, px * 3.5, px * 8, px * 1.5);
        // Низ
        this.ctx.fillRect(0, px * 5, px * 6, px);
        this.ctx.fillRect(px, px * 6, px * 4, px);
        
        // Среднее пламя (оранжевое) — УВЕЛИЧЕНО
        this.ctx.fillStyle = '#FF6B00';
        this.ctx.fillRect(px, 0, px * 4, px * 1.5);
        this.ctx.fillRect(0, px * 1.5, px * 6, px * 1.5);
        this.ctx.fillRect(px, px * 3, px * 5, px * 1.5);
        this.ctx.fillRect(px * 1.5, px * 4.5, px * 3, px);
        
        // Внутреннее свечение (желто-оранжевое) — УВЕЛИЧЕНО
        this.ctx.fillStyle = '#FFA500';
        this.ctx.fillRect(px * 1.5, px * 1, px * 3, px * 1.5);
        this.ctx.fillRect(px * 2, px * 2.5, px * 3, px * 1.5);
        this.ctx.fillRect(px * 2.5, px * 4, px * 2, px);
        
        // Яркое ядро (желтое) — УВЕЛИЧЕНО
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(px * 2.5, px * 2, px * 2, px * 2);
        this.ctx.fillRect(px * 3, px * 3.5, px, px);
        
        // Белые точки (самые горячие центры)
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(px * 3.2, px * 2.8, px * 0.6, px * 0.6);
        this.ctx.fillRect(px * 3.5, px * 3.2, px * 0.4, px * 0.4);
        
        // Искры вокруг (анимированные, больше и ярче)
        const sparkles = [
            {x: px * 7, y: px * 0.5, phase: 0, size: 0.8},
            {x: px * 7.5, y: px * 3, phase: Math.PI / 2, size: 0.6},
            {x: px * 7, y: px * 5.5, phase: Math.PI, size: 0.7},
            {x: -px * 2.5, y: px * 1, phase: Math.PI * 1.5, size: 0.5},
            {x: -px * 3, y: px * 4, phase: Math.PI * 0.75, size: 0.6}
        ];
        
        sparkles.forEach(spark => {
            const alpha = (Math.sin(time * 0.3 + spark.phase) + 1) / 2; // 0-1
            if (alpha > 0.3) {
                this.ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
                this.ctx.fillRect(spark.x, spark.y, px * spark.size, px * spark.size);
            }
        });
        
        this.ctx.restore();
    }
    
    drawApple(apple) {
        if (!this.appleSpriteLoaded) return;
        
        this.ctx.save();
        this.ctx.imageSmoothingEnabled = false;
        
        // Рисуем яблоко
        const x = Math.round(apple.x);
        const y = Math.round(apple.y);
        const w = Math.round(apple.width);
        const h = Math.round(apple.height);
        
        this.ctx.drawImage(this.appleSprite, x, y, w, h);
        
        this.ctx.restore();
    }
    
    drawArrow(arrow) {
        if (!this.arrowSpriteLoaded) return;
        
        this.ctx.save();
        this.ctx.imageSmoothingEnabled = false;
        
        // Поворачиваем стрелу в направлении полёта
        this.ctx.translate(arrow.x + arrow.width / 2, arrow.y + arrow.height / 2);
        this.ctx.rotate(arrow.angle);
        
        const w = Math.round(arrow.width);
        const h = Math.round(arrow.height);
        
        this.ctx.drawImage(this.arrowSprite, -w / 2, -h / 2, w, h);
        
        this.ctx.restore();
    }
    
    
    drawParticle(p) {
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.life / 30;
        this.ctx.fillRect(p.x, p.y, 4, 4);
        this.ctx.globalAlpha = 1;
    }
    
    updateUI() {
        // UI теперь рисуется на canvas в drawUI()
        // Эта функция оставлена для совместимости
    }
    
    initSounds() {
        // Инициализация звуков при первом взаимодействии пользователя
        // Это необходимо для разблокировки аудио в браузере
        Object.values(this.sounds).forEach(sound => {
            sound.load(); // Предзагрузка
        });
    }
    
    playSound(soundName) {
        // Мгновенное воспроизведение через ПУЛ ЗВУКОВ (без логирования для максимальной скорости)
        if (soundName !== 'fly' && this.soundPool[soundName]) {
            // Используем пул для одноразовых звуков
            const soundIndex = this.soundPoolIndex[soundName];
            const sound = this.soundPool[soundName][soundIndex];
            sound.currentTime = 0; // Сбрасываем на начало
            sound.play().catch(() => {}); // Без логирования
            
            // Переключаем на следующий звук в пуле
            this.soundPoolIndex[soundName] = (soundIndex + 1) % this.soundPool[soundName].length;
        } else if (soundName === 'fly' && this.sounds[soundName]) {
            // Для звука полёта используем основной объект
            const sound = this.sounds[soundName];
            sound.currentTime = 0;
            sound.play().catch(() => {}); // Без логирования
        }
    }
    
    stopSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].pause();
            this.sounds[soundName].currentTime = 0;
        }
    }
    
    gameOver() {
        this.gameState = 'gameover';
        
        // Проверяем и сохраняем новый рекорд по яйцам
        if (this.eggsCollected > this.bestScore) {
            this.bestScore = this.eggsCollected;
            this.saveBestScore();
            console.log('🎉 НОВЫЙ РЕКОРД!', this.bestScore, 'яиц');
        }
        
        // Показываем рекламу (если пора)
        this.checkAndShowAd();
        
        document.getElementById('gameOver').style.display = 'block';
        // Останавливаем звук полёта
        this.sounds.fly.pause();
        this.sounds.fly.currentTime = 0;
        // Останавливаем звук ветра
        this.windSound.pause();
        this.windSound.currentTime = 0;
    }
    
    gameLoop() {
        // Рассчитываем deltaTime для одинаковой скорости на всех устройствах
        const currentTime = performance.now();
        const elapsed = currentTime - this.lastTime;
        
        // Ограничиваем FPS для оптимизации
        if (elapsed < this.frameTime) {
            requestAnimationFrame(() => this.gameLoop());
            return;
        }
        
        const rawDelta = elapsed / 1000; // в секундах
        this.lastTime = currentTime;
        
        // Нормализуем к 60 FPS (deltaTime = 1 при 60 FPS)
        this.deltaTime = rawDelta * this.targetFPS;
        
        // Ограничиваем deltaTime чтобы избежать скачков при зависаниях
        if (this.deltaTime > 3) this.deltaTime = 3;
        
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    // Методы для паузы игры (используются при показе рекламы)
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gamePausedForAd = true;
            // Останавливаем все звуки
            this.stopSound('fly');
            this.stopSound('music');
            this.stopSound('wind');
            console.log('⏸️ Игра приостановлена');
        }
    }
    
    resumeGame() {
        if (this.gamePausedForAd) {
            this.gamePausedForAd = false;
            // Возобновляем звуки если игра идёт
            if (this.gameState === 'playing') {
                this.playSound('fly');
                this.playSound('music');
                this.playSound('wind');
            }
            console.log('▶️ Игра возобновлена');
        }
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    // УБРАНО ДУБЛИРОВАНИЕ: фоновая музыка теперь запускается только в Game классе
    // (строки 116-120 и 360)
    
    // Скрываем intro screen после анимации (5 секунд)
    setTimeout(() => {
        const introScreen = document.getElementById('introScreen');
        if (introScreen) {
            introScreen.style.display = 'none';
        }
    }, 5000);
    
    new Game();
});
