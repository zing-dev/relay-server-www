<template>
    <b-card no-body class="h100pct">
        <b-card-header class="header-control" header-tag="header" role="tab">
            <span v-b-toggle.accordion-3>状态</span>
            <div class="tool">
                <b-button size="sm" @click="runRelay">运行继电器</b-button>
            </div>
            <div class="tool">
                <b-button size="sm" @click="openRelay">打开继电器</b-button>
            </div>
            <div class="tool">
            <b-button size="sm" @click="resetRelay">重置继电器</b-button>
            </div>
        </b-card-header>
        <b-collapse id="accordion-3" visible accordion="log" role="tabpanel">
            <b-card-body class="scroller pR" >
                <Loading v-if="loading"></Loading>
                <b-card-text>
                    <b-row>
                        <b-col><span class="w6em">寄存器1：</span><span class="fB">{{value.register1?'闭合':'断开'}}&nbsp;&nbsp;&nbsp;{{value.register_time1}}</span>秒</b-col>
                        <b-col><span class="w6em">寄存器11：</span><span class="fB">{{value.register11?'闭合':'断开'}}&nbsp;&nbsp;&nbsp;{{value.register_time11}}</span>秒</b-col>
                    </b-row>
                </b-card-text>
                <b-card-text>
                    <b-row>
                        <b-col><span class="w6em">寄存器2：</span><span class="fB">{{value.register2?'闭合':'断开'}}&nbsp;&nbsp;&nbsp;{{value.register_time2}}</span>秒</b-col>
                        <b-col><span class="w6em">寄存器12：</span><span class="fB">{{value.register12?'闭合':'断开'}}&nbsp;&nbsp;&nbsp;{{value.register_time12}}</span>秒</b-col>
                    </b-row>
                </b-card-text>
                <b-card-text>
                    <b-row>
                        <b-col><span class="w6em">寄存器3：</span><span class="fB">{{value.register3?'闭合':'断开'}}&nbsp;&nbsp;&nbsp;{{value.register_time3}}</span>秒</b-col>
                        <b-col><span class="w6em">寄存器13：</span><span class="fB">{{value.register13?'闭合':'断开'}}&nbsp;&nbsp;&nbsp;{{value.register_time13}}</span>秒</b-col>
                    </b-row>
                </b-card-text>
                <b-card-text>
                    <b-row>
                        <b-col><span class="w6em">寄存器4：</span><span class="fB">{{value.register4?'闭合':'断开'}}&nbsp;&nbsp;&nbsp;{{value.register_time4}}</span>秒</b-col>
                        <b-col><span class="w6em">寄存器14：</span><span class="fB">{{value.register14?'闭合':'断开'}}&nbsp;&nbsp;&nbsp;{{value.register_time14}}</span>秒</b-col>
                    </b-row>
                </b-card-text>
                <b-card-text>
                    <b-row>
                        <b-col><span class="w6em">寄存器5：</span><span class="fB">{{value.register5?'闭合':'断开'}}&nbsp;&nbsp;&nbsp;{{value.register_time5}}</span>秒</b-col>
                        <b-col><span class="w6em">寄存器15：</span><span class="fB">{{value.register15?'闭合':'断开'}}&nbsp;&nbsp;&nbsp;{{value.register_time15}}</span>秒</b-col>
                    </b-row>
                </b-card-text>
                <b-card-text>
                    <b-row>
                        <b-col><span class="w6em">寄存器6：</span><span class="fB">{{value.register6?'闭合':'断开'}}&nbsp;&nbsp;&nbsp;{{value.register_time16}}</span>秒</b-col>
                        <b-col><span class="w6em">寄存器16：</span><span class="fB">{{value.register16?'闭合':'断开'}}&nbsp;&nbsp;&nbsp;{{value.register_time16}}</span>秒</b-col>
                    </b-row>
                </b-card-text>
                <b-card-text>
                    <b-row>
                        <b-col><span class="w6em">寄存器7：</span><span class="fB">{{value.register7?'闭合':'断开'}}&nbsp;&nbsp;&nbsp;{{value.register_time7}}</span>秒</b-col>
                        <b-col><span class="w6em">继电器闭合：</span><span class="fB">{{value.relay_conn?'连接':'断开'}}</span></b-col>
                    </b-row>
                </b-card-text>
                <b-card-text>
                    <b-row>
                        <b-col><span class="w6em">寄存器8：</span><span class="fB">{{value.register8?'闭合':'断开'}}&nbsp;&nbsp;&nbsp;{{value.register_time8}}</span>秒</b-col>
                        <b-col><span class="w6em">前后端闭合：</span><span class="fB">{{serverConn?'连接':'断开'}}</span></b-col>
                    </b-row>
                </b-card-text>
                <b-card-text>
                    <b-row>
                        <b-col><span class="w6em">寄存器9：</span><span class="fB">{{value.register9?'闭合':'断开'}}&nbsp;&nbsp;&nbsp;{{value.register_time9}}</span>秒</b-col>
                        <b-col><span class="w6em">运行时间：</span><span class="fB">{{value.startup_time | time}}</span></b-col>
                    </b-row>
                </b-card-text>
                <b-card-text>
                    <b-row>
                        <b-col><span class="w6em">寄存器10：</span><span class="fB">{{value.register10?'闭合':'断开'}}&nbsp;&nbsp;&nbsp;{{value.register_time10}}</span>秒</b-col>
                    </b-row>
                </b-card-text>
            </b-card-body>
        </b-collapse>
    </b-card>

</template>
<script>

import { resetRelay, runRelay, openRelay, exitRelay, closeRelay, heartBeat} from '@/libs/https'
import Loading from '@/components/Loading'
import toast from '@/mixins/toast'

export default {
    name:'state',
    props:['value','serverConn'],
    components:{Loading},
    mixins:[toast],
    data(){
        return{
            socketState:'',
            socket: null,
            loading:false
        }
    },
    filters:{
        time(val){
        if(val)
        return parseInt(val/86400000)+"天 "+parseInt(val/3600000%24)+"时 "+parseInt(val/60000%60)+"分 "+parseInt(val/1000%60)+"秒"
        }
    },
    mounted(){

    },
    methods:{
       resetRelay(){
           this.loading=true
           resetRelay().then(res=>{
               this.loading=false
               if(res){
                   this.toast('网络连接异常','danger')
               }else{
                   this.toast('重置成功','success')
               }
           },error=>{
                this.loading=false
                this.toast(error,'danger')
           })
       },
        runRelay(){
            this.loading=true
            runRelay().then(res=>{
                this.loading=false
                if(res){
                    this.toast('网络连接异常','danger')
                }else{
                    this.toast('运行成功','success')
                }
            },error=>{
                this.loading=false
                this.toast('网络连接异常' + error,'danger')
            })
        },
        openRelay(){
            this.loading=true
            openRelay().then(res=>{
                this.loading=false
                if(!res){
                    this.toast('网络连接异常','danger')
                }else{
                    this.toast('打开成功','success')
                }
            },error=>{
                this.loading=false
                this.toast(error,'danger')
            })
        },
        exitRelay(){
            this.loading=true
            exitRelay().then(res=>{
                this.loading=false
                if(!res){
                    this.toast('网络连接异常','danger')
                }else{
                    this.toast('编辑成功','success')
                }
            },error=>{
                this.loading=false
                this.toast(error,'danger')
            })
        },
        closeRelay(){
            this.loading=true
            closeRelay().then(res=>{
                this.loading=false
                if(!res){
                    this.toast('网络连接异常','danger')
                }else{
                    this.toast('关闭成功','success')
                }
            },error=>{
                this.loading=false
                this.toast(error,'danger')
            })
        },
        heartBeat(){
            this.loading=true
            heartBeat().then(res=>{
                this.loading=false
                if(!res){
                    this.toast('网络连接异常','danger')
                }else{
                    this.toast('关闭成功','success')
                }
            },error=>{
                this.loading=false
                this.toast(error,'danger')
            })
        }
    }
}
</script>
<style scoped>
.w6em{
    width: 6em;
    display: inline-block
}
</style>


