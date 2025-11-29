/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer, webpack }) => {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            got: false,
            fs: false,
            net: false,
            tls: false,
            child_process: false,
            http: false,
            https: false,
            stream: false,
            crypto: false,
            os: false,
            zlib: false,
        };
        config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /^got$/ }));
        return config;
    },
};

module.exports = nextConfig;
