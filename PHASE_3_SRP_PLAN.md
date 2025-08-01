# Phase 3: Single Responsibility Principle (SRP) - План рефакторинга

## 🎯 Цель: Разделить сервисы на классы с единственной ответственностью

## 📊 Текущие нарушения SRP

### 1. PlayerService (ПЕРЕГРУЖЕН)
**Текущие обязанности:**
- ❌ Управление данными игрока
- ❌ Конвертация legacy форматов  
- ❌ Медицинские предметы и исцеление
- ❌ Опыт и повышение уровня
- ❌ Управление оружием и экипировкой
- ❌ Расчет параметров

**Новая архитектура:**
- ✅ **PlayerDataManager** - только данные игрока
- ✅ **HealthManager** - здоровье и медицинские предметы
- ✅ **ExperienceManager** - опыт и уровни
- ✅ **EquipmentManager** - оружие и броня
- ✅ **LegacyPlayerConverter** - конвертация legacy данных

### 2. CombatService (СМЕШАННЫЕ ОБЯЗАННОСТИ)
**Текущие обязанности:**
- ❌ Расчет атак
- ❌ Расчет урона
- ❌ Расчет попаданий
- ❌ Расчет опыта за врагов
- ❌ Управление патронами
- ❌ Генерация сообщений

**Новая архитектура:**
- ✅ **DamageCalculator** - только расчеты урона
- ✅ **HitChanceCalculator** - только расчеты попадания
- ✅ **CriticalHitCalculator** - только критические удары
- ✅ **ExperienceCalculator** - только опыт за врагов
- ✅ **AmmoManager** - только управление патронами
- ✅ **CombatMessageGenerator** - только сообщения
- ✅ **CombatOrchestrator** - координация боя

### 3. AssetLoaderService (ПЕРЕГРУЖЕН)
**Текущие обязанности:**
- ❌ Загрузка ресурсов
- ❌ Progress tracking
- ❌ Кэширование
- ❌ Приоритизация ресурсов
- ❌ Background loading
- ❌ Error handling

**Новая архитектура:**
- ✅ **AssetLoader** - только загрузка ресурсов
- ✅ **AssetCache** - только кэширование
- ✅ **LoadingProgressTracker** - только прогресс
- ✅ **AssetPrioritizer** - только приоритизация
- ✅ **BackgroundLoader** - только фоновая загрузка
- ✅ **AssetErrorHandler** - только обработка ошибок
- ✅ **AssetManager** - координация всех компонентов

### 4. GameStateService (ГОД-ОБЪЕКТ)
**Текущие обязанности:**
- ❌ Управление игроком
- ❌ Сохранение/загрузка
- ❌ Координация сервисов
- ❌ Управление сценами
- ❌ Legacy bridging
- ❌ Encounter data

**Новая архитектура:**
- ✅ **GamePersistenceManager** - только сохранение/загрузка
- ✅ **SceneManager** - только управление сценами
- ✅ **ServiceCoordinator** - только координация сервисов
- ✅ **EncounterDataManager** - только данные столкновений
- ✅ **LegacyGameDataConverter** - только legacy конвертация
- ✅ **GameStateOrchestrator** - минимальная координация

## 🔧 План реализации (пошагово)

### Этап 1: Player System Decomposition
1. **HealthManager** - здоровье и медицинские предметы
2. **ExperienceManager** - опыт и уровни  
3. **EquipmentManager** - оружие и броня
4. **PlayerDataManager** - основные данные
5. **LegacyPlayerConverter** - legacy конвертация

### Этап 2: Combat System Decomposition
1. **DamageCalculator** - расчеты урона
2. **HitChanceCalculator** - расчеты попадания
3. **AmmoManager** - управление патронами
4. **CombatMessageGenerator** - сообщения
5. **CombatOrchestrator** - координация

### Этап 3: Asset System Decomposition
1. **AssetCache** - кэширование
2. **LoadingProgressTracker** - прогресс
3. **AssetLoader** - базовая загрузка
4. **AssetManager** - координация

### Этап 4: Game State Decomposition
1. **GamePersistenceManager** - сохранение/загрузка
2. **SceneManager** - управление сценами
3. **ServiceCoordinator** - координация сервисов
4. **GameStateOrchestrator** - минимальная координация

### Этап 5: Integration & Testing
1. Обновление тестов для новых классов
2. Проверка совместимости с legacy кодом
3. Финальная интеграция и тестирование

## ✅ Критерии успеха
- Каждый класс имеет единственную ответственность
- Тесты проходят
- Приложение работает
- Legacy совместимость сохранена
- Код стал более модульным и поддерживаемым

## 🎯 Принципы SRP при рефакторинге
1. **Один класс = одна причина для изменения**
2. **Высокая связность внутри класса**
3. **Слабая связанность между классами**
4. **Четкие и понятные интерфейсы**
5. **Легкое тестирование каждого компонента**
