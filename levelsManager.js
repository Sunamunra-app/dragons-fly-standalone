// Levels & Rewards Manager для Dragon's Fly
class LevelsManager {
    constructor() {
        // Определение уровней сложности
        this.levels = [
            {
                level: 1,
                name: 'Новичок',
                scoreRequired: 0,
                obstacleSpeed: 2.5,
                spawnRate: 1.5,
                reward: { coins: 10, title: '🐉 Юный дракон' }
            },
            {
                level: 2,
                name: 'Опытный',
                scoreRequired: 50,
                obstacleSpeed: 3.0,
                spawnRate: 1.3,
                reward: { coins: 25, title: '🔥 Огненное крыло' }
            },
            {
                level: 3,
                name: 'Мастер',
                scoreRequired: 150,
                obstacleSpeed: 3.5,
                spawnRate: 1.1,
                reward: { coins: 50, title: '⚡ Повелитель бурь' }
            },
            {
                level: 4,
                name: 'Эксперт',
                scoreRequired: 300,
                obstacleSpeed: 4.0,
                spawnRate: 0.9,
                reward: { coins: 100, title: '👑 Королевский дракон' }
            },
            {
                level: 5,
                name: 'Легенда',
                scoreRequired: 500,
                obstacleSpeed: 4.5,
                spawnRate: 0.7,
                reward: { coins: 200, title: '💎 Древний дракон' }
            },
            {
                level: 6,
                name: 'Бог Драконов',
                scoreRequired: 1000,
                obstacleSpeed: 5.0,
                spawnRate: 0.5,
                reward: { coins: 500, title: '🌟 Бессмертный' }
            }
        ];
        
        // Достижения
        this.achievements = {
            'first_egg': { unlocked: false, title: 'Первое яйцо', reward: 5, icon: '🥚' },
            'egg_collector': { unlocked: false, title: 'Коллекционер', reward: 20, icon: '🏆', requirement: 100 },
            'fireball_master': { unlocked: false, title: 'Мастер файерболов', reward: 15, icon: '🔥', requirement: 50 },
            'survivor': { unlocked: false, title: 'Выживальщик', reward: 30, icon: '💪', requirement: 300 },
            'night_rider': { unlocked: false, title: 'Ночной наездник', reward: 25, icon: '🌙', requirement: 100 },
            'speed_demon': { unlocked: false, title: 'Демон скорости', reward: 40, icon: '⚡', requirement: 500 }
        };
        
        // Текущее состояние
        this.currentLevel = 1;
        this.currentScore = 0;
        this.totalCoins = 0;
        this.unlockedTitles = [];
        
        // Статистика
        this.stats = {
            eggsCollected: 0,
            fireballsFired: 0,
            obstaclesDestroyed: 0,
            gamesPlayed: 0,
            totalPlayTime: 0,
            nightTimeScore: 0
        };
        
        // Загрузка прогресса
        this.loadProgress();
    }
    
    // Обновление уровня на основе счета
    updateLevel(score) {
        this.currentScore = score;
        
        // Находим подходящий уровень
        for (let i = this.levels.length - 1; i >= 0; i--) {
            if (score >= this.levels[i].scoreRequired) {
                const newLevel = this.levels[i].level;
                
                // Если повысили уровень
                if (newLevel > this.currentLevel) {
                    this.currentLevel = newLevel;
                    this.unlockLevelReward(this.levels[i]);
                    return { levelUp: true, level: this.levels[i] };
                }
                
                this.currentLevel = newLevel;
                break;
            }
        }
        
        return { levelUp: false, level: this.getCurrentLevelData() };
    }
    
    // Получить данные текущего уровня
    getCurrentLevelData() {
        return this.levels.find(l => l.level === this.currentLevel) || this.levels[0];
    }
    
    // Получить данные следующего уровня
    getNextLevelData() {
        const nextLevel = this.levels.find(l => l.level === this.currentLevel + 1);
        return nextLevel || null;
    }
    
    // Разблокировка награды за уровень
    unlockLevelReward(levelData) {
        this.totalCoins += levelData.reward.coins;
        this.unlockedTitles.push(levelData.reward.title);
        this.saveProgress();
        
        console.log(`🎉 Level UP! ${levelData.name} - ${levelData.reward.coins} coins, ${levelData.reward.title}`);
        
        return levelData.reward;
    }
    
    // Проверка достижений
    checkAchievements() {
        const newlyUnlocked = [];
        
        // Первое яйцо
        if (!this.achievements.first_egg.unlocked && this.stats.eggsCollected > 0) {
            this.unlockAchievement('first_egg');
            newlyUnlocked.push(this.achievements.first_egg);
        }
        
        // Коллекционер яиц
        if (!this.achievements.egg_collector.unlocked && this.stats.eggsCollected >= this.achievements.egg_collector.requirement) {
            this.unlockAchievement('egg_collector');
            newlyUnlocked.push(this.achievements.egg_collector);
        }
        
        // Мастер файерболов
        if (!this.achievements.fireball_master.unlocked && this.stats.fireballsFired >= this.achievements.fireball_master.requirement) {
            this.unlockAchievement('fireball_master');
            newlyUnlocked.push(this.achievements.fireball_master);
        }
        
        // Выживальщик
        if (!this.achievements.survivor.unlocked && this.stats.eggsCollected >= this.achievements.survivor.requirement) {
            this.unlockAchievement('survivor');
            newlyUnlocked.push(this.achievements.survivor);
        }
        
        // Ночной наездник
        if (!this.achievements.night_rider.unlocked && this.stats.nightTimeScore >= this.achievements.night_rider.requirement) {
            this.unlockAchievement('night_rider');
            newlyUnlocked.push(this.achievements.night_rider);
        }
        
        // Демон скорости
        if (!this.achievements.speed_demon.unlocked && this.stats.eggsCollected >= this.achievements.speed_demon.requirement) {
            this.unlockAchievement('speed_demon');
            newlyUnlocked.push(this.achievements.speed_demon);
        }
        
        return newlyUnlocked;
    }
    
    // Разблокировка достижения
    unlockAchievement(key) {
        if (!this.achievements[key]) return;
        
        this.achievements[key].unlocked = true;
        this.totalCoins += this.achievements[key].reward;
        this.saveProgress();
        
        console.log(`🏆 Achievement unlocked: ${this.achievements[key].icon} ${this.achievements[key].title} (+${this.achievements[key].reward} coins)`);
    }
    
    // Обновление статистики
    updateStats(type, value = 1) {
        if (this.stats.hasOwnProperty(type)) {
            this.stats[type] += value;
            this.saveProgress();
        }
    }
    
    // Сохранение прогресса
    saveProgress() {
        const saveData = {
            currentLevel: this.currentLevel,
            totalCoins: this.totalCoins,
            unlockedTitles: this.unlockedTitles,
            achievements: this.achievements,
            stats: this.stats
        };
        
        try {
            localStorage.setItem('dragonsfly_progress', JSON.stringify(saveData));
        } catch (e) {
            console.error('Failed to save progress:', e);
        }
    }
    
    // Загрузка прогресса
    loadProgress() {
        try {
            const saved = localStorage.getItem('dragonsfly_progress');
            if (saved) {
                const data = JSON.parse(saved);
                this.currentLevel = data.currentLevel || 1;
                this.totalCoins = data.totalCoins || 0;
                this.unlockedTitles = data.unlockedTitles || [];
                
                // Загружаем достижения
                if (data.achievements) {
                    Object.keys(data.achievements).forEach(key => {
                        if (this.achievements[key]) {
                            this.achievements[key].unlocked = data.achievements[key].unlocked || false;
                        }
                    });
                }
                
                // Загружаем статистику
                if (data.stats) {
                    this.stats = { ...this.stats, ...data.stats };
                }
                
                console.log('✅ Progress loaded:', data);
            }
        } catch (e) {
            console.error('Failed to load progress:', e);
        }
    }
    
    // Сброс прогресса
    resetProgress() {
        this.currentLevel = 1;
        this.currentScore = 0;
        this.totalCoins = 0;
        this.unlockedTitles = [];
        
        // Сброс достижений
        Object.keys(this.achievements).forEach(key => {
            this.achievements[key].unlocked = false;
        });
        
        // Сброс статистики
        this.stats = {
            eggsCollected: 0,
            fireballsFired: 0,
            obstaclesDestroyed: 0,
            gamesPlayed: 0,
            totalPlayTime: 0,
            nightTimeScore: 0
        };
        
        localStorage.removeItem('dragonsfly_progress');
        console.log('🔄 Progress reset');
    }
}

// Экспорт для использования в game.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LevelsManager;
}
