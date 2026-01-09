import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("React 應用程式正在啟動...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("找不到 root 節點");
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);