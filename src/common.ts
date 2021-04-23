import { mfeConfig, mfeRoute } from 'type';

export const MFE_CONFIG_FILE_NAME = 'mfe-config.js';

export const MFE_ROUTE_FILE_NAME = 'mfe-route.json';

export const DEFAULT_MFE_ROUTE: mfeRoute = {
  domain: [],
};

export const OUTPUT_DIR = './dist';
export const ROUTE_PATH = `./${MFE_ROUTE_FILE_NAME}`;
export const STATIC_DIR = './dist/static';

export const DEFAULT_MFE_CONFIG: Required<mfeConfig> = {
  appThatneededProxy: [],
  outputDir: OUTPUT_DIR,
  routePath: ROUTE_PATH,
  staticDir: STATIC_DIR,
  usePackageNameAsStaticPrefix: true,
};
