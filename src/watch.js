import { loadSession, saveSession } from './storage.js';
import { diffSessions } from './diff.js';

const DEFAULT_INTERVAL_MS = 60_000;

export function createWatcher(sessionName, captureFn, options = {}) {
  const interval = options.intervalMs ?? DEFAULT_INTERVAL_MS;
  let timer = null;
  let lastSession = null;
  let running = false;

  async function tick() {
    try {
      const current = await captureFn();
      if (lastSession) {
        const diff = diffSessions(lastSession, current);
        if (diff.added.length > 0 || diff.removed.length > 0) {
          await saveSession(sessionName, current);
          if (options.onChange) options.onChange(diff, current);
        }
      } else {
        await saveSession(sessionName, current);
      }
      lastSession = current;
    } catch (err) {
      if (options.onError) options.onError(err);
    }
  }

  return {
    async start() {
      if (running) return;
      running = true;
      try {
        lastSession = await loadSession(sessionName);
      } catch {
        lastSession = null;
      }
      await tick();
      timer = setInterval(tick, interval);
    },
    stop() {
      if (!running) return;
      running = false;
      clearInterval(timer);
      timer = null;
    },
    isRunning() {
      return running;
    },
    getLastSession() {
      return lastSession;
    },
  };
}

export function watcherStatus(watcher) {
  return {
    running: watcher.isRunning(),
    hasSession: watcher.getLastSession() !== null,
  };
}
