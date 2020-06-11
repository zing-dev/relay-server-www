module.exports = {
    devServer: {
        disableHostCheck: true,
        port: 8080,
        proxy: {
            '/api': {
                target: 'http://192.168.31.179:8081',
                changeOrigin: true,
                ws: true,
                pathRewrite: {
                    '^/api': ''
                }
            }
        }
    },
}
