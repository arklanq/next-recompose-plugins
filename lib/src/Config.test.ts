import {Config} from './Config';
import {PHASE_DEVELOPMENT_SERVER} from 'next/constants';
import {ConfigFactoryArguments, ConfigurationPhase, NextConfigFactory} from './NextConfigDeclaration';
import {NextConfig} from 'next';
import {dummyPlugin} from './__mocks__/dummyPlugin';
import isPromise from 'is-promise';

describe('`Config` class', () => {
  describe('constructor', () => {
    test('returns `Config` instance.', () => {
      const config: Config = new Config({});
      expect(config).toBeInstanceOf(Config);
    });

    test("doesn't allow to use async function when next <12.1", () => {
      jest.isolateModules(() => {
        jest.doMock('next/package.json', () => ({version: '12.0.0'}));

        const actual_Config: typeof Config = jest.requireActual<typeof import('./Config')>('./Config').Config;

        const config: Config = new actual_Config(() => Promise.resolve({}));

        expect(() => {
          // Error is actually thrown on `build()` method invocation
          void config.build()(PHASE_DEVELOPMENT_SERVER, {defaultConfig: {}});
        }).toThrowError(
          'Config factory function cannot return `Promise`. This feature is supported only in Next.js 12.1+.'
        );
      });
    });

    test('allow to use async function when next >=12.1', () => {
      jest.isolateModules(() => {
        jest.doMock('next/package.json', () => ({version: '12.1.0'}));
        const actual_Config: typeof Config = jest.requireActual<typeof import('./Config')>('./Config').Config;

        const configBuilder: Config = new actual_Config(() => Promise.resolve({}));

        expect(() => {
          // Error is actually thrown on `build()` method invocation
          void configBuilder.build()(PHASE_DEVELOPMENT_SERVER, {defaultConfig: {}});
        }).not.toThrowError();
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

    test("doesn't allow to use async function when next <12.1", () => {
      jest.isolateModules(() => {
        jest.doMock('next/package.json', () => ({version: '12.0.0'}));

        const actual_Config: typeof Config = jest.requireActual<typeof import('./Config')>('./Config').Config;

        const configBuilder: Config = new actual_Config({}).applyPlugin(
          (_phase: ConfigurationPhase, _args: ConfigFactoryArguments, config: NextConfig) =>
            Promise.resolve(dummyPlugin(config, {property: '__dummyPlugin'}))
        );

        expect(() => {
          // Error is actually thrown on `build()` method invocation
          void configBuilder.build()(PHASE_DEVELOPMENT_SERVER, {defaultConfig: {}});
        }).toThrowError(
          'Plugin factory function cannot return `Promise`. This feature is supported only in Next.js 12.1+.'
        );
      });
    });

    test('allow to use async function when next >=12.1', () => {
      jest.isolateModules(() => {
        jest.doMock('next/package.json', () => ({version: '12.1.0'}));

        const actual_Config: typeof Config = jest.requireActual<typeof import('./Config')>('./Config').Config;

        const configBuilder: Config = new actual_Config({}).applyPlugin(
          (_phase: ConfigurationPhase, _args: ConfigFactoryArguments, config: NextConfig) =>
            Promise.resolve(dummyPlugin(config, {property: '__dummyPlugin'}))
        );

        expect(() => {
          // Error is actually thrown on `build()` method invocation
          void configBuilder.build()(PHASE_DEVELOPMENT_SERVER, {defaultConfig: {}});
        }).not.toThrowError();
      });
    });
  });

  describe('`build` method', () => {
    test('if next.js <12.1.0 returns synchronous function', () => {
      jest.isolateModules(() => {
        jest.doMock('next/package.json', () => ({version: '12.0.0'}));

        const actual_Config: typeof Config = jest.requireActual<typeof import('./Config')>('./Config').Config;

        const config: Config = new actual_Config({});
        const configFactory: NextConfigFactory = config.build();

        expect(configFactory).toBeInstanceOf(Function);

        const configObject: NextConfig = configFactory(PHASE_DEVELOPMENT_SERVER, {defaultConfig: {}}) as NextConfig;

        expect(isPromise(configObject)).toBe(false);
      });
    });

    test('if next.js <12.1.0 returns asynchronous function', () => {
      jest.isolateModules(() => {
        jest.doMock('next/package.json', () => ({version: '12.1.0'}));

        const actual_Config: typeof Config = jest.requireActual<typeof import('./Config')>('./Config').Config;

        const configBuilder: Config = new actual_Config({});
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

      test('NextConfig object with changes correctly applied by plugins', async () => {
        const config: Config = new Config({});

        for (let i = 1; i <= 3; i++) {
          config.applyPlugin((phase: ConfigurationPhase, args: ConfigFactoryArguments, config: NextConfig) => {
            return dummyPlugin(config, {property: `__dummyPlugin${i}`});
          });
        }

        const configFactory: NextConfigFactory = config.build();

        const maybePromise: NextConfig | Promise<NextConfig> = configFactory(PHASE_DEVELOPMENT_SERVER, {
          defaultConfig: {},
        });
        const nextConfig: NextConfig = isPromise(maybePromise) ? await maybePromise : maybePromise;

        expect(nextConfig).toMatchObject({
          __dummyPlugin1: expect.any(Boolean), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
          __dummyPlugin2: expect.any(Boolean), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
          __dummyPlugin3: expect.any(Boolean), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        });
      });
    });
  });
});
