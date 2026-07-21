const path = require('node:path');
const fs = require('node:fs');
const { execSync } = require('node:child_process');

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('用法: node scripts/build-game.cjs <game-project-dir> [--builtin]');
  console.error('  --builtin  输出到 resources/builtin/ 而非 games/');
  process.exit(1);
}

const gameProjectDir = path.resolve(args[0]);
const isBuiltin = args.includes('--builtin');
const gameJsonPath = path.join(gameProjectDir, 'game.json');

if (!fs.existsSync(gameJsonPath)) {
  console.error(`错误: 在 ${gameProjectDir} 中找不到 game.json`);
  process.exit(1);
}

const gameMeta = JSON.parse(fs.readFileSync(gameJsonPath, 'utf-8'));
const gameId = gameMeta.id || path.basename(gameProjectDir);

const distDir = path.join(gameProjectDir, 'dist');
const gameOutputDir = isBuiltin
  ? path.join(__dirname, '..', 'resources', 'builtin', gameId)
  : path.join(__dirname, '..', 'games', gameId);

console.log(`\n=== 构建游戏: ${gameMeta.name || gameId} ===`);
console.log(`  源目录: ${gameProjectDir}`);
console.log(`  输出目录: ${gameOutputDir}`);

const packageJsonPath = path.join(gameProjectDir, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    if (pkg.scripts && pkg.scripts.build) {
      console.log('  执行 npm run build...');
      execSync('npm run build', { cwd: gameProjectDir, stdio: 'inherit' });
    }
  } catch (e) {
    console.error(`  npm run build 失败: ${e.message}`);
    process.exit(1);
  }
}

if (!fs.existsSync(distDir)) {
  console.error(`  错误: 构建产物目录不存在: ${distDir}`);
  process.exit(1);
}

if (fs.existsSync(gameOutputDir)) {
  fs.rmSync(gameOutputDir, { recursive: true, force: true });
}
fs.mkdirSync(gameOutputDir, { recursive: true });

function copyDir(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('  复制 dist/ 文件...');
copyDir(distDir, gameOutputDir);

console.log('  复制 game.json...');
fs.copyFileSync(gameJsonPath, path.join(gameOutputDir, 'game.json'));

const iconName = gameMeta.icon;
if (iconName) {
  const iconSrc = path.join(gameProjectDir, iconName);
  if (fs.existsSync(iconSrc)) {
    fs.copyFileSync(iconSrc, path.join(gameOutputDir, iconName));
    console.log(`  复制图标: ${iconName}`);
  } else {
    console.log(`  (跳过图标: 未找到 ${iconName})`);
  }
}

console.log(`\n  ✓ 游戏 "${gameMeta.name}" 构建完成`);
console.log(`  输出: ${gameOutputDir}\n`);
