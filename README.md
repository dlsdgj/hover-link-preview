# Hover Link Preview

Obsidian plugin: hover `[text](local-path)` links to trigger [HoverExplorer (he)](https://github.com/dlsdgj/HoverExplorer) file/folder preview panel.

Supports reading view and CodeMirror edit mode (including live preview). Paths may contain spaces, CJK characters, UNC.

Obsidian 插件：悬停 `[text](本地路径)` 链接时通知 [HoverExplorer (he)](https://github.com/dlsdgj/HoverExplorer) 弹出文件/文件夹预览面板。

支持阅读视图与 CodeMirror 编辑态（含实时预览模式）。路径可含空格、中文、UNC。

## Install / 安装

1. Place the `hover-link-preview` folder into your vault's `.obsidian/plugins/`
2. Settings → Community plugins → turn off Safe mode → enable **Hover Link Preview**
3. Make sure [HoverExplorer](https://github.com/dlsdgj/HoverExplorer/releases) is running

1. 将 `hover-link-preview` 文件夹放入 vault 的 `.obsidian/plugins/`
2. 设置 → 第三方插件 → 关闭安全模式 → 启用 **Hover Link Preview**
3. 确保已运行 [HoverExplorer](https://github.com/dlsdgj/HoverExplorer/releases)

## Usage / 用法

Write Obsidian-style links in your notes / 在笔记中写 Obsidian 风格链接：

```
[test](C:\Users\Administrator\Desktop\New Folder)
[docs](D:\Documents\Obsidian Vault\.obsidian)
[share](\\server\share\dir)
```

Hover the link text, he pops up the file list/preview for that path beside it.

鼠标悬停链接文字，he 即在旁边弹出该路径的文件列表/预览。

- **Reading view / 阅读视图**: matches rendered `<a>` element / 命中渲染后的 `<a>` 元素
- **Source mode / 源码模式**: uses `posAtCoords` to locate mouse line, regex matches `[text](local-path)` / 用 `posAtCoords` 定位鼠标所在行，正则匹配 `[text](本地路径)`
- **Live preview / 实时预览模式**: auto-detects "cursor-line temporary render" (editing state), suppresses popup to avoid input interference / 自动识别"光标所在行的临时渲染"（编辑态），不弹窗干扰输入

## How it works / 原理

The plugin does not pop up windows directly; it communicates with he via file protocol / 插件不直接弹窗，而是通过文件协议与 he 通信：

- On link hover writes `%TEMP%\hover_link.json` (path + editing state + screen rect + timestamp) / 悬停链接时写 `%TEMP%\hover_link.json`（路径 + 编辑态 + 屏幕矩形 + 时间戳）
- he reads the file each tick, pops up preview when mouse is inside the rect and not editing / he 每 Tick 读该文件，鼠标在矩形内且非编辑态时弹出预览
- `setInterval 400ms` keeps refreshing the timestamp; cleared on mouseleave / `setInterval 400ms` 持续刷新时间戳，鼠标离开时清空

Compared to UIA hit-test, the file protocol bypasses Electron/WebView2 UIA deep hierarchy and editing-state misdetection / 相比 UIA hit-test，文件协议绕过了 Electron/WebView2 的 UIA 层级深、编辑态误判等问题。

## Configuration / 配置

No configuration needed. Only local paths are recognized (drive letter `X:\` or UNC `\\`); `http://` and other network links are ignored.

无需配置。仅识别本地路径（盘符 `X:\` 或 UNC `\\`），不处理 `http://` 等网络链接。

## Compatibility / 兼容性

- Obsidian 0.15.0+
- Desktop only (depends on Node `fs`) / 仅桌面端（依赖 Node `fs`）