// Popup script
document.addEventListener('DOMContentLoaded', () => {
  const actionBtn = document.getElementById('actionBtn') as HTMLButtonElement;
  const messageDiv = document.getElementById('message') as HTMLDivElement;
  const statusDiv = document.getElementById('status') as HTMLDivElement;

  // Load and display current status
  chrome.storage.sync.get(['enabled', 'timestamp'], (result) => {
    if (result.enabled !== false) {
      statusDiv.textContent = 'Extension is active';
      statusDiv.style.backgroundColor = '#d4edda';
      statusDiv.style.color = '#155724';
    } else {
      statusDiv.textContent = 'Extension is inactive';
      statusDiv.style.backgroundColor = '#f8d7da';
      statusDiv.style.color = '#721c24';
    }
  });

  // Handle button click
  actionBtn.addEventListener('click', async () => {
    try {
      // Get the current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.id) {
        throw new Error('No active tab found');
      }

      // Send message to content script
      chrome.tabs.sendMessage(tab.id, { action: 'getPageInfo' }, (response) => {
        if (chrome.runtime.lastError) {
          showMessage('Error: ' + chrome.runtime.lastError.message, 'error');
          return;
        }
        
        if (response) {
          showMessage(`Page: ${response.title}`, 'success');
          console.log('Page info:', response);
        }
      });

      // Send message to background script
      chrome.runtime.sendMessage({ action: 'performAction' }, (response) => {
        if (response && response.success) {
          console.log('Background action completed:', response.message);
        }
      });

    } catch (error) {
      console.error('Error:', error);
      showMessage('Error: ' + (error as Error).message, 'error');
    }
  });

  // Helper function to show messages
  function showMessage(text: string, type: 'success' | 'error') {
    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 5000);
  }
});
