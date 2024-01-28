import {jest} from '@jest/globals';
import {NextConfig} from 'next';
import {PHASE_DEVELOPMENT_SERVER} from 'next/constants';
import isPromise from 'is-promise';
import {Config} from '../src/Config.js';
import {ConfigFactoryArguments, ConfigurationPhase, NextConfigFactory} from '../src/NextConfigDeclaration.js';
import {dummyPlugin} from './__mocks__/dummyPlugin.js';

describe('`Config` class', () => {
  describe('constructor', () => {
    test('returns `Config` instance.', () => {
      const config: Config = new Config({});
      expect(config).toBeInstanceOf(Config);
    });

    test("doesn't allow to use async function when next <12.1", async () => {
      await jest.isolateModulesAsync(async () => {
        jest.mock('next/package.json', () => ({version: '12.0.0'}));

        const freshModule = await import('../src/Config');
        const Config = freshModule.Config;
        const config: Config = new Config(() => Promise.resolve({}));

        expect(() => {
          // Error is actually thrown on `build()` method invocation
          void config.build()(PHASE_DEVELOPMENT_SERVER, {defaultConfig: {}});
        }).toThrow('Config factory function cannot return `Promise`. This feature is supported only in Next.js 12.1+.');
      });
    });

    test('allow to use async function when next >=12.1', async () => {
      await jest.isolateModulesAsync(async () => {
        jest.mock('next/package.json', () => ({version: '12.1.0'}));

        const freshModule = await import('../src/Config');
        const Config = freshModule.Config;
        const configBuilder: Config = new Config(() => Promise.resolve({}));

        expect(() => {
          // Error is actually thrown on `build()` method invocation
          void configBuilder.build()(PHASE_DEVELOPMENT_SERVER, {defaultConfig: {}});
        }).not.toThrow();
      });
    });
  });

  describe('`applyPlugin` method', () => {
    let config: Config;

    beforeEach(() => {
      config = new Config({});
    });

    test('returns `ConfigBuilder` instance.', () => {
      expect(
        config.applyPlugin((_phase: ConfigurationPhase, _args: ConfigFactoryArguments, config: NextConfig) =>
          dummyPlugin(config, {property: '__dummyPlugin'})
        )
      ).toBeInstanceOf(Config);
    });

    test("doesn't allow to use async function when next <12.1", async () => {
      await jest.isolateModulesAsync(async () => {
        jest.mock('next/package.json', () => ({version: '12.0.0'}));

        const freshModule = await import('../src/Config');
        const Config = freshModule.Config;

        const configBuilder: Config = new Config({}).applyPlugin(
          (_phase: ConfigurationPhase, _args: ConfigFactoryArguments, config: NextConfig) =>
            Promise.resolve(dummyPlugin(config, {property: '__dummyPlugin'}))
        );

        expect(() => {
          // Error is actually thrown on `build()` method invocation
          void configBuilder.build()(PHASE_DEVELOPMENT_SERVER, {defaultConfig: {}});
        }).toThrow('Plugin factory function cannot return `Promise`. This feature is supported only in Next.js 12.1+.');
      });
    });

    test('allow to use async function when next >=12.1', async () => {
      await jest.isolateModulesAsync(async () => {
        jest.mock('next/package.json', () => ({version: '12.1.0'}));

        const freshModule = await import('../src/Config');
        const Config = freshModule.Config;

        const configBuilder: Config = new Config({}).applyPlugin(
          (_phase: ConfigurationPhase, _args: ConfigFactoryArguments, config: NextConfig) =>
            Promise.resolve(dummyPlugin(config, {property: '__dummyPlugin'}))
        );

        expect(() => {
          // Error is actually thrown on `build()` method invocation
          void configBuilder.build()(PHASE_DEVELOPMENT_SERVER, {defaultConfig: {}});
        }).not.toThrow();
      });
    });
  });

  describe('`build` method', () => {
    test('if next.js <12.1.0 returns synchronous function', async () => {
      await jest.isolateModulesAsync(async () => {
        jest.mock('next/package.json', () => ({version: '12.0.0'}));

        const freshModule = await import('../src/Config');
        const Config = freshModule.Config;

        const config: Config = new Config({});
        const configFactory: NextConfigFactory = config.build();

        expect(configFactory).toBeInstanceOf(Function);

        const configObject: NextConfig = configFactory(PHASE_DEVELOPMENT_SERVER, {defaultConfig: {}}) as NextConfig;

        expect(isPromise(configObject)).toBe(false);
      });
    });

    test('if next.js <12.1.0 returns asynchronous function', async () => {
      await jest.isolateModulesAsync(async () => {
        jest.mock('next/package.json', () => ({version: '12.1.0'}));

        const freshModule = await import('../src/Config');
        const Config = freshModule.Config;

        const configBuilder: Config = new Config({});
        const configFactory: NextConfigFactory = configBuilder.build();

        expect(configFactory).toBeInstanceOf(Function);

        const promise: Promise<NextConfig> = configFactory(PHASE_DEVELOPMENT_SERVER, {
          defaultConfig: {},
        }) as Promise<NextConfig>;

        expect(isPromise(promise)).toBe(true);
      });
    });

    describe('returns function that returns/resolves to:', () => {
      test('NextConfig object with initital config options merged', async () => {
        const configFactory: NextConfigFactory = new Config({optimizeFonts: false}).build();

        const maybePromise: NextConfig | Promise<NextConfig> = configFactory(PHASE_DEVELOPMENT_SERVER, {
          defaultConfig: {},
        });
        const nextConfig: NextConfig = isPromise(maybePromise) ? await maybePromise : maybePromise;

        expect(nextConfig).toMatchObject({
          optimizeFonts: expect.any(Boolean), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        });

        expect(nextConfig.optimizeFonts).toBe(false);
      });

      for (let n = 1; n <= 3; n++) {
        test(`creates NextConfig object with changes correctly applied by ${n} plugins`, async () => {
          const config: Config = new Config({});

          for (let i = 1; i <= n; i++) {
            config.applyPlugin((_phase: ConfigurationPhase, _args: ConfigFactoryArguments, config: NextConfig) => {
              return dummyPlugin(config, {property: `__dummyPlugin${i}`});
            });
          }

          const configFactory: NextConfigFactory = config.build();

          const maybePromise: NextConfig | Promise<NextConfig> = configFactory(PHASE_DEVELOPMENT_SERVER, {
            defaultConfig: {},
          });
          const nextConfig: NextConfig = isPromise(maybePromise) ? await maybePromise : maybePromise;

          const expectedObject: Record<string, unknown> = {};

          for (let i = 1; i <= n; i++) {
            expectedObject[`__dummyPlugin${i}`] = expect.any(Boolean);
          }

          expect(nextConfig).toMatchObject(expectedObject);
        });
      }
    });
  });
});
