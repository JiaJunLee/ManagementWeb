<template>
    <v-flex xs12>
        <v-toolbar flat color="blue-grey" dark>
            <v-toolbar-title class="text-no-wrap">用户组管理</v-toolbar-title>
            <v-divider class="mx-3" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <div class="hidden-sm-and-down">
                <v-btn color="white" small light @click="createUserGroupDialog = true">添加
                    <v-icon class="ml-1" small>add</v-icon>
                </v-btn>
            </div>
            <div class="hidden-md-and-up">
                <v-btn color="green lighten-1" icon>
                    <v-icon small>rss_feed</v-icon>
                </v-btn>
                <v-btn color="white" icon light @click="createUserGroupDialog = true">
                    <v-icon small>add</v-icon>
                </v-btn>
            </div>
        </v-toolbar>
        <!--data table-->
        <v-data-table :headers="headers" :items="userGroups" class="elevation-1" loading>
            <template slot="no-data">
                <v-alert :value="true" color="grey lighten-1" icon="warning">无数据</v-alert>
            </template>
            <template slot="items" slot-scope="props">
                <td class="text-xs-center">{{ props.item.id }}</td>
                <td class="text-xs-center">{{ props.item.name }}</td>
                <td class="text-xs-center">{{ props.item.description }}</td>
                <td class="text-xs-center px-2 py-2">
                    <v-btn color="primary" small @click="that.$alertMessage('暂不可用')">修改
                        <v-icon small class="ml-1">edit</v-icon>
                    </v-btn>
                    <v-btn color="error" small @click="deleteUserGroup(props.item.id)">删除
                        <v-icon small class="ml-1">remove</v-icon>
                    </v-btn>
                </td>
            </template>
        </v-data-table>
        <!--add user group dialog-->
        <v-dialog v-model="createUserGroupDialog" max-width="460">
            <v-card>
                <v-img class="white--text" height="180px" src="https://picsum.photos/500/300?image=10">
                    <v-container fill-height fluid>
                        <v-layout fill-height>
                            <v-flex xs12 align-end flexbox>
                                <span class="headline">添加用户组</span>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-img>
                <v-form v-model="createUserGroupValid" lazy-validation class="px-3 py-3" onsubmit="return false;">
                    <v-text-field
                            autofocus
                            prepend-icon="person"
                            v-model="newUserGroup.name"
                            :rules="validRules.nameRules"
                            label="用户组名称"
                            required
                    ></v-text-field>
                    <v-text-field
                            prepend-icon="person"
                            v-model="newUserGroup.description"
                            :rules="validRules.descriptionRules"
                            label="用户组说明"
                            required
                            @keyup.enter="createUserGroup"
                    ></v-text-field>
                </v-form>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="gray darken-1" flat="flat" @click="createUserGroupDialog = false">取消</v-btn>
                    <v-btn color="blue darken-1" flat="flat" @click="createUserGroup">保存</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-flex>
</template>

<script>
    export default {
        name: "UserGroup",
        data: function () {
            return {
                that: this,
                headers: [
                    { text: "ID", value: "id", align:'center' },
                    { text: "用户组名称", value: "name", align:'center' },
                    { text: "用户组说明", value: "description", align:'center' },
                    { text: "操作", value: "action", align:'center' }
                ],
                userGroups: [],
                createUserGroupDialog: false,
                newUserGroup: {
                    name: '',
                    description: ''
                },
                createUserGroupValid: true,
                validRules: {
                    nameRules: [
                        v => !!v || '用户组名称不能为空'
                    ],
                    descriptionRules: [
                        v => !!v || '用户组说明不能为空'
                    ]
                }
            }
        },
        methods: {
            createUserGroup () {
                if (this.createUserGroupValid) {
                    this.$post('/user_group/create', this.newUserGroup, () => {
                        this.newUserGroup = {}
                        this.createUserGroupDialog = false
                        this.refreshUserGroups()
                    })
                }
            },
            refreshUserGroups() {
                this.$post('/user_group', {}, (data) => {
                    this.userGroups = data['content']
                })
            },
            deleteUserGroup(userGroupId) {
                if (userGroupId) {
                    this.$post('/user_group/delete', { userGroupId: userGroupId }, () => {
                        this.refreshUserGroups()
                    })
                }
            }
        },
        mounted: function () {
            this.refreshUserGroups()
        }
    }
</script>

<style scoped>

</style>