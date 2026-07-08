import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { App } from './App.tsx';
import 'katex/dist/katex.min.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<App />);
}
