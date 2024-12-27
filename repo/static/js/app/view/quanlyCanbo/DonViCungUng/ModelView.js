define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template 		= require('text!app/view/quanlyCanbo/DonViCungUng/tpl/model.html'),
	schema 				= require('json!app/view/quanlyCanbo/DonViCungUng/DonViYTeSchema.json');
	var TinhThanhSelectView 	= require("app/danhmuc/danhmuc_dungchung/TinhThanh/SelectView");
    var QuanHuyenSelectView 	= require("app/danhmuc/danhmuc_dungchung/QuanHuyen/SelectView");
    var XaPhuongSelectView 	= require("app/danhmuc/danhmuc_dungchung/XaPhuong/SelectView");
    var TuyenDonViSelectView = require("app/danhmuc/danhmuc_dungchung/TuyenDonVi/SelectView");
	var UserDonViDialogView = require('app/view/quanlyCanbo/DonViYTe/UserDonVi/view/ModelDialogView'),
		DonviSelectView = require("app/view/quanlyCanbo/DangkiDonVi/DonviCaptrenSelectView"),
		AttachFileVIew = require("app/view/AttachFile/AttachFileVIew");
	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "donvi",
		tools: [
			{
				name: "back",
				type: "button",
				buttonClass: "btn-secondary width-sm",
				label: "TRANSLATE:BACK",
				visible: function () {
					var self = this;
					var uid = "id";
					if (self.getApp().currentUser) {
						uid = self.getApp().currentUser.donvi_id;
					}
					var id_donvi = this.getApp().getRouter().getParam("id");
					if (uid === id_donvi || !id_donvi) {
						return false;
					} else {
						return true;
					}
				},
				command: function () {
					var self = this;
					Backbone.history.history.back();
				}
			},
			{
				name: "save",
				type: "button",
				buttonClass: "btn-success btn-smwidth-sm button_save ml-2",
				label: "TRANSLATE:SAVE",
				visible: function () {
					return (this.getApp().hasRole('admin_donvi') ===true || this.getApp().hasRole('admin')=== true);
				},
				command: function () {
					var self = this;
					var ten = self.model.get("ten");
					var sodienthoai = self.model.get("sodienthoai");
					var email = self.model.get("email");
					if(!!email) {
						self.model.set("email",email.toLowerCase());
					}

					if(!ten || ten == null || ten == "") {
						self.getApp().notify("Tên đơn vị không được để trống.Vui lòng nhập tên đơn vị!");
						return false;
					}
					
					// if(!sodienthoai || sodienthoai == null || sodienthoai == "") {
					// 	self.getApp().notify("Số điện thoại không được để trống.Vui lòng nhập số điện thoại!");
					// 	return false;
					// }
					self.model.set({
						"ten": ten.toUpperCase(),
						"tenkhongdau": gonrinApp().convert_khongdau(ten),
					});
					self.model.set("loai_donvi", 2);
					self.model.save(null,{
						success: function (model, respose, options) {
							self.getApp().notify("Lưu dữ liệu thành công.");
							var id = self.model.get("id");
							if (!id || id == self.getApp().currentUser.donvi_id) {
								self.getApp().getRouter().refresh();
							} 
							else if(gonrinApp().hasRole("admin")) {
								self.getApp().getRouter().navigate("admin/donvicungung/collection");
							} else {
								self.getApp().getRouter().refresh();
							}
						},
						error: function (xhr, status, error) {
							self.getApp().hideloading();
								try {
								if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED"){
									self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
								} else {
									self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
								}
							}
							catch (err) {
								self.getApp().notify({ message: "Khóa đơn vị không thành công. Vui lòng thử lại sau!"}, { type: "danger", delay: 1000 });
							}
						}
					});
				}
			},
			{
				name: "info",
				type: "button",
				buttonClass: "btn-info width-sm ml-2",
				label: "Thông tin tài khoản",
				visible: function() {
					var self = this;
					var uid = "id";
					if (self.getApp().currentUser) {
						uid = self.getApp().currentUser.donvi_id;
					}
					//chi tài khoan admin don vi moi duoc xem chi tiết tài khoản của mình
					var id_donvi = this.getApp().getRouter().getParam("id");
					if (uid === id_donvi || !id_donvi) {
						return true;
					} else {
						return false;
					}
				},
				command: function () {
					var self = this;
					var uid = self.getApp().currentUser.id;
					var url = self.getApp().serviceURL + "/api/v1/user/"+uid;
					$.ajax({
						url: url,
						method: "GET",
						contentType: "application/json",
						success: function (obj) {
							obj.id = uid;
							var dialogUserDonViView = new UserDonViDialogView({"viewData": {"donvi":self.model.toJSON(),"data":obj,"accept":0}});
							self.$el.find("#content").empty();
							dialogUserDonViView.render();
							self.$el.find("#content").append(dialogUserDonViView.el);
						},
						error: function (xhr, status, error) {
							try {
								if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED"){
									self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
									self.getApp().getRouter().navigate("login");
								} else {
									self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 1000 });
								}
							}
							catch (err) {
								self.getApp().notify({ message: "Lỗi truy cập dữ liệu, vui lòng thử lại sau"}, { type: "danger", delay: 1000 });
							}
						},
					});
				}
			},
		],
		uiControl: {
			fields: [
				{
					field: "xaphuong",
					uicontrol: "ref",
					textField: "ten",
					foreignRemoteField: "id",
					foreignField: "xaphuong_id",
					dataSource: XaPhuongSelectView
				},
				{
					field: "quanhuyen",
					uicontrol: "ref",
					textField: "ten",
					foreignRemoteField: "id",
					foreignField: "quanhuyen_id",
					dataSource: QuanHuyenSelectView
				},
				{
					field: "tinhthanh",
					uicontrol: "ref",
					textField: "ten",
					foreignRemoteField: "id",
					foreignField: "tinhthanh_id",
					dataSource: TinhThanhSelectView
				},
				{
  					field:"ngaycapphep",
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
					field:"captren",
					uicontrol:"ref",
					foreignRemoteField:"id",
					foreignField:"captren_id",
					dataSource:DonviSelectView
				},
  				{
  				  	field:"tuyendonvi",
  				  	uicontrol: "ref",
	  				textField: "ten",
					foreignRemoteField: "id",
					foreignField: "tuyendonvi_id",
					dataSource: TuyenDonViSelectView
				},
				{
					field: "loai_donvi",
					uicontrol: "combobox",
					textField: "text",
					valueField: "value",
					cssClass: "form-control",
					dataSource: [
						{ value: 1, text: "Đơn vị quản lý ngành y tế" },
						{ value: 2, text: "Đơn vị sản xuất/cung ứng" },
					],
				},
			]
		},
		set_macosokcb: false,
		render: function () {
			var self = this;
			// gonrinApp().inputRef(self, "#quanhuyen", "quanhuyen",new QuanHuyenSelectView());
			var donvi_id = this.getApp().getRouter().getParam("id");
			var curUser = self.getApp().currentUser;
			if ( !!self.getApp().hasRole('canbo') && self.getApp().hasRole('admin_donvi') == false && self.getApp().hasRole('admin') == false ) {
				self.$el.find("input").prop('disabled', true);
			}
			if (curUser && !donvi_id) {
				donvi_id = curUser.donvi_id;
			}
			self.$el.find('.btn-add-user').unbind('click').bind('click', function () {
				var dialogUserDonViView = new UserDonViDialogView({ "viewData": { "donvi_id": self.model.get('id'), "data": null, "create_new": true } });
				self.$el.find("#content").empty();
				dialogUserDonViView.render();
				self.$el.find("#content").append(dialogUserDonViView.el);
			});
			self.register_attach_file('thumbnail_url');
			self.register_attach_file('banner_url');
			if (donvi_id) {
				var url = self.getApp().serviceURL + "/api/v1/donvi/"+donvi_id;
				$.ajax({
					url: url,
					method: "GET",
					contentType: "application/json",
					success: function (data) {
						var curUser = self.getApp().currentUser;
						var users = data.users;
						if (self.getApp().hasRole('admin_donvi') == true) {
							self.$el.find('#donvicaptren').prop('disabled', true);
							var donvi_id_current = curUser.donvi_id;
							if (donvi_id_current == donvi_id) {
								self.$el.find("#tuyendonvi").prop("disabled", true);
							} else {
								self.$el.find(".users").hide();
							}
						}
						self.$el.find(".btn-baocaokho").removeClass("d-none");
						self.$el.find(".btn-baocaokho").unbind("click").bind("click", function(){
							self.getApp().getRouter().navigate("baocaokho/collection?donvi_id=" + donvi_id);
						});
						self.model.set(data);
						self.getUserDonVi();
						self.applyBindings();
						self.model.on("change:tinhthanh", function() {
							var tinhthanh_id = self.model.get("tinhthanh_id");
							var filterobj = {"tinhthanh_id": {"$eq": tinhthanh_id}}; 
							self.getFieldElement("quanhuyen").data("gonrin").setFilters(filterobj);
							self.model.set({"quanhuyen":null,"xaphuong":null});
							self.convert_diachi();
						});
						self.model.on("change:quanhuyen", function() {
							var quanhuyen_id = self.model.get("quanhuyen_id");
							var filterobj = {"quanhuyen_id": {"$eq": quanhuyen_id}}; 
							self.getFieldElement("xaphuong").data("gonrin").setFilters(filterobj);
							self.model.set({"xaphuong":null});
							self.convert_diachi();
						});
						self.model.on("change:xaphuong", function () {
							self.convert_diachi();
						});
						self.button_duyet();
						self.selectize_choncosokhamchuabenh();
						var thumbnail_url = self.model.get('thumbnail_url');
						if (!!thumbnail_url && thumbnail_url !== '') {
							var url_file = gonrinApp().check_image(thumbnail_url);
							self.$el.find("#thumbnail_url").append('<div class="mt-2 cursor-pointer"><img class="d-none list-image" src="'+ url_file +'"><a src="' + url_file + '"  class="anh_thumbnail_url"><u>Xem ảnh đại diện đơn vị</u></a></div>');
							$(".anh_thumbnail_url").unbind("click").bind("click",{obj:{"url":url_file,"class_file": "thumbnail_url"}},function(e){
								var object = e.data.obj;
								var img = document.createElement('img');
								img.src = object.url;
								img.onload = function(e) {
									// self.openPhotoSwipe( 0, $("#" + object.class_file) );
									gonrinApp().openPhotoSwipe(0, $("#thumbnail_url"));
								};
								img.onerror = function(e) {
								};
							});
						}

						var banner_url = self.model.get('banner_url');
						if (!!banner_url && banner_url !== '') {
							var url_file = gonrinApp().check_image(banner_url);
							self.$el.find("#banner_url").append('<div class="mt-2 cursor-pointer"><img class="d-none list-image" src="'+ url_file +'"><a src="' + url_file + '"  class="anh_banner_url"><u>Xem ảnh bìa</u></a></div>');
							$(".anh_banner_url").unbind("click").bind("click",{obj:{"url":url_file,"class_file": "banner_url"}},function(e){
								var object = e.data.obj;
								var img = document.createElement('img');
								img.src = object.url;
								img.onload = function(e) {
									gonrinApp().openPhotoSwipe( 0, $("#banner_url") );
								};
								img.onerror = function(e) {
								};
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
						}catch (err) {
							self.getApp().notify({ message: "Lỗi không lấy được dữ liệu"}, { type: "danger", delay: 1000 });
						}
					}
				});
			}
			else {
				self.applyBindings();
				self.getApp().notify("Lỗi truy cập dữ liệu. Vui lòng thử lại sau")
				if(gonrinApp().hasRole("admin")) {
					self.getApp().getRouter().navigate("admin/donvicungung/collection");
				} else {
					self.getApp().getRouter().navigate("canbo/donvi/model");
				}
				self.selectize_choncosokhamchuabenh();
			}
		},
		button_duyet: function () {
			var self = this;
			var donvi_id = this.getApp().getRouter().getParam("id");
			// if ((self.hasRole('admin_donvi') || self.hasRole('canbo')) && (donvi_id == null || donvi_id == undefined || donvi_id == "")) {
			// 	var current_user = gonrinApp().currentUser;
			// 	donvi_id = current_user.donvi_id;
			// }
			if (donvi_id) {
				var active = self.model.get("active");
				if (active === 0 || active === false) {
					self.$el.find(".toolbar").append('<button type="button" btn-name="Duyet" class="btn btn-primary width-sm button_mo ml-2">Mở</button>');
				} else {
					self.$el.find(".toolbar").append('<button type="button" btn-name="Khoa" class="btn btn-danger width-sm button_khoa ml-2">Khóa</button>');
				}
				
				self.$el.find(".button_mo").unbind("click").bind("click",function() {
					self.model.set("active",true);

					var email = self.model.get("email");
					if(!!email) {
						self.model.set("email",email.toLowerCase());
					}

					var ten = self.model.get("ten");
					self.model.set("ten",ten.toUpperCase());
					self.model.set("tenkhongdau",gonrinApp().convert_khongdau(ten));
					self.model.save(null, {
						success: function (model, respose, options) {
							self.getApp().notify("Mở tài khoản đơn vị thành công!");
							if(gonrinApp().hasRole("admin")) {
								self.getApp().getRouter().navigate("admin/donvicungung/collection");
							} else {
								self.getApp().getRouter().refresh();
							}
						},
						error: function (xhr, status, error) {
							self.getApp().hideloading();
								try {
								if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED"){
									self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
								} else {
									self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
								}
							}
							catch (err) {
								self.getApp().notify({ message: "Mở đơn vị không thành công. Vui lòng thử lại sau!"}, { type: "danger", delay: 1000 });
							}
						}
					});
				});
				self.$el.find(".button_khoa").unbind("click").bind("click",function() {
					self.model.set("active", false);

					var email = self.model.get("email");
					if(!!email) {
						self.model.set("email",email.toLowerCase());
					}

					var ten = self.model.get("ten");
					self.model.set("ten",ten.toUpperCase());
					self.model.set("tenkhongdau",gonrinApp().convert_khongdau(ten));
					self.model.save(null,{
						success: function (model, respose, options) {
							self.getApp().notify("Khóa đơn vị thành công!");
							if(gonrinApp().hasRole("admin")) {
								self.getApp().getRouter().navigate("admin/donvicungung/collection");
							} else {
								self.getApp().getRouter().refresh();
							}
						},
						error: function (xhr, status, error) {
							self.getApp().hideloading();
								try {
								if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED"){
									self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
								} else {
									self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
								}
							}
							catch (err) {
								self.getApp().notify({ message: "Khóa đơn vị không thành công. Vui lòng thử lại sau!"}, { type: "danger", delay: 1000 });
							}
						}
					});
				});
			}
		},
		getUserDonVi:function() {
			var self = this;
			if (self.getApp().hasRole('admin_donvi') === false && self.getApp().hasRole('admin')=== false){
				self.$el.find(".users").hide();
			} else {
				$("#grid").html("");
				var url_donvi = self.getApp().serviceURL + '/api/v1/user';
				var madonvi = self.model.get("id");
				$.ajax({
					url: url_donvi,
					method: "GET",
		    		data: {"q": JSON.stringify({"filters": {"donvi_id":{"$eq": madonvi}},"page":1}),"results_per_page":2000},
					contentType: "application/json",
					success: function (data) {
						$("#grid").grid({
		                	showSortingIndicator: true,
		                	onValidateError: function(e){
		                		console.log(e);
		                	},
		                	language:{
		                		no_records_found:" "
		                	},
		                	noResultsClass:"alert alert-default no-records-found",
		                	refresh:true,
		                	orderByMode: "client",
		                	fields: [
								{field: "fullname", label: "Họ và tên", sortable: {order:"asc"}},
								{field: "phone", label: "Số điện thoại"},
								{field: "email", label: "Email"},
								{
									field: "roles",
									label: "Vai trò",
									// textField: "name",
									template: function(rowData) {
										var roles = rowData.roles;
										if (roles[0].name.indexOf("admin_donvi")>=0){
											return '<span>Admin</span>';
										} else {
											return '<span>Canbo</span>';
										}
									}
								},
							],
							dataSource: data.objects,
							primaryField:"id",
							selectionMode: "single",
							pagination: {
							page: 1,
							pageSize: 20
							},
							onRowClick: function(event) {
								if (event.rowId) {
									var dialogUserDonViView = new UserDonViDialogView({ "viewData": { "donvi": self.model.toJSON(), "data": event.rowData } });
									self.$el.find("#content").empty(); 
									dialogUserDonViView.render();
									self.$el.find("#content").append(dialogUserDonViView.el);
								}
							},
		                });
					},
					error: function (xhr, status, error) {
						try {
							if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED"){
								self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
								self.getApp().getRouter().navigate("login");
							} else {
								self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 1000 });
							}
						}
						catch (err) {
						  self.getApp().notify({ message: "Lỗi truy cập dữ liệu, vui lòng thử lại sau"}, { type: "danger", delay: 1000 });
						}
					},
				});
			}
			
		},
		validateEmail: function (email) {
			var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return re.test(String(email).toLowerCase());
		},
		validatePhone: function(inputPhone) {
			if (inputPhone == null || inputPhone == undefined) {
				return false;
			}
            var phoneno = /(09|08|07|05|03)+[0-9]{8}/g;
            const result = inputPhone.match(phoneno);
            if (result && result == inputPhone) {
                return true;
            } else {
                return false;
            }
		},
        register_attach_file: function(class_file = null) {
            var self = this;
            self.$el.find("." + class_file).unbind("click").bind("click", function() {
                var attachImage = new AttachFileVIew();
                attachImage.render();
                attachImage.on("success", (event) => {
					var file = event.data;
					var file_type = file.type;
            		if (!!file && !!file_type && (file_type.toLowerCase().includes("jpeg") || file_type.toLowerCase().includes("jpg") || file_type.toLowerCase().includes("png"))) {
						self.getApp().notify("Tải file thành công!");
						self.model.set(class_file, file.link);
						// console.log("self.model.", self.model.get(class_file));
						self.view_file_attach(file, class_file);
					}
                });
            });
		},
		disabled_select_captren: function(status = 0) {
			var self = this;
			if (status == 1) {
				self.$el.find("#donvicaptren").prop('disabled', false);
			} else {
				self.$el.find("#donvicaptren").prop('disabled', true);
			}
		},
        view_file_attach: function(file, class_file) {
            var self = this;
            var url_file = gonrinApp().check_image(file),
				viewfile = self.$el.find("#" + class_file);
			var file_type = file.type;
            if (!!file.type && (file_type.toLowerCase().includes("jpeg") || file_type.toLowerCase().includes("jpg") || file_type.toLowerCase().includes("png"))) {
				viewfile.empty();
                viewfile.append('<div class="mt-2 cursor-pointer"><img class="d-none list-image" src="'+ url_file +'"><a src="' + url_file + '" class="' + file.id + '"><u>' + file.name + file.type + '</u></a></div>');
                $("."+file.id).unbind("click").bind("click",{obj:{"url":url_file,"class_file":class_file}},function(e){
                    var object = e.data.obj;
                    var img = document.createElement('img');
                    img.src = object.url;
                    img.onload = function(e) {
						// self.openPhotoSwipe( 0, $("#" + object.class_file) );
						gonrinApp().openPhotoSwipe(0, $("#" + object.class_file));
                    };
                    img.onerror = function(e) {
                    };
                });
            }
		},
		convert_diachi: function () {
			var self = this;
			var diachi = self.model.get("diachi"),
				tinhthanh = self.model.get("tinhthanh"),
				quanhuyen = self.model.get("quanhuyen"),
				xaphuong = self.model.get("xaphuong");
			// console.log("dia chi", gonrinApp().convert_diachi(diachi,tinhthanh,  quanhuyen, xaphuong));
			self.model.set("diachi", gonrinApp().convert_diachi(diachi,tinhthanh,  quanhuyen, xaphuong));
		},
		selectize_choncosokhamchuabenh: function () {
			var self = this;
			var $selectize = self.$el.find('#selectize-programmatic').selectize({
                valueField: 'ma_coso',
                labelField: 'ten',
                searchField: 'ten',
                preload: true,
                load: function(query, callback) {
                    var query_filter = {"filters": 
						{"$or":[{"ma_coso":{"$likeI": query}},{"tenkhongdau":{"$likeI": query}}]}
                    };
                    var url = (self.getApp().serviceURL || "") + '/api/v1/cosoyte?results_per_page=15' + (query_filter? "&q=" + JSON.stringify(query_filter): "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
							callback(res.objects);
							if (self.set_macosokcb == false) {
								var ma_coso = self.model.get("ma_coso");
								self.set_macosokcb = true;
								var $selectz = (self.$el.find('#selectize-programmatic'))[0]
								$selectz.selectize.setValue([ma_coso]);
							}
                        }
                    });
				},
				render: {
                    item: function (item, escape) {
                        return '<div class="item">'
							+ (item.ma_coso ? ' <span class="email">Mã:' + escape(item.ma_coso) + '</span>' : '')
							+ (item.ten ? '<span class="name"> -' + escape(item.ten) + '</span>' : '')
                            + '</div>';
                    },
                    option: function (item, escape) {
                        return '<div class=" px-2 border-bottom">'
                            + '<h5 class="py-0">' + escape(item.ten) + '</h5>'
                            + (item.ma_coso ? '<small class="caption float-left " style="display:block">Mã CSKCB: ' + item.ma_coso +'</small>' : '')
                            + '</div>';
                    }
                },
                onChange: function(value, isOnInitialize) {
                    var $selectz = (self.$el.find('#selectize-programmatic'))[0]
					var obj = $selectz.selectize.options[value];
					self.model.set({
						"ten_coso": obj.ten,
						"ma_coso": obj.ma_coso 
					})
                }
            });
            
		}
	});


});