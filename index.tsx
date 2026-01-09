import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("DOM 載入完成，開始初始化 React...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("找不到渲染節點 #root");
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("React 渲染指令已發送");
}