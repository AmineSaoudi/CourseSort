document.addEventListener('DOMContentLoaded', () => {
    const currentRootDirectoryElement = document.getElementById('currentRootDirectory');
    const changeRootDirectoryButton = document.getElementById('changeRootDirectory');

    // Load and display the saved root directory
    chrome.storage.local.get(['rootDirectory'], (result) => {
        if (result.rootDirectory) {
            currentRootDirectoryElement.textContent = result.rootDirectory;
        } else {
            currentRootDirectoryElement.textContent = 'Not set. Please configure in the options.';
        }
    });

    // Open the options page on button click
    changeRootDirectoryButton.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });
});
