/**
 * @typedef ExceptionsMap
 * @type {object}
 * @property {string[]} minor
 * @property {string[]} patch
 */

/**
 * @type {ExceptionsMap}
 */
const exceptions = {
  minor: [
    '@types/node',
    'next',
    '@next/bundle-analyzer',
    'react',
    'react-dom',
    '@types/react',
    '@types/react-dom'
  ],
  patch: [],
};

/**
 * @type {import('npm-check-updates').RunOptions}
 */
const config = {
  packageManager: 'yarn',
  deep: true,
  target: (packageName, _versionRange) => {
    if (exceptions.minor.includes(packageName))
      return 'minor';

    if (exceptions.patch.includes(packageName))
      return 'patch';

    return 'latest';
  },
};

module.exports = config;
