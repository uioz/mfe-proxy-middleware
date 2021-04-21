export interface mfeConfig {
  /**
   * 打包后输出的路径, 默认 ./dist
   */
  outputDir?: string;
  /**
   * 静态资源目录输出的路径, 默认 ./dist/static
   */
  staticDir?: string;
  /**
   * 当前项目路由配置的相对地址, 默认 ./mfe-route.json
   */
  routePath?: string;
  /**
   * 使用项目名称作为 static 目录的前缀修饰
   * 即需要请求 /static/[packageName]/xxxx.xxxx
   * 反之则只使用目录作为前缀
   * 默认为 true
   */
  usePackageNameAsStaticPrefix?: boolean;
  /**
   * 需要代理的远程项目地址
   * 例如 ['app1@http://localhost:3000','app2@http://localhost:3001']
   * app1@http://localhost:3000/xxxx?route=mfe-route.json 利用 path 和 query 你可以自由定位路由文件的位置和名字
   * 如果多个项目路由重复则优先匹配靠前的路由
   * 本地路由的优先级最高
   */
  appThatneededProxy: Array<string>;
}

export interface mfeRoute {
  domain: Array<string>;
}
