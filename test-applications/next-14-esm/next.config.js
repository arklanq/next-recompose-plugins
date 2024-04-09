import {Config} from 'next-recompose-plugins';
import {PHASE_PRODUCTION_BUILD} from 'next/constants.js';
import withBundleAnalyzer from '@next/bundle-analyzer';

const config = new Config(async () => {
  return {
    reactStrictMode: true,
    eslint: {
      ignoreDuringBuilds: true,
    },
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

export default config;
