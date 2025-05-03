/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config: import('webpack').Configuration) => {
    config.module = config.module ?? {};
    config.module.rules = config.module.rules ?? [];
    // .LICENSEファイルを無視する設定
    config.module.rules.push({
      test: /\.(LICENSE|license)$/i,
      type: 'asset/resource',
      generator: {
        emit: false,
      },
    });
    // cloudflare:socketsを無視する設定
    config.plugins = config.plugins ?? [];
    config.plugins.push(
      new (require('webpack').IgnorePlugin)({
        resourceRegExp: /^cloudflare:sockets$/,
      })
    );
    return config;
  },
};

module.exports = nextConfig;