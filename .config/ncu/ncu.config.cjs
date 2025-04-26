/**
 * @typedef ExceptionsMap
 * @type {object}
 * @property {string[]} major
 * @property {string[]} minor
 * @property {string[]} patch
 */

const filters = [
  {
    packageName: '@types/react',
    process: (versionRange) => {
      return !(versionRange.length === 1 && versionRange[0].semver === '17.0.47');
    }
  }
];

/**
 * @type {ExceptionsMap}
 */
const exceptions = {
  patch: [],
  minor: ['@types/node', 'next', '@next/bundle-analyzer', 'react', 'react-dom', '@types/react', '@types/react-dom'],
  major: []
};

/**
 * @type {import('npm-check-updates').RunOptions}
 */
const config = {
  packageManager: 'yarn',
  deep: true,
  filterResults(packageName, {currentVersionSemver}) {
    const filter = filters.find((handler) => handler.packageName === packageName);

    if (filter) return filter.process(currentVersionSemver);

    return true;
  },
  target(packageName, _semver) {
    const severties = ['patch', 'minor', 'major'];

    for (const severity of severties) {
      if (exceptions[severity].includes(packageName)) return severity;
    }

    return 'latest';
  }
};

module.exports = config;
