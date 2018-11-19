<template>
  <v-app id="inspire">
    <v-snackbar :color="alert.color" v-model="alert.visible" :timeout="alert.timeout" top>
      {{ alert.message }}
      <v-btn flat @click="alert.visible = false">Close</v-btn>
    </v-snackbar>
    <v-navigation-drawer :clipped="$vuetify.breakpoint.lgAndUp" v-model="drawer" fixed app>
      <v-list dense v-if="this.$user">
        <template v-for="item in items">
          <v-list-tile :key="item.text" @click="handleSelected(item.text)">
            <v-list-tile-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>
                {{ item.text }}
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </template>
      </v-list>
      <v-alert :value="true" color="grey lighten-1" icon="warning" v-else>请登入账号</v-alert>
    </v-navigation-drawer>
    <v-toolbar :clipped-left="$vuetify.breakpoint.lgAndUp" color="blue-grey darken-4" dark app fixed>
      <v-toolbar-title>
        <v-layout  justify-center align-center>
          <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
          <span>Management</span>
        </v-layout>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon large v-if="this.$user">
        <v-tooltip bottom>
          <v-avatar size="34px" slot="activator">
            <img src="http://p0.ifengimg.com/a/2018_45/bcc07f5bc8bf9cf_size26_w640_h584.jpg" alt="Vuetify">
          </v-avatar>
          <span>用户中心</span>
        </v-tooltip>
      </v-btn>
      <v-subheader class="hidden-md-and-down" v-if="this.$user">{{ this.$user.username }}</v-subheader>
      <v-tooltip bottom v-if="this.$user">
        <v-btn icon slot="activator" @click="logout">
          <v-icon>exit_to_app</v-icon>
        </v-btn>
        <span>登出</span>
      </v-tooltip>
      <v-tooltip bottom v-if="!this.$user">
        <v-btn icon slot="activator">
          <v-icon>person</v-icon>
        </v-btn>
        <span>登入</span>
      </v-tooltip>
    </v-toolbar>
    <v-content>
      <v-container fluid fill-height>
        <v-layout justify-center v-if="this.$user">
            <CustomerManagement></CustomerManagement>
        </v-layout>
        <v-layout justify-center align-center v-else>
          <!--login-->
          <v-flex xs12 sm8 md6 >
            <v-card class="elevation-12">
              <v-toolbar dark color="primary">
                <v-toolbar-title>欢迎</v-toolbar-title>
              </v-toolbar>
              <v-progress-linear :indeterminate="isLoginLoading" class="mx-0 my-0" height="5" background-opacity="0" color="primary" buffer-value="3"></v-progress-linear>
              <v-card-text>
                <v-form>
                  <v-text-field prepend-icon="person" name="login" label="用户名" type="text" clearable v-model="loginUser.username"></v-text-field>
                  <v-text-field id="password" prepend-icon="lock" name="password" label="密码" type="password" clearable v-model="loginUser.password" @keyup.enter="login"></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="login">登入</v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import CustomerManagement from "./components/CustomerManagement";
export default {
    name: 'App',
    components: {CustomerManagement},
    data: ()=>({
        alert: {
            visible: false,
            color: "green",
            timeout: 3000,
            message: "Successful!"
        },
        drawer: null,
        items: [],
        isLoginLoading: false,
        loginUser: {}
    }),
    methods: {
        alertMessage(message = "Successful!", color = "green") {
            this.alert.visible = true
            this.alert.color = color
            this.alert.message = message
        },
        login() {
            if (this.loginUser.username && this.loginUser.password){
                this.isLoginLoading = true
                setTimeout(()=>{
                    this.$post('/user/login', this.loginUser, (data)=>{
                        this.alertMessage(data.message)
                        this.$user = {
                            id: data['content']['id'],
                            username: data['content']['username'],
                            type: data['content']['type']
                        }
                        if (this.$user.type === 'EMPLOYEE') {
                            this.items = [
                                { icon: "record_voice_over", text: "客户" },
                                { icon: "how_to_reg", text: "入件客户" }
                            ]
                        } else if (this.$user.type === 'ADMINISTRATOR') {
                            this.items = [
                                { icon: "person", text: "职员" },
                                { icon: "group", text: "职员用户组" },
                                { icon: "record_voice_over", text: "客户" },
                                { icon: "how_to_reg", text: "入件客户" }
                            ]
                        }
                        this.isLoginLoading = false
                        this.loginUser = {}
                    }, (errorMessage)=>{
                        this.alertMessage(errorMessage, 'error')
                        this.isLoginLoading = false
                    })
                }, 1000)
            }
        },
        logout() {
            this.$user = null
            this.alertMessage('logout successful')
        }
    }
};
</script>
