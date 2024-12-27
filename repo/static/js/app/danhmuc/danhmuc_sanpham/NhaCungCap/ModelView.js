define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/danhmuc/danhmuc_sanpham/NhaCungCap/tpl/model.html'),
    	schema 				= require('json!schema/DanhMucNhaCungCapSchema.json');
	var RejectDialogView = require('app/bases/RejectDialogView');

    return Gonrin.ModelDialogView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
        collectionName: "danhmuc_nhacungcap",
    	tools : [
			{
				name: "back",
				type: "button",
				buttonClass: "btn-secondary waves-effect width-sm",
				label: `<i class="fas fa-times-circle"></i> Đóng`,
				command: function() {
					var self = this;
					self.close();
				}
			},
			{
				name: "save",
				type: "button",
				buttonClass: "btn-success width-sm ml-2",
				label:  `<i class="far fa-save"></i> Lưu`,
				visible: function() {
					var tuyendonvi_id = gonrinApp().getTuyenDonVi();
					return gonrinApp().hasRole("admin") || tuyendonvi_id=='1';
				},
				command: function(){
					var self = this;
					var isValidData = self.validateData();
					if(!isValidData){
						return;
					}
					self.getApp().showloading();
					self.model.save(null,{
						success: function (model, respose, options) {
							self.getApp().hideloading();
							self.getApp().notify("Lưu thông tin thành công");
							self.trigger("saveData");
                        	self.close();
						},
						error: function(xhr, status, error) {
							self.getApp().hideloading();
							try {
								if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED"){
									self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
									self.getApp().getRouter().navigate("login");
								} 
								else {
									self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
								}
							}
							catch (err) {
								self.getApp().notify({ message: "Lưu thông tin không thành công"}, { type: "danger", delay: 1000 });
							}
						}
					});
				}
			},
			{
				name: "delete",
				type: "button",
				buttonClass: "btn-danger width-sm ml-2",
				label: `<i class="fas fa-trash-alt"></i> Xóa`,
				visible: function() {
					var tuyendonvi_id = gonrinApp().getTuyenDonVi();
					return gonrinApp().hasRole("admin") || tuyendonvi_id=='1';
				},
				command: function() {
					var self = this;
					var view = new RejectDialogView({ viewData: { "text": "Bạn có chắc chắn muốn xóa bản ghi này không?" } });
					view.dialog();
					view.on("confirm", (e) => {
						self.getApp().showloading();
						self.model.destroy({
							success: function(model, response) {
								self.getApp().hideloading();
								self.getApp().notify('Xoá dữ liệu thành công');
								self.trigger("saveData");
                        		self.close();
							},
							error: function(xhr, status, error) {
								self.getApp().hideloading();
								try {
									if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED"){
										self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
										self.getApp().getRouter().navigate("login");
									} 
									else {
										self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
									}
								}
								catch (err) {
									self.getApp().notify({ message: "Xóa thông tin không thành công"}, { type: "danger", delay: 1000 });
								}
							}
						});
					});
				}
			},
		],
		uiControl: {
            fields: [
				{
                    field: "ngay_capphep",
                    uicontrol: "datetimepicker",
                    format: "DD/MM/YYYY",
                    textFormat: "DD/MM/YYYY",
                    extraFormats: ["DDMMYYYY"],
                    parseInputDate: function(val) {
                        return gonrinApp().parseInputDateString(val);
                    },
                    parseOutputDate: function(date) {
                        return gonrinApp().parseOutputDateString(date, "YYYYMMDD");
                    },
                    disabledComponentButton: true
                },
				{
                    field: "trangthai",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
						{ value: 1, text: "Đang hoạt động" },
                        { value: 0, text: "Ngừng hoạt động" },
                    ],
                },
            ]
        },
    	render: function() {
    		var self = this;
    		var id = !!self.viewData ? self.viewData.id : null;
    		if (id) {
    			this.model.set('id',id);
        		this.model.fetch({
        			success: function(data) {
        				self.applyBindings();
						var tuyendonvi_id = gonrinApp().getTuyenDonVi();
						if(!gonrinApp().hasRole("admin") && tuyendonvi_id != '1'){
							self.$el.find("input").css("pointer-events","none");
							self.$el.find("#pointer-selectize").css("pointer-events","none");
						}
						gonrinApp().selectizeTinhThanhQuanHuyenXaPhuong(self);
        			},
        			error: function() {
    					self.getApp().notify({ message: "Có lỗi xảy ra, vui lòng thử lại sau"}, { type: "danger", delay: 1000 });
    				},
        		});
    		}
			else {
    			self.applyBindings();
				gonrinApp().selectizeTinhThanhQuanHuyenXaPhuong(self);
    		}
		},
		validateData: function() {
			var self = this;
			var ma_donvi = self.model.get('ma_donvi'),
			ten_donvi = self.model.get('ten_donvi'),
				email = self.model.get('email');
			if (ma_donvi == null || ma_donvi == undefined || ma_donvi.trim() == "") {
				self.getApp().notify({ message: "Chưa nhập mã nhà cung cấp"}, { type: "danger", delay: 1000 });
				return false;
			}
			if (ten_donvi == null || ten_donvi == undefined || ten_donvi.trim() == "") {
				self.getApp().notify({ message: "Chưa nhập tên nhà cung cấp"}, { type: "danger", delay: 1000 });
				return false;
			}
			self.model.set("ten_donvi", ten_donvi.trim().toUpperCase()); 
			if (email != null && email != undefined && email.trim() != "") {
				self.model.set("email", email.trim().toLowerCase()); 
			}
			return true;
		},
    });
});