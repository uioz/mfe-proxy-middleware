import { Express } from 'express';
import { mfeConfig, mfeRoute } from './type';
import resolveOptions, { ResolvedOptions } from './resolveOptions';
import resolveRoutes, { resolvedRoute } from './resolveRoutes';
import { createProxyMiddleware } from 'http-proxy-middleware';

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

export function proxyRoutes(app: Express, { routes }: parsedOptions): void {
  for (const route of routes) {
    if (route.rewrites) {
      for (const rewrite of route.rewrites) {
        app.use(rewrite.from, createProxyMiddleware({ target: route.appUrl }));
      }
    }

    if (route.domain) {
      app.use(route.domain, createProxyMiddleware({ target: route.appUrl }));
    }
  }
}

export function proxyStatic(app: Express, { routes }: parsedOptions): void {
  for (const { publicPath, appUrl } of routes) {
    app.use(`${publicPath}*`, createProxyMiddleware({ target: appUrl }));
  }
}
