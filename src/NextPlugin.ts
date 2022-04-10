import {NextConfig} from 'next';
import {ConfigFactoryArguments, ConfigurationPhase, NextConfigDeclaration} from './NextConfigDeclaration';

export type NextPlugin = (config: NextConfig) => NextConfigDeclaration;

export interface PluginApplyAction {
  (phase: ConfigurationPhase, args: ConfigFactoryArguments, config: NextConfig): NextConfig | Promise<NextConfig>;
}
