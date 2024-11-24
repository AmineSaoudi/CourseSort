// Function to get the parent category of the currently selected file
function getParentCategory() {
    // Select all divs with the class 'navigation-item'
    const navigationItems = document.querySelectorAll('div.navigation-item');

    // Array to hold the extracted span text
    const spanTexts = [];

    // Iterate through each 'navigation-item'
    navigationItems.forEach((navigationItem) => {
        // Find a div with the class 'title-text' inside the navigation item
        const titleTextDiv = navigationItem.querySelector('div.title-text');
        if (titleTextDiv) {
            // Find a span inside the title-text div and get its text
            const span = titleTextDiv.querySelector('span');
            if (span) {
                spanTexts.push(span.textContent.trim()); // Add the text to the array
            }
        }
    });

    // Log the array of span texts for debugging
    console.log("Parent Categories:", spanTexts);

    // Return the first matching category (e.g., the currently selected one)
    // Modify this logic if needed to determine the "selected" item
    return spanTexts[0] || "Unknown";
}

// Export the parent category for use in the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getParentCategory") {
        const category = getParentCategory();
        sendResponse({ category });
    }
});
