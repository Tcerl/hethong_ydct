define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/quanlykho/DanhSachVatTu/tpl/model.html'),
	schema 				= require('json!schema/KhoSanPhamSchema.json');
	var DanhMucKhoSelectView = require('app/quanlykho/DanhMucKho/SelectView');
	var danhmuc_donvitinh   = require("json!app/constant/donvitinh.json");
    var danhmuc_loai_vattu   = require("json!app/constant/loai_vattu.json");
    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "kho_sanpham_hanghoa",
    	state: null,
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
						label: `<i class="fas fa-arrow-circle-left"></i> Quay lại`,
						command: function(){
							var self = this;
							
							Backbone.history.history.back();
						}
					},
					// {
		    	    // 	name: "save",
		    	    // 	type: "button",
		    	    // 	buttonClass: "btn-success width-sm ml-2",
		    	    // 	label: "TRANSLATE:SAVE",
		    	    // 	command: function(){
		    	    // 		var self = this;
		    	    		
		            //         self.model.save(null,{
		            //             success: function (model, respose, options) {
		            //                 self.getApp().notify("Lưu thông tin thành công");
		            //                 self.getApp().getRouter().navigate(self.collectionName + "/collection");
		                            
		            //             },
		            //             error: function (xhr, status, error) {
					// 				try {
					// 					if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED"){
					// 						self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
					// 						self.getApp().getRouter().navigate("login");
					// 					} else {
					// 				  	self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
					// 					}
					// 				}
					// 				catch (err) {
					// 				  self.getApp().notify({ message: "Lưu thông tin không thành công"}, { type: "danger", delay: 1000 });
					// 				}
					// 			}
		            //         });
		    	    // 	}
		    	    // },
					// {
		    	    // 	name: "delete",
		    	    // 	type: "button",
		    	    // 	buttonClass: "btn-danger width-sm ml-2",
		    	    // 	label: "TRANSLATE:DELETE",
		    	    // 	visible: function(){
		    	    // 		return this.getApp().getRouter().getParam("id") !== null;
		    	    // 	},
		    	    // 	command: function(){
		    	    // 		var self = this;
		            //         self.model.destroy({
		            //             success: function(model, response) {
		            //             	self.getApp().notify('Xoá dữ liệu thành công');
		            //                 self.getApp().getRouter().navigate(self.collectionName + "/collection");
		            //             },
		            //             error: function (xhr, status, error) {
					// 				try {
					// 					if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED"){
					// 						self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
					// 						self.getApp().getRouter().navigate("login");
					// 					} else {
					// 				  	self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
					// 					}
					// 				}
					// 				catch (err) {
					// 				  self.getApp().notify({ message: "Lưu thông tin không thành công"}, { type: "danger", delay: 1000 });
					// 				}
					// 			}
		            //         });
		    	    // 	}
		    	    // },
    	    	],
    	    }],
    	    uiControl:{
        		fields:[
					{
						field:"active",
						uicontrol:"combobox",
						textField: "text",
						valueField: "value",
						cssClass:"form-control",
							dataSource: [
							{ value: 1, text: "Đang hoạt động" },
							{ value: 0, text: "ngừng hoạt động" },
						],
					},
					{
						field:"hansudung",
						uicontrol:"datetimepicker",
						format:"DD/MM/YYYY",
						textFormat:"DD/MM/YYYY",
						extraFormats:["DDMMYYYY"],
						parseInputDate: function(val){
							return gonrinApp().parseInputDateString(val);
						},
						parseOutputDate: function(date){
							return gonrinApp().parseOutputDateString(date);
						},
						disabledComponentButton: true
					},
					{
						field:"loai_vattu",
						uicontrol:"combobox",
						textField: "text",
						valueField: "value",
						cssClass:"form-control",
						dataSource: danhmuc_loai_vattu,
						value: "thuoc_thuong"
					},
					{
						field:"donvitinh",
						uicontrol:"combobox",
						textField: "text",
						valueField: "value",
						cssClass:"form-control",
						dataSource: danhmuc_donvitinh,
						value: "Kg"
					},
					{
						field:"kho",
						uicontrol:"ref",
						textField: "ten_kho",
						foreignRemoteField: "ma_kho",
						foreignField: "ma_kho",
						dataSource: DanhMucKhoSelectView
					},
					
            	]
        	},
    	render:function(){
			var self = this;
    		var id = this.getApp().getRouter().getParam("id");
    		if(id){
    			this.model.set('id',id);
        		this.model.fetch({
        			success: function(data){
						self.applyBindings();
						self.model.set("donvitinh", "Kg");
						var id_sanpham =self.model.get("id_sanpham");
						var donvi_id = self.model.get("donvi_id");
						var so_lo = self.model.get("so_lo");
						var ten_sanpham = self.model.get("ten_sanpham");
						if(!!id_sanpham && !!donvi_id && !!so_lo && ten_sanpham){
							self.get_lich_su_duoc_lieu(id_sanpham,so_lo, donvi_id, ten_sanpham);
						}
						self.$el.find(".updated_at").removeClass("d-none");
						self.$el.find(".updated_time").html(gonrinApp().timestampFormat(self.model.get("updated_at")*1000, "DD/MM/YYYY HH:mm:ss"));
        			},
        			error:function(){
    					self.getApp().notify(self.getApp().traslate("TRANSLATE:error_load_data"));
    				},
        		});
    		}else{
    			self.applyBindings();
    		}
    		
		},
		get_lich_su_duoc_lieu : function(id_sanpham, so_lo, donvi_id, ten_sanpham){
			var self = this;
			var params = {
				"id_sanpham" : id_sanpham,
				"so_lo" : so_lo,
				"donvi_id" : donvi_id
			}
			// console.log(params);
			$.ajax({
				url: (self.getApp().serviceURL || "") + '/api/v1/get_lichsu_duoclieu',
				dataType: "json",
				contentType: "application/json",
				method: 'POST',
				data: JSON.stringify(params),
				success: function(response) {
					if(!!response && !! response.lichsusanpham_id){
							self.$el.find('#qrcode img').remove();
							self.$el.find('.download-qrcode').parent().removeClass('d-none');
							var url = self.getApp().serviceURL + "/api/v1/scanqrcode";
							// console.log($("#qrcode").length);
							var qrcode = new QRCode(document.getElementById("qrcode"), {
								width: 130,
								height: 130,
								colorDark: "#000000",
								colorLight: "#ffffff",
								text: url + "?id=" + response.lichsusanpham_id,
								// logo: "static/img/logo-boyte.png",
								logoWidth: undefined,
								logoHeight: undefined,
								logoBackgroundColor: '#ffffff',
								logoBackgroundTransparent: false,
								quietZone: 10
							});
							self.$el.find("#qrcode").unbind('click').bind('click', function() {
								var image_src = self.$el.find('#qrcode img').attr("src");
								var DialogImagePost = Gonrin.DialogView.extend({
									template: '<div class="row text-center"  style="padding: 50px 0px;"><img style="margin-left:auto;margin-right:auto" src="' + image_src + '"></img></div>',
									render: function() {
										var self = this;
										self.applyBindings();
									},
								});
								var view = new DialogImagePost();
								view.dialog();
							});
							self.$el.find('.download-qrcode').unbind("click").bind('click', function(){
								var image_src = self.$el.find('#qrcode img').attr("src");
								self.$el.find('.download-qrcode').parent().attr("download", gonrinApp().convert_khongdau(ten_sanpham) + ".png");
								self.$el.find('.download-qrcode').parent().attr("href", image_src);
							});
					}
				},
				error:function(xhr,status,error){
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
				},
			});
		}
    });

});