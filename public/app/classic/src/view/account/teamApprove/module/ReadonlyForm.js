Ext.define('Admin.view.account.teamApprove.module.ReadonlyForm', {
    extend: 'Ext.form.Panel',
    xtype: 'readonlyform',
    hidden: true,
    margin: 20,
    defaultType: 'displayfield',
    fieldDefaults: {
        allowBlank: false,
        width: '45%'
    },
    items: [{
        fieldLabel: '公司名称',
        name: 'company_name'
    }, {
        fieldLabel: '公司地址',
        name: 'company_address'
    }, {
        fieldLabel: '行业',
        name: 'industry'
    }, {
        fieldLabel: '组织机构号',
        name: 'organization_number'
    }, {
        fieldLabel: '组织机构证',
        hidden: true,
        name: 'organization_certificate',
        listeners: {
            change: 'dispalyFieldImgChange'
        }
    }, {
         fieldLabel: '组织机构证'
    }, {
        xtype: 'teamapproveimage',
        margin: '-30 0 10 105'
    }, {
        fieldLabel: '税务登记号',
        name: 'tax_number'
    }, {
        fieldLabel: '税务登记证',
        hidden: true,
        name: 'tax_certificate',
        listeners: {
            change: 'dispalyFieldImgChange'
        }
    }, {
        fieldLabel: '税务登记证'
    }, {
        xtype: 'teamapproveimage',
        margin: '-30 0 10 105'
    }, {
        fieldLabel: '营业执照号',
        name: 'license_number'
    }, {
        fieldLabel: '营业执照',
        hidden: true,
        name: 'license_certificate',
        listeners: {
            change: 'dispalyFieldImgChange'
        }
    }, {
        fieldLabel: '营业执照'
    }, {
        xtype: 'teamapproveimage',
        margin: '-30 0 10 105'
    }, {
        fieldLabel: '法定代表',
        name: 'legal_person'
    }, {
        fieldLabel: '公司电话',
        name: 'telphone'
    }, {
        fieldLabel: '公司网站',
        name: 'website',
        allowBlank: true
    }, {
        fieldLabel: '联系人手机号',
        name: 'phone'
    }]
});
