<template>
    <v-flex xs12>
        <v-toolbar flat color="blue-grey" dark>
            <v-toolbar-title class="text-no-wrap">客户管理</v-toolbar-title>
            <v-divider class="mx-3" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <div class="hidden-sm-and-down" v-if="that.$store.state.user.type === 'ADMINISTRATOR'">
                <v-btn color="green lighten-1" small @click="addVisibilityUserGroupForSelectedDialog = true">批量添加可见职员用户组
                    <v-icon class="ml-1" small>rss_feed</v-icon>
                </v-btn>
                <v-btn color="white" small light @click="addCustomerDialog = true">添加
                    <v-icon class="ml-1" small>add</v-icon>
                </v-btn>
            </div>
            <div class="hidden-md-and-up" v-if="that.$store.state.user.type === 'ADMINISTRATOR'">
                <v-btn color="green lighten-1" icon @click="addVisibilityUserGroupForSelectedDialog = true">
                    <v-icon small>rss_feed</v-icon>
                </v-btn>
                <v-btn color="white" icon light @click="addCustomerDialog = true">
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
                        clearable
                        hide-details
                ></v-text-field>
            </v-card-title>
            <v-data-table :headers="headers" :items="customers" class="elevation-1" loading select-all v-model="selectedItem" item-key="id" :search="search" :rows-per-page-items="dataTablePageConfig">
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
                    <td class="text-xs-center">{{ props.item.name }}</td>
                    <td class="text-xs-center">{{ props.item.phoneNumber }}</td>
                    <td class="text-xs-center">
                        <v-icon color="grey" v-if="props.item.sex === 'UNKNOWN'">person</v-icon>
                        <v-icon color="primary" v-if="props.item.sex === 'MALE'">person</v-icon>
                        <v-icon color="pink" v-if="props.item.sex === 'FEMALE'">person</v-icon>
                    </td>
                    <td class="text-xs-center px-1">{{ props.item.createDate }}</td>
                    <td class="text-xs-center px-1">{{ props.item.lastModifiedDate }}</td>
                    <td class="text-xs-center" v-if="that.$store.state.user.type === 'ADMINISTRATOR'">
                        <div v-if="props.item.visibilityUserGroups === undefined || props.item.visibilityUserGroups.length === 0">无</div>
                        <v-scale-transition group>
                            <div v-for="userGroup in props.item.visibilityUserGroups" :key="userGroup.id">
                                <v-chip small close color="green" text-color="white" @input="removeVisibilityUserGroup(userGroup, props.item)">{{ userGroup.name }}</v-chip>
                            </div>
                        </v-scale-transition>
                        <v-btn icon color="primary" small @click="showAddVisibilityUserGroupDialog(props.item)">
                            <v-icon small>add</v-icon>
                        </v-btn>
                    </td>
                    <td class="text-xs-left px-3 py-3" width="320">
                        <v-card width="320">
                            <v-card-title primary-title>
                                <div>
                                    <div v-if="props.item.remarks && props.item.remarks !== 'null'">{{ props.item.remarks }}</div>
                                    <div v-else class="grey--text">无</div>
                                </div>
                            </v-card-title>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn small color="primary" @click="editRemarks(props.item)" icon>
                                    <v-icon small>create</v-icon>
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </td>
                    <td class="text-xs-center px-2 py-2" v-if="that.$store.state.user.type === 'ADMINISTRATOR'">
                        <v-btn color="primary" small @click="modifyItem(props.item)">修改
                            <v-icon small class="ml-1">edit</v-icon>
                        </v-btn>
                        <v-btn color="error" small @click="removeItem(props.item)">删除
                            <v-icon small class="ml-1">remove</v-icon>
                        </v-btn>
                    </td>
                </template>
            </v-data-table>
        </v-card>
        <!--edit dialog-->
        <v-dialog v-model="editRemarksDialog" max-width="460">
            <v-card>
                <v-img class="white--text" height="180px" src="https://picsum.photos/500/300?image=38">
                    <v-container fill-height fluid>
                        <v-layout fill-height>
                            <v-flex xs12 align-end flexbox>
                                <span class="headline">修改备注</span>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-img>
                <v-textarea v-model="currentModifyItem.remarks" class="px-3 pt-3" v-if="currentModifyItem"></v-textarea>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="gray darken-1" flat="flat" @click="editRemarksDialog = false">取消</v-btn>
                    <v-btn color="blue darken-1" flat="flat" @click="saveItem">保存</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!--modify dialog-->
        <v-dialog v-model="modifyDialog" max-width="460" v-if="currentModifyItem">
            <v-card>
                <v-img class="white--text" height="180px" src="https://picsum.photos/500/300?image=10">
                    <v-container fill-height fluid>
                        <v-layout fill-height>
                            <v-flex xs12 align-end flexbox>
                                <span class="headline">修改信息</span>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-img>
                <v-form ref="form" v-model="modifyValid" lazy-validation class="px-3 py-3">
                    <v-text-field
                            prepend-icon="person"
                            v-model="currentModifyItem.name"
                            :rules="validRules.nameRules"
                            label="客户姓名"
                            required
                    ></v-text-field>
                    <v-text-field
                            prepend-icon="call"
                            v-model="currentModifyItem.phoneNumber"
                            :rules="validRules.phoneNumberRules"
                            label="联系电话"
                            required
                    ></v-text-field>
                    <v-radio-group v-model="currentModifyItem.sex" label="性别" row prepend-icon="wc">
                        <v-radio
                                v-for="s in sex"
                                :key="s.name"
                                :label="s.name"
                                :value="s.value"
                                color="primary"
                        ></v-radio>
                    </v-radio-group>
                    <!--<v-menu-->
                            <!--:close-on-content-click="false"-->
                            <!--v-model="modifyBirthMenu"-->
                            <!--:nudge-right="33"-->
                            <!--lazy-->
                            <!--transition="scale-transition"-->
                            <!--offset-y-->
                            <!--full-width-->
                            <!--min-width="290px"-->
                    <!--&gt;-->
                        <!--<v-text-field-->
                                <!--prepend-icon="event"-->
                                <!--slot="activator"-->
                                <!--v-model="currentModifyItem.birth"-->
                                <!--label="生日"-->
                                <!--readonly-->
                        <!--&gt;</v-text-field>-->
                        <!--<v-date-picker v-model="currentModifyItem.birth" @input="modifyBirthMenu = false"></v-date-picker></v-menu>-->
                </v-form>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="gray darken-1" flat="flat" @click="modifyDialog = false">取消</v-btn>
                    <v-btn color="blue darken-1" flat="flat" @click="saveItem">保存</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!--add visibility user group dialog-->
        <v-dialog v-model="addVisibilityUserGroupDialog" max-width="460">
            <v-card>
                <v-img class="white--text" height="180px" src="https://cdn.vuetifyjs.com/images/parallax/material2.jpg">
                    <v-container fill-height fluid>
                        <v-layout fill-height>
                            <v-flex xs12 align-end flexbox>
                                <span class="headline">添加可见职员用户组</span>
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
                    <v-btn color="gray darken-1" flat="flat" @click="addVisibilityUserGroupDialog = false">取消</v-btn>
                    <v-btn color="blue darken-1" flat="flat" @click="addVisibilityUserGroup">添加</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!--add visibility user group dialog for selected item-->
        <v-dialog v-model="addVisibilityUserGroupForSelectedDialog" max-width="460">
            <v-card>
                <v-img class="white--text" height="180px" src="https://cdn.vuetifyjs.com/images/parallax/material2.jpg">
                    <v-container fill-height fluid>
                        <v-layout fill-height>
                            <v-flex xs12 align-end flexbox>
                                <span class="headline">批量添加可见职员用户组</span>
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
                    <v-btn color="gray darken-1" flat="flat" @click="addVisibilityUserGroupForSelectedDialog = false">取消</v-btn>
                    <v-btn color="blue darken-1" flat="flat" @click="addVisibilityUserGroupForSelected">添加</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!--add customer dialog-->
        <v-dialog v-model="addCustomerDialog" max-width="460">
            <v-card>
                <v-img class="white--text" height="180px" src="https://picsum.photos/500/300?image=10">
                    <v-container fill-height fluid>
                        <v-layout fill-height>
                            <v-flex xs12 align-end flexbox>
                                <span class="headline">添加客户</span>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-img>
                <v-form v-model="addCustomerValid" lazy-validation class="px-3 py-3" onsubmit="return false;">
                    <v-text-field
                        prepend-icon="person"
                        v-model="newCustomer.name"
                        :rules="validRules.nameRules"
                        label="客户姓名"
                        required
                ></v-text-field>
                    <v-text-field
                            prepend-icon="call"
                            v-model="newCustomer.phoneNumber"
                            :rules="validRules.phoneNumberRules"
                            label="联系电话"
                            required
                    ></v-text-field>
                    <v-radio-group v-model="newCustomer.sex" label="性别" row prepend-icon="wc">
                        <v-radio
                                v-for="s in sex"
                                :key="s.name"
                                :label="s.name"
                                :value="s.value"
                                color="primary"
                        ></v-radio>
                    </v-radio-group>
                </v-form>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="gray darken-1" flat="flat" @click="addCustomerDialog = false">取消</v-btn>
                    <v-btn color="blue darken-1" flat="flat" @click="addCustomer">保存</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-flex>
</template>

<script>
    export default {
        name: 'CustomerManagement',
        data: function () {
            return {
                that: this,
                search: '',
                dataTablePageConfig: [
                    10, 25, { "text": "$vuetify.dataIterator.rowsPerPageAll", "value": -1 }
                ],
                editRemarksDialog: false,
                headers: [],
                customers: [],
                currentModifyItem: null,
                modifyDialog: false,
                modifyValid: false,
                modifyBirthMenu: false,
                validRules: {
                    nameRules: [
                        v => !!v || '客户姓名不能为空',
                        v => (v && v.length <= 10) || '客户姓名必须不超过不大于10位'
                    ],
                    phoneNumberRules: [
                        v => !!v || '联系电话不能为空'
                    ]
                },
                sex: [
                    { value: 'UNKNOWN', name: '未知' },
                    { value: 'MALE', name: '男' },
                    { value: 'FEMALE', name: '女' },
                ],
                currentAddVisibilityUserGroupItem: null,
                addVisibilityUserGroupDialog: false,
                isLoadingUserGroups: false,
                availableUserGroups: [],
                searchAvailableUserGroupsCriteria: null,
                selectedUserGroup: null,
                isLoadingUserGroupsForSelected: false,
                availableUserGroupsForSelected: [],
                searchAvailableUserGroupsCriteriaForSelected: null,
                selectedUserGroupForSelected: null,
                selectedItem: [],
                addCustomerDialog: false,
                addCustomerValid: false,
                newCustomer: {
                    name: '',
                    phoneNumber: '',
                    sex: 'UNKNOWN'
                },
                addVisibilityUserGroupForSelectedDialog: false
            }
        },
        props: {
            source: String
        },
        mounted: function() {
          this.refreshCustomer()
            if (this.$store.state.user.type === 'ADMINISTRATOR') {
                this.headers = [
                    { text: "客户姓名", value: "name", align:'center' },
                    { text: "联系电话", value: "phoneNumber", align:'center' },
                    { text: "性别", value: "sex", align:'center' },
                    { text: "创建日期", value: "createDate", align:'center' },
                    { text: "最后修改日期", value: "lastModifiedDate", align:'center' },
                    { text: "可见职员用户组", value: "visibilityUserGroups", align:'center' },
                    { text: "备注", value: "remarks", align:'center' },
                    { text: "操作", value: "action", align:'center' }
                ]
            } else if (this.$store.state.user.type === 'EMPLOYEE') {
                this.headers = [
                    { text: "客户姓名", value: "name", align:'center' },
                    { text: "联系电话", value: "phoneNumber", align:'center' },
                    { text: "性别", value: "sex", align:'center' },
                    { text: "创建日期", value: "createDate", align:'center' },
                    { text: "最后修改日期", value: "lastModifiedDate", align:'center' },
                    { text: "备注", value: "remarks", align:'center' }
                ]
            }
        },
        methods: {
            refreshCustomer() {
                if (this.$store.state.user.type === 'ADMINISTRATOR') {
                    this.$post('/customer/all', {}, (data) => {
                        this.customers = data['content']
                    })
                } else {
                    this.$post('/customer', {
                        userId: this.$store.state.user.id
                    }, (data) => {
                        this.customers = data['content']
                    })
                }
            },
            addCustomer() {
                if (this.addCustomerValid) {
                    this.$post('/customer/save', this.newCustomer, () => {
                        this.newCustomer = {
                            name: '',
                            phoneNumber: '',
                            sex: 'UNKNOWN'
                        }
                        this.addCustomerValid = true
                        this.addCustomerDialog = false
                        this.refreshCustomer()
                    })
                }
            },
            removeVisibilityUserGroup(userGroup, item) {
                this.$post('/customer/remove_visibility', {
                    customerId: item.id,
                    userGroupId: userGroup.id
                }, () => {
                    this.refreshCustomer()
                })
            },
            removeItem(item) {
                this.$post('/customer/delete', { customerId: item.id }, () => {
                    this.refreshCustomer()
                })
            },
            modifyItem(item) {
                this.currentModifyItem = this.clone(item)
                this.modifyDialog = true
            },
            editRemarks(item) {
              this.currentModifyItem = this.clone(item)
              this.editRemarksDialog = true
            },
            saveItem() {
                this.$post('/customer/save', this.currentModifyItem, () => {
                    this.currentModifyItem = null
                    this.modifyDialog = false
                    this.editRemarksDialog = false
                    this.refreshCustomer()
                })
            },
            showAddVisibilityUserGroupDialog(item) {
                this.currentAddVisibilityUserGroupItem = item
                this.addVisibilityUserGroupDialog = true
            },
            addVisibilityUserGroup() {
                if (! this.selectedUserGroup) {
                    this.$alertMessage('未选定用户组', 'error')
                    return
                }
                if (! this.currentAddVisibilityUserGroupItem) {
                    this.$alertMessage('未选定修改项', 'error')
                    return
                }
                for (let index in this.currentAddVisibilityUserGroupItem.visibilityUserGroups) {
                    if (this.currentAddVisibilityUserGroupItem.visibilityUserGroups[index].id === this.selectedUserGroup.id) {
                        this.$alertMessage('当前可见用户组已存在', 'error')
                        return
                    }
                }
                this.$post('/customer/visibility', {
                    customerId: this.currentAddVisibilityUserGroupItem.id,
                    userGroupId: this.selectedUserGroup.id
                }, () => {
                    this.currentModifyItem = null
                    this.addVisibilityUserGroupDialog = false
                    this.refreshCustomer()
                })
            },
            addVisibilityUserGroupForSelected() {
                if (! this.selectedUserGroupForSelected) {
                    this.$alertMessage('未选定用户组', 'error')
                    return
                }
                if (!this.selectedItem || this.selectedItem.length === 0) {
                    this.$alertMessage('至少选中一位客户', 'error')
                    this.addVisibilityUserGroupForSelectedDialog = false
                    return
                }
                let customerIds = []
                for (let index in this.selectedItem) {
                    if (this.selectedItem[index].visibilityUserGroupIds.indexOf(this.selectedUserGroupForSelected.id) === -1) {
                        customerIds.splice(customerIds.length, 0, this.selectedItem[index].id)
                    }
                }
                this.$post('/customer/visibilities', {
                    customerIds: customerIds,
                    userGroupId: this.selectedUserGroupForSelected.id
                }, ()=>{
                    this.selectedItem = []
                    this.addVisibilityUserGroupForSelectedDialog = false
                    this.refreshCustomer()
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
            addVisibilityUserGroupDialog(val) {
                if (!val) {
                    this.availableUserGroups = []
                    this.searchAvailableUserGroupsCriteria = null
                    this.currentAddVisibilityUserGroupItem = null
                    this.selectedUserGroup = null
                }
            }
        }
    };
</script>