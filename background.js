const SOCIAL_PATTERNS = [
  {name: 'facebook', re: /facebook\.com\/[a-zA-Z0-9_@-]{1,30}/g},
  {name: 'twitter', re: /twitter\.com\/[a-zA-Z0-9_@-]{1,30}/g},
  {name: 'instagram', re: /instagram\.com\/[a-zA-Z0-9_@-]{1,30}/g},
  {name: 'linkedin-in', re: /linkedin\.com\/in\/[a-zA-Z0-9_@-]{1,30}/g},
  {name: 'linkedin-company', re: /linkedin\.com\/company\/[a-zA-Z0-9_@-]{1,30}/g},
  {name: 'youtube', re: /youtube\.com\/@[a-zA-Z0-9_\-]{1,30}/g},
  {name: 'tme', re: /t\.me\/[a-zA-Z0-9_@-]{1,30}/g},
  {name: 'github', re: /github\.com\/[a-zA-Z0-9_@-]{1,30}/g}
];

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && /^https?:\/\//.test(tab.url)) {
    const sourceUrl = tab.url;
    chrome.scripting.executeScript({
      target: {tabId},
      func: () => document.documentElement.outerHTML
    }, (results) => {
      if (!results || !results[0] || !results[0].result) return;
      const html = results[0].result;
      let found = [];
      for (const {re} of SOCIAL_PATTERNS) {
        let matches = html.match(re) || [];
        for (const handle of matches) {
          found.push({ handle, sourceUrl });
        }
      }
      chrome.storage.local.get({socials: []}, (data) => {
        const socials = Array.isArray(data.socials) ? data.socials : [];
        for (const item of found) {
          if (!socials.some(s => s.handle === item.handle && s.sourceUrl === item.sourceUrl)) {
            socials.push(item);
          }
        }
        chrome.storage.local.set({socials});
      });
    });
  }
});

