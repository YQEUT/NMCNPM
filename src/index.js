import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';

console.log('React app index.js is loading...');
const root = ReactDOM.createRoot(document.getElementById('root'));
console.log('Root created:', root);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
console.log('App rendered to root');

