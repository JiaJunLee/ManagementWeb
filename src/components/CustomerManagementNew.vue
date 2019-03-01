<template>
    <div style="width: 100%;">
        <div class="title-wrapper">
            <h1>客户管理</h1>
            <div v-if="that.$store.state.user.type === 'ADMINISTRATOR'">
                <el-button size="small" type="info" icon="el-icon-share" @click="showBatchJoinUserGroupsDialog">批量设置可见职员用户组</el-button>
                <el-button size="small" type="primary" icon="el-icon-plus" @click="createDialogVisible = true">添加客户</el-button>
                <el-button size="small" type="danger" icon="el-icon-delete" @click="deleteAllCustomers">批量删除</el-button>
            </div>
        </div>
        <el-row class="tips-container">
            <div class="tipButton tipButton-primary">
                <span class="tabtxt">今日新增</span>
                <span class="tabnum">{{ customerSummary.today.create }}</span>
            </div>
            <div class="tipButton tipButton-primary">
                <span class="tabtxt">本周新增</span>
                <span class="tabnum">{{ customerSummary.month.create }}</span>
            </div>
            <div class="tipButton tipButton-primary">
                <span class="tabtxt">本月新增</span>
                <span class="tabnum">{{ customerSummary.week.create }}</span>
            </div>
            <div class="tipButton tipButton-warning">
                <span class="tabtxt">今日更新</span>
                <span class="tabnum">{{ customerSummary.today.update }}</span>
            </div>
            <div class="tipButton tipButton-warning">
                <span class="tabtxt">本周更新</span>
                <span class="tabnum">{{ customerSummary.week.update }}</span>
            </div>
            <div class="tipButton tipButton-warning">
                <span class="tabtxt">本月更新</span>
                <span class="tabnum">{{ customerSummary.month.update }}</span>
            </div>
        </el-row>
        <el-table border stripe size="mini" style="width: 100%;" :height="tableHeight" :data="customers.filter(data => !search || data.name.toLowerCase().includes(search.trim().toLowerCase()))" v-loading="onLoading" @selection-change="(selected) => { selectedCustomers = selected }">
            <el-table-column fixed type="selection" width="55"></el-table-column>
            <el-table-column fixed type="index" width="55" label="序号"></el-table-column>
            <el-table-column fixed prop="name" label="客户姓名" width="200">
                <template slot="header" slot-scope="scope">
                    <span style="display: flex; align-items: center">
                        <span style="flex-shrink: 0">客户姓名</span>
                        <el-input v-model="search" size="mini" placeholder="关键词筛选"/>
                    </span>
                </template>
            </el-table-column>
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
                    {{ getLatestRemark(scope.row.remarksNew) ? getLatestRemark(scope.row.remarksNew).remark || '无' : '无' }}
                    {{ getLatestRemark(scope.row.remarksNew) ? `[${ getLatestRemark(scope.row.remarksNew).userInformation ? getLatestRemark(scope.row.remarksNew).userInformation.name || '未知用户' : '未知用户' }]` : ''}}
                    <el-button size="mini" type="text" @click="openRemarksDialog(scope.row)">查看或添加记录</el-button>
                </template>
            </el-table-column>
            <el-table-column label="可见职员组"
                             prop="visibilityUserGroups"
                             :filters="allUserGroups"
                             :filter-method="filterUserGroup"
                             v-if="that.$store.state.user.type === 'ADMINISTRATOR'"
                             filter-placement="bottom-end">
                <template slot-scope="scope">
                    {{ scope.row.visibilityUserGroups.reduce((pre, cur)=>{ pre.push(cur.name); return pre }, []).join(', ') || '未分配' }}
                    <el-button size="mini" type="text" @click="showJoinUserGroupsDialog(scope.row)">重新分配</el-button>
                </template>
            </el-table-column>
            <el-table-column prop="createDate" label="创建日期" sortable width="150"></el-table-column>
            <el-table-column prop="lastModifiedDate" label="最后修改日期" sortable width="150"></el-table-column>
            <el-table-column label="操作" :width="that.$store.state.user.type === 'ADMINISTRATOR' ? 150 : 80">
                <template slot-scope="scope">
                    <el-button size="mini" @click="showEditCustomerDialog(scope.row)">编辑</el-button>
                    <el-button size="mini" type="danger" @click="deleteCustomer(scope.row)" v-if="that.$store.state.user.type === 'ADMINISTRATOR'">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-pagination
                @current-change="refreshCustomers"
                @size-change="handleSizeChange"
                background
                :current-page.sync="pageable.currentPageIndex"
                :page-sizes="[10, 30, 100, 200, 500, 1000]"
                :page-size="pageable.pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="pageable.total">
        </el-pagination>

        <!-- CREATE DIALOG -->
        <el-dialog title="新建客户" :visible.sync="createDialogVisible" width="36%">
            <el-form label-width="120px" :model="createCustomerForm" size="small" ref="createCustomerTypeFormRef">
                <el-form-item label="姓名" prop="name" :rules="[{ required: true, message: '姓名不能为空', trigger: 'blur' }]">
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
                <el-form-item label="电话" prop="phoneNumber" :rules="[{ required: true, message: '电话不能为空', trigger: 'blur' }]">
                    <el-input v-model="createCustomerForm.phoneNumber"></el-input>
                </el-form-item>
                <el-form-item label="性别" prop="sex">
                    <el-radio-group v-model="createCustomerForm.sex">
                        <el-radio-button label="UNKNOWN">未知</el-radio-button>
                        <el-radio-button label="MALE" >男</el-radio-button>
                        <el-radio-button label="FEMALE">女</el-radio-button>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="备注" prop="remarks">
                    <el-input type="textarea" v-model="createCustomerForm.remarks"></el-input>
                </el-form-item>
                <el-form-item label="可见职员组">
                    <div style="height: 200px; overflow-y: auto">
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

        <!-- REMARKS DIALOG -->
        <el-dialog :title="`客户 - ${ customerForRemarksDialog.name } - 备注`" :visible.sync="remarksDialogVisible" v-if="customerForRemarksDialog">
            <el-form :model="remarksDialogForm" label-width="80px" ref="remarksDialogForm">
                <el-form-item label="添加备注" :rules="[{ required: true, message: '备注不能为空', trigger: 'blur' }]" prop="remark">
                    <div style="display: flex">
                        <el-input v-model="remarksDialogForm.remark" placeholder="备注"></el-input>
                        <el-button type="primary" style="margin-left: 12px;" @click="addRemark">添加</el-button>
                    </div>
                </el-form-item>
            </el-form>
            <el-table :data="customerForRemarksDialog.remarksNew" border height="400">
                <el-table-column property="remark" label="备注"></el-table-column>
                <el-table-column label="用户" width="200">
                    <template slot-scope="scope">
                        {{ scope.row.userInformation ? scope.row.userInformation.name || '未知用户' : '未知用户' }}
                    </template>
                </el-table-column>
                <el-table-column property="createDate" label="添加日期" width="150"></el-table-column>
            </el-table>
            <div slot="footer" class="dialog-footer">
                <el-button @click="remarksDialogVisible = false">关 闭</el-button>
            </div>
        </el-dialog>

        <!-- BATCH JOIN USER GROUPS -->
        <el-dialog title="批量添加可见用户组" width="36%" :visible.sync="batchJoinUserGroupsDialogVisible">
            <p>此操作将移除客户此前的所有可见用户组，再重新添加所选可见用户组</p>
            <div style="height: 200px; overflow-y: auto">
                <el-checkbox-group v-model="batchJoinUserGroupsSelected" size="small">
                    <el-checkbox v-for="userGroup in userGroups" :key="userGroup.id" border :label="userGroup.id">{{ userGroup.name }}</el-checkbox>
                </el-checkbox-group>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="batchJoinUserGroupsDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="batchJoinUserGroups">添 加</el-button>
            </span>
        </el-dialog>

        <!-- JOIN USER GROUPS -->
        <el-dialog title="批量添加可见用户组" width="36%" :visible.sync="joinUserGroupsDialogVisible">
            <p>此操作将移除客户此前的所有可见用户组，再重新添加所选可见用户组</p>
            <div style="height: 200px; overflow-y: auto">
                <el-checkbox-group v-model="joinUserGroupsSelected" size="small">
                    <el-checkbox v-for="userGroup in userGroups" :key="userGroup.id" border :label="userGroup.id">{{ userGroup.name }}</el-checkbox>
                </el-checkbox-group>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="joinUserGroupsDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="joinUserGroups">添 加</el-button>
            </span>
        </el-dialog>

        <!-- EDIT CUSTOMER DIALOG -->
        <el-dialog title="新建客户" :visible.sync="editCustomerDialogVisible" width="36%" v-if="editCustomer">
            <el-form label-width="120px" :model="editCustomer" size="small" ref="createCustomerTypeFormRef">
                <el-form-item label="姓名" prop="name" :rules="[{ required: true, message: '姓名不能为空', trigger: 'blur' }]">
                    <el-input v-model="editCustomer.name"></el-input>
                </el-form-item>
                <el-form-item label="类型" prop="customerTypeId">
                    <el-select v-model="editCustomer.customerTypeId" placeholder="请选择">
                        <el-option
                                v-for="item in allCustomerTypes"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="电话" prop="phoneNumber" :rules="[{ required: true, message: '电话不能为空', trigger: 'blur' }]">
                    <el-input v-model="editCustomer.phoneNumber"></el-input>
                </el-form-item>
                <el-form-item label="性别" prop="sex">
                    <el-radio-group v-model="editCustomer.sex">
                        <el-radio-button label="UNKNOWN">未知</el-radio-button>
                        <el-radio-button label="MALE" >男</el-radio-button>
                        <el-radio-button label="FEMALE">女</el-radio-button>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="可见职员组" v-if="that.$store.state.user.type === 'ADMINISTRATOR'">
                    <div style="height: 200px; overflow-y: auto">
                        <el-checkbox-group v-model="editCustomer.visibilityUserGroupIds">
                            <el-checkbox v-for="userGroup in userGroups" :key="userGroup.id" border :label="userGroup.id">{{ userGroup.name }}</el-checkbox>
                        </el-checkbox-group>
                    </div>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editCustomerDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveCustomer">保 存</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
    export default {
        name: "CustomerManagementNew",
        data () {
          return {
              that: this,
              onLoading: true,
              tableHeight: window.innerHeight - 260,
              customers: [],
              customerTypes: [],
              userGroups: [],
              createDialogVisible: false,
              createCustomerForm: {
                  name: '',
                  customerTypeId: '',
                  phoneNumber: '',
                  sex: 'UNKNOWN',
                  visibilityUserGroupIds: [],
                  remarks: ''
              },
              pageable: {
                  currentPageIndex: 1,
                  pageSize: 30,
                  total: 500
              },
              customerSummary: {
                  today: {
                      create: 0,
                      update: 0
                  },
                  week: {
                      create: 0,
                      update: 0
                  },
                  month: {
                      create: 0,
                      update: 0
                  }
              },
              remarksDialogVisible: false,
              customerForRemarksDialog: null,
              remarksDialogForm: {
                  remark: ''
              },
              selectedCustomers: [],
              batchJoinUserGroupsDialogVisible: false,
              batchJoinUserGroupsSelected: [],
              joinUserGroupsDialogVisible: false,
              joinUserGroupsSelected: [],
              joinUserGroupsCustomer: undefined,
              editCustomerDialogVisible: false,
              editCustomer: undefined,
              search: ''
          }
        },
        methods: {
            handleSizeChange (val) {
                this.pageable.total = 0
                this.pageable.currentPageIndex = 1
                this.pageable.pageSize = val
                if (this.$store.state.user.type === 'ADMINISTRATOR') {
                    this.refreshCustomers()
                }
            },
            refreshSummary() {
                if (this.$store.state.user.type === 'ADMINISTRATOR') {
                    this.$post('/customer/summary', {}, (data) => {
                        this.customerSummary = data['content']
                    })
                } else {
                    this.$post('/customer/summary-employee', {
                        userId: this.$store.state.user.id
                    }, (data) => {
                        this.customerSummary = data['content']
                    })
                }
            },
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
                this.onLoading = true
                if (this.$store.state.user.type === 'ADMINISTRATOR') {
                    this.$post('/customer/page', {
                        pageIndex: this.pageable.currentPageIndex - 1,
                        pageSize: this.pageable.pageSize
                    }, (data) => {
                        this.pageable.total = data['content']['total']
                        this.customers = data['content']['customers']
                        this.onLoading = false
                    })
                } else {
                    this.$post('/customer', {
                        userId: this.$store.state.user.id
                    }, (data) => {
                        this.pageable.total = data['content'].length
                        this.customers = data['content']
                        this.onLoading = false
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
                    this.refreshSummary()
                })
            },
            deleteCustomer(customer) {
                this.$confirm('此操作将永久删除该客户, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$post('/customer/delete', { customerId: customer.id }, () => {
                        this.refreshCustomers()
                        this.refreshSummary()
                    })
                }).catch(() => {
                    this.$message('已取消操作')
                })
            },
            deleteAllCustomers() {
                if (this.selectedCustomers.length === 0) {
                    this.$message.warning('至少要选择一位客户')
                    return
                }
                this.$confirm('此操作将永久删除所选客户, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$post('/customer/delete-all', { customerIds: this.selectedCustomers.reduce((pre, cur) => { pre.push(cur.id); return pre }, []) }, () => {
                        this.refreshCustomers()
                        this.refreshSummary()
                    })
                }).catch(() => {
                    this.$message('已取消操作')
                })
            },
            getLatestRemark(remarksNew) {
                if (remarksNew && remarksNew.length > 0){
                    return remarksNew[0]
                }
                return null
            },
            openRemarksDialog(customer) {
                this.customerForRemarksDialog = customer
                this.remarksDialogVisible = true
            },
            addRemark () {
                this.$refs.remarksDialogForm.validate((valid) => {
                    if (valid) {
                        this.$post('/customer/append-remark', {
                            customerId: this.customerForRemarksDialog.id,
                            remark: this.remarksDialogForm.remark
                        }, (data) => {
                            this.remarksDialogForm.remark = ''
                            this.customerForRemarksDialog = data['content']
                            this.refreshSummary()
                            this.refreshCustomers()
                        })
                    }
                })
            },
            batchJoinUserGroups () {
                if (this.batchJoinUserGroupsSelected.length === 0) {
                    this.$message.warning('至少要选择一个用户组')
                    return
                }
                this.$post('/customer/visibility-all', {
                    customerIds: this.selectedCustomers.reduce((pre, cur) => { pre.push(cur.id); return pre }, []),
                    userGroupIds: this.batchJoinUserGroupsSelected
                }, () => {
                    this.batchJoinUserGroupsDialogVisible = false
                    this.batchJoinUserGroupsSelected = []
                    this.refreshCustomers()
                })
            },
            showBatchJoinUserGroupsDialog () {
                if (this.selectedCustomers.length === 0) {
                    this.$message.warning('至少要选择一位客户')
                    return
                }
                this.batchJoinUserGroupsDialogVisible = true
            },
            showJoinUserGroupsDialog (customer) {
                this.joinUserGroupsCustomer = customer
                this.joinUserGroupsDialogVisible = true
            },
            joinUserGroups () {
                if (this.joinUserGroupsSelected.length === 0) {
                    this.$message.warning('至少要选择一个用户组')
                    return
                }
                this.$post('/customer/visibility', {
                    customerId: this.joinUserGroupsCustomer.id,
                    userGroupIds: this.joinUserGroupsSelected
                }, () => {
                    this.joinUserGroupsCustomer = undefined
                    this.joinUserGroupsSelected = []
                    this.joinUserGroupsDialogVisible = false
                    this.refreshCustomers()
                })
            },
            showEditCustomerDialog (customer) {
                this.editCustomer = Object.assign({}, customer)
                this.editCustomer.remarksNew = []
                this.editCustomer.visibilityUserGroups = []
                this.editCustomerDialogVisible = true
            },
            saveCustomer () {
                this.editCustomerDialogVisible = false
                this.$post('/customer/update', this.editCustomer, () => {
                    this.editCustomer = undefined
                    this.refreshCustomers()
                    this.refreshSummary()
                })
            }
        },
        mounted () {
            this.refreshCustomers()
            this.refreshUserGroups()
            this.refreshCustomerTypes()
            this.refreshSummary()
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
                this.tableHeight = window.innerHeight - 260
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
    .tips-container {
        margin-bottom: 12px;
    }
    .tipButton {
        padding: 4px 12px;
        min-width: 100px;
        cursor: pointer;
        text-align: center;
        display: block;
        float: left;
        transition: all 1s cubic-bezier(0.175, 0.885, 0.32, 1) 0s;
        margin-right: 8px;
    }
    .tipButton-primary {
        background-color: #2196F3;
        border-right: 1px solid #A3C8E8;
    }
    .tipButton-warning {
        background-color: #FFA000;
        border-right: 1px solid #f8d034;
    }
    .tipButton:hover {
        opacity: 0.8;
    }
    .tabtxt {
        color: white;
    }
    .tabnum {
        background: #F1EAEA;
        color: #666;
        font-weight: bold;
        margin-left: 8px;
        padding: 0 5px;
        font-size: 14px;
    }
</style>

<style>
    .el-checkbox {
        margin-left: 0 !important;
        margin-right: 12px !important;
        margin-bottom: 8px;
    }
    .el-table thead tr th {
        font-size: 13px;
        background-color: #EFF0EF !important;
        color: #333 !important;
    }
    .el-table td, .el-table th {
        border-right: 1px solid #E1E2E4 !important;
    }
    .el-table__column-filter-trigger i {
        font-size: 14px !important;
        margin-left: 6px;
        color: #333 !important;
        font-weight: bold !important;
    }
    .el-table__row td {
        font-size: 13px !important;
    }
</style>
