<template>
    <div style="width: 100%;">
        <div class="title-wrapper">
            <h1>客户类型管理</h1>
            <el-button size="small" type="primary" icon="el-icon-plus" round @click="createDialogVisible = true">添加客户类型</el-button>
        </div>
        <el-table border stripe size="mini" style="width: 100%;" :data="customerTypes" :height="tableHeight" v-loading="onLoading">
            <el-table-column fixed prop="id" label="ID" width="190">
            </el-table-column>
            <el-table-column fixed prop="name" label="客户类型">
            </el-table-column>
            <el-table-column prop="description" label="客户类型说明">
            </el-table-column>
            <el-table-column prop="createDate" label="创建日期" width="150">
            </el-table-column>
            <el-table-column prop="lastModifiedDate" label="最后修改日期" width="150">
            </el-table-column>
            <el-table-column label="操作" width="150" align="center">
                <template slot-scope="scope">
                    <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- CREATE DIALOG-->
        <el-dialog title="新建客户类型" :visible.sync="createDialogVisible" width="36%">
            <el-form label-width="120px" :model="createCustomerTypeForm" size="small" :rules="customerTypeFormRules" ref="createCustomerTypeFormRef">
                <el-form-item label="客户类型" prop="name">
                    <el-input v-model="createCustomerTypeForm.name"></el-input>
                </el-form-item>
                <el-form-item label="客户类型说明" prop="description">
                    <el-input type="textarea" v-model="createCustomerTypeForm.description" :autosize="{ minRows: 2, maxRows: 6}"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="createDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="createCustomerType">创 建</el-button>
            </span>
        </el-dialog>
        <!-- EDIT DIALOG-->
        <el-dialog title="编辑客户类型" :visible.sync="editDialogVisible" width="36%">
            <el-form label-width="120px" :model="editCustomerTypeForm" size="small" :rules="customerTypeFormRules" ref="editCustomerTypeFormRef">
                <el-form-item label="客户类型" prop="name">
                    <el-input v-model="editCustomerTypeForm.name"></el-input>
                </el-form-item>
                <el-form-item label="客户类型说明" prop="description">
                    <el-input type="textarea" v-model="editCustomerTypeForm.description" :autosize="{ minRows: 2, maxRows: 6}"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveCustomerType">保 存</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "CustomerTypeManagement",
        data () {
            return {
                onLoading: false,
                tableHeight: window.innerHeight - 180,
                createDialogVisible: false,
                customerTypeFormRules: {
                    name: [
                        { required: true, message: '请输入客户类型', trigger: 'blur' },
                        { min: 1, max: 30, message: '长度在 1 到 30 个字符', trigger: 'blur' }
                    ],
                    description: [
                        { min: 0, max: 300, message: '长度在 0 到 300 个字符', trigger: 'blur' }
                    ]
                },
                createCustomerTypeForm: {
                    name: '',
                    description: ''
                },
                editDialogVisible: false,
                editCustomerTypeForm: {},
                customerTypes: []
            }
        },
        methods: {
            refreshCustomerTypes() {
                this.onLoading = true
                this.$post('/customer_type/all', {}, (data) => {
                    this.customerTypes = data['content']
                    this.onLoading = false
                })
            },
            createCustomerType () {
                this.$refs.createCustomerTypeFormRef.validate().then(() => {
                    this.$post('/customer_type/save', this.createCustomerTypeForm, () => {
                        this.createDialogVisible = false
                        this.createCustomerTypeForm = {
                            name: '',
                            description: ''
                        }
                        this.refreshCustomerTypes()
                    })
                }).catch(() => {})
            },
            saveCustomerType () {
                this.$refs.editCustomerTypeFormRef.validate().then(() => {
                    this.editDialogVisible = false
                    this.$post('/customer_type/save', this.editCustomerTypeForm, () => {
                        this.editCustomerTypeForm = {}
                        this.refreshCustomerTypes()
                    })
                }).catch(() => {})
            },
            handleDelete (index, customerType) {
                this.$confirm('操作将永久删除此客户类型, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$post('/customer_type/delete', {
                        customerTypeId: customerType.id
                    }, () => {
                        this.$message({
                            type: 'success',
                            message: '已删除'
                        });
                        this.refreshCustomerTypes()
                    })
                }).catch(() => {});
            },
            handleEdit (index, customerType) {
                this.editCustomerTypeForm = customerType
                this.editDialogVisible = true
            }
        },
        mounted () {
            this.refreshCustomerTypes()
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
    .el-dialog__body {
        padding-bottom: 6px !important;
        padding-top: 6px !important;
    }
</style>
