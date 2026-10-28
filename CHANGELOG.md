# Changelog

## 1.0.1

### Added

- **Live preview editing guard** — Detect cursor-in-line temporary render in Obsidian live preview mode, suppress popup to avoid editing interference.
- **CodeMirror source mode support** — Use `posAtCoords` to locate mouse line, regex match `[text](local-path)`, `coordsAtPos` for screen rect.
- **Reading view support** — Match rendered `<a href>` / `<a data-href>`, decode `file:///` prefix, detect drive-letter / UNC local paths.
- **File protocol IPC** — Write `%TEMP%\hover_link.json` (path + editing + screen rect + timestamp), `setInterval 400ms` refresh, clear on mouseleave.
- **README** — Installation, usage, architecture documentation.

## 1.0.0

### Added

- Initial release: hover `[text](local-path)` links to trigger HoverExplorer preview.