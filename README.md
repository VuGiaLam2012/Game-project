# Lane Guard

Lane Guard is a single-player 2D horizontal lane-battle game built with JavaScript and the HTML Canvas API. Summon original units, push back enemy waves, and defend your base. Progress, collection, and capsule pulls save in your browser. The game runs on GitHub Pages without a multiplayer server. It takes broad inspiration from playful lane-battle games while using original characters and artwork. No Roblox or Roblox Studio is required.

## Run locally

1. Install Node.js 20.19+ or 22.12+.
2. In this folder, run `npm install`.
3. Run `npm run dev`.
4. Open the Vite address shown in the terminal (usually `http://localhost:5173`).
5. Choose a mode and start your solo run.

Vite serves the development client on port `5173`. The browser runs the game simulation locally. To create a production build, use `npm run build`.

## Share the game

The single-player game is published at https://vugialam2012.github.io/Game-project/. Share that link with friends. Each player's progress is saved separately in their own browser and does not sync across devices.

## Play

- Choose Story Mode, one of nine individual 25-wave Hardcore Acts, Normal, Classic Hardcore, Challenge, or Endless in the solo lobby.
- Story Mode follows its authored 40-wave enemy schedule. Each Hardcore Act has its own 25-wave schedule and unique final boss. Endless follows Story's first 40 waves, then adds milestone enemies at waves 50, 75, 100, 150, and 200.
- Choose from ten original-themed units in the deployment panel: Street Brawler, Void Adept, Flame Sage, Frost Warden, Spirit Binder, Jackpot Trickster, Sky Hunter, Echo Mimic, Domain Warden, and the expensive Shrine Sovereign.
- Open **Cursed Capsules** for a simple capsule-style collection screen. New profiles start with 5,000 gems and 10 tickets; a single gem pull costs 500, and 11 pulls cost 5,000 gems. The 11th pull guarantees Rare or better if the first ten do not.
- Capsule rates are Common 70%, Rare 20%, Epic 8%, Legendary 1.8%, and Secret 0.2%. Hard pity guarantees a Legendary by pull 100 and a Secret by pull 1,000. Duplicate units grant 25–1,000 gems depending on rarity. Pulls, collection, equipped unit, currency, and pity save in your browser.
- Earn gems from enemy defeats and cleared waves; earn a capsule ticket every ten waves. Use the Unit Dex to inspect the collection and equip an unlocked fighter. Units must be unlocked before they can be trained or summoned.
- Units cost cash to summon at your base and march automatically toward the enemy base, stopping to attack enemies in range. Select a unit card and press **Summon**; select a deployed unit to upgrade it or use its special ability.
- Earn persistent XP from enemy defeats and completed waves. Train each unit type from the lobby or deployment panel; each level adds 10% attack and small range/attack-speed bonuses, up to level 10. Training costs `100 × current level^1.5` XP. Your profile is saved in this browser.
- The in-battle **Upgrade** button still spends match cash to improve one deployed unit; XP training is a separate, persistent upgrade shared by every unit of that type.
- Unit abilities include the Void Adept's Blue, Red, and Purple attacks and the Domain Warden's temporary damage-boosting domain. Other signature effects—critical hits, burn, freeze, spirit swarms, jackpots, hidden/flying targeting, mimicry, and the automatic shrine—are simulated by the game engine.
- Defeating an ordinary enemy rewards you $15; special enemies and bosses use the bounty in their own enemy definition. Upgrade prices scale by level.
- Use Airstrike to target a group of enemies, Freeze to stop all enemies, or Cash boost to double your bounty for a short time. Each ability has a cooldown.
- The playfield is a side-view horizontal lane with opposing bases. Unit summoning, movement, combat, cash, and base health are simulated locally in your browser.
- Tower definitions live in `server/towers/` (one module per tower), enemy stats and traits in `server/enemies/` (one module per enemy), and authored schedules in `server/waves/` (one module per campaign/act). Their `index.js` files build the registries used by the server.
- Match logic is organized under `server/game/`: shared config and path helpers, player/progression/gacha actions, tower actions, enemy behavior and wave spawning, the simulation tick, and state snapshots. `server/game.js` keeps the reusable `Game` class; `src/singlePlayer.js` runs it locally in the browser.

This is an early playable single-player prototype. Online multiplayer, cloud accounts, and additional maps are not included. Progress is stored locally in the browser and will not sync between browsers or devices.
