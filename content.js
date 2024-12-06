// 初始化变量
let originalText = '';
let selectedText = ''; // 新增变量存储选中的文本
// 创建浮动面板
const panel = document.createElement('div');
panel.style.position = 'fixed';
panel.style.top = '0';
panel.style.right = '0';
panel.style.width = '300px';
panel.style.height = '100%';
panel.style.backgroundColor = 'white';
panel.style.borderLeft = '1px solid #ccc';
panel.style.zIndex = '10000';
panel.style.overflowY = 'auto';
panel.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
panel.style.padding = '10px';
panel.style.transition = 'width 0.3s, right 0.3s';
panel.innerHTML = `
  <h1>Text Modifier</h1>
  <button id="toggle-panel">隐藏面板</button>
  <button id="start-modification">开始修改</button>
  <p id="status-text"></p>
  <h2>原文:</h2>
  <div id="original-text" style="white-space: pre-wrap; word-wrap: break-word;"></div>
  <h2>修改后:</h2>
  <div id="modified-text" style="white-space: pre-wrap; word-wrap: break-word;"></div>
  <h2>文本差异:</h2>
  <div id="diff-container" style="white-space: pre-wrap; word-wrap: break-word;"></div>
  <h2>选择预制的提示:</h2>
  <select id="preset-prompts">
    <option value="latex">LaTeX 优化</option>
    <option value="grammar">语法检查</option>
    <option value="style">风格改进</option>
    <option value="custom">自定义</option>
  </select>
  <textarea id="custom-prompt" style="display: none; width: 100%; height: 100px;" placeholder="输入自定义提示"></textarea>
  <button id="confirm-modification" style="display: none;">确认修改</button>
  <button id="cancel-modification" style="display: none;">取消修改</button>
  <div id="resize-handle" style="width: 10px; height: 100%; background: #ccc; cursor: ew-resize; position: absolute; left: -10px; top: 0;"></div>
`;

// 将面板添加到页面
document.body.appendChild(panel);

// 创建悬浮球
const floatingBall = document.createElement('div');
floatingBall.style.position = 'fixed';
floatingBall.style.bottom = '20px';
floatingBall.style.right = '20px';
floatingBall.style.width = '50px';
floatingBall.style.height = '50px';
floatingBall.style.backgroundColor = '#007bff';
floatingBall.style.borderRadius = '50%';
floatingBall.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
floatingBall.style.display = 'none';
floatingBall.style.zIndex = '10001';
floatingBall.style.cursor = 'pointer';
floatingBall.innerText = '在这！';
floatingBall.style.color = 'white';
floatingBall.style.textAlign = 'center';
floatingBall.style.lineHeight = '50px';
document.body.appendChild(floatingBall);

// 添加悬浮球拖动功能
let isDragging = false;
let offsetX, offsetY;

floatingBall.addEventListener('mousedown', (e) => {
  isDragging = true;
  offsetX = e.clientX - floatingBall.getBoundingClientRect().left;
  offsetY = e.clientY - floatingBall.getBoundingClientRect().top;
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
});

function onMouseMove(e) {
  if (isDragging) {
    floatingBall.style.left = `${e.clientX - offsetX}px`;
    floatingBall.style.top = `${e.clientY - offsetY}px`;
  }
}

function onMouseUp(e) {
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
  if (isDragging) {
    isDragging = false;
    return;
  }
  // 只有在没有拖动的情况下才展开面板
  panel.style.right = '0px';
  document.getElementById('toggle-panel').innerText = '隐藏面板';
  floatingBall.style.display = 'none'; // 隐藏悬浮球
}

floatingBall.addEventListener('click', (e) => {
  if (!isDragging) {
    panel.style.right = '0px';
    document.getElementById('toggle-panel').innerText = '隐藏面板';
    floatingBall.style.display = 'none'; // 隐藏悬浮球
  }
});

// 确保面板在页面加载时隐藏
panel.style.right = `-${panel.offsetWidth}px`;
document.getElementById('toggle-panel').innerText = '显示面板';
floatingBall.style.display = 'block'; // 显示悬浮球

// 添加隐藏/显示面板的功能
document.getElementById('toggle-panel').addEventListener('click', () => {
  if (panel.style.right === '0px') {
    panel.style.right = `-${panel.offsetWidth}px`;
    document.getElementById('toggle-panel').innerText = '显示面板';
    floatingBall.style.display = 'block'; // 显示悬浮球
  } else {
    panel.style.right = '0px';
    document.getElementById('toggle-panel').innerText = '隐藏面板';
    floatingBall.style.display = 'none'; // 隐藏悬浮球
  }
});

// 添加悬浮球点击事件
floatingBall.addEventListener('click', () => {
  panel.style.right = '0px';
  document.getElementById('toggle-panel').innerText = '隐藏面板';
  floatingBall.style.display = 'none'; // 隐藏悬浮球
});

// 添加调整宽度的功能
const resizeHandle = document.getElementById('resize-handle');
resizeHandle.addEventListener('mousedown', (e) => {
  e.preventDefault();
  document.addEventListener('mousemove', resizePanel);
  document.addEventListener('mouseup', stopResize);
});

function resizePanel(e) {
  const newWidth = window.innerWidth - e.clientX;
  if (newWidth > 100 && newWidth < window.innerWidth) {
    panel.style.width = `${newWidth}px`;
  }
}

function stopResize() {
  document.removeEventListener('mousemove', resizePanel);
  document.removeEventListener('mouseup', stopResize);
}

let apiUrl = localStorage.getItem('apiUrl') || '';
let apiKey = localStorage.getItem('apiKey') || '';
let prompt = localStorage.getItem('prompt') || 'You are a LaTeX expert. Help optimize these LaTeX code. For titles and captions, check if their capitalization is consistent. For the main text, check grammar, correct incorrect sentences and incoherent sentences, unify punctuation marks, and maintain correct spacing. Do not output other content. Do not change sentences and references when there are no errors. Do not add new content.';
let model = localStorage.getItem('model') || 'deepseek-chat';

document.getElementById('start-modification').addEventListener('click', () => {
  const selection = window.getSelection();
  if (selection.rangeCount === 0 || selection.toString().trim() === '') {
    alert('请选中一些文本');
    return;
  }
  selectedText = selection.toString(); // 存储选中的文本
  originalText = selectedText;
  document.getElementById('status-text').innerText = '正在修改...';

  // 显示原文
  document.getElementById('original-text').innerText = originalText;

  // 发送修改请求
  sendModificationRequest(originalText);
});

// 发送修改请求
function sendModificationRequest(text) {
  // 清空修改后的文本和差异容器
  document.getElementById('modified-text').innerText = '';
  document.getElementById('diff-container').innerHTML = '';

  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: text },
      ],
      stream: false,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Forbidden');
      }
      return response.json();
    })
    .then((data) => {
      const modifiedText = data.choices[0].message.content;

      // 显示修改后的文本
      document.getElementById('modified-text').innerText = modifiedText;

      // 显示差异高亮的文本
      const diffHtml = generateDiffHtml(originalText, modifiedText);
      document.getElementById('diff-container').innerHTML = diffHtml;

      // 显示确认和取消按钮
      document.getElementById('confirm-modification').style.display = 'inline-block';
      document.getElementById('cancel-modification').style.display = 'inline-block';

      // 更新状态文本
      document.getElementById('status-text').innerText = '修改完成，是否应用修改？';

      // 添加确认和取消按钮的事件监听器
      document.getElementById('confirm-modification').addEventListener('click', () => {
        applyModification(modifiedText);
      });

      document.getElementById('cancel-modification').addEventListener('click', () => {
        cancelModification();
      });
    })
    .catch((error) => {
      console.error('Error:', error);
      document.getElementById('status-text').innerText = '修改失败';
    });
}

// 生成差异高亮的 HTML
function generateDiffHtml(originalText, modifiedText) {
  const diff = Diff.diffWordsWithSpace(originalText, modifiedText);
  const fragment = document.createDocumentFragment();

  diff.forEach((part) => {
    const color = part.added ? 'green' :
                  part.removed ? 'red' : 'black';
    const span = document.createElement('span');
    span.style.color = color;
    span.appendChild(document.createTextNode(part.value));
    fragment.appendChild(span);
  });

  const container = document.createElement('div');
  container.appendChild(fragment);
  return container.innerHTML;
}

// 应用修改
function applyModification(modifiedText) {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(modifiedText));
  }
  // 隐藏确认和取消按钮
  document.getElementById('confirm-modification').style.display = 'none';
  document.getElementById('cancel-modification').style.display = 'none';
  // 更新状态文本
  document.getElementById('status-text').innerText = '修改已应用';
}

// 取消修改
function cancelModification() {
  // 隐藏确认和取消按钮
  document.getElementById('confirm-modification').style.display = 'none';
  document.getElementById('cancel-modification').style.display = 'none';
  // 清空修改后的文本显示
  document.getElementById('modified-text').innerText = '';
  // 更新状态文本
  document.getElementById('status-text').innerText = '修改已取消';
}

document.getElementById('preset-prompts').addEventListener('change', (event) => {
  const selectedPrompt = event.target.value;
  const customPromptTextarea = document.getElementById('custom-prompt');
  if (selectedPrompt === 'custom') {
    customPromptTextarea.style.display = 'block';
    prompt = customPromptTextarea.value;
  } else {
    customPromptTextarea.style.display = 'none';
    switch (selectedPrompt) {
      case 'latex':
        prompt = 'You are a LaTeX expert. Help optimize these LaTeX code. For titles and captions, check if their capitalization is consistent. For the main text, check grammar, correct incorrect sentences and incoherent sentences, unify punctuation marks, and maintain correct spacing. Do not output other content. Do not change sentences and references when there are no errors. Do not add new content.';
        break;
      case 'grammar':
        prompt = 'You are a grammar expert and You are a LaTeX expert. Please check the selected text for grammatical errors and correct them. Do not change the meaning of the sentences.';
        break;
      case 'style':
        prompt = 'You are a style expert and You are a LaTeX expert. Please improve the style of the selected text, making it more readable and engaging. Do not change the meaning of the sentences.';
        break;
    }
  }
  localStorage.setItem('prompt', prompt);

  // 如果已经选中了文本，直接发送修改请求
  if (selectedText) {
    sendModificationRequest(selectedText);
  }
});

document.getElementById('custom-prompt').addEventListener('input', (event) => {
  prompt = event.target.value;
  localStorage.setItem('prompt', prompt);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateStatus') {
    document.getElementById('status-text').innerText = message.status;
    if (message.status === '修改完成') {
      document.getElementById('apply-modification').style.display = 'block';
    }
  }
  if (message.action === 'modifyText') {
    const { apiUrl, apiKey, prompt, model } = message;
    modifySelectedText(apiUrl, apiKey, prompt, model);
  }
  if (message.action === 'updateSettings') {
    apiUrl = message.apiUrl;
    apiKey = message.apiKey;
    prompt = message.prompt;
    model = message.model;

    // 保存到localStorage
    localStorage.setItem('apiUrl', apiUrl);
    localStorage.setItem('apiKey', apiKey);
    localStorage.setItem('prompt', prompt);
    localStorage.setItem('model', model);

    const presetPrompts = document.getElementById('preset-prompts');
    if (presetPrompts) {
      presetPrompts.value = Object.keys(presetPrompts.options).find(key => presetPrompts.options[key].text === prompt) || 'latex';
      if (presetPrompts.value === 'custom') {
        document.getElementById('custom-prompt').style.display = 'block';
        document.getElementById('custom-prompt').value = prompt;
      } else {
        document.getElementById('custom-prompt').style.display = 'none';
      }
    }
  }
});

function modifySelectedText(apiUrl, apiKey, prompt, model) {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const originalText = range.toString();
    console.log('Sending request to API...');
    const startTime = Date.now();

    // 清空修改后的文本和差异容器
    document.getElementById('modified-text').innerText = '';
    document.getElementById('diff-container').innerHTML = '';

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: originalText },
        ],
        stream: false,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Forbidden');
        }
        return response.json();
      })
      .then((data) => {
        const endTime = Date.now();
        console.log(`Received response in ${endTime - startTime} ms`);
        const modifiedText = data.choices[0].message.content;
        handleModificationResult(modifiedText);
      })
      .catch((error) => {
        console.error('Error:', error);
        document.getElementById('status-text').innerText = '';
      });
  } else {
    alert('请选中一些文本');
  }
}

function handleModificationResult(modifiedText) {
  // 显示差异高亮的原文
  document.getElementById('original-text').innerHTML = generateDiffHtml(originalText, modifiedText);
  // 显示修改后的文本
  document.getElementById('modified-text').innerText = modifiedText;

  // 更新状态文本
  document.getElementById('status-text').innerText = '��改完成，是否应用修改？';

  // 显示确认和取消按钮
  document.getElementById('confirm-modification').style.display = 'inline-block';
  document.getElementById('cancel-modification').style.display = 'inline-block';
}

function generateDiffHtml(originalText, modifiedText) {
  const diff = Diff.diffWordsWithSpace(originalText, modifiedText);
  let diffHtml = '';
  diff.forEach((part) => {
    if (part.added) {
      // 新增的文本，显示为绿色
      diffHtml += `<span style="color: green;">${part.value}</span>`;
    } else if (part.removed) {
      // 删除的文本，显示为红色并添加删除线
      diffHtml += `<span style="color: red; text-decoration: line-through;">${part.value}</span>`;
    } else {
      // 未修改的文本，正常显示
      diffHtml += `<span>${part.value}</span>`;
    }
  });
  return diffHtml;
}