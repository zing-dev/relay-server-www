import Vue from 'vue';
import Vuex from 'vuex';
import {api} from './libs/https'

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        systemLoading: false,
        sysData: null
    },
    getters: {
        systemLoading: state =>{
            return state.systemLoading
        },
        sysData: state => {
            return state.sysData
        }
    },
    mutations: {
        setSysLoading(state, data){
            state.systemLoading = data
        },
        setSystem(state, sysData) {
            state.sysData = sysData
        }
    },
    actions: {
        GetSystem({commit}, state) {
            if (state) {
                commit('setSysLoading', true)
            } 
            return new Promise((resolve, reject) => {
                api.config.get().then(res => {
                    commit('setSysLoading', false)
                    if (!res.status) {
                        reject('网络连接异常')
                    } else {
                        commit('setSystem', res)
                        resolve()
                    }
                }).catch(error => {
                    commit('setSysLoading', false)
                    reject(error)
                })
            })
        }
    }
})
