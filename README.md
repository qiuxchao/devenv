<p align="center">
  <img src="src-tauri/icons/icon.png" width="128" height="128" alt="DevEnv">
</p>

<h1 align="center">DevEnv</h1>

<p align="center">可视化管理开发环境变量的桌面应用</p>

<!-- screenshot -->

---

## 中文

### 功能

- **Profile 切换** — 多套环境变量配置一键切换
- **可视化编辑** — 直观地添加、修改、删除环境变量
- **Shell 自动集成** — 自动写入 shell 配置，终端即时生效
- **代理管理** — 快速切换 HTTP/HTTPS/SOCKS 代理设置
- **跟随系统主题与语言** — 自动适配深色/浅色模式和系统语言
- **轻量高效** — 基于 Tauri，体积小、资源占用低

### 安装

从 [GitHub Releases](https://github.com/nicepkg/devenv/releases) 下载对应平台安装包：

- **macOS**：`.dmg`（支持 Apple Silicon 和 Intel）
- **Windows**：`.msi` / `.exe`
- **Linux**：`.deb` / `.AppImage`

或通过 Homebrew 安装（macOS）：

```bash
brew install --cask devenv
```

### 工作原理

1. 在 GUI 中创建并编辑环境变量 Profile
2. 激活的配置自动写入 `~/.devenv/active.sh`
3. Shell 启动时 source 该文件，环境变量即时生效

### 技术栈

Tauri 2 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · Rust

### 从源码构建

前置条件：[Rust](https://rustup.rs/)、[Node.js 22+](https://nodejs.org/)、[Bun](https://bun.sh/)

```bash
git clone https://github.com/nicepkg/devenv.git
cd devenv
bun install
bun run tauri dev
```

### 许可证

[MIT](./LICENSE)

---

## English

### Features

- **Profile Switching** — Switch between multiple sets of environment variables in one click
- **Visual Env Var Editing** — Intuitively add, modify, and delete environment variables
- **Shell Auto-Integration** — Automatically writes to shell config, takes effect immediately
- **Proxy Management** — Quickly toggle HTTP/HTTPS/SOCKS proxy settings
- **System Theme & Language** — Follows system dark/light mode and locale
- **Lightweight** — Built with Tauri, small bundle size and low resource usage

### Install

Download from [GitHub Releases](https://github.com/nicepkg/devenv/releases):

- **macOS**: `.dmg` (Apple Silicon & Intel)
- **Windows**: `.msi` / `.exe`
- **Linux**: `.deb` / `.AppImage`

Or via Homebrew (macOS):

```bash
brew install --cask devenv
```

### How It Works

1. Create and edit environment variable profiles in the GUI
2. The active profile is written to `~/.devenv/active.sh`
3. Your shell sources this file on startup, applying the variables instantly

### Tech Stack

Tauri 2 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · Rust

### Build from Source

Prerequisites: [Rust](https://rustup.rs/), [Node.js 22+](https://nodejs.org/), [Bun](https://bun.sh/)

```bash
git clone https://github.com/nicepkg/devenv.git
cd devenv
bun install
bun run tauri dev
```

### License

[MIT](./LICENSE)
