// AXIOM 3.0 Lite - JavaScript
const userSettings = { name: 'мисс', creator: 'мисс', themeColor: '#00d4ff', isAwake: true };
let activeTimer = null, timerInterval = null;
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null, isListening = false;

function initSpeechRecognition() {
    if (!SpeechRecognition) { updateOutput('Браузер не поддерживает голосовое управление.'); return false; }
    recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU'; recognition.continuous = false; recognition.interimResults = false;
    recognition.onstart = () => { isListening = true; document.getElementById('reactor').classList.add('listening'); document.getElementById('micBtn').classList.add('active'); updateStatus('Слушаю...'); };
    recognition.onend = () => { isListening = false; document.getElementById('reactor').classList.remove('listening'); document.getElementById('micBtn').classList.remove('active'); updateStatus('Готов, ' + userSettings.name); };
    recognition.onresult = (e) => { const cmd = e.results[0][0].transcript.toLowerCase().trim(); processCommand(cmd); };
    recognition.onerror = () => { updateOutput('Не расслышал, ' + userSettings.name + '. Повторите.'); speak('Не расслышал. Повторите, пожалуйста.'); };
    return true;
}

function toggleListening() {
    if (!recognition) { if (!initSpeechRecognition()) return; }
    isListening ? recognition.stop() : recognition.start();
}

function processCommand(cmd) {
    updateOutput('Вы: "' + cmd + '"\nОбрабатываю...');
    
    if (cmd.includes('просыпайся') || cmd.includes('привет')) { userSettings.isAwake = true; respond('Добро пожаловать, ' + userSettings.name + '. AXIOM 3.0 готов.'); return; }
    if (!userSettings.isAwake && !cmd.includes('работа')) { respond('Скажите "Аксиом, просыпайся".'); return; }
    
    if (cmd.includes('погода')) { const w = ['Солнечно, -1°C. Тёплая куртка нужна.','Облачно, 2°C. Возможен дождь.','Ясно, 0°C. Холодно, но красиво.','Снег, -3°C. Одевайтесь теплее.']; respond('Прогноз: ' + w[Math.floor(Math.random()*w.length)]); return; }
    if (cmd.includes('дата') || cmd.includes('число')) { const d = new Date().toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric',weekday:'long'}); respond('Сегодня ' + d + '.'); return; }
    if (cmd.includes('время') || cmd.includes('который час')) { const t = new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'}); respond('Время: ' + t + '.'); return; }
    if (cmd.includes('создал') || cmd.includes('кто ты')) { respond('Меня создала ' + userSettings.creator + '. Я AXIOM 3.0 Lite, голосовой помощник на JavaScript.'); return; }
    if (cmd.includes('меня зовут') || cmd.includes('кто я')) { respond('Вы — ' + userSettings.name + '. Мой создатель.'); return; }
    if (cmd.includes('таймер')) { setTimerCommand(cmd); return; }
    if (cmd.includes('мотивируй')) { const q = ['Вы справитесь, '+userSettings.name+'. Каждый день — шанс стать лучше.','Даже маленький шаг — это прогресс.','Вы прошли долгий путь. Не сдавайтесь.','Ошибки — это опыт. Продолжайте.','Код, который вы пишете, меняет завтра.']; respond(q[Math.floor(Math.random()*q.length)]); return; }
    if (cmd.includes('очисти')) { clearTimer(); updateOutput(''); respond('Экран очищен. Таймер сброшен.'); return; }
    if (cmd.includes('цвет') || cmd.includes('тема')) { changeColor(); return; }
    if (cmd.includes('надеть') || cmd.includes('одежда')) { const o = ['Сегодня холодно. Тёплая куртка, шарф, перчатки.','Погода переменчива. Куртка и зонт.','Для дома — свитер. На улицу — пальто.','Спортивный костюм и шапка для прогулки.']; respond(o[Math.floor(Math.random()*o.length)]); return; }
    if (cmd.includes('хорошая работа') || cmd.includes('спасибо')) { respond('Благодарю, ' + userSettings.name + '. Работаю для вас.'); return; }
    
    respond('Понял: "'+cmd+'", но пока не умею. Команды: погода, время, дата, таймер, мотивация, цвет, что надеть.');
}

function setTimerCommand(cmd) {
    const m = cmd.match(/(\d+)/);
    if (!m) { respond('Укажите время. Например: "таймер 5 минут".'); return; }
    let s = parseInt(m[1]);
    if (cmd.includes('минут')) s *= 60; else if (cmd.includes('час')) s *= 3600;
    if (s > 3600) { respond('Максимум 1 час.'); return; }
    startTimer(s);
}

function startTimer(seconds) {
    clearTimer(); activeTimer = seconds;
    const ts = seconds > 60 ? Math.floor(seconds/60)+' мин '+(seconds%60)+' сек' : seconds+' сек';
    respond('Таймер на ' + ts + '.');
    updateTimerDisplay(seconds);
    timerInterval = setInterval(() => { seconds--; updateTimerDisplay(seconds); if (seconds <= 0) { clearTimer(); respond('Время вышло!'); if (navigator.vibrate) navigator.vibrate([200,100,200,100,500]); } }, 1000);
}

function updateTimerDisplay(s) {
    const m = Math.floor(s/60).toString().padStart(2,'0'), sec = (s%60).toString().padStart(2,'0');
    document.getElementById('output').innerHTML = '<div class="timer-display">' + m + ':' + sec + '</div><div>Таймер активен...</div>';
}

function clearTimer() { if (timerInterval) { clearInterval(timerInterval); timerInterval = null; } activeTimer = null; }

function changeColor() {
    const c = [{n:'голубой',h:'#00d4ff'},{n:'розовый',h:'#ff00d4'},{n:'зелёный',h:'#00ff88'},{n:'оранжевый',h:'#ff8800'},{n:'фиолетовый',h:'#8800ff'}];
    let nc; do { nc = c[Math.floor(Math.random()*c.length)]; } while (nc.h === userSettings.themeColor);
    userSettings.themeColor = nc.h;
    const st = document.createElement('style');
    st.textContent = '.reactor{border-color:'+nc.h+'!important;box-shadow:0 0 20px '+nc.h+',inset 0 0 20px '+nc.h+'33!important}.reactor.listening{box-shadow:0 0 30px '+nc.h+',inset 0 0 30px '+nc.h+'44!important}.output{border-color:'+nc.h+'!important;background:'+nc.h+'1a!important}.mic-btn{border-color:'+nc.h+'!important;color:'+nc.h+'!important}.mic-btn:hover,.mic-btn.active{background:'+nc.h+'!important;color:#0a0a0a!important;box-shadow:0 0 30px '+nc.h+'!important}body{color:'+nc.h+'!important}';
    document.head.appendChild(st);
    respond('Тема: ' + nc.n + '.');
}

function respond(t) { updateOutput(t); speak(t); }
function updateOutput(t) { document.getElementById('output').innerHTML = '<div class="output-text">' + t.replace(/\n/g,'<br>') + '</div>'; }
function updateStatus(t) { document.getElementById('status').textContent = t; }

function speak(text) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ru-RU'; u.rate = 0.9; u.pitch = 1; u.volume = 1;
    const v = window.speechSynthesis.getVoices().find(v => v.lang && v.lang.includes('ru'));
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
}

window.onload = () => { window.speechSynthesis.getVoices(); initSpeechRecognition(); if (window.speechSynthesis.onvoiceschanged !== undefined) window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices(); setTimeout(() => speak('AXIOM 3.0 Lite готов.'), 1000); };
document.addEventListener('backbutton', (e) => { e.preventDefault(); }, false);
