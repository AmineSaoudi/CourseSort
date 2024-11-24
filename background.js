chrome.downloads.onDeterminingFilename.addListener(async (downloadItem, suggest) => {
  try {
      // Retrieve the serialized handle from storage
      const { baseDirectory } = await chrome.storage.local.get("baseDirectory");

      if (!baseDirectory) {
          console.error("Base directory handle not found.");
          suggest(); // Save file in default location
          return;
      }

      // Deserialize the directory handle
      const directoryHandle = baseDirectory;

      // Suggest saving the file in a temporary location
      suggest({ filename: downloadItem.filename });

      // Listen for the completion of the download
      chrome.downloads.onChanged.addListener(async (delta) => {
          if (delta.state && delta.state.current === "complete" && delta.id === downloadItem.id) {
              try {
                  const fileName = downloadItem.filename.split("/").pop();

                  // Create a writable file in the selected directory
                  const fileHandle = await getFileHandle(fileName, { create: true });
                  const writableStream = await fileHandle.createWritable();

                  // Fetch the file content
                  const response = await fetch(downloadItem.url);
                  await response.body.pipeTo(writableStream);

                  console.log(`File moved successfully: ${fileName}`);
              } catch (err) {
                  console.error("Error handling downloaded file:", err);
              }
          }
      });
  } catch (error) {
      console.error("Error handling download:", error);
  }
});
