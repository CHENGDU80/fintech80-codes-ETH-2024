import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { CsvProvider } from './context/CsvContext';
import { ResProvider } from './context/resultContext';
import { ClaimantsProvider } from './context/ClaimantsContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ClaimantsProvider>
    <ResProvider>
      <CsvProvider>
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </CsvProvider>
    </ResProvider>
  </ClaimantsProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
