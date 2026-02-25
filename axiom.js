// AXIOM 3.0 - Iron Man Edition
const userSettings = { name: 'мисс', creator: 'мисс', isAwake: true };
let activeTimer = null, timerInterval = null;
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null, isListening = false;

function initSpeechRecognition() {
    if (!SpeechRecognition) { updateOutput('ГОЛОСОВОЙ ДВИЖОК НЕДОСТУПЕН'); return false; }
    recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU'; recognition.continuous = false; recognition.interimResults = false;
    recognition.onstart = () => { isListening = true; document.getElementById('reactor').classList.add('listening'); document.getElementById('micBtn').classList.add('active'); updateStatus('СЛУШАЮ...'); };
    recognition.onend = () => { isListening = false; document.getElementById('reactor').classList.remove('listening'); document.getElementById('micBtn').classList.remove('active'); updateStatus('СИСТЕМА АКТИВНА • МИСС'); };
    recognition.onresult = (e) => { const cmd = e.results[0][0].transcript.toLowerCase().trim(); processCommand(cmd); };
    recognition.onerror = (e) => { console.log('Ошибка:', e.error); updateOutput('НЕ РАССЛЫШАЛ\nПОВТОРИТЕ КОМАНДУ'); speak('Не расслышал. Повторите.'); };
    return true;
}

function toggleListening() {
    if (!recognition) { if (!initSpeechRecognition()) return; }
    isListening ? recognition.stop() : recognition.start();
}

function processCommand(cmd) {
    updateOutput('РАСПОЗНАНО: ' + cmd.toUpperCase());
    
    if (cmd.includes('проснись') || cmd.includes('привет')) { userSettings.isAwake = true; respond('ДОБРО ПОЖАЛОВАТЬ, МИСС. AXIOM 3.0 АКТИВЕН.'); return; }
    if (!userSettings.isAwake) { respond('СИСТЕМА В СНЕ. СКАЖИТЕ "ПРОСНИСЬ".'); return; }
    
    if (cmd.includes('погода')) { const w = ['СОЛНЕЧНО, -1°C','ОБЛАЧНО, 2°C','ЯСНО, 0°C','СНЕГ, -3°C']; respond('ПРОГНОЗ: ' + w[Math.floor(Math.random()*w.length)] + '. РЕКОМЕНДУЮ ТЁПЛУЮ КУРТКУ.'); return; }
    if (cmd.includes('дата')) { const d = new Date().toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric',weekday:'long'}); respond(d.toUpperCase()); return; }
    if (cmd.includes('время') || cmd.includes('час')) { const t = new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'}); respond('ТЕКУЩЕЕ ВРЕМЯ: ' + t); return; }
    if (cmd.includes('создал') || cmd.includes('кто ты')) { respond('Я AXIOM 3.0. СОЗДАН МИСС ДЛЯ УПРАВЛЕНИЯ СИСТЕМАМИ.'); return; }
    if (cmd.includes('меня зовут') || cmd.includes('кто я')) { respond('ВЫ — ' + userSettings.name + '. МОЙ СОЗДАТЕЛЬ.'); return; }
    if (cmd.includes('таймер')) { setTimerCommand(cmd); return; }
    if (cmd.includes('мотивируй')) { const q = ['ВЫ СПРАВИТЕСЬ, МИСС.','КАЖДЫЙ ШАГ — ПРОГРЕСС.','ВЫ СИЛЬНЕЕ, ЧЕМ ДУМАЕТЕ.','ОШИБКИ — ЭТО ОПЫТ. ПРОДОЛЖАЙТЕ.']; respond(q[Math.floor(Math.random()*q.length)]); return; }
    if (cmd.includes('очисти')) { clearTimer(); updateOutput(''); respond('ЭКРАН ОЧИЩЕН. ТАЙМЕР СБРОШЕН.'); return; }
    if (cmd.includes('цвет') || cmd.includes('тема') || cmd.includes('золото')) { respond('НАЖМИТЕ КНОПКУ ЦВЕТА НИЖЕ. ДОСТУПНЫ: ЗОЛОТО, ГОЛУБОЙ, КРАСНЫЙ.'); return; }
    if (cmd.includes('надеть')) { const o = ['ТЁПЛАЯ КУРТКА, ШАРФ.','КУРТКА И ЗОНТ.','СВИТЕР ДЛЯ ДОМА.']; respond(o[Math.floor(Math.random()*o.length)]); return; }
    if (cmd.includes('работа') || cmd.includes('спасибо')) { respond('ВСЕГДА К ВАШИМ УСЛУГАМ,  МИСС.'); return; }
    
    respond('КОМАНДА НЕ РАСПОЗНАНА. ДОСТУПНЫ: ПОГОДА, ВРЕМЯ, ДАТА, ТАЙМЕР, МОТИВАЦИЯ.');
}

function setTimerCommand(cmd) {
    const m = cmd.match(/(\d+)/);
    if (!m) { respond('УКАЖИТЕ ВРЕМЯ. НАПРИМЕР: "ТАЙМЕР 5 МИНУТ"'); return; }
    let s = parseInt(m[1]);
    if (cmd.includes('минут')) s *= 60;
    else if (cmd.includes('час')) s *= 3600;
    if (s > 3600) { respond('МАКСИМУМ 1 ЧАС.'); return; }
    startTimer(s);
}

function startTimer(seconds) {
    clearTimer(); activeTimer = seconds;
    const ts = seconds > 60 ? Math.floor(seconds/60)+' МИН '+(seconds%60)+' СЕК' : seconds+' СЕК';
    respond('ТАЙМЕР УСТАНОВЛЕН: ' + ts);
    updateTimerDisplay(seconds);
    timerInterval = setInterval(() => { seconds--; updateTimerDisplay(seconds); if (seconds <= 0) { clearTimer(); respond('ВРЕМЯ ВЫШЛО!'); if (navigator.vibrate) navigator.vibrate([200,100,200,500]); } }, 1000);
}

function updateTimerDisplay(s) {
    const m = Math.floor(s/60).toString().padStart(2,'0'), sec = (s%60).toString().padStart(2,'0');
    document.getElementById('output').innerHTML = '<div class="timer-display">' + m + ':' + sec + '</div><div>ТАЙМЕР АКТИВЕН</div>';
}

function clearTimer() { if (timerInterval) { clearInterval(timerInterval); timerInterval = null; } activeTimer = null; }

function respond(t) { updateOutput(t); speak(t); }
function updateOutput(t) { document.getElementById('output').innerHTML = '<div class="output-text">' + t.replace(/\n/g,'<br>') + '</div>'; }
function updateStatus(t) { document.getElementById('status').textContent = t; }

function speak(text) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ru-RU'; u.rate = 0.85; u.pitch = 0.9; u.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const ruVoice = voices.find(v => v.lang && v.lang.includes('ru'));
    if (ruVoice) u.voice = ruVoice;
    window.speechSynthesis.speak(u);
}

window.onload = () => {
    window.speechSynthesis.getVoices();
    initSpeechRecognition();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
    setTimeout(() => speak('AXIOM 3.0 АКТИВЕН. ДОБРО ПОЖАЛОВАТЬ, МИСС.'), 800);
};
