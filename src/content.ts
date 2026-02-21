// Content script that runs on web pages
console.log('Content script loaded');

// Listen for messages from the background script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in content script:', request);
  
  if (request.action === 'getPageInfo') {
    // Get information about the current page
    const pageInfo = {
      title: document.title,
      url: window.location.href,
      timestamp: Date.now()
    };
    sendResponse(pageInfo);
  }
  
  return true; // Keep the message channel open for async response
});

// Example: Add a small indicator to show the extension is active
const addIndicator = () => {
  const indicator = document.createElement('div');
  indicator.id = 'github-to-code-indicator';
  indicator.textContent = 'GitHub to Code Active';
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background-color: #4CAF50;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-family: Arial, sans-serif;
    font-size: 12px;
    z-index: 10000;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  `;
  
  document.body.appendChild(indicator);
  
  // Remove indicator after 3 seconds
  setTimeout(() => {
    indicator.remove();
  }, 3000);
};

// Check if extension is enabled before showing indicator
chrome.storage.sync.get(['enabled'], (result) => {
  if (result.enabled !== false) {
    // Only add indicator on certain domains (optional)
    if (window.location.hostname.includes('github.com')) {
      addIndicator();
    }
  }
});
