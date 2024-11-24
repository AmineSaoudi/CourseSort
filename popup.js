document.addEventListener('DOMContentLoaded', () => {
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript(
            {
                target: { tabId: tabs[0].id },
                func: () => {
                    // Function to find the full path with term code and course title
                    function findFullPath() {
                        const iframe = document.querySelector('iframe'); // Assuming there's only one iframe
                        if (!iframe) {
                            return { found: false, path: 'No iframe found.' };
                        }

                        try {
                            const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
                            const selectedElement = iframeDocument.querySelector('.selected');
                            if (!selectedElement) {
                                return { found: false, path: 'No selected element found.' };
                            }

                            const names = []; // Array to store all parent box names
                            let currentElement = selectedElement;

                            while (currentElement) {
                                if (currentElement.matches('span')) {
                                    // When the span is reached, find its sibling box
                                    const parentBox = currentElement.parentElement.querySelector('.unit-box, .lesson-box');
                                    if (parentBox) {
                                        const nameElement = parentBox.querySelector('.title-text span'); // Adjust selector as needed
                                        const name = nameElement ? nameElement.textContent.trim() : 'Name not found';
                                        names.push(name);

                                        // If this is a unit box, stop the traversal
                                        if (parentBox.classList.contains('unit-box')) {
                                            break;
                                        }

                                        // Continue traversal from the parent box
                                        currentElement = parentBox;
                                    } else {
                                        names.push('Parent box not found.');
                                        break;
                                    }
                                } else {
                                    currentElement = currentElement.parentElement;
                                }
                            }

                            // Reverse the path to have root first
                            const reversedNames = names.reverse();

                            // Now, get the term code and course title
                            const navLink = document.querySelector('a.d2l-navigation-s-link');
                            if (navLink) {
                                const title = navLink.title || navLink.textContent;
                                // Extract the term and year, and course title
                                const firstDashIndex = title.indexOf('-');
                                if (firstDashIndex !== -1) {
                                    const termAndYear = title.substring(0, firstDashIndex).trim(); // e.g., 'Fall 2024'
                                    const courseTitle = title.substring(firstDashIndex + 1).trim(); // e.g., 'ECSE-310-001 - Thermodynamics of Computing'

                                    // Map term to code
                                    const termMatch = termAndYear.match(/(Fall|Winter|Summer)\s+(\d{4})/i);
                                    if (termMatch) {
                                        let termCode = '';
                                        const term = termMatch[1].toLowerCase();
                                        const year = termMatch[2];
                                        if (term === 'fall') {
                                            termCode = 'F';
                                        } else if (term === 'winter') {
                                            termCode = 'W';
                                        } else if (term === 'summer') {
                                            termCode = 'S';
                                        }
                                        termCode += year.slice(-2); // Last two digits of year

                                        // Prepend term code and course title to the path
                                        reversedNames.unshift(courseTitle);
                                        reversedNames.unshift(termCode);
                                    }
                                }
                            }

                            // Join the path with '/'
                            const fullPath = reversedNames.join('/');

                            return { found: true, path: fullPath };
                        } catch (error) {
                            // Handle cross-origin iframe access error
                            console.warn('Unable to access iframe due to cross-origin restrictions:', iframe);
                            return { found: false, path: 'Unable to access iframe.' };
                        }
                    }

                    // Run the search and return the result
                    return findFullPath();
                }
            },
            (results) => {
                // Update the popup with the results
                const output = document.getElementById('output');
                const result = results[0].result;

                if (result && result.found) {
                    output.textContent = result.path; // Display the full path
                } else {
                    output.textContent = result.path; // Display the error or not found message
                }
            }
        );
    });
});
