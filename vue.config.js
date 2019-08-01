module.exports = {
    devServer: {
        proxy: {
            '/api': {
                target: 'http://192.168.0.200:13001',
                changeOrigin: true,
                pathRewrite: {
                    '^/api': '/' 
                }
            }
        }
    }  
}