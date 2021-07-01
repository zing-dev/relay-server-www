<template>
  <div id="app">
    <div>
      <b-navbar toggleable="lg" type="dark">
        <b-navbar-nav>
          <img title='logo' :src="config.logo" style="height:30px;margin-right:15px" v-if="config.logo"
               alt="config.logo"/>
          <b-navbar-brand href="#">{{ config.site_name }}</b-navbar-brand>
        </b-navbar-nav>
        <b-navbar-nav class="ml-auto">
          <b-nav-item>
            <b-button size="sm" variant="success" id="tooltip-target-1">运行时间</b-button>
            <b-tooltip target="tooltip-target-1" triggers="hover">
              <div style="text-align: left">
                <div>当前:{{ time.current|datetime }}</div>
                <div>运行:{{ time.running| subtract }}</div>
                <div>连接:{{ time.connecting|subtract }}</div>
              </div>
            </b-tooltip>
          </b-nav-item>
          <b-nav-item>
            <b-button size="sm" variant="primary" class="my-2 my-sm-0" v-b-modal.modal-1 @click="version">版本信息
            </b-button>
          </b-nav-item>
        </b-navbar-nav>
      </b-navbar>
    </div>
    <div class="view">
      <b-container class="home" fluid="fluid">
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
                    <b-form-checkbox :checked="logFollow" @change="followLog">
                      滚动条跟随
                    </b-form-checkbox>
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
                              {{ log.time + "  " + log.msg }}
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
import {mapActions} from 'vuex'
import toast from '@/mixins/toast'
import {api} from '@/libs/https'
import moment from "moment";

let config = window.Config
if (config.logo === undefined) {
  config.logo = ''
}
if (config.site_name === undefined || config.site_name === '') {
  config.site_name = '继电器模块应用'
}

export default {
  name: 'app',
  mixins: [toast],
  data() {
    return {
      time: {
        current: {},
        running: "",
        connecting: "",
      },
      logFollow: true,
      socketState: '',
      socket: null,
      stateVal: {},
      serverConn: true,
      msgEvent: null,
      logs: [],
      config,
      show: true,
      items: [],
      fields: [
        {key: 'log', label: '日志'},
        {key: 'tag', label: '标签'},
        {key: 'created_at', label: '创建时间'},
      ]
    }
  },
  components: {
    State, System
  },
  computed: {},
  mounted() {
    this.createSocket()
    this.GetSystem()
        .then(() => {
        })
        .catch(error => {
          this.toast(error, 'danger')
        })

    api.relay.ping().then(res => {
      if (res.status) {
        this.time.current = moment()
        this.time.connecting = res.data.connected_time
        this.time.running = res.data.running_time
        // setInterval(this.current, 1000)
      }
    });
  },
  filters: {
    datetime: function () {
      return moment().format('l LTS');
    },
    subtract: function (diff) {
      return moment.duration(-diff, "seconds").humanize(true);
    }
  },
  methods: {
    current() {
    },
    logType(type) {
      if (type === 'error') {
        return 'danger'
      } else {
        return type
      }
    },
    ...mapActions(['GetSystem']),
    clearLogs() {
      this.logs = []
    },
    createSocket() {
      this.socketState = 'CONNECTING';
      let wsUrl
      if (process.env.NODE_ENV === 'production') {
        let {protocol, hostname, port} = document.location;
        let scheme = protocol === 'https:' ? 'wss' : 'ws';
        let wsPort = port ? (':' + port) : '';
        wsUrl = scheme + '://' + hostname + wsPort + '/ws';
      } else {
        let {protocol} = document.location;
        let hostname = '192.168.0.251', port = '8800';
        let scheme = protocol === 'https:' ? 'wss' : 'ws';
        let wsPort = port ? (':' + port) : '';
        wsUrl = scheme + '://' + hostname + wsPort + '/ws';
      }
      this.socket = new WebSocket(wsUrl);
      ['onopen', 'onclose', 'onmessage', 'onerror'].forEach(event => {
        this.socket[event] = this[event]
      })
    },
    onopen() {
      this.socketState = 'CONNECTED';
    },
    onclose() {
      this.socketState = 'DISCONNECTED';
      this.serverConn = false
    },
    onerror() {
      this.socketState = 'DISCONNECTED';
    },
    onmessage(e) {
      this.getData(e)
    },
    getData(e) {
      let msg = JSON.parse(e.data)
      if (msg.type === 'status') {
        this.stateVal = msg.data
      } else if (msg.type === 'log') {
        if (this.logs.length > 100) {
          this.logs.shift()
        }
        this.logs.push(msg)
        this.followLog(this.logFollow)
      }
    },
    followLog(e) {
      this.logFollow = e
      if (this.logFollow) {
        this.$nextTick(() => {
          this.$refs.scroller.scrollTop = this.$refs.scroller.scrollHeight;
        })
      }
    },
    version() {
      this.show = true
      api.version().then(res => {
        if (res.status) {
          this.show = false
          this.items = res.data
        } else {
          this.toast("获取版本信息失败", 'danger')
        }
      }, error => {
        this.show = false
        this.toast(error, 'danger')
      })
    }
  }
}
</script>
<style scoped>
.logBody {
  height: 660px;
  overflow: hidden;
}

.logBody > div {
  overflow: auto;
  height: 100%;
}
</style>

