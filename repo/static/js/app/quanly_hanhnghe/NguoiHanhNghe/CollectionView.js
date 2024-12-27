define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/quanly_hanhnghe/NguoiHanhNghe/tpl/collection.html');

    return Gonrin.CollectionView.extend({
    	template : template,
    	modelSchema	: {},
    	urlPrefix: "/api/v1/",
        collectionName: "nguoi_hanhnghe",
        bindings: "data-nguoihanhnghe",
        coso_kinhdoanh_id: null,
		tools: [
			{
				name: "create",
                type: "button",
                buttonClass: "btn-primary btn-sm width-sm",
                label: `<i class="fas fa-plus"></i> Thêm người hành nghề`,
                visible: function() {
                    var tuyendonvi_id = gonrinApp().getTuyenDonVi();
                    return gonrinApp().hasRole("admin") ||  tuyendonvi_id=='1';
                },
                command: function () {
                    var self = this;
                    self.getApp().getRouter().navigate(self.collectionName + "/model?coso_kinhdoanh_id=" + self.coso_kinhdoanh_id);
                }
			},
      	],
		uiControl: {
            fields: [
                { field: "stt", label: "STT", width: 50 },
                { field: "ten", label: "Họ và tên", width:100 },
                { field: "diachi", label: "Địa chỉ" },
                {
                    field: "trangthai",
                    label: "Trạng thái",
                    width: 150, template: function(rowData) {
                        if (!!rowData && !!rowData.trangthai) {
                            if (rowData.trangthai == 1) {
                                return `<div class="text-primary">Đang hoạt động</div>`;
                            }
                            else {
                                return `<div class="text-danger">Ngừng hoạt động</div>`;

                            }
					    }
					    return "";
                    }
                },
            ],
            pagination: {
                page: 1,
                pageSize: 15
            },
            onRowClick: function(event) {
                if (event.rowId) {
                    var self = this;
                    self.getApp().getRouter().navigate(self.collectionName + "/model?id=" + event.rowId);
                }
            },
            datatableClass: "table table-mobile",
            onRendered: function(e) {
                var self = this;
                gonrinApp().responsive_table();
            }
        },
	    render: function () {
			var self = this;
            var currentUser  = gonrinApp().currentUser;
			if (currentUser === undefined || currentUser === null){
                self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                self.getApp().getRouter().navigate("login");
                return false;
            }
            self.coso_kinhdoanh_id = null;
            // var donvi = currentUser.donvi;
            var viewData = self.viewData;
            if (!viewData || !(viewData.coso_kinhdoanh_id)) {
                self.getApp().notify({ message: "Có lỗi xảy ra, vui lòng thử lại sau"}, { type: "danger", delay: 1000 });
                return
            }

            self.coso_kinhdoanh_id = viewData.coso_kinhdoanh_id;
            
            self.uiControl.orderBy = [{"field": "ten", "direction": "asc"}];
            var filters = {"$and": [
                {"deleted": {"$eq": false}},
                {"coso_kinhdoanh_id": {"$eq": self.coso_kinhdoanh_id}}
            ]}
            self.uiControl.filters = filters;
			self.applyBindings(); 
            self.$el.find("table").addClass("table-hover");
            self.$el.find("table").removeClass("table-striped");

            return this;
		},
        doFilter: function() {
            var self = this;
            var $col = self.getCollectionElement();
			var obj = {
				"$and": [
                    {"deleted": {"$eq": false}},
                    {"coso_kinhdoanh_id": {"$eq": self.coso_kinhdoanh_id}}
				]
			};
            $col.data('gonrin').filter(obj);
			self.applyBindings();
        }
    });
});