import Vue from 'vue';
import Vuex from 'vuex';
import { getSystem } from './libs/https'

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
    SETSYSTEM(state, sysData) {
      state.sysData = sysData
    }
  },
  actions: {
    GetSystem ({ commit }, state){
      const defaultLoading = { system: false, stateP: false }
      if(state){
        let loading = JSON.parse(JSON.stringify(defaultLoading))
        loading[state] = true
        commit('setLoading', loading)
      }else{
        commit('setLoading', {system: true, stateP: true})
      }
      
      return new Promise((resolve, reject)=>{
        getSystem().then( res =>{
          commit('setLoading', defaultLoading)
          if(!res){
            reject('网络连接异常')
          }else{
            commit('SETSYSTEM', res)
            resolve()
          }
        },error => {
          commit('setLoading',defaultLoading)
          reject(error)
        })
      })
    }
  }
})
