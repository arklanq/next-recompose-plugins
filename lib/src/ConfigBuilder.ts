import {
  ConfigFactoryArguments,
  ConfigurationPhase, NextConfigDeclaration,
  NextConfigFactory
} from './NextConfigDeclaration';
import {NextConfig} from 'next';
import {PluginApplyAction} from './NextPlugin';
import isPromise from 'is-promise';
import {isAsyncConfigFactorySupported} from './isAsyncConfigFactorySupported';

export class ConfigBuilder {
  private readonly configFactory: NextConfigFactory;

  constructor(configDeclaration: unknown) {
    switch (typeof configDeclaration) {
      case 'object': {
        if (configDeclaration === null)
          throw new Error(
            `Invalid plugin output. Expected \`object\` as a valid Next.js's config or a \`function\` as a config factory, but instead got \`null\`.`
          );

        this.configFactory = () => configDeclaration;
        break;
      }
      case 'function': {
        this.configFactory = configDeclaration as NextConfigFactory;
        break;
      }
      default: {
        throw new Error(
          `Invalid plugin output. Expected \`object\` as a valid Next.js's config or a \`function\` as a config factory, but instead got \`${typeof configDeclaration}\`.`
        );
      }
    }
  }

  static defineConfig(configDeclaration: NextConfigDeclaration): ConfigBuilder {
    return new ConfigBuilder(configDeclaration);
  }

  applyPlugin(applyAction: PluginApplyAction, pluginName?: string): ConfigBuilder {
    if(isAsyncConfigFactorySupported())
      return this.applyPluginAsync(applyAction, pluginName);
    else
      return this.applyPluginSync(applyAction, pluginName);
  }

  private applyPluginAsync(applyAction: PluginApplyAction, pluginName?: string): ConfigBuilder {
    if (typeof applyAction !== 'function')
      throw new Error(`Invalid 1st argument (\`applyAction\`) passed to \`configurePlugin\` method. Expected function, instead got \`${typeof applyAction}\`.'`);

    const newConfigFactory: NextConfigFactory = async (phase: ConfigurationPhase, args: ConfigFactoryArguments) => {
      let newConfig: NextConfig;
      try {
        newConfig = await this.configFactory(phase, args);
      } catch(e: unknown) {
        console.error('Function passed to `defineConfig` method threw na error during the configuration step.');
        throw e;
      }

      try {
        return await applyAction(phase, args, newConfig);
      } catch(e: unknown) {
        if(pluginName)
          console.error(`Function applying \`${pluginName}\` plugin threw an error during the configuration step.`);
        else if(applyAction.name)
          console.error(`Function \`${applyAction.name}\` passed to \`applyPlugin\` method threw an error during the configuration step.`);
        else
          console.error('One of the plugin application functions threw an error during the configuration step.');

        throw e;
      }
    };

    newConfigFactory.pluginName = pluginName;

    return new ConfigBuilder(newConfigFactory);
  }

  private applyPluginSync(applyAction: PluginApplyAction, pluginName?: string): ConfigBuilder {
    if (typeof applyAction !== 'function')
      throw new Error(`Invalid 1st argument (\`applyAction\`) passed to \`configurePlugin\` method. Expected function, instead got \`${typeof applyAction}\`.'`);

    const newConfigFactory: NextConfigFactory = (phase: ConfigurationPhase, args: ConfigFactoryArguments): NextConfig => {
      let newConfig: NextConfig;
      try {
        newConfig = this.configFactory(phase, args);
      } catch(e: unknown) {
        console.error('Function passed to `defineConfig` method threw na error during the configuration step.');
        throw e;
      }

      if(isPromise(newConfig))
        throw new Error('Function passed to `defineConfig` method returned Promise. This feature is supported only in Next.js 12.1+.');

      try {
        newConfig = applyAction(phase, args, newConfig);
      } catch(e: unknown) {
        if(pluginName)
          console.error(`Function applying \`${pluginName}\` plugin threw an error during the configuration step.`);
        else if(applyAction.name)
          console.error(`Function \`${applyAction.name}\` passed to \`applyPlugin\` method threw an error during the configuration step.`);
        else
          console.error('One of the plugin application functions threw an error during the configuration step.');

        throw e;
      }

      if(isPromise(newConfig)) {
        if(pluginName)
          console.error(`Function applying \`${pluginName}\` plugin returned Promise. This feature is supported only in Next.js 12.1+.`);
        else if(applyAction.name)
          console.error(`Function \`${applyAction.name}\` passed to \`applyPlugin\` method returned Promise. This feature is supported only in Next.js 12.1+.`);
        else
          console.error('One of the plugin application functions returned Promise. This feature is supported only in Next.js 12.1+.');
      }

      return newConfig;
    };

    newConfigFactory.pluginName = pluginName;

    return new ConfigBuilder(newConfigFactory);
  }

  build(): NextConfigFactory {
    return this.configFactory;
  }
}
