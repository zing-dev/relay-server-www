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
                        <div>
                            <label for="inline-form-input-name">继电器串口:</label>
                        </div>
                        <div>
                            <b-form-input type="number" v-model="data.relay_port" @change="update" :disabled="loading.system"></b-form-input>
                        </div>
                    </div>
                    <div class="inputWrap">
                        <div>
                            <label for="inline-form-input-name">保存日志的时间(天):</label>
                        </div>
                        <div>
                            <b-form-input type="number" v-model="data.save_log_time" @change="update" :disabled="loading.system"></b-form-input>
                        </div>
                    </div>
                    <div class="inputWrap">
                        <div>
                           <label for="inline-form-input-name">自动重置继电器(秒):</label>
                        </div>
                        <div>
                            <b-form-input type="number" v-model="data.auto_reset_time" @change="update" :disabled="loading.system"></b-form-input>
                        </div>
                    </div>
                    <div class="inputWrap">
                        <div>
                            <label for="inline-form-input-name">继电器路数:</label>
                        </div>
                        <div>
                            <b-form-input type="number" v-model="data.branch_num" @change="update" :disabled="loading.system"></b-form-input>
                        </div>
                    </div>
                    <!-- <div class="inputWrap">
                        <div>
                            <label for="inline-form-input-name">MQTT地址:</label>
                        </div>
                        <div>
                            <b-form-input v-model="data.mq_address" @change="update"></b-form-input>
                        </div>
                    </div> -->
                </b-form>
            </b-card-body>
        </b-collapse>
    </b-card>
</template>
<script>
import Loading from '@/components/Loading'
import toast from '@/mixins/toast'
import { setSystem } from '@/libs/https'
import { mapActions, mapState, mapMutations } from 'vuex'

export default {
    name:'system',
    components:{Loading},
    mixins:[toast],
    data(){
        return{
            data:{
                relay_port:0,
                save_log_time:0,
                auto_reset_time:0,
                branch_num:0,
                mq_address:0
            },
        }
    },
     watch:{
        sysData(val){
            let {branch_num,relay_port,save_log_time,mq_address,auto_reset_time} = this.sysData
            this.data={branch_num,relay_port,save_log_time,mq_address,auto_reset_time}
        }
    },
    computed: mapState([ 'loading', 'sysData' ]),
    methods:{
        ...mapActions(['GetSystem']),
        ...mapMutations(['setLoading']),
        refresh(){
            this.GetSystem('system').then(res => {})
            .catch(error => {
                this.toast(error,'danger')
            })
        },
        update(e){
            this.setLoading({system: true})
            let {branch_num,relay_port,save_log_time,auto_reset_time} = this.data
            let data={
                relay_port:parseFloat(relay_port),
                save_log_time:parseFloat(save_log_time),
                auto_reset_time:parseFloat(auto_reset_time),
                branch_num:parseFloat(branch_num),
            }
            // await this.SetSystem(data)
            setSystem(JSON.stringify(data)).then(res=>{
                 this.setLoading({system: false})
                if(res){
                    this.toast('网络连接异常','danger')
                }else{
                    this.toast('修改成功','success')
                }
            },error=>{
                 this.setLoading({system: false})
                this.toast(error,'danger')
            })
        },
    },
}
</script>
<style scoped>
.inputWrap{
    display: table;
    width: 100%;
    margin-bottom: 10px;
}
.inputWrap>div{
    display: table-cell;
    vertical-align: middle
}
.inputWrap>div:first-child{
    width: 12em;
}
.inputWrap>div label{
    margin-bottom: 0
}
.inputWrap>div input{
    width: 15em
}
</style>


