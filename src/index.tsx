import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './pages/App';

import './index.css';
import { GradebookProvider } from './contexts/GradebookContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <GradebookProvider config={{ storageType: 'local', prefix: 'gradebook' }}>
    <App />
  </GradebookProvider>
);
