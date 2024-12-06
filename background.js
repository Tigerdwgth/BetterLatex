chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateStatus') {
    // 处理消息，例如记录状态
    console.log('状态更新：', message.status);
  }
  if (message.action === 'modifyText') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, message);
      } else {
        console.error('无法找到活动的选项卡');
      }
    });
  }
  if (message.action === 'startModification') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'startModification' });
      } else {
        console.error('无法找到活动的选项卡');
      }
    });
  }
  if (message.action === 'applyModification') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'applyModification' });
      } else {
        console.error('无法找到活动的选项卡');
      }
    });
  }
});