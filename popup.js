document.addEventListener('DOMContentLoaded', () => {
    const resultsBody = document.getElementById('results-body');
    const noResults = document.getElementById('no-results');
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');

    // Function to load and display results from storage
    function loadResults() {
        chrome.storage.local.get('scrapedData', (result) => {
            resultsBody.innerHTML = ''; // Clear previous results
            const data = result.scrapedData;

            if (!data || Object.keys(data).length === 0) {
                noResults.style.display = 'block';
                document.getElementById('results-container').style.display = 'none';
            } else {
                noResults.style.display = 'none';
                document.getElementById('results-container').style.display = 'block';

                for (const profileUrl in data) {
                    const sourceUrl = data[profileUrl];
                    const row = createTableRow(profileUrl, sourceUrl);
                    resultsBody.appendChild(row);
                }
            }
        });
    }

    function createTableRow(profileUrl, sourceUrl) {
        const tr = document.createElement('tr');

        const profileTd = document.createElement('td');
        const profileLink = document.createElement('a');
        profileLink.href = profileUrl;
        profileLink.textContent = profileUrl;
        profileLink.target = '_blank';
        profileLink.title = profileUrl;
        profileTd.appendChild(profileLink);

        const sourceTd = document.createElement('td');
        const sourceLink = document.createElement('a');
        sourceLink.href = sourceUrl;
        sourceLink.textContent = sourceUrl;
        sourceLink.target = '_blank';
        sourceLink.title = sourceUrl;
        sourceTd.appendChild(sourceLink);

        tr.appendChild(profileTd);
        tr.appendChild(sourceTd);
        return tr;
    }

    // Event listener for the Export button
    exportBtn.addEventListener('click', () => {
        chrome.storage.local.get('scrapedData', (result) => {
            if (result.scrapedData) {
                const dataStr = JSON.stringify(result.scrapedData, null, 4);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                a.download = 'soscraper_export.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        });
    });

    // Event listener for the Clear button
    clearBtn.addEventListener('click', () => {
        // Ask for confirmation before clearing
        if (confirm("Are you sure you want to clear all collected profiles?")) {
            chrome.storage.local.clear(() => {
                console.log("soscraper: Storage cleared.");
                loadResults(); // Refresh the UI
            });
        }
    });

    // Listen for changes in storage and update the UI automatically
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.scrapedData) {
            loadResults();
        }
    });

    // Initial load of results when the popup is opened
    loadResults();
});
