import {isAsyncConfigFactorySupported} from './isAsyncConfigFactorySupported';
import {NextConfigDeclaration, NextConfigFactory} from './NextConfigDeclaration';
import {PluginApplyAction} from './NextPlugin';
import assert from 'assert';
import {NextConfig} from 'next';
import isPromise from 'is-promise';
import {ConfigBuildException} from './ConfigBuildException';

const isAsyncContextAvailable = isAsyncConfigFactorySupported();

export class Config {
  private readonly stack: PluginApplyAction[];

  constructor(configDeclaration: NextConfigDeclaration = {}) {
    switch (typeof configDeclaration) {
      case 'object': {
        if (configDeclaration === null)
          throw new Error(
            `Invalid argument passed to \`defineConfig(...)\` method. Expected \`object\` as a valid Next.js's config or a \`function\` as a config factory, but instead got \`null\`.`
          );

        const nextConfigFactory: NextConfigFactory = () => configDeclaration;

        this.stack = [nextConfigFactory];
        break;
      }
      case 'function': {
        this.stack = [configDeclaration];
        break;
      }
      default: {
        throw new Error(
          `Invalid argument passed to \`defineConfig(...)\` method. Expected \`object\` as a valid Next.js's config or a \`function\` as a config factory, but instead got \`${typeof configDeclaration}\`.`
        );
      }
    }
  }

  applyPlugin(applyAction: PluginApplyAction, pluginName?: string): Config {
    applyAction.pluginName = pluginName;
    this.stack.push(applyAction);
    return this;
  }

  build(): NextConfigFactory {
    const firstElement: PluginApplyAction | undefined = this.stack.shift();
    assert(firstElement, 'At least one (first) element should be available on stack.');

    if (isAsyncContextAvailable) return this.buildAsync(firstElement);
    else return this.buildSync(firstElement);
  }

  protected buildSync(firstElement: PluginApplyAction): NextConfigFactory {
    return (phase, args) => {
      let baseConfig: NextConfig | Promise<NextConfig>;
      try {
        baseConfig = firstElement(phase, args, {});
      } catch (e: unknown) {
        throw new ConfigBuildException('Cannot construct config object.', e);
      }

      if (isPromise(baseConfig))
        throw new ConfigBuildException(
          'Config factory function cannot return `Promise`. This feature is supported only in Next.js 12.1+.'
        );

      if (!baseConfig)
        throw new ConfigBuildException(
          `Config factory function cannot return ${typeof baseConfig}. Expected valid NextConfig object.${
            baseConfig === undefined ? ' Have you forgot to return config object?' : ''
          }`
        );

      // Check if there are 'applyPlugin' invocations on the stack
      if (this.stack.length > 0) {
        for (let i = 0; i < this.stack.length; i++) {
          const element: PluginApplyAction = this.stack[i];
          const elementId: string = element.pluginName ?? `unnamed, at index ${i}`;

          try {
            baseConfig = element(phase, args, baseConfig);
          } catch (e: unknown) {
            throw new ConfigBuildException(`An error occurred while applying the plugin (${elementId}).`, e);
          }

          if (isPromise(baseConfig))
            throw new ConfigBuildException(
              'Plugin factory function cannot return `Promise`. This feature is supported only in Next.js 12.1+.'
            );

          if (!baseConfig)
            throw new ConfigBuildException(
              `Plugin factory function (${elementId}) cannot return ${typeof baseConfig}. Expected valid NextConfig object.${
                baseConfig === undefined ? ' Have you forgot to return config object?' : ''
              }`
            );
        }
      }

      return baseConfig;
    };
  }

  protected buildAsync(firstElement: PluginApplyAction): NextConfigFactory {
    return async (phase, args) => {
      let baseConfig: NextConfig | Promise<NextConfig>;
      try {
        baseConfig = await firstElement(phase, args, {});
      } catch (e: unknown) {
        throw new ConfigBuildException('Cannot construct config object.', e);
      }

      if (!baseConfig)
        throw new ConfigBuildException(
          `Config factory function cannot return ${typeof baseConfig}. Expected valid NextConfig object.${
            baseConfig === undefined ? ' Have you forgot to return config object?' : ''
          }`
        );

      if (this.stack.length > 1) {
        for (let i = 0; i < this.stack.length; i++) {
          const element: PluginApplyAction = this.stack[i];
          const elementId: string = element.pluginName ?? `unnamed, at index ${i}`;

          try {
            baseConfig = await element(phase, args, baseConfig);
          } catch (e: unknown) {
            throw new ConfigBuildException(`An error occurred while applying the plugin (${elementId}).`, e);
          }

          if (!baseConfig)
            throw new ConfigBuildException(
              `Plugin factory function (${elementId}) cannot return ${typeof baseConfig}. Expected valid NextConfig object.${
                baseConfig === undefined ? ' Have you forgot to return config object?' : ''
              }`
            );
        }
      }

      return baseConfig;
    };
  }
}
