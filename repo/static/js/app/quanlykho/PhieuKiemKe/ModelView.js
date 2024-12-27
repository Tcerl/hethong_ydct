define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/quanlykho/PhieuKiemKe/tpl/model.html');
	var CustomFilterView      = require('app/bases/CustomFilterView'),
		KhoSelectView = require('app/quanlykho/DanhMucKho/SelectView'),
		ManageFileVIew = require("app/view/AttachFile/ManageFileUploadView"),
		danhsach_donvitinh = require('json!app/constant/donvitinh.json')
    return Gonrin.CollectionView.extend({
    	template : template,
    	modelSchema	: {},
    	urlPrefix: "/api/v1/",
		collectionName: "phieukiemke_chitiet",
		refresh: true,
    	uiControl:{
	    	fields: [
				{ field: "ten_sanpham", label: "Tên dược liệu"},
				{ field: "donvitinh", label: "ĐVT", width:95 , cssClass:"text-center",
					template: function (rowData) {
						if (rowData.donvitinh !== null && rowData.donvitinh !== undefined) {
							for(var i = 0; i< danhsach_donvitinh.length; i++){
								var obj = danhsach_donvitinh[i];
								if (rowData.donvitinh === obj.value) {
									return obj.text;
								}
							}
						}
						return "Kg";
					}
				},
				{ field: "so_luong_ton", label: "Số lượng tồn", width:109 , cssClass:"text-center",
					template: function (rowData) {
						if (rowData.so_luong_ton !== null) {
							return `<span class="text-center">` + rowData.so_luong_ton + `</span>`;
						}
						return '0';
					}
				},
				{ field: "soluong_thucte", label: "Số lượng thực tế", width:132 , cssClass:"text-center",
					template: function (rowData) {
						var soluong_thucte = rowData.soluong_thucte;
						if (soluong_thucte == null || soluong_thucte == undefined) {
							soluong_thucte = "0"
						}
						return `<input type="number" class="soluong_thucte w-100 text-center form-control px-05" data-id-rowdata="` + rowData.id + `" data-id-row="` + rowData._$row_id + `" data-id-vattu="` + rowData.id_sanpham + `"  data-soluongthucte="` + gonrinApp().convert_string_to_number(rowData.so_luong_ton) + `" value="` + soluong_thucte + `">`;
					}
				},
				{ field: "soluong_thucte", label: "Thừa", width:10 , cssClass:"text-center",
					template: function (rowData) {
						if (rowData.so_luong_ton !== null && rowData.soluong_thucte && rowData.soluong_thucte > rowData.so_luong_ton) {
							return `<span class="soluong_thua">` + gonrinApp().convert_string_to_number(rowData.soluong_thucte - rowData.so_luong_ton) + ` </span>`;
						}
						return "0";
					}
				},
				{ field: "soluong_thucte", label: "Thiếu", width:10, cssClass:"text-center",
					template: function (rowData) {
						if (rowData.so_luong_ton !== null && rowData.soluong_thucte && rowData.soluong_thucte < rowData.so_luong_ton) {
							return `<span class="soluong_thieu">` + gonrinApp().convert_string_to_number(rowData.so_luong_ton - rowData.soluong_thucte) + ` </span>`;
						}
						return "0";
					}
				},
				{ field: "so_luong_huhong", label: "Số lượng hư hỏng", width:152, cssClass:"text-center",
					template: function (rowData) {
						var so_luong_huhong = rowData.so_luong_huhong;
						if (so_luong_huhong == null || so_luong_huhong == undefined) {
							so_luong_huhong = "0";
						}
						return `<input type="number" class="so_luong_huhong text-on-change w-100 text-center  form-control px-05" data-id-vattu="` + rowData.id_sanpham + `" data-id-rowdata="` + rowData.id + `" data-id-row="` + rowData._$row_id + `" value="` + so_luong_huhong + `">`;
					}
				},
				{ field: "ghichu", label: "Ghi chú",
					template: function (rowData) {
						var ghichu = rowData.ghichu;
						if (ghichu == null || ghichu == undefined) {
							ghichu = "";
						}
						return `<input type="text" class="ghichu text-on-change w-100 form-control px-05" data-id-vattu="` + rowData.id_sanpham + `" data-id-rowdata="` + rowData.id + `" data-id-row="` + rowData._$row_id + `" value="` + ghichu + `">`;
					}
				},
			],
			language:{
				no_records_found:"Chưa có dữ liệu"
			},
			noResultsClass:"alert alert-default no-records-found",
			// datatableClass:"table table-mobile",
			datatableClass:"table table-bordered",
			onRendered: function (e) {
				var self = this;
				self.$el.find('.table-phieukemke tbody input').parent().addClass('pt-5px');
				self.$el.find('.soluong_thucte').on("change", function () {
					var id_row = $(this).attr("data-id-row");
					var so_luong_ton = gonrinApp().convert_string_to_number($(this).attr("data-soluongthucte")),
						so_luong_thucte = $(this).val(),
						id_rowdata = $(this).attr("data-id-rowdata"),
						id_sanpham = $(this).attr("data-id-vattu");
					var $elt_tr = self.$el.find('[data-uuid=' + id_row + ']');
					$elt_tr.find(".soluong_thua").text();
					self.luuPhieuKiemKeChiTiet(id_rowdata, id_sanpham, $elt_tr);

				});
				self.$el.find('.text-on-change').on("change", function () {
					var id_row = $(this).attr("data-id-row"),
						id_rowdata = $(this).attr("data-id-rowdata"),
						id_sanpham = $(this).attr("data-id-vattu");
					var $elt_tr = self.$el.find('[data-uuid=' + id_row + ']');
					self.luuPhieuKiemKeChiTiet(id_rowdata,id_sanpham, $elt_tr);
				});
			}
		},
		tools: [
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
					self.luuPhieuKiemKe();
				}
			},
		],
		sanpham_id: "",
		thoigian_taophieu: null,
		data_phieukiemke: null,
		array_chungtu : [],
		render:function() {
			var self = this;
			self.sanpham_id = "";
			self.thoigian_taophieu = null;
			self.data_phieukiemke = null;
			self.array_chungtu = [];
			self.$el.find("#kho").ref({
				textField: "ten_kho",
				valueField: "id",
				dataSource: KhoSelectView,
			});
			self.$el.find('#thoigian_capnhat_phieu').datetimepicker({
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
			});
			var id = self.getApp().getRouter().getParam("id");
			id = (id == null || id == undefined)? "": id;
    		self.uiControl.orderBy = [{"field": "created_at", "direction": "desc"}];
			var filter1 = { "$and": [
					{"phieukiemke_id": {"$eq": id}}
				]};
			self.uiControl.filters = filter1;
			self.applyBindings();
			
			if (!!id) {
				$.ajax({
					url: (self.getApp().serviceURL || "") + '/api/v1/phieukiemkekho/' + id,
					dataType: "json",
					contentType: "application/json",
					method: 'GET',
					success: function(response) {
						self.data_phieukiemke = response;
						if (response.thoigian_taophieu !== null && response.thoigian_taophieu !== undefined) {
							self.$el.find(".thoigian_kiemke").text(gonrinApp().parseInputDateString(response.thoigian_taophieu).format("DD/MM/YYYY HH:mm:ss"));
						}
						self.$el.find('#thoigian_capnhat_phieu').data("gonrin").setValue(response.thoigian_kiemke);
						self.event_selectize();
						self.$el.find(".so_phieu_chungtu").val(response.so_phieu_chungtu);
						var chungtu_dinhkem = response.chungtu_dinhkem;
						if (!chungtu_dinhkem || chungtu_dinhkem == null || chungtu_dinhkem == undefined) {
							chungtu_dinhkem = [];
						}
						self.array_chungtu = chungtu_dinhkem;
						var fileView = new ManageFileVIew({viewData:{"listFile": [], "$el_btn_upload": self.$el.find(".btn-add-file")}, el:self.$el.find(".table-file-dinhkem")});
						fileView.render();
						fileView.on("change", (event) => {
							var listfile = event.data;
							self.array_chungtu = listfile;
						});
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
			} else {
				self.thoigian_taophieu = moment();
				self.thoigian_taophieu = self.parse_date_custom(self.thoigian_taophieu);
				console.log(self.thoigian_taophieu);
				self.$el.find(".thoigian_kiemke").text(gonrinApp().parseInputDateString(self.thoigian_taophieu).format("DD/MM/YYYY HH:mm:ss"));
				self.event_selectize();
				var fileView = new ManageFileVIew({viewData:{"listFile": [], "$el_btn_upload": self.$el.find(".btn-add-file")}, el:self.$el.find(".table-file-dinhkem")});
				fileView.render();
				fileView.on("change", (event) => {
					var listfile = event.data;
					self.array_chungtu = listfile;
				});
					self.$el.find('#thoigian_capnhat_phieu').data('gonrin').setValue(self.thoigian_taophieu);
			}
			self.$el.find('#kho').on('change.gonrin', function () {
				self.event_selectize("reload");
			});
			self.$el.find('.btn-add-vattu').unbind("click").bind("click", function (e) {
				e.stopPropagation();
				e.preventDefault();
				if (self.data_phieukiemke == null || self. data_phieukiemke == undefined) {
					self.luuPhieuKiemKe();
				} else if (self.sanpham_id == "" || self.sanpham_id == null || self.sanpham_id == undefined) {
					self.getApp().notify({message: "Vui lòng chọn vật tư."}, {type: "danger", delay: 5000});
				} else {
					self.themPhieuKiemKeChitiet(self.sanpham_id);
				}
			});
			self.$el.find(".btn-xoaboloc").unbind("click").bind("click", function (e) {
				e.stopPropagation();
				e.preventDefault();
				self.$el.find('#kho').data("gonrin").setValue(null);
				var $selectz = (self.$el.find('#selectize-programmatic'))[0]
                $selectz.selectize.setValue([]);
			});
			self.applyBindings();
		   return this;
		},
		event_selectize: function (mode = "") {
			var self = this;
			if (mode == "reload") {
				$("#selectize-programmatic").each(function() {
					if ($(this)[0].selectize) {
						$(this)[0].selectize.destroy();
					}
				});
			}
			var $selectize = self.$el.find('#selectize-programmatic').selectize({
                valueField: 'id',
                labelField: 'ten_sanpham',
                searchField: ['ten_sanpham', 'ten_khoa_hoc', "ma_kho", "donvi_id", "tenkhongdau"],
                preload: true,
                load: function(query, callback) {
					var kho_id = self.$el.find("#kho").data('gonrin').getValue();
					var query_filter = {"filters": {"$and": [{"ten_sanpham":{"$likeI": query}}]}};
					if (kho_id !== null && kho_id !== undefined) {
						query_filter = {"filters": {"$and": [{"ten_sanpham":{"$likeI": query}}, {"ma_kho":{"$eq": kho_id}}]}};
					}
					var url = (self.getApp().serviceURL || "") + '/api/v1/kho_sanpham_hanghoa?' + (query_filter? "&q=" + JSON.stringify(query_filter): "");
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
				render: {
                    item: function (item, escape) {
                        return '<div class="item">'
                            + (item.ten_sanpham ? '<span class="name">' + escape(item.ten_sanpham) + '</span>' : '')
                            + (item.so_lo ? ' <span class="email text-right"> - Số Lô:' + escape(item.so_lo) + '</span>' : '')
                            + '</div>';
                    },
                    option: function (item, escape) {
                        return '<div class=" px-2 border-bottom">'
                            + '<h5 class="py-0">' + escape(item.ten_sanpham) + '</h5>'
                            + (item.so_lo ? '<small class="caption float-left" style="display:block"> Số lô: ' + escape(item.so_lo) + '</small>' : '')
                            + '</div>';
                    }
                },
                onChange: function(value, isOnInitialize) {
					self.sanpham_id = value;
                }
			});
			
		},
		luuPhieuKiemKe: function () {
			var self = this;
			var currentUser = self.getApp().currentUser;
			var params = self.data_phieukiemke,
				method = "PUT",
				url = (self.getApp().serviceURL || "") + '/api/v1/phieukiemkekho';
			var so_phieu_chungtu = self.$el.find('.so_phieu_chungtu').val();
			if (so_phieu_chungtu == null || so_phieu_chungtu == undefined || so_phieu_chungtu == "") {
				self.getApp().notify({ message: "Vui lòng nhập số phiếu chứng từ" }, { type: "danger", delay: 1000 });
				return;
			}
			if (self.data_phieukiemke == null || self.data_phieukiemke == undefined) {
				params = JSON.stringify({
					"id": null,
					"so_phieu_chungtu": self.$el.find('.so_phieu_chungtu').val(),
					"thoigian_taophieu": self.thoigian_taophieu,
					"chungtu_dinhkem": self.array_chungtu,
					"ma_nguoi_lap_phieu": currentUser.id,
					"ten_nguoi_lap_phieu": currentUser.fullname,
					"donvi_id": currentUser.donvi_id,
					"thoigian_kiemke":self.$el.find('#thoigian_capnhat_phieu').data("gonrin").getValue(),
					"active": 1
				});
				method = "POST"
			} else if (self.data_phieukiemke.id !== null && self.data_phieukiemke.id !== undefined) {
				url = (self.getApp().serviceURL || "") + '/api/v1/phieukiemkekho/' + self.data_phieukiemke.id;
				self.data_phieukiemke.so_phieu_chungtu = self.$el.find('.so_phieu_chungtu').val();
				self.data_phieukiemke.chungtu_dinhkem = self.array_chungtu;
				self.data_phieukiemke.thoigian_kiemke = self.$el.find('#thoigian_capnhat_phieu').data("gonrin").getValue();
				params = JSON.stringify(self.data_phieukiemke);
			}
			$.ajax({
				url: url,
				dataType: "json",
				contentType: "application/json",
				method: method,
				data: params,
				success: function(response) {
					if (method == "POST") {
						self.data_phieukiemke = response;
						self.$el.find('.btn-add-vattu').trigger("click");
					} else if (method == "PUT") {
						self.getApp().getRouter().navigate("phieukiemkekho/collection");
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
		},
		themPhieuKiemKeChitiet: function (sanpham_id) {
			var self = this;
			var currentUser = self.getApp().currentUser;
			var $selectz = (self.$el.find('#selectize-programmatic'))[0]
            var data_sanpham = $selectz.selectize.options[sanpham_id],
				url = (self.getApp().serviceURL || "") + '/api/v1/phieukiemke_chitiet';
			var params = JSON.stringify({
				"id": null,
				"phieukiemke_id": self.data_phieukiemke.id,
				"id_sanpham": data_sanpham.id,
				"ma_sanpham": data_sanpham.ma_sanpham,
				"loai_sanpham": data_sanpham.loai_sanpham,
				"ten_sanpham": data_sanpham.ten_sanpham,
				"sanpham": data_sanpham,
				"so_lo": data_sanpham.so_lo,
				"so_luong_huhong": 0,
				"so_luong_ton": data_sanpham.soluong,
				"soluong_thucte": 0,
				"ghichu": "",
				"thoigian_taophieu": self.thoigian_taophieu,
				"donvi_id": currentUser.donvi_id,
				"donvitinh": data_sanpham.donvitinh,
			});
			$.ajax({
				url: url,
				dataType: "json",
				contentType: "application/json",
				method: "POST",
				data: params,
				success: function(response) {
					var $col = self.getCollectionElement();
					var query = { "$and": [
						{"phieukiemke_id": {"$eq": self.data_phieukiemke.id}}
					]};
					$col.data('gonrin').filter(query);
					self.applyBindings();
				},
				error:function(xhr,status,error){
					self.getApp().hideloading();
					try {
						if (xhr.responseJSON.error_code == "SESSION_EXPIRED") {
							self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
							self.getApp().getRouter().navigate("login");
						} else {
							self.getApp().notify({ message: xhr.responseJSON.error_message }, { type: "danger", delay: 1000 });
						}
					}
					catch (err) {
						self.getApp().notify({ message: "Lưu thông tin không thành công"}, { type: "danger", delay: 1000 });
					}
				},
			});
		},
		luuPhieuKiemKeChiTiet: function (id_rowdata, id_sanpham, $elt_tr) {
			var self = this;
			var soluong_thucte = $elt_tr.find('.soluong_thucte').val(),
				so_luong_huhong = $elt_tr.find('.so_luong_huhong').val(),
				ghichu = $elt_tr.find('.ghichu').val();
			var phieu_id = null;
			if (!!self.data_phieukiemke && !!self.data_phieukiemke.id) {
				phieu_id = self.data_phieukiemke.id;
			}
			var params = JSON.stringify({
				"id": id_rowdata,
				"phieu_id": phieu_id,
				"id_sanpham": id_sanpham,
				"soluong_thucte": gonrinApp().convert_string_to_number(soluong_thucte),
				"so_luong_huhong": gonrinApp().convert_string_to_number(so_luong_huhong),
				"ghichu": ghichu
			});
			$.ajax({
				url: (self.getApp().serviceURL || "") + '/api/v1/luu_phieukiemke_chitiet',
				dataType: "json",
				contentType: "application/json",
				method: "POST",
				data: params,
				success: function(response) {
					var $col = self.getCollectionElement();
					var id = self.getApp().getRouter().getParam("id");
					var query = { "$and": [
						{"phieukiemke_id": {"$eq": self.data_phieukiemke.id}}
					]};
					$col.data('gonrin').filter(query);
					self.applyBindings();
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