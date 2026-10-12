/**
 * Kai RegAI — Client Entry Point
 */

import './styles/tokens.css';
import './styles/components.css';
import { App } from './app.js';

function initApp() {
  const root = document.getElementById('app-root');
  if (root && !root.dataset.kaiMounted) {
    root.dataset.kaiMounted = 'true';
    const app = new App(root);
    app.mount();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
