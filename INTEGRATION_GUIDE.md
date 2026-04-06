# 🔧 Руководство по интеграции новых модулей в game.js

## ✅ Выполнено

1. ✅ Создан `audioManager.js` - Web Audio API менеджер
2. ✅ Создан `levelsManager.js` - Система уровней и достижений  
3. ✅ Создан `sdkManager.js` - SDK менеджер (Яндекс.Игры + VK)
4. ✅ Обновлен `index.html` - подключены SDK и модули
5. ✅ Добавлена защита от выделения/перетаскивания на iOS/Android

## 📝 Требуемые изменения в game.js

### 1. В constructor() добавить инициализацию новых менеджеров:

```javascript
// В начале constructor(), после this.ctx
// Заменить старую систему звуков на Web Audio API
this.audioManager = new AudioManager();
this.levelsManager = new LevelsManager();
this.sdkManager = new SDKManager();

// Удалить старые Audio() объекты (lines 182-246)
// Они будут заменены на audioManager
```

### 2. Заменить метод initSDK():

```javascript
async initSDK() {
    // Используем новый SDK Manager
    await this.sdkManager.init();
    
    // Инициализируем Audio Context (требует взаимодействия пользователя)
    // Будет вызвано при первом клике на кнопку "Играть"
    
    // Загружаем лучший счет
    this.bestScore = await this.sdkManager.loadScore();
    
    console.log(`✅ SDK initialized, best score: ${this.bestScore}`);
}
```

### 3. Добавить инициализацию аудио при старте игры:

```javascript
// В методе, который обрабатывает клик на кнопку "Играть"
// (вероятно в setupControls или startGame)

async startGame() {
    // Инициализируем Audio Context (один раз)
    if (!this.audioManager.audioContext) {
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
    }
    
    // ... остальной код запуска игры
    this.gameState = 'playing';
}
```

### 4. Заменить все вызовы звуков:

**Старый код:**
```javascript
this.playSound('fireball');
// или
this.sounds.fireball.play();
```

**Новый код:**
```javascript
this.audioManager.playSFX('fireball');
```

### 5. Добавить систему уровней в update():

```javascript
update(deltaTime) {
    if (this.gameState !== 'playing') return;
    
    // ... существующий код ...
    
    // Обновляем уровень на основе счета
    const levelData = this.levelsManager.updateLevel(this.eggsCollected);
    if (levelData.levelUp) {
        // Показываем уведомление о повышении уровня
        this.showLevelUpNotification(levelData.level);
        
        // Применяем параметры нового уровня
        this.applyLevelSettings(levelData.level);
    }
    
    // Проверяем достижения
    const newAchievements = this.levelsManager.checkAchievements();
    if (newAchievements.length > 0) {
        newAchievements.forEach(achievement => {
            this.showAchievementNotification(achievement);
        });
    }
}
```

### 6. Применение параметров уровня:

```javascript
applyLevelSettings(levelData) {
    // Применяем скорость препятствий
    this.baseObstacleSpeed = levelData.obstacleSpeed;
    
    // Применяем частоту спавна
    this.obstacleSpawnRate = levelData.spawnRate;
    
    console.log(`⚡ Level ${levelData.level}: ${levelData.name}`);
}
```

### 7. Обновить статистику:

```javascript
// При сборе яйца
collectEgg() {
    this.eggsCollected++;
    this.levelsManager.updateStats('eggsCollected', 1);
    this.audioManager.playSFX('egg');
}

// При выстреле фаерболом
shootFireball() {
    this.levelsManager.updateStats('fireballsFired', 1);
    this.audioManager.playSFX('fireball');
}

// При уничтожении препятствия
destroyObstacle() {
    this.levelsManager.updateStats('obstaclesDestroyed', 1);
    this.audioManager.playSFX('break');
}
```

### 8. Сохранение рекорда:

```javascript
async gameOver() {
    this.gameState = 'gameover';
    this.audioManager.stopBackgroundMusic();
    
    // Обновляем статистику
    this.levelsManager.updateStats('gamesPlayed', 1);
    
    // Сохраняем рекорд
    if (this.eggsCollected > this.bestScore) {
        this.bestScore = this.eggsCollected;
        await this.sdkManager.saveScore(this.bestScore);
        await this.sdkManager.submitScore('best_score', this.bestScore);
    }
    
    // Показываем рекламу каждые 3 игры
    this.gamesPlayedCount++;
    if (this.gamesPlayedCount % this.showAdEvery === 0) {
        await this.sdkManager.showAd('interstitial');
    }
}
```

### 9. Использование переводов:

```javascript
// В методе отрисовки UI
drawUI() {
    // Используем переводы из SDK Manager
    const t = this.sdkManager.t.bind(this.sdkManager);
    
    this.ctx.fillText(t('score') + ': ' + this.eggsCollected, 10, 30);
    this.ctx.fillText(t('best') + ': ' + this.bestScore, 10, 60);
    this.ctx.fillText(t('level') + ': ' + this.levelsManager.currentLevel, 10, 90);
    this.ctx.fillText(t('coins') + ': ' + this.levelsManager.totalCoins, 10, 120);
}
```

### 10. Game Ready API (Яндекс.Игры):

```javascript
// После загрузки всех спрайтов
checkAllSpritesLoaded() {
    if (this.loadedSprites === this.totalSprites) {
        this.allSpritesLoaded = true;
        
        // Отправляем Game Ready в Яндекс.Игры
        this.sdkManager.gameReady();
        
        // Активируем кнопку "Играть"
        document.getElementById('startBtn').disabled = false;
        
        console.log(`✅ Все спрайты загружены: ${this.loadedSprites}/${this.totalSprites}`);
    }
}
```

## 🎨 UI компоненты для уровней и достижений

### Уведомление о повышении уровня:

```javascript
showLevelUpNotification(levelData) {
    // Создаем временное уведомление
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
        animation: fadeInOut 3s ease-in-out;
    `;
    notification.textContent = `🎉 ${levelData.reward.title}`;
    document.body.appendChild(notification);
    
    // Удаляем через 3 секунды
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3000);
}
```

### Уведомление о достижении:

```javascript
showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 215, 0, 0.95);
        color: #000;
        padding: 15px 30px;
        border-radius: 8px;
        font-size: 18px;
        z-index: 1000;
        animation: slideIn 0.5s ease-out;
    `;
    notification.textContent = `${achievement.icon} ${achievement.title} (+${achievement.reward} coins)`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 4000);
}
```

## 🔊 Автоматическая пауза звука

Уже реализовано в `audioManager.js`:
- При смене вкладки
- При сворачивании окна
- При потере фокуса
- При переходе на другую вкладку

## 📱 Адаптивный canvas (без обрезки)

Уже реализовано в `index.html`:
- Использование `viewport-fit=cover`
- Поддержка `safe-area-inset`
- Responsive layout для iOS/Android
- Автомасштабирование canvas

## ✅ Чеклист интеграции

- [ ] Добавить инициализацию менеджеров в constructor
- [ ] Заменить initSDK() на новую версию
- [ ] Добавить async startGame() с инициализацией аудио
- [ ] Заменить все вызовы звуков на audioManager.playSFX()
- [ ] Добавить систему уровней в update()
- [ ] Добавить applyLevelSettings()
- [ ] Обновить collectEgg(), shootFireball(), destroyObstacle()
- [ ] Обновить gameOver() с сохранением рекорда
- [ ] Использовать переводы в drawUI()
- [ ] Добавить gameReady() в checkAllSpritesLoaded()
- [ ] Добавить UI уведомления (levelUp, achievements)
- [ ] Протестировать на desktop/mobile

## 🚀 Быстрый тест

```bash
# Откройте игру в браузере
python3 -m http.server 8000

# Откройте http://localhost:8000
# Проверьте консоль на наличие сообщений:
# ✅ Web Audio API initialized
# ✅ SDK initialized
# ✅ Progress loaded
# ✅ Loaded sounds
```

## 📄 Итоговая структура файлов

```
dragons-fly-standalone/
├── index.html              ✅ Обновлен
├── game.js                 ⚠️ Требует интеграции
├── audioManager.js         ✅ Новый модуль
├── levelsManager.js        ✅ Новый модуль
├── sdkManager.js           ✅ Новый модуль
├── game_backup.js          ✅ Бэкап оригинала
└── [остальные ресурсы]
```

## 💡 Примечания

1. **Web Audio API требует взаимодействия пользователя** - инициализируйте после первого клика
2. **Все звуки загружаются асинхронно** - используйте await
3. **localStorage используется как fallback** для сохранения прогресса
4. **Переводы добавлены** для ru/en/tr языков
5. **Game Ready API** отправляется автоматически после загрузки спрайтов

---

**Следующий шаг**: Интегрируйте изменения в game.js согласно этому руководству
