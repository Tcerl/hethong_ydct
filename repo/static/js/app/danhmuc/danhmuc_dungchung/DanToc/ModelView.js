define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/danhmuc/danhmuc_dungchung/DanToc/tpl/model.html'),
    	schema 				= require('json!app/danhmuc/danhmuc_dungchung/DanToc/Schema.json');
    
    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "dantoc",
    	tools : [
	    	    {
	    	    	name: "defaultgr",
	    	    	type: "group",
	    	    	groupClass: "toolbar-group",
	    	    	buttons: [
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
	    	    }],
    	render:function(){
    		var self = this;
    		var id = this.getApp().getRouter().getParam("id");
    		if(id){
    			this.model.set('id',id);
        		this.model.fetch({
        			success: function(data){
        				self.applyBindings();
        			},
        			error:function(){
    					self.getApp().notify("Get data Eror");
    				},
        		});
    		}else{
    			self.applyBindings();
    		}
    		
    	},
    });

});