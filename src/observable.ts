let temporaryDependencies = [];
const dependentComputationsByProp: Record<string, Set<Function>> = {};

// const KEY = Symbol();
const KEY = '__observable__';

const createWatcher = obj => {
  const observers = [];

  const computationsByProp: Record<string, Set<Function>> = {};

  return {
    subscribe(key, computation) {
      if (!computationsByProp[key]) {
        computationsByProp[key] = new Set();
      }

      computationsByProp[key].add(computation);
    },
    unsubscribe(key, computation) {
      computationsByProp[key].delete(computation);

      if (computationsByProp[key].size < 1) {
        delete computationsByProp[key];
      }
    },
    notify(key) {
      if (computationsByProp[key]) {
        for (const fn of computationsByProp[key]) {
          fn();
        }
      }
    },
  };
};

export const observable = target => {
  const watcher = createWatcher(target);

  target[KEY] = watcher;

  return new Proxy(target, {
    get(obj, prop) {
      temporaryDependencies.push({ obj, prop });
      return obj[prop];
    },
    set(obj, prop: string, value) {
      obj[prop] = value;

      watcher.notify(prop);

      return true;
    },
  });
};

export const autorun = fn => {
  // ensure that function only called once per event loop
  // TODO: refactor this to call this function most once per animation loop or every task (queueMicrotask)
  let timeout = null;
  function wrapper() {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(fn);
  }

  temporaryDependencies = [];
  fn();
  const dependencies = temporaryDependencies;

  dependencies.forEach(({ obj, prop }) => {
    obj[KEY].subscribe(prop, wrapper);
  });

  function cleanup() {
    dependencies.forEach(({ obj, prop }) => {
      obj[KEY].unsubscribe(prop, wrapper);
    });
  }

  return cleanup;
};
