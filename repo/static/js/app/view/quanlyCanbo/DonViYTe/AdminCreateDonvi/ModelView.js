define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/view/quanlyCanbo/DonViYTe/AdminCreateDonvi/tpl/model.html'),
		schema 				= require('json!app/view/quanlyCanbo/DonViYTe/AdminCreateDonvi/DonViYTeSchema.json');
	var tuyendonvi = require('json!app/constant/tuyendonvi.json');
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
				command: function() {
					Backbone.history.history.back();  
				}
			},
			{
				name: "save",
				type: "button",
				buttonClass: "btn-success width-sm ml-2 taodonvi",
				label: `<i class="far fa-save"></i> Tạo đơn vị`,
				visible: function () {
					return (this.getApp().hasRole('admin_donvi') ===true || this.getApp().hasRole('admin') ===true);
				},
				command: function(){
					var self = this;
					var ten_coso  = self.model.get("ten_coso"),
						tuyendonvi_id = self.model.get("tuyendonvi_id"),
						hoten = self.model.get("hoten"),
						user_email = self.model.get("user_email"),
						phone = self.model.get("phone"),
						pass = self.model.get("password"),
						email = self.model.get("email"),
						cfpass = self.model.get("cfpassword");

					if (ten_coso == null || ten_coso == "") {
						self.getApp().notify({ message: "Tên đơn vị không được để trống!" }, { type: "danger" });
						return
					}
					if (tuyendonvi_id == null || tuyendonvi_id == undefined) {
						self.getApp().notify({ message: "Chưa chọn tuyến đơn vị!" }, { type: "danger" });
						return
					}
					if (self.validate_level() == false) {
						return false;
					}
					if (hoten == null || hoten == "" || hoten == undefined) {
						self.getApp().notify({ message: "Tên người dùng không được để trống!" }, { type: "danger" });
						return false;
					}

					if (user_email == undefined || user_email == "" || user_email == null) {
						self.getApp().notify({ message: "Vui lòng nhập email để đăng nhập." }, { type: "danger" });
						return false;
					}
					if (!!user_email && gonrinApp().validateEmail(user_email) == false) {
						self.getApp().notify({message: "Vui lòng nhập đúng định dạng email."}, {type: 'danger', delay: 10000});
						return false;
					} else if (!!user_email) {
						self.model.set("user_email", user_email.toLowerCase());
					}

					if(!!phone && gonrinApp().validatePhone(phone) == false) {
						self.getApp().notify({message: "Vui lòng nhập đúng định dạng số điện thoại."}, {type: 'danger', delay: 10000});
						return false;
					}
					if (!!email) {
						self.model.set("email", email.toLowerCase());
					}
					if (pass == null || pass == "") {
						self.getApp().notify({ message: "Mật khẩu không được để trống!" }, { type: "danger" });
						return;
					}
					if (pass == null || pass != cfpass) {
						self.getApp().notify({ message: "Xác nhận mật khẩu không đúng, vui lòng kiểm tra lại!" }, { type: "danger" });
						return;
					}

					self.model.set("hoten", hoten.toUpperCase());
					self.model.set("ten_coso", ten_coso.toUpperCase());
					gonrinApp().showloading();
					self.model.save(null,{
						success: function(model, respose, options) {
							gonrinApp().hideloading();
							self.getApp().notify("Tạo đơn vị thành công!");
							self.getApp().getRouter().navigate('admin/donvi/collection');
						},
						error: function(xhr, status, error) {
							gonrinApp().hideloading();
							try {
								if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
									self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
									self.getApp().getRouter().navigate("login");
								} else {
									self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
								}
							} catch (err) {
								self.getApp().notify({ message: "Có lỗi xảy ra, vui lòng thử lại sau" }, { type: "danger", delay: 1000 });
							}
						}
					});
				}
			},
 	    ],
	 	uiControl: {
			fields:[
				
			]
		},
    	render: function() {
			var self = this;
			self.applyBindings();
			var currentUser  = gonrinApp().currentUser;
			if (currentUser === undefined || currentUser === null){
                self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                self.getApp().getRouter().navigate("login");
                return false;
            }
			var donvi = currentUser.donvi;
            var tuyendonvi_id = gonrinApp().getTuyenDonVi();
			var danhsach_tuyendonvi_id = [];
            if (gonrinApp().hasRole("admin_donvi") && ["1", "2"].includes(tuyendonvi_id)) {
				if (tuyendonvi_id == "1") {
					self.selectize_donvicaptren();
					danhsach_tuyendonvi_id = ["2", "3"];
					self.comboboxTuyendonvi(danhsach_tuyendonvi_id, "2");
					gonrinApp().selectizeTinhThanhQuanHuyenXaPhuong(self);
					self.model.on("change:tinhthanh_id", function() {
						if (self.model.get("tuyendonvi_id") == "3") {
							self.selectize_donvicaptren();
						}
					});
					self.eventChange();
				} 
				else if (tuyendonvi_id == "2") {
					self.model.set({
						"captren_name": donvi.ten_coso,
						"captren_id": donvi.id,
					});

					danhsach_tuyendonvi_id = ["3"];
					self.comboboxTuyendonvi(danhsach_tuyendonvi_id, "3");
					self.model.set({
                        "tinhthanh": donvi.tinhthanh,
                        "tinhthanh_id": donvi.tinhthanh_id,
                    });
					gonrinApp().selectizeTinhThanhQuanHuyenXaPhuong(self, true);
					self.$el.find("#selectize-donvi-captren").val(donvi.ten_coso).addClass("disable-click");
					self.eventChange();
				} 
            } 
			else if (gonrinApp().hasRole("admin")) {
				gonrinApp().selectizeTinhThanhQuanHuyenXaPhuong(self);
				self.eventChange();
                self.selectize_donvicaptren();

                self.model.on("change:tinhthanh_id", function() {
					if (self.model.get("tuyendonvi_id") == "3") {
						self.selectize_donvicaptren();
					}
				});
				danhsach_tuyendonvi_id = ["2", "3"];
				self.comboboxTuyendonvi(danhsach_tuyendonvi_id, "2");
            } 
			else {
                self.getApp().notify({ message: "Bạn không có quyền thực hiện hành động này"}, { type: "danger", delay: 1000 });
                return;
            }
		},
		eventChange: function() {
			var self = this;
			self.model.on("change:tuyendonvi_id", function () {
				self.selectize_donvicaptren();
			});
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
		validate_level: function() {
            var self = this;
            var tuyendonvi_id = self.model.get("tuyendonvi_id"),
                tinhthanh_id = self.model.get("tinhthanh_id"),
                xaphuong_id = self.model.get("xaphuong_id"),
                quanhuyen_id = self.model.get("quanhuyen_id"),
                captren_id = self.model.get("captren_id");
            
			if ((tinhthanh_id == null || tinhthanh_id == undefined)) {
				self.getApp().notify({ message: "Vui lòng chọn Tỉnh/Thành phố"}, { type: "danger", delay: 1000 });
				return false;
			} 
			if (!captren_id) {
				self.getApp().notify({ message: "Vui lòng chọn đơn vị cấp trên"}, { type: "danger", delay: 1000 });
				return false;
			}
            return true;
        },
		comboboxTuyendonvi: function(danhsach_tuyendonvi_id, default_val=null) {
            var self = this;
			var tuyendonvi_filter = tuyendonvi.filter(function (item) {
				if (danhsach_tuyendonvi_id.includes(item.value)) {
					return item;
				}
			});
			if (tuyendonvi_filter.length == 1) {
				self.$el.find('#selectize-tuyendonvi').val(tuyendonvi_filter[0].text).attr("disabled", true);
				if (!!default_val) {
					self.model.set("tuyendonvi_id", default_val);
				}
				return;
			}
			try {
				self.$el.find(`#selectize-tuyendonvi`).data("gonrin").destroy();
			} 
			catch (e) {
				
			}
			self.$el.find(`#selectize-tuyendonvi`).combobox({
				uicontrol:"combobox",
				textField: "text",
				valueField: "value",
				cssClass:"form-control",
				dataSource: tuyendonvi_filter,
				value: default_val
			});
			if (!!default_val) {
				self.model.set("tuyendonvi_id", default_val);
			}
			self.$el.find(`#selectize-tuyendonvi`).on("change.gonrin", function () {
				var tuyendonvi_id = self.$el.find(`#selectize-tuyendonvi`).data('gonrin').getValue();
				self.model.set("tuyendonvi_id", tuyendonvi_id);
			})
        },
		selectize_donvicaptren: function() {
			var self = this;
            var seted = false;
			var $selectz = (self.$el.find('#selectize-donvi-captren'))[0];
			if ($selectz.selectize !== undefined && $selectz.selectize !== null) {
				$selectz.selectize.enable();
                $selectz.selectize.clear();
                $selectz.selectize.clearOptions();
                self.model.set({
                    "captren_id": null,
                    "captren_name": null
                });
				$selectz.selectize.destroy();
			}
			var $selectize = self.$el.find('#selectize-donvi-captren').selectize({
				maxItems: 1,
                valueField: 'id',
                labelField: 'ten_coso',
                searchField: ['ten_coso', 'tenkhongdau'],
                preload: true,
                load: function(query, callback) {
                    var filter_condition = {"$and": [
						{"deleted": {"$eq": false}}
					]};
                    var tuyendonvi_id = self.model.get("tuyendonvi_id"),
                        tinhthanh_id = self.model.get("tinhthanh_id");

					tinhthanh_id = !!tinhthanh_id? tinhthanh_id: "";

					if (tuyendonvi == "2") {
						filter_condition['$and'].push({"tuyendonvi_id": {"$eq": "1"}});
					}
					else if (tuyendonvi_id == "3") {
						filter_condition['$and'].push({"tuyendonvi_id": {"$eq": "2"}});
						filter_condition['$and'].push({"tinhthanh_id": {"$eq": tinhthanh_id}});
					}

					if (!!query) {
						filter_condition['$and'].push(
							{"$or":[
								{"ten_coso":{"$likeI": query}},
								{"tenkhongdau":{"$likeI": gonrinApp().convert_khongdau(query)}}]
							}
						)
					}
					var query_filter = {"filters": filter_condition, "order_by": [{ "field": "tuyendonvi_id", "direction": "asc" }]};

                    var url = (self.getApp().serviceURL || "") + '/api/v1/donvi?results_per_page=15' + (query_filter? "&q=" + JSON.stringify(query_filter): "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
							callback(res.objects);
                            if (seted == false) {
                                seted = true;
                                if (res.objects.length > 0) {
                                    (self.$el.find('#selectize-donvi-captren'))[0].selectize.setValue((res.objects)[0].id);
									if (self.model.get("tuyendonvi_id") == "2") {
										$selectz.selectize.disable();
									}
                                }
                            }
                        }
                    });
				},
                onChange: function(value, isOnInitialize) {
                    var $selectz = (self.$el.find('#selectize-donvi-captren'))[0];
					var obj = $selectz.selectize.options[value];
					if (!!obj && value !== self.model.get("captren_id")) {
						self.model.set({
							"captren_name": obj.ten_coso,
							"captren_id": obj.id 
						})
					} 
					else if (value == null || value == "") {
						self.model.set({
							"captren_name": null,
							"captren_id": null
						});
					}
                }
			});
            
		},
    });
});