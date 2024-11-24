chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
    const url = downloadItem.url.toLowerCase();
    let subDirectory = 'content'; // Default subdirectory
  
    if (url.includes('news')) {
      subDirectory = 'news';
    } else if (url.includes('home')) {
      subDirectory = 'home';
    } else if (url.includes('common')) {

      subDirectory = 'assignment';
    }
    else
    {
      // We are in content page, use Amines code
    }
  
    const filename = downloadItem.filename.split('/').pop(); // Extract the original filename
    const newFilename = `${subDirectory}/${filename}`;
  
    suggest({ filename: newFilename });
  });
  
  
  