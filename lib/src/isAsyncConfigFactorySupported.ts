import semver from 'semver';

export function isAsyncConfigFactorySupported() {
  const nextJsModulePath = require.resolve('next/package.json', {paths: [process.cwd()]});

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nextJsPkg = require(nextJsModulePath) as {version: string};
  const nextJsVersion: string = nextJsPkg.version;

  return semver.gte(nextJsVersion, '12.1.0');
}
