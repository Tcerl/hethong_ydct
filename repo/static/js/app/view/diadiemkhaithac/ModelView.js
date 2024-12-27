define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/view/diadiemkhaithac/tpl/model.html'),
        schema 				= require('json!schema/DiaDiemNuoiTrongKhaiThacSchema.json');
	var ManageFileVIew = require("app/view/AttachFile/ManageFileUploadView");
        
    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
		collectionName: "nuoitrong_khaithac",
		flagReset: true,
		uiControl: {
            fields: [
                {
                    field:"thoigian_batdau_khaithac",
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
                    field:"thoigian_ketthuc_khaithac",
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
                    field:"donvitinh_dientich",
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
    	tools : [
			{
				name: "back",
				type: "button",
				buttonClass: "btn-secondary waves-effect width-sm",
				label: `<i class="fas fa-arrow-circle-left"></i> Quay lại`,
				command: function(){
					var self = this;
					
					Backbone.history.history.back();
				}
			},
			{
				name: "save",
				type: "button",
				buttonClass: "btn-success width-sm ml-2",
				label: `<i class="far fa-save"></i> Lưu`,
                // visible: function() {
                //     var tuyendonvi_id = gonrinApp().getTuyenDonVi();
                //     return gonrinApp().hasRole("admin") ||  tuyendonvi_id=='1';
                // },
				command: function(){
					var self = this;
					var isValidData = self.validateData();
					if(!isValidData){
						return;
                    }
                    self.model.set("loai_diadiem", 2);
					self.model.save(null,{
						success: function (model, respose, options) {
							self.getApp().notify("Lưu thông tin thành công");
                            // self.getApp().getRouter().navigate(self.collectionName + "/collection");
                            let path = 'diadiem_khaithac/collection'
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
			},
			{
				name: "delete",
				type: "button",
				buttonClass: "btn-danger width-sm ml-2",
				label: `<i class="fas fa-trash-alt"></i> Xóa`,
                visible: function() {
                    var tuyendonvi_id = gonrinApp().getTuyenDonVi();
                    return gonrinApp().hasRole("admin") ||  tuyendonvi_id=='1';
                },
				// visible: function(){
				// 	return this.getApp().getRouter().getParam("id") !== null;
				// },
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
                                    // self.getApp().getRouter().navigate(self.collectionName + "/collection");
                                    let path = 'diadiem_khaithac/collection'
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
                                        self.getApp().notify({ message: "Xóa thông tin không thành công"}, { type: "danger", delay: 1000 });
                                    }
                                }
                            });
                        }
                    });

				}
			},
		],
    	render:function(){
    		var self = this;
    		var id = this.getApp().getRouter().getParam("id");
    		if(id){
    			//progresbar quay quay
    			this.model.set('id',id);
        		this.model.fetch({
        			success: function(data){
                        gonrinApp().selectizeTinhThanhQuanHuyenXaPhuong(self);
                        self.applyBindings();
                        // var tuyendonvi_id = gonrinApp().getTuyenDonVi();
                        // if(!gonrinApp().hasRole("admin") && tuyendonvi_id != '1'){
						// 	self.$el.find("input").css("pointer-events","none");
						// 	self.$el.find("textarea").css("pointer-events","none");
                        //     self.$el.find("#pointer-selectize").css("pointer-events","none");
						// 	// self.$el.find("button").hide();
						// }
        			},
        			error:function(){
    					self.getApp().notify("Get data Eror");
                    },
                    complete : function(){
                        var fileView1 = new ManageFileVIew({ viewData: { "listFile": self.model.get('chungtu_xacnhan'), "$el_btn_upload": self.$el.find(".btn-add-file") }, el: self.$el.find(".list-attachment") });
                        fileView1.render();
                        fileView1.on("change", (event) => {
                            let listfile = event.data;
                            self.model.set('chungtu_xacnhan', listfile);
                        });
                        var fileView2 = new ManageFileVIew({ viewData: { "listFile": self.model.get('giayphep_khaithac'), "$el_btn_upload": self.$el.find(".btn-add-file-khaithac") }, el: self.$el.find(".list-attachment-khaithac") });
                        fileView2.render();
                        fileView2.on("change", (event) => {
                            let listfile = event.data;
                            self.model.set('giayphep_khaithac', listfile);
                        });
                        var fileView3 = new ManageFileVIew({ viewData: { "listFile": self.model.get('dinhkem_chungnhan_vungtrong'), "$el_btn_upload": self.$el.find(".btn-add-file-nuoitrong") }, el: self.$el.find(".list-attachment-nuoitrong") });
                        fileView3.render();
                        fileView3.on("change", (event) => {
                            let listfile = event.data;
                            self.model.set('dinhkem_chungnhan_vungtrong', listfile);
                        });
                    }
        		});
    		}else{
                self.applyBindings();
                self.model.set("donvitinh_dientich", 1);//m2
                var fileView1 = new ManageFileVIew({ viewData: { "listFile": self.model.get('chungtu_xacnhan'), "$el_btn_upload": self.$el.find(".btn-add-file") }, el: self.$el.find(".list-attachment") });
                fileView1.render();
                fileView1.on("change", (event) => {
                    let listfile = event.data;
                    self.model.set('chungtu_xacnhan', listfile);
                });
                var fileView2 = new ManageFileVIew({ viewData: { "listFile": self.model.get('giayphep_khaithac'), "$el_btn_upload": self.$el.find(".btn-add-file-khaithac") }, el: self.$el.find(".list-attachment-khaithac") });
                fileView2.render();
                fileView2.on("change", (event) => {
                    let listfile = event.data;
                    self.model.set('giayphep_khaithac', listfile);
                });
                var fileView3 = new ManageFileVIew({ viewData: { "listFile": self.model.get('dinhkem_chungnhan_vungtrong'), "$el_btn_upload": self.$el.find(".btn-add-file-nuoitrong") }, el: self.$el.find(".list-attachment-nuoitrong") });
                fileView3.render();
                fileView3.on("change", (event) => {
                    let listfile = event.data;
                    self.model.set('dinhkem_chungnhan_vungtrong', listfile);
                });
                gonrinApp().selectizeTinhThanhQuanHuyenXaPhuong(self);
			}
            
    		
		},
		validateData: function(){
			var self = this;
            let ten_diadiem = self.model.get("ten_diadiem");
            if (ten_diadiem === undefined || ten_diadiem === null || ten_diadiem === ""){
                self.getApp().notify({message : 'Vui lòng nhập tên địa điểm'}, {type : "danger", delay : 1000});
                return false;
            }
            let currentUser = self.getApp().currentUser;
            let loai_donvi = "";
            if (!!currentUser && !!currentUser.donvi){
                loai_donvi = currentUser.donvi.loai_donvi;
            }
           
            let thoigian_batdau_khaithac = self.model.get("thoigian_batdau_khaithac");
            if (thoigian_batdau_khaithac === undefined || thoigian_batdau_khaithac === null || thoigian_batdau_khaithac === ""){
                self.getApp().notify({message : "Vui lòng nhập thời gian bắt đầu khai thác"}, {type : 'danger', delay : 1000});
                return false
            }
            
            let dientich = self.model.get("dien_tich");
            if (dientich === undefined || dientich === null || dientich === ""){
                self.getApp().notify({message : "Vui lòng nhập diện tích địa điểm nuôi trồng, khai thác"}, {type : 'danger', delay : 1000});
                return false
            }
            let donvitinh_dientich = self.model.get("donvitinh_dientich");
            if (donvitinh_dientich === undefined || donvitinh_dientich === null || donvitinh_dientich === ""){
                self.getApp().notify({message : "Vui lòng nhập đơn vị diện tích địa điểm nuôi trồng, khai thác"}, {type : 'danger', delay : 1000});
                return false
            }

            let tinhthanh = self.model.get("tinhthanh");
            let quanhuyen = self.model.get("quanhuyen");
            let xaphuong = self.model.get("xaphuong");

            if (tinhthanh === undefined || tinhthanh === null){
                self.getApp().notify({message: "Vui lòng nhập tỉnh thành"}, {type: "danger", delay : 1000});
                return false;
            }

            if (quanhuyen  ===undefined || quanhuyen === null){
                self.getApp().notify({message: "Vui lòng nhập thông tin quận huyện"}, {type:"danger", delay : 1000});
                return false;
            }

            if (xaphuong === undefined || xaphuong === null){
                self.getApp().notify({message:"Vui lòng nhập xã phường"}, {type:"danger", delay : 1000});
                return false;
            }

			return true;
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
    });

});