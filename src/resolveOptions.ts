import * as path from 'path';
import pkgDir from 'pkg-dir';
import { Options } from './index';
import {
  DEFAULT_MFE_ROUTE,
  DEFAULT_MFE_CONFIG,
  MFE_CONFIG_FILE_NAME,
  MFE_ROUTE_FILE_NAME,
} from './common';
import { mfeConfig, mfeRoute } from 'type';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require('../package.json');

const defaultOptions: Required<
  Pick<Options, Exclude<keyof Options, 'hostStatic'>>
> = {
  remoteFirst: false,
  mfeConfig: `./${MFE_CONFIG_FILE_NAME}`,
  mfeRoute: `./${MFE_ROUTE_FILE_NAME}`,
};

function isMfeConfig(config: unknown): config is mfeConfig {
  return typeof config === 'object';
}
function isMfeRoute(config: unknown): config is mfeRoute {
  return typeof config === 'object';
}

export interface ResolvedOptions {
  packageDir: string;
  remoteFirst: boolean;
  mfeConfig: Required<mfeConfig>;
  mfeRoute: mfeRoute;
}

function validateMfeConfig(mfeConfig: mfeConfig) {
  if (mfeConfig.appThatNeededProxy) {
    if (
      Array.isArray(mfeConfig.appThatNeededProxy) &&
      mfeConfig.appThatNeededProxy.length > 0
    ) {
      return true;
    }
    throw new Error(
      `${packageJson.name}: no element in your appThatNeededProxy property in mfe-config`
    );
  } else {
    throw new Error(
      `${packageJson.name}: no appThatNeededProxy property in mfe-config`
    );
  }
}

/**
 * format and resolve options
 * @param options
 */
export default async function resolveOptions(
  options: Options = {}
): Promise<ResolvedOptions> {
  const packageDir = await pkgDir();

  if (!packageDir) {
    throw new Error('Make sure that your project is a npm package!');
  }

  options = Object.assign({}, defaultOptions, options);

  const result: ResolvedOptions = {
    packageDir,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    remoteFirst: options.remoteFirst,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    mfeConfig: undefined,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    mfeRoute: undefined,
  };

  if (typeof options.mfeConfig === 'string') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const localMfeConfig = require(path.join(packageDir, options.mfeConfig));

    validateMfeConfig(localMfeConfig);
    result.mfeConfig = Object.assign(DEFAULT_MFE_CONFIG, localMfeConfig);
  } else if (
    isMfeConfig(options.mfeConfig) &&
    validateMfeConfig(options.mfeConfig)
  ) {
    result.mfeConfig = Object.assign(DEFAULT_MFE_CONFIG, options.mfeConfig);
  }

  if (typeof options.mfeRoute === 'string') {
    // path of mfe-route.json relative to package root dir
    const mfeRoutePath = path.join(packageDir, options.mfeRoute);

    try {
      result.mfeRoute = require(mfeRoutePath);
    } catch (_error) {
      console.log(
        `missing file ${MFE_ROUTE_FILE_NAME} from ${mfeRoutePath}, use empty route instead.`
      );
      result.mfeRoute = DEFAULT_MFE_ROUTE;
    }
  } else if (isMfeRoute(options.mfeRoute)) {
    // route object directly
    result.mfeRoute = options.mfeRoute;
  } else if (result.mfeConfig.routePath) {
    // path of mfe-route.json relative to package root dir from mfe-config.js
    const mfeRoutePath = path.join(packageDir, result.mfeConfig.routePath);

    try {
      result.mfeRoute = require(mfeRoutePath);
    } catch (_error) {
      console.log(
        `missing file ${MFE_ROUTE_FILE_NAME} from ${mfeRoutePath}, use empty route instead.`
      );
      result.mfeRoute = DEFAULT_MFE_ROUTE;
    }
  }

  return result;
}
