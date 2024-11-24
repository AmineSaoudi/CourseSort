chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'reauthorize') {
    try {
      const directoryHandle = await window.showDirectoryPicker();
      const permission = await directoryHandle.requestPermission({ mode: 'readwrite' });
      if (permission !== 'granted') {
        console.error('Permission denied.');
        return;
      }
      await chrome.storage.local.set({ baseDirectory: directoryHandle });
      console.log('Directory reauthorized.');
    } catch (error) {
      console.error('Error reauthorizing directory:', error);
    }
  }
});
