<template>
  <b-card no-body class="h100pct">
    <b-card-header class="header-control" header-tag="header" role="tab">
      <span v-b-toggle.accordion-3>系统参数</span>
      <div class="tool">
        <b-button size="sm" @click="refresh">刷新</b-button>
      </div>
    </b-card-header>
    <b-collapse id="accordion-3" visible accordion="log" role="tabpanel">
      <b-card-body class="scroller pR">
        <Loading v-if="loading.system"></Loading>
        <b-form>
          <div class="inputWrap">
            <div class="">
              <label>web端口 :</label>
            </div>
            <div>
              <b-form-input type="number" v-model="data.port" @change="update"
                            :disabled="loading.system"></b-form-input>
            </div>
          </div>
          <div class="inputWrap">
            <div>
              <label>继电器SlaveId :</label>
            </div>
            <div>
              <b-form-input type="number" v-model="data.slave_id" @change="update"
                            :disabled="loading.system"></b-form-input>
            </div>
          </div>
          <div class="inputWrap">
            <div>
              <label>继电器串口:</label>
            </div>
            <div>
              <b-form-input v-model="data.address" @change="update" :disabled="loading.system"></b-form-input>
            </div>
          </div>
          <div class="inputWrap">
            <div>
              <label>继电器路数:</label>
            </div>
            <div>
              <b-form-input type="number" v-model="data.branch_length" @change="update"
                            :disabled="loading.system"></b-form-input>
            </div>
          </div>
          <div class="inputWrap">
            <div class="m-label">
              <label>白名单:</label>
            </div>
            <div>
              <template v-for="(item, index) in data.white_list">
                <div :key="index" v-if="data.white_list.length "
                     style="display:flex;align-items:center;  margin-bottom: 10px">
                  <div>
                    <b-form-input v-model="data.white_list[index]" :disabled="loading.system"></b-form-input>
                  </div>
                  <div class="iconWrap">
                    <div v-if="item !=='::1' && item !== '127.0.0.1'" @click="confirm(item)">
                      <Icon :name="'confirm'" class="icon confirm" :class="{disable: !item}" ></Icon>
                    </div>
                    <div  v-if=" data.white_list.length >1 && item !=='::1' && item !== '127.0.0.1'"  @click="del(index)">
                      <Icon :name="'del'" class="icon del" ></Icon>
                    </div>
                  </div>
                </div>
              </template>
            </div>
            <div style="padding-left:20px">
              <div @click="add">
                <Icon name="add"></Icon>
              </div>
              <!-- <i class="icon add" @click="add"></i> -->
            </div>
          </div>
        </b-form>
      </b-card-body>
    </b-collapse>
  </b-card>
</template>
<script>
import Loading from '@/components/Loading'
import toast from '@/mixins/toast'
import {api} from '@/libs/https'
import {mapActions, mapState, mapMutations} from 'vuex'

export default {
  name: 'system',
  components: {Loading},
  mixins: [toast],
  data() {
    return {
      data: {
        port: 0,
        slave_id: 0,
        address: 0,
        branch_length: 0,
        white_list: ['']
      },
    }
  },
  watch: {
    sysData(res) {
      let {white_list} = res.data
      this.data = {...res.data}
      this.data.white_list = white_list.length ? white_list : ['']
    }
  },
  mounted() {
  },
  computed: mapState(['loading', 'sysData']),
  methods: {
    ...mapActions(['GetSystem']),
    ...mapMutations(['setLoading']),
    refresh() {
      this.GetSystem('system').then(() => {
      }).catch(error => {
        this.toast(error, 'danger')
      })
    },
    update() {
      this.setLoading({system: true})
      let {port, slave_id, address, branch_length, white_list} = this.data
      let data = {
        port: parseFloat(port),
        slave_id: parseFloat(slave_id),
        branch_length: parseFloat(branch_length),
        address, white_list
      }
      api.config.set(JSON.stringify(data)).then(res => {
        this.setLoading({system: false})
        if (res.status) {
          this.toast('修改成功', 'success')
        } else {
          this.toast('修改失败: ' + res.message, 'danger')
        }
      }, error => {
        this.setLoading({system: false})
        this.toast(error, 'danger')
      })
    },
    add() {
      this.data.white_list.push('')
    },
    del(index) {
      console.log(index)
      if (this.data.white_list[index]) {
        this.data.white_list.splice(index, 1)
        this.update()
      } else {
        this.data.white_list.splice(index, 1)
      }
    },
    confirm(data) {
      if (data) {
        this.update()
      }
    }
  },
}
</script>
<style scoped>
.inputWrap {
  display: table;
  width: 100%;
  margin-bottom: 10px;
}

.inputWrap > div {
  display: table-cell;
}

.inputWrap > div.middle {
  vertical-align: middle
}

.inputWrap > div:first-child {
  width: 8em;
}

.inputWrap > div label {
  margin-bottom: 0
}

.inputWrap > div input {
  max-width: 17em
}

.icon {
  margin-left: 5px;
}

.icon.confirm {
  color: #007bff;
}

.icon.confirm.disable {
  color: #8a8a8a;
}

.icon.del {
  color: red;
}

.iconWrap {
  display: flex;
}
</style>


