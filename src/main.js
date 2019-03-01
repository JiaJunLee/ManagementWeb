import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import Vuex from 'vuex'
import Qs from 'qs'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

// axios.defaults.baseURL = 'http://129.204.16.191:8080'
axios.defaults.baseURL = 'http://localhost:8080'
axios.defaults.withCredentials = true

Vue.use(VueAxios, axios)
Vue.use(Vuex)
Vue.use(ElementUI)

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
    Vue.axios.post(path, Qs.stringify(data,{arrayFormat: 'repeat'})).then((response)=>{
        if (response.data.resultCode !== 200) {
            this.$alertMessage(response.data.message, 'error')
            if (error) {
                error(response.data.message)
            }
        } else if (callback) {
            this.$alertMessage(response.data.message)
            callback(response.data)
        }
    }).catch((error)=>{
        if (exception) {
            exception(error)
        } else {
            this.$alertMessage('Application Error!', 'error')
        }
    })
}

Vue.prototype.$alertMessage = function (message = "Successful!", color = "green") {
    this.$store.state.alert.visible = true
    this.$store.state.alert.color = color
    this.$store.state.alert.message = message
}

const store = new Vuex.Store({
    state: {
        user: null,
        alert: {
            visible: false,
            color: "green",
            timeout: 1500,
            message: "Successful!"
        }
    }
})

new Vue({
    render: h => h(App),
    store
}).$mount('#app')
