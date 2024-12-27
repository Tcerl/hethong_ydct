define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/quanlykho/PhieuChuyenKho/tpl/model.html'),
	schema 				= require('json!schema/PhieuChuyenKhoSchema.json');
	var DanhMucSelectView = require('app/quanlykho/DanhMucKho/SelectView');
	var ChitietVattu = require('app/quanlykho/PhieuChuyenKho/ChitietItemView');


    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "phieuchuyenkho",
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
							var so_phieu_chungtu = self.model.get("so_phieu_chungtu");
							if (so_phieu_chungtu === undefined || so_phieu_chungtu === null || so_phieu_chungtu.trim() ===""){
								self.getApp().notify({message: "Vui lòng nhập số phiếu chứng từ"}, {type : "danger", delay : 1000});
								return;
							}
							var thoigian_chuyenkho = self.model.get("thoigian_chuyenkho");
							if (!thoigian_chuyenkho || thoigian_chuyenkho == null || thoigian_chuyenkho == undefined) {
								self.getApp().notify({message: "Vui lòng nhập thời gian chuyển kho"}, {type: "danger", delay: 3000});
								return;
							}  
							var kho_thu_nhat = self.model.get("kho_thu_nhat");
							if (kho_thu_nhat !== null && kho_thu_nhat !== undefined) {
								self.model.set({
									"ma_kho_thu_nhat": kho_thu_nhat.id,
									"ten_kho_thu_nhat" : kho_thu_nhat.ten_kho
								});
							}
							else{
								self.getApp().notify({message : "Vui lòng chọn kho chuyển vật tư"},{type : "danger", delay : 1000});
								return;
							}
							var kho_thu_hai = self.model.get("kho_thu_hai");
							if (kho_thu_hai !== null && kho_thu_hai !== undefined){
								var ma_kho_thu_hai = kho_thu_hai.id;
								if (!!self.model.get("ma_kho_thu_nhat") && ma_kho_thu_hai == self.model.get("ma_kho_thu_nhat")){
									self.getApp().notify({message : "Vui lòng chọn kho nhận khác kho chuyển"}, {type : "danger", delay : 1000});
									return;
								}
								self.model.set({
									"ma_kho_thu_hai": kho_thu_hai.id,
									"ten_kho_thu_hai" : kho_thu_hai.ten_kho
								})
							}
							else{
								self.getApp().notify({message : "Vui lòng chọn kho nhận vật tư"},{type : "danger", delay : 1000});
								return;
							}
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
					{
						name: "print",
						type: "button",
						buttonClass: "btn-secondary waves-effect width-sm  ml-2",
						label: "In Phiếu",
						command: function(){
							var self = this;
							Backbone.history.history.back();
						}
					},
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
						field:"kho_thu_nhat",
						uicontrol:"ref",
						textField: "ten_kho",
						foreignRemoteField: "id",
						foreignField: "ma_kho_thu_nhat",
						dataSource: DanhMucSelectView
					},
					{
						field:"kho_thu_hai",
						uicontrol:"ref",
						textField: "ten_kho",
						foreignRemoteField: "id",
						foreignField: "ma_kho_thu_hai",
						dataSource: DanhMucSelectView
					},
					{
						field:"thoigian_chuyenkho",
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
									var $selectz1 = (self.$el.find('#selectize-programmatic'))[0];
									if ($selectz1 !== undefined && $selectz1 !== null && $selectz1.selectize){
										$selectz1.selectize.destroy();
										self.render_kho_vattu_hanghoa();	
									}
								});
								chitietVattu.on("removeVattu", function (event) {
									self.$el.find('.table-vattu').show();
									var data_vattu = event.data;
									self.removeVattu(data_vattu);
									self.fillStt();
									var $selectz1 = (self.$el.find('#selectize-programmatic'))[0];
									if ($selectz1 !== undefined && $selectz1 !== null && $selectz1.selectize){
										$selectz1.selectize.destroy();
										self.render_kho_vattu_hanghoa();	
									}
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
				var currentDate = new Date().getTime();
				self.model.set("thoigian_taophieu", currentDate);
    		}
    		
		},
		register_event: function(){
			var self = this;
			self.model.on("change:kho_thu_nhat",function(){
				var kho_thu_nhat = self.model.get("kho_thu_nhat");
				if (kho_thu_nhat !== null && kho_thu_nhat !== undefined) {
					self.model.set({
						"ma_kho_thu_nhat": kho_thu_nhat.id,
						"ten_kho_thu_nhat" : kho_thu_nhat.ten_kho
					});
				}
			});
			self.model.on("change:kho_thu_hai",function(){
				var kho_thu_hai = self.model.get("kho_thu_hai");
				if (kho_thu_hai !== null && kho_thu_hai !== undefined) {
					self.model.set({
						"ma_kho_thu_hai": kho_thu_hai.id,
						"ten_kho_thu_hai" : kho_thu_hai.ten_kho
					});
				}
			});
			self.render_kho_vattu_hanghoa();
		},
		renderItem: function(obj){
			var self = this;
			var obj_chitiet_new = {
				"ten_vattu": obj.ten_vattu + (obj.hamluong!=null ? " " + obj.hamluong: ""),
				"ma_vattu": obj.ma_vattu,
				"id_vattu":obj.id_vattu,
				"vattu": obj,
				"loai_vattu":obj.loai_vattu,
                "so_lo":obj.so_lo,
				"phieuchuyenkho_id":self.model.get("id"),
				"donvitinh":obj.donvitinh,
				"thoigian_chuyenkho": self.model.get("thoigian_chuyenkho"),
				"thoigian_taophieu": self.model.get("thoigian_taophieu"),
				"ma_kho_thu_nhat": self.model.get("ma_kho_thu_nhat"),
				"ten_kho_thu_nhat": self.model.get("ten_kho_thu_nhat"),
				"kho_thu_nhat" : self.model.get("kho_thu_nhat"),
				"ma_kho_thu_hai" : self.model.get("ma_kho_thu_hai"),
				"ten_kho_thu_hai" : self.model.get("ten_kho_thu_hai"),
				"kho_thu_hai" : self.model.get("kho_thu_hai"),
				"so_luong_trong_kho_truoc_khi_chuyen" : obj.soluong,
				"hansudung" : obj.hansudung,
				"nuoc_sanxuat" : obj.nuoc_sanxuat,
				"hang_sanxuat" : obj.hang_sanxuat,
				"donvi_id":self.model.get("donvi_id"),
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
				var $selectz1 = (self.$el.find('#selectize-programmatic'))[0];
				if ($selectz1 !== undefined && $selectz1 !== null && $selectz1.selectize){
					$selectz1.selectize.destroy();
					self.render_kho_vattu_hanghoa();	
				}
			});
			chitietVattu.on("removeVattu", function (event) {
				self.$el.find('.table-vattu').show();
				var data_vattu = event.data;
				self.removeVattu(data_vattu);
				self.fillStt();
				var $selectz1 = (self.$el.find('#selectize-programmatic'))[0];
				if ($selectz1 !== undefined && $selectz1 !== null && $selectz1.selectize){
					$selectz1.selectize.destroy();
					self.render_kho_vattu_hanghoa();	
				}
			});
			self.fillStt();
		},
		savePhieu: function (mode = 0, objDataVattu) {
			var self = this;
			var so_phieu_chungtu = self.model.get("so_phieu_chungtu");
			if (so_phieu_chungtu === undefined || so_phieu_chungtu === null || so_phieu_chungtu.trim() ===""){
				self.getApp().notify({message: "Vui lòng nhập số phiếu chứng từ"}, {type : "danger", delay : 1000});
				return;
			}
			var thoigian_chuyenkho = self.model.get("thoigian_chuyenkho");
			if (!thoigian_chuyenkho || thoigian_chuyenkho == null || thoigian_chuyenkho == undefined) {
				self.getApp().notify({message: "Vui lòng nhập thời gian chuyển kho"}, {type: "danger", delay: 3000});
				return;
			}  
			var kho_thu_nhat = self.model.get("kho_thu_nhat");
			if (kho_thu_nhat !== null && kho_thu_nhat !== undefined) {
				self.model.set({
					"ma_kho_thu_nhat": kho_thu_nhat.id,
					"ten_kho_thu_nhat" : kho_thu_nhat.ten_kho
				});
			}
			else{
				self.getApp().notify({message : "Vui lòng chọn kho chuyển vật tư"},{type : "danger", delay : 1000});
				return;
			}
			var kho_thu_hai = self.model.get("kho_thu_hai");
			if (kho_thu_hai !== null && kho_thu_hai !== undefined){
				var ma_kho_thu_hai = kho_thu_hai.id;
				if (!!self.model.get("ma_kho_thu_nhat") && ma_kho_thu_hai == self.model.get("ma_kho_thu_nhat")){
					self.getApp().notify({message : "Vui lòng chọn kho nhận khác kho chuyển"});
					return;
				}
				self.model.set({
					"ma_kho_thu_hai": kho_thu_hai.id,
					"ten_kho_thu_hai" : kho_thu_hai.ten_kho
				})
			}
			else{
				self.getApp().notify({message : "Vui lòng chọn kho nhận vật tư"},{type : "danger", delay : 1000});
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
				// console.log("onSaveDataVattu=======",self.model.get("chitiet_vattu"));
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
		render_kho_vattu_hanghoa : function(){
			var self = this;
			var $selectize = self.$el.find('#selectize-programmatic').selectize({
                valueField: 'id',
                labelField: 'ten_vattu',
                searchField: ['ten_vattu'],
                preload: true,
                load: function(query, callback) {
					var ma_kho_thu_nhat = self.model.get("ma_kho_thu_nhat");
					var query_filter = null;
                    if(ma_kho_thu_nhat === null || ma_kho_thu_nhat === undefined){
						query_filter = {"filters": {"$and": [
							{"donvi_id":{"$eq": gonrinApp().currentUser.donvi_id}},
							{"$or":[{"ten_vattu":{"$likeI": query}},{"tenkhongdau":{"$likeI": query}}]}
						]}};
					}
					else{
						query_filter = {"filters": {"$and": [
							{"donvi_id":{"$eq": gonrinApp().currentUser.donvi_id}},
							{"ma_kho":{"$eq": ma_kho_thu_nhat}}, 
							{"$or":[{"ten_vattu":{"$likeI": query}},{"tenkhongdau":{"$likeI": query}}]}
						]}};
					}
                    var url = (self.getApp().serviceURL || "") + '/api/v1/kho_vattu_hanghoa?' + (query_filter? "&q=" + JSON.stringify(query_filter): "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        headers: {
                            'content-type': 'application/json'
                        },
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            callback(res.objects);
                        }
                    });
                },
                render: {
                    option: function (item, escape) {
                        var tenkho = item.ten_kho;
                        if(tenkho == null){
                            tenkho = '[Tồn kho:'+item.soluong+']';
                        }else{
                            tenkho = "Kho: "+tenkho + '[Tồn:'+item.soluong+']';
                        }
                        return '<div class=" px-2 border-bottom">'
                            + '<h5 class="py-0">' + escape(item.ten_vattu) + '</h5>'
                            + (tenkho ? '<small class="caption float-left " style="display:block">' + tenkho +'</small>' : '')
                            + (item.so_lo ? '<small class="caption float-right" style="display:block"> số lô: ' + escape(item.so_lo) + '</small>' : '')
                            + '</div>';
                    }
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
		}

    });

});