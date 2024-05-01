import {createRequire} from 'node:module';

function getContextualRequire(): NodeRequire {
  if (typeof import.meta !== 'undefined') {
    return createRequire(import.meta.url);
  } else {
    return require;
  }
}

export const contextualRequire: NodeRequire = getContextualRequire();
