define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
	var template 				= require('text!app/view/donvidangky/tpl/model.html'),
	schema 				= require('json!schema/DonViDangKySchema.json');
	var ManageFileVIew = require("app/view/AttachFile/ManageFileUploadView");

    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
		collectionName: "donvidangky",
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
				buttonClass: "btn-success btn-sm btn-save ml-1 d-none",
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
					self.model.set("loai_nuoitrong_khaithac",2);
					self.getApp().showloading();
					self.model.save(null,{
						success: function (model, respose, options) {
							self.getApp().notify("Lưu thông tin thành công");
			
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
				buttonClass: "btn-danger btn-delete btn-sm ml-1 d-none",
				label: `<i class="fas fa-trash-alt"></i> Xóa`,
				visible: function(){
					return (this.getApp().getRouter().getParam("id") !== null && (this.getApp().hasRole("admin_donvi") || this.getApp().hasRole("canbo")));
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
				name: "xacnhan",
				type: "button",
				buttonClass: "btn-primary btn-xacnhan btn-sm ml-1 d-none",
				label: `<i class="far fa-check-circle"></i> Duyệt đăng ký`,
				visible: function(){
					return (this.getApp().getRouter().getParam("id") !== null && (this.getApp().hasRole("admin_donvi") || this.getApp().hasRole("canbo")));
				},
				command: function(){
					var self = this;
					self.xacNhan();
				}
            },
			{
				name: "huy",
				type: "button",
				buttonClass: "btn-danger btn-huy btn-sm ml-1 d-none",
				label: "Hủy đăng ký",
				visible: function(){
					return (this.getApp().getRouter().getParam("id") !== null && (this.getApp().hasRole("admin_donvi") || this.getApp().hasRole("canbo")));
				},
				command: function(){
					var self = this;
					self.huy();
				}
            },
		],
		uiControl: {
			fields: [
                {
					field: "ngaycapphep",
					uicontrol: "datetimepicker",
					format: "DD/MM/YYYY",
					textFormat: "DD/MM/YYYY",
					extraFormats: ["DDMMYYYY"],
					parseInputDate: function (val) {
						return gonrinApp().parseInputDateString(val);
					},
					parseOutputDate: function (date) {
						return gonrinApp().parseOutputDateString(date);
					},
					disabledComponentButton: true
                },
                {
					field:"loai_donvi",
					uicontrol:"combobox",
					textField: "text",
					valueField: "value",
					cssClass:"form-control",
					dataSource: [
						{ value: 2, text: "Đơn vị nhập khẩu/phân phối/cung ứng" },
						{ value: 3, text: "Đơn vị vận chuyển" },
						{ value: 4, text: "Đơn vị sử dụng (Bệnh viện)" },
						{ value: 5, text: "Đơn vị nuôi trồng" },
						{ value: 6, text: "Đơn vị khai thác tự nhiên" },
						{ value: 7, text: "Đơn vị là cá nhân nuôi trồng" },
						{ value: 8, text: "Cá nhân khai thác tự nhiên" },
						{ value: 9, text: "Đơn vị nuôi trồng và khai thác tự nhiên" },
						]
                },
			]
		},
    	render:function() {
			var self = this;
            let id = self.getApp().getRouter().getParam("id");
            if (!!id){
    			this.model.set('id',id);
        		this.model.fetch({
        			success: function(data){
                        self.applyBindings();
                        self.selectizeTinhThanh();
                        self.selectizeQuanHuyen();
                        self.selectizeXaPhuong();
                        self.controlSelectize();
                        self.checkTrangThai();
                        var fileView = new ManageFileVIew({ viewData: { "listFile": self.model.get('dinhkem_giayphep_dkkd'), "$el_btn_upload": self.$el.find(".btn-add-file") , register : true}, el: self.$el.find(".list-attachment")});
                        fileView.render();
                        fileView.on("change", (event) => {
                            var listfile = event.data;
                            self.model.set('dinhkem_giayphep_dkkd', listfile);
                        });
        			},
        			error:function(){
    					self.getApp().notify("Get data Eror");
                    },
                    complete : function(){
                    }
        		});
            }
            else{
                var fileView = new ManageFileVIew({ viewData: { "listFile": self.model.get('dinhkem_giayphep_dkkd'), "$el_btn_upload": self.$el.find(".btn-add-file") , register : true}, el: self.$el.find(".list-attachment")});
                fileView.render();
                fileView.on("change", (event) => {
                    var listfile = event.data;
                    self.model.set('dinhkem_giayphep_dkkd', listfile);
                });
                self.selectizeTinhThanh();
                self.selectizeQuanHuyen();
                self.selectizeXaPhuong();
                self.controlSelectize();
                self.applyBindings();
            }
		},
		xacNhan : function(){
			var self = this;
			let params = {
				id : self.model.get("id")
			}
			self.getApp().showloading();
			$.ajax({
				url: (self.getApp().serviceURL || "") + '/api/v1/duyet_dangky',
				dataType: "json",
				contentType: "application/json",
				method: 'POST',
				data: JSON.stringify(params),
				success: function(response) {
					self.getApp().hideloading();
					self.getApp().notify({message : "Duyệt đơn vị thành công"});
					self.getApp().getRouter().refresh();
				},
				error:function(xhr,status,error){
					self.getApp().hideloading();
					try {
						if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED"){
							self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
							self.getApp().getRouter().navigate("login");
						} else {
						self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 1000 });
						}
					}
					catch (err) {
						self.getApp().notify({ message: "Có lỗi xảy ra vui lòng thử lại sau"}, { type: "danger", delay: 1000 });
					}
				},
			});
        },
        huy : function(){
			var self = this;
			let params = {
				id : self.model.get("id")
			}
			self.getApp().showloading();
			$.ajax({
				url: (self.getApp().serviceURL || "") + '/api/v1/huy_dangky',
				dataType: "json",
				contentType: "application/json",
				method: 'POST',
				data: JSON.stringify(params),
				success: function(response) {
					self.getApp().hideloading();
					self.getApp().notify({message : "Hủy yêu cầu đăng ký thành công"});
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
        controlSelectize: function () {
            var self = this;

            if (!!self.model.get('tinhthanh_id')) {
                self.$el.find("#quanhuyen")[0].selectize.enable();
            } else {
                self.$el.find("#quanhuyen")[0].selectize.disable();

            }
            if (!!self.model.get('quanhuyen_id')) {
                self.$el.find("#xaphuong")[0].selectize.enable();
            } else {
                self.$el.find("#xaphuong")[0].selectize.disable();

            }
        },
        loadTinhThanh: function (query = '', callback) {
            var self = this;
            var arr_filters = [
                { 'deleted': { '$eq': false } },
                { 'active': { '$eq': 1 } }
            ];
            if (!!query) {
                arr_filters.push({ "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } });
            }
            var query_filter = {
                "filters": {
                    "$and": arr_filters
                },
                "order_by": [{ "field": "ten", "direction": "asc" }]
            };

            var url =
                (self.getApp().serviceURL || "") + "/api/v1/tinhthanh?results_per_page=100" + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
            $.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                success: function (response) {
                    callback(response.objects);
                    if (!!self.model.get('tinhthanh_id')) {
                        self.$el.find('#tinhthanh')[0].selectize.setValue(self.model.get('tinhthanh_id'));
                    }
                },
                error: function () {
                    callback();
                },
            });
        },
        loadQuanHuyen: function (query = '', callback) {
            var self = this;
            var arr_filters = [
                { 'deleted': { '$eq': false } },
                { 'active': { '$eq': 1 } }
            ];
            if (!!self.model.get('tinhthanh_id')) {
                arr_filters.push({ "tinhthanh_id": { "$eq": self.model.get("tinhthanh_id") } });
            }
            if (!!query) {
                arr_filters.push({ "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } });
            }

            var query_filter = {
                "filters": {
                    "$and": arr_filters
                },
                "order_by": [{ "field": "ten", "direction": "asc" }]
            };

            var url =
                (self.getApp().serviceURL || "") + "/api/v1/quanhuyen?results_per_page=30" + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
            $.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                success: function (response) {
                    callback(response.objects);
                    if (!!self.model.get('quanhuyen_id')) {
                        self.$el.find('#quanhuyen')[0].selectize.setValue(self.model.get('quanhuyen_id'))
                    }
                },
                error: function () {
                    callback();
                },
            });
        },
        loadXaPhuong: function (query = '', callback) {
            var self = this;
            var arr_filters = [
                { 'deleted': { '$eq': false } },
                { 'active': { '$eq': 1 } }
            ];

            if (!!self.model.get('quanhuyen_id')) {
                arr_filters.push({ "quanhuyen_id": { "$eq": self.model.get("quanhuyen_id") } });
            }
            if (!!query) {
                arr_filters.push({ "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } });
            }

            var query_filter = {
                "filters": {
                    "$and": arr_filters
                },
                "order_by": [{ "field": "ten", "direction": "asc" }]
            };
            var url =
                (self.getApp().serviceURL || "") + "/api/v1/xaphuong?results_per_page=30" + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
            $.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                success: function (response) {
                    callback(response.objects);
                    if (!!self.model.get('xaphuong_id')) {
                        self.$el.find('#xaphuong')[0].selectize.setValue(self.model.get('xaphuong_id'))
                    }
                },
                error: function () {
                    callback();
                },
            });
        },
        selectizeTinhThanh: function () {
            var self = this;
            var $select = self.$el.find("#tinhthanh").selectize({
                maxItems: 1,
                valueField: "id",
                labelField: "ten",
                searchField: ["ten", "tenkhongdau"],
                preload: true,
                placeholder: "Tìm kiếm tỉnh thành",
                load: function (query, callback) {
                    self.loadTinhThanh(query, callback);
                },

                onItemAdd: function (value, $item) {
                    var obj = $select[0].selectize.options[value];
                    // delete obj.$order;
                    var obj_tinhthanh = {
                        "id": obj.id,
                        "ten": obj.ten,
                        "quocgia_id": obj.quocgia_id
                    }
                    self.model.set({
                        "tinhthanh": obj_tinhthanh,
                        "tinhthanh_id": value
                    });
                    self.$el.find("#quanhuyen")[0].selectize.clear();
                    self.$el.find("#xaphuong")[0].selectize.clear();
                    self.$el.find("#quanhuyen")[0].selectize.clearOptions();
                    self.$el.find("#xaphuong")[0].selectize.clearOptions();
                    if (!!self.model.get('quanhuyen') && self.model.get('quanhuyen').tinhthanh_id != value) {
                        self.model.set({
                            "quanhuyen_id": null,
                            "quanhuyen": null,
                            "xaphuong_id": null,
                            "xaphuong": null
                        })

                    }
                    // console.log(self.model.get('quanhuyen'))
                    if ((!!self.model.get('quanhuyen') && self.model.get('quanhuyen').tinhthanh_id != value) || !self.model.get('quanhuyen') || !self.$el.find("#quanhuyen")[0].selectize.getValue()) {
                        self.$el.find("#quanhuyen")[0].selectize.load(function (callback) {
                            self.loadQuanHuyen('', callback);
                        });
                    }

                    self.controlSelectize();

                },
                onItemRemove: function () {
                    self.model.set({
                        "tinhthanh": null,
                        "tinhthanh_id": null,
                        "quanhuyen": null,
                        "quanhuyen_id": null,
                        "xaphuong": null,
                        "xaphuong_id": null
                    });
                    self.$el.find("#quanhuyen")[0].selectize.clear();
                    self.$el.find("#xaphuong")[0].selectize.clear();
                    self.controlSelectize();

                }
            });
        },
        selectizeQuanHuyen: function () {
            var self = this;
            var $select = self.$el.find("#quanhuyen").selectize({
                maxItems: 1,
                valueField: "id",
                labelField: "ten",
                searchField: ["ten", "tenkhongdau"],
                preload: true,
                placeholder: 'Tìm kiếm quận huyện',

                load: function (query, callback) {
                    // self.loadQuanHuyen(query, callback);
                },

                onItemAdd: function (value, $item) {
                    var obj = $select[0].selectize.options[value];
                    // delete obj.$order;
                    var obj_quanhuyen = {
                        "id": obj.id,
                        "ten": obj.ten,
                        "tinhthanh_id": obj.tinhthanh_id
                    }
                    self.model.set({
                        "quanhuyen": obj_quanhuyen,
                        "quanhuyen_id": value
                    });
                    self.$el.find("#xaphuong")[0].selectize.clearOptions();
                    self.$el.find("#xaphuong")[0].selectize.clear();
                    if (!!self.model.get('xaphuong') && self.model.get('xaphuong').quanhuyen_id != value) {
                        self.model.set({
                            "xaphuong_id": null,
                            "xaphuong": null
                        })
                    }
                    self.controlSelectize();
                    if ((!!self.model.get('xaphuong') && self.model.get('xaphuong').quanhuyen_id != value) || !self.model.get('xaphuong') || !self.$el.find("#xaphuong")[0].selectize.getValue()) {
                        self.$el.find("#xaphuong")[0].selectize.load(function (callback) {
                            self.loadXaPhuong('', callback);
                        });
                    }

                },
                onItemRemove: function () {
                    self.model.set({
                        "quanhuyen": null,
                        "quanhuyen_id": null,
                        "xaphuong": null,
                        "xaphuong_id": null
                    });
                    self.$el.find("#xaphuong")[0].selectize.clearOptions();
                    self.$el.find("#xaphuong")[0].selectize.clear();

                    self.controlSelectize();

                }
            });
        },
        selectizeXaPhuong: function () {
            var self = this;
            var $select = self.$el.find("#xaphuong").selectize({
                maxItems: 1,
                valueField: "id",
                labelField: "ten",
                searchField: ["ten", "tenkhongdau"],
                preload: true,
                placeholder: 'Tìm kiếm xã phường',

                load: function (query, callback) {
                    // self.loadXaPhuong(query, callback);
                },

                onItemAdd: function (value, $item) {
                    var obj = $select[0].selectize.options[value];
                    // delete obj.$order;
                    var obj_xaphuong = {
                        "id": obj.id,
                        "ten": obj.ten,
                        "quanhuyen_id": obj.quanhuyen_id
                    }
                    self.model.set({
                        "xaphuong": obj_xaphuong,
                        "xaphuong_id": value,
                    });
                },
                onItemRemove: function () {
                    self.model.set({
                        "xaphuong": null,
                        "xaphuong_id": null
                    });
                    self.controlSelectize();
                }
            });
        },
        checkTrangThai: function(){
            var self = this;
            let trangthai = self.model.get("trangthai");
            if (trangthai ==1){
                self.$el.find(".btn-xacnhan,.btn-huy").removeClass("d-none");
            }
            else{
                self.$el.find(".btn-xacnhan,.btn-huy").remove();
            }
        }
	});
});