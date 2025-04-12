const { dialog, app, shell } = require("electron");
const https = require("https");
const path = require("path");
const { exec } = require("child_process");

const GITHUB_OWNER = "kabir-coderex";
const GITHUB_REPO = "CopyList";
const CURRENT_VERSION = app?.getVersion() || "1.0.0"; // Default version if app is not defined

async function getLatestRelease() {
  return new Promise((resolve, reject) => {
    https.get(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`,
      { headers: { "User-Agent": "Electron-App" } },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(JSON.parse(data)));
      }
    ).on("error", reject);
  });
}

function forceQuitApp(appName = "Copy List") {
  return new Promise((resolve, reject) => {
    exec(`ps -ax | grep "${appName}.app" | grep -v grep`, (err, stdout) => {
      if (err || !stdout) {
        return reject("App not running or could not find PID.");
      }

      const lines = stdout.trim().split("\n");
      const pids = lines.map(line => line.trim().split(/\s+/)[0]);

      if (pids.length === 0) {
        return reject("PID not found.");
      }

      // Kill all matched PIDs
      exec(`kill -9 ${pids.join(" ")}`, (killErr) => {
        if (killErr) {
          return reject("Failed to kill the app.");
        }
        resolve("App killed successfully.");
      });
    });
  });
}

async function checkForUpdates() {
  try {
    const latestRelease = await getLatestRelease();
    const latestVersion = latestRelease.tag_name.replace("v", "");

    if (latestVersion === CURRENT_VERSION) {
      dialog.showMessageBox({
        type: "info",
        title: "Update Check",
        message: "You are already using the latest version.",
      });
      return;
    }

    const updateAsset = latestRelease.assets.find(asset =>
      asset.name.endsWith("-universal.dmg")
    );
    if (!updateAsset) {
      dialog.showMessageBox({
        type: "error",
        title: "Update Error",
        message: "No valid update file found.",
      });
      return;
    }

    const updateUrl = updateAsset.browser_download_url;
    const downloadPath = path.join(app.getPath("downloads"), updateAsset.name);

    dialog.showMessageBox({
      type: "info",
      title: "Update Available",
      message: `New version ${latestVersion} is available. Do you want to update now?`,
      buttons: ["Yes", "No"],
    }).then(async (result) => {
      if (result.response === 0) {
        // Step 1: Download file using curl
        const curlCommand = `curl -L --fail --silent --show-error --output "${downloadPath}" "${updateUrl}"`;

        exec(curlCommand, async (err) => {
          if (err) {
            dialog.showErrorBox("Download Failed", "Unable to download update file.");
            return;
          }

          // Step 2: Start fswatch observer in Terminal
          const monitorScript = `
            osascript -e 'tell application "Terminal"
              do script "fswatch -0 /Applications/Copy\\\\ List.app | while IFS= read -r -d \\"\\" event; do
                echo \\"Copy List.app has been updated or replaced.\\"
                xattr -cr /Applications/Copy\\\\ List.app
                echo \\"xattr command executed. Stopping observer.\\"
                osascript -e \\"tell application \\\\\\"Terminal\\\\\\" to close (every window whose name contains \\\\\\"monitor\\\\\\")\\" 2>/dev/null
                break
              done"
              set custom title of front window to "monitor"
            end tell'
          `;
          exec(monitorScript);

          // Step 3: Show downloaded file and open DMG
          shell.showItemInFolder(downloadPath);
          exec(`open "${downloadPath}"`);

          // Step 4: Force kill the app
          try {
            const result = await forceQuitApp("Copy List");
            console.log(result);
          } catch (quitErr) {
            console.error("Force quit failed:", quitErr);
            dialog.showMessageBox({
              type: "warning",
              title: "Quit App Manually",
              message: "Could not quit Copy List automatically. Please quit it manually before installing the update.",
            });
          }
        });
      }
    });

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
