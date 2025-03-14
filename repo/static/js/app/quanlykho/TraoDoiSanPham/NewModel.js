define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/quanlykho/TraoDoiSanPham/tpl/model.html'),
	schema 				= require('json!schema/PhieuXuatKhoSchema.json');
	var DanhMucSelectView = require('app/quanlykho/DanhMucKho/SelectView');
	var ChitietVattu = require('app/quanlykho/PhieuXuat/ChitietPhieuDialog/ChitietVatTu');
	var ManageFileVIew = require("app/view/AttachFile/ManageFileUploadView");
    var KhachHangDonVi = require('app/quanlykho/PhieuXuat/KhachHangDialog');
	var KhoDialog = require("app/quanlykho/TraoDoiSanPham/KhoDialog");
    


    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "phieuxuatkho",
		setIdDonvi: false,
		setObjectDonvi: false,
		hasView: false,
		setKho : false,
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
                name : "xacnhan",
                type : "button",
                buttonClass: "btn-primary waves-effect btn-xacnhan width-sm ml-2",
                label: "Xác nhận",
                visible: function(){
                    return this.getApp().getRouter().getParam("id") !== null;
                },
                command: function(){
                    var self = this;
                    // self.getApp().showloading();
                    self.change_trangthai();
                }
            }
        ],
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
						field:"loai_xuat",
						uicontrol:"combobox",
						textField: "text",
						valueField: "value",
						cssClass:"form-control",
							dataSource: [
							{ value: "sudung", text: "Xuất sử dụng" },
							{ value: "taitro", text: "Xuất tài trợ" },
							{ value: "ban", text: "Xuất bán" },
							{ value: "tra", text: "Xuất trả" },
							{ value: "huy", text: "Xuất hủy" }
						],
					},
					{
						field:"hinhthuc_giaodich",
						uicontrol:"combobox",
						textField: "text",
						valueField: "value",
						cssClass:"form-control",
							dataSource: [
								{ value: 1, text: "Liên doanh, liên kết" },
								{ value: 2, text: "Mua thương mại" },
								{ value: 3, text: "Mua sử dụng" },
								{ value: 4, text: "Khác" },
						],
					},
					{
						field:"loai_xuat_ban",
						uicontrol:"combobox",
						textField: "text",
						valueField: "value",
						cssClass:"form-control",
							dataSource: [
							{ value: 1, text: "Xuất bán cho đơn vị" },
							{ value: 2, text: "Xuất bán lẻ" },
						],
					},
					{
						field:"kho",
						uicontrol:"ref",
						textField: "ten_kho",
						foreignRemoteField: "id",
						foreignField: "ma_kho",
						dataSource: DanhMucSelectView
					},
					{
						field:"thoigian_xuat",
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
						field:"thoigian_batdau_vanchuyen",
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
						field:"thoigian_ketthuc_vanchuyen",
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
					}
            	]
			},
		tongtien_vattu: 0,
    	render:function(){
			var self = this;
			self.setIdDonvi = false;
			self.setObjectDonvi = false;
			self.hasView = false;
			self.setKho = false;
			var id = this.getApp().getRouter().getParam("id");
			self.tongtien_vattu = 0;
			self.$el.find('.btn-add-vattu').unbind("click").bind("click", function (e) {
				e.stopPropagation();
				self.DialogChitietVattu();
			});
			if ($(window).width() < 768) {
				self.$el.find(".border-left").removeClass('border-left');
			}
    		if(id){
    			this.model.set('id',id);
        		this.model.fetch({
        			success: function(data){
						self.applyBindings();
						self.selectizeKho();
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
						self.render_loai_xuatban();
						self.register_loai_xuatban();
						// self.selectizeDonViTiepNhan();
						self.appendKhachHang();
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
                        self.$el.find("input,textarea").prop("disabled", true);
						let xacnhan = self.model.get("xacnhan");
						if (xacnhan ===2){
							self.$el.find('.btn-xacnhan').remove();
						}
					}
        		});
    		} else {
				self.applyBindings();
				self.selectizeKho();
				self.selectizeDonViTiepNhan();
				self.appendKhachHang();
				self.$el.find('.table-vattu').hide();
				self.register_loai_xuatban();
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
		savePhieu: function (mode = 0) {
			var self = this;
			var loai_xuat_ban = self.model.get("loai_xuat_ban");
			if (loai_xuat_ban === undefined || loai_xuat_ban === null){
				self.getApp().notify({message : "Vui lòng chọn hình thức xuất"}, {type : "danger", delay : 2000});
				return;
			}
			// var ten_donvi_cungung = self.model.get("ten_donvi_cungung");
			// if (!ten_donvi_cungung || ten_donvi_cungung == null || ten_donvi_cungung == undefined) {
			// 	self.getApp().notify({message: "Vui lòng nhập tên đơn vị cung ứng."}, {type: "danger", delay: 5000});
			// 	return;
			// } 
			var kho = self.model.get("kho");
			if (!kho || kho == null || kho == undefined) {
				self.getApp().notify({message: "Vui lòng chọn kho xuất hàng."}, {type: "danger", delay: 5000});
				return;
			} else {
				self.model.set({
					"ma_kho": kho.id,
					"ten_kho" : kho.ten_kho
				})
			}
			self.model.set("ten_nguoi_lap_phieu",gonrinApp().currentUser.fullname);
			self.model.set("ma_nguoi_lap_phieu",gonrinApp().currentUser.id);

			var tmp = self.validate_loai_xuatban();
			if (tmp == false){
				return;
			}
			self.model.save(null,{
				success: function (model, respose, options) {
					if (mode == 0) {
						self.getApp().notify("Lưu thông tin thành công");
						self.getApp().getRouter().navigate(self.collectionName + "/collection");
					} else  if (mode == 1) {
						self.model.set(model.attributes);
						self.DialogChitietVattu();
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
				self.savePhieu(1);
			} else {
				var phieuxuat_id = self.model.get("id");
				var thoigian_taophieu = self.model.get("thoigian_taophieu");
				if (thoigian_taophieu == null || thoigian_taophieu == undefined) {
					thoigian_taophieu = moment().unix();
					self.model.set("thoigian_taophieu", thoigian_taophieu);
				}
				var thoigian_xuat = self.model.get("thoigian_xuat");
				if (thoigian_xuat === undefined || thoigian_xuat === null){
					thoigian_xuat = moment().unix();
					self.model.set("thoigian_xuat", thoigian_xuat);
				}
				var chitietVattu = new ChitietVattu({viewData: {"data": dataView, "phieuxuat_id": phieuxuat_id, "so_phieu_chungtu": self.model.get("so_phieu_chungtu"),"thoigian_taophieu": thoigian_taophieu, "ma_kho":self.model.get("ma_kho"), "ten_kho":self.model.get("ten_kho"), "thoigian_xuat" : self.model.get("thoigian_xuat"), "ma_donvi_tiepnhan" : self.model.get("ma_donvi_tiepnhan"), "ten_donvi_tiepnhan" : self.model.get("ten_donvi_tiepnhan"), "donvi_tiepnhan" : self.model.get("donvi_tiepnhan"), "ten_nguoinhan" : self.model.get("ten_nguoinhan"), "diachi_nguoinhan" : self.model.get("diachi_nguoinhan"), "dienthoai_nguoinhan" : self.model.get("dienthoai_nguoinhan"), "loai_xuat_ban" : self.model.get("loai_xuat_ban")}});

				chitietVattu.dialog();
				chitietVattu.on("saveVattu", function (event) {
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
			tr_el.html(`<td class="stt">` + 1 + `</td>
				<td class="so_lo">` + (data.so_lo ? data.so_lo:"") + `</td>
				<td class="ten_sanpham">` + data.ten_sanpham + `</td>
				<td class="soluong_chungtu">` + (data.soluong_chungtu ? data.soluong_chungtu:"0") + `</td>
				<td class="soluong_thucte">` + (data.soluong_thucte ? data.soluong_thucte:"0")  + `</td>
				<td class="dongia">` + Number(data.dongia).toLocaleString()+ `</td>
				<td class="thanhtien">` + Number(thanhtien).toLocaleString() + `</td>`);
			self.$el.find('.table-vattu tbody').append(tr_el);
			tr_el.find(".demo-delete-row").unbind("click").bind("click",{obj:data},function(e){
				e.stopPropagation();
				var data_sanpham = e.data.obj;
				var url = (self.getApp().serviceURL || "") + '/api/v1/phieuxuatkho_chitiet/' + data_sanpham.id;
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
							self.tongtien_vattu = self.tongtien_vattu + giatien * soluong;
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
		validate_loai_xuatban : function(){
			var self = this;
			var loai_xuat_ban = self.model.get("loai_xuat_ban");
			if (loai_xuat_ban === undefined || loai_xuat_ban === null){
				self.getApp().notify({message : "Vui lòng chọn loại xuất bán"}, {type : "danger", delay : 2000});
				return false;
			}
			else{
				if (loai_xuat_ban == 1){
					var donvi_tiepnhan = self.model.get("donvi_tiepnhan");
					if (donvi_tiepnhan === undefined || donvi_tiepnhan === null){
						self.getApp().notify({message : "Vui lòng chọn đơn vị tiếp nhận"}, {type : "danger", delay : 2000});
						return false;
					}
				}
				else if (loai_xuat_ban ==2){
					var ten_nguoinhan = self.model.get("ten_nguoinhan");
					if (ten_nguoinhan === undefined || ten_nguoinhan === null || ten_nguoinhan === ""){
						self.getApp().notify({message : "Vui lòng nhập tên người tiếp nhận"}, {type : "danger" , delay : 2000});
						return false;
					}
					var dienthoai_nguoinhan = self.model.get("dienthoai_nguoinhan");
					if (dienthoai_nguoinhan === undefined || dienthoai_nguoinhan === null || dienthoai_nguoinhan === ""){
						self.getApp().notify({message : "Vui lòng nhập số điện thoại người tiếp nhận"}, {type : "danger", delay : 2000});
						return false;
					}
				}
				return true;
			}
		},
		selectizeDonViTiepNhan: function(){
			var self = this;
			let loai_xuat_ban = self.model.get("loai_xuat_ban");
			if (loai_xuat_ban === 1){
				var $selectize = self.$el.find('#selectize-donvi_tiepnhan').selectize({
					valueField: 'id',
					labelField: 'ten_coso',
					searchField: ['ten_coso', 'tenkhongdau'],
					preload: true,
					maxOptions : 50,
					maxItems : 1,
					load: function(query, callback) {
						let donvi_tiepnhan = self.model.get("donvi_tiepnhan");
						if (!!donvi_tiepnhan && self.setObjectDonvi === false){
							callback([donvi_tiepnhan]);
							self.setObjectDonvi = true;	
						}
						var url = (self.getApp().serviceURL || "") + '/api/v1/get_ds_donvi_khachhang';
						$.ajax({
							url: url,
							type: 'POST',
							data: JSON.stringify({
								query,
								type: 1,
								donvi_id: gonrinApp().currentUser.donvi_id
							}),
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
						var $selectz = (self.$el.find('#selectize-donvi_tiepnhan'))[0];
						var obj = $selectz.selectize.options[value];
						if (obj !== undefined && obj !== null){
							self.model.set("donvi_tiepnhan", obj);
							var ten_donvi_tiepnhan = obj.ten_coso;
							if (ten_donvi_tiepnhan !== undefined && ten_donvi_tiepnhan !== null && ten_donvi_tiepnhan !== ""){
								self.model.set("ten_donvi_tiepnhan", ten_donvi_tiepnhan);
							}
							var ma_donvi_tiepnhan = obj.id;
							if (ma_donvi_tiepnhan !== undefined && ma_donvi_tiepnhan !== null && ma_donvi_tiepnhan !== ""){
								self.model.set("ma_donvi_tiepnhan", ma_donvi_tiepnhan);
							}
							let dienthoai = obj.dienthoai;
							self.model.set("dienthoai_nguoinhan", dienthoai);
							let diachi = obj.diachi;
							self.model.set("diachi_nguoinhan", diachi);
						}
						else{
							self.model.set("donvi_tiepnhan", null);
							self.model.set("ten_donvi_tiepnhan", null);
							self.model.set("ma_donvi_tiepnhan", null);
							self.model.set("dienthoai_nguoinhan", null);
							self.model.set("diachi_nguoinhan", null);
						}
					}
				});
			}
			else if (loai_xuat_ban ===2){
				var $selectize = self.$el.find('#selectize-donvi_tiepnhan').selectize({
					valueField: 'id',
					labelField: 'hoten',
					searchField: ['hoten', 'tenkhongdau'],
					preload: true,
					maxOptions : 50,
					maxItems : 1,
					load: function(query, callback) {
						var url = (self.getApp().serviceURL || "") + '/api/v1/get_ds_donvi_khachhang';
						$.ajax({
							url: url,
							type: 'POST',
							data: JSON.stringify({
								query,
								type: 2,
								donvi_id: gonrinApp().currentUser.donvi_id
							}),
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
						var $selectz = (self.$el.find('#selectize-donvi_tiepnhan'))[0];
						var obj = $selectz.selectize.options[value];
						if (obj !== undefined && obj !== null){
							let hoten = obj.hoten;
							self.model.set("ten_nguoinhan", hoten);
							let dienthoai = obj.dienthoai;
							self.model.set("dienthoai_nguoinhan", dienthoai);
							let diachi = obj.diachi;
							self.model.set("diachi_nguoinhan", diachi);
						}
						else{

						}
					}
				});
			}
		},
		register_loai_xuatban : function(){
			var self = this;
			self.model.on("change:loai_xuat_ban", function(){
				var loai_xuat_ban = self.model.get("loai_xuat_ban");
				if (loai_xuat_ban ==1){
					self.$el.find(".donvi_tiepnhan").removeClass("d-none");
					self.$el.find(".ten_donvi_tiepnhan").removeClass("d-none");
					self.$el.find(".sogiayphep").removeClass("d-none");
					self.$el.find(".text-donvi_tiepnhan").text("Tìm kiếm đơn vị");
					let select = (self.$el.find("#selectize-donvi_tiepnhan"))[0];
					self.model.set("donvi_tiepnhan", null);
					self.model.set("ten_donvi_tiepnhan", null);
					self.model.set("ma_donvi_tiepnhan", null);
					self.model.set("dienthoai_nguoinhan", null);
					self.model.set("diachi_nguoinhan", null);
					if (!!select && !!select.selectize){
						select.selectize.destroy();
					}
					self.selectizeDonViTiepNhan();
				}
				else{
					self.$el.find(".donvi_tiepnhan").removeClass("d-none");
					self.$el.find(".ten_donvi_tiepnhan").addClass("d-none");
					self.$el.find(".sogiayphep").addClass("d-none");
					self.$el.find(".text-donvi_tiepnhan").text("Tìm kiếm khách hàng");
					let select = (self.$el.find("#selectize-donvi_tiepnhan"))[0];
					self.model.set("donvi_tiepnhan", null);
					self.model.set("ten_donvi_tiepnhan", null);
					self.model.set("ma_donvi_tiepnhan", null);
					self.model.set("dienthoai_nguoinhan", null);
					self.model.set("diachi_nguoinhan", null);
					if (!!select && !!select.selectize){
						select.selectize.destroy();
					}
					self.selectizeDonViTiepNhan();
				}
			})
		},
		render_loai_xuatban : function(){
			var self = this;
			var loai_xuat_ban = self.model.get("loai_xuat_ban");
			if (loai_xuat_ban ==1){
				self.$el.find(".donvi_tiepnhan").removeClass("d-none");
				self.$el.find(".text-donvi_tiepnhan").text("Tìm kiếm đơn vị");
				self.$el.find(".ten_donvi_tiepnhan").removeClass("d-none");
				self.$el.find(".sogiayphep").removeClass("d-none");
			}
			else{
				self.$el.find(".donvi_tiepnhan").removeClass("d-none");
				self.$el.find(".ten_donvi_tiepnhan").addClass("d-none");
				self.$el.find(".sogiayphep").addClass("d-none");
				self.$el.find(".text-donvi_tiepnhan").text("Tìm kiếm khách hàng");
			}
		},
		change_trangthai : function(){
			var self = this;
			var khodialog = new KhoDialog();
			khodialog.dialog();
			var ma_kho = "";
			var ten_kho = "";
			var kho = "";
			var so_phieu_chungtu = "";
			var thoigian_nhap = "";
			khodialog.on("saveData", function(event){
				var data = event.data;
				if (!!data && !!data.ma_kho && data.ten_kho && data.kho && data.so_phieu_chungtu && data.thoigian_nhap){
					ma_kho = data.ma_kho;
					ten_kho = data.ten_kho;
					kho = data.kho;
					so_phieu_chungtu = data.so_phieu_chungtu;
					thoigian_nhap = data.thoigian_nhap;
					var params = JSON.stringify({
						"ma_kho" : ma_kho,
						"ten_kho" : ten_kho,
						"kho" : kho,
						"id_phieuxuat" : self.model.get("id"),
						"so_phieu_chungtu" : so_phieu_chungtu,
						"thoigian_nhap" : thoigian_nhap
                    });
                    self.getApp().showloading();
					$.ajax({
						url: (self.getApp().serviceURL || "") + '/api/v1/xacnhan_phieunhap',
						dataType: "json",
						contentType: "application/json",
						method: 'POST',
						data: params,
						success: function(response) {
							self.getApp().hideloading();
							self.getApp().notify({message : "Xác nhận thành công."});
							self.getApp().getRouter().navigate("phieunhapkho/collection");
						},
						error:function(xhr,status,error){
							self.getApp().hideloading();
							try {
								if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED"){
									self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
									self.getApp().getRouter().navigate("login");
								} else {
								self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 2000 });
								}
							}
							catch (err) {
								self.getApp().notify({ message: "Lưu thông tin không thành công"}, { type: "danger", delay: 1000 });
							}
						},
					});
				}
			});
        },
		selectizeKho: function () {
			var self = this;
			var currentUser = self.getApp().currentUser;
			var donvi_id = "";
			if (!!currentUser && !!currentUser.donvi) {
				donvi_id = currentUser.donvi.id;
			}
			var $selectize0 = self.$el.find('#chonkho').selectize({
				maxItems: 1,
				valueField: 'id',
				labelField: 'ten_kho',
				searchField: ['ten_kho'],
				preload: true,
				load: function (query, callback) {
					var query_filter = {
						"filters": {
							"$and": [{
								"$or": [
									{ "ten_kho": { "$likeI": (query) } },
								]
							},
							{ "donvi_id": { "$eq": donvi_id } }
							]
						},
						"order_by": [{ "field": "loai_uu_tien", "direction": "asc" }]
					};
					var url = (self.getApp().serviceURL || "") + '/api/v1/danhmuc_kho?page=1&results_per_page=20' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
					$.ajax({
						url: url,
						type: 'GET',
						dataType: 'json',
						error: function () {
							callback();
						},
						success: function (res) {
							callback(res.objects);
							var id = self.model.get("id");
							if (!id) {
								var khoChinh = res.objects.filter((value, index) => {
									return value.isPrimay === 1;
								})
								if (khoChinh.length === 0) {
									if (res.objects.length > 0) {
										let tmp = res.objects[0];
										$selectize0[0].selectize.setValue([tmp.id]);
									}
								}
								else {
									let tmp = khoChinh[0];
									$selectize0[0].selectize.setValue([tmp.id]);
								}
							}
							else {
								var khoId = self.model.get('ma_kho');
								if (!!khoId) {
									$selectize0[0].selectize.setValue(khoId);
								}
								$selectize0[0].selectize.disable();
							}
						}
					});
				},
				onChange: function (value) {
					var obj = $selectize0[0].selectize.options[value];
					if (obj !== null && obj !== undefined) {
						let id = self.model.get("id");
						if (!id || self.setKho == true) {
							self.model.set({
								"ma_kho": value,
								"ten_kho": obj.ten_kho,
								"kho": obj
							})
						}
						else {
							self.setKho = true;
						}
					} else {
						self.model.set({
							"ma_kho": null,
							"ten_kho": null,
							"kho": null
						})
					}
				}
			});
		},
		appendKhachHang: function(){
			var self = this;
			self.$el.find(".btn-add-donvi").unbind("click").bind("click", (e)=>{
				e.stopPropagation();
				let loai_xuat_ban = self.model.get("loai_xuat_ban");
				if (!loai_xuat_ban){
					self.getApp().notify({message: "Vui lòng chọn loại xuất bán"}, {type:"danger", delay : 1000});
					return false;
				}
				else{
					let khachHang = new KhachHangDonVi({viewData:{donvi_id: gonrinApp().currentUser.donvi_id, loai_xuat_ban}});
					khachHang.dialog({size:'large'});
					khachHang.on("saveData", (e)=>{
						if (!!e && e.data){
							let data = e.data;
							let type = data.type;
							if (type ===1){
								self.model.set({
									'donvi_tiepnhan': data,
									'ma_donvi_tiepnhan': data.id,
									'ten_donvi_tiepnhan': data.ten_coso,
									'dienthoai_nguoinhan': data.dienthoai,
									'diachi_nguoinhan': data.diachi,
									'ten_nguoinhan': data.hoten
								})
								self.$el.find('#sogiayphep').text(data.sogiayphep);
							}
							else{
								self.model.set({
									'ten_nguoinhan': data.hoten,
									'dienthoai_nguoinhan': data.dienthoai,
									'diachi_nguoinhan': data.diachi
								})
							}
						}
					})
				}
			})
		}
    });

});