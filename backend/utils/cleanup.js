const fs = require("fs/promises");
const path = require("path");

async function clearDirectory(dirPath) {
  try {
    // Check if directory exists
    await fs.access(dirPath).catch(() => {
      console.log("Directory does not exist:", dirPath);
      return;
    });

    const files = await fs.readdir(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = await fs.lstat(filePath);

      if (stat.isDirectory()) {
        // Recursively delete subdirectory
        await fs.rm(filePath, { recursive: true, force: true });
      } else {
        // Delete file
        await fs.unlink(filePath);
      }
    }

    console.log(`Cleared directory: ${dirPath}`);
  } catch (err) {
    console.error("Error clearing directory:", err);
  }
}

module.exports = clearDirectory;
