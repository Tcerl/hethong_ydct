define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/danhmuc/danhmuc_donvi/ThonXom/tpl/model.html'),
	schema 				= require('json!schema/ThonXomSchema.json');
    var XaPhuongSelectView = require('app/danhmuc/danhmuc_dungchung/XaPhuong/SelectView');
    
    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "thonxom",
    	state: null,
    	tools : [
			{
				name: "back",
				type: "button",
				buttonClass: "btn-secondary waves-effect width-sm",
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
				command: function(){
					var self = this;
					
					self.model.save(null,{
						success: function (model, respose, options) {
							self.getApp().notify("Lưu thông tin thành công");
							self.getApp().getRouter().navigate(self.collectionName + "/collection");
							
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
				visible: function(){
					return this.getApp().getRouter().getParam("id") !== null;
				},
				command: function(){
					var self = this;
					self.model.destroy({
						success: function(model, response) {
							self.getApp().notify('Xoá dữ liệu thành công');
							self.getApp().getRouter().navigate(self.collectionName + "/collection");
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
					field:"xaphuong",
					uicontrol:"ref",
					textField: "ten",
					foreignRemoteField: "id",
					foreignField: "xaphuong_id",
					dataSource: XaPhuongSelectView
				},
			]
		},
    	render:function(){
    		var self = this;
			var id = this.getApp().getRouter().getParam("id");
			var currentUser = gonrinApp().currentUser;
			if (!currentUser){
				self.getApp().notify("Hết phiên đăng nhập, vui lòng đăng nhập lại");
				self.getApp().getRouter().navigate("login");
				return;
			}else{
				self.model.set("xaphuong_id",currentUser.donvi.xaphuong_id);
				
			}
    		if(id){
    			this.model.set('id',id);
        		this.model.fetch({
        			success: function(data){
        				self.applyBindings();
        			},
        			error:function(){
    					self.getApp().notify(self.getApp().translate("TRANSLATE:error_load_data"));
					},
					complete:function(){
						if(self.model.get("xaphuong") == null){
							var filterobj = {"quanhuyen_id": {"$eq": currentUser.donvi.quanhuyen_id}}; 
                			self.getFieldElement("xaphuong").data("gonrin").setFilters(filterobj);
						}
					}
        		});
    		}else{
				self.applyBindings();
				var filterobj = {"quanhuyen_id": {"$eq": currentUser.donvi.quanhuyen_id}}; 
                self.getFieldElement("xaphuong").data("gonrin").setFilters(filterobj);
    		}
    		
    	},
    });

});