<template>
    <v-flex xs12>
        <v-toolbar flat color="blue-grey" dark>
            <v-toolbar-title class="text-no-wrap">职员管理</v-toolbar-title>
            <v-divider class="mx-3" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <div class="hidden-sm-and-down">
                <v-btn color="green lighten-1" small @click="joinUserGroupForSelectedDialog = true">批量加入职员用户组
                    <v-icon class="ml-1" small>rss_feed</v-icon>
                </v-btn>
                <v-btn color="white" small light @click="addEmployeeDialog = true">添加
                    <v-icon class="ml-1" small>add</v-icon>
                </v-btn>
            </div>
            <div class="hidden-md-and-up">
                <v-btn color="green lighten-1" icon @click="joinUserGroupForSelectedDialog = true">
                    <v-icon small>rss_feed</v-icon>
                </v-btn>
                <v-btn color="white" icon light @click="addEmployeeDialog = true">
                    <v-icon small>add</v-icon>
                </v-btn>
            </div>
        </v-toolbar>
        <!--data table-->
        <v-card>
            <v-card-title>
                <v-text-field
                        v-model="search"
                        append-icon="search"
                        label="搜索关键字"
                        hide-details
                        clearable
                ></v-text-field>
            </v-card-title>
            <v-data-table :headers="headers" :items="employees" class="elevation-1" loading select-all v-model="selectedItem" item-key="id" :search="search" :rows-per-page-items="dataTablePageConfig">
            <template slot="no-data">
                <v-alert :value="true" color="grey lighten-1" icon="warning">无数据</v-alert>
            </template>
            <template slot="items" slot-scope="props">
                <td>
                    <v-checkbox
                            v-model="props.selected"
                            color="primary"
                            hide-details
                    ></v-checkbox>
                </td>
                <td class="text-xs-center">{{ props.item.id }}</td>
                <td class="text-xs-center">{{ props.item.username }}</td>
                <td class="text-xs-center">{{ props.item.userInformation.name }}</td>
                <td class="text-xs-center">
                    <v-icon color="grey" v-if="props.item.userInformation.sex === 'UNKNOWN'">person</v-icon>
                    <v-icon color="primary" v-if="props.item.userInformation.sex === 'MALE'">person</v-icon>
                    <v-icon color="pink" v-if="props.item.userInformation.sex === 'FEMALE'">person</v-icon>
                </td>
                <td class="text-xs-center" v-if="props.item.userInformation.phoneNumber">{{ props.item.userInformation.phoneNumber }}</td>
                <td class="text-xs-center" v-else>无</td>
                <td class="text-xs-center">
                    <div v-if="props.item.userGroups === undefined || props.item.userGroups.length === 0">无</div>
                    <v-scale-transition group>
                        <div v-for="userGroup in props.item.userGroups" :key="userGroup.id">
                            <v-chip small close color="green" text-color="white" @input="exitUserGroup(userGroup, props.item)">{{ userGroup.name }}</v-chip>
                        </div>
                    </v-scale-transition>
                    <v-btn icon color="primary" small @click="showJoinUserGroupDialog(props.item)">
                        <v-icon small>add</v-icon>
                    </v-btn>
                </td>
                <td class="text-xs-center" v-if="props.item.userInformation.birth">{{ props.item.userInformation.birth }}</td>
                <td class="text-xs-center" v-else>无</td>
                <td class="text-xs-center">{{ props.item.createDate }}</td>
                <td class="text-xs-center" v-if="props.item.lastModifiedDate">{{ props.item.lastModifiedDate }}</td>
                <td class="text-xs-center" v-else>无</td>
                <td class="text-xs-left px-3 py-3" width="320">
                    <v-card width="320">
                        <v-card-title primary-title>
                            <div>
                                <div v-if="props.item.userInformation.remarks">{{ props.item.userInformation.remarks }}</div>
                                <div v-else class="grey--text">无</div>
                            </div>
                        </v-card-title>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn small color="primary" @click="that.$alertMessage('暂不可用')" icon>
                                <v-icon small>create</v-icon>
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </td>
                <td class="text-xs-center px-2 py-2">
                    <v-btn color="primary" small @click="that.$alertMessage('暂不可用')">修改
                        <v-icon small class="ml-1">edit</v-icon>
                    </v-btn>
                    <v-btn color="error" small @click="deleteEmployee(props.item.id)">删除
                        <v-icon small class="ml-1">remove</v-icon>
                    </v-btn>
                </td>
            </template>
        </v-data-table>
        </v-card>

        <!--add employee dialog-->
        <v-dialog v-model="addEmployeeDialog" max-width="460">
            <v-card>
                <v-img class="white--text" height="180px" src="https://picsum.photos/500/300?image=10">
                    <v-container fill-height fluid>
                        <v-layout fill-height>
                            <v-flex xs12 align-end flexbox>
                                <span class="headline">添加职员</span>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-img>
                <v-form v-model="addEmployeeValid" lazy-validation class="px-3 py-3" onsubmit="return false;">
                    <v-text-field
                            autofocus
                            prepend-icon="person"
                            v-model="newEmployee.username"
                            :rules="validRules.usernameRules"
                            label="用户名"
                            required
                            @keyup.enter="registerEmployee"
                    ></v-text-field>
                </v-form>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="gray darken-1" flat="flat" @click="addEmployeeDialog = false">取消</v-btn>
                    <v-btn color="blue darken-1" flat="flat" @click="registerEmployee">保存</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!--join user group dialog-->
        <v-dialog v-model="joinUserGroupDialog" max-width="460">
            <v-card>
                <v-img class="white--text" height="180px" src="https://cdn.vuetifyjs.com/images/parallax/material2.jpg">
                    <v-container fill-height fluid>
                        <v-layout fill-height>
                            <v-flex xs12 align-end flexbox>
                                <span class="headline">加入职员用户组</span>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-img>
                <v-autocomplete
                        v-model="selectedUserGroup"
                        class="px-3 pt-4"
                        :items="availableUserGroups"
                        :loading="isLoadingUserGroups"
                        :search-input.sync="searchAvailableUserGroupsCriteria"
                        color="primary"
                        item-text="name"
                        item-value="id"
                        label="用户组搜索"
                        placeholder="职员用户组名称"
                        prepend-icon="group"
                        return-object
                        clearable
                        autofocus
                >
                    <template slot="no-data">
                        <v-list-tile>
                            <v-list-tile-title v-if="searchAvailableUserGroupsCriteria && !isLoadingUserGroups">暂无用户组</v-list-tile-title>
                            <v-list-tile-title v-else-if="!isLoadingUserGroups">请输入<strong>"关键字"</strong>搜索用户组</v-list-tile-title>
                        </v-list-tile>
                    </template>
                </v-autocomplete>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="gray darken-1" flat="flat" @click="joinUserGroupDialog = false">取消</v-btn>
                    <v-btn color="blue darken-1" flat="flat" @click="joinUserGroup">加入</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!--join user group dialog for selected-->
        <v-dialog v-model="joinUserGroupForSelectedDialog" max-width="460">
            <v-card>
                <v-img class="white--text" height="180px" src="https://cdn.vuetifyjs.com/images/parallax/material2.jpg">
                    <v-container fill-height fluid>
                        <v-layout fill-height>
                            <v-flex xs12 align-end flexbox>
                                <span class="headline">批量加入职员用户组</span>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-img>
                <v-autocomplete
                        v-model="selectedUserGroupForSelected"
                        class="px-3 pt-4"
                        :items="availableUserGroupsForSelected"
                        :loading="isLoadingUserGroupsForSelected"
                        :search-input.sync="searchAvailableUserGroupsCriteriaForSelected"
                        color="primary"
                        item-text="name"
                        item-value="id"
                        label="用户组搜索"
                        placeholder="职员用户组名称"
                        prepend-icon="group"
                        return-object
                        clearable
                        autofocus
                >
                    <template slot="no-data">
                        <v-list-tile>
                            <v-list-tile-title v-if="searchAvailableUserGroupsCriteriaForSelected && !isLoadingUserGroupsForSelected">暂无用户组</v-list-tile-title>
                            <v-list-tile-title v-else-if="!isLoadingUserGroupsForSelected">请输入<strong>"关键字"</strong>搜索用户组</v-list-tile-title>
                        </v-list-tile>
                    </template>
                </v-autocomplete>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="gray darken-1" flat="flat" @click="joinUserGroupForSelectedDialog = false">取消</v-btn>
                    <v-btn color="blue darken-1" flat="flat" @click="joinUserGroupForSelected">加入</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-flex>
</template>

<script>
    export default {
        name: "EmployeeManagement",
        data: function () {
            return {
                that: this,
                search: '',
                dataTablePageConfig: [
                    10, 25, { "text": "$vuetify.dataIterator.rowsPerPageAll", "value": -1 }
                ],
                headers: [
                    { text: "ID", value: "id", align:'center' },
                    { text: "用户名", value: "username", align:'center' },
                    { text: "职员姓名", value: "name", align:'center' },
                    { text: "性别", value: "sex", align:'center' },
                    { text: "联系电话", value: "phoneNumber", align:'center' },
                    { text: "所在用户组", value: "userGroupIds", align:'center' },
                    { text: "出生日期", value: "birth", align:'center' },
                    { text: "创建日期", value: "createDate", align:'center' },
                    { text: "最后修改日期", value: "lastModifiedDate", align:'center' },
                    { text: "备注", value: "remarks", align:'center' },
                    { text: "操作", value: "action", align:'center' }
                ],
                employees: [],
                selectedItem: [],
                editRemarksDialog: false,
                addEmployeeDialog: false,
                addEmployeeValid: false,
                newEmployee: {
                    username: ''
                },
                validRules: {
                    usernameRules: [
                        v => !!v || '用户名不能为空',
                        v => (v && v.length <= 10) || '用户名必须不超过不大于10位'
                    ]
                },
                joinUserGroupDialog: false,
                currentJoinUserGroupItem: null,
                isLoadingUserGroups: false,
                availableUserGroups: [],
                searchAvailableUserGroupsCriteria: null,
                selectedUserGroup: null,
                isLoadingUserGroupsForSelected: false,
                availableUserGroupsForSelected: [],
                searchAvailableUserGroupsCriteriaForSelected: null,
                selectedUserGroupForSelected: null,
                joinUserGroupForSelectedDialog: false
            }
        },
        mounted: function () {
            this.refreshEmployees()
        },
        methods: {
            refreshEmployees () {
                this.$post('/user/employees', {}, (data) => {
                    this.employees = data['content']
                })
            },
            registerEmployee () {
                if (this.addEmployeeValid) {
                    this.$post('/user/register', this.newEmployee, () => {
                        this.addEmployeeDialog = false
                        this.newEmployee = {
                            username: ''
                        }
                        this.refreshEmployees()
                    })
                }
            },
            deleteEmployee (userId) {
                if (userId) {
                    this.$post('/user/delete', { userId: userId }, () => {
                        this.refreshEmployees()
                    })
                }
            },
            showJoinUserGroupDialog(item) {
                this.currentJoinUserGroupItem = item
                this.joinUserGroupDialog = true
            },
            joinUserGroup() {
                if (! this.selectedUserGroup) {
                    this.$alertMessage('未选定用户组', 'error')
                    return
                }
                if (! this.currentJoinUserGroupItem) {
                    this.$alertMessage('未选定修改项', 'error')
                    return
                }
                for (let index in this.currentJoinUserGroupItem.userGroups) {
                    if (this.currentJoinUserGroupItem.userGroups[index].id === this.selectedUserGroup.id) {
                        this.$alertMessage('用户已加入该用户组', 'error')
                        return
                    }
                }
                this.$post('/user/join_user_group', {
                    userId: this.currentJoinUserGroupItem.id,
                    userGroupId: this.selectedUserGroup.id
                }, () => {
                    this.currentJoinUserGroupItem = null
                    this.joinUserGroupDialog = false
                    this.refreshEmployees()
                })
            },
            exitUserGroup(userGroup, item) {
                this.$post('/user/exit_user_group', {
                    userId: item.id,
                    userGroupId: userGroup.id
                }, () => {
                    this.refreshEmployees()
                })
            },
            joinUserGroupForSelected() {
                if (! this.selectedUserGroupForSelected) {
                    this.$alertMessage('未选定用户组', 'error')
                    return
                }
                if (!this.selectedItem || this.selectedItem.length === 0) {
                    this.$alertMessage('至少选中一名职员', 'error')
                    this.joinUserGroupForSelectedDialog = false
                    return
                }
                let userIds = []
                for (let index in this.selectedItem) {
                    if (this.selectedItem[index].userGroupIds.indexOf(this.selectedUserGroupForSelected.id) === -1) {
                        userIds.splice(userIds.length, 0, this.selectedItem[index].id)
                    }
                }
                this.$post('/user/join_users_group', {
                    userIds: userIds,
                    userGroupId: this.selectedUserGroupForSelected.id
                }, ()=>{
                    this.selectedItem = []
                    this.joinUserGroupForSelectedDialog = false
                    this.refreshEmployees()
                })
            }
        },
        watch: {
            searchAvailableUserGroupsCriteria(val) {
                if (!val) return
                if (this.isLoadingUserGroups) return
                this.isLoadingUserGroups = true
                this.$post('/user_group', {}, (data) => {
                    this.availableUserGroups = data['content']
                    this.isLoadingUserGroups = false
                })
            },
            searchAvailableUserGroupsCriteriaForSelected(val) {
                if (!val) return
                if (this.isLoadingUserGroupsForSelected) return
                this.isLoadingUserGroupsForSelected = true
                this.$post('/user_group', {}, (data) => {
                    this.availableUserGroupsForSelected = data['content']
                    this.isLoadingUserGroupsForSelected = false
                })
            },
            joinUserGroupDialog(val) {
                if (!val) {
                    this.availableUserGroups = []
                    this.searchAvailableUserGroupsCriteria = null
                    this.currentJoinUserGroupItem = null
                    this.selectedUserGroup = null
                }
            }
        }
    }
</script>

<style scoped>

</style>