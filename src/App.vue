<template>
  <v-app id="inspire">
    <v-snackbar :color="that.$store.state.alert.color" v-model="that.$store.state.alert.visible" :timeout="that.$store.state.alert.timeout" top>
      {{ that.$store.state.alert.message }}
      <v-btn flat @click="that.$store.state.alert.visible = false">Close</v-btn>
    </v-snackbar>
    <v-navigation-drawer :clipped="$vuetify.breakpoint.lgAndUp" v-model="drawer" fixed app>
      <v-list dense v-if="that.$store.state.user">
        <template v-for="item in items">
          <v-list-tile :key="item.text" @click="changeSelectPage(item)" :color="currentSelectedPage === item.page ? 'primary' : undefined">
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
      <v-alert :value="true" color="grey darken-1" icon="warning" v-else>请登入账号</v-alert>
    </v-navigation-drawer>
    <v-toolbar :clipped-left="$vuetify.breakpoint.lgAndUp" dark app fixed>
      <v-toolbar-title>
        <v-layout  justify-center align-center>
          <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
          <span>Management</span>
        </v-layout>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon large v-if="that.$store.state.user" @click="changePasswordDialog = true">
        <v-tooltip bottom>
          <v-avatar size="34px" slot="activator" color="white">
            <span class="black--text headline" v-if="that.$store.state.user">{{ that.$store.state.user.username.substr(0, 1).toUpperCase() }}</span>
            <v-icon v-else>account_circle</v-icon>
          </v-avatar>
          <span>修改密码</span>
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
        <!--change password dialog-->
        <v-dialog v-model="changePasswordDialog" max-width="460">
          <v-card>
            <v-img class="white--text" height="180px" src="https://picsum.photos/500/300?image=10">
              <v-container fill-height fluid>
                <v-layout fill-height>
                  <v-flex xs12 align-end flexbox>
                    <span class="headline">修改密码</span>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-img>
            <v-form v-model="changePasswordValid" lazy-validation class="px-3 py-3" onsubmit="return false;">
              <v-text-field
                      autofocus
                      prepend-icon="lock"
                      v-model="newPassword.password"
                      :rules="validRules.passwordRules"
                      type="password"
                      label="新密码"
                      required
              ></v-text-field>
              <v-text-field
                      prepend-icon="lock"
                      v-model="newPassword.confirmPassword"
                      :rules="confirmPasswordRules"
                      label="确认新密码"
                      type="password"
                      required
                      @keyup.enter="changePassword"
              ></v-text-field>
            </v-form>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="gray darken-1" flat="flat" @click="changePasswordDialog = false">取消</v-btn>
              <v-btn color="blue darken-1" flat="flat" @click="changePassword">修改</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-layout justify-center v-if="that.$store.state.user">
          <EmployeeManagement v-if="currentSelectedPage === 'employee'"></EmployeeManagement>
          <CustomerTypeManagement v-if="currentSelectedPage === 'customer_type'"></CustomerTypeManagement>
          <CustomerManagement v-if="currentSelectedPage === 'customer'"></CustomerManagement>
          <CustomerManagementNew v-if="currentSelectedPage === 'customer_new'"></CustomerManagementNew>
          <UserGroup v-if="currentSelectedPage === 'user_group'"></UserGroup>
          <IncomingCustomerManagement v-if="currentSelectedPage === 'incoming_customer'"></IncomingCustomerManagement>
          <IncomingCustomerManagementNew v-if="currentSelectedPage === 'incoming_customer_new'"></IncomingCustomerManagementNew>
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
import IncomingCustomerManagement from "./components/IncomingCustomer";
import CustomerTypeManagement from "./components/CustomerTypeManagement";
import CustomerManagementNew from "./components/CustomerManagementNew";
import IncomingCustomerManagementNew from './components/IncomingCustomerManagementNew'
export default {
    name: 'App',
    components: {
        CustomerManagementNew, IncomingCustomerManagementNew,
        CustomerTypeManagement, IncomingCustomerManagement, UserGroup, EmployeeManagement, CustomerManagement },
    data: function () {
        return {
            that: this,
            isMobile: false,
            drawer: null,
            items: [],
            isLoginLoading: false,
            loginUser: {},
            currentSelectedPage: '',
            changePasswordDialog: false,
            newPassword: {
                password: '',
                confirmPassword: ''
            },
            changePasswordValid: false,
            validRules: {
                passwordRules: [
                    v => !!v || '密码不能为空',
                    v => (v && v.length <= 20) || '密码必须不超过不大于20位',
                    v => (v && v.length >= 6) || '密码必须不少于6位'
                ]
            }
        }
    },
    computed: {
        confirmPasswordRules() {
            return [
                v => !!v || '确认密码不能为空',
                v => (v === this.newPassword.password) || '密码输入不一致'
            ]
        }
    },
    methods: {
        onResize () {
            if (this.$vuetify.breakpoint.lgAndUp !== true) {
                this.isMobile = true
            } else {
                this.isMobile = false
            }
        },
        changeSelectPage(item) {
            this.currentSelectedPage = item.page
            this.drawer = !this.isMobile
        },
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
                                // { icon: "record_voice_over", text: "客户", page: 'customer'},
                                { icon: "record_voice_over", text: "客户", page: 'customer_new' },
                                // { icon: "how_to_reg", text: "入件客户", page: 'incoming_customer' },
                                { icon: "how_to_reg", text: "入件客户", page: 'incoming_customer_new' }
                            ]
                        } else if (this.$store.state.user.type === 'ADMINISTRATOR') {
                            this.items = [
                                { icon: "person", text: "职员", page: 'employee' },
                                { icon: "group", text: "职员用户组", page: 'user_group' },
                                { icon: "extension", text: "客户类型", page: 'customer_type' },
                                // { icon: "record_voice_over", text: "客户", page: 'customer' },
                                { icon: "record_voice_over", text: "客户", page: 'customer_new' },
                                // { icon: "how_to_reg", text: "入件客户", page: 'incoming_customer' },
                                { icon: "how_to_reg", text: "入件客户", page: 'incoming_customer_new' }
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
        },
        changePassword() {
            if (this.changePasswordValid) {
              this.$post('/user/change_password', {
                  userId: this.$store.state.user.id,
                  password: this.newPassword.password
              }, ()=>{
                  this.newPassword = {
                      password: '',
                      confirmPassword: ''
                  }
                  this.changePasswordDialog = false
                  this.logout()
              })
            }
        }
    },
    mounted () {
        this.onResize()
        window.addEventListener('resize', this.onResize, { passive: true })
    },
    beforeDestroy () {
        if (typeof window !== 'undefined') {
            window.removeEventListener('resize', this.onResize, { passive: true })
        }
    }
};
</script>

<style>

  @-webkit-keyframes Gradient {
    0% {
      background-position: 0% 50%
    }
    50% {
      background-position: 100% 50%
    }
    100% {
      background-position: 0% 50%
    }
  }

  @-moz-keyframes Gradient {
    0% {
      background-position: 0% 50%
    }
    50% {
      background-position: 100% 50%
    }
    100% {
      background-position: 0% 50%
    }
  }

  @keyframes Gradient {
    0% {
      background-position: 0% 50%
    }
    50% {
      background-position: 100% 50%
    }
    100% {
      background-position: 0% 50%
    }
  }

  nav.v-toolbar.v-toolbar--clipped.v-toolbar--fixed.theme--dark {
    background: linear-gradient(-45deg, #EE7752, #1867c0, #009688);
    background-size: 400% 400%;
    -webkit-animation: Gradient 10s ease infinite;
    -moz-animation: Gradient 10s ease infinite;
    animation: Gradient 10s ease infinite;
  }

  nav.v-toolbar.theme--dark.primary {
    background-color: rgba(0,0,0,0.8) !important;
  }
</style>
