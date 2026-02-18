// Focus Mode for Gamers - script.js
// Vanilla JS implementing start/pause/resume, progress bar, quotes and beep.

// ======= Configuration =======
const quotes = [
  "Focus now, victory later.",
  "Small wins compound — finish this session strong.",
  "Stay sharp. One goal, one session.",
  "Discipline beats motivation — keep going.",
  "Control the time, control the game."
];

const motivations = [
  "Breathe. Center. Focus.",
  "One task. One win.",
  "Eyes on the objective.",
  "Push for progress, not perfection.",
  "You started — finish strong."
];

// ======= Elements =======
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const minutesInput = document.getElementById('minutes');
const gameInput = document.getElementById('gameName');
const timerEl = document.getElementById('timer');
const progressBar = document.getElementById('progressBar');
const quoteEl = document.getElementById('quote');
const motivationEl = document.getElementById('motivation');
const sessionGame = document.getElementById('sessionGame');
const longAlarmCheckbox = document.getElementById('longAlarm');
const alarmVolume = document.getElementById('alarmVolume');

// ======= State =======
let durationSec = 0;
let remainingSec = 0;
let timerInterval = null;
let motivInterval = null;
let isPaused = false;
let longAlarmCtx = null;
let longAlarmTimeout = null;

// ======= Helpers =======
function formatTime(sec){
  const m = Math.floor(sec/60).toString().padStart(2,'0');
  const s = Math.floor(sec%60).toString().padStart(2,'0');
  return `${m}:${s}`;
}

function pickRandom(arr){
  return arr[Math.floor(Math.random()*arr.length)];
}

function updateUI(){
  timerEl.textContent = formatTime(Math.max(0, remainingSec));
  const pct = durationSec ? (remainingSec / durationSec) * 100 : 0;
  progressBar.style.width = `${pct}%`;
}

// ======= Timer Logic =======
function startSession(){
  const mins = parseFloat(minutesInput.value) || 0;
  if(mins <= 0){
    alert('Please enter a time in minutes (>= 1).');
    return;
  }

  // initialize
  durationSec = Math.round(mins * 60);
  remainingSec = durationSec;
  sessionGame.textContent = gameInput.value ? gameInput.value : 'General Session';
  quoteEl.textContent = pickRandom(quotes);
  motivationEl.textContent = pickRandom(motivations);

  // controls
  startBtn.disabled = true;
  pauseBtn.disabled = false; pauseBtn.textContent = 'Pause';
  resetBtn.disabled = false;
  isPaused = false;

  // start intervals
  startTick();
  startMotivationRotator();

  updateUI();
}

function startTick(){
  clearInterval(timerInterval);
  timerInterval = setInterval(()=>{
    if(remainingSec > 0){
      remainingSec -= 1;
      updateUI();
      // subtle change of quote/motivation at marks
      if(remainingSec % 60 === 0 && remainingSec !== 0){
        motivationEl.textContent = pickRandom(motivations);
      }
    } else {
      endSession();
    }
  },1000);
}

function startMotivationRotator(){
  clearInterval(motivInterval);
  motivInterval = setInterval(()=>{
    motivationEl.textContent = pickRandom(motivations);
  },15000);
}

function pauseResume(){
  if(durationSec === 0) { return; }
  if(isPaused){
    // resume
    startTick();
    startMotivationRotator();
    pauseBtn.textContent = 'Pause';
    isPaused = false;
  } else {
    // pause
    clearInterval(timerInterval); timerInterval = null;
    clearInterval(motivInterval); motivInterval = null;
    pauseBtn.textContent = 'Resume';
    isPaused = true;
  }
}

function resetSession(){
  clearInterval(timerInterval); timerInterval = null;
  clearInterval(motivInterval); motivInterval = null;
  // stop any long alarm still playing
  if(longAlarmTimeout || longAlarmCtx){
    try{ if(longAlarmTimeout) clearTimeout(longAlarmTimeout); }catch(e){}
    try{ if(longAlarmCtx) longAlarmCtx.close().catch(()=>{}); }catch(e){}
    longAlarmTimeout = null; longAlarmCtx = null;
  }
  durationSec = 0; remainingSec = 0; isPaused = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true; pauseBtn.textContent = 'Pause';
  resetBtn.disabled = true;
  sessionGame.textContent = '—';
  quoteEl.textContent = 'Get ready to focus.';
  motivationEl.textContent = 'Keep your eyes on the goal.';
  updateUI();
}

function endSession(){
  clearInterval(timerInterval); timerInterval = null;
  clearInterval(motivInterval); motivInterval = null;
  remainingSec = 0; updateUI();
  startBtn.disabled = false; pauseBtn.disabled = true; resetBtn.disabled = false;
  pauseBtn.textContent = 'Pause'; isPaused = false;
  // show alert + alarm: try long alarm if enabled, fall back to short beep on error
  if(longAlarmCheckbox && longAlarmCheckbox.checked){
    playLongAlarm(parseInt(alarmVolume?.value || 80,10)/100, 20).catch(()=>{ try{ beep(); }catch(e){} });
  } else {
    try{ beep(); }catch(e){}
  }
  alert('Session Over. Take a Break.');
}

// ======= Sound (beep) using WebAudio =======
function beep(){
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine'; o.frequency.value = 880; // A5
  g.gain.value = 0.0001;
  o.connect(g); g.connect(ctx.destination);
  const now = ctx.currentTime;
  g.gain.exponentialRampToValueAtTime(0.2, now + 0.02);
  o.start(now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
  o.stop(now + 0.9);
  // close audio context after sound
  setTimeout(()=>ctx.close(), 1100);
}

// Play a continuous alarm tone for `duration` seconds at `volume` (0..1).
// Resolves when finished, rejects on error so caller can fallback to `beep()`.
function playLongAlarm(volume = 0.8, duration = 20){
  return new Promise((resolve, reject) => {
    try{
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      longAlarmCtx = new AudioCtx();
      const o = longAlarmCtx.createOscillator();
      const g = longAlarmCtx.createGain();
      o.type = 'sawtooth';
      o.frequency.value = 440;
      g.gain.value = 0.0001;
      o.connect(g); g.connect(longAlarmCtx.destination);
      const now = longAlarmCtx.currentTime;
      g.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), now + 0.02);
      o.start(now);

      longAlarmTimeout = setTimeout(() => {
        try{
          g.gain.exponentialRampToValueAtTime(0.0001, longAlarmCtx.currentTime + 0.02);
          o.stop(longAlarmCtx.currentTime + 0.05);
        }catch(e){}
        setTimeout(()=>{
          if(longAlarmCtx){ longAlarmCtx.close().catch(()=>{}); longAlarmCtx = null; }
          longAlarmTimeout = null;
          resolve();
        }, 120);
      }, duration * 1000);
    }catch(err){
      if(longAlarmCtx){ try{ longAlarmCtx.close().catch(()=>{}); }catch(e){} longAlarmCtx = null; }
      if(longAlarmTimeout){ clearTimeout(longAlarmTimeout); longAlarmTimeout = null; }
      reject(err);
    }
  });
}

// ======= Wire buttons =======
startBtn.addEventListener('click', startSession);
pauseBtn.addEventListener('click', pauseResume);
resetBtn.addEventListener('click', resetSession);

// initialize UI
resetSession();

// Optional: keyboard shortcuts (S=start, P=pause/resume, R=reset)
document.addEventListener('keydown', (e)=>{
  if(e.key.toLowerCase() === 's') startBtn.click();
  if(e.key.toLowerCase() === 'p' && !pauseBtn.disabled) pauseBtn.click();
  if(e.key.toLowerCase() === 'r' && !resetBtn.disabled) resetBtn.click();
});
