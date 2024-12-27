define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/quanlykho/PhieuChuyenKho1/tpl/model.html'),
	schema 				= require('json!schema/PhieuChuyenKhoSchema.json');
	var DanhMucSelectView = require('app/quanlykho/DanhMucKho/SelectView'),
		ChitietVattu = require('app/quanlykho/PhieuChuyenKho1/ChitietPhieuDialog/ChitietVatTu');
	
	var ManageFileVIew = require("app/view/AttachFile/ManageFileUploadView");

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
		    	    		self.savePhieu();
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
						buttonClass: "btn-primary waves-effect width-sm ml-2",
						label: "<i class='fa fa-file-pdf'></i> In Phiếu",
						visible: function(){
		    	    		return this.getApp().getRouter().getParam("id") !== null;
		    	    	},
						command: function(){
							var self = this;
							self.getApp().showloading();
							var params = JSON.stringify({
								"id": self.model.get("id"),
								"type": "phieunhap_kho"
							});
							$.ajax({
								url: (self.getApp().serviceURL || "") + '/api/v1/export_pdf_kho',
								dataType: "json",
								contentType: "application/json",
								method: 'POST',
								data: params,
								success: function(response) {
									self.getApp().hideloading();
									window.open(response, "_blank");
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
						field:"kho_chuyen",
						uicontrol:"ref",
						textField: "ten_kho",
						foreignRemoteField: "id",
						foreignField: "ma_kho_chuyen",
						dataSource: DanhMucSelectView
					},
					{
						field:"kho_tiepnhan",
						uicontrol:"ref",
						textField: "ten_kho",
						foreignRemoteField: "id",
						foreignField: "ma_kho_tiepnhan",
						dataSource: DanhMucSelectView
					},
					{
						field:"thoigian_chuyenkho",
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
            	]
			},
		tongtien_vattu: 0,
    	render:function(){
			var self = this;
			self.tongtien_vattu = 0;
			var id = this.getApp().getRouter().getParam("id");
			self.$el.find('.btn-add-vattu').unbind("click").bind("click", function (e) {
				e.stopPropagation();
				self.DialogChitietVattu();
			});
    		if(id){
    			this.model.set('id',id);
        		this.model.fetch({
        			success: function(data){
						self.applyBindings();
        			},
        			error:function(){
    					self.getApp().notify(self.getApp().traslate("TRANSLATE:error_load_data"));
					},
					complete:function(){
                        var fileView = new ManageFileVIew({ viewData: { "listFile": self.model.get('chungtu_dinhkem'), "$el_btn_upload": self.$el.find(".btn-add-file") }, el: self.$el.find(".list-attachment") });
						fileView.render();
						fileView.on("change", (event) => {
							var listfile = event.data;
							self.model.set('chungtu_dinhkem', listfile);
						});
						var chitiet_sanpham = self.model.get("chitiet_sanpham");
						if (!!chitiet_sanpham && chitiet_sanpham !== undefined && chitiet_sanpham !== null && chitiet_sanpham instanceof Array && chitiet_sanpham.length > 0) {
							self.$el.find('.table-vattu').show();
							chitiet_sanpham.forEach( (value, index) => {
								self.appendHtmlChitietVatTu(value);
								self.fillStt();
								var giatien = gonrinApp().convert_string_to_number(value.dongia);
								var soluong = gonrinApp().convert_string_to_number(value.soluong_thucte);
								self.tongtien_vattu = self.tongtien_vattu + giatien * soluong;
							});
							self.$el.find('.tongtien-vattu').text(Number(self.tongtien_vattu).toLocaleString());
						} else {
							self.$el.find('.table-vattu').hide();
						}
					}
				});				
    		} else {
				self.applyBindings();
				self.$el.find('.table-vattu').hide();
				var currentDate = moment().unix();
				self.model.set("thoigian_taophieu", currentDate);
				var fileView = new ManageFileVIew({ viewData: { "listFile": self.model.get('chungtu_dinhkem'), "$el_btn_upload": self.$el.find(".btn-add-file") }, el: self.$el.find(".list-attachment") });
				fileView.render();
				fileView.on("change", (event) => {
					var listfile = event.data;
					self.model.set('chungtu_dinhkem', listfile);
				});
			}
    		
		},
		savePhieu: function (mode = 0, dataView=null) {
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
			var kho_chuyen = self.model.get("kho_chuyen");
			if (kho_chuyen !== null && kho_chuyen !== undefined) {
				self.model.set({
					"ma_kho_chuyen": kho_chuyen.id,
					"ten_kho_chuyen" : kho_chuyen.ten_kho
				});
			}
			else{
				self.getApp().notify({message : "Vui lòng chọn kho chuyển dược liệu"},{type : "danger", delay : 1000});
				return;
			}
			var kho_tiepnhan = self.model.get("kho_tiepnhan");
			if (kho_tiepnhan !== null && kho_tiepnhan !== undefined){
				var ma_kho_tiepnhan = kho_tiepnhan.id;
				if (!!self.model.get("ma_kho_chuyen") && ma_kho_tiepnhan == self.model.get("ma_kho_chuyen")){
					self.getApp().notify({message : "Vui lòng chọn kho nhận khác kho chuyển"});
					return;
				}
				self.model.set({
					"ma_kho_tiepnhan": kho_tiepnhan.id,
					"ten_kho_tiepnhan" : kho_tiepnhan.ten_kho
				})
			}
			else{
				self.getApp().notify({message : "Vui lòng chọn kho nhận dược liệu"},{type : "danger", delay : 1000});
				return;
			}
			self.model.set("ten_nguoi_lap_phieu",gonrinApp().currentUser.hoten);
			self.model.set("ma_nguoi_lap_phieu",gonrinApp().currentUser.id);

			self.model.save(null,{
				success: function (model, respose, options) {
					if (mode == 0) {
						self.getApp().notify("Lưu thông tin thành công");
						self.getApp().getRouter().navigate(self.collectionName + "/collection");
					} else  if (mode == 1) {
						self.model.set(model.attributes);
						var phieuchuyenkho_id = self.model.get("id");
						var thoigian_taophieu = self.model.get("thoigian_taophieu");
						if (thoigian_taophieu == null || thoigian_taophieu == undefined) {
							thoigian_taophieu = moment().unix();
							self.model.set("thoigian_taophieu", thoigian_taophieu);
						}
						var thoigian_chuyenkho = self.model.get("thoigian_chuyenkho");
						if (thoigian_chuyenkho === null || thoigian_chuyenkho === undefined){
							thoigian_chuyenkho = moment().unix();
							self.model.set("thoigian_chuyenkho", thoigian_chuyenkho);
						}
						var chitietVattu = new ChitietVattu({viewData: {"data": dataView, "phieuchuyenkho_id": phieuchuyenkho_id, "so_phieu_chungtu": self.model.get("so_phieu_chungtu"), "thoigian_taophieu": thoigian_taophieu, "ma_kho_chuyen":self.model.get("ma_kho_chuyen"), "ten_kho_chuyen":self.model.get("ten_kho_chuyen"), "thoigian_chuyenkho" : self.model.get("thoigian_chuyenkho"), "kho_chuyen" : self.model.get("kho_chuyen"), "ma_kho_tiepnhan" : self.model.get("ma_kho_tiepnhan"), "ten_kho_tiepnhan" : self.model.get("ten_kho_tiepnhan"), "kho_tiepnhan": self.model.get("kho_tiepnhan") }});

						chitietVattu.dialog({size : "large"});
						chitietVattu.on("saveVattu", function (event) {
							self.$el.find('.table-vattu').show();
							var data_sanpham = event.data;
							self.onSaveDataVatTu(data_sanpham);
						});
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
		DialogChitietVattu: function (dataView = null) {
			var self = this;
			var id = self.model.get("id");
			if (!id || id == null || id == undefined || id == "") {
				self.savePhieu(1, dataView);
			} else {
				var phieuchuyenkho_id = self.model.get("id");
				var thoigian_taophieu = self.model.get("thoigian_taophieu");
				if (thoigian_taophieu == null || thoigian_taophieu == undefined) {
					thoigian_taophieu = moment().unix();
					self.model.set("thoigian_taophieu", thoigian_taophieu);
				}
				var thoigian_chuyenkho = self.model.get("thoigian_chuyenkho");
				if (thoigian_chuyenkho === null || thoigian_chuyenkho === undefined){
					thoigian_chuyenkho = moment().unix();
					self.model.set("thoigian_chuyenkho", thoigian_chuyenkho);
				}
				var chitietSanpham = new ChitietVattu({viewData: {"data": dataView, "phieuchuyenkho_id": phieuchuyenkho_id, "thoigian_taophieu": thoigian_taophieu, "ma_kho_chuyen":self.model.get("ma_kho_chuyen"), "ten_kho_chuyen":self.model.get("ten_kho_chuyen"), "thoigian_chuyenkho" : self.model.get("thoigian_chuyenkho"), "kho_chuyen" : self.model.get("kho_chuyen"), "ma_kho_tiepnhan" : self.model.get("ma_kho_tiepnhan"), "ten_kho_tiepnhan" : self.model.get("ten_kho_tiepnhan"), "kho_tiepnhan": self.model.get("kho_tiepnhan") }});

				chitietSanpham.dialog({size : "large"});
				chitietSanpham.on("saveVattu", function (event) {
					self.$el.find('.table-vattu').show();
					var data_sanpham = event.data;
					self.onSaveDataVatTu(data_sanpham);
				});
			}
		},
		appendHtmlChitietVatTu: function (data) {
			var self = this;
			var thanhtien = (data.soluong_thucte ? data.soluong_thucte : 0)* (data.dongia? data.dongia:0);
			var tr_el = $("<tr>").attr({"id":data.id});
			tr_el.html(`<td class="stt text-center">` + 1 + `</td>
				<td class="ten_sanpham">` + data.ten_sanpham + `</td>
				<td class="donvitinh text-center">` + (data.donvitinh ? data.donvitinh:"Kg") + `</td>
				<td class="so_lo text-center">` + (data.so_lo ? data.so_lo:"") + `</td>
				<td class="dongia text-center">` + Number(data.dongia).toLocaleString()+ `</td>
				<td class="soluong_truoc_chuyen text-center">` + (data.soluong_truoc_chuyen ? data.soluong_truoc_chuyen : "0") + `</td>
				<td class="soluong_chungtu text-center">` + (data.soluong_chungtu ? data.soluong_chungtu : "0") + `</td>
				<td class="soluong_thucte text-center">` + (data.soluong_thucte ? data.soluong_thucte : "0") + `</td>
				<td class="soluong_sau_chuyen text-center">` + (data.soluong_sau_chuyen ? data.soluong_sau_chuyen : "0") + `</td>
				<td class="text-center"><a href="javascript:;" class="demo-delete-row btn btn-danger btn-xs btn-icon" title="Xóa"><i class="fa fa-times"></i></a></td>
				<td class="text-center">
					<a  href="javascript:;"  class="demo-edit-row btn btn-success btn-xs btn-icon" title="Sửa"><i class="mdi mdi-pencil"></i></a>
				</td>`);
			self.$el.find('.table-vattu tbody').append(tr_el);
			tr_el.find(".demo-delete-row").unbind("click").bind("click",{obj:data},function(e){
				e.stopPropagation();
				var data_sanpham = e.data.obj;
				var url = (self.getApp().serviceURL || "") + '/api/v1/phieuchuyenkho_chitiet/' + data_sanpham.id;
				$.ajax({
					url: url,
					type: 'DELETE',
					headers: {
						'content-type': 'application/json',
						'Access-Control-Allow-Origin': '*'
					},
					success: function(response) {
						var listSanpham = self.model.get("chitiet_sanpham");
						if (listSanpham instanceof Array && listSanpham.length > 0) {
							var arraysanpham = [];
							for (var i = 0; i < listSanpham.length; i++) {
								if (data_sanpham.id == listSanpham[i].id) {
									self.$el.find(".table-vattu #" + data_sanpham.id).remove();
									self.fillStt();
									continue
								} else {
									arraysanpham.push(listSanpham[i]);
								}
							}
							if (arraysanpham.length == 0) {
								self.$el.find('.table-vattu').hide();
							}
							self.model.set("chitiet_sanpham", arraysanpham);
							var giatien = gonrinApp().convert_string_to_number(data_sanpham.dongia);
							var soluong = gonrinApp().convert_string_to_number(data_sanpham.soluong_thucte);
							self.tongtien_vattu = self.tongtien_vattu - giatien * soluong;
							self.$el.find('.tongtien-vattu').text(Number(self.tongtien_vattu).toLocaleString());
							return;
						}
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
					}
				});
				
			});
			tr_el.find(".demo-edit-row").unbind("click").bind("click",{obj:data},function(e){
				e.stopPropagation();
				var obj_data = e.data.obj;
				self.DialogChitietVattu(obj_data);
			});
		},
		onSaveDataVatTu: function (data_sanpham) {
            var self = this;
            var listSanpham = self.model.get("chitiet_sanpham");
            if (listSanpham == null || listSanpham == undefined) {
                listSanpham = [];
			}
			var exits = false;
            if (listSanpham instanceof Array) {
                var arraysanpham = [];
                if (listSanpham.length == 0) {
                    arraysanpham.push(data_sanpham);
                } else {
                    for (var i = 0; i < listSanpham.length; i++) {
                        if (data_sanpham.id == listSanpham[i].id) {
							exits = true;
							var giatien = gonrinApp().convert_string_to_number(listSanpham[i].dongia);
							var soluong = gonrinApp().convert_string_to_number(listSanpham[i].soluong_thucte);
							self.tongtien_vattu = self.tongtien_vattu - giatien * soluong;
							self.$el.find('.tongtien-vattu').text(Number(self.tongtien_vattu).toLocaleString());
                            continue
                        } else {
                            arraysanpham.push(listSanpham[i]);
                        }
                    }
                    arraysanpham.push(data_sanpham);
				}
				self.model.set("chitiet_sanpham", arraysanpham);
				if (arraysanpham.length > 0) {
					self.$el.find('.table-vattu').show();
				}
				var giatien = gonrinApp().convert_string_to_number(data_sanpham.dongia);
				var soluong = gonrinApp().convert_string_to_number(data_sanpham.soluong_thucte);
				self.tongtien_vattu = self.tongtien_vattu + giatien * soluong;
				self.$el.find('.tongtien-vattu').text(Number(self.tongtien_vattu).toLocaleString());
				if (exits == false) {
					self.$el.find('.table-vattu').show();
					self.appendHtmlChitietVatTu(data_sanpham);
					self.fillStt();
				} else {
					var elt = self.$el.find(".table-vattu #" + data_sanpham.id);
					elt.find('.so_lo').text(data_sanpham.so_lo);
					elt.find('.ten_sanpham').text(data_sanpham.ten_sanpham);
					elt.find('.soluong_chungtu').text(data_sanpham.soluong_chungtu);
					elt.find('.soluong_thucte').text(data_sanpham.soluong_thucte);
					elt.find('.soluong_truoc_chuyen').text(data_sanpham.soluong_truoc_chuyen);
					elt.find('.soluong_sau_chuyen').text(data_sanpham.soluong_sau_chuyen);
					elt.find('.dongia').text(Number(data_sanpham.dongia).toLocaleString());
					elt.find('.thanhtien').text(Number(data_sanpham.thanhtien).toLocaleString());
					elt.find(".demo-edit-row").unbind("click").bind("click",{obj:data_sanpham},function(e){
						e.stopPropagation();
						var obj_data = e.data.obj;
						self.DialogChitietVattu(obj_data);
					});
				}
            }
		},
		fillStt: function () {
			var self = this;
			var stt = self.$el.find(".stt");
			$.each(stt, (index, element) => {
				$(element).text(index + 1);
			});
		},
		register_event: function(){
			var self = this;
			self.model.on("change:kho_chuyen",function(){
				var kho_chuyen = self.model.get("kho_chuyen");
				if (kho_chuyen !== null && kho_chuyen !== undefined) {
					self.model.set({
						"ma_kho_tiepnhan": kho_chuyen.id,
						"ten_kho_tiepnhan" : kho_chuyen.ten_kho
					});
				}
			});
			self.model.on("change:kho_tiepnhan",function(){
				var kho_tiepnhan = self.model.get("kho_tiepnhan");
				if (kho_tiepnhan !== null && kho_tiepnhan !== undefined) {
					self.model.set({
						"ma_kho_tiepnhan": kho_tiepnhan.id,
						"ten_kho_tiepnhan" : kho_tiepnhan.ten_kho
					});
				}
			});
			self.render_kho_vattu_hanghoa();
		},
    });

});