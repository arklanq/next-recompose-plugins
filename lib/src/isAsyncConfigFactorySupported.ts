import semver from 'semver';
import {contextualRequire} from './contextualRequire.js';

export function isAsyncConfigFactorySupported() {
  const nextJsModulePath = contextualRequire.resolve('next/package.json', {paths: [process.cwd()]});
  const nextJsPkg = contextualRequire(nextJsModulePath) as {version: string};
  const nextJsVersion: string = nextJsPkg.version;

  return semver.gte(nextJsVersion, '12.1.0');
}
