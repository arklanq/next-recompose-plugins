// const bundleAnalyzer = require('@next/bundle-analyzer');
// const {PHASE_PRODUCTION_BUILD} = require('next/constants');
const {ConfigBuilder} = require('next-recompose-plugins');

module.exports = ConfigBuilder.defineConfig(async (phase, args) => {
  return {
    ...args.defaultConfig,
    reactStrictMode: true,
    experimental: {},
  };
})
  .applyPlugin(async (phase, args, config) => {
    console.log('dummyPlugin 1');
    Object.defineProperty(config, '__dummyPlugin1', {value: true});
    return config;
  }, 'dummyPlugin 1')
  .applyPlugin(async (phase, args, config) => {
    console.log('dummyPlugin 2');
    Object.defineProperty(config, '__dummyPlugin2', {value: true});
    return config;
  }, 'dummyPlugin 2')
  .applyPlugin(async (phase, args, config) => {
    console.log('dummyPlugin 3');
    Object.defineProperty(config, '__dummyPlugin3', {value: true});
    return config;
  }, 'dummyPlugin 3')
  .build();
