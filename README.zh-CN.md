<p align="center">
  <img src="src-tauri/icons/icon.png" width="128" height="128" alt="DevEnv">
</p>

<h1 align="center">DevEnv</h1>

<p align="center">
  可视化管理开发环境变量的桌面应用
  <br />
  <a href="./README.md">English</a>
</p>

<!-- screenshot -->

## 功能

- **Profile 切换** — 多套环境变量配置一键切换
- **可视化编辑** — 直观地添加、修改、删除环境变量
- **Shell 自动集成** — 自动写入 shell 配置，终端即时生效
- **代理管理** — 快速切换 HTTP/HTTPS/SOCKS 代理设置
- **跟随系统主题与语言** — 自动适配深色/浅色模式和系统语言
- **轻量高效** — 基于 Tauri，体积小、资源占用低

## 安装

从 [GitHub Releases](https://github.com/qiuxchao/devenv/releases) 下载对应平台安装包：

- **macOS**：`.dmg`（支持 Apple Silicon 和 Intel）
- **Windows**：`.msi` / `.nsis`
- **Linux**：`.deb` / `.AppImage`

### macOS："应用已损坏"解决方法

由于应用未进行 Apple 开发者签名，macOS 可能会阻止打开。安装后在终端执行：

```bash
xattr -cr /Applications/devenv.app
```

然后正常打开即可。

## 工作原理

1. 在 GUI 中创建并编辑环境变量 Profile
2. 激活的配置自动写入：
   - **macOS / Linux**：`~/.devenv/active.sh`
   - **Windows**：`~/.devenv/active.ps1`
3. Shell 启动时 source 该文件，环境变量即时生效

## 技术栈

Tauri 2 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · Rust

## 从源码构建

前置条件：[Rust](https://rustup.rs/)、[Node.js 22+](https://nodejs.org/)、[Bun](https://bun.sh/)

```bash
git clone https://github.com/qiuxchao/devenv.git
cd devenv
bun install
bun run tauri dev
```

## 许可证

[MIT](./LICENSE)
