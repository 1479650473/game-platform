const https = require('node:https');
const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');
const { execSync } = require('node:child_process');

const REGISTRY_URL = 'https://raw.githubusercontent.com/1479650473/game-platform/main/games-registry.json';

let userGamesPath = '';
let userGamesJsonPath = '';
let builtinPath = '';

function initGameUpdater(gamesPath, gamesJsonPath, bp) {
  userGamesPath = gamesPath;
  userGamesJsonPath = gamesJsonPath;
  builtinPath = bp;
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'GamePlatform/1.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return httpGet(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const va = pa[i] || 0;
    const vb = pb[i] || 0;
    if (va > vb) return 1;
    if (va < vb) return -1;
  }
  return 0;
}

async function checkGameUpdates() {
  try {
    const data = await httpGet(REGISTRY_URL);
    const registry = JSON.parse(data.toString('utf-8'));

    if (!registry || !registry.games) {
      return { updates: [], registryUrl: REGISTRY_URL };
    }

    const localGames = {};
    if (fs.existsSync(userGamesJsonPath)) {
      try {
        const local = JSON.parse(fs.readFileSync(userGamesJsonPath, 'utf-8'));
        for (const g of local) {
          const gameDir = path.join(userGamesPath, g.id);
          const gameJsonPath = path.join(gameDir, 'game.json');
          if (fs.existsSync(gameJsonPath)) {
            const meta = JSON.parse(fs.readFileSync(gameJsonPath, 'utf-8'));
            localGames[g.id] = { name: g.name, version: meta.version || g.version || '1.0.0' };
          } else {
            localGames[g.id] = { name: g.name, version: g.version || '1.0.0' };
          }
        }
      } catch (_) { /**/ }
    }

    const updates = [];
    for (const [gameId, info] of Object.entries(registry.games)) {
      const local = localGames[gameId];
      if (local && compareVersions(info.latest, local.version) > 0) {
        updates.push({
          gameId,
          name: info.name || local.name || gameId,
          currentVersion: local.version,
          latestVersion: info.latest,
          changelog: info.changelog || '',
        });
      }
    }

    return { updates, registryUrl: REGISTRY_URL };
  } catch (err) {
    console.error('checkGameUpdates failed:', err.message);
    return { updates: [], registryUrl: REGISTRY_URL };
  }
}

async function updateGame(gameId, notifyCb) {
  try {
    const data = await httpGet(REGISTRY_URL);
    const registry = JSON.parse(data.toString('utf-8'));
    const info = registry.games && registry.games[gameId];

    if (!info || !info.url) {
      return { success: false, error: '未找到游戏更新信息' };
    }

    if (notifyCb) notifyCb({ gameId, phase: 'downloading', progress: 0 });

    // Download zip to temp
    const zipData = await httpGet(info.url);
    if (notifyCb) notifyCb({ gameId, phase: 'extracting', progress: 50 });

    // Save zip to temp and extract
    const tmpDir = path.join(userGamesPath, '.tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const zipPath = path.join(tmpDir, `${gameId}.zip`);
    fs.writeFileSync(zipPath, zipData);

    // Extract using PowerShell (Windows) or unzip (Unix)
    const extractDir = path.join(tmpDir, gameId);
    if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });
    fs.mkdirSync(extractDir, { recursive: true });

    if (process.platform === 'win32') {
      execSync(`Expand-Archive -LiteralPath "${zipPath}" -DestinationPath "${extractDir}" -Force`, { shell: 'powershell.exe', stdio: 'pipe' });
    } else {
      execSync(`unzip -o "${zipPath}" -d "${extractDir}"`, { stdio: 'pipe' });
    }

    // Find the actual game content (may be nested in a folder)
    let contentDir = extractDir;
    const entries = fs.readdirSync(extractDir, { withFileTypes: true });
    const subDirs = entries.filter((e) => e.isDirectory());
    if (subDirs.length === 1 && entries.filter((e) => e.isFile()).length <= 1) {
      contentDir = path.join(extractDir, subDirs[0].name);
    }

    // Verify it has index.html or game.json
    if (!fs.existsSync(path.join(contentDir, 'index.html')) && !fs.existsSync(path.join(contentDir, 'game.json'))) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      return { success: false, error: '下载的游戏文件无效' };
    }

    if (notifyCb) notifyCb({ gameId, phase: 'installing', progress: 80 });

    // Replace game directory
    const gameDir = path.join(userGamesPath, gameId);
    if (fs.existsSync(gameDir)) {
      fs.rmSync(gameDir, { recursive: true, force: true });
    }
    fs.mkdirSync(gameDir, { recursive: true });
    const contentEntries = fs.readdirSync(contentDir, { withFileTypes: true });
    for (const entry of contentEntries) {
      const srcPath = path.join(contentDir, entry.name);
      const destPath = path.join(gameDir, entry.name);
      if (entry.isDirectory()) {
        fs.cpSync(srcPath, destPath, { recursive: true });
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }

    // Update version in game.json
    const localGameJsonPath = path.join(gameDir, 'game.json');
    if (fs.existsSync(localGameJsonPath)) {
      const gameMeta = JSON.parse(fs.readFileSync(localGameJsonPath, 'utf-8'));
      gameMeta.version = info.latest;
      fs.writeFileSync(localGameJsonPath, JSON.stringify(gameMeta, null, 2), 'utf-8');
    }

    // Clean up temp
    fs.rmSync(tmpDir, { recursive: true, force: true });

    if (notifyCb) notifyCb({ gameId, phase: 'done', progress: 100 });
    return { success: true };
  } catch (err) {
    console.error('updateGame failed:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { initGameUpdater, checkGameUpdates, updateGame };
