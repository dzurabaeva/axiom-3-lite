<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AXIOM 3.0 Lite</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: #0a0a0a;
            color: #00d4ff;
            font-family: 'Courier New', monospace;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
        }

        .reactor {
            width: 120px;
            height: 120px;
            border: 3px solid #00d4ff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 30px 0;
            box-shadow: 0 0 20px #00d4ff, inset 0 0 20px rgba(0, 212, 255, 0.2);
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
        }

        .reactor.listening {
            animation: listen 0.5s infinite alternate;
            border-color: #ff00d4;
            box-shadow: 0 0 30px #ff00d4, inset 0 0 30px rgba(255, 0, 212, 0.3);
        }

        @keyframes listen {
            from { transform: scale(1); }
            to { transform: scale(1.1); }
        }

        .status {
            font-size: 14px;
            margin-bottom: 20px;
            opacity: 0.7;
        }

        .output {
            background: rgba(0, 212, 255, 0.1);
            border: 1px solid #00d4ff;
            border-radius: 10px;
            padding: 20px;
            width: 100%;
            max-width: 400px;
            min-height: 100px;
            margin-bottom: 20px;
            text-align: center;
        }

        .output-text {
            font-size: 18px;
            line-height: 1.5;
        }

        .mic-btn {
            width: 80px;
            height: 80px;
            border: 2px solid #00d4ff;
            border-radius: 50%;
            background: transparent;
            color: #00d4ff;
            font-size: 30px;
            cursor: pointer;
            transition: all 0.3s;
        }

        .mic-btn:hover, .mic-btn.active {
            background: #00d4ff;
            color: #0a0a0a;
            box-shadow: 0 0 30px #00d4ff;
        }

        .hint {
            margin-top: 20px;
            font-size: 12px;
            opacity: 0.5;
            text-align: center;
        }

        .timer-display {
            font-size: 48px;
            font-weight: bold;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="status" id="status">Готов к работе, мисс</div>
    
    <div class="reactor" id="reactor">
        <span style="font-size: 40px;">◉</span>
    </div>
    
    <div class="output" id="output">
        <div class="output-text">Скажите "Аксиом, просыпайся"</div>
    </div>
    
    <button class="mic-btn" id="micBtn" onclick="toggleListening()">🎤</button>
    
    <div class="hint">
        Команды: погода, дата, время, кто тебя создал, как меня зовут, 
        установи таймер, мотивируй, очисти, смени цвет, что надеть, 
        аксиом просыпайся, хорошая работа
    </div>

    <script src="axiom.js"></script>
</body>
</html>
// ==========================================
// AXIOM 3.0 Lite - Стабильная версия
// ==========================================

// Настройки пользователя (сохраняются в памяти)
const userSettings = {
    name: 'мисс',           // Имя пользователя
    creator: 'мисс',        // Кто создал (вы сами пишете код!)
    themeColor: '#00d4ff',  // Текущий цвет темы
    isAwake: true          // Состояние системы
};

// Таймер
let activeTimer = null;
let timerInterval = null;

// Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isListening = false;

// Инициализация распознавания речи
function initSpeechRecognition() {
    if (!SpeechRecognition) {
        updateOutput('Извините, мисс. Ваш браузер не поддерживает голосовое управление.');
        return false;
    }
    
    recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
        isListening = true;
        document.getElementById('reactor').classList.add('listening');
        document.getElementById('micBtn').classList.add('active');
        updateStatus('Слушаю...');
    };
    
    recognition.onend = () => {
        isListening = false;
        document.getElementById('reactor').classList.remove('listening');
        document.getElementById('micBtn').classList.remove('active');
        updateStatus('Готов к работе, ' + userSettings.name);
    };
    
    recognition.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase().trim();
        console.log('Распознано:', command);
        processCommand(command);
    };
    
    recognition.onerror = (event) => {
        console.error('Ошибка распознавания:', event.error);
        updateOutput('Не расслышал, ' + userSettings.name + '. Повторите, пожалуйста.');
        speak('Не расслышал. Повторите, пожалуйста.');
    };
    
    return true;
}

// Переключение прослушивания
function toggleListening() {
    if (!recognition) {
        if (!initSpeechRecognition()) return;
    }
    
    if (isListening) {
        recognition.stop();
    } else {
        recognition.start();
    }
}

// ==========================================
// ОБРАБОТКА КОМАНД
// ==========================================

function processCommand(cmd) {
    // Показываем, что услышали
    updateOutput('Вы сказали: "' + cmd + '"\nОбрабатываю...');
    
    // 1. ПРОСНИСЬ / ПРИВЕТ
    if (cmd.includes('просыпайся') || cmd.includes('привет') || cmd.includes('здравствуй')) {
        userSettings.isAwake = true;
        respond('Добро пожаловать, ' + userSettings.name + '. AXIOM 3.0 активирован. Готов к работе.');
        return;
    }
    
    // Проверка, не спит ли система (кроме команды проснуться)
    if (!userSettings.isAwake && !cmd.includes('работа')) {
        respond('Система в спящем режиме. Скажите "Аксиом, просыпайся".');
        return;
    }
    
    // 2. ПОГОДА
    if (cmd.includes('погода') || cmd.includes('погоду')) {
        // Имитация погоды (в реальном приложении — API)
        const weathers = [
            'Солнечно, -1°C. Рекомендую тёплую куртку.',
            'Облачно, 2°C. Возможен дождь.',
            'Ясно, 0°C. Холодно, но красиво.',
            'Снег, -3°C. Одевайтесь теплее.'
        ];
        const weather = weathers[Math.floor(Math.random() * weathers.length)];
        respond('Прогноз погоды: ' + weather);
        return;
    }
    
    // 3. ДАТА
    if (cmd.includes('дата') || cmd.includes('число') || cmd.includes('сегодня')) {
        const now = new Date();
        const options = { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' };
        const dateStr = now.toLocaleDateString('ru-RU', options);
        respond('Сегодня ' + dateStr + '.');
        return;
    }
    
    // 4. ВРЕМЯ
    if (cmd.includes('время') || cmd.includes('который час') || cmd.includes('час')) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        respond('Текущее время: ' + timeStr + '.');
        return;
    }
    
    // 5. КТО СОЗДАЛ
    if (cmd.includes('создал') || cmd.includes('создатель') || cmd.includes('кто ты')) {
        respond('Меня создала ' + userSettings.creator + '. Я — AXIOM 3.0 Lite, голосовой помощник, написанный на JavaScript.');
        return;
    }
    
    // 6. КАК ЗОВУТ (пользователя)
    if (cmd.includes('меня зовут') || cmd.includes('моё имя') || cmd.includes('кто я')) {
        respond('Вы — ' + userSettings.name + '. Мой создатель и хозяин.');
        return;
    }
    
    // 7. УСТАНОВИ ТАЙМЕР
    if (cmd.includes('таймер') || cmd.includes('напомни через')) {
        setTimerCommand(cmd);
        return;
    }
    
    // 8. МОТИВАЦИЯ
    if (cmd.includes('мотивируй') || cmd.includes('мотивация') || cmd.includes('поддержи')) {
        const quotes = [
            'Вы справитесь, ' + userSettings.name + '. Каждый день — это шанс стать лучше.',
            'Помните: даже маленький шаг вперёд — это прогресс.',
            'Вы уже прошли долгий путь. Не сдавайтесь сейчас.',
            'Трудности закаляют. Вы сильнее, чем думаете.',
            'Код, который вы пишете сегодня, меняет ваше завтра.',
            'Ошибки — это не провал. Это опыт. Продолжайте.',
            'Вы создаёте что-то удивительное. Я верю в вас.'
        ];
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        respond(quote);
        return;
    }
    
    // 9. ОЧИСТИ
    if (cmd.includes('очисти') || cmd.includes('очистить') || cmd.includes('сброс')) {
        clearTimer();
        updateOutput('');
        respond('Экран очищен. Таймер сброшен.');
        return;
    }
    
    // 10. СМЕНИ ЦВЕТ
    if (cmd.includes('цвет') || cmd.includes('тема') || cmd.includes('оформление')) {
        changeColor();
        return;
    }
    
    // 11. ЧТО НАДЕТЬ
    if (cmd.includes('надеть') || cmd.includes('одеться') || cmd.includes('одежда')) {
        const outfits = [
            'Сегодня холодно. Рекомендую: тёплая куртка, шарф, перчатки.',
            'Погода переменчива. Лучше взять куртку и зонт.',
            'Для дома подойдёт уютный свитер. Если выходите — тёплое пальто.',
            'Спортивный костюм подойдёт для прогулки. Не забудьте шапку.'
        ];
        const outfit = outfits[Math.floor(Math.random() * outfits.length)];
        respond(outfit);
        return;
    }
    
    // 12. ХОРОШАЯ РАБОТА (похвала системы)
    if (cmd.includes('хорошая работа') || cmd.includes('молодец') || cmd.includes('спасибо')) {
        respond('Благодарю, ' + userSettings.name + '. Работаю для вас. Всегда готов помочь.');
        return;
    }
    
    // НЕИЗВЕСТНАЯ КОМАНДА
    respond('Извините, ' + userSettings.name + '. Я понял команду "' + cmd + '", но пока не умею это выполнять. Доступные команды: погода, время, дата, таймер, мотивация, цвет, что надеть.');
}

// ==========================================
// ФУНКЦИИ КОМАНД
// ==========================================

// Установка таймера
function setTimerCommand(cmd) {
    // Ищем число в команде
    const match = cmd.match(/(\d+)/);
    if (!match) {
        respond('Укажите время. Например: "установи таймер на 5 минут" или "таймер 30 секунд".');
        return;
    }
    
    const num = parseInt(match[1]);
    let seconds = 0;
    
    if (cmd.includes('минут') || cmd.includes('минуту')) {
        seconds = num * 60;
    } else if (cmd.includes('час')) {
        seconds = num * 3600;
    } else if (cmd.includes('секунд') || cmd.includes('секунду')) {
        seconds = num;
    } else {
        // По умолчанию — минуты
        seconds = num * 60;
    }
    
    if (seconds > 3600) {
        respond('Максимальное время таймера — 1 час.');
        return;
    }
    
    startTimer(seconds);
}

function startTimer(seconds) {
    clearTimer();
    activeTimer = seconds;
    
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    const timeStr = min > 0 ? `${min} мин ${sec} сек` : `${sec} сек`;
    
    respond('Таймер установлен на ' + timeStr + '. Обратный отсчёт пошёл.');
    
    // Показываем таймер на экране
    updateTimerDisplay(seconds);
    
    timerInterval = setInterval(() => {
        seconds--;
        updateTimerDisplay(seconds);
        
        if (seconds <= 0) {
            clearTimer();
            respond('Время вышло! Таймер завершён.');
            // Вибрация, если доступна
            if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 500]);
        }
    }, 1000);
}

function updateTimerDisplay(seconds) {
    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    document.getElementById('output').innerHTML = 
        '<div class="timer-display">' + min + ':' + sec + '</div>' +
        '<div>Таймер активен...</div>';
}

function clearTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    activeTimer = null;
}

// Смена цвета темы
function changeColor() {
    const colors = [
        { name: 'голубой', hex: '#00d4ff' },
        { name: 'розовый', hex: '#ff00d4' },
        { name: 'зелёный', hex: '#00ff88' },
        { name: 'оранжевый', hex: '#ff8800' },
        { name: 'фиолетовый', hex: '#8800ff' },
        { name: 'красный', hex: '#ff0044' }
    ];
    
    // Выбираем случайный, но не текущий
    let newColor;
    do {
        newColor = colors[Math.floor(Math.random() * colors.length)];
    } while (newColor.hex === userSettings.themeColor);
    
    userSettings.themeColor = newColor.hex;
    
    // Применяем CSS переменные
    document.documentElement.style.setProperty('--theme-color', newColor.hex);
    
    // Обновляем стили напрямую
    const style = document.createElement('style');
    style.textContent = `
        .reactor { 
            border-color: ${newColor.hex} !important; 
            box-shadow: 0 0 20px ${newColor.hex}, inset 0 0 20px ${newColor.hex}33 !important;
        }
        .reactor.listening {
            box-shadow: 0 0 30px ${newColor.hex}, inset 0 0 30px ${newColor.hex}44 !important;
        }
        .output { border-color: ${newColor.hex} !important; background: ${newColor.hex}1a !important; }
        .mic-btn { border-color: ${newColor.hex} !important; color: ${newColor.hex} !important; }
        .mic-btn:hover, .mic-btn.active { background: ${newColor.hex} !important; color: #0a0a0a !important; box-shadow: 0 0 30px ${newColor.hex} !important; }
        body { color: ${newColor.hex} !important; }
    `;
    document.head.appendChild(style);
    
    respond('Тема изменена на ' + newColor.name + '.');
}

// ==========================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ==========================================

// Ответ системы (текст + голос)
function respond(text) {
    updateOutput(text);
    speak(text);
}

// Обновление текста на экране
function updateOutput(text) {
    document.getElementById('output').innerHTML = '<div class="output-text">' + text.replace(/\n/g, '<br>') + '</div>';
}

// Обновление статуса
function updateStatus(text) {
    document.getElementById('status').textContent = text;
}

// Синтез речи (браузерный)
function speak(text) {
    // Отменяем предыдущую речь
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    utterance.rate = 0.9;  // Немного медленнее для чёткости
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Пытаемся найти русский голос
    const voices = window.speechSynthesis.getVoices();
    const ruVoice = voices.find(v => v.lang && v.lang.includes('ru'));
    
    if (ruVoice) {
        utterance.voice = ruVoice;
        console.log('Используется голос:', ruVoice.name);
    } else {
        console.log('Русский голос не найден, используется стандартный');
    }
    
    // Обработка ошибок
    utterance.onerror = (event) => {
        console.error('Ошибка TTS:', event.error);
        // Если ошибка — хотя бы текст показываем
    };
    
    window.speechSynthesis.speak(utterance);
}

// Загрузка голосов (нужно для Chrome)
function loadVoices() {
    window.speechSynthesis.getVoices();
}

// Инициализация
window.onload = () => {
    loadVoices();
    initSpeechRecognition();
    
    // Chrome загружает голоса асинхронно
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    // Приветствие при запуске (необязательно)
    setTimeout(() => {
        speak('AXIOM 3.0 Lite готов к работе.');
    }, 1000);
};

// Обработка кнопки назад (не закрывать приложение на Android)
document.addEventListener('backbutton', (e) => {
    e.preventDefault();
    // Можно добавить логику "вы уверены?"
}, false);
