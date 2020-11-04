import axios from 'axios';

// let base='http://192.168.0.200:13001/'
// let base='http://192.168.0.251:9009/'
const base = process.env.NODE_ENV === 'production' ? '' : '/api/';

const getJson = (url, params) => {
    return axios.get(base + url, {params})
}

const postJson = (url, data) => {
    return axios.post(base + url, data)
}
const async = request => {
    return new Promise((resolve, reject) => {
        request.then(({status, data}) => {
            if (status === 200) {
                resolve(data)
            } else {
                reject("请求失败")
            }
        })
            .catch(err => {
                reject(err)
            })
    })
}

export const api = {
    config: {
        get() {
            return async(getJson('api/config'))
        },
        set(data) {
            return async(postJson('api/config', data))
        }
    },

    relay: {
        run() {
            return async(getJson('api/run'))
        },
        onAll() {
            return async(getJson('api/on-all'))
        },
        offAll() {
            return async(getJson('api/off-all'))
        },
        on(data) {
            return async(getJson('api/on/' + data))
        },
        off(data) {
            return async(getJson('api/off/' + data))
        },
        flip(data) {
            return async(getJson('api/flip/' + data))
        },
        onPoint(data) {
            return async(getJson(`api/on-point/${data.branch}/${data.time}`))
        },
        offPoint(data) {
            return async(getJson(`api/off-point/${data.branch}/${data.time}`))
        },

    },
    version() {
        return async(getJson('api/version'))
    }
}
