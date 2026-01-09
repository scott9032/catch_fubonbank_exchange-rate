import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("React 啟動序列開始...");

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("找不到 #root 節點，請檢查 index.html 是否正確。");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log("React 渲染指令已發送。");