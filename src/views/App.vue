<template>
  <div id="app">
    <div>
      <b-navbar toggleable="lg" type="dark">
        <b-navbar-nav>
          <img :src="'./' + LOGO" style="height:30px;margin-right:15px"  v-if="widthLogo"/>
          <b-navbar-brand href="#">继电器模块</b-navbar-brand>
         </b-navbar-nav>
        <b-navbar-nav class="ml-auto">
            <b-button size="sm" class="my-2 my-sm-0" v-b-modal.modal-1 @click="GetVision">版本信息</b-button>
        </b-navbar-nav>
      </b-navbar>
    </div>
    <div class="view">
      <b-container class="home" fluid>
        <b-row class="h100pct">
          <b-col>
             <div role="tablist" class="mb-4">
                <State :value="stateVal" :serverConn='serverConn'></State>
            </div>
            <div role="tablist">
                <System></System>
            </div>
          </b-col>
          <b-col>
             <div role="tablist" class="h100pct">
              <b-card no-body class="h100pct">
                <b-card-header class="header-control" header-tag="header" role="tab">
                  <span v-b-toggle.accordion-3>日志</span>
                  <div class="tool">
                    <b-form-checkbox
                    :checked="logFollow"
                    @change="followLog"
                    >滚动条跟随</b-form-checkbox>
                    <b-button class="ml-3" size="sm" @click="clearLogs">清空日志</b-button>
                  </div>
                </b-card-header>
                <b-collapse id="accordion-3" visible accordion="log" role="tabpanel">
                  <b-card-body class="scroller logBody">
                    <div ref="scroller">
                      <template v-if="logs.length">
                        <div>
                          <b-list-group>
                            <b-list-group-item :variant="logType(log.level)" v-for="(log, index) in logs" :key="index">
                              {{ log.time +  "  " + log.msg }}
                            </b-list-group-item>
                          </b-list-group>
                        </div>
                      </template>
                      <b-list-group v-else>
                        <b-list-group-item>暂无记录</b-list-group-item>
                      </b-list-group>
                    </div>
                    
                  </b-card-body>
                </b-collapse>
              </b-card>
            </div>
          </b-col>
        </b-row>
      </b-container>
    </div>
    <b-modal id="modal-1" title="版本信息" ok-only :ok-title="'确定'" :centered="true" :size="'lg'">
      <b-table :items="items" :fields="fields" outlined bordered></b-table>
    </b-modal>
  </div>
</template>

<script>
import State from './State.vue'
import System from './System'
import { mapActions } from 'vuex'
import toast from '@/mixins/toast'
import { getVision } from '@/libs/https'

export default {
  name: 'app',
  mixins:[toast],
  data(){
    return{
      logFollow: true,
      socketState:'',
      socket: null,
      stateVal:{},
      serverConn: true,
      msgEvent: null,
      logs:[],
      LOGO: window['LOGO'] || null,
      show: true,
      items: [],
      fields: [
        {key:'log', label: '日志'},
        // {key:'git_hash', label: 'hash'},
        {key:'tag', label: '标签'},
        {key:'created_at', label: '创建时间'},
      ]
    }
  },
  components: {
    State,System
  },
  filters:{
    // logType(type) {
    //   return {
    //     Debug: 'primary',
    //     Info: 'info',
    //     Warn: 'warning',
    //     Error: 'danger',
    //     Fatal: 'dark'
    //   }[type]
    // }
  },
  computed: {
    widthLogo() {
      return this.LOGO && this.LOGO !== ''
    }
  },
  mounted(){
    this.createSocket()
    this.GetSystem()
    .then(res => {})
    .catch(error => {
        this.toast(error,'danger')
    })
  },
  methods:{
    logType(type) {
     if(type == 'error'){
       return 'danger'
     }else{
       return type
     }
    },
    ...mapActions(['GetSystem']),
    clearLogs(){
      this.logs=[]
    },
    createSocket() {
        this.socketState = 'CONNECTING';
        let wsUrl
        if(process.env.NODE_ENV=='production'){
          let { protocol,hostname, port } = document.location;
          let scheme = protocol === 'https:' ? 'wss' : 'ws';
          let wsPort = port ? (':' + port) : '';
          wsUrl = scheme + '://' + hostname + wsPort + '/ws';
        }else{
            let { protocol } = document.location;
            let hostname = '192.168.0.251', port = '8800';
            let scheme = protocol === 'https:' ? 'wss' : 'ws';
            let wsPort = port ? (':' + port) : '';
            wsUrl = scheme + '://' + hostname + wsPort + '/ws';
        }
        this.socket = new WebSocket(wsUrl);
        [   'onopen',
            'onclose',
            'onmessage',
            'onerror'
        ].forEach(event => {
            this.socket[event] = this[event]
        })
    },
    onopen() {
      this.socketState = 'CONNECTED';
    },
    onclose() {
      this.socketState = 'DISCONNECTED';
      this.serverConn=false
    },
    onerror() {
      this.socketState = 'DISCONNECTED';
    },
    onmessage(e) {
      this.getData(e)
    },
    getData(e){
      let msg=JSON.parse(e.data)
      if(msg.type=='status') {
          this.stateVal=msg.data
        } else if(msg.type == 'log'){
          if(this.logs.length>100){
            this.logs.shift()
          }
          this.logs.push(msg)
          this.followLog(this.logFollow)
        }
    },
    followLog(e){
      this.logFollow=e
      if(this.logFollow){
        this.$nextTick(()=>{
          this.$refs.scroller.scrollTop = this.$refs.scroller.scrollHeight;
        })
      }
    },
    GetVision(){
      this.show = true
      getVision().then(res =>{
        this.show = false
        this.items = res
      },error => {
         this.show = false
        this.toast(error,'danger')
      })
    }
  }
}
</script>
<style scoped>
.logBody{ height: 660px; overflow: hidden;}
.logBody>div{ overflow: auto; height:100%; }
</style>

