// Modern popup.js for soscrapper with icons, username, and source URL per row
const ICONS = {
  'facebook.com': 'icons/facebook.svg',
  'twitter.com': 'icons/twitter.svg',
  'instagram.com': 'icons/instagram.svg',
  'linkedin.com': 'icons/linkedin.svg',
  'youtube.com': 'icons/youtube.svg',
  't.me': 'icons/telegram.svg',
  'github.com': 'icons/github.svg',
  'default': 'icons/link.svg'
};

function parseSocialUrl(url) {
  const match = url.match(/([a-zA-Z0-9.-]+\.[a-z]{2,})(?:\/(.+))?$/);
  if (!match) return {platform: url, username: ''};
  return {platform: match[1], username: match[2] || ''};
}

function getIcon(platform) {
  return ICONS[platform] || ICONS['default'];
}

function shortenUrl(url) {
  try {
    const u = new URL(url);
    let short = u.hostname;
    if (u.pathname && u.pathname.length > 1) {
      short += u.pathname.substring(0, 20);
      if (u.pathname.length > 20) short += '…';
    }
    if (short.length > 30) short = short.slice(0, 30) + '…';
    return short;
  } catch {
    return url.length > 30 ? url.slice(0, 27) + '…' : url;
  }
}

function renderTable(socials) {
  const table = document.getElementById('results-table');
  const noData = document.getElementById('no-data');
  table.innerHTML = '';
  if (!Array.isArray(socials) || socials.length === 0) {
    noData.style.display = '';
    return;
  }
  noData.style.display = 'none';
  const seen = new Set();
  for (const item of socials) {
    const { handle, sourceUrl } = item;
    const { platform, username } = parseSocialUrl(handle);
    const key = username + '|' + sourceUrl;
    if (seen.has(key)) continue;
    seen.add(key);
    const tr = document.createElement('tr');
    const td1 = document.createElement('td');
    td1.className = 'icon-cell';
    const icon = document.createElement('img');
    icon.className = 'icon';
    icon.src = getIcon(platform);
    icon.alt = platform;
    td1.appendChild(icon);
    const td2 = document.createElement('td');
    td2.className = 'username';
    const a = document.createElement('a');
    a.href = 'https://' + handle;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = username;
    a.style.color = '#e74c3c';
    a.style.textDecoration = 'none';
    a.onmouseover = () => a.style.textDecoration = 'underline';
    a.onmouseout = () => a.style.textDecoration = 'none';
    td2.title = username;
    td2.appendChild(a);
    const td3 = document.createElement('td');
    td3.className = 'source-url';
    td3.title = sourceUrl;
    td3.textContent = shortenUrl(sourceUrl);
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    table.appendChild(tr);
  }
}

function getTableText(socials) {
  if (!Array.isArray(socials)) return '';
  let lines = [];
  const seen = new Set();
  for (const item of socials) {
    const { handle, sourceUrl } = item;
    const { platform, username } = parseSocialUrl(handle);
    const key = username + '|' + sourceUrl;
    if (seen.has(key)) continue;
    seen.add(key);
    lines.push(`${platform}\t${username}\t${sourceUrl}`);
  }
  return lines.join('\n');
}

function updateResults() {
  chrome.storage.local.get({socials: []}, (data) => {
    renderTable(data.socials);
    window._soscrapperCopyText = getTableText(data.socials);
  });
}

document.getElementById('delete').onclick = function() {
  chrome.storage.local.set({socials: []}, () => {
    updateResults();
  });
};

document.getElementById('copy').onclick = function() {
  if (window._soscrapperCopyText) {
    navigator.clipboard.writeText(window._soscrapperCopyText);
    document.getElementById('copy').textContent = 'Copied!';
    setTimeout(() => {
      document.getElementById('copy').textContent = 'Copy';
    }, 1200);
  }
};

updateResults(); 