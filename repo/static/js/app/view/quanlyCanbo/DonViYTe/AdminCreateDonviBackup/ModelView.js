define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/view/quanlyCanbo/DonViYTe/AdminCreateDonvi/tpl/model.html'),
		schema 				= require('json!app/view/quanlyCanbo/DonViYTe/AdminCreateDonvi/DonViYTeSchema.json');
	return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "admin/donvi/create",
    	tools : [
			{
				name: "back",
				type: "button",
				buttonClass: "btn-secondary width-sm",
				label: `<i class="fas fa-arrow-circle-left"></i> Quay lại`,
				command: function(){
					var self = this;
					Backbone.history.history.back();  
				}
			},
			{
				name: "save",
				type: "button",
				buttonClass: "btn-primary width-sm ml-2 taodonvi",
				label: `<i class="far fa-save"></i> Lưu`,
				visible: function () {
					return (this.getApp().hasRole('admin_donvi') ===true || this.getApp().hasRole('admin') ===true);
				},
				command: function(){
					var self = this;
					var curUser = self.getApp().currentUser;
					if (curUser) {
						self.model.set("created_by",curUser.id);
					}
					
					var donvi_ten = self.model.get("donvi_ten"),
						email = self.model.get("email"),
						donvi_email = self.model.get("donvi_email"),
						hoten = self.model.get("hoten"),
						dienthoai = self.model.get("dienthoai"),
						pass = self.model.get("password"),
						cfpass = self.model.get("cfpassword"),
						sogiayphep = self.model.get("sogiayphep");
					
					let donvi_loai_donvi = self.model.get("donvi_loai_donvi");

					if  (donvi_ten == null || donvi_ten == "" ){
						self.getApp().notify({ message: "Tên doanh nghiệp không được để trống!" }, { type: "danger" });
						return
					}

					if (sogiayphep === undefined || sogiayphep === null || sogiayphep === ""){
						self.getApp().notify({message : "Vui lòng nhập mã số doanh nghiệp"}, {"type" : "danger"});
						return false;
                    }
                    else{
                        if (self.checkSpecialCharacter(sogiayphep) === true){
                            self.getApp().notify({message:"Vui lòng nhập chính xác số giấy phép kinh doanh"}, {type : "danger", delay : 1000});
                            return false;
                        }
                    }
                    
                    let ngaycapphep = self.model.get("ngaycapphep");
                    if (!ngaycapphep){
                        self.getApp().notify({message: "Vui lòng nhập ngày cấp mã số doanh nghiệp"}, {type: "danger", delay : 1000});
                        return false;
                    }

					if (donvi_loai_donvi === undefined || donvi_loai_donvi === null){
						self.getApp().notify({message : "Vui lòng nhập loại đơn vị"}, {type : 'danger', delay : 1000});
						return false;
					}

					if (hoten == null || hoten == "" ||hoten == undefined) {
						self.getApp().notify({ message: "Tên người dùng không được để trống!" }, { type: "danger" });
						return
					}
                    
                    if ((dienthoai === null || dienthoai === undefined ) && (email === undefined || email === null || email === "")){
                        self.getApp().notify({message: "Vui lòng nhập số điện thoại hoặc email người dùng"}, {type : "danger", delay : 1000});
                        return false;
                    }

                    if (dienthoai){
						var check_dienthoai = self.getApp().validatePhone(dienthoai);
						if (check_dienthoai != true){
							self.getApp().notify({ message: "Vui lòng nhập số điện thoại đúng định dạng!" }, { type: "danger" });
							return false;
						}
                    }
                    
                    if (email){
						var check_email = self.getApp().validateEmail(email);
						if (check_email != true){
							self.getApp().notify({message : "Vui lòng nhập email đúng định dạng"}, {type : "danger", delay : 1000});
							return false
						}
						else{
							self.model.set("email",email.toLowerCase());
						}
                    }

					if (!!donvi_email) {
						self.model.set("donvi_email",donvi_email.toLowerCase());
					}
					
					if (pass == null || pass == "") {
						self.getApp().notify({ message: "Mật khẩu không được để trống!" }, { type: "danger" });
						return
					}
					else if (pass == null || pass != cfpass) {
						self.getApp().notify({ message: "Xác nhận mật khẩu không đúng, vui lòng kiểm tra lại!" }, { type: "danger" });
						return
					}

					self.model.set("hoten",hoten.toUpperCase());
					self.model.set("donvi_ten",donvi_ten.toUpperCase());
					self.model.save(null,{
						success: function (model, respose, options) {
							self.getApp().notify("Tạo doanh nghiệp thành công!");
							self.getApp().getRouter().navigate('admin/donvi/collection');
						},
						error: function (xhr, status, error) {
							self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message}, { type: "danger", delay: 1000});
						}
					});
				}
			},
 	    ],
	 	uiControl: {
			fields:[
				{
					field:"donvi_loai_donvi",
					uicontrol:"combobox",
					textField: "text",
					valueField: "value",
					cssClass:"form-control",
					dataSource: [
                        { value: 2, text: "Đơn vị nhập khẩu/phân phối/cung ứng" },
                        { value: 5, text: "Đơn vị nuôi trồng dược liệu" },
                        { value: 6, text: "Đơn vị khai thác tự nhiên" },
						{ value: 9, text: "Đơn vị nuôi trồng và khai thác tự nhiên" },
						{ value: 4, text: "Bệnh viện" },
						{ value: 7, text: "Cá nhân nuôi trồng, thu gom dược liệu" },
						{ value: 8, text: "Cá nhân khai thác, thu gom dược liệu" },
						]
                },
                {
                    field: "ngaycapphep",
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
			]
		},
    	render:function(){
			var self = this;
			self.applyBindings();
			self.validate_password();
			var curUsr = self.getApp().currentUser;
			if (this.getApp().hasRole('admin_donvi') === true) {
				self.setDonviCaptren(curUsr.donvi_id);
			}
			// self.model.set("donvi_loai_donvi", 2);
			self.selectizeTinhThanh();
			self.selectizeQuanHuyen();
			self.selectizeXaPhuong();
			self.controlSelectize();
		},
		validate_password: function() {
			var self = this;
			self.model.on("change:cfpassword", function() {
				var pwd = self.model.get('password');
				var confirm_pwd = self.model.get('cfpassword');
				if (pwd !==null && pwd !== "" && pwd !== undefined && pwd !== confirm_pwd) {
					self.getApp().notify({ message: "Mật khẩu không khớp.Vui lòng nhập lại!" }, { type: "danger" });
				}
			});
            self.model.on("change:password", function() {
				var pwd = self.model.get('password');

				var confirm_pwd = self.model.get('cfpassword');
				if (confirm_pwd !== null && confirm_pwd !== "" && confirm_pwd !== undefined && pwd !== confirm_pwd) {
					self.getApp().notify({ message: "Mật khẩu không khớp.Vui lòng nhập lại!" }, { type: "danger" });
				}
			});
		},
		setDonviCaptren: function (donvi_id) {
			var self = this;
			if (donvi_id == undefined || donvi_id == null || donvi_id == "") {
				return false;
			}
			var url = self.getApp().serviceURL + "/api/v1/donvi/" + donvi_id;
			$.ajax({
				url: url,
				method: "GET",
				contentType: "application/json",
				success: function (obj) {
					// self.select_tuyendonvi(obj);
					self.model.set("captren", obj);
					self.model.set("captren_id", obj.id);
					self.$el.find("#donvicaptren").prop("disabled", true);
				},
				error: function (xhr, status, error) {
					try {
						if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED") {
							self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
							self.getApp().getRouter().navigate("login");
						} else {
							self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 1000 });
						}
					}
					catch (err) {
						self.getApp().notify({ message: "Lỗi truy cập dữ liệu, vui lòng thử lại sau" }, { type: "danger", delay: 1000 });
					}
				},
			});
			// self.applyBindings();
			// self.validate_password();
		},
		controlSelectize: function() {
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
        loadTinhThanh: function(query = '', callback) {
            var self = this;
            var arr_filters = [
                {'deleted': {'$eq': false}},
                {'active': {'$eq': 1}}
            ];
            if(!!query){
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
                success: function(response) {
                    callback(response.objects);
                    if (!!self.model.get('tinhthanh_id')) {
                        self.$el.find('#tinhthanh')[0].selectize.setValue(self.model.get('tinhthanh_id'));
                    }
                },
                error: function() {
                    callback();
                },
            });
        },
        loadQuanHuyen: function(query = '', callback) {
            var self = this;
            var arr_filters = [
                {'deleted': {'$eq': false}},
                {'active': {'$eq': 1}}
            ];
            if (!!self.model.get('tinhthanh_id')) {
                arr_filters.push({ "tinhthanh_id": { "$eq": self.model.get("tinhthanh_id") } });
            }
            if(!!query){
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
                success: function(response) {
                    callback(response.objects);
                    if (!!self.model.get('quanhuyen_id')) {
                        self.$el.find('#quanhuyen')[0].selectize.setValue(self.model.get('quanhuyen_id'))
                    }
                },
                error: function() {
                    callback();
                },
            });
        },
        loadXaPhuong: function(query = '', callback) {
            var self = this;
            var arr_filters = [
                {'deleted': {'$eq': false}},
                {'active': {'$eq': 1}}
            ];

            if (!!self.model.get('quanhuyen_id')) {
                arr_filters.push({ "quanhuyen_id": { "$eq": self.model.get("quanhuyen_id") } });
            }
            if(!!query){
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
                success: function(response) {
                    callback(response.objects);
                    if (!!self.model.get('xaphuong_id')) {
                        self.$el.find('#xaphuong')[0].selectize.setValue(self.model.get('xaphuong_id'))
                    }
                },
                error: function() {
                    callback();
                },
            });
        },
        selectizeTinhThanh: function() {
            var self = this;
            var $select = self.$el.find("#tinhthanh").selectize({
                maxItems: 1,
                valueField: "id",
                labelField: "ten",
                searchField: ["ten", "tenkhongdau"],
                preload: true,
                placeholder: "Tìm kiếm tỉnh thành",
                load: function(query, callback) {
                    self.loadTinhThanh(query, callback);
                },

                onItemAdd: function(value, $item) {
                    var obj = $select[0].selectize.options[value];
                    // delete obj.$order;
                    var obj_tinhthanh = {
                        "id": obj.id,
                        "ten": obj.ten,
                        "quocgia_id":obj.quocgia_id
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
                        self.$el.find("#quanhuyen")[0].selectize.load(function(callback) {
                            self.loadQuanHuyen('', callback);
                        });
                    }

                    self.controlSelectize();

                },
                onItemRemove: function() {
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
        selectizeQuanHuyen: function() {
            var self = this;
            var $select = self.$el.find("#quanhuyen").selectize({
                maxItems: 1,
                valueField: "id",
                labelField: "ten",
                searchField: ["ten", "tenkhongdau"],
                preload: true,
                placeholder: 'Tìm kiếm quận huyện',

                load: function(query, callback) {
                    // self.loadQuanHuyen(query, callback);
                },

                onItemAdd: function(value, $item) {
                    var obj = $select[0].selectize.options[value];
                    // delete obj.$order;
                    var obj_quanhuyen = {
                        "id": obj.id,
                        "ten":obj.ten,
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
                        self.$el.find("#xaphuong")[0].selectize.load(function(callback) {
                            self.loadXaPhuong('', callback);
                        });
                    }

                },
                onItemRemove: function() {
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
        selectizeXaPhuong: function() {
            var self = this;
            var $select = self.$el.find("#xaphuong").selectize({
                maxItems: 1,
                valueField: "id",
                labelField: "ten",
                searchField: ["ten", "tenkhongdau"],
                preload: true,
                placeholder: 'Tìm kiếm xã phường',

                load: function(query, callback) {
                    // self.loadXaPhuong(query, callback);
                },

                onItemAdd: function(value, $item) {
                    var obj = $select[0].selectize.options[value];
                    // delete obj.$order;
                    var obj_xaphuong ={
                        "id": obj.id,
                        "ten": obj.ten,
                        "quanhuyen_id": obj.quanhuyen_id
                    }
                    self.model.set({
                        "xaphuong": obj_xaphuong,
                        "xaphuong_id": value,
                    });
                },
                onItemRemove: function() {
                    self.model.set({
                        "xaphuong": null,
                        "xaphuong_id": null
                    });
                    self.controlSelectize();
                }
            });
        },
        checkSpecialCharacter: function(string){
            var self = this;
            var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
            if(format.test(string)){
                return true;
            } 
            else {
                return false;
            }
        }
    });
});