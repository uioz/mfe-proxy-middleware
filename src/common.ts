import { appProxyOption, mfeConfig, mfeRoute } from 'type';

export const MFE_CONFIG_FILE_NAME = 'mfe-config.js';

export const MFE_ROUTE_FILE_NAME = 'mfe-route.json';

export const DEFAULT_MFE_ROUTE: mfeRoute = {
  domain: [],
};

export const OUTPUT_DIR = './dist';
export const ROUTE_PATH = `./${MFE_ROUTE_FILE_NAME}`;
export const STATIC_DIR = './dist/static';

export const DEFAULT_MFE_CONFIG: Required<mfeConfig> = {
  appThatNeededProxy: [],
  outputDir: OUTPUT_DIR,
  routePath: ROUTE_PATH,
  static: {
    outputDir: STATIC_DIR,
    publicPath: '/static',
    staticPrefix: true,
  },
};

export const DEFAULT_APP_PROXY_OPTION: Required<appProxyOption> = {
  publicPath: '/static',
  route: `/${MFE_ROUTE_FILE_NAME}`,
  url: '',
};
