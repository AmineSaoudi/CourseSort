import { generateFolderPath } from './folderPathGenerator.js';

document.addEventListener('DOMContentLoaded', () => {
    const currentRootDirectoryElement = document.getElementById('currentRootDirectory');

    // Load and display the saved root directory
    chrome.storage.local.get(['rootDirectory'], (result) => {
        if (result.rootDirectory) {
            currentRootDirectoryElement.textContent = result.rootDirectory;
        } else {
            currentRootDirectoryElement.textContent = (async () => {
                generateFolderPath("HI")
            });
        }
    });
});
