const withBundleAnalyzer = require('@next/bundle-analyzer');
const {PHASE_PRODUCTION_BUILD} = require('next/constants');
const {Config} = require('next-recompose-plugins');

const config = new Config(async () => {
  return {
    reactStrictMode: true
  };
})
  .applyPlugin((phase, args, config) => {
    return withBundleAnalyzer({enabled: phase === PHASE_PRODUCTION_BUILD})(config);
  }, 'bundle-analyzer')
  .applyPlugin((phase, args, config) => {
    config.env = {
      foo: 'bar'
    };
    return config;
  }, 'dummy-plugin')
  .build();

module.exports = config;
