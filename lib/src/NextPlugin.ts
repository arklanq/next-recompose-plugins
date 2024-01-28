import {NextConfig} from 'next';
import {ConfigFactoryArguments, ConfigurationPhase, NextConfigDeclaration} from './NextConfigDeclaration.js';

export type NextPlugin<T extends unknown[] = unknown[]> = (config: NextConfig, ...options: T) => NextConfigDeclaration;

export interface PluginApplyAction {
  (phase: ConfigurationPhase, args: ConfigFactoryArguments, config: NextConfig): NextConfig | Promise<NextConfig>;
  pluginName?: string;
}
