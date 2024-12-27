define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
	var template 				= require('text!app/view/quanlygacp/tpl/model_khaithac.html'),
	schema 				= require('json!schema/ChungNhanGACPSchema.json');
	var ManageFileVIew = require("app/view/AttachFile/ManageFileUploadView");


    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "chungnhangacp",
    	tools : [
			{
				name: "back",
				type: "button",
				buttonClass: "btn-secondary ml-1",
				label:  `<i class="fas fa-arrow-circle-left"></i> Quay lại`,
				command: function(){
					var self = this;
					Backbone.history.history.back();
				}
			},
			{
				name: "save",
				type: "button",
				buttonClass: "btn-success btn-save width-sm ml-2 d-none",
				label:  `<i class="far fa-save"></i> Lưu`,
				visible: function(){
					return (this.getApp().hasRole("admin_donvi") || this.getApp().hasRole("canbo"));
				},
				command: function(){
					var self = this;
					self.setNullModel();
					self.register();
					self.model.set("loai_nuoitrong_khaithac",2);
					self.model.save(null,{
						success: function (model, respose, options) {
							self.getApp().notify("Lưu thông tin thành công");
                            let path = "chitieu_gacp/collection"	;
                            self.getApp().getRouter().navigate(path);				
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
				buttonClass: "btn-danger btn-delete width-sm ml-2 d-none",
				label: "TRANSLATE:DELETE",
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
				name: "duyet",
				type: "button",
				buttonClass: "btn-primary btn-duyet ml-1 d-none",
				label: "Duyệt",
				visible: function(){
					return (this.getApp().getRouter().getParam("id") !== null && (this.getApp().hasRole("admin_donvi") || this.getApp().hasRole("canbo")));
				},
				command: function(){
					var self = this;
					self.duyet();
				}
            },
            {
				name: "huy-duyet",
				type: "button",
				buttonClass: "btn-primary btn-huy-duyet ml-1 d-none",
				label: "Hủy duyệt",
				visible: function(){
					return (this.getApp().getRouter().getParam("id") !== null && (this.getApp().hasRole("admin_donvi") || this.getApp().hasRole("canbo")));
				},
				command: function(){
					var self = this;
					self.huyDuyet();
				}
			},
			{
				name: "mo-khoa",
				type: "button",
				buttonClass: "btn-primary btn-mokhoa ml-1 d-none",
				label: "Mở khóa",
				visible: function(){
					return (this.getApp().getRouter().getParam("id") !== null && (this.getApp().hasRole("admin_donvi") || this.getApp().hasRole("canbo")));
				},
				command: function(){
					var self = this;
					self.moKhoa();
				}
			}
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
                        ],
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
						let obj = self.model.toJSON();
						self.loadData(obj);
						self.setHeightTextarea();
                        self.registerElementTd();
                        self.view();
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
				self.register_event();
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
		getData : function(nuoitrong_khaithac_id, id_sanpham){
			var self = this;
			let query_filter ={"filters" : {"$and":[
				{"nuoitrong_khaithac_id" : {"$eq" : nuoitrong_khaithac_id}},
				{"deleted": {"$eq": false}}
			]} }  
			self.getApp().showloading();
			$.ajax({
				url: (self.getApp().serviceURL || "") + `/api/v1/chitieu_gacp?results_per_page=20` + (query_filter? "&q=" + JSON.stringify(query_filter): ""),
				dataType: "json",
				contentType: "application/json",
				method: 'GET',
				success: function(response) {
					self.getApp().hideloading();
					let objs = response.objects;
					if (Array.isArray(objs) === true && objs.length >0){
						self.model.set(objs[0]);
						self.applyBindings();
						let obj = self.model.toJSON();
						self.loadData(obj);
						self.setHeightTextarea();
						self.registerElementTd();
						self.checkTrangThai();
					}
					else{
						self.model.set({
							"nuoitrong_khaithac_id": nuoitrong_khaithac_id,
							"id_sanpham":id_sanpham,
							"loai_nuoitrong_khaithac":1 // nuôi trồng
						});
						self.applyBindings();
						self.setHeightTextarea();
					}
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
		renderSanpham: function(sanpham){
			var self = this;
			if (!!sanpham){
				let ten_sanpham = sanpham.ten_sanpham;
				let ten_khoa_hoc = sanpham.ten_khoa_hoc;
				let ma_viettat = sanpham.ma_viettat;
				let bophan_sudung = sanpham.bophan_sudung;
				self.$el.find(".ten_sanpham").text(ten_sanpham);
				self.$el.find(".ten_khoa_hoc").text(ten_khoa_hoc);
				self.$el.find(".ma_viettat").text(ma_viettat);
				self.$el.find(".bophan_sudung").text(bophan_sudung);
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
        duyet : function(){
            var self = this;
			let params = {
				id : self.model.get("id")
			}
			self.getApp().showloading();
			$.ajax({
				url: (self.getApp().serviceURL || "") + '/api/v1/duyet_gacp',
				dataType: "json",
				contentType: "application/json",
				method: 'POST',
				data: JSON.stringify(params),
				success: function(response) {
					self.getApp().hideloading();
					self.getApp().notify({message : "Duyệt thành công"});
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
			if (trangthai === 2){
				self.$el.find(".btn-huy-duyet").remove();
				self.$el.find(".btn-delete,.btn-save,.btn-duyet,.btn-mokhoa").removeClass("d-none");
            }
            else if (trangthai ==3){
				self.$el.find("input").prop("disabled", true);
				self.$el.find("textarea,td").attr("style", "pointer-events:none");
				self.$el.find(".btn-delete,.btn-save,.btn-duyet,.btn-mokhoa").remove();
				self.$el.find(".btn-huy-duyet").removeClass("d-none");
			}
			else if (trangthai ===1){
				self.$el.find(".btn-save").removeClass("d-none");
			}
        },
        view : function(){
            var self = this;
			self.$el.find(".btn-delete").remove();
        },
        huyDuyet: function(){
            var self = this;
			let params = {
				id : self.model.get("id")
			}
			self.getApp().showloading();
			$.ajax({
				url: (self.getApp().serviceURL || "") + '/api/v1/huy_gacp',
				dataType: "json",
				contentType: "application/json",
				method: 'POST',
				data: JSON.stringify(params),
				success: function(response) {
					self.getApp().hideloading();
					self.getApp().notify({message : "Hủy duyệt thành công"});
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
		moKhoa : function(){
            var self = this;
			let params = {
				id : self.model.get("id")
			}
			self.getApp().showloading();
			$.ajax({
				url: (self.getApp().serviceURL || "") + '/api/v1/mo_gacp',
				dataType: "json",
				contentType: "application/json",
				method: 'POST',
				data: JSON.stringify(params),
				success: function(response) {
					self.getApp().hideloading();
					self.getApp().notify({message : "Cho phép đơn vị chỉnh sửa GACP thành công"});
					let path = "chitieu_gacp/collection";
					self.getApp().getRouter().navigate(path);
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
		register_event: function(){
			var self = this;
			var fileView = new ManageFileVIew({ viewData: { "listFile": self.model.get('dinhkem_chungnhan'), "$el_btn_upload": self.$el.find(".btn-add-file") }, el: self.$el.find(".list-attachment") });
			fileView.render();
			fileView.on("change", (event) => {
				var listfile = event.data;
				self.model.set('dinhkem_chungnhan', listfile);
			});
		},
	});
});