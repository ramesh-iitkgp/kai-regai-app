/**
 * Kai RegAI — Client Entry Point
 */

import './styles/tokens.css';
import './styles/components.css';
import { App } from './app.js';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('app-root');
  if (root) {
    const app = new App(root);
    app.mount();
  }
});
