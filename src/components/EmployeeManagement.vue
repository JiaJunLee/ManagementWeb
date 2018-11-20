<template>
    <v-flex xs12>
        <v-toolbar flat color="blue-grey" dark>
            <v-toolbar-title class="text-no-wrap">职员管理</v-toolbar-title>
            <v-divider class="mx-3" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <div class="hidden-sm-and-down">
                <v-btn color="green lighten-1" small>批量设置职员用户组
                    <v-icon class="ml-1" small>rss_feed</v-icon>
                </v-btn>
                <v-btn color="white" small light @click="addEmployeeDialog = true">添加
                    <v-icon class="ml-1" small>add</v-icon>
                </v-btn>
            </div>
            <div class="hidden-md-and-up">
                <v-btn color="green lighten-1" icon>
                    <v-icon small>rss_feed</v-icon>
                </v-btn>
                <v-btn color="white" icon light @click="addEmployeeDialog = true">
                    <v-icon small>add</v-icon>
                </v-btn>
            </div>
        </v-toolbar>
        <!--data table-->
        <v-data-table :headers="headers" :items="employees" class="elevation-1" loading select-all v-model="selectedItem" item-key="id">
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
                <td class="text-xs-center">{{ props.item.userInformation.sex }}</td>
                <td class="text-xs-center" v-if="props.item.userInformation.phoneNumber">{{ props.item.userInformation.phoneNumber }}</td>
                <td class="text-xs-center" v-else>无</td>
                <td class="text-xs-center" v-if="props.item.userInformation.birth">{{ props.item.userInformation.birth }}</td>
                <td class="text-xs-center" v-else>无</td>
                <td class="text-xs-center">{{ props.item.createDate }}</td>
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
    </v-flex>
</template>

<script>
    export default {
        name: "EmployeeManagement",
        data: function () {
            return {
                that: this,
                headers: [
                    { text: "ID", value: "name", align:'center' },
                    { text: "用户名", value: "phoneNumber", align:'center' },
                    { text: "职员姓名", value: "fat", align:'center' },
                    { text: "性别", value: "carbs", align:'center' },
                    { text: "联系电话", value: "protein", align:'center' },
                    { text: "出生日期", value: "iron", align:'center' },
                    { text: "创建日期", value: "iron", align:'center' },
                    { text: "备注", value: "iron", align:'center' },
                    { text: "操作", value: "iron", align:'center' }
                ],
                employees: [],
                selectedItem: [],
                editRemarksDialog: false,
                addEmployeeDialog: false,
                addEmployeeValid: true,
                newEmployee: {
                    username: ''
                },
                validRules: {
                    usernameRules: [
                        v => !!v || '用户名不能为空',
                        v => (v && v.length <= 10) || '用户名必须不超过不大于10位'
                    ]
                }
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
            }
        }
    }
</script>

<style scoped>

</style>