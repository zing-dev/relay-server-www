module.exports = {
    devServer: {
        proxy: {
            '/api': {
                target: 'http://192.168.0.136:8800',
                changeOrigin: true,
                pathRewrite: {
                    '^/api': '/' 
                }
            }
        }
    }  
}