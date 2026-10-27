# Lane Guard

Lane Guard is a colorful 2D horizontal co-op lane-battle game built with JavaScript, the HTML Canvas API, Node.js, Express, and Socket.IO. Players summon original units from their base to push back enemies and destroy the opposing lane. It takes broad inspiration from playful lane-battle games while using original characters and artwork. No Roblox or Roblox Studio is required.

## Run locally

1. Install Node.js 20.19+ or 22.12+.
2. In this folder, run `npm install`.
3. Run `npm run dev`.
4. Open the Vite address shown in the terminal (usually `http://localhost:5173`).
5. Open the same address in another browser or private window to join the same match.

The Node server runs on port `3001`; Vite serves the development client on port `5173`. To run a production build, use `npm run build`, then `npm start` and open `http://localhost:3001`.

## Publish a multiplayer link with Render

The GitHub Pages link only hosts the static client and cannot run the multiplayer server. To publish the full game:

1. Sign in to Render and choose **New → Blueprint**.
2. Connect `VuGiaLam2012/Game-project` and select the `main` branch.
3. Render reads `render.yaml`, builds the client, and starts the Node.js server.
4. When deployment finishes, share the `https://<service-name>.onrender.com` URL with your friends.

The deployed client connects to the Socket.IO server on the same origin. Player profiles are written to `data/profiles.json`; on hosts without persistent disks, profiles can be lost when the service restarts or redeploys.

## Play

- The first player is the host. Choose Story Mode, one of nine individual 25-wave Hardcore Acts, Normal, Classic Hardcore, Challenge, or Endless in the lobby.
- Story Mode follows its authored 40-wave enemy schedule. Each Hardcore Act has its own 25-wave schedule and unique final boss. Endless follows Story's first 40 waves, then adds milestone enemies at waves 50, 75, 100, 150, and 200.
- Choose from ten original-themed units in the deployment panel: Street Brawler, Void Adept, Flame Sage, Frost Warden, Spirit Binder, Jackpot Trickster, Sky Hunter, Echo Mimic, Domain Warden, and the expensive Shrine Sovereign.
- Open **Cursed Capsules** for a simple capsule-style collection screen. New profiles start with 5,000 gems and 10 tickets; a single gem pull costs 500, and 11 pulls cost 5,000 gems. The 11th pull guarantees Rare or better if the first ten do not.
- Capsule rates are Common 70%, Rare 20%, Epic 8%, Legendary 1.8%, and Secret 0.2%. Hard pity guarantees a Legendary by pull 100 and a Secret by pull 1,000. Duplicate units grant 25–1,000 gems depending on rarity. Pulls, collection, equipped unit, currency, and pity save to the local server profile.
- Earn gems from enemy defeats and cleared waves; earn a capsule ticket every ten waves. Use the Unit Dex to inspect the collection and equip an unlocked fighter. Units must be unlocked before they can be trained or summoned.
- Units cost cash to summon at your base and march automatically toward the enemy base, stopping to attack enemies in range. Select a unit card and press **Summon**; select a deployed unit to upgrade it or use its special ability.
- Earn persistent XP from enemy defeats and completed waves. Train each unit type from the lobby or deployment panel; each level adds 10% attack and small range/attack-speed bonuses, up to level 10. Training costs `100 × current level^1.5` XP. Your profile is saved by this game server in `data/profiles.json` and is tied to this browser's saved profile ID.
- The in-battle **Upgrade** button still spends match cash to improve one deployed unit; XP training is a separate, persistent upgrade shared by every unit of that type.
- Unit abilities include the Void Adept's Blue, Red, and Purple attacks and the Domain Warden's temporary damage-boosting domain. Other signature effects—critical hits, burn, freeze, spirit swarms, jackpots, hidden/flying targeting, mimicry, and the automatic shrine—are simulated by the server.
- Defeating an ordinary enemy rewards every connected player $15; special enemies and bosses use the bounty in their own enemy definition. Upgrade prices scale by level and are calculated by the server.
- Use Airstrike to target a group of enemies, Freeze to stop all enemies, or Cash boost to double your own bounty for a short time. Each ability has a cooldown and is validated by the server.
- The playfield is a side-view horizontal lane with opposing bases. Unit summoning, movement, combat, cash, and base health are validated or simulated by the server.
- To connect another computer on the same network, open the development server's network URL there and set `VITE_SERVER_URL` to the game server's reachable address, for example `http://192.168.1.20:3001`.
- Tower definitions live in `server/towers/` (one module per tower), enemy stats and traits in `server/enemies/` (one module per enemy), and authored schedules in `server/waves/` (one module per campaign/act). Their `index.js` files build the registries used by the server.
- Server match logic is organized under `server/game/`: shared config and path helpers, player/progression/gacha actions, tower actions, enemy behavior and wave spawning, the simulation tick, and state snapshots. `server/game.js` keeps the public `Game` class and combines these method groups for the server and tests.

This is an early playable prototype. Render deployment is configured, but the service must still be created from the Blueprint; persistent cloud accounts, public matchmaking, and additional maps are not included yet. Local profile IDs are not account credentials and do not support syncing progression between browsers or servers. Capsule pulls use secure server-side randomness, but this prototype's profile ID is browser-generated and is not an authenticated account.
