<template>
    <div style="width: 100%;">
        <div class="title-wrapper">
            <h2>客户管理</h2>
            <div>
                <el-button size="small" type="primary" icon="el-icon-plus" round>添加客户</el-button>
                <el-button size="small" type="primary" icon="el-icon-plus" round>添加客户</el-button>
            </div>
        </div>
        <el-table border stripe size="mini" style="width: 100%;" :height="tableHeight" :data="customers">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column fixed prop="name" label="客户姓名" width="190"></el-table-column>
            <el-table-column fixed prop="customerTypeId" label="客户类型" width="190"
                             :filters="allCustomerTypesForFilter"
                             :filter-method="filterCustomerType"
                             filter-placement="bottom-end">
                <template slot-scope="scope">
                    {{ allCustomerTypes.find(it => it.value === scope.row.customerTypeId) ? allCustomerTypes.find(it => it.value === scope.row.customerTypeId).label : '未指定' }}
                </template>
            </el-table-column>
            <el-table-column fixed prop="phoneNumber" label="联系电话"></el-table-column>
            <el-table-column label="性别" width="50">
                <template slot-scope="scope">{{ { FEMALE: '女', MALE: '男', UNKNOWN: '未知' }[scope.row.sex] || '未知' }}</template>
            </el-table-column>
            <el-table-column prop="remarks" label="备注">
                <template slot-scope="scope">
                    {{ scope.row.remarks || '无' }}
                    <el-button size="mini" type="text">更多记录</el-button>
                </template>
            </el-table-column>
            <el-table-column label="可见职员组"
                             prop="visibilityUserGroups"
                             :filters="allUserGroups"
                             :filter-method="filterUserGroup"
                             filter-placement="bottom-end">
                <template slot-scope="scope">
                    {{ scope.row.visibilityUserGroups.reduce((pre, cur)=>{ pre.push(cur.name); return pre }, []).join(', ') || '未分配' }}
                </template>
            </el-table-column>
            <el-table-column prop="createDate" label="创建日期" sortable width="150"></el-table-column>
            <el-table-column prop="lastModifiedDate" label="最后修改日期" sortable width="150"></el-table-column>
            <el-table-column label="操作" width="150">
                <template slot-scope="scope">
                    <el-button size="mini">编辑</el-button>
                    <el-button size="mini" type="danger">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- CREATE DIALOG-->
        <el-dialog title="新建客户" :visible.sync="createDialogVisible" width="36%">
            <el-form label-width="120px" :model="createCustomerForm" size="small" ref="createCustomerTypeFormRef">
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="createCustomerForm.name"></el-input>
                </el-form-item>
                <el-form-item label="类型" prop="customerTypeId">
                    <el-select v-model="createCustomerForm.customerTypeId" placeholder="请选择">
                        <el-option
                            v-for="item in allCustomerTypes"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="电话" prop="phoneNumber">
                    <el-input v-model="createCustomerForm.phoneNumber"></el-input>
                </el-form-item>
                <el-form-item label="性别" prop="sex">
                    <el-radio-group v-model="createCustomerForm.sex">
                        <el-radio-button label="UNKNOWN">未知</el-radio-button>
                        <el-radio-button label="MALE" >男</el-radio-button>
                        <el-radio-button label="FEMALE">女</el-radio-button>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="可见职员组">
                    <div style="height: 150px; overflow-y: auto">
                        <el-checkbox-group v-model="createCustomerForm.visibilityUserGroupIds">
                            <el-checkbox v-for="userGroup in userGroups" :key="userGroup.id" border :label="userGroup.id">{{ userGroup.name }}</el-checkbox>
                        </el-checkbox-group>
                    </div>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="createDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="createCustomer">创 建</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "CustomerManagementNew",
        data () {
          return {
              tableHeight: window.innerHeight - 180,
              customers: [],
              customerTypes: [],
              userGroups: [],
              createDialogVisible: true,
              createCustomerForm: {
                  name: '',
                  customerTypeId: '',
                  phoneNumber: '',
                  sex: 'UNKNOWN',
                  visibilityUserGroupIds: []
              }
          }
        },
        methods: {
            refreshUserGroups() {
                this.$post('/user_group', {}, (data) => {
                    this.userGroups = data['content']
                })
            },
            refreshCustomerTypes() {
                this.$post('/customer_type/all', {}, (data) => {
                    this.customerTypes = data['content']
                })
            },
            refreshCustomers() {
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
            filterCustomerType(value, row) {
                return row.customerTypeId === value || (!(value) && !(row.customerTypeId))
            },
            filterUserGroup(value, row) {
                return row.visibilityUserGroupIds.includes(value) || (value === undefined && row.visibilityUserGroupIds.length === 0)
            },
            createCustomer() {
                this.createDialogVisible = false
                this.$post('/customer/save', this.createCustomerForm, () => {
                    this.createCustomerForm = {
                        name: '',
                        customerTypeId: '',
                        phoneNumber: '',
                        sex: 'UNKNOWN',
                        visibilityUserGroupIds: []
                    }
                    this.refreshCustomers()
                })
            }
        },
        mounted () {
            this.refreshCustomers()
            this.refreshUserGroups()
            this.refreshCustomerTypes()
        },
        computed: {
            allCustomerTypes () {
                return this.customerTypes.reduce((pre, cur) => {
                    pre.push({
                        value: cur.id,
                        label: cur.name
                    })
                    return pre
                }, [])
            },
            allCustomerTypesForFilter () {
                return this.customerTypes.reduce((pre, cur) => {
                    pre.push({
                        value: cur.id,
                        text: cur.name
                    })
                    return pre
                }, [{ text: '未指定', value: '' }])
            },
            allUserGroups () {
                return this.userGroups.reduce((pre, cur) => {
                    pre.push({
                        text: cur.name,
                        value: cur.id
                    })
                    return pre
                }, [{ text: '未分配', value: undefined }])
            }
        },
        created () {
            window.addEventListener('resize', () => {
                this.tableHeight = window.innerHeight - 180
            })
        }
    }
</script>

<style scoped>
    .title-wrapper {
        width: 100%;
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
    }
</style>

<style>
    .el-checkbox {
        width: 114px;
        margin-left: 0 !important;
        margin-right: 12px !important;
    }
</style>
