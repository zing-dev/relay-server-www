<template>
    <b-card no-body class="h100pct">
        <b-card-header header-tag="header" role="tab">
            <b-row>
                <b-col lg="3" md="12" sm="12"> 
                    <span v-b-toggle.accordion-3>{{data == null ? 32 : data.branch_num}} 路继电器</span>
                </b-col>
                 <b-col lg="9" md="12" sm="12">  
                    <div class="tool">
                        <b-button size="sm"  class="ml-2" @click="flipRelay" variant="primary">翻转全部</b-button>
                        <b-button size="sm"  class="ml-2" @click="closeRelay" :disabled="disableState.closeRelay" variant="primary">断开全部</b-button>
                        <b-button size="sm"  class="ml-2" @click="openRelay" :disabled="disableState.openRelay" variant="primary">吸合全部</b-button>
                        <b-button size="sm" @click="runRelay" :disabled="disableState.runRelay" variant="primary">运行</b-button>
                    </div>
                </b-col>
            </b-row>
        </b-card-header>
        <b-collapse id="accordion-3" visible accordion="log" role="tabpanel">
            <b-card-body class="scroller pR" >
                <Loading v-if="loading.state || JSON.stringify(this.value) == '{}'"></Loading>
                <template v-else-if="data.branch_num >0">
                    <div>
                        <b-row>
                            <b-col class="colWrap" v-for="index in data.branch_num" :key="index" lg="6" md="12" sm="12"> 
                                <div>
                                    <span class="w6em">第{{index}}路:</span>
                                    <span class="fB" v-if="value.status[index - 1]">
                                        <Icon :name ="'link'" style="color: #28a745;"></Icon>
                                    </span>
                                    <span class="fB" v-else>
                                        <Icon :name ="'unlink'" style="color: red;"></Icon>
                                    </span>
                                </div>
                                <div class="tool">
                                    <div>
                                        <b-button size="sm" @click="openRelaySpecial(index-1)" v-if="value.status[index - 1]" variant="success">断开</b-button>
                                        <b-button size="sm" @click="openRelaySpecial(index-1)" v-else >吸合</b-button>
                                        <b-button size="sm" class="ml-2" @click="offPoint(index)" variant="warning" style="min-width:46px">
                                            <span>{{secondList[index-1].second? `${secondList[index-1].second}秒`: '点断'}}</span>
                                        </b-button>
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
        <b-modal id="my-modal" title="点断" hide-footer>
            <div style="padding: 0 30px;">
               <!-- <b-form-input type="number" v-model="second" placeholder="输入秒（<60s）"></b-form-input> -->
                <b-form-input id="range-1" v-model="second" type="range" min="0" max="60"></b-form-input>
                <div class="mt-2">点断秒数：{{ second }}秒</div>
            </div>
            <div style="text-align: right">
                <b-button class="mt-2" variant="primary" @click="comfirm">确定</b-button>
            </div>
        </b-modal>
    </b-card>

</template>
<script>

import { flipRelay, resetRelay, runRelay, openRelay, openRelaySpecial, closeRelaySpecial, exitRelay, closeRelay, heartBeat, onPoint, offPoint} from '@/libs/https'
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
            second: '5',
            onOffPoint: 0,
            socket: null,
            data:{
                branch_num: 0
            },
            disableState:{
                runRelay: false,
                openRelay: false,
                resetRelay: false,
                closeRelay:false
            },
            secondList:[]
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
            if(this.data.branch_num != val.status.length){
                this.GetSystem('state')
            }
        },
        sysData(val){
            let { branch_length } = val
            if(branch_length>0){
                this.data.branch_num = branch_length
                this.secondList = new Array(branch_length)
                for(let i = 0; i< branch_length; i++){
                    this.secondList[i] = {
                        timer: null,
                        second: 0
                    }
                }
            }
        }
    },
    computed: mapState([ 'loading', 'sysData' ]),
    created(){
    },
    mounted(){
    },
    methods:{
        ...mapActions(['GetSystem']),
        ...mapMutations(['setLoading']),
        resetSecondList(){
            this.secondList.forEach(el=>{
                clearInterval(el.timer)
                el.timer = null
                el.second = 0
            })
            let data = [...this.secondList]
            this.$set(this, 'secondList', data)
        },
        resetRelay(){
            this.disableState.resetRelay = true
            resetRelay().then(res=>{
                if(res){
                    this.toast('网络连接异常','danger')
                }else{
                    this.toast('重置成功','success')
                }
                this.disableState.resetRelay = false
                this.resetSecondList()
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
                    this.resetSecondList()
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
                    this.resetSecondList()
            },error=>{
                this.toast(error,'danger')
                this.disableState.openRelay = false   
            })
        },
        openRelaySpecial(index, callback){
           if(this.value.status[index]){
                closeRelaySpecial(index).then(res=>{
                   if(res){
                       this.toast('网络连接异常','danger')
                   }else{
                       this.toast('打开成功','success')
                       if(callback)callback()
                   }
                    this.resetSecondList()
               },error=>{
                    this.toast(error,'danger')
               })
           }else{
               openRelaySpecial(index).then(res=>{
                   if(res){
                       this.toast('网络连接异常','danger')
                   }else{
                       this.toast('打开成功','success')
                       if(callback)callback()
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
                this.resetSecondList()
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
                this.resetSecondList()
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
        flipRelay(){
            let data = []
            this.value.status.forEach((el, index )=>{
                data.push(index)
            })
            flipRelay(data).then(res =>{
                this.resetSecondList()
            }).catch(error => {
                 this.toast(error,'danger')
            })
        },
        offPoint(index){
            if(this.secondList[index-1].timer) return
            this.onOffPoint = index-1
            this.second = 5
            this.$bvModal.show('my-modal')
        },
        comfirm(){
            if(this.value.status[this.onOffPoint]){
                offPoint({branch: this.onOffPoint, time: this.second*1000}).then(res=>{
                    this.$set(this.secondList[this.onOffPoint], 'second', this.second )  
                    this.secondList[this.onOffPoint].second = this.second
                   this.countDown(this.onOffPoint)
                },error => {
                    this.toast(error,'danger')
                })
            }else{
                onPoint({branch: this.onOffPoint, time: this.second*1000}).then(res=>{
                    this.secondList[this.onOffPoint].second = this.second
                     this.countDown(this.onOffPoint)
                },error => {
                    this.toast(error,'danger')
                })
            }
            this.$bvModal.hide('my-modal')
        },
        countDown(index){
            this.secondList[index].timer = setInterval(() =>{
                if( this.secondList[index].second === 1){
                    clearInterval(this.secondList[index].timer)
                    this.secondList[index].second = 0
                    this.secondList[index].timer = null
                      //关闭定时器
                }else{
                    let data = [...this.secondList]
                    data[index].second = this.secondList[index].second -1
                    this.$set(this, 'secondList', data)
                }
            },1000)
        },
        countNumber(index){
            this.secondList[index].second--
        }

    }
}
</script>
<style scoped>
.tool{
    flex-direction: row-reverse;
}
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


