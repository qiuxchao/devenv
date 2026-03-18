<p align="center">
  <img src="src-tauri/icons/icon.png" width="128" height="128" alt="DevEnv">
</p>

<h1 align="center">DevEnv</h1>

<p align="center">
  A visual desktop app for managing developer environment variables.
  <br />
  <a href="./README.zh-CN.md">中文文档</a>
</p>

<!-- screenshot -->

## Features

- **Profile Switching** — Switch between multiple sets of environment variables in one click
- **Visual Env Var Editing** — Intuitively add, modify, and delete environment variables
- **Shell Auto-Integration** — Automatically writes to shell config, takes effect immediately
- **Proxy Management** — Quickly toggle HTTP/HTTPS/SOCKS proxy settings
- **System Theme & Language** — Follows system dark/light mode and locale
- **Lightweight** — Built with Tauri, small bundle size and low resource usage

## Install

Download from [GitHub Releases](https://github.com/qiuxchao/devenv/releases):

- **macOS**: `.dmg` (Apple Silicon & Intel)
- **Windows**: `.msi` / `.nsis`
- **Linux**: `.deb` / `.AppImage`

### macOS: "App is damaged" fix

Since the app is not code-signed with an Apple Developer certificate, macOS Gatekeeper may block it. Run this command after installing:

```bash
xattr -cr /Applications/devenv.app
```

Then open the app normally.

## How It Works

1. Create and edit environment variable profiles in the GUI
2. The active profile is written to:
   - **macOS / Linux**: `~/.devenv/active.sh`
   - **Windows**: `~/.devenv/active.ps1`
3. Your shell sources this file on startup, applying the variables instantly

## Tech Stack

Tauri 2 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · Rust

## Build from Source

Prerequisites: [Rust](https://rustup.rs/), [Node.js 22+](https://nodejs.org/), [Bun](https://bun.sh/)

```bash
git clone https://github.com/qiuxchao/devenv.git
cd devenv
bun install
bun run tauri dev
```

## License

[MIT](./LICENSE)
