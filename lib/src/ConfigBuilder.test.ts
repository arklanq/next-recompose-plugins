import {ConfigBuilder} from './ConfigBuilder';
import {NextConfig} from 'next';
import {ConfigFactoryArguments, ConfigurationPhase, NextConfigFactory} from './NextConfigDeclaration';
import {PHASE_DEVELOPMENT_SERVER} from 'next/constants';
import isPromise from 'is-promise';
import {dummyPlugin} from './__mocks__/dummyPlugin';

describe('`ConfigBuilder` class', () => {
  describe('`defineConfig` static method', () => {
    test('returns `ConfigBuilder` instance.', () => {
      const configBuilder: ConfigBuilder = ConfigBuilder.defineConfig();
      expect(configBuilder).toBeInstanceOf(ConfigBuilder);
    });

    test("doesn't allow to use async function when next <12.1", () => {
      jest.isolateModules(() => {
        jest.doMock('next/package.json', () => ({version: '12.0.0'}));
        const ActualConfigBuilder: typeof ConfigBuilder =
          jest.requireActual<typeof import('./ConfigBuilder')>('./ConfigBuilder').ConfigBuilder;
        const configBuilder: ConfigBuilder = ActualConfigBuilder.defineConfig(() => Promise.resolve({}));
        expect(() => {
          // Error is actually throws during build
          void configBuilder.build()(PHASE_DEVELOPMENT_SERVER, {defaultConfig: {}});
        }).toThrowError('This feature is supported only in Next.js 12.1+.');
      });
    });

    test('allow to use async function when next >=12.1', () => {
      jest.isolateModules(() => {
        jest.doMock('next/package.json', () => ({version: '12.1.0'}));
        const ActualConfigBuilder: typeof ConfigBuilder =
          jest.requireActual<typeof import('./ConfigBuilder')>('./ConfigBuilder').ConfigBuilder;
        const configBuilder: ConfigBuilder = ActualConfigBuilder.defineConfig(() => Promise.resolve({}));
        expect(() => {
          // Error is actually throws during build
          void configBuilder.build()(PHASE_DEVELOPMENT_SERVER, {defaultConfig: {}});
        }).not.toThrowError('This feature is supported only in Next.js 12.1+.');
      });
    });
  });

  describe('`applyPlugin` method', () => {
    let configBuilder: ConfigBuilder;
    beforeEach(() => {
      configBuilder = ConfigBuilder.defineConfig();
    });

    test('returns `ConfigBuilder` instance.', () => {
      expect(
        configBuilder.applyPlugin((_phase: ConfigurationPhase, _args: ConfigFactoryArguments, config: NextConfig) =>
          dummyPlugin(config, {property: '__dummyPlugin'})
        )
      ).toBeInstanceOf(ConfigBuilder);
    });

    test("doesn't allow to use async function when next <12.1", () => {
      jest.isolateModules(() => {
        jest.doMock('next/package.json', () => ({version: '12.0.0'}));
        const ActualConfigBuilder: typeof ConfigBuilder =
          jest.requireActual<typeof import('./ConfigBuilder')>('./ConfigBuilder').ConfigBuilder;
        const configBuilder: ConfigBuilder = ActualConfigBuilder.defineConfig().applyPlugin(
          (_phase: ConfigurationPhase, _args: ConfigFactoryArguments, config: NextConfig) =>
            Promise.resolve(dummyPlugin(config, {property: '__dummyPlugin'}))
        );
        expect(() => {
          // Error is actually throws during build
          void configBuilder.build()(PHASE_DEVELOPMENT_SERVER, {defaultConfig: {}});
        }).toThrowError('This feature is supported only in Next.js 12.1+.');
      });
    });

    test('allow to use async function when next >=12.1', () => {
      jest.isolateModules(() => {
        jest.doMock('next/package.json', () => ({version: '12.1.0'}));
        const ActualConfigBuilder: typeof ConfigBuilder =
          jest.requireActual<typeof import('./ConfigBuilder')>('./ConfigBuilder').ConfigBuilder;
        const configBuilder: ConfigBuilder = ActualConfigBuilder.defineConfig().applyPlugin(
          (_phase: ConfigurationPhase, _args: ConfigFactoryArguments, config: NextConfig) =>
            Promise.resolve(dummyPlugin(config, {property: '__dummyPlugin'}))
        );
        expect(() => {
          // Error is actually throws during build
          void configBuilder.build()(PHASE_DEVELOPMENT_SERVER, {defaultConfig: {}});
        }).not.toThrowError('This feature is supported only in Next.js 12.1+.');
      });
    });
  });

  describe('`build` method', () => {
    test('if next.js <12.1.0 returns synchronous function', () => {
      jest.isolateModules(() => {
        jest.doMock('next/package.json', () => ({version: '12.0.0'}));
        const ActualConfigBuilder: typeof ConfigBuilder =
          jest.requireActual<typeof import('./ConfigBuilder')>('./ConfigBuilder').ConfigBuilder;
        const configBuilder: ConfigBuilder = ActualConfigBuilder.defineConfig();
        const configFactory: NextConfigFactory = configBuilder.build();
        expect(configFactory).toBeInstanceOf(Function);
        const configObject: NextConfig = configFactory(PHASE_DEVELOPMENT_SERVER, {defaultConfig: {}}) as NextConfig;
        expect(isPromise(configObject)).toBe(false);
      });
    });

    test('if next.js <12.1.0 returns asynchronous function', () => {
      jest.isolateModules(() => {
        jest.doMock('next/package.json', () => ({version: '12.1.0'}));
        const ActualConfigBuilder: typeof ConfigBuilder =
          jest.requireActual<typeof import('./ConfigBuilder')>('./ConfigBuilder').ConfigBuilder;
        const configBuilder: ConfigBuilder = ActualConfigBuilder.defineConfig();
        const configFactory: NextConfigFactory = configBuilder.build();
        expect(configFactory).toBeInstanceOf(Function);
        const promise: Promise<NextConfig> = configFactory(PHASE_DEVELOPMENT_SERVER, {
          defaultConfig: {},
        }) as Promise<NextConfig>;
        expect(isPromise(promise)).toBe(true);
      });
    });

    describe('returns function that returns/resolves to:', () => {
      test('config object with initital config options merged', async () => {
        const configFactory: NextConfigFactory = ConfigBuilder.defineConfig({optimizeFonts: false}).build();

        const maybePromise: NextConfig | Promise<NextConfig> = configFactory(PHASE_DEVELOPMENT_SERVER, {
          defaultConfig: {},
        });
        const nextConfig: NextConfig = isPromise(maybePromise) ? await maybePromise : maybePromise;

        expect(nextConfig).toMatchObject({
          optimizeFonts: expect.any(Boolean),
        });

        expect(nextConfig.optimizeFonts).toBe(false);
      });

      test('config object with changes applied by plugins', async () => {
        let configBuilder: ConfigBuilder = ConfigBuilder.defineConfig({});

        for (let i = 1; i <= 3; i++) {
          configBuilder = configBuilder.applyPlugin(
            (phase: ConfigurationPhase, args: ConfigFactoryArguments, config: NextConfig) => {
              return dummyPlugin(config, {property: `__dummyPlugin${i}`});
            }
          );
        }

        const configFactory: NextConfigFactory = configBuilder.build();

        const maybePromise: NextConfig | Promise<NextConfig> = configFactory(PHASE_DEVELOPMENT_SERVER, {
          defaultConfig: {},
        });
        const nextConfig: NextConfig = isPromise(maybePromise) ? await maybePromise : maybePromise;

        expect(nextConfig).toMatchObject({
          __dummyPlugin1: expect.any(Boolean),
          __dummyPlugin2: expect.any(Boolean),
          __dummyPlugin3: expect.any(Boolean),
        });
      });
    });
  });
});
