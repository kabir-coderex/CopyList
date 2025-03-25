# CopyList

CopyList is a lightweight clipboard manager built with **Electron.js**. It allows users to quickly access and manage copied text directly from the macOS menu bar.

## Features

✅ **Tray (Menu Bar) App** – Stays in the top bar, hidden from the Dock  
✅ **Global Shortcut** – Open with `Ctrl + Shift + V`  
✅ **Auto-Launch on Login** – Starts automatically when macOS boots  
✅ **Quick Toggle** – Left-click the tray icon to show/hide  
✅ **Context Menu** – Right-click the tray icon for options  

## Installation (For Users)

1. **Download the latest release** from [GitHub Releases](https://github.com/kabir-coderex/CopyList/releases).
2. **Install the app** by dragging it to your Applications folder.
3. Click the **menu bar icon** to open the app.

## Usage

- **Left-click the tray icon** → Opens the clipboard manager.
- **Right-click the tray icon** → Shows options (`Show`, `Hide`, `Quit`).
- **Use `Ctrl + Shift + V`** → Opens the app from anywhere.

## Basic troubleshooting
- If you see this message `“CopyList” is damaged and can’t be opened. You should move it to the Bin.` → Then open your terminal and run this command,
```bash
    xattr -cr /Applications/Copy\ List.app
```

## Development (For Developers)

### Prerequisites

- Node.js & npm
- Electron.js

### Clone & Setup

```sh
git clone https://github.com/kabir-coderex/CopyList.git
cd CopyList
npm install
```

### Run in Development Mode

```sh
npm start
```

### Build for macOS

```sh
npm run build
```

## Contributions

Contributions are welcome! Feel free to open issues and pull requests.

## License

MIT License © 2025 [MD Humayun Kabir](https://github.com/kabir-coderex/)

