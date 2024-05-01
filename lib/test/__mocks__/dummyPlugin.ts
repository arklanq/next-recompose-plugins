import {NextConfig} from 'next';
import {NextPlugin} from '../../src/NextPlugin.js';

export const dummyPlugin: NextPlugin<[{property: string}]> = function dummyPlugin(
  nextConfig: NextConfig,
  options: {property: string}
): NextConfig {
  Object.defineProperty(nextConfig, options.property, {value: true, enumerable: true});
  return nextConfig;
};
