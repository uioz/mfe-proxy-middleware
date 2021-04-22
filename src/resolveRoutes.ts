import got from 'got';
import { ResolvedOptions } from 'resolveOptions';
import { MFE_ROUTE_FILE_NAME } from './common';
import { URL } from 'url';

export interface parsedRemotePath {
  /**
   * aka. package.json.name by default
   */
  appName: string;
  appUrl: string;
  routeFileName: string;
}

class parserRemotePath {
  static packageNameWithScope = /^(@.+)@/i;
  static packageNameWithoutScope = /^(.+)@/i;

  constructor(private path: string) {}

  extractRouteName(url: string): { appUrl: string; routeFileName: string } {
    const { searchParams, origin, pathname } = new URL(url);

    return {
      appUrl: origin + pathname,
      routeFileName: (searchParams as any).route ?? MFE_ROUTE_FILE_NAME,
    };
  }

  parse(): parsedRemotePath {
    if (parserRemotePath.packageNameWithScope.test(this.path)) {
      // @scope/app2@https://localhost:3000 - >
      // fullResult '@scope/app2@'
      // packageName '@scope/app2'
      const [fullResult, appName] = this.path.match(
        parserRemotePath.packageNameWithScope
      ) as Array<string>;

      return {
        appName,
        ...this.extractRouteName(this.path.substring(fullResult.length)),
      };
    }

    if (parserRemotePath.packageNameWithoutScope.test(this.path)) {
      const [fullResult, appName] = this.path.match(
        parserRemotePath.packageNameWithoutScope
      ) as Array<string>;

      return {
        appName,
        ...this.extractRouteName(this.path.substring(fullResult.length)),
      };
    }

    throw new Error(`Parse remotePath -> ${this.path} failed!`);
  }
}

export interface resolvedRoute extends parsedRemotePath {
  domain: Array<string>;
}

function deduplicateRoute(
  set: Set<string>,
  resolvedRoutes: Array<resolvedRoute>
): Array<resolvedRoute> {
  // TODO: only support domain field for now, MPA support later
  for (const route of resolvedRoutes) {
    route.domain = route.domain.filter((path) => {
      if (set.has(path)) {
        return false;
      }
      set.add(path);
      return true;
    });
  }
  return resolvedRoutes;
}

export default async function resolveRoutes({
  mfeRoute: localMfeRoute,
  mfeConfig,
  remoteFirst,
}: ResolvedOptions): Promise<Array<resolvedRoute>> {
  /**
   * input from appThatneededProxy may:
   * app1@http://localhost:3000
   * @scope/app2@https://localhost:3000
   * @scope/app2@https://localhost:3000/@path/route.json
   */
  const parsedUrls = mfeConfig.appThatneededProxy.map((path) =>
    new parserRemotePath(path).parse()
  );

  const resolvedRoutes: Array<resolvedRoute> = await Promise.all(
    parsedUrls.map(async ({ appName, appUrl, routeFileName }) => {
      const { body: route } = await got.get(appUrl + routeFileName, {
        responseType: 'json',
      });

      return {
        appName,
        appUrl,
        routeFileName,
        ...(route as any),
      };
    })
  );

  if (remoteFirst) {
    return deduplicateRoute(new Set(), resolvedRoutes);
  }

  return deduplicateRoute(new Set(localMfeRoute.domain), resolvedRoutes);
}
