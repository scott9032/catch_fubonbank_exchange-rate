import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("React 啟動序列開始...");

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("React 渲染指令已送出");
  } catch (err) {
    console.error("渲染過程出錯:", err);
    rootElement.innerHTML = `<div style="text-align:center;color:red;padding:20px;">渲染出錯，請檢查 Console。</div>`;
  }
} else {
  console.error("找不到 #root 節點");
}