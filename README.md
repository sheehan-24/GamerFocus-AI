# GamerFocus AI

GamerFocus AI is a small, lightweight web app to run focused gaming sessions with a countdown timer, neon gaming-style UI, motivational messages, and an optional loud alarm to prompt you to stop and take a break.

Features
- Enter a game name and time (minutes) for a session
- Start / Pause / Resume / Reset controls
- Visual progress bar showing remaining time
- 5 motivational quotes (random per session) and rotating motivational lines
- Optional 20-second continuous alarm (Long Alarm) with volume slider
- Short fallback beep if long alarm is blocked by the browser
- Keyboard shortcuts: `S` = Start, `P` = Pause/Resume, `R` = Reset

Files
- `index.html` — main page and UI
- `style.css` — styles and responsive layout
- `script.js` — timer logic, audio, quotes, and controls

Quick start (local)
Open your browser to: https://sheehan-24.github.io/GamerFocus-AI/ and use the website.

Usage notes
- To enable the loud alarm, check **Long Alarm (20s)** and set the `Alarm Volume` slider.
- If your browser or environment blocks the long alarm (sandboxed iframes, some hosted environments, or backgrounded tabs), the app will automatically fall back to the short beep.
- To stop a playing alarm immediately, press `Reset`.

Audio & compatibility
- The alarm uses the Web Audio API (oscillators). Playback requires a user gesture (the Start button). Most desktop browsers permit this; some sandboxed or strict environments (for example certain embedded IDE previews or iframes) may block audio.
- Mobile browsers (especially iOS Safari) may suspend audio when the screen locks or the app is backgrounded.

Safety & etiquette
- The long alarm can be loud/annoying by design. Use the `Alarm Volume` slider and the checkbox to control behavior. Use responsibly.

Extending or changing defaults
- To change the default long-alarm volume or whether it is enabled by default, edit `index.html` and `script.js`.

Questions or changes
If you'd like different alarm patterns (pulsing beeps), lower the default volume, change default UI text, or add persistence (saving last settings), tell me which change and I will implement it.

Enjoy focusing — then game on.
