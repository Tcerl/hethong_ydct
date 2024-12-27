define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/quanlykho/BaoCaoKho/tpl/new_model.html'),
	schema 				= require('json!schema/BaoCaoKhoSchema.json');
	var ChitietVattu = require('app/quanlykho/BaoCaoKho/ChitietItemView');


    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "baocaokho",
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
						label: "TRANSLATE:BACK",
						command: function(){
							var self = this;
							Backbone.history.history.back();
						}
					},
					{
		    	    	name: "save",
		    	    	type: "button",
		    	    	buttonClass: "btn-success width-sm ml-2 btn-update",
		    	    	label: "TRANSLATE:SAVE",
		    	    	command: function(){
							var self = this;
							
							var bao_cao_all_kho = self.model.get("bao_cao_tat_ca_kho");
							if(bao_cao_all_kho != 1){
								var kho = self.model.get("kho");
								if (kho != null && kho != undefined) {
									self.model.set({
										"ma_kho": kho.id,
										"ten_kho" : kho.ten_kho
									});
									
								}
								self.model.set("bao_cao_tat_ca_kho",0);
							}

							self.savePhieu();

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
		    	    	buttonClass: "btn-danger width-sm ml-2 btn-delete",
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
					}
    	    	],
    	    }],
    	    uiControl:{
        		fields:[
					{
						field: "ngay_bat_dau",
						uicontrol: "datetimepicker",
						format: "DD/MM/YYYY",
						textFormat: "DD/MM/YYYY",
						extraFormats: ["DDMMYYYY"],
						parseInputDate: function(val) {
							return gonrinApp().parseInputDateString(val);
						},
						parseOutputDate: function(date) {
							return gonrinApp().parseOutputDateString(date);
						},
						disabledComponentButton: true
					},
					{
						field: "ngay_ket_thuc",
						uicontrol: "datetimepicker",
						format: "DD/MM/YYYY",
						textFormat: "DD/MM/YYYY",
						extraFormats: ["DDMMYYYY"],
						parseInputDate: function(val) {
							return gonrinApp().parseInputDateString(val);
						},
						parseOutputDate: function(date) {
							return gonrinApp().parseOutputDateString(date);
						},
						disabledComponentButton: true
					}
            	]
			},
    	render:function(){
			var self = this;
			self.model.set("bao_cao_tat_ca_kho",1);
			var id = this.getApp().getRouter().getParam("id");
    		if(id){
    			this.model.set('id',id);
        		this.model.fetch({
        			success: function(data){

						self.applyBindings();
						self.check_option_visible();
        			},
        			error:function(){
    					self.getApp().notify(gonrinApp().traslate("TRANSLATE:error_load_data"));
					},
					complete:function(){
						
						self.renderItems();
						if(gonrinApp().currentUser.donvi_id !== self.model.get("donvi_id")){
							self.$el.find(".btn-update").addClass("d-none");
							self.$el.find(".btn-delete").addClass("d-none");
							self.$el.find(".congdon").addClass("d-none");
						}else{
							self.register_event(false);
						}
					}
        		});
    		} else {
				self.register_event(true);
				self.applyBindings();
				
    		}
		},
		register_event: function(check_new){
			var self = this;
			self.selectizeKho();
			//mặc đinh thời gian là tháng hiện tại
			var firstDay = new Date(moment().year(), moment().month(), 1);
			var lastDay = new Date();
			self.model.set("ngay_bat_dau", firstDay);
            self.model.set("ngay_ket_thuc",self.parse_date_custom((moment(lastDay).set({hour:0,minute:0,second:0,millisecond:0}))));
            // self.model.set("ngay_bat_dau", firstDay);
            // self.model.set("ngay_ket_thuc",lastDay);

			self.$el.find(".btn-search").unbind("click").bind("click", function(){
				self.pre_CongDon();
			});
			self.$el.find(".btn-search").trigger("click");
			self.$el.find(".btn-ds-baocao").unbind("click").bind("click", function(){
				self.getApp().getRouter().navigate("baocaokho/collection");
			})
		},
		congdon_solieu: function(){
			var self = this;
			var url = (self.getApp().serviceURL || "") + '/api/v1/xuatnhapton/congdon';
			self.getApp().showloading();
			$.ajax({
				url: url,
				type: 'POST',
				data: JSON.stringify(self.model.toJSON()),
				headers: {
					'content-type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				},
				success: function(response) {
					self.getApp().hideloading();
					self.renderItems(response.baocao_id);
					self.export_excel(response.baocao_id);
					gonrinApp().notify("Cộng dồn thành công");
				},
				error: function(xhr, status, error) {
					self.getApp().hideloading();
					try {
						if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED") {
							self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
							self.getApp().getRouter().navigate("login");
						} else {
							self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 1000 });
						}
					} catch (err) {
						self.getApp().notify({ message: "Có lỗi xảy ra, vui lòng thử lại sau" }, { type: "danger", delay: 1000 });
					}
				}
			});
		},
		renderItems: function(baocao_id){
			var self = this;
			self.$el.find(".list-item").html("");
			var chitietVattu = new ChitietVattu({viewData: {"baocao_id": baocao_id}, el:self.$el.find(".list-item")});
			chitietVattu.render();
		},
		fillStt: function () {
			var self = this;
			var stt = self.$el.find(".stt");
			$.each(stt, (index, element) => {
				$(element).text(index + 1);
			});
		},
		export_excel : function(baocao_id){
			var self = this;
			self.$el.find(".btn-excel").unbind("click").bind("click", function(){
				var data = JSON.stringify({
					id: baocao_id
				});
				self.getApp().showloading();
				var url_login = self.getApp().serviceURL + '/api_export/v1/export_excel_xuatnhapton';
				$.ajax({
					url: url_login,
					type: 'POST',
					data: data,
					headers: {
						'content-type': 'application/json',
						'Access-Control-Allow-Origin': '*'
					},
					dataType: 'json',
					success: function(response) {
						window.open(response, "_blank");
					},
					error: function(xhr, status, error) {
						try {
							if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED") {
								self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
								self.getApp().getRouter().navigate("login");
							} else {
								self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 1000 });
							}
						} catch (err) {
							self.getApp().notify({ message: "Có lỗi xảy ra, vui lòng thử lại sau" }, { type: "danger", delay: 1000 });
						}
					},
					complete: function() {
						self.getApp().hideloading();
						return false;
					}
				});
			})
		},
        selectizeKho: function() {
            var self = this;
			var currentUser = self.getApp().currentUser;
			var donvi_id = "";
			if (!!currentUser && !!currentUser.donvi){
				donvi_id = currentUser.donvi.id;
			}
            var $selectize0 = self.$el.find('#chonkho').selectize({
                maxItems: 1,
                valueField: 'id',
                labelField: 'ten_kho',
                searchField: ['ten_kho'],
                preload: true,
                load: function(query, callback) {
                    var query_filter = {
                        "filters": {
                            "$and": [{
                                    "$or": [
                                        { "ten_kho": { "$likeI": (query) }},
                                    ]
                                },
                                { "donvi_id": { "$eq": donvi_id } }
                            ]
                        }

                    };
                    var url = (self.getApp().serviceURL || "") + '/api/v1/danhmuc_kho?page=1&results_per_page=20' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
							var itemDefault = {
								id : '10',
								ten_kho : 'Tất cả kho'
							}
							res.objects.unshift(itemDefault);
							callback(res.objects);
							$selectize0[0].selectize.setValue(itemDefault.id);
                        }
                    });
                },
                onChange: function(value) {
                    var obj = $selectize0[0].selectize.options[value];
                    if (obj !== null && obj !== undefined) {
						if (value !== "10"){
							self.model.set("bao_cao_tat_ca_kho",0);
							delete obj.$order;
							self.model.set({
								"ma_kho" : value,
								"ten_kho" : obj.ten_kho,
								"kho" : obj
							})
						}
						else{
							self.model.set({
								"ma_kho" : null,
								"ten_kho" : null,
								"kho" : null
							})
							self.model.set("bao_cao_tat_ca_kho",1);
						}

                    } else {
						self.model.set({
							"ma_kho" : null,
							"ten_kho" : null,
							"kho" : null
						})
						self.model.set("bao_cao_tat_ca_kho",1);
                    }
                }
            });
		},
		pre_CongDon : function(){
			var self = this;
			var ngayBatDau = self.model.get("ngay_bat_dau");
			if (typeof self.model.get("ngay_bat_dau") !== "string"){
				self.model.set("ngay_bat_dau", self.parse_date_custom(self.model.get("ngay_bat_dau")));
			}
			var ngayKetThuc = self.model.get("ngay_ket_thuc");
			if (ngayBatDau === undefined || ngayBatDau === null || ngayKetThuc === null || ngayKetThuc === undefined){
				self.getApp().notify({message: "Vui lòng nhập ngày bắt đầu và ngày kết thúc"}, {type : "danger", delay : 1000});
				return false;
			}
			else{
				if (ngayBatDau > ngayKetThuc){
					self.getApp().notify({message : "Vui lòng nhập ngày bắt đầu nhỏ hơn ngày kết thúc"}, {type : "danger", delay : 1000});
					return false;
				}
				else{
					var currentDate = moment().unix();
					self.model.set("ngay_bao_cao", currentDate);
					self.model.set("nam_bao_cao",new Date().getFullYear());
					self.model.set("loai_ky_bao_cao",1);// báo cáo theo khoảng thời gian
					self.model.set("ten_nguoi_bao_cao",gonrinApp().currentUser.fullname);
					self.model.set("ma_nguoi_bao_cao",gonrinApp().currentUser.id);
					self.congdon_solieu();
				}
			}
		},
		parse_date_custom : function(firstDay){
			var tmp = "";
			var firstDay = new Date(firstDay);
			if (isNaN(firstDay) == true){
                return "";
            }
			tmp = tmp + firstDay.getFullYear();
			if (firstDay.getMonth() < 9){
				tmp = tmp + "0" + (firstDay.getMonth() +1)
			}else{
				tmp = tmp + (firstDay.getMonth() +1)
			}
			if (firstDay.getDate() <= 9){
				tmp = tmp + "0" + firstDay.getDate();
			}
			else{
				tmp = tmp + firstDay.getDate();
			}
			if (firstDay.getHours() <=9){
				tmp = tmp + "0" + firstDay.getHours();
			}
			else{
				tmp = tmp + firstDay.getHours();
			}
			if (firstDay.getMinutes() <=9){
				tmp = tmp + "0" + firstDay.getMinutes();
			}
			else{
				tmp = tmp + firstDay.getMinutes();
			}
			if (firstDay.getSeconds() <=9){
				tmp = tmp + "0" + firstDay.getSeconds();
			}
			else{
				tmp = tmp + firstDay.getSeconds();
			}
			return tmp;
		}
    });

});