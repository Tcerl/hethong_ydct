define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/quanly_thuongmai_dientu/NguoiBanHang/tpl/model.html'),
    	schema 				= require('json!schema/NguoiBanHang.json');
	var RejectDialogView = require('app/bases/RejectDialogView');

    return Gonrin.ModelDialogView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "nguoibanhang",
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
                    var currentUser = gonrinApp().currentUser;
                    return (!!currentUser && !!currentUser.donvi && currentUser.donvi.tuyendonvi_id == '3');
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
					var currentUser = gonrinApp().currentUser;
					var self = this;
                    return (!!self.viewData && self.viewData.id && !!currentUser && !!currentUser.donvi && currentUser.donvi.tuyendonvi_id == '3');
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
			var ma = self.model.get('ma'),
			ten = self.model.get('ten'),
				email = self.model.get('email');
			if (ma == null || ma == undefined || ma.trim() == "") {
				self.getApp().notify({ message: "Chưa nhập mã nhà cung cấp"}, { type: "danger", delay: 1000 });
				return false;
			}
			if (ten == null || ten == undefined || ten.trim() == "") {
				self.getApp().notify({ message: "Chưa nhập tên nhà cung cấp"}, { type: "danger", delay: 1000 });
				return false;
			}
			self.model.set("ten", ten.trim().toUpperCase()); 
			if (email != null && email != undefined && email.trim() != "") {
				self.model.set("email", email.trim().toLowerCase()); 
			}
			return true;
		},
    });
});