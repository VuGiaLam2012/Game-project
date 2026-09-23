Mini Tower Defense

A playable browser-based tower defense prototype with multiple tower types, wave progression, map selection, unlocks, and persistent save progress.

Open `index.html` in a browser, or run a local server from the folder:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

Files:
- `index.html` — game UI shell
- `style.css` — interface styling and game layout
- `main.js` — gameplay loop, enemy waves, tower placement, progression, and save logic
- `units/` — tower definitions and abilities
- `enemies/` — enemy types and AI behavior

Current gameplay loop includes:
- wave-based spawning with mixed enemy patterns
- map and mode selection
- tower unlock + loadout progression
- XP, level rewards, and save persistence