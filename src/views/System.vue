<template>
    <b-card no-body class="h100pct">
        <b-card-header class="header-control" header-tag="header" role="tab">
            <span v-b-toggle.accordion-3>系统参数</span>
            <div class="tool">
                <b-button size="sm" @click="GetSystem()">刷新</b-button>
            </div>
        </b-card-header>
        <b-collapse id="accordion-3" visible accordion="log" role="tabpanel">
            <b-card-body class="scroller pR">
               <Loading v-if="loading"></Loading>
                <b-form>
                    <div class="inputWrap">
                        <div>
                            <label for="inline-form-input-name">继电器串口:</label>
                        </div>
                        <div>
                            <b-form-input type="number" v-model="result.RelayPort" @change="update"></b-form-input>
                        </div>
                    </div>
                    <div class="inputWrap">
                        <div>
                            <label for="inline-form-input-name">保存日志的时间(天):</label>
                        </div>
                        <div>
                            <b-form-input type="number" v-model="result.SaveLogTime" @change="update"></b-form-input>
                        </div>
                    </div>
                    <div class="inputWrap">
                        <div>
                           <label for="inline-form-input-name">自动重置继电器(秒):</label>
                        </div>
                        <div>
                            <b-form-input type="number" v-model="result.AutoResetTime" @change="update"></b-form-input>
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
import {getSystem,setSystem} from '@/libs/https'
export default {
    name:'system',
    components:{Loading},
    mixins:[toast],
    data(){
        return{
            loading:false,
            result:{
                RelayPort:0,
                SaveLogTime:0,
                AutoResetTime:0
            },
        }
    },
    methods:{
       GetSystem(refresh=false){
            this.loading=true
            getSystem().then(res=>{
                this.loading=false
                let {RelayPort,SaveLogTime,AutoResetTime}=res
                this.result={RelayPort,SaveLogTime,AutoResetTime}
            },error=>{
                this.loading=false
                this.toast(error,'danger')
            })
       },
       update(){
            this.loading=true
            let {RelayPort,SaveLogTime,AutoResetTime}=this.result
            let result={
                RelayPort:parseFloat(RelayPort),
                SaveLogTime:parseFloat(SaveLogTime),
                AutoResetTime:parseFloat(AutoResetTime),
            }
            setSystem(JSON.stringify(result)).then(res=>{
                this.loading=false
                if(!res){
                    this.toast('网络连接异常','danger')
                }else{
                    this.toast('修改成功','success')
                }
            },error=>{
                this.loading=false
                this.toast(error,'danger')
            })
       }
    },
    mounted(){
        this.GetSystem()
    }
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


