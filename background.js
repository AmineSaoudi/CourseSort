// Include IDB for IndexedDB operations (include in manifest as required)
import { openDB } from 'https://cdn.jsdelivr.net/npm/idb@7.1.1/build/index.js';

let baseDirectoryHandle = null;

// IndexedDB setup
const dbPromise = openDB('FileHandlesDB', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('handles')) {
      db.createObjectStore('handles'); // Create the object store if it doesn't exist
    }
  },
});

// Save directory handle to IndexedDB
async function saveDirectoryHandle(handle) {
  const db = await dbPromise;
  await db.put('handles', handle, 'baseDirectory');
  console.log('Directory handle saved.');
}

// Load directory handle from IndexedDB
async function loadDirectoryHandle() {
  const db = await dbPromise;
  return db.get('handles', 'baseDirectory');
}

// Check and request directory permissions
async function ensurePermissions(handle) {
  const permission = await handle.queryPermission({ mode: 'readwrite' });
  if (permission === 'granted') return true;
  return (await handle.requestPermission({ mode: 'readwrite' })) === 'granted';
}

// Handle file downloads
async function handleDownload(downloadItem) {
  try {
    if (!baseDirectoryHandle) {
      console.error('Base directory handle not set.');
      return;
    }

    const hasPermission = await ensurePermissions(baseDirectoryHandle);
    if (!hasPermission) {
      console.error('No permission to access directory.');
      return;
    }

    const fileData = await fetch(downloadItem.finalUrl).then((res) => res.blob());
    const fileHandle = await baseDirectoryHandle.getFileHandle(downloadItem.filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(fileData);
    await writable.close();
    console.log(`Downloaded file saved: ${downloadItem.filename}`);
  } catch (err) {
    console.error('Error handling download:', err.name, err.message);
  }
}

// Restore directory handle on startup
chrome.runtime.onInstalled.addListener(async () => {
  try {
    baseDirectoryHandle = await loadDirectoryHandle();
    if (baseDirectoryHandle) {
      console.warn('Directory Handle Restored');
      baseDirectoryHandle = null;
    } else {
      console.log('Restored base directory handle.');
    }
  } catch (err) {
    console.error('Error restoring directory handle:', err.name, err.message);
  }
});

// Listen for directory selection from options page
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'setDirectory') {
    try {
      baseDirectoryHandle = message.directoryHandle;
      await saveDirectoryHandle(baseDirectoryHandle);
      sendResponse({ success: true });
      console.log('Base directory set successfully.');
    } catch (err) {
      console.error('Error setting directory handle:', err.name, err.message);
      sendResponse({ success: false, error: err.message });
    }
  }
});

// Listen for downloads
chrome.downloads.onCreated.addListener((downloadItem) => {
  console.log('Download initiated:', downloadItem.filename);
  handleDownload(downloadItem).catch((err) => {
    console.error('Error during download handling:', err.name, err.message);
  });
});
