<template>
  <v-app id="inspire">
    <v-snackbar :color="that.$store.state.alert.color" v-model="that.$store.state.alert.visible" :timeout="that.$store.state.alert.timeout" top>
      {{ that.$store.state.alert.message }}
      <v-btn flat @click="that.$store.state.alert.visible = false">Close</v-btn>
    </v-snackbar>
    <v-navigation-drawer :clipped="$vuetify.breakpoint.lgAndUp" v-model="drawer" fixed app>
      <v-list dense v-if="that.$store.state.user">
        <template v-for="item in items">
          <v-list-tile :key="item.text" @click="currentSelectedPage = item.page; drawer = false" :color="currentSelectedPage === item.page ? 'primary' : undefined">
            <v-list-tile-action>
              <v-icon :color="currentSelectedPage === item.page ? 'primary' : undefined">{{ item.icon }}</v-icon>
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
      <v-btn icon large v-if="that.$store.state.user">
        <v-tooltip bottom>
          <v-avatar size="34px" slot="activator">
            <img src="http://p0.ifengimg.com/a/2018_45/bcc07f5bc8bf9cf_size26_w640_h584.jpg" alt="Vuetify">
          </v-avatar>
          <span>用户中心</span>
        </v-tooltip>
      </v-btn>
      <v-subheader class="hidden-md-and-down" v-if="that.$store.state.user">{{ that.$store.state.user.username }}</v-subheader>
      <v-tooltip bottom v-if="that.$store.state.user">
        <v-btn icon slot="activator" @click="logout">
          <v-icon>exit_to_app</v-icon>
        </v-btn>
        <span>登出</span>
      </v-tooltip>
      <v-tooltip bottom v-if="!that.$store.state.user">
        <v-btn icon slot="activator">
          <v-icon>person</v-icon>
        </v-btn>
        <span>登入</span>
      </v-tooltip>
    </v-toolbar>
    <v-content>
      <v-container fluid fill-height>
        <v-layout justify-center v-if="that.$store.state.user">
          <EmployeeManagement v-if="currentSelectedPage === 'employee'"></EmployeeManagement>
          <CustomerManagement v-if="currentSelectedPage === 'customer'"></CustomerManagement>
          <UserGroup v-if="currentSelectedPage === 'user_group'"></UserGroup>
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
import EmployeeManagement from "./components/EmployeeManagement";
import UserGroup from "./components/UserGroup";
export default {
    name: 'App',
    components: {UserGroup, EmployeeManagement, CustomerManagement },
    data: function () {
        return {
            that: this,
            drawer: null,
            items: [],
            isLoginLoading: false,
            loginUser: {},
            currentSelectedPage: ''
        }
    },
    methods: {
        login() {
            if (this.loginUser.username && this.loginUser.password){
                this.isLoginLoading = true
                setTimeout(()=>{
                    this.$post('/user/login', this.loginUser, (data)=>{
                        this.$store.state.user = {
                            id: data['content']['id'],
                            username: data['content']['username'],
                            type: data['content']['type']
                        }
                        if (this.$store.state.user.type === 'EMPLOYEE') {
                            this.items = [
                                { icon: "record_voice_over", text: "客户", page: 'customer'},
                                { icon: "how_to_reg", text: "入件客户", page: 'incoming_customer' }
                            ]
                        } else if (this.$store.state.user.type === 'ADMINISTRATOR') {
                            this.items = [
                                { icon: "person", text: "职员", page: 'employee' },
                                { icon: "group", text: "职员用户组", page: 'user_group' },
                                { icon: "record_voice_over", text: "客户", page: 'customer' },
                                { icon: "how_to_reg", text: "入件客户", page: 'incoming_customer' }
                            ]
                        }
                        this.currentSelectedPage = this.items[0].page
                        this.isLoginLoading = false
                        this.loginUser = {}
                    }, (errorMessage)=>{
                        this.$alertMessage(errorMessage, 'error')
                        this.isLoginLoading = false
                    })
                }, 200)
            }
        },
        logout() {
            this.$store.state.user = null
            this.$alertMessage('logout successful')
        }
    }
};
</script>
