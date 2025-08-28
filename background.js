console.log("soscraper v2.2: Background service worker started.");

// Use webNavigation.onCompleted for more reliable script injection
chrome.webNavigation.onCompleted.addListener((details) => {
    // Inject script only into the main frame of a page
    if (details.frameId === 0 && details.url && (details.url.startsWith('http') || details.url.startsWith('https'))) {
        console.log(`soscraper: Page loaded, injecting script into ${details.url}`);
        chrome.scripting.executeScript({
            target: { tabId: details.tabId },
            files: ['scraping.js']
        }).catch(err => console.error("soscraper: Failed to inject script:", err));
    }
}, {
    url: [{ schemes: ['http', 'https'] }]
});

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SCRAPE_RESULTS' && sender.tab) {
        const sourceUrl = sender.tab.url;
        const foundLinks = message.links;

        if (foundLinks.length > 0) {
            console.log(`soscraper: Received ${foundLinks.length} links from ${sourceUrl}`);
            // Retrieve existing data, update it, and save it back
            chrome.storage.local.get('scrapedData', (result) => {
                let data = result.scrapedData || {};
                let updated = false;
                foundLinks.forEach(link => {
                    // Add link only if it's not already in the data
                    if (!data[link]) {
                        data[link] = sourceUrl;
                        updated = true;
                    }
                });

                if (updated) {
                    chrome.storage.local.set({ scrapedData: data }, () => {
                        console.log("soscraper: Storage updated with new links.");
                    });
                }
            });
        }
        // Return true to indicate you wish to send a response asynchronously
        return true;
    }
});
