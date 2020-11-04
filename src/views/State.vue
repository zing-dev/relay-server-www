<template>
  <b-card no-body class="h100pct">
    <b-card-header header-tag="header" role="tab">
      <b-row>
        <b-col lg="3" md="12" sm="12">
          <span v-b-toggle.accordion-3>{{data == null ? 32 : data.branch_num}}
            路继电器
          </span>
        </b-col>
        <b-col lg="9" md="12" sm="12">
          <div class="tool">
            <b-button size="sm" class="ml-2" @click="flip" variant="primary">翻转全部</b-button>
            <b-button size="sm" class="ml-2" @click="offAll" :disabled="status.off" variant="primary">
              断开全部
            </b-button>
            <b-button size="sm" class="ml-2" @click="onAll" :disabled="status.on" variant="primary">
              吸合全部
            </b-button>
            <b-button size="sm" @click="run" :disabled="status.run" variant="primary">运行</b-button>
          </div>
        </b-col>
      </b-row>
    </b-card-header>
    <b-collapse id="accordion-3" visible accordion="log" role="tabpanel">
      <b-card-body class="scroller pR">
        <Loading v-if="loading.state || JSON.stringify(this.value) === '{}'"></Loading>
        <template v-else-if="data.branch_num >0">
          <div>
            <b-row>
              <b-col class="colWrap" v-for="index in data.branch_num" :key="index" lg="6" md="12" sm="12">
                <div>
                  <span class="w6em">第{{index}}路:</span>
                  <span class="fB" v-if="value.status[index - 1]">
                    <Icon :name="'link'" style="color: #28a745;"></Icon>
                  </span>
                  <span class="fB" v-else>
                    <Icon :name="'unlink'" style="color: red;"></Icon>
                  </span>
                </div>
                <div class="tool">
                  <div>
                    <b-button size="sm" @click="handle(index-1)" v-if="value.status[index - 1]"
                              variant="success">断开
                    </b-button>
                    <b-button size="sm" @click="handle(index-1)" v-else>吸合</b-button>
                    <b-button size="sm" class="ml-2" @click="offPoint(index)" variant="warning" style="min-width:46px">
                      <span>{{secondList[index - 1].second ? `${secondList[index - 1].second}秒` : '点断'}}</span>
                    </b-button>
                  </div>
                </div>
              </b-col>
            </b-row>
          </div>
          <div>
            <span class="w6em">运行时间：</span><span class="running-time">{{value.running_time | time}}</span>
            <span class="w6em">连接时间：</span><span class="connected-time">{{value.connected_time | time}}</span>
          </div>
          <!--          <b-col><span class="w6em">前后端吸合：</span><span class="fB">{{serverConn ? '连接' : '断开'
          }}</span></b-col>-->
        </template>
      </b-card-body>

    </b-collapse>
    <b-modal id="my-modal" title="点断" hide-footer>
      <div style="padding: 0 30px;">
        <!-- <b-form-input type="number" v-model="second" placeholder="输入秒（<60s）"></b-form-input> -->
        <b-form-input id="range-1" v-model="second" type="range" min="0" max="60"></b-form-input>
        <div class="mt-2">点断秒数：{{ second }}秒</div>
      </div>
      <div style="text-align: right">
        <b-button class="mt-2" variant="primary" @click="confirm">确定</b-button>
      </div>
    </b-modal>
  </b-card>

</template>
<script>

import {api} from '@/libs/https'
import Loading from '@/components/Loading'
import toast from '@/mixins/toast'
import {mapActions, mapState, mapMutations} from 'vuex'

export default {
  name: 'state',
  props: ['value', 'serverConn'],
  components: {Loading},
  mixins: [toast],
  data() {
    return {
      socketState: '',
      second: '5',
      onOffPoint: 0,
      socket: null,
      data: {
        branch_num: 0
      },
      status: {
        run: false,
        on: false,
        off: false
      },
      secondList: []
    }
  },
  filters: {
    time(val) {
      if (val)
        return parseInt(val / 86400) + "天 " + parseInt(val / 3600 % 24) + "时 " + parseInt(val / 60) % 60 + "分 " + parseInt(val % 60) + "秒"
    },
    times(val) {
      if (val)
        return parseInt(val / 1000000000)
    }
  },
  watch: {
    value(res) {
      if (this.data.branch_num !== res.status.length) {
        this.GetSystem('state')
        this.data.branch_num = res.status.length
      }
    },
    sysData(res) {
      if (res.status) {
        if (res.data.branch_length > 0) {
          this.data.branch_num = res.data.branch_length
          this.secondList = new Array(res.data.branch_length)
          for (let i = 0; i < res.data.branch_length; i++) {
            this.secondList[i] = {
              timer: null,
              second: 0
            }
          }
        }
      }
    }
  },
  computed: mapState(['loading', 'sysData']),
  created() {
  },
  mounted() {
  },
  methods: {
    ...mapActions(['GetSystem']),
    ...mapMutations(['setLoading']),
    resetSecondList() {
      this.secondList.forEach(el => {
        clearInterval(el.timer)
        el.timer = null
        el.second = 0
      })
      let data = [...this.secondList]
      this.$set(this, 'secondList', data)
    },
    run() {
      this.status.run = true
      api.relay.run().then(res => {
        if (res.status) {
          this.toast('运行成功', 'success')
        } else {
          this.toast('运行失败:' + res.message, 'danger')
        }
        this.status.run = false
        this.resetSecondList()
      }, error => {
        this.toast(error, 'danger')
        this.status.run = false
      })
    },
    onAll() {
      api.relay.onAll().then(res => {
        if (res.status) {
          this.status.on = true
          this.status.off = false
          this.toast('闭合所有路成功', 'success')
        } else {
          this.status.on = false
          this.status.off = true
          this.toast('闭合所有路失败: ' + res.message, 'danger')
        }
        this.resetSecondList()
      }, error => {
        this.toast(error, 'danger')
        this.status.on = false
        this.status.off = true
      })
    },
    offAll() {
      api.relay.offAll().then(res => {
        if (res.status) {
          this.status.on = false
          this.status.off = true
          this.toast('断开所有路成功', 'success')
        } else {
          this.status.off = false
          this.status.on = true
          this.toast('断开所有路失败: ' + res.message, 'danger')
        }
        this.resetSecondList()
      }, error => {
        this.status.off = false
        this.status.on = true
        this.toast(error, 'danger')
      })
    },
    handle(index, callback) {
      if (this.value.status[index]) {
        api.relay.off(index).then(res => {
          if (res.status) {
            this.toast('闭合成功', 'success')
          } else {
            this.toast('闭合失败: ' + res.message, 'danger')
            if (callback) callback()
          }
          this.resetSecondList()
        }, error => {
          this.toast(error, 'danger')
        })
      } else {
        api.relay.on(index).then(res => {
          if (res.status) {
            this.toast('断开成功', 'success')
          } else {
            this.toast('断开失败: ' + res.message, 'danger')
            if (callback) callback()
          }
        }, error => {
          this.toast(error, 'danger')
        })
      }
    },
    flip() {
      let data = []
      this.value.status.forEach((el, index) => {
        data.push(index)
      })
      api.relay.flip(data).then(() => {
        this.resetSecondList()
      }).catch(error => {
        this.toast(error, 'danger')
      })
    },
    offPoint(index) {
      if (this.secondList[index - 1].timer) return
      this.onOffPoint = index - 1
      this.second = 5
      this.$bvModal.show('my-modal')
    },
    confirm() {
      if (this.value.status[this.onOffPoint]) {
        api.relay.offPoint({branch: this.onOffPoint, time: this.second * 1000}).then(() => {
          this.$set(this.secondList[this.onOffPoint], 'second', this.second)
          this.secondList[this.onOffPoint].second = this.second
          this.countDown(this.onOffPoint)
        }, error => {
          this.toast(error, 'danger')
        })
      } else {
        api.relay.onPoint({branch: this.onOffPoint, time: this.second * 1000}).then(() => {
          this.secondList[this.onOffPoint].second = this.second
          this.countDown(this.onOffPoint)
        }, error => {
          this.toast(error, 'danger')
        })
      }
      this.$bvModal.hide('my-modal')
    },
    countDown(index) {
      this.secondList[index].timer = setInterval(() => {
        if (this.secondList[index].second <= 1) {
          clearInterval(this.secondList[index].timer)
          this.secondList[index].second = 0
          this.secondList[index].timer = null
        } else {
          let data = [...this.secondList]
          data[index].second = this.secondList[index].second - 1
          this.$set(this, 'secondList', data)
        }
      }, 1000)
    },
  }
}
</script>
<style scoped>
.tool {
  flex-direction: row-reverse;
}

.w6em {
  width: 6em;
  display: inline-block
}

.running-time {
  margin-right: 20px;
}

.colWrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
}
</style>


