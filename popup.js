document.addEventListener('DOMContentLoaded', () => {
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript(
            {
                target: { tabId: tabs[0].id },
                func: () => {
                    // Function to find the full path of parent box names with semester and course info
                    function findFullPathWithCourseInfo() {
                        const iframe = document.querySelector('iframe'); // Assuming there's only one iframe
                        if (!iframe) {
                            return { found: false, path: 'No iframe found.' };
                        }

                        try {
                            // Get the semester and course title
                            const courseLink = document.querySelector('a.d2l-navigation-s-link');
                            if (!courseLink) {
                                return { found: false, path: 'Course link not found.' };
                            }

                            const courseTitle = courseLink.title || courseLink.textContent.trim();
                            const [semesterYear, ...titleParts] = courseTitle.split(' - ');
                            const courseName = titleParts.join(' - '); // Combine back after the first hyphen

                            // Map semester to short form (F, W, S) and extract last 2 digits of the year
                            const semesterMap = { Fall: 'F', Winter: 'W', Summer: 'S' };
                            const semesterMatch = semesterYear.match(/(Fall|Winter|Summer)\s(\d{4})/);
                            if (!semesterMatch) {
                                return { found: false, path: 'Semester and year format invalid.' };
                            }
                            const semester = semesterMap[semesterMatch[1]] || 'X'; // Default to 'X' if not matched
                            const year = semesterMatch[2].slice(-2); // Last 2 digits of the year
                            const semesterYearAbbreviation = `${semester}${year}`;

                            // Collect the path of parent boxes
                            const names = [];
                            const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
                            const selectedElement = iframeDocument.querySelector('.selected');
                            if (!selectedElement) {
                                return { found: false, path: 'No selected element found.' };
                            }

                            let currentElement = selectedElement;

                            while (currentElement) {
                                if (currentElement.matches('span')) {
                                    const parentBox = currentElement.parentElement.querySelector('.unit-box, .lesson-box');
                                    if (parentBox) {
                                        const nameElement = parentBox.querySelector('.title-text span'); // Adjust selector as needed
                                        const name = nameElement ? nameElement.textContent.trim() : 'Name not found';
                                        names.push(name);

                                        if (parentBox.classList.contains('unit-box')) {
                                            break;
                                        }

                                        currentElement = parentBox;
                                    } else {
                                        names.push('Parent box not found.');
                                        break;
                                    }
                                } else {
                                    currentElement = currentElement.parentElement;
                                }
                            }

                            // Reverse the path and prepend semester/year and course name
                            const reversedPath = names.reverse().join('/');
                            const fullPath = `${semesterYearAbbreviation}/${courseName}/${reversedPath}`;
                            return { found: true, path: fullPath };
                        } catch (error) {
                            console.warn('Error occurred:', error);
                            return { found: false, path: 'An error occurred while processing.' };
                        }
                    }

                    // Run the search and return the result
                    return findFullPathWithCourseInfo();
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
