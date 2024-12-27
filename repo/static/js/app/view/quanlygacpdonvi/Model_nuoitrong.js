define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
	var template 				= require('text!app/view/quanlygacpdonvi/tpl/model_nuoiitrong.html'),
	schema 				= require('json!schema/ChungNhanGACPSchema.json');
	var ManageFileVIew = require("app/view/AttachFile/ManageFileUploadView");

    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
		collectionName: "chungnhangacp",
		setDuocLieu: false,
		firstLoad : false,
		setObject : false,
		checkId: false,
		checkCreateButton: false,
    	tools : [
			{
				name: "back",
				type: "button",
				buttonClass: "btn-secondary ml-1",
				label: `<i class="fas fa-arrow-circle-left"></i> Quay lại`,
				command: function(){
					var self = this;
					Backbone.history.history.back();
				}
			},
			{
				name: "save",
				type: "button",
				buttonClass: "btn-success width-sm btn-save ml-2 d-none",
				label: `<i class="far fa-save"></i> Lưu`,
				visible: function(){
					return (this.getApp().hasRole("admin_donvi") || this.getApp().hasRole("canbo"));
				},
				command: function(){
					var self = this;
					let check = self.validateData();
					if (!check){
						return false;
					}
					self.setNullModel();
					self.register();
					self.model.set("loai_nuoitrong_khaithac",1);
					self.getApp().showloading();
					self.model.save(null,{
						success: function (model, respose, options) {
							self.getApp().notify("Lưu thông tin thành công");
							if (self.checkId === false && self.checkCreateButton === false){
								self.model.set(respose);
								self.checkCreateButton = true;
								// self.$el.find(".toolbar").append(`<button type="button" btn-name="xacnhan" class="btn btn-info width-sm btn-xacnhan ml-2">Gửi duyệt</button>`);
								self.$el.find(".toolbar").append(`<button type="button" btn-name="print" class="btn btn-primary width-sm btn-print ml-2"><i class="fas fa-print"></i> In phiếu</button>`);
								// self.$el.find(".btn-xacnhan").unbind("click").bind("click", ()=>{
								// 	self.xacNhan();
								// });
								self.$el.find(".btn-print").unbind("click").bind("click", ()=>{
									self.inPhieu();
								});
								self.$el.find(".btn-delete").removeClass("d-none");
							}
							else{
								self.model.set(respose);
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
						},
						complete: function(){
							self.getApp().hideloading();
						}
					});
				}
			},
			{
				name: "delete",
				type: "button",
				buttonClass: "btn-danger btn-delete width-sm ml-2 d-none",
				label: `<i class="fas fa-trash-alt"></i> Xóa`,
				visible: function(){
					return (this.getApp().getRouter().getParam("id") !== null && (this.getApp().hasRole("admin_donvi") || this.getApp().hasRole("canbo")));
				},
				command: function(){
					var self = this;
					var delete_success = null;
					self.$el.find("#exampleModalCenter").modal("show");
					self.$el.find(".btn-deleted-continue").unbind("click").bind("click", function () {
						delete_success = true;
					});

					self.$el.find("#exampleModalCenter").on("hidden.bs.modal", function (e) {
						if (delete_success == true) {
							self.getApp().showloading();
							self.model.destroy({
								success: function(model, response) {
									self.getApp().hideloading();
									self.getApp().notify('Xoá dữ liệu thành công');
									let path = 'quanlygacp_nuoitrong/collection';
									self.getApp().getRouter().navigate(path);
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
					});


				}
			},
			// {
			// 	name: "xacnhan",
			// 	type: "button",
			// 	buttonClass: "btn-info btn-xacnhan width-sm ml-2 d-none",
			// 	label: "Gửi duyệt",
			// 	visible: function(){
			// 		return (this.getApp().getRouter().getParam("id") !== null && (this.getApp().hasRole("admin_donvi") || this.getApp().hasRole("canbo")));
			// 	},
			// 	command: function(){
			// 		var self = this;
			// 		self.xacNhan();
			// 	}
			// },
			{
				name: "print",
				type: "button",
				buttonClass: "btn-primary btn-print ml-2",
				label: `<i class="fas fa-print"></i> In phiếu`,
				visible: function(){
					return (this.getApp().getRouter().getParam("id") !== null && (this.getApp().hasRole("admin_donvi") || this.getApp().hasRole("canbo")));
				},
				command: function(){
					var self = this;
					self.inPhieu();
				}
			},
		],
		uiControl: {
			fields: [
				{
                    field:"thoigian_batdau_hieuluc",
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
                    field:"thoigian_ketthuc_hieuluc",
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
                    field:"mucdo_tuanthu_gacp",
                    uicontrol:"combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass:"form-control",
                        dataSource: [
                        { value: 1, text: "Mức độ 1" },
                        { value: 2, text: "Mức độ 2" },
                        { value: 3, text: "Mức độ 3" },
                        ]
                },
				{
                    field:"donvi_dientich",
                    uicontrol:"combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass:"form-control",
                        dataSource: [
                        { value: 1, text: "㎡" },
                        { value: 2, text: "hecta (ha)" },
                        { value: 3, text: "㎢" },
                        ]
                },
			]
		},
    	render:function() {
			var self = this;
			self.setDuocLieu = false;
			self.firstLoad = false;
			self.setObject = false;
			self.checkId = false;
			self.checkCreateButton = false;
            let id = self.getApp().getRouter().getParam("id");
            if (!!id){
    			this.model.set('id',id);
        		this.model.fetch({
        			success: function(data){
						self.applyBindings();
						self.checkId = true;
						let obj = self.model.toJSON();
						self.loadData(obj);
						self.setHeightTextarea();
                        self.registerElementTd();
						// self.view();
						self.selectizeDuoclieu();
						self.checkTrangThai();
						self.register_event();
        			},
        			error:function(){
    					self.getApp().notify("Get data Eror");
                    },
                    complete : function(){
                    }
        		});
            }
            else{
                self.applyBindings();
				self.setHeightTextarea();
				self.selectizeDuoclieu();
				self.register_event();
				self.checkTrangThai();
				self.model.set("donvi_dientich", 1);
            }
		},
		register : function(){
			var self = this;
			let element = self.$el.find("input[type='radio']:checked");
			let length = element.length;
			for (let i=0; i<length; i++){
				let elt = element[i];
				let item =  $(elt).attr("name");
				let val = $(elt).val();
				if (val === "1" || val === "0"){
					self.model.set(item, Number(val));
				}
			}
		},
		loadData : function(object){
			var self = this;
			if (!!object && typeof(object) === "object"){
				let listKey = Object.keys(object);
				let length = listKey.length;
				for (let i=0; i<length; i++){
					let key = listKey[i];
					let val = self.model.get(key);
					if (val===0 || val === 1){
						val = Number(val).toString();
					}
					self.$el.find(`input[name="${key}"][value="${val}"]`).prop("checked", true);
				}
			}
		},
		setHeightTextarea: function(){
			var self = this;
			let element = self.$el.find("td textarea");
			let length = element.length;
			for (let i=0; i<length; i++){
				let elt = element[i];
				let height = $(elt).parent().height();
				elt.style.height = height + "px";
			}
		},
		registerElementTd: function(){
			var self = this;
			let element = self.$el.find("input[type='radio']");
			let length = element.length;
			for (let i=0; i<length; i++){
				let elt = element[i];
				$(elt).unbind("click").bind("click", (event)=>{
					event.stopPropagation();
				})
				let elt_td = $(elt).parent();
				$(elt_td).unbind("click").bind("click", {data : elt}, (event)=>{
					event.stopPropagation();
					if (!!event.data.data){
						let tmp = event.data.data;
						let check = $(tmp).prop("checked");
						$(tmp).prop("checked", !check);
					}
				})
			}
		},
		setNullModel : function(){
			var self = this;
			let element = self.$el.find("input[type='radio'][value='1']");
			let length = element.length;
			for (let i=0; i<length; i++){
				let elt = element[i];
				let elt_name = $(elt).attr("name");
				self.model.set(elt_name, null);
			}
		},
		xacNhan : function(){
			var self = this;
			let params = {
				id : self.model.get("id")
			}
			self.getApp().showloading();
			$.ajax({
				url: (self.getApp().serviceURL || "") + '/api/v1/xacnhan_gacp',
				dataType: "json",
				contentType: "application/json",
				method: 'POST',
				data: JSON.stringify(params),
				success: function(response) {
					self.getApp().hideloading();
					self.getApp().notify({message : "Gửi yêu cầu duyệt thành công"});
					self.getApp().getRouter().refresh();
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
						self.getApp().notify({ message: "Có lỗi xảy ra vui lòng thử lại sau"}, { type: "danger", delay: 1000 });
					}
				},
			});
        },
		checkTrangThai : function(){
			var self = this;
			let trangthai = self.model.get("trangthai");
			if (trangthai === 2 || trangthai === 3){
				self.$el.find("input").prop("disabled", true);
				self.$el.find("textarea,td").attr("style", "pointer-events:none");
				self.$el.find(".btn-delete,.btn-save,.btn-xacnhan").remove();
				let $selectz = (self.$el.find('#sanpham'))[0];
				if (!!$selectz && !!  $selectz.selectize){
					$selectz.selectize.disable();
				}
			}
			else{
				self.$el.find(".btn-delete,.btn-save,.btn-xacnhan").removeClass("d-none");
			}
		},
        view : function(){
            var self = this;
			self.$el.find(".btn-delete").remove();
        },
		selectizeDuoclieu : function(){
			var self = this;
            var $selectize = self.$el.find('#sanpham').selectize({
                valueField: 'id_sanpham',
                labelField: 'ten_sanpham',
                searchField: ['ten_sanpham', 'ten_khoa_hoc','tenkhongdau'],
				preload: true,
				render: {
					option: function (item, escape) {
						return `<div class="option">${item.ten_sanpham} - ${item.ten_khoa_hoc} - ${item.ma_viettat}</div>`;
					}
				},
                load: function(query, callback) {
                    var query_filter = {"filters": {"$or": [
                        { "ten_sanpham": { "$likeI": (query) } },
                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                        { "ten_khoa_hoc": { "$likeI": (query) } }
                        ]}
					};
					let sanpham = self.model.get("sanpham");
					if (!!sanpham && self.setObject === false){
						callback([sanpham]);
						self.setObject = true;
					}
                    var url = (self.getApp().serviceURL || "") + '/api/v1/sanpham_donvi_filter?results_per_page=20' + (query_filter? "&q=" + JSON.stringify(query_filter): "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            callback(res.objects);
                            var id_sanpham = self.model.get("id_sanpham");
                            if (self.setDuocLieu === false && !!id_sanpham) {
                                var $selectz = (self.$el.find('#sanpham'))[0];
								$selectz.selectize.setValue([id_sanpham]);
								self.setDuocLieu = true;
                            }
                        }
                    });  

                },
                onChange: function(value, isOnInitialize) {
                    var $selectz = (self.$el.find('#sanpham'))[0];
                    var obj = $selectz.selectize.options[value];
                    if (obj !== null && obj !== undefined) {
                        var id = self.model.get("id");
                        if (self.firstLoad === true || !id) {
                            // logic: nếu phiếu đó chưa có id - phiếu tạo mới thì set data vật tư
                            // k tính sự kiện onchange khi set data vật tư lần đầu
                            self.model.set({
								"ten_sanpham": obj.ten_sanpham,
								"ten_khoa_hoc": obj.ten_khoa_hoc,
                                "ma_sanpham": obj.ma_sanpham,
								"id_sanpham":obj.id_sanpham,
								"tenkhongdau": obj.tenkhongdau,
								"bophan_sudung": obj.bophan_sudung
                            });
                        } else {
                            // sự kiện khi update phiếu, set data vật tư lần đầu
                            self.firstLoad = true;
						}
					}
					else{
						self.model.set({
							"ten_sanpham": null,
							"ten_khoa_hoc": null,
							"ma_sanpham": null,
							"id_sanpham":null,
							"tenkhongdau": null,
							"bophan_sudung": null
						});
					}
                }
            });
		},
		register_event: function(){
			var self = this;
			var fileView = new ManageFileVIew({ viewData: { "listFile": self.model.get('dinhkem_chungnhan'), "$el_btn_upload": self.$el.find(".btn-add-file") }, el: self.$el.find(".list-attachment") });
			fileView.render();
			fileView.on("change", (event) => {
				var listfile = event.data;
				self.model.set('dinhkem_chungnhan', listfile);
			});
		},
		validateData: function(){
			var self = this;
			let so_giay_chungnhan = self.model.get("so_giay_chungnhan");
			if (!so_giay_chungnhan){
				self.getApp().notify({message: "Vui lòng nhập số giấy chứng nhận GACP"}, {type: "danger", delay : 1000});
				return false;
			}
			let id_sanpham = self.model.get("id_sanpham");
			if (!id_sanpham){
				self.getApp().notify({message:"Vui lòng chọn dược liệu"}, {type : "danger", delay : 1000});
				return false;
			}
			let ten_sanpham = self.model.get("ten_sanpham");
			if (!ten_sanpham){
				self.getApp().notify({message: "Vui lòng chọn dược liệu"}, {type: "danger", delay : 1000});
				return false;
			}
			let dientich = self.model.get("dientich");
			if (dientich === undefined || dientich === null){
				self.getApp().notify({message: "Vui lòng nhập diện tích trồng"}, {type: "danger", delay : 1000});
				return false;
			}
			let diadiem = self.model.get("diadiem");
			if (!diadiem){
				self.getApp().notify({message: "Vui lòng nhập địa điểm trồng"}, {type : "danger", delay : 1000});
				return false;
			}
			let ten_coso = self.model.get("ten_coso");
			if (!ten_coso){
				self.getApp().notify({message: "Vui lòng nhập tên cơ sở"}, {type: "danger", delay: 1000});
				return false;
			}
			let diachi_coso = self.model.get("diachi_coso");
			if (!diachi_coso){
				self.getApp().notify({message: "Vui lòng nhập địa chỉ cơ sở"}, {type: "danger", delay : 1000});
				return false;
			}
			let thoigian_batdau_hieuluc = self.model.get("thoigian_batdau_hieuluc");
			if (!thoigian_batdau_hieuluc){
				self.getApp().notify({message: "Vui lòng nhập thời gian giấy chứng nhận bắt đầu có hiệu lực"}, {type : "danger", delay : 1000});
				return false;
			}

			let thoigian_ketthuc_hieuluc = self.model.get("thoigian_ketthuc_hieuluc");
			if (!thoigian_ketthuc_hieuluc){
				self.getApp().notify({message: "Vui lòng nhập thời gian giấy chứng nhận kết thúc hiệu lực"}, {type :"dnager", delay: 1000});
				return false;
			}
			return true;
		},
		inPhieu: function(){
			var self = this;
			var params = JSON.stringify({
				"id": self.model.get("id"),
				"loai_nuoitrong_khaithac" : self.model.get("loai_nuoitrong_khaithac")
			});
			self.getApp().showloading();
			$.ajax({
				url: (self.getApp().serviceURL || "") + '/api/v1/export_pdf_gacp',
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
	});
});