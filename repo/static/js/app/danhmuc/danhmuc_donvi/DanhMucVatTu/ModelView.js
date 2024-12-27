define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/danhmuc/danhmuc_donvi/DanhMucVatTu/tpl/model.html'),
		schema 				= require('json!schema/DanhMucVatTuDonViSchema.json');
	var danhmuc_donvitinh   = require("json!app/constant/donvitinh.json");
    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "danhmuc_vattu_donvi",
    	tools : [
			{
				name: "back",
				type: "button",
				buttonClass: "btn-secondary width-sm ml-2",
				label: "TRANSLATE:BACK",
				command: function(){
					var self = this;
					
					Backbone.history.history.back();
				}
			},
			{
				name: "save",
				type: "button",
				buttonClass: "btn-success width-sm ml-2",
				label: "TRANSLATE:SAVE",
				visible: function(){
					return (this.getApp().hasRole("admin_donvi") || this.getApp().hasRole("canbo"));
				},
				command: function(){
					var self = this;
					var tenthuoc = self.model.get("ten_vattu");
					if (!tenthuoc || tenthuoc == null || tenthuoc == undefined || tenthuoc == "") {
						self.getApp().notify({ message: "Tên vật tư không được để trống." }, { type: "danger", delay: 5000 });
						return;
					}
					var ma_nhom = self.model.get("ma_nhom");
					if (!ma_nhom || ma_nhom == null || ma_nhom == undefined || ma_nhom == "") {
						self.getApp().notify({ message: "Vui lòng chọn nhóm vật tư." }, { type: "danger", delay: 5000 });
						return;
					}
					var donvitinh = self.model.get("donvitinh");
					if (!donvitinh || donvitinh == null || donvitinh == undefined || donvitinh == "") {
						self.getApp().notify({ message: "Vui lòng chọn đơn vị tính." }, { type: "danger", delay: 5000 });
						return;
					}
					self.model.save(null,{
						success: function (model, respose, options) {
							self.getApp().notify("Lưu thông tin thành công");
							self.getApp().getRouter().navigate(self.collectionName + "/collection");
							
						},
						error: function (xhr, status, error) {
							try {
								if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED"){
									self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
									self.getApp().getRouter().navigate("login");
								} else {
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
				label: "TRANSLATE:DELETE",
				visible: function(){
					return (this.getApp().getRouter().getParam("id") !== null && (this.getApp().hasRole("admin_donvi") || this.getApp().hasRole("canbo")));
				},
				command: function(){
					var self = this;
					self.model.destroy({
						success: function(model, response) {
							self.getApp().notify('Xoá dữ liệu thành công');
							self.getApp().getRouter().navigate(self.collectionName + "/collection");
						},
						error: function (xhr, status, error) {
							try {
								if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED"){
									self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
									self.getApp().getRouter().navigate("login");
								} else {
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
		],
		uiControl: {
			fields: [
				{
					field: "donvitinh",
					uicontrol: "combobox",
					textField: "text",
					valueField: "value",
					cssClass: "form-control",
					dataSource: danhmuc_donvitinh
				}
			]
		},
    	render:function() {
    		var self = this;
			var id = this.getApp().getRouter().getParam("id");
			self.select_nhom_vat_tu("selectize-nhom-vattu");
    		if(id){
    			this.model.set('id',id);
        		this.model.fetch({
        			success: function(data){
						self.applyBindings();
        			},
        			error:function(){
    					self.getApp().notify("Lỗi tải dữ liệu");
    				},
        		});
    		}else{
    			self.applyBindings();
    		}
		},
		select_nhom_vat_tu : function(html_id){
            var self = this;
            var $selectize = self.$el.find('#' + html_id).selectize({
                valueField: 'ma_nhom',
                labelField: 'ten_nhom_vattu',
                searchField: ['ten_nhom_vattu', 'tenkhongdau'],
                preload: true,
                load: function(query, callback) {
					var url = (self.getApp().serviceURL || "") + "/api/v1/nhom_vattu?page=1&results_per_page=15"
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
							callback(res.objects);
							var ma_nhom_vattu = self.model.get("ma_nhom");
							if (ma_nhom_vattu !== undefined && ma_nhom_vattu !== null){}
							$selectize[0].selectize.setValue(ma_nhom_vattu);
                        }
                    });  

                },
                onChange: function(value, isOnInitialize) {
					var obj = $selectize[0].selectize.options[value];
					if (obj !== undefined && obj !== null){
						var ten_nhom_vattu = obj.ten_nhom_vattu;
						if (ten_nhom_vattu !== undefined && ten_nhom_vattu !== null && ten_nhom_vattu !==""){
							self.model.set("ten_nhom", ten_nhom_vattu);
						}
						var ma_nhom = obj.ma_nhom;
						if (ma_nhom !== undefined && ma_nhom !== null){
							self.model.set("loai_vattu", ma_nhom);
						}
						self.model.set("ma_nhom", value);
					}
                }
			});
        }
	});

});