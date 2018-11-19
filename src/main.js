import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import axios from 'axios'
import VueAxios from 'vue-axios'

axios.defaults.baseURL = 'http://192.168.124.12:8080'
axios.defaults.withCredentials = true
Vue.use(VueAxios, axios)

Vue.config.productionTip = false
Vue.config.devtools = true
Vue.prototype.clone = function (object) {
    let clone = {}
    for (let key in object) {
        clone[key] = object[key]
    }
    return clone
}

Vue.prototype.$post = function (path, data, callback, error, exception) {
    Vue.axios.post(path, new URLSearchParams(data)).then((response)=>{
        if (response.data.resultCode !== 200 && error) {
            error(response.data.message)
        } else if (callback) {
            callback(response.data)
        }
    }).catch((error)=>{
        if (exception) {
            exception(error)
        } else {
            alert('Service Error!')
        }
    })
}

Vue.prototype.$user = null

new Vue({
    render: h => h(App),
}).$mount('#app')
