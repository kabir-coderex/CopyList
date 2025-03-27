const { dialog, app, shell } = require("electron");
const https = require("https");
const fs = require("fs");
const path = require("path");

const GITHUB_OWNER = "kabir-coderex";
const GITHUB_REPO = "CopyList";         // Change this
const CURRENT_VERSION = app.getVersion();

async function getLatestRelease() {
  return new Promise((resolve, reject) => {
    https.get(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`,
      {
        headers: { "User-Agent": "Electron-App" },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(JSON.parse(data)));
      }
    ).on("error", reject);
  });
}

async function checkForUpdates(tray) {
  try {
    const latestRelease = await getLatestRelease();
    const latestVersion = latestRelease.tag_name.replace("v", "");
    if (latestVersion === CURRENT_VERSION) {
      dialog.showMessageBox({
        type: "info",
        title: "Update Check",
        message: "You are already using the latest version.",
      });
    } else {
      const updateUrl = latestRelease.assets.find(asset => asset.name.endsWith(".dmg")).browser_download_url;
      dialog.showMessageBox({
        type: "info",
        title: "Update Available",
        message: `New version ${latestVersion} is available. Download now?`,
        buttons: ["Yes", "No"],
      }).then((result) => {
        if (result.response === 0) {
          shell.openExternal(updateUrl);
        }
      });
    }
  } catch (error) {
    console.error("Update Check Failed:", error);
    dialog.showMessageBox({
      type: "error",
      title: "Update Error",
      message: "Could not check for updates. Please try again later.",
    });
  }
}

module.exports = { checkForUpdates };
