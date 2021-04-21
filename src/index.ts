// after testing uninstall express @types/express
import {Express} from 'express';
import {mfeConfig, mfeRoute} from './type';
import resolveOptions, {ResolvedOptions} from './resolveOptions';
import resolveRoutes, {resolvedRoute} from './resolveRoutes';
import {createProxyMiddleware} from 'http-proxy-middleware';

// import * as http from 'http';
// function mfeProxyMiddleware<R extends http.ServerResponse>(
//   request: http.IncomingMessage,
//   response: R,
//   next: () => void
// ) {
//   debugger;
// }

export interface Options {
  /**
   * mfe-config.js path or content
   * relative to package.json
   */
  mfeConfig?: mfeConfig | string;
  /**
   * mfe-route.json path or content
   * relative to package.json
   */
  mfeRoute?: mfeRoute | string;
  /**
   * remote route match first otherwise local first if they have same path
   * false by default
   */
  remoteFirst?: boolean;
  /**
   * TODO: enabled in next major
   */
  // hostStatic?: {
  //   outputDir: string;
  // };
}

export interface parsedOptions {
  options: ResolvedOptions;
  routes: Array<resolvedRoute>;
}

/**
 *
 * @param option
 * @returns
 */
export async function parseOptions(option?: Options): Promise<parsedOptions> {
  const resolvedOptions = await resolveOptions(option);

  const resolvedRoutes = await resolveRoutes(resolvedOptions);

  return {
    options: resolvedOptions,
    routes: resolvedRoutes,
  };
}

export function proxyRoutes(app: Express, {routes}: parsedOptions): void {
  for (const route of routes) {
    for (const path of route.domain) {
      app.use(path, createProxyMiddleware({target: route.appUrl}));
    }
  }
}

export function proxyStatic(
  app: Express,
  {options, routes}: parsedOptions
): void {
  if (options.mfeConfig.usePackageNameAsStaticPrefix) {
    for (const {appName, appUrl} of routes) {
      app.use(`/static/${appName}/`, createProxyMiddleware({target: appUrl}));
    }
  }
}
