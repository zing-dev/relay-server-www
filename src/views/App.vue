<template>
  <div id="app">
    <div>
      <b-navbar toggleable="lg" type="dark">
        <img src="./../assets/headlogo.png" style="height:30px;margin-right:15px"/>
        <b-navbar-brand href="#">继电器模块</b-navbar-brand>
        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
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
                            <b-list-group-item :variant="log.level" v-for="(log, index) in logs" :key="index">
                              {{ log.msg }}
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
  </div>
</template>

<script>
import State from './State.vue'
import System from './System'

export default {
  name: 'app',
  data(){
    return{
      logFollow: true,
      socketState:'',
      socket: null,
      stateVal:{},
      serverConn: true,
      logs:[],
    }
  },
  components: {
    State,System
  },
  filters:{
    logType(type) {
      return {
        Debug: 'primary',
        Info: 'info',
        Warn: 'warning',
        Error: 'danger',
        Fatal: 'dark'
      }[type]
    }
  },
  mounted(){
    this.createSocket()
  },
  methods:{
    clearLogs(){
      this.logs=[]
    },
    createSocket() {
        this.socketState = 'CONNECTING';
        let wsUrl
        if(process.env.NODE_ENV=='production'){
          let { protocol } = document.location;
          let hostname = '192.168.0.136', port = '8800';
          let scheme = protocol === 'https:' ? 'wss' : 'ws';
          let wsPort = port ? (':' + port) : '';
          wsUrl = scheme + '://' + hostname + wsPort + '/msg';
        } else {
            let { protocol } = document.location;
            let hostname = '192.168.0.136', port = '8800';
            let scheme = protocol === 'https:' ? 'wss' : 'ws';
            let wsPort = port ? (':' + port) : '';
            wsUrl = scheme + '://' + hostname + wsPort + '/msg';
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
    onopen(e) {
      this.socketState = 'CONNECTED';
      let msg=JSON.parse(e.data)
      this.logs.push(msg.value)
    },
    onclose(e) {
      this.socketState = 'DISCONNECTED';
      this.serverConn=false
      let msg=JSON.parse(e.data)
      this.logs.push(msg.value)
    },
    onerror(e) {
      this.socketState = 'DISCONNECTED';
      let msg=JSON.parse(e.data)
      this.logs.push(msg.value)
    },
    onmessage(e) {
        this.getData(e)
    },
    getData(e){
        let msg=JSON.parse(e.data)
      if(msg.type=='sys_state') {
          this.stateVal=msg.data
        } else {
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
    }
  }
}
</script>
<style scoped>
.logBody{ height: 660px; overflow: hidden;}
.logBody>div{ overflow: auto; height:100%; }
</style>

