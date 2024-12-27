define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/quanly_hanhnghe/ChungChiHanhNghe/tpl/collection.html');
    var ModelDialogView     = require('app/quanly_hanhnghe/ChungChiHanhNghe/ModelDialogView');

    return Gonrin.CollectionView.extend({
    	template : template,
    	modelSchema	: {},
    	urlPrefix: "/api/v1/",
        collectionName: "chungchi_hanhnghe",
        bindings: "data-cchn",
        nguoi_hanhnghe_id: null,
		tools: [
			{
				name: "create",
                type: "button",
                buttonClass: "btn-primary btn-sm width-sm",
                label: `<i class="fas fa-plus"></i> Thêm chứng chỉ hành nghề`,
                command: function () {
                    var self = this;
                    var model_dialog = new ModelDialogView({viewData: {"nguoi_hanhnghe_id": self.nguoi_hanhnghe_id}});
                    model_dialog.dialog({"size":"large"});
                    model_dialog.on("saveData", function() {
                        self.doFilter();
                    });
                }
			},
      	],
		uiControl: {
            fields: [
                { field: "stt", label: "STT", width: 50 },
                { field: "so_giay_phep", label: "Mã CCHN", width: 200 },
                { field: "ngay_hieu_luc", label: "Hiệu lực từ", width: 150, template:function(rowData) {
                    var tungay = rowData.ngay_hieu_luc;
                    if (!!tungay) {
                        tungay = String(tungay);
                        return `${tungay.slice(6, 8)}/${tungay.slice(4, 6)}/${tungay.slice(0, 4)}`
                    }
					return "";
                } },
                { field: "ngay_het_han", label: "Ngày hết hạn", width: 150, template: function(rowData) {
					var denngay = rowData.ngay_het_han;
                    if (!!denngay) {
                        denngay = String(denngay);
                        return `${denngay.slice(6, 8)}/${denngay.slice(4, 6)}/${denngay.slice(0, 4)}`
                    }
					return "";
                } },
                { field: "ngay_cap", label: "Ngày cấp", width: 150, template: function(rowData) {
					var ngay_cap = rowData.ngay_cap;
                    if (!!ngay_cap) {
                        ngay_cap = String(ngay_cap);
                        return `${ngay_cap.slice(6, 8)}/${ngay_cap.slice(4, 6)}/${ngay_cap.slice(0, 4)}`
                    }
					return "";
                } },
                { field: "noi_cap", label: "Nơi cấp" },
            ],
            pagination: {
                page: 1,
                pageSize: 15
            },
            onRowClick: function(event) {
                if (event.rowId) {
                    var self = this;
                    var model_dialog = new ModelDialogView({viewData: {"id": event.rowId}});
                    model_dialog.dialog({"size":"large"});
                    model_dialog.on("saveData", function() {
                        self.doFilter();
                    });
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
            self.nguoi_hanhnghe_id = null;
            var donvi = currentUser.donvi;
            var viewData = self.viewData;
            if (!viewData || !(viewData.nguoi_hanhnghe_id)) {
                self.getApp().notify({ message: "Có lỗi xảy ra, vui lòng thử lại sau"}, { type: "danger", delay: 1000 });
                return
            }

            self.nguoi_hanhnghe_id = viewData.nguoi_hanhnghe_id;

            self.uiControl.orderBy = [{"field": "so_giay_phep", "direction": "asc"}];
            var filters = {"$and": [
                {"deleted": {"$eq": false}},
                {"nguoi_hanhnghe_id": {"$eq": self.nguoi_hanhnghe_id}}
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
                    {"nguoi_hanhnghe_id": {"$eq": self.nguoi_hanhnghe_id}}
				]
			};
            $col.data('gonrin').filter(obj);
			self.applyBindings();
        }
    });

});