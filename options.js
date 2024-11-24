document.addEventListener('DOMContentLoaded', () => {
    const selectButton = document.getElementById('selectDir');
    selectButton.addEventListener('click', async () => {
      try {
        const directoryHandle = await window.showDirectoryPicker();
        const permission = await directoryHandle.requestPermission({ mode: 'readwrite' });
        if (permission !== 'granted') {
          alert('Permission denied.');
          return;
        }
        // Store the directory handle
        const idb = await navigator.storage.persist(); // Optional: Ensure storage persistence
        await chrome.storage.local.set({ baseDirectory: directoryHandle });
        console.log('Directory handle saved successfully!');
      } catch (error) {
        console.error('Error selecting directory:', error);
      }
    });
  });
  