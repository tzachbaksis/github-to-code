// Background service worker for Chrome Extension
console.log('Background service worker started');

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details.reason);
  
  if (details.reason === 'install') {
    // Set default storage values on install
    chrome.storage.sync.set({
      enabled: true,
      timestamp: Date.now()
    });
  }
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in background:', request);
  
  if (request.action === 'performAction') {
    // Perform some action
    console.log('Performing action from background');
    sendResponse({ success: true, message: 'Action completed successfully' });
  }
  
  return true; // Keep the message channel open for async response
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('Tab updated:', tab.url);
  }
});
