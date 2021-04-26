export interface appProxyOption {
  /**
   * 需要代理的地址
   */
  url: string;
  /**
   * 静态资源地址, 默认 '/static'
   * 相对 url 的地址
   */
  publicPath?: string;
  /**
   * mfe-route 地址, 默认 'mfe-route.json'
   * 相对于 url 的完整路径
   */
  route?: string;
}

export interface mfeConfig {
  /**
   * 当前项目打包后输出的路径, 默认 ./dist
   * 由 mfe-proxy-server 使用
   */
  outputDir?: string;
  /**
   *
   * 当前项目路由配置的相对地址, 默认 ./mfe-route.json
   * 由 mfe-proxy-server 使用
   */
  routePath?: string;
  /**
   * 当前项目静态配置
   * 由 mfe-proxy-server 使用
   */
  static?: {
    /**
     * 静态资源路径的前缀, 默认 /static
     */
    publicPath?: string;
    /**
     * 静态资源相对于项目所在的位置, 默认 ./dist
     */
    outputDir?: string;
    /**
     * 静态资源前缀, 默认 true
     */
    staticPrefix?: boolean;
  };
  /**
   * 如果多个项目路由重复则优先匹配靠前的路由
   * 本地路由的优先级最高
   * 由 mfe-proxy-middleware 使用
   */
  appThatNeededProxy?: Array<appProxyOption>;
}

export interface mfeRoute {
  rewrites?: Array<{
    from: Array<string> | string;
    to: string;
  }>;
  index?: string;
  domain?: Array<string>;
}
