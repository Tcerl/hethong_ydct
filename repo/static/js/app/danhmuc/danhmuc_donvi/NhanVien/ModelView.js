const { valHooks } = require('jquery');

define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/danhmuc/danhmuc_donvi/NhanVien/tpl/model.html'),
		schema 				= require('json!schema/NhanVienSchema.json'),
		PhotoSwipe 		= require('vendor/photoswipe/photoswipe'),
		PhotoSwipeUI_Default = require('vendor/photoswipe/photoswipe-ui-default'),
		AttachFileVIew = require("app/view/AttachFile/AttachFileVIew");
    
    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "nhanvien",
    	tools : [
			{
				name: "back",
				type: "button",
				buttonClass: "btn-secondary width-sm",
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
					var $selectz = (self.$el.find('#chon_roles'))[0];
					// $selectz.selectize.setValue([id]);
					// var obj = $selectz.selectize.options[value];
					var ten = self.model.get("ten");
					if (!ten || ten == null || ten == undefined || ten == "") {
						self.getApp().notify({message: "Vui lòng nhập tên nhân viên"}, {type: "danger", delay: 5000 });
						return;
					}
					var ma = self.model.get("ma");
					if (!ma || ma == null || ma == undefined || ma == "") {
						self.getApp().notify({message: "Vui lòng nhập mã nhân viên"}, {type: "danger", delay: 5000 });
						return;
					}

					var list_role = self.$el.find('#chon_roles').val();
					console.log("list====", list_role);
					var danhsach_id = [];
					var danhsach_roles_toset = [];
					// if (!list_role && list_role !== null && list_role instanceof String) {
						danhsach_id = list_role.split(',');
					// 	console.log("list===1=", danhsach_id);
					// } else if (!list_role && list_role !== null && list_role instanceof Array) {
					// 	danhsach_id = list_role
					// }
					console.log("list===2=", danhsach_id);
					if (danhsach_id instanceof Array && danhsach_id.length > 0) {
						danhsach_id.forEach( (id, index) => {
							var obj = $selectz.selectize.options[id];
							danhsach_roles_toset.push(obj);
						});
						self.model.set("vaitro", danhsach_roles_toset);
					}
					if (!danhsach_roles_toset || danhsach_roles_toset == null || danhsach_roles_toset == undefined || danhsach_roles_toset == "" || (danhsach_roles_toset.length == 0)) {
						self.getApp().notify({message: "Vui lòng chọn vai trò"}, {type: "danger", delay: 5000 });
						return;
					}

					self.model.save(null,{
						success: function (model, respose, options) {
							self.getApp().notify("Lưu thông tin thành công");
							self.getApp().getRouter().navigate(self.collectionName + "/collection");
							
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
								self.getApp().notify({ message: "Xóa thông tin không thành công"}, { type: "danger", delay: 1000 });
							}
						}
					});
				}
			},
    	],
    	render:function(){
    		var self = this;
			var id = this.getApp().getRouter().getParam("id");
			self.register_attach_file('chungchi_url');
			self.register_attach_file('avatar_url');
			var danhsach_roles = [
				{
					"id": 1,
					"ma": "bacsi",
					"ten": "Bác sĩ"
				},
				{
					"id": 2,
					"ma": "Yta",
					"ten": "Y tá"
				},
				{
					"id": 3,
					"ma": "dieuduong",
					"ten": "Điều dưỡng"
				},
				{
					"id": 4,
					"ma": "quanly",
					"ten": "Quản lý"
				},
			]
			var $selectz = self.$el.find('#chon_roles').selectize({
				maxItems: 100,
				plugins: ['remove_button'],
				persist: false,
				valueField: 'id',
				labelField: 'ten',
				searchField: ['tenten_dichvu'],
				options: danhsach_roles,
				render: {
					item: function(data, escape) {
						return '<div>"' + escape(data.ten) + '"</div>';
					}
				},
			});
    		if(id){
    			//progresbar quay quay
    			this.model.set('id',id);
        		this.model.fetch({
        			success: function(data){
						self.applyBindings();
						var  vaitro = self.model.get("vaitro");
						if (!!vaitro && vaitro !== undefined && vaitro !== null && vaitro instanceof Array) {
							var danhsach_id = [];
							vaitro.forEach( (value, index) => {
								danhsach_id.push(value.id);
							});
							$selectz[0].selectize.setValue(danhsach_id);
						}
						var chungchi_url = self.model.get('chungchi_url');
						if (!!chungchi_url && chungchi_url !== '') {
							var url_file = gonrinApp().check_image(chungchi_url);
							self.$el.find("#chungchi_url").append('<div class="list-image mt-2"><img class="d-none" src="'+ url_file +'"><a src="' + url_file + '"  class="anh_chungchi_url"><u> Ảnh Chứng chỉ</u></a></div>');
							$(".anh_chungchi_url").unbind("click").bind("click",{obj:{"url":url_file,"class_file": "chungchi_url"}},function(e){
								var object = e.data.obj;
								var img = document.createElement('img');
								img.src = object.url;
								img.onload = function(e) {
									self.openPhotoSwipe( 0, $("#" + object.class_file) );
								};
								img.onerror = function(e) {
								};
							});
						}

						var avatar_url = self.model.get('avatar_url');
						if (!!avatar_url && avatar_url !== '') {
							var url_file = gonrinApp().check_image(avatar_url);
							self.$el.find("#avatar_url").append('<div class="list-image mt-2"><img class="d-none" src="'+ url_file +'"><a src="' + url_file + '"  class="anh_avatar_url"><u>Ảnh đại diện người dùng</u></a></div>');
							$(".anh_avatar_url").unbind("click").bind("click",{obj:{"url":url_file,"class_file": "avatar_url"}},function(e){
								var object = e.data.obj;
								var img = document.createElement('img');
								img.src = object.url;
								img.onload = function(e) {
									self.openPhotoSwipe( 0, $("#" + object.class_file) );
								};
								img.onerror = function(e) {
								};
							});
						}
        			},
        			error:function(){
    					self.getApp().notify("Get data Eror");
    				},
        		});
    		}else{
    			self.applyBindings();
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
        view_file_attach: function(file, class_file) {
            var self = this;
            var url_file = gonrinApp().check_image(file),
				viewfile = self.$el.find("#" + class_file);
			var file_type = file.type;
            if (!!file.type && (file_type.toLowerCase().includes("jpeg") || file_type.toLowerCase().includes("jpg") || file_type.toLowerCase().includes("png"))) {
				viewfile.empty();
                viewfile.append('<div class="list-image mt-2"><img class="d-none" src="'+ url_file +'"><a src="' + url_file + '" class="' + file.id + '"><u>' + file.name + file.type + '</u></a></div>');
                $("."+file.id).unbind("click").bind("click",{obj:{"url":url_file,"class_file":class_file}},function(e){
                    var object = e.data.obj;
                    var img = document.createElement('img');
                    img.src = object.url;
                    img.onload = function(e) {
                        self.openPhotoSwipe( 0, $("#" + object.class_file) );
                    };
                    img.onerror = function(e) {
                    };
                });
            }
        },
		openPhotoSwipe : function(index, galleryElement, disableAnimation, fromURL) {
			var self = this;
			var pswpElement = document.querySelectorAll('.pswp')[0];
			var items = self.parseThumbnailElements(galleryElement);
			var options = {index:index};
			var gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
			gallery.init();
        },
        parseThumbnailElements : function(el) {
			var thumbElements = el.find(".list-image");
			var items = [];
			for(var i = 0; i < thumbElements.length; i++) {
				// create slide object
				var item = {
					src: thumbElements[i].children[0].getAttribute('src'),
					w: parseInt(thumbElements[i].children[0].naturalWidth, 10),
					h: parseInt(thumbElements[i].children[0].naturalHeight, 10)
				};
				item.el = thumbElements[i]; // save link to element for getThumbBoundsFn
				items.push(item);
			}
			return items;
        },
    });

});