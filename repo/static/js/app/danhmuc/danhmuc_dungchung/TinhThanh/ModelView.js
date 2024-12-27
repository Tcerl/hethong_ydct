define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/danhmuc/danhmuc_dungchung/TinhThanh/tpl/model.html'),
    	schema 				= require('json!schema/TinhThanhSchema.json');
	var QuocGiaSelectView = require('app/danhmuc/danhmuc_dungchung/QuocGia/SelectView');
    return Gonrin.ModelDialogView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "tinhthanh",
    	tools : [
			{
				name: "back",
				type: "button",
				buttonClass: "btn-secondary waves-effect width-sm",
				label: "TRANSLATE:CLOSE",
				command: function(){
					var self = this;
					self.close();
				}
			},
			{
				name: "save",
				type: "button",
				buttonClass: "btn-success width-sm ml-2",
				label: "TRANSLATE:SAVE",
				command: function(){
					var self = this;
					
					self.model.save(null,{
						success: function (model, respose, options) {
							self.getApp().notify("Lưu thông tin thành công");
							self.getApp().getRouter().navigate(self.collectionName + "/collection");
							self.close();
						},
						error: function (xhr, status, error) {
							self.getApp().hideloading();
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
				// visible: function(){
				// 	return this.getApp().getRouter().getParam("id") !== null;
				// },
				visible: function() {
					var tuyendonvi_id = gonrinApp().getTuyenDonVi();
					return gonrinApp().hasRole("admin") ||  tuyendonvi_id=='1';
				},
				command: function(){
					var self = this;
					self.model.destroy({
						success: function(model, response) {
							self.getApp().notify('Xoá dữ liệu thành công');
							self.getApp().getRouter().navigate(self.collectionName + "/collection");
							self.close();
						},
						error: function (xhr, status, error) {
							self.getApp().hideloading();
							try {
								if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED"){
									self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
									self.getApp().getRouter().navigate("login");
								} else {
								self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
								}
							}
							catch (err) {
								self.getApp().notify({ message: "Xóa thông tin không thành công"}, { type: "danger", delay: 1000 });
							}
						}
					});
				}
			},
		],
    	uiControl:{
    		fields:[
        		{
    				field:"quocgia",
    				uicontrol:"ref",
    				textField: "ten",
    				//chuyen sang thanh object
    				foreignRemoteField: "id",
    				foreignField: "quocgia_id",
    				dataSource: QuocGiaSelectView
    			},
        	]
    	},
    	render:function(){
    		var self = this;
    		// var id = this.getApp().getRouter().getParam("id");
			var id = !!self.viewData ? self.viewData.id: null;
    		if(id){
    			//progresbar quay quay
    			this.model.set('id',id);
        		this.model.fetch({
        			success: function(data){
        				self.applyBindings();
        			},
        			error:function(){
    					self.getApp().notify("Không tìm thấy dữ liệu!");
    				},
        		});
    		}else{
    			self.applyBindings();
    		}
    		
    	},
    });

});