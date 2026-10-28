# Hover Link Preview

Obsidian 插件：悬停 `[text](本地路径)` 链接时通知 [HoverExplorer (he)](https://github.com/dlsdgj/HoverExplorer) 弹出文件/文件夹预览面板。

支持阅读视图与 CodeMirror 编辑态（含实时预览模式）。路径可含空格、中文、UNC。

## 安装

1. 将 `hover-link-preview` 文件夹放入 vault 的 `.obsidian/plugins/`
2. 设置 → 第三方插件 → 关闭安全模式 → 启用 **Hover Link Preview**
3. 确保已运行 [HoverExplorer](https://github.com/dlsdgj/HoverExplorer/releases)

## 用法

在笔记中写 Obsidian 风格链接：

```
[测试](C:\Users\Administrator\Desktop\新建文件夹)
[文档](D:\Documents\Obsidian Vault\.obsidian)
[共享](\\server\share\dir)
```

鼠标悬停链接文字，he 即在旁边弹出该路径的文件列表/预览。

- **阅读视图**：命中渲染后的 `<a>` 元素
- **源码模式**：用 `posAtCoords` 定位鼠标所在行，正则匹配 `[text](本地路径)`
- **实时预览模式**：自动识别"光标所在行的临时渲染"（编辑态），不弹窗干扰输入

## 原理

插件不直接弹窗，而是通过文件协议与 he 通信：

- 悬停链接时写 `%TEMP%\hover_link.json`（路径 + 编辑态 + 屏幕矩形 + 时间戳）
- he 每 Tick 读该文件，鼠标在矩形内且非编辑态时弹出预览
- `setInterval 400ms` 持续刷新时间戳，鼠标离开时清空

相比 UIA hit-test，文件协议绕过了 Electron/WebView2 的 UIA 层级深、编辑态误判等问题。

## 配置

无需配置。仅识别本地路径（盘符 `X:\` 或 UNC `\\`），不处理 `http://` 等网络链接。

## 兼容性

- Obsidian 0.15.0+
- 仅桌面端（依赖 Node `fs`）