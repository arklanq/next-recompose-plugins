import {NextConfig} from 'next';
import {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_EXPORT,
  PHASE_PRODUCTION_BUILD,
  PHASE_PRODUCTION_SERVER,
  PHASE_TEST,
} from 'next/constants';

export type ConfigurationPhase =
  | typeof PHASE_DEVELOPMENT_SERVER
  | typeof PHASE_PRODUCTION_SERVER
  | typeof PHASE_PRODUCTION_BUILD
  | typeof PHASE_EXPORT
  | typeof PHASE_TEST;

export type ConfigFactoryArguments = {defaultConfig: NextConfig};

export interface NextConfigFactory {
  (phase: ConfigurationPhase, args: ConfigFactoryArguments): NextConfig | Promise<NextConfig>;
  pluginName?: string;
}

export type NextConfigDeclaration = NextConfig | NextConfigFactory;
