import axios from 'axios';
import qs from 'qs'
// let base='http://192.168.0.200:13001/'
const base = process.env.NODE_ENV === 'production' ? '' : '/api/';
const NETWORK_ERROR = '网络连接异常.';

const getJson = (url, params) => {
    return axios.get(base + url, { params })
}

const postJson = (url, data) => {
    return axios.post(base + url, data)
}
const async = request => {
    return new Promise((resolve, reject) => {
        request.then(({ status, data }) => {
            if(status == 200) {
                resolve(data)
            }
            else {
                reject(false)
            }
        })
        .catch(err => {
            reject(NETWORK_ERROR)
        })
    })
}

export const getSystem = data => {
    return async(getJson('get_system', data))
}
export const setSystem = data => {
    return async(postJson('set_system',data))
}
export const resetRelay = data => {
    return async(getJson('reset_relay',data))
}