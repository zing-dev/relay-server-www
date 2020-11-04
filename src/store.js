import Vue from 'vue';
import Vuex from 'vuex';
import {api} from './libs/https'

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        loading: {
            system: true,
            stateP: true
        },
        sysData: null
    },
    mutations: {
        setLoading(state, {system, stateP}) {
            state.loading.system = system
            state.loading.stateP = stateP
        },
        setSystem(state, sysData) {
            state.sysData = sysData
        }
    },
    actions: {
        GetSystem({commit}, state) {
            const defaultLoading = {system: false, stateP: false}
            if (state) {
                let loading = {...defaultLoading}
                loading[state] = true
                commit('setLoading', loading)
            } else {
                commit('setLoading', {system: true, stateP: true})
            }
            return new Promise((resolve, reject) => {
                api.config.get().then(res => {
                    commit('setLoading', defaultLoading)
                    if (!res.status) {
                        reject('网络连接异常')
                    } else {
                        commit('setSystem', res)
                        resolve()
                    }
                }).catch(error => {
                    commit('setLoading', defaultLoading)
                    reject(error)
                })
            })
        }
    }
})
