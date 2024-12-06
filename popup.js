document.addEventListener('DOMContentLoaded', () => {
  const apiUrlInput = document.getElementById('api-url');
  const apiKeyInput = document.getElementById('api-key');
  const promptInput = document.getElementById('prompt');
  const modelInput = document.getElementById('model');
  const saveSettingsButton = document.getElementById('save-settings');
  const statusText = document.getElementById('status-text');

  if (apiUrlInput && apiKeyInput && promptInput && modelInput && saveSettingsButton && statusText) {
    // 从 localStorage 中读取并填充输入框
    apiUrlInput.value = localStorage.getItem('apiUrl') || '';
    apiKeyInput.value = localStorage.getItem('apiKey') || '';
    promptInput.value = localStorage.getItem('prompt') || '';
    modelInput.value = localStorage.getItem('model') || 'deepseek-chat';

    saveSettingsButton.addEventListener('click', () => {
      const apiUrl = apiUrlInput.value;
      const apiKey = apiKeyInput.value;
      const prompt = promptInput.value;
      const model = modelInput.value;

      if (!apiUrl || !apiKey || !model) {
        alert('请填写API URL、API Key和Model');
        return;
      }

      // 将输入的值保存到 localStorage
      localStorage.setItem('apiUrl', apiUrl);
      localStorage.setItem('apiKey', apiKey);
      localStorage.setItem('prompt', prompt);
      localStorage.setItem('model', model);

      // 更新状态文本
      statusText.innerText = '设置已保存';

      // 发送设置到content脚本
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'updateSettings',
          apiUrl: apiUrl,
          apiKey: apiKey,
          prompt: prompt,
          model: model
        });
      });
    });
  } else {
    console.error('无法找到所需的DOM元素');
  }
});