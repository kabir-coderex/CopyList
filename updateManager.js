const { dialog, app, shell } = require("electron");
const https = require("https");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const GITHUB_OWNER = "kabir-coderex";
const GITHUB_REPO = "CopyList";
const CURRENT_VERSION = app.getVersion();
const DOWNLOAD_PATH = path.join(app.getPath("downloads"), "CopyList-latest.dmg");

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

async function downloadUpdate(updateUrl) {
  return new Promise((resolve, reject) => {
    const command = `curl -L --fail --silent --show-error --output "${DOWNLOAD_PATH}" "${updateUrl}"`;

    console.log("Downloading update...");

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Download failed:", stderr);
        reject(new Error("Failed to download update."));
        return;
      }

      console.log(`Download completed. File saved at: ${DOWNLOAD_PATH}`);
      resolve(DOWNLOAD_PATH);
    });
  });
}

async function verifyDownloadedFile(filePath) {
  return new Promise((resolve, reject) => {
    exec(`file "${filePath}"`, (error, stdout) => {
      if (error) {
        console.error("Error verifying file type:", error);
        reject(false);
      } else {
        console.log("File type check:", stdout);
        if (stdout.includes("zlib compressed data")) {
          console.log("Detected compressed DMG. Attempting to convert...");
          const convertedPath = filePath.replace(".dmg", "-converted.dmg");
          exec(`hdiutil convert "${filePath}" -format UDRO -o "${convertedPath}"`, (err) => {
            if (err) {
              console.error("Failed to convert compressed DMG:", err);
              reject(false);
            } else {
              console.log("Conversion successful!");
              resolve(convertedPath);
            }
          });
        } else if (stdout.includes("Apple Disk Image")) {
          resolve(filePath);
        } else {
          console.error("Downloaded file is not a valid .dmg file.");
          reject(false);
        }
      }
    });
  });
}

async function installUpdate(filePath) {
  dialog.showMessageBox({ type: "info", title: "Installing Update", message: "The update will be installed now. Please wait..." });

  exec(`hdiutil attach "${filePath}"`, (error, stdout) => {
    if (error) {
      console.error("Failed to mount DMG:", error);
      return;
    }

    const volumePathMatch = stdout.match(/\/Volumes\/(.*?)\n/);
    if (!volumePathMatch) {
      console.error("Could not find mounted volume.");
      return;
    }

    const volumePath = `/Volumes/${volumePathMatch[1].trim()}`;
    const appPath = "/Applications/Copy List.app";

    const copyCommand = `cp -R "${volumePath}/Copy List.app" "${appPath}" && hdiutil detach "${volumePath}"`;
    exec(copyCommand, (err) => {
      if (err) {
        console.error("Failed to copy app:", err);
        return;
      }

      dialog.showMessageBox({ type: "info", title: "Update Installed", message: "Update completed! Restarting Copy List..." });

      app.relaunch();
      app.quit();
    });
  });
}

async function checkForUpdates() {
  try {
    const latestRelease = await getLatestRelease();
    const latestVersion = latestRelease.tag_name.replace("v", "");

    if (latestVersion === CURRENT_VERSION) {
      dialog.showMessageBox({ type: "info", title: "Update Check", message: "You are already using the latest version." });
      return;
    }

    const updateAsset = latestRelease.assets.find(asset => asset.name.endsWith("-universal.dmg"));
    if (!updateAsset) {
      dialog.showMessageBox({ type: "error", title: "Update Error", message: "No valid update file found." });
      return;
    }

    console.log("Update URL:", updateAsset.browser_download_url);

    dialog.showMessageBox({
      type: "info",
      title: "Update Available",
      message: `New version ${latestVersion} is available. Do you want to update now?`,
      buttons: ["Yes", "No"],
    }).then(async (result) => {
      if (result.response === 0) {
        try {
          const downloadPath = await downloadUpdate(updateAsset.browser_download_url);
          const convertedPath = await verifyDownloadedFile(downloadPath);
          if (convertedPath) {
            await installUpdate(convertedPath);
          }
        } catch (error) {
          console.error("Error during update process:", error);
          dialog.showMessageBox({ type: "error", title: "Update Error", message: "Update failed. Please try again later." });
        }
      }
    });

  } catch (error) {
    console.error("Update Check Failed:", error);
    dialog.showMessageBox({ type: "error", title: "Update Error", message: "Could not check for updates. Please try again later." });
  }
}

module.exports = { checkForUpdates };
