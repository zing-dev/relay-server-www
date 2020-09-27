module.exports = {
    devServer: {
        proxy: {
            '/api': {
                target: 'http://192.168.0.251:8800',
                changeOrigin: true,
                ws:true,
                pathRewrite: {
                    '^/api': ''
                }
            }
        }
    }  
}