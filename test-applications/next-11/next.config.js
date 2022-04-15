const bundleAnalyzer = require('@next/bundle-analyzer');
const {PHASE_PRODUCTION_BUILD} = require('next/constants');
const {ConfigBuilder} = require('next-recompose-plugins');

module.exports = ConfigBuilder.defineConfig((phase, args) => {
  return {
    ...args.defaultConfig,
    reactStrictMode: true,
    experimental: {},
  };
})
  .applyPlugin((phase, args, config) => {
    return bundleAnalyzer({enabled: phase === PHASE_PRODUCTION_BUILD})(config);
  }, 'bundleAnalyzer')
  .build();
