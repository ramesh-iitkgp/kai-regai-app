/**
 * Kai RegAI — Client Router & State-Preserving Navigation Manager
 * Source of truth: docs/p2/NAVIGATION_ARCHITECTURE.md
 */

import { ROUTES } from './routes.js';

class Router {
  constructor() {
    this.currentRoute = ROUTES.HOME;
    this.routeParams = {};
    this.listeners = [];
    this.historyStack = [ROUTES.HOME];
    this.activeModal = null;

    // Preserved tab state caches
    this.preservedState = {
      detailedReportTab: 'OVERVIEW',
      detailedReportLine: 'LIFE',
      detailedReportFeature: 'MOUNTS',
      learnCategory: 'lines',
      readingsFilter: 'ALL'
    };

    window.addEventListener('hashchange', () => this.handleHashChange());
  }

  init() {
    if (!window.location.hash) {
      window.location.hash = `#${ROUTES.HOME}`;
    } else {
      this.handleHashChange();
    }
  }

  handleHashChange() {
    const rawHash = window.location.hash.replace(/^#\/?/, '') || ROUTES.HOME;
    const [path, queryString] = rawHash.split('?');
    
    // Parse query params
    const params = {};
    if (queryString) {
      new URLSearchParams(queryString).forEach((val, key) => {
        params[key] = val;
      });
    }

    this.currentRoute = path;
    this.routeParams = params;
    this.notify();
  }

  navigate(route, params = {}) {
    const queryString = Object.keys(params).length 
      ? '?' + new URLSearchParams(params).toString() 
      : '';
    window.location.hash = `#${route}${queryString}`;
  }

  openModal(modalId, payload = null) {
    this.activeModal = { id: modalId, payload };
    this.notify();
  }

  closeModal() {
    this.activeModal = null;
    this.notify();
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach(cb => cb(this.currentRoute, this.routeParams, this.activeModal));
  }
}

export const router = new Router();
