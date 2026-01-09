import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("React 腳本啟動，檢查渲染環境...");

const init = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("錯誤：找不到渲染目標 #root");
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("React 渲染完成");
  } catch (error) {
    console.error("React 渲染失敗:", error);
  }
};

// 確保 DOM 載入後再執行渲染
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}