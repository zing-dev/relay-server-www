import axios from 'axios';

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
            if(status == 200 && data.success) {
                resolve(data.data)
            } else {
                reject(data.err_msg)
            }
        })
        .catch(err => {
            reject(err)
        })
    })
}

export const getSystem = () => {
    return async(getJson('get_system'))
}
export const setSystem = data => {
    return async(postJson('set_system',data))
}

export const runRelay = data => {
    return async(getJson('api/relay/run',data))
}

export const exitRelay = data => {
    return async(getJson('api/relay/exit',data))
}

export const openRelay = data => {
    return async(getJson('api/relay/open',data))
}

export const openRelaySpecial = data => {
    return async(getJson('api/relay/open?branches=' + data))
}

export const closeRelaySpecial = data => {
    return async(getJson('api/relay/close?branches=' + data))
}

export const resetRelay = data => {
    return async(getJson('api/relay/reset',data))
}

export const closeRelay = data => {
    return async(getJson('api/relay/close',data))
}

export const heartBeat = data => {
    return async(getJson('api/relay/heartbeat',data))
}

export const getVision = () => {
    return async(getJson('api/version'))
}




