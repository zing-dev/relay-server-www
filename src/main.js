import Vue from 'vue'
import App from './views/App.vue'
import store from './store'

import { BootstrapVue } from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import './assets/style.css'
import '@/svg/index.js'

import moment from 'moment'//导入文件

Vue.prototype.$moment = moment;//赋值使用
moment.locale('zh-cn');//需要汉化

Vue.use(BootstrapVue)

Vue.config.productionTip = false

new Vue({
  store,
  render: h => h(App),
}).$mount('#app')
