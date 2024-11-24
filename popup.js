document.getElementById("extract-html").addEventListener("click", () => {
    chrome.runtime.sendMessage({ command: "getHTML" }, (response) => {
      if (response && response.html) {
        document.getElementById("html-content").textContent = response.html;
      } else {
        document.getElementById("html-content").textContent = "Failed to retrieve HTML.";
      }
    });
  });
  