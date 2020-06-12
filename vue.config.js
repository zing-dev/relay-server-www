module.exports = {
    devServer: {
        disableHostCheck: true,
        port: 8080,
        proxy: {
            '/api': {
                target: 'http://192.168.0.136:8800',
                changeOrigin: true,
                ws: true,
                pathRewrite: {
                    '^/api': ''
                }
            }
        }
    },
}
