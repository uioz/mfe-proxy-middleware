import got from 'got';
import { ResolvedOptions } from 'resolveOptions';
import { DEFAULT_APP_PROXY_OPTION } from './common';
import { URL } from 'url';
import { mfeRoute, appProxyOption } from './type';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require('../package.json');

export interface parsedRemotePath {
  /**
   * aka. package.json.name by default
   */
  appName: string;
  appUrl: string;
  routeFileName: string;
}

export interface resolvedRoute extends mfeRoute {
  routeUrl: string;
  publicPath: string;
  appUrl: string;
}

function deduplicate(set: Set<string>, array: Array<string>): Array<string> {
  return array.filter((item) => {
    if (!set.has(item)) {
      set.add(item);
      return true;
    }
    return false;
  });
}

function deduplicateRoute(
  set: Set<string>,
  resolvedRoutes: Array<resolvedRoute>
): Array<resolvedRoute> {
  for (const route of resolvedRoutes) {
    // handle rewrites first
    if (route.rewrites) {
      route.rewrites = route.rewrites.filter((item) => {
        if (Array.isArray(item.from)) {
          item.from = deduplicate(set, item.from);
          if (item.from.length === 0) {
            return false;
          }
          return true;
        }

        if (!set.has(item.from)) {
          set.add(item.from);
          return true;
        }
        return false;
      });
    }

    if (route.domain) {
      route.domain = deduplicate(set, route.domain);
    }
  }
  return resolvedRoutes;
}

function polyfillRoute(
  appThatNeededProxy: Array<appProxyOption>
): Array<Required<appProxyOption>> {
  return appThatNeededProxy.map((appOptions, index) => {
    if (!appOptions.url) {
      throw new Error(
        `${packageJson.name}: missing url in appThatNeededProxy[${index}]`
      );
    }

    return {
      ...DEFAULT_APP_PROXY_OPTION,
      ...appOptions,
    };
  });
}

export default async function resolveRoutes({
  mfeRoute: localMfeRoute,
  mfeConfig,
  remoteFirst,
}: ResolvedOptions): Promise<Array<resolvedRoute>> {
  const appThatNeededProxy = polyfillRoute(mfeConfig.appThatNeededProxy);

  const resolvedRoutes: Array<resolvedRoute> = await Promise.all(
    appThatNeededProxy.map(async ({ publicPath, route, url }) => {
      // validate
      const routeTarget = new URL(route, url);
      let { pathname } = new URL(publicPath, url);

      if (pathname[pathname.length - 1] !== '/') {
        pathname = `${pathname}/`;
      }

      const { body } = await got.get(routeTarget, {
        responseType: 'json',
      });

      return {
        routeUrl: routeTarget.toString(),
        publicPath: pathname,
        appUrl: url,
        ...(body as any),
      };
    })
  );

  if (remoteFirst) {
    return deduplicateRoute(new Set(), resolvedRoutes);
  }

  return deduplicateRoute(new Set(localMfeRoute.domain), resolvedRoutes);
}
