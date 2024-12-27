define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/quanlykho/KetQuaTrungThau/tpl/model.html'),
	schema 				= require('json!schema/KetQuaTrungThauSchema.json');
	var ChitietVattu = require('app/quanlykho/KetQuaTrungThau/ChitietItemView');
	var DonViCungUngSelectView = require('app/danhmuc/danhmuc_donvi/DonViCungUng/SelectView');


    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "ketqua_trungthau",
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
		    	    	buttonClass: "btn-success width-sm ml-2",
		    	    	label: "TRANSLATE:SAVE",
		    	    	command: function(){
							var self = this;
							
							self.model.set("ten_nguoi_lap_phieu",gonrinApp().currentUser.fullname);
							self.model.set("ma_nguoi_lap_phieu",gonrinApp().currentUser.id);
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
    	    uiControl:{
        		fields:[
					{
						field:"loai_goi_thau",
						uicontrol:"combobox",
						textField: "text",
						valueField: "value",
						cssClass:"form-control",
							dataSource: [
							{ value: "generic1", text: "Generic 1" },
							{ value: "generic2", text: "Generic 2" },
							{ value: "generic3", text: "Generic 3" },
							{ value: "generic4", text: "Generic 4" },
							{ value: "generic5", text: "Generic 5" },
							{ value: "dongy1", text: "Đông Y 1" },
							{ value: "dongy2", text: "Đông Y 2" },
							{ value: "dongy3", text: "Đông Y 3" },
						],
					},
					// {
					// 	field:"donvi_cungung",
					// 	uicontrol:"ref",
					// 	textField: "ten",
					// 	foreignRemoteField: "id",
					// 	foreignField: "ma_donvi_cungung",
					// 	dataSource: DonViCungUngSelectView
					// },
					{
						field:"thoigian_batdau",
						uicontrol:"datetimepicker",
						format:"DD/MM/YYYY",
							textFormat:"DD/MM/YYYY",
							extraFormats:["DDMMYYYY"],
							parseInputDate: function(val){
								return gonrinApp().parseDate(val);
						},
						parseOutputDate: function(date){
							return date.unix();
						},
						disabledComponentButton: true
					},
					{
						field:"thoigian_ketthuc",
						uicontrol:"datetimepicker",
						format:"DD/MM/YYYY",
							textFormat:"DD/MM/YYYY",
							extraFormats:["DDMMYYYY"],
							parseInputDate: function(val){
								return gonrinApp().parseDate(val);
						},
						parseOutputDate: function(date){
							return date.unix();
						},
						disabledComponentButton: true
					},
					{
						field:"thoigian_trungthau",
						uicontrol:"datetimepicker",
						format:"DD/MM/YYYY",
							textFormat:"DD/MM/YYYY",
							extraFormats:["DDMMYYYY"],
							parseInputDate: function(val){
								return gonrinApp().parseDate(val);
						},
						parseOutputDate: function(date){
							return date.unix();
						},
						disabledComponentButton: true
					}
            	]
			},
    	render:function(){
			var self = this;
			var id = this.getApp().getRouter().getParam("id");
			// self.render_donvi_trungthau();
			
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
						
						
						var chitiet_vattu = self.model.get("chitiet_vattu");
						if (!!chitiet_vattu && chitiet_vattu !== undefined && chitiet_vattu !== null && chitiet_vattu instanceof Array && chitiet_vattu.length > 0) {
							self.$el.find('.table-vattu').show();
							chitiet_vattu.forEach( (value, index) => {
								var chitietVattu = new ChitietVattu({viewData: {"data": value, "check_ton": false}});
								chitietVattu.render();
								var id_vattu = value.id;
								if(id_vattu !=null && self.$el.find("tr#"+id_vattu).length>0){
									self.$el.find("tr#"+id_vattu).replaceWith(chitietVattu.$el);
								}else{
									self.$el.find('.table-vattu tbody').append(chitietVattu.$el);
								}
								chitietVattu.on("saveVattu", function (event) {
									self.$el.find('.table-vattu').show();
									var data_vattu = event.data;
									self.onSaveDataVatTu(data_vattu);
									self.fillStt();
								});
								chitietVattu.on("removeVattu", function (event) {
									self.$el.find('.table-vattu').show();
									var data_vattu = event.data;
									self.removeVattu(data_vattu);
									self.fillStt();
								});
								
							});
							self.fillStt();
						} else {
							// self.$el.find('.table-vattu').hide();
						}
						self.register_event();
					}
        		});
    		} else {
				self.applyBindings();
				self.register_event();
				var currentYear = new Date().getFullYear();
				var currentDate = moment().unix();
				self.model.set("nam_ke_hoach",currentYear);
				var firstDay = new Date(currentYear, 0, 1);
				var lastDay = new Date(currentYear, 11, 31);
				self.model.set("thoigian_batdau",moment(firstDay).unix());
				self.model.set("thoigian_ketthuc",moment(lastDay).set({hour:23,minute:59,second:59}).unix());
    		}
    		
		},
		register_event: function(){
			var self = this;
			
			var $selectize = self.$el.find('#selectize-programmatic').selectize({
                valueField: 'id',
                labelField: 'ten_vattu',
				searchField: ['ten_vattu'],
				// placeholder: "Tìm kiếm vật tư, thuốc...",
                preload: true,
                load: function(query, callback) {
                    var query_filter = {"filters": {"$or": [
                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                        { "ma_vattu": { "$likeI": gonrinApp().convert_khongdau(query) } }
                        ]}};
					var url = (self.getApp().serviceURL || "") + '/api/v1/danhmuc_vattu_donvi?' + (query_filter? "&q=" + JSON.stringify(query_filter): "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            callback(res.objects);
                        }
                    });
                },
                onChange: function(value, isOnInitialize) {
                    var $selectz = (self.$el.find('#selectize-programmatic'))[0]
                    var obj = $selectz.selectize.options[value];
                    if (obj !== null && obj !== undefined) {
						var id = self.model.get("id");
                        if (id !== null && id !== undefined) {
                            // logic: nếu phiếu đó chưa có id - phiếu tạo mới thì set data vật tư
							// k tính sự kiện onchange khi set data vật tư lần đầu
							self.renderItem(obj);
                            
                        } else {
                            // sự kiện khi update phiếu, set data vật tư lần đầu
                            self.savePhieu(1, obj);
                        }

                    }
                }
            });
		},
		renderItem: function(obj){
			var self = this;
			var obj_chitiet_new = {
				"ten_vattu": obj.ten_vattu + (obj.hamluong!=null ? " " + obj.hamluong: ""),
				"ma_vattu": obj.ma_vattu,
				"id_vattu":obj.id,
				"vattu": obj,
				"loai_vattu":obj.loai_vattu,
				"ketqua_trungthau_id":self.model.get("id"),
				"donvitinh":obj.donvitinh,
				"thoigian_batdau": self.model.get("thoigian_batdau"),
				"thoigian_ketthuc": self.model.get("thoigian_ketthuc"),
				"nam_ke_hoach": self.model.get("nam_ke_hoach"),
				"ma_goi_thau":self.model.get("ma_goi_thau"),
				"ten_goi_thau": self.model.get("ten_goi_thau"),
				"loai_goi_thau": self.model.get("loai_goi_thau"),
				"thuoc_goi_thau": self.model.get("thuoc_goi_thau"),
				"thoigian_trungthau": self.model.get("thoigian_trungthau"),
				"donvi_id":self.model.get("donvi_id"),
				"dongia":obj.giatien
			};
			var chitietVattu = new ChitietVattu({viewData: {"data": obj_chitiet_new, "check_ton":true}});
			chitietVattu.render();
			var item_id = chitietVattu.model.get("id");
			if(item_id !=null && self.$el.find("tr#"+item_id).length>0){
				self.$el.find("tr#"+item_id).replaceWith(chitietVattu.$el);
			}else{
				self.$el.find('.table-vattu tbody').append(chitietVattu.$el);
			}
			chitietVattu.on("saveVattu", function (event) {
				var data_vattu = event.data;
				self.onSaveDataVatTu(data_vattu);
				self.fillStt();
			});
			chitietVattu.on("removeVattu", function (event) {
				self.$el.find('.table-vattu').show();
				var data_vattu = event.data;
				self.removeVattu(data_vattu);
				self.fillStt();
			});
			self.fillStt();
		},
		savePhieu: function (mode = 0, objDataVattu) {
			var self = this;
			var thoigian_trungthau = self.model.get("thoigian_trungthau");
			if (!thoigian_trungthau || thoigian_trungthau == null || thoigian_trungthau == undefined) {
				self.getApp().notify({message: "Vui lòng nhập ngày trúng gói thầu"}, {type: "danger", delay: 3000});
				return;
			} 
			var thoigian_batdau = self.model.get("thoigian_batdau");
			if (!thoigian_batdau || thoigian_batdau == null || thoigian_batdau == undefined) {
				self.getApp().notify({message: "Vui lòng thời gian thực hiện gói thầu"}, {type: "danger", delay: 3000});
				return;
			} 
			self.model.set("ten_nguoi_lap_phieu",gonrinApp().currentUser.fullname);
			self.model.set("ma_nguoi_lap_phieu",gonrinApp().currentUser.id);

			self.model.save(null,{
				success: function (model, respose, options) {
					if (mode == 0) {
						self.getApp().notify("Lưu thông tin thành công");
						
						// self.getApp().getRouter().navigate(self.collectionName + "/collection");
					} else  if (mode == 1) {
						self.model.set(model.attributes);
						self.renderItem(objDataVattu);
					}
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
		},
		onSaveDataVatTu: function (data_vattu) {
            var self = this;
            var listVattu = self.model.get("chitiet_vattu");
            if (listVattu == null || listVattu == undefined) {
                listVattu = [];
			}
            if (listVattu instanceof Array) {
                var arrayvattu = [];
                if (listVattu.length == 0) {
                    arrayvattu.push(data_vattu);
                } else {
					var check_existed = false;
                    for (var i = 0; i < listVattu.length; i++) {
                        if (data_vattu.id == listVattu[i].id) {
							arrayvattu.push(data_vattu);
							check_existed = true;
                        } else {
                            arrayvattu.push(listVattu[i]);
                        }
					}
					if (check_existed == false){
						arrayvattu.push(data_vattu);
					}
				}
				self.model.set("chitiet_vattu", arrayvattu);
            }
		},
		removeVattu: function (data_vattu) {
            var self = this;
            var listVattu = self.model.get("chitiet_vattu");
            if (listVattu == null || listVattu == undefined) {
				listVattu = [];
				return;
			}
            if (listVattu instanceof Array) {
                var arrayvattu = [];
				for (var i = 0; i < listVattu.length; i++) {
					if (data_vattu.id != listVattu[i].id) {
						arrayvattu.push(listVattu[i]);
					}
				}
				self.model.set("chitiet_vattu", arrayvattu);
            }
		},
		fillStt: function () {
			var self = this;
			var stt = self.$el.find(".stt");
			$.each(stt, (index, element) => {
				$(element).text(index + 1);
			});
		},
		// render_donvi_trungthau: function(){
		// 	var self = this;
		// 	var $selectize = self.$el.find('#selectize-donvi-cungung').selectize({
        //         valueField: 'id',
        //         labelField: 'ten',
		// 		searchField: ['ten'],
		// 		preload: true,
		// 		maxOptions : 10,
		// 		maxItems : 10,
        //         load: function(query, callback) {
        //             var query_filter = {"filters": {"$and": [
        //                 { "ten": { "$likeI": gonrinApp().convert_khongdau(query) } },
        //                 { "loai_donvi": { "$eq": 2} }
        //                 ]}};
		// 			var url = (self.getApp().serviceURL || "") + '/api/v1/donvi?' + (query_filter? "&q=" + JSON.stringify(query_filter): "");
        //             $.ajax({
        //                 url: url,
        //                 type: 'GET',
        //                 dataType: 'json',
        //                 error: function() {
        //                     callback();
        //                 },
        //                 success: function(res) {
		// 					callback(res.objects);
		// 					var donvi_cungung = self.model.get("donvi_cungung");
		// 					var list_id_donvi_cungung = [];
		// 					if (donvi_cungung !== undefined && donvi_cungung !== null && donvi_cungung instanceof Array && donvi_cungung.length >0){
		// 						for (var i =0; i<donvi_cungung.length;i++){
		// 							var tmp = donvi_cungung[i].id;
		// 							list_id_donvi_cungung.push(tmp);
		// 						}
		// 						$selectize[0].selectize.setValue(list_id_donvi_cungung);
		// 					}
        //                 }
        //             });
        //         },
        //         onChange: function(value, isOnInitialize) {
		// 			var list_donvi_cungung = [];
		// 			var list_donvi_cungung_id = []
        //             if (value !== undefined && value !== null && value instanceof Array){
        //                 for (var i=0; i<value.length; i++){
        //                     var tmp = $selectize[0].selectize.options[value[i]];
        //                     if (tmp !== undefined && tmp !== null){
		// 						list_donvi_cungung.push(tmp);
		// 						list_donvi_cungung_id.push(value[i]);
        //                     }
        //                 }
		// 				self.model.set("donvi_cungung",list_donvi_cungung);
		// 				self.model.set("donvi_cungung_id", list_donvi_cungung_id);
        //             }
        //         }
        //     });
		// }
    });

});