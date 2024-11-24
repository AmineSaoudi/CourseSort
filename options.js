document.addEventListener('DOMContentLoaded', () => {
    const selectButton = document.getElementById('selectDir');
    selectButton.addEventListener('click', async () => {
      try {
        const directoryHandle = await window.showDirectoryPicker();
        console.log("the directory is: ", directoryHandle);

         // Verify permission
         const permission = await directoryHandle.requestPermission({ mode: 'readwrite' });
         if (permission !== 'granted') {
             throw new Error("Permission not granted for directory.");
        }

        // Store the directory handle
        await chrome.storage.local.set({ baseDirectory: directoryHandle });
        console.log('Directory handle saved successfully: ', directoryHandlePath);
      } catch (error) {
        console.error('Error selecting directory:', error);
      }
    });
  });
  