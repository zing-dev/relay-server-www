<template>
    <b-card no-body class="h100pct">
        <b-card-header class="header-control" header-tag="header" role="tab">
            <span v-b-toggle.accordion-3>{{data == null ? 32 : data.branch_num}} 路继电器</span>
            <div class="tool">
                <b-button size="sm" @click="runRelay" :disabled="disableState.runRelay" variant="primary">运行继电器</b-button>
            </div>
            <div class="tool">
                <b-button size="sm" @click="openRelay" :disabled="disableState.openRelay" variant="primary">吸合继电器</b-button>
            </div>
            <div class="tool">
            <b-button size="sm" @click="resetRelay" :disabled="disableState.resetRelay" variant="primary">重置继电器</b-button>
            </div>
            <div class="tool">
                <b-button size="sm" @click="closeRelay" :disabled="disableState.closeRelay" variant="primary">断开继电器</b-button>
            </div>
        </b-card-header>
        <b-collapse id="accordion-3" visible accordion="log" role="tabpanel">
            <b-card-body class="scroller pR" >
                <Loading v-if="loading.state"></Loading>
                <template v-else>
                    <div v-for="index in Math.ceil(data.branch_num/2)" :key="index" >
                        <b-row>
                            <b-col class="colWrap">
                                <div>
                                    <span class="w6em">第{{index}}路:</span><span class="fB">{{value.branches == null ? '未连接': (value.branches[index - 1].status) ? "吸合" : "断开"}}&nbsp;&nbsp;&nbsp;{{value.branches == null ? '': value.branches[index - 1].left_time/1000000000}}</span>秒
                                </div>
                                <div class="tool">
                                    <div v-if="value.branches">
                                        <b-button size="sm" @click="openRelaySpecial(index-1)" v-if="value.branches[index - 1].status" variant="success">断开继电器</b-button>
                                        <b-button size="sm" @click="openRelaySpecial(index-1)" v-else >吸合继电器</b-button>
                                    </div>
                                </div>
                            </b-col>
                            
                            <b-col >
                                <div v-if="index+Math.ceil(data.branch_num/2)-1 < data.branch_num" class="colWrap">
                                    <div>
                                        <span class="w6em">第{{index + Math.ceil(data.branch_num/2)}}路:</span><span class="fB">{{value.branches == null ? '未连接': value.branches[index + Math.ceil(data.branch_num/2)-1].status ? "吸合" : "断开"}}&nbsp;&nbsp;&nbsp;{{value.branches == null ? '': value.branches[index + Math.ceil(data.branch_num/2)-1].left_time/1000000000}}</span>秒
                                    </div>
                                    <div class="tool">
                                        <div v-if="value.branches">
                                            <b-button size="sm" @click="openRelaySpecial(index + Math.ceil(data.branch_num/2)-1)" v-if="value.branches[index + Math.ceil(data.branch_num/2)-1].status" variant="success">断开继电器</b-button>
                                            <b-button size="sm" @click="openRelaySpecial(index + Math.ceil(data.branch_num/2)-1)" v-else>吸合继电器</b-button>
                                        </div>
                                    </div>
                                </div>
                            </b-col>
                        </b-row>
                    </div>
                    <b-col><span class="w6em">运行时间：</span><span class="fB">{{value.running_time | time}}</span></b-col>
                    <b-col><span class="w6em">前后端吸合：</span><span class="fB">{{serverConn?'连接':'断开'}}</span></b-col>
                </template>
            </b-card-body>

        </b-collapse>
    </b-card>

</template>
<script>

import { resetRelay, runRelay, openRelay, openRelaySpecial, closeRelaySpecial, exitRelay, closeRelay, heartBeat} from '@/libs/https'
import Loading from '@/components/Loading'
import toast from '@/mixins/toast'
import { mapActions, mapState, mapMutations } from 'vuex'

export default {
    name:'state',
    props:['value', 'serverConn'],
    components:{Loading},
    mixins:[toast],
    data(){
        return{
            socketState: '',
            socket: null,
            data:{
                branch_num:0
            },
            disableState:{
                runRelay: false,
                openRelay: false,
                resetRelay: false,
                closeRelay:false
            }
        }
    },
    filters:{
        time(val){ 
            if(val)
            return parseInt(val/86400)+"天 "+parseInt(val/3600%24)+"时 "+ parseInt(val/60)%60 +"分 "+parseInt(val%60)+"秒"
        },
        times(val){
            if(val)
            return parseInt(val/1000000000)
        }
    },
    watch:{
        value(val, oldval){
            if(this.data.branch_num != val.branches.length){
               this.GetSystem('state').then(res => {})
               .catch(error => {
                    this.toast(error,'danger')
               })
            }
        },
        sysData(val){
            let { branch_num } = this.sysData
            this.data.branch_num = branch_num
        }
    },
    computed: mapState([ 'loading', 'sysData' ]),
    mounted(){
    },
    methods:{
        ...mapActions(['GetSystem']),
        ...mapMutations(['setLoading']),
        resetRelay(){
            this.disableState.resetRelay = true
            resetRelay().then(res=>{
                if(res){
                    this.toast('网络连接异常','danger')
                }else{
                    this.toast('重置成功','success')
                }
                this.disableState.resetRelay = false
            },error=>{
                    this.toast(error,'danger')
                    this.disableState.resetRelay = false
            })
       },
        runRelay(){
            this.disableState.runRelay = true
            runRelay().then(res=>{
                if(res){
                    this.toast('网络连接异常','danger')
                }else{
                    this.toast('运行成功','success')
                }
                this.disableState.runRelay = false
            },error=>{
                this.toast('网络连接异常' + error,'danger')
                this.disableState.runRelay = false
            })
        },
        openRelay(){
            this.disableState.openRelay = true
            openRelay().then(res=>{
                if(res){
                    this.toast('网络连接异常','danger')
                }else{
                    this.toast('打开成功','success')
                }
                this.disableState.openRelay = false
            },error=>{
                this.toast(error,'danger')
                this.disableState.openRelay = false   
            })
        },
        openRelaySpecial(index){
           if(this.value.branches[index].status){
                closeRelaySpecial(index).then(res=>{
                   if(res){
                       this.toast('网络连接异常','danger')
                   }else{
                       this.toast('打开成功','success')
                   }
               },error=>{
                    this.toast(error,'danger')
               })
           }else{
               openRelaySpecial(index).then(res=>{
                   if(res){
                       this.toast('网络连接异常','danger')
                   }else{
                       this.toast('打开成功','success')
                   }
               },error=>{
                   this.toast(error,'danger')
               })
           }
        },
        exitRelay(){
            exitRelay().then(res=>{
                if(res){
                    this.toast('网络连接异常','danger')
                }else{
                    this.toast('编辑成功','success')
                }
            },error=>{
                this.toast(error,'danger')
            })
        },
        closeRelay(){
            this.disableState.closeRelay = true
            closeRelay().then(res=>{
                if(res){
                    this.toast('网络连接异常','danger')
                }else{
                    this.toast('关闭成功','success')
                }
                this.disableState.closeRelay = false
            },error=>{
                this.disableState.closeRelay = false
                this.toast(error,'danger')
            })
        },
        heartBeat(){
            heartBeat().then(res=>{
                if(res){
                    this.toast('网络连接异常','danger')
                }else{
                    this.toast('关闭成功','success')
                }
            },error=>{
                this.toast(error,'danger')
            })
        },
    }
}
</script>
<style scoped>
.w6em{
    width: 6em;
    display: inline-block
}
.colWrap{
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 5px;
}
</style>


