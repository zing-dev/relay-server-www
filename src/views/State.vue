<template>
  <b-card no-body class="h100pct">
    <b-card-header header-tag="header" role="tab">
      <b-row>
        <b-col lg="3" md="12" sm="12">
          <span v-b-toggle.accordion-3> <b-badge variant="primary">{{ secondList.length }}</b-badge> 路继电器</span>
        </b-col>
        <b-col lg="9" md="12" sm="12">
          <div class="tool">
            <b-button size="sm" class="ml-2" @click="flip" variant="success">翻转全部</b-button>
            <b-button size="sm" class="ml-2" @click="offAll">断开全部</b-button>
            <b-button size="sm" class="ml-2" @click="onAll" variant="danger">吸合全部</b-button>
            <b-button size="sm" class="ml-2" @click="run" variant="info">运行</b-button>
            <b-button size="sm" class="ml-2" @click="reload" variant="outline-info">刷新</b-button>
          </div>
        </b-col>
      </b-row>
    </b-card-header>
    <b-collapse id="accordion-3" visible accordion="log" role="tabpanel">
      <b-card-body class="scroller pR">
        <Loading v-if="value.loading"></Loading>
        <template v-else>
          <b-overlay :show="!value.connected">
             <template v-slot:overlay>
              <div style="text-align:center">
                <div>继电器连接失败!</div>
                <div>请修改串口重新连接!</div>
              </div>
            </template>
            <div v-if="secondList.length">
              <b-row>
                <b-col class="colWrap" v-for="index in secondList.length" :key="index" lg="12" md="12" sm="12">
                  <div>
                    <span class="w6em">第{{ index }}路:</span>
                    <span class="fB" v-if="value.status[index - 1]" style="color:red;">
                      <Icon :name="'link'"></Icon>
                      <b-badge variant="danger" class="ml-2">已吸合</b-badge>
                    </span>
                    <span class="fB" v-else>
                      <Icon :name="'unlink'" style="color:darkslateblue"></Icon>
                      <b-badge class="ml-2">已断开</b-badge>
                    </span>
                  </div>
                  <div class="tool">
                    <div>
                      <b-button size="sm" @click="handle(index)" variant="outline-danger">翻转</b-button>
                      <b-button size="sm" class="ml-2" @click="handle(index)" v-if="value.status[index - 1]">断开</b-button>
                      <b-button size="sm" class="ml-2" @click="handle(index)" v-else variant="danger">吸合</b-button>
                      <b-button size="sm" class="ml-2" @click="offPoint(index)" v-if="secondList[index - 1].second">
                        {{ secondList[index - 1].second }}秒
                      </b-button>
                      <b-button size="sm" class="ml-2" @click="offPoint(index)" v-else-if="value.status[index - 1]">
                        点断
                      </b-button>
                      <b-button size="sm" class="ml-2" @click="offPoint(index)" v-else variant="danger">
                        点吸
                      </b-button>
                    </div>
                  </div>
                </b-col>
              </b-row>
            </div>
          </b-overlay>
        </template>
      </b-card-body>
    </b-collapse>
    <b-modal id="my-modal" title="点断" hide-footer>
      <div style="padding: 0 30px;">
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
import { mapGetters } from 'vuex'

export default {
  name: 'state',
  props: ['value'],
  components: { Loading },
  mixins: [toast],
  data() {
    return {
      socketState: '',
      second: '5',
      onOffPoint: 0,
      socket: null,
      status: {
        run: false,
        on: false,
        off: false
      },
      secondList: [],
    }
  },
  filters: {
    times(val) {
      if (val)
        return parseInt(val / 1000000000)
    }
  },
  watch: {
    sysData(res) {
      if (res.status) {
        if (res.data.branch_length > 0 ) {
          this.secondList = new Array(res.data.branch_length).fill({
            timer: null,
            second: 0
          })
        }
      }
    }
  },
  computed:{
    ...mapGetters(['sysData'])
  },
  methods: {
    resetSecondList() {
      this.secondList.forEach(el => {
        clearInterval(el.timer)
        el.timer = null
        el.second = 0
      })
      let data = [...this.secondList]
      this.$set(this, 'secondList', data)
    },
    reload() {
      window.location.reload()
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
          this.toast('闭合所有路成功', 'success')
        } else {
          this.toast('闭合所有路失败: ' + res.message, 'danger')
        }
        this.resetSecondList()
      }, error => {
        this.toast(error, 'danger')
      })
    },
    offAll() {
      api.relay.offAll().then(res => {
        if (res.status) {
          this.toast('断开所有路成功', 'success')
        } else {
          this.toast('断开所有路失败: ' + res.message, 'danger')
        }
        this.resetSecondList()
      }, error => {
        this.toast(error, 'danger')
      })
    },
    handle(index, callback) {
      if (this.value.status[index - 1]) {
        api.relay.off(index).then(res => {
          if (res.status) {
            this.toast('闭合成功', 'success')
          } else {
            this.toast('闭合失败: ' + res.message, 'danger')
            if (callback) callback()
          }
          this.resetTimer(index-1)
        }, error => {
          this.toast(error, 'danger')
        })
      } else {
        this.resetTimer(index-1)
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
        data.push(index + 1)
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
        api.relay.offPoint({branch: this.onOffPoint + 1, time: this.second * 1000}).then(() => {
          this.$set(this.secondList[this.onOffPoint], 'second', this.second)
          this.secondList[this.onOffPoint].second = this.second
          this.countDown(this.onOffPoint)
        }, error => {
          this.toast(error, 'danger')
        })
      } else {
        api.relay.onPoint({branch: this.onOffPoint + 1, time: this.second * 1000}).then(() => {
          this.secondList[this.onOffPoint].second = this.second
          this.countDown(this.onOffPoint)
        }, error => {
          this.toast(error, 'danger')
        })
      }
      this.$bvModal.hide('my-modal')
    },
    resetTimer(index) {
      let t = this.secondList[index]
      if (t !== null) {
        clearInterval(t.second)
        this.secondList[index].timer = null
        this.secondList[index].second = 0
      }
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
  min-width: 6em;
  max-width: 10em;
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


