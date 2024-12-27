define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/view/huongdansudung/model.html');
    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: {},
    	urlPrefix: "/api/v1/",
		collectionName: "cuakhau",
		flagReset: true,
		uiControl: {
        },
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
					var isValidData = self.validateData();
					if(!isValidData){
						return;
                    }
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
    	render:function(){
    		var self = this;
    		var id = this.getApp().getRouter().getParam("id");
    		if(id){
    			//progresbar quay quay
    			this.model.set('id',id);
        		this.model.fetch({
        			success: function(data){
						self.applyBindings();
						self.register_event();
        			},
        			error:function(){
    					self.getApp().notify("Get data Eror");
    				},
        		});
    		}else{
				self.applyBindings();
				self.register_event();
			}
    	
        },
        register_event: function(){
			var self = this;
			

			let currentUser = self.getApp().currentUser;
			if (!!currentUser && currentUser.donvi){
				let tuyendonvi_id = currentUser.donvi.tuyendonvi_id;
				if (tuyendonvi_id === "10"){
					self.$el.find(`.huongdan-canbo-cuc`).removeClass("d-none");
				}
				else{
					self.$el.find(`.huongdan-canbo-cuc`).remove();
				}
			}
			else{
				self.$el.find(`.huongdan-canbo-cuc`).remove();
			}

            self.$el.find(".huongdan-canbo-cuc").on("click", (event)=>{
                event.stopPropagation();
                let url = (self.getApp().serviceURL || "") + '/huongdan_chuyenvien_cuc';
                window.open(url, '_blank');
			})
			self.$el.find(".huongdan-cungung").on("click", (event)=>{
                event.stopPropagation();
                let url = (self.getApp().serviceURL || "") + '/huongdan_donvi_cungung';
                window.open(url, '_blank');
			})
			self.$el.find(".huongdan-khaithac").on("click", (event)=>{
                event.stopPropagation();
                let url = (self.getApp().serviceURL || "") + '/huongdan_donvi_khaithac';
                window.open(url, '_blank');
			})
			self.$el.find(".huongdan-nuoitrong").on("click", (event)=>{
                event.stopPropagation();
                let url = (self.getApp().serviceURL || "") + '/huongdan_donvi_nuoitrong';
                window.open(url, '_blank');
			})
			self.$el.find(".huongdan-nuoitrong-khaithac").on("click", (event)=>{
                event.stopPropagation();
                let url = (self.getApp().serviceURL || "") + '/huongdan_donvi_nuoitrong_khaithac';
                window.open(url, '_blank');
			})
			self.$el.find(".huongdan-benhvien").on("click", (event)=>{
                event.stopPropagation();
                let url = (self.getApp().serviceURL || "") + '/huongdan_donvi_benhvien';
                window.open(url, '_blank');
			})
			
        }
    });

});