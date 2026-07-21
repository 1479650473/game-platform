# 游戏开发指南

该指南告诉你如何开发一个游戏并集成到 GamePlatform 中运行。

## 目录

- [平台加载原理](#平台加载原理)
- [最小可运行示例](#最小可运行示例)
- [用 React + Vite 开发](#用-react--vite-开发)
- [用 Vue + Vite 开发](#用-vue--vite-开发)
- [统一设计规范](#统一设计规范)
- [game.json 字段详解](#gamejson-字段详解)
- [游戏窗口 API](#游戏窗口-api)
- [本地测试](#本地测试)
- [将游戏集成到平台](#将游戏集成到平台)
- [提交游戏到官方仓库](#提交游戏到官方仓库)
- [常见错误](#常见错误)

---

## 平台加载原理

平台双击游戏卡片后，主进程：

1. 创建一个独立的 `BrowserWindow`（游戏窗口）
2. 通过 `win.loadFile('games/<游戏ID>/index.html')` 加载你的 `index.html`
3. 注入 `game-preload.cjs` 预加载脚本，暴露 API 给游戏窗口

**重要**：游戏窗口加载的是本地文件系统路径，`<script src="/assets/xxx.js">`（以 `/` 开头）会加载失败。**所有资源引用必须使用相对路径**，即 `./assets/xxx.js`。

```
games/sudoku/
├── index.html        ← 入口文件，win.loadFile() 加载这个
├── assets/           ← 包含所有 JS/CSS/图片
│   ├── index-xxx.js
│   └── index-xxx.css
├── game.json         ← 游戏元数据（必须）
└── icon.png          ← 图标（可选）
```

---

## 最小可运行示例

不需要任何构建工具，三个文件就能运行：

**game.json**
```json
{
  "id": "hello-game",
  "name": "你好游戏",
  "description": "一个最小示例",
  "version": "1.0.0",
  "author": "你的名字",
  "width": 400,
  "height": 300
}
```

**icon.png** — 任意 256×256 的 PNG 图片

**index.html**
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      margin: 0;
      background: #1a1a2e;
      color: #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: sans-serif;
    }
    h1 { font-size: 2rem; }
  </style>
</head>
<body>
  <h1>你好，游戏平台！</h1>
  <script>
    console.log('游戏已加载');
  </script>
</body>
</html>
```

将这三个文件放入 `<项目根目录>/games/hello-game/`，启动平台即可看到。

---

## 用 React + Vite 开发

### 1. 创建项目

```powershell
npm create vite@latest my-game -- --template react-ts
cd my-game
npm install
```

### 2. 关键配置

**`vite.config.ts`** — 必须设置 `base: './'`，确保构建产物使用相对路径：

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',  // 关键！否则 index.html 中的资源路径会以 / 开头
});
```

### 3. 窗口尺寸考虑

游戏窗口由平台的 `game.json` 指定尺寸。React 组件根元素建议：

```css
/* src/index.css */
html, body, #root {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100vh;
  overflow: auto;
}
```

### 4. 创建 game.json

```json
{
  "id": "my-game",
  "name": "我的游戏",
  "description": "游戏简介",
  "version": "1.0.0",
  "author": "你的名字",
  "width": 800,
  "height": 600,
  "minWidth": 400,
  "minHeight": 300,
  "resizable": true
}
```

### 5. 构建

```powershell
npm run build
# 生成 dist/ 目录，包含 index.html 和 assets/
```

### 6. 检查构建产物

打开 `dist/index.html`，确认资源引用都是相对路径：

```html
<!-- 正确 -->
<script src="./assets/index-xxx.js"></script>
<link rel="stylesheet" href="./assets/index-xxx.css">

<!-- 错误（会导致白屏） -->
<script src="/assets/index-xxx.js"></script>
```

---

## 用 Vue + Vite 开发

步骤与 React 基本一致：

```powershell
npm create vite@latest my-vue-game -- --template vue-ts
cd my-vue-game
npm install
```

`vite.config.ts` 同样需要设置 `base: './'`：

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  base: './',
});
```

---

## 统一设计规范

所有接入 GamePlatform 的游戏都必须遵循以下统一设计规范，确保视觉风格一致性。

### 全局 CSS 变量

在每个游戏的 `src/index.css` 中定义以下变量：

```css
:root {
  --bg-deep: #09090d;
  --bg-card: rgba(14, 14, 26, 0.55);
  --accent: #2dd4bf;
  --accent-glow: rgba(45, 212, 191, 0.12);
  --accent-border: rgba(45, 212, 191, 0.25);
  --text-heading: #e4e4e7;
  --text-body: #a1a1aa;
  --text-muted: #52525b;
  --border-subtle: rgba(255, 255, 255, 0.06);
  --ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
  --radius-card: 16px;
}
```

### 字体

在 `index.html` `<head>` 中必须添加 Google Fonts 链接：

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
```

**字体用法**：

| 用途 | 字体 | 示例 |
|------|------|------|
| UI 文字、标题 | `'Outfit', sans-serif` | 标题、按钮、标签 |
| 数字、得分、计时 | `'JetBrains Mono', monospace` | 分数、计时器、计数器 |

**严禁使用**：`Inter`、`Arial`、系统默认字体栈。禁止 Emoji 作为图标。

### 色彩

| 色值 | 用途 | 说明 |
|------|------|------|
| `#09090d` | 页面背景 | 非纯黑，禁止 `#000000` |
| `rgba(14, 14, 26, 0.55)` | 卡片/面板背景 | Liquid Glass 半透明 |
| `#2dd4bf` | 主强调色 | Teal 青绿，统一平台 accent |
| `#e4e4e7` | 标题文字 | 白色偏移，避免纯白 |
| `#a1a1aa` | 正文文字 | 中灰度 |
| `#52525b` | 辅助文字 | 低对比度 |
| `rgba(255, 255, 255, 0.06)` | 边框 | 微妙边框 |
| `rgba(45, 212, 191, 0.25)` | accent 边框 | 重点组件边框 |

**严禁使用**：
- 紫色/蓝色渐变（如 `#8b5cf6` → `#7c3aed`）
- 霓虹发光阴影（如 `box-shadow: 0 0 30px purple`）
- 纯黑色文字或背景
- 灰色文字放在有色背景上

### Liquid Glass 卡片

```css
.card {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-subtle);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 2px 16px rgba(0, 0, 0, 0.3);
  border-radius: var(--radius-card);
  transition: all 0.35s var(--ease-spring);
}
```

关键：`inset 0 1px 0` 内层高光线 + 外层投影，区别于普通毛玻璃。

### 弹性动效

所有 UI 过渡和动画使用 `cubic-bezier(0.16, 1, 0.3, 1)`：

```css
transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
```

**禁止使用**：`ease` / `ease-in-out` / `linear` 过渡，bounce/elastic 关键帧。

### 按钮规范

```css
.btn {
  background: var(--accent);
  color: #09090d;
  border: none;
  border-radius: 10px;
  padding: 10px 24px;
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s var(--ease-spring);
}

.btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

.btn:active {
  transform: scale(0.98);
}
```

### 不使用 framer-motion

为了保持依赖简洁和 Electron 窗口性能，所有动效用纯 CSS 实现。不安装 `framer-motion`。

### 参考示例

查看四个内置游戏的源码作为参考：

- `resources/builtin/tetris/` — 俄罗斯方块
- `resources/builtin/minesweeper/` — 扫雷
- `resources/builtin/sudoku/` — 数独
- `resources/builtin/snake/` — 贪吃蛇

---

## game.json 字段详解

```json
{
  "id": "game-id",
  "name": "游戏名称",
  "description": "一句话描述游戏",
  "version": "1.0.0",
  "author": "作者名",
  "entry": "index.html",
  "icon": "icon.png",
  "width": 800,
  "height": 600,
  "minWidth": 400,
  "minHeight": 300,
  "resizable": true
}
```

| 字段 | 必填 | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| `id` | 是 | string | - | 游戏唯一标识，用于文件夹命名 |
| `name` | 是 | string | - | 在平台卡片上显示的名称 |
| `description` | 否 | string | `""` | 卡片上的简介文字 |
| `version` | 是 | string | - | semver 格式，用于更新检测 |
| `author` | 否 | string | `""` | 作者署名 |
| `entry` | 否 | string | `"index.html"` | 入口 HTML 文件名 |
| `icon` | 否 | string | `""` | 图标文件名（png/jpg/svg/ico） |
| `width` | 否 | number | 800 | 游戏窗口宽度（像素） |
| `height` | 否 | number | 600 | 游戏窗口高度（像素） |
| `minWidth` | 否 | number | 800 | 最小窗口宽度 |
| `minHeight` | 否 | number | 600 | 最小窗口高度 |
| `resizable` | 否 | boolean | true | 是否允许用户调整窗口大小 |

---

## 游戏窗口 API

平台通过 `game-preload.cjs` 向游戏窗口注入以下全局对象。这些 API **仅在平台内运行时可用**，开发时用浏览器访问 `http://localhost:5173` 时它们不存在。

### `window.gamePlatformAPI`

```typescript
// 关闭当前游戏窗口
window.gamePlatformAPI.closeGame();  // 返回 Promise<void>
```

使用示例：

```typescript
// React 中关闭游戏按钮
<button onClick={() => window.gamePlatformAPI?.closeGame()}>
  退出游戏
</button>
```

### `window.electronAPI`

```typescript
// 获取当前游戏的版本号（从 game.json 读取）
const version = await window.electronAPI.getVersion();  // 返回 Promise<string>
```

### 安全使用（开发兼容）

开发时在浏览器中调试（localhost），这些 API 不存在。建议做存在性检查：

```typescript
const closeGame = () => {
  if (window.gamePlatformAPI) {
    window.gamePlatformAPI.closeGame();
  } else {
    // 浏览器开发模式：关闭标签页提示
    alert('请在本平台中运行此游戏');
  }
};
```

---

## 本地测试

### 方式一：复制到 games 目录

1. 构建游戏：`npm run build`
2. 复制 `dist/` 内容 + `game.json` + `icon.png` 到 `<platform>/games/<game-id>/`
3. 启动平台：`npm run electron:dev`

### 方式二：用构建脚本

```powershell
# 在 platform 项目根目录下
node scripts/build-game.cjs ../my-game

# 如果要作为内置游戏（放在 resources/builtin/）
node scripts/build-game.cjs ../my-game --builtin
```

构建脚本流程：`npm run build` → 复制 `dist/` + `game.json` + `icon.png` → 目标位置

### 方式三：平台内 + 号添加

1. 构建游戏后，将整个游戏文件夹（含 `dist/` 内容、`game.json`、`icon.png`）复制到某个位置
2. 启动平台，点击 + 号
3. 选择游戏文件夹，平台自动识别 `game.json` 并导入

### 快速测试目录结构

确保最终目录结构如下（注意 `assets/` 与 `index.html` 同级）：

```
游戏文件夹/
├── index.html        ← 构建产物
├── assets/           ← 构建产物中的 JS/CSS
│   ├── index-xxx.js
│   └── index-xxx.css
├── game.json
└── icon.png
```

> **常见坑**：如果构建产物嵌套了（比如 `dist/index.html` 引用 `..\assets\`），会导致白屏。确保 `assets/` 和 `index.html` 在同一层级。

---

## 将游戏集成到平台

### 内置游戏（随平台安装包分发）

将游戏放入 `resources/builtin/<game-id>/`：

```
game-platform/
└── resources/
    └── builtin/
        └── my-game/
            ├── index.html
            ├── assets/
            ├── game.json
            └── icon.png
```

然后在 `games-registry.json` 中注册（可选，用于远程更新）：

```json
{
  "games": {
    "my-game": {
      "name": "我的游戏",
      "latest": "1.0.0",
      "url": "https://github.com/.../releases/download/v1.0.0/my-game.zip",
      "changelog": "初始版本"
    }
  }
}
```

### 独立分发（用户手动导入）

1. 将游戏文件夹打包为 zip
2. 用户下载后解压
3. 在平台中点击 + 号选择解压后的文件夹

---

## 提交游戏到官方仓库

1. **Fork 仓库**：https://github.com/1479650473/game-platform
2. Clone 你的 fork
3. 将游戏放入 `resources/builtin/<game-id>/`
4. 在 `games-registry.json` 中添加你的游戏
5. 提交 PR 到 `main` 分支
6. 等待 CI 通过和维护者 review

PR 标题示例：`feat: 添加贪吃蛇游戏`

---

## 常见错误

### 游戏窗口白屏/一片空白

**原因**：`index.html` 中资源路径使用了 `/assets/...` 绝对路径，而平台通过 `file://` 加载。

**解决**：
1. Vite 项目：确认 `vite.config.ts` 中 `base: './'`
2. 构建后检查 `dist/index.html`，确保 `<script src="./assets/...">`
3. 检查目录结构：`assets/` 必须在 `index.html`**同级**

### `window.gamePlatformAPI` is undefined

**原因**：在浏览器中通过 `http://localhost:5173` 开发，预加载脚本未注入。

**解决**：API 仅在平台内运行时可用。开发时做存在性检查：

```typescript
if (window.gamePlatformAPI) {
  window.gamePlatformAPI.closeGame();
}
```

### 游戏图标不显示

**原因**：`game.json` 中 `icon` 字段指定的文件名与实际图标文件名不一致。

**解决**：确保 `game.json` 的 `icon` 值与文件夹内图标文件名完全一致。

### 构建产物路径嵌套

**原因**：某些构建工具会在 `dist/` 下再嵌套一层。

**解决**：确保 `index.html` 和 `assets/` 在同一层级。如果 Vite 输出不对，检查 `vite.config.ts`：

```typescript
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
```

### 窗口尺寸不适配

**原因**：`game.json` 中 `width` / `height` 与游戏实际布局不匹配。

**解决**：调整 `game.json` 中的窗口尺寸。建议让游戏内容响应式填充整个窗口：

```css
html, body, #root {
  width: 100%;
  height: 100vh;
  margin: 0;
  overflow: auto;
}
```

---

## 完整示例：数独游戏

查看官方数独游戏的源码作为参考：

- 游戏源码：`../sudoku/`（相对于本仓库根目录）
- game.json：`../sudoku/game.json`
- vite.config.ts：`../sudoku/vite.config.ts`

该游戏展示了：
- React + Vite + TypeScript 的完整配置
- `base: './'` 的相对路径设置
- 窗口尺寸 540×720 的自定义配置
- `game.json` 中 `minWidth` / `minHeight` 的使用
