define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/view/quanlykhaithac/tpl/model.html'),
		schema 				= require('json!schema/KhaiThacTuNhienSchema.json');
	// var KhaiThacChiTiet = require('app/view/quanlykhaithac/KhaiThacChiTietDialog');
	var ManageFileVIew = require("app/view/AttachFile/ManageFileUploadView");
    // var PhieuNhapKho = require('app/view/quanlykhaithac/phieunhapkho/PhieuNhapDialog');
	// var GACP = require('app/view/quanlykhaithac/ModelView_GACP');
	// var ThemDuocLieu = require('app/view/quanlynuoitrong/ThemDuocLieuDialog');
	// var WarningDialog = require('app/quanlykho/PhieuNhap/WarningDialog');
	// var ManageFileUploadView = require('app/view/AttachFile/ManageFileNoTable');


	 
    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
		collectionName: "khaithac_tunhien",
		setDuocLieu: false,
		firstLoad : false,
		setObject : false,
		checkId: false,
		setObjectGACP: false,
		setGACP: false,
		loadGACP: false,
		uiControl: {
            fields: [
				{
					field:"trangthai",
					uicontrol:"combobox",
					textField: "text",
					valueField: "value",
					cssClass:"form-control",
						dataSource: [
							{ value: 1, text: "Tạo mới" },
							{ value: 2, text: "Ươm giống" },
							{ value: 3, text: "Đang nuôi trồng" },
							{ value: 4, text: "Đã thu hoạch" }
						]
                },
                {
					field:"donvi_dientich",
					uicontrol:"combobox",
					textField: "text",
					valueField: "value",
					cssClass:"form-control",
						dataSource: [
							{ value: 1, text: "m2" },
							{ value: 2, text: "hecta (ha)" },
							{ value: 3, text: "km2" },
						]
				},
				{
					field:"mucdich_sudung",
					uicontrol:"combobox",
					textField: "text",
					valueField: "value",
					cssClass:"form-control",
						dataSource: [
							{ value: 1, text: "Tự sản xuất sản phẩm" },
							{ value: 2, text: "Phân phối" },
							{ value: 3, text: "Vừa sản xuất, vừa phân phối" }
						]
				},
				{
					field:"danhgia_noibo",
					uicontrol:"combobox",
					textField: "text",
					valueField: "value",
					cssClass:"form-control",
						dataSource: [
							{ value: 1, text: "Đạt" },
							{ value: 2, text: "Không đạt" },
						]
				},
				{
					field:"donvi_tinh_soluong",
					uicontrol:"combobox",
					textField: "text",
					valueField: "value",
					cssClass:"form-control",
						dataSource: [
							{ value: 1, text: "g" },
							{ value: 2, text: "kg" },
							{ value: 3, text: "tạ" },
							{ value: 4, text: "tấn" }
						]
				},
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
                    field:"thoigian_nhap_kho",
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
    	tools : [
			{
				name: "back",
				type: "button",
				buttonClass: "btn-secondary width-sm",
				label: `<i class="fas fa-arrow-circle-left"></i> Quay lại`,
				command: function(){
					var self = this;
					self.getApp().getRouter().navigate(self.collectionName + "/collection");
					
					// Backbone.history.history.back();
				}
			},
			{
				name: "save",
				type: "button",
				buttonClass: "btn-success width-sm ml-2",
				label: `<i class="far fa-save"></i> Lưu`,
				// visible: function() {
				// 	var tuyendonvi_id = gonrinApp().getTuyenDonVi();
				// 	return gonrinApp().hasRole("admin") ||  tuyendonvi_id=='1';
				// },
				command: function(){
					var self = this;
					var isValidData = self.validateData();
					if(!isValidData){
						return;
					}
					self.getApp().showloading();
					self.model.save(null,{
						success: function (model, respose, options) {
							self.getApp().notify("Lưu thông tin thành công");
							// self.getApp().getRouter().navigate(self.collectionName + "/collection");
							// let id = self.getApp().getRouter().getParam("id");
							// if (!id && self.checkId === false){
							// 	self.model.set(respose);
							// 	self.checkId = true;
							// 	self.$el.find(".toolbar").append(`<button type="button" btn-name="GACP" class="btn btn-primary width-sm btn_gacp_create ml-2">Tiêu chí đánh giá GACP</button>`);
							// 	self.$el.find(".btn_gacp_create").unbind("click").bind("click", ()=>{
							// 		let sanpham = self.model.get("sanpham");
							// 		let params = {
							// 			nuoitrong_khaithac_id : self.model.get("id"),
							// 			id_sanpham : self.model.get("id_sanpham"),
							// 			sanpham : sanpham
							// 		}
							// 		let gacp = new GACP({viewData: params});
							// 		self.$el.find('#content').empty();
							// 		gacp.render();
							// 		self.$el.find('#content').append(gacp.el);
							// 	});
							// }
							// else{
							// 	self.model.set(respose);
							// }
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
				buttonClass: "btn-danger width-sm ml-2",
				label: `<i class="fas fa-trash-alt"></i> Xóa`,
				// visible: function() {
				// 	var tuyendonvi_id = gonrinApp().getTuyenDonVi();
				// 	return gonrinApp().hasRole("admin") ||  tuyendonvi_id=='1';
				// },
				visible: function(){
					return this.getApp().getRouter().getParam("id") !== null;
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
								},
								complete: function(){
									self.getApp().hideloading();
								}
							});
						}
					});
				}
			},
			// {
			// 	name: "gacp-create",
			// 	type: "button",
			// 	buttonClass: "btn-primary width-sm ml-2",
			// 	label: "Tiêu chí đánh giá GACP",
			// 	visible: function(){
			// 		return this.getApp().getRouter().getParam("id") !== null;
			// 	},
			// 	command: function(){
			// 		var self = this;
			// 		let sanpham = self.model.get("sanpham");
			// 		let params = {
			// 			nuoitrong_khaithac_id : self.model.get("id"),
			// 			id_sanpham : self.model.get("id_sanpham"),
			// 			sanpham : sanpham
			// 		}
			// 		let gacp = new GACP({viewData: params});
			// 		self.$el.find('#content').empty();
			// 		gacp.render();
			// 		self.$el.find('#content').append(gacp.el);
			// 	}
			// }
		],
    	render:function(){
			var self = this;
			self.setDuocLieu = false;
			self.firstLoad = false;
			self.setObject = false;
			self.checkId = false;
			self.setObjectGACP = false;
			self.loadGACP = false;
			self.setGACP = false;
    		var id = this.getApp().getRouter().getParam("id");
    		if(id){
    			//progresbar quay quay
    			this.model.set('id',id);
        		this.model.fetch({
        			success: function(data){
						self.checkId = true;
						self.applyBindings();
						self.addDuoclieu();
						self.selectizeDuoclieu();    
						self.selectizeGACP();
						self.register();	
						self.renderCheckbox();
						self.getPhieuNhap(id);
						// var tuyendonvi_id = gonrinApp().getTuyenDonVi();
						// if(!gonrinApp().hasRole("admin") && tuyendonvi_id != '1'){
						// 	self.$el.find("input").css("pointer-events","none");
						// 	self.$el.find("textarea").css("pointer-events","none");
                        //     self.$el.find("#pointer-selectize").css("pointer-events","none");
						// }
        			},
        			error:function(){
    					self.getApp().notify("Get data Eror");
                    },
                    complete : function(){
						let mota_qtrinh_khaithac = self.model.get("mota_qtrinh_khaithac");
						if (Array.isArray(mota_qtrinh_khaithac) === false){
							mota_qtrinh_khaithac = [];
						}
						mota_qtrinh_khaithac.sort(function(a,b){
							return (a.thoigian) - (b.thoigian);
						})
						let len = mota_qtrinh_khaithac.length;
						for (let i=0; i< len; i++){
							self.appendKhaiThac(mota_qtrinh_khaithac[i]);
						}
                    }
        		});
    		}else{
				self.selectizeDuoclieu();    
				self.register();	
				self.addDuoclieu();
				self.selectizeGACP();
                self.applyBindings();
			}
		},
		validateData: function(){
			var self = this;
            let ten_sanpham = self.model.get("ten_sanpham");
            if (ten_sanpham === undefined || ten_sanpham === null || ten_sanpham === ""){
                self.getApp().notify({message : 'Vui lòng nhập tên dược liệu'}, {type : "danger", delay : 1000});
                return false;
            }
            let dientich_khaithac = self.model.get("dientich_khaithac");
            if (dientich_khaithac === undefined || dientich_khaithac === null){
                self.getApp().notify({message: "Vui lòng nhập diện tích khai thác"}, {type : "danger", delay : 1000});
                return false;
            }
            let donvi_dientich = self.model.get("donvi_dientich");
            if (donvi_dientich === undefined || donvi_dientich === null){
                self.getApp().notify({message : "Vui lòng nhập đơn vị diện tích"}, {type : "danger", delay : 1000});
                return false;
            }
			return true;
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
								let trangthai = self.model.get("trangthai");
								if (trangthai === 5){
									// đã tạo phiếu nhập
									$selectz.selectize.disable();
								}
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
                                "sanpham": obj
                            });
                        } else {
                            // sự kiện khi update phiếu, set data vật tư lần đầu
                            self.firstLoad = true;
						}
						self.$el.find(".ma_viet_tat").text(obj.ma_viettat);
						self.$el.find(".ten_khoa_hoc").text(obj.ten_khoa_hoc);
						if (!!obj.bophan_sudung){
							self.$el.find(".bo_phan_su_dung").text(obj.bophan_sudung)
						}
					}
					else{
						self.model.set({
							"ten_sanpham": null,
							"ten_khoa_hoc": null,
							"ma_sanpham": null,
							"id_sanpham":null,
							"sanpham": null
						});
						self.$el.find(".ma_viet_tat").text("");
						self.$el.find(".ten_khoa_hoc").text("");						
						self.$el.find(".bo_phan_su_dung").text("");
					}
                }
            });
		},
		register: function(){
			var self = this;
			self.$el.find("#co_giay_phep").on("change", () =>{
				let value = self.$el.find("#co_giay_phep").prop("checked");
				if (value === true){
					self.model.set("co_giay_phep", 1);
				}
				else{
					self.model.set("co_giay_phep", 0);
				}
			});
			self.$el.find(".btn-add-khaithac").unbind("click").bind("click", () =>{
				self.dialogKhaiThac();
			});
			let id_sanpham = self.model.get("id_sanpham");
			let id = self.model.get("id");
			if (!!id_sanpham && !!id){
				let sanpham = self.model.get("sanpham");
				let ten_sanpham = self.model.get("ten_sanpham");
				let ma_sanpham = self.model.get("ma_sanpham");
				let params = {
					id_sanpham,
					sanpham,
					ma_sanpham,
					ten_sanpham,
					thuhoach_khaithac_id : id
				}
				self.$el.find(".btn-add-phieunhap").unbind("click").bind("click", ()=>{
					self.dialogPhieuNhap(params);
				});
			}

			var fileView1 = new ManageFileVIew({ viewData: { "listFile": self.model.get('dinhkem_giayphep'), "$el_btn_upload": self.$el.find(".btn-add-file-giayphep") }, el: self.$el.find(".list-attachment-giayphep") });
			fileView1.render();
			fileView1.on("change", (event) => {
				var listfile = event.data;
				self.model.set('dinhkem_giayphep', listfile);
			});
			var fileView2 = new ManageFileVIew({ viewData: { "listFile": self.model.get('dinhkem_kehoach_khaithac'), "$el_btn_upload": self.$el.find(".btn-add-file-kehoach") }, el: self.$el.find(".list-attachment-kehoach") });
			fileView2.render();
			fileView2.on("change", (event) => {
				var listfile = event.data;
				self.model.set('dinhkem_kehoach_khaithac', listfile);
			});
			var fileView3 = new ManageFileVIew({ viewData: { "listFile": self.model.get('dinhkem_chungnhan_kiemnghiem'), "$el_btn_upload": self.$el.find(".btn-add-file-kiemnghiem") }, el: self.$el.find(".list-attachment-kiemnghiem") });
			fileView3.render();
			fileView3.on("change", (event) => {
				var listfile = event.data;
				self.model.set('dinhkem_chungnhan_kiemnghiem', listfile);
			});
			var fileView4 = new ManageFileVIew({ viewData: { "listFile": self.model.get('dinhkem_danhgia_noibo'), "$el_btn_upload": self.$el.find(".btn-add-file-danhgia") }, el: self.$el.find(".list-attachment-danhgia") });
			fileView4.render();
			fileView4.on("change", (event) => {
				var listfile = event.data;
				self.model.set('dinhkem_danhgia_noibo', listfile);
			});
		},
		renderCheckbox : function(){
			var self = this;
			let co_xuat_xu = self.model.get("co_giay_phep");
			if (co_xuat_xu ===1){
				self.$el.find("#co_giay_phep").prop("checked", true);
			}
		},
		appendKhaiThac : function(data){
			var self = this;
			if (!!data){
				let text_thoigian = gonrinApp().parseInputDateString(data.thoigian).format("DD/MM/YYYY");
				let text_chatluong = "";
				if (data.chatluong == 1){
					text_chatluong = "Kém";
				}
				else if (data.chatluong == 2){
					text_chatluong = "Bình thường";
				}
				else if (data.chatluong === 3){
					text_chatluong = "Tốt";
				}
				else{
					text_chatluong = "";
				}
				let vitri = data.vitri;
				let text_vitri = "";
				if (!!vitri){
					text_vitri = vitri.ten_diadiem;
				}
				self.$el.find(".khaithac").append(`
					<li id="${data.id}">
						<div class="row">
							<div class="col-md-7 col-12">
								<h4 class="thoigian">${text_thoigian}</h4>
								<div class="pt-2">
									<label class="soluong"> <span class="text-primary">Sản lượng khai thác</span>: <strong>${data.soluong} (Kg)</strong></label>
                                </div>
                                <div class="">
                                    <label class="vitri"> <span class="text-primary">Vị trí khai thác</span>: <strong>${text_vitri}</strong></label>
                                </div>
								<div class="">
									<label class="mota"><span class="text-primary">Mô tả</span>: <strong>${data.mota}</strong></label>
								</div>
								<div class="">
									<label class="chatluong"> <span class="text-primary">Chất lượng dược liệu</span>: <strong>${text_chatluong}</strong></label>
								</div>
								<div class=pt-1 timeline-button">
									<button type="button" class="btn btn-primary btn-sm btn-chitiet">Xem chi tiết</button>
								</div>
							</div>
							<div class="col-md-5 col-12">
								<h5>Danh sách hình ảnh, video trong quá trình khai thác</h5>
								<div class="table-responsive  w-80 list-images d-flex">
								</div>
							</div>
						</div>
						<hr>
					</li>
				`);
				let hinhanh = data.hinhanh;
				var fileView = new ManageFileUploadView({ viewData: { "listFile": hinhanh, "$el_btn_upload": "" }, el: self.$el.find(`#${data.id} .list-images`) });
				fileView.render();
				fileView.on("change", (event) => {
					var listfile = event.data;
					data.hinhanh = listfile;
					let mota_qtrinh_khaithac = self.model.get("mota_qtrinh_khaithac");
					if (mota_qtrinh_khaithac === undefined || mota_qtrinh_khaithac === null){
						mota_qtrinh_khaithac = [];
					}
					let arr = mota_qtrinh_khaithac.filter((value)=>{
						return value.id !== data.id;
					});
					arr.push(data);
                    self.model.set('mota_qtrinh_khaithac', arr);
				});
				self.$el.find(`#${data.id} .btn-chitiet`).unbind("click").bind("click", {data : data}, (event) =>{
					if (!!event.data.data){
						let data = event.data.data;
						self.dialogKhaiThac(data);
					}
				});

			}
		},
		onSaveKhaiThac : function(data){
            var self = this;
            if (!!data){
                let mota_qtrinh_khaithac = self.model.get("mota_qtrinh_khaithac");
                if (mota_qtrinh_khaithac === undefined || mota_qtrinh_khaithac === null){
                    mota_qtrinh_khaithac = [];
                }
                let check = mota_qtrinh_khaithac.some((value, index) =>{
                    return value.id === data.id;
                });
                if (check === false){
                    mota_qtrinh_khaithac.push(data);
                    self.appendKhaiThac(data);
                    self.model.set('mota_qtrinh_khaithac', mota_qtrinh_khaithac);
                }
                else{
					let elt = self.$el.find(`#${data.id}`);
					let text_thoigian = gonrinApp().parseInputDateString(data.thoigian).format("DD/MM/YYYY");

					let text_chatluong = "";
					if (data.chatluong == 1){
						text_chatluong = "Kém";
					}
					else if (data.chatluong == 2){
						text_chatluong = "Bình thường";
					}
					else if (data.chatluong === 3){
						text_chatluong = "Tốt";
					}
					else{
						text_chatluong = "";
					}
					let vitri = data.vitri;
					let text_vitri = "";
					if (!!vitri){
						text_vitri = vitri.ten_diadiem;
					}
					let hinhanh = data.hinhanh;
					var fileView = new ManageFileUploadView({ viewData: { "listFile": hinhanh, "$el_btn_upload": ""}, el: self.$el.find(`#${data.id} .list-images`) });
					fileView.render();
					fileView.on("change", (event) => {
						var listfile = event.data;
						data.hinhanh = listfile;
						let mota_qtrinh_khaithac = self.model.get("mota_qtrinh_khaithac");
						if (mota_qtrinh_khaithac === undefined || mota_qtrinh_khaithac === null){
							mota_qtrinh_khaithac = [];
						}
						let arr = mota_qtrinh_khaithac.filter((value)=>{
							return value.id !== data.id;
						});
						arr.push(data);
						self.model.set('mota_qtrinh_khaithac', arr);
					});
					elt.find('.thoigian').text(text_thoigian);
					elt.find('.soluong strong').text(data.soluong);
                    elt.find('.vitri strong').text(text_vitri);
					elt.find('.mota strong').text(data.mota);
					elt.find('.chatluong strong').text(text_chatluong);
                    let arr = mota_qtrinh_khaithac.filter((value, index) =>{
                        return value.id !== data.id;
                    });
                    arr.push(data);
					self.model.set('mota_qtrinh_khaithac', arr);
					self.$el.find(`#${data.id} .btn-chitiet`).unbind("click").bind("click", {data : data}, (event) =>{
						if (!!event.data.data){
							let data = event.data.data;
							self.dialogKhaiThac(data);
						}
					})
                }
            }

		},
		dialogKhaiThac : function(data = null){
            var self = this;
			let khaiThacchiTiet = new KhaiThacChiTiet({viewData : data});
			khaiThacchiTiet.dialog({size : "large"});
			khaiThacchiTiet.on("saveData", (event) =>{
				let datas = event.data;
				self.onSaveKhaiThac(datas);
			});
		},
		getPhieuNhap : function(thuhoach_khaithac_id){
			var self = this;
			let query_filter ={"filters" : {"$and":[
				{"thuhoach_khaithac_id" : {"$eq" : thuhoach_khaithac_id}},
				{"deleted": {"$eq": false}}
			]} }  
			$.ajax({
				url: (self.getApp().serviceURL || "") + `/api/v1/phieunhapkho?results_per_page=20` + (query_filter? "&q=" + JSON.stringify(query_filter): ""),
				dataType: "json",
				contentType: "application/json",
				method: 'GET',
				success: function(response) {
					self.getApp().hideloading();
					let arrPhieuNhap = response.objects;
					let arrPhieuNhapChitiet = [];
					const length = arrPhieuNhap.length;
					for (let i=0; i<length; i++){
						//get danh sach phieu nhap chi tiet chua xoa
						let arrPhieuNhapChitietChuaXoa = [];
						let chitiet_sanpham = arrPhieuNhap[i].chitiet_sanpham;
						if (Array.isArray(chitiet_sanpham) === false){
							chitiet_sanpham = [];
						}
						arrPhieuNhapChitietChuaXoa = chitiet_sanpham.filter((value) =>{
							return value.deleted === false;
						})
						arrPhieuNhapChitiet = arrPhieuNhapChitiet.concat(arrPhieuNhapChitietChuaXoa);
					}
					const len = arrPhieuNhapChitiet.length;
					for (let j=0; j<len; j++){
						self.appendPhieuNhap(arrPhieuNhapChitiet[j]);
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
		appendPhieuNhap : function(data){
			var self = this;
			if (!!data){
				self.$el.find(".table-phieunhap").removeClass("d-none");
				let text_thoigian = gonrinApp().parseInputDateString(data.thoigian_nhap).format("DD/MM/YYYY");
				let text_donvitinh = data.donvitinh;
				if (text_donvitinh === "" || text_donvitinh === undefined || text_donvitinh === null){
					text_donvitinh = "Kg";
				}
				self.$el.find(`#gird-phieunhap`).append(`
					<tr id="${data.id}">
						<td class="so_phieu">${data.so_phieu?data.so_phieu: ""}</td>
						<td>${data.ten_sanpham}</td>
						<td class="so_lo text-right">${data.so_lo}</td>
						<td class="donvitinh">${text_donvitinh}</td>
						<td class="text-right soluong_thucte">${data.soluong_thucte}</td>
						<td class="thoigian_nhap text-right">${text_thoigian}</td>
						<td class="ten_kho">${data.ten_kho}</td>
						<td>
							<a  href="javascript:;"  class="demo-edit-row btn btn-success btn-xs btn-icon" title="Sửa"><i class="mdi mdi-pencil"></i></a>
							<a href="javascript:;" class="demo-delete-row btn btn-danger btn-xs btn-icon" title="Xóa"><i class="fa fa-times"></i></a>
						</td>
					</tr>
				`);
				self.$el.find(`#${data.id} .demo-edit-row`).unbind("click").bind("click", {data : data}, (event) =>{
					if (event.data.data){
						let phieunhap_chitiet = event.data.data;
						let phieunhap_id = phieunhap_chitiet.phieunhap_id;
						phieunhap_chitiet ={
							...phieunhap_chitiet,
							id : phieunhap_id
						}
						let id_sanpham = self.model.get("id_sanpham");
						let sanpham = self.model.get("sanpham");
						let ten_sanpham = self.model.get("ten_sanpham");
						let ma_sanpham = self.model.get("ma_sanpham");
						let id = self.model.get("id");
						let params = {
							phieunhap_chitiet, 
							id_sanpham,
							sanpham,
							ten_sanpham,
							ma_sanpham,
							thuhoach_khaithac_id: id
						}
						self.dialogPhieuNhap(params, true);
					}
				});

				self.$el.find(`#${data.id} .demo-delete-row`).unbind("click").bind("click", {data:data}, (event)=>{
					if (!!event.data.data){
						let phieunhap_chitiet = event.data.data;
						let phieunhap_id = phieunhap_chitiet.phieunhap_id;
						let url = (self.getApp().serviceURL || "") + '/api/v2/phieunhapkho/' + phieunhap_id;
						$.ajax({
							url: url,
							type: 'DELETE',
							headers: {
								'content-type': 'application/json',
								'Access-Control-Allow-Origin': '*'
							},
							success: function (response) {
								if (!!response && !!response.error_code && response.error_code == "UPDATE_ERROR") {
									response.type = 'DELETE';
									var warningDialog = new WarningDialog({ "viewData": response });
									warningDialog.dialog({ size: "large" });
								} else {
									self.getApp().notify('Xoá dữ liệu thành công');
									self.$el.find(`#${phieunhap_chitiet.id}`).remove();
								}
							},
							error: function (xhr, status, error) {
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
					}
				})	
			}
		},
		onSavePhieuNhap : function(data, mode = false){
			var self = this;
			if (!!data){
				//tạo mới
				if (mode=== false){
                    self.appendPhieuNhap(data);
				}
				else{
					let elt = self.$el.find(`#${data.id}`);
					let text_thoigian = gonrinApp().parseInputDateString(data.thoigian_nhap).format("DD/MM/YYYY");
					elt.find(".so_phieu").text(data.so_phieu);
					elt.find(".thoigian_nhap").text(text_thoigian);
					elt.find(".ten_kho").text(data.ten_kho);
					elt.find(".so_lo").text(data.so_lo);
					elt.find(".soluong_thucte").text(data.soluong_thucte);
					self.$el.find(`#${data.id} .demo-edit-row`).unbind("click").bind("click", {data : data}, (event) =>{
						if (event.data.data){
							let phieunhap_chitiet = event.data.data;
							let phieunhap_id = phieunhap_chitiet.phieunhap_id;
							phieunhap_chitiet ={
								...phieunhap_chitiet,
								id : phieunhap_id
							}
							let id_sanpham = self.model.get("id_sanpham");
							let sanpham = self.model.get("sanpham");
							let ten_sanpham = self.model.get("ten_sanpham");
							let ma_sanpham = self.model.get("ma_sanpham");
							let id = self.model.get("id");
							let params = {
								phieunhap_chitiet, 
								id_sanpham,
								sanpham,
								ten_sanpham,
								ma_sanpham,
								thuhoach_khaithac_id: id
							}
							self.dialogPhieuNhap(params, true);
						}
					});
				}
			}
		},
		dialogPhieuNhap : function(data = null, mode = false){
			var self = this;
			let phieuNhapKho = new PhieuNhapKho({viewData : data});
			phieuNhapKho.dialog({size : "large"});
			phieuNhapKho.on("saveData", (event) =>{
				let data = event.data;
				self.onSavePhieuNhap(data, mode);
			});
		},
		addDuoclieu: function(){
			var self = this;
			self.$el.find(".btn-add-duoclieu").unbind("click").bind("click", ()=>{
				let themDuocLieu = new ThemDuocLieu();
				themDuocLieu.dialog();
				themDuocLieu.on("saveData", (e)=>{
					let data = e.data;
					if (!!data){
						self.model.set({
							"ten_sanpham": data.ten_sanpham,
							"ten_khoa_hoc": data.ten_khoa_hoc,
							"ma_sanpham": data.ma_sanpham,
							"id_sanpham":data.id_sanpham,
							"sanpham": data.sanpham
						});
						let select = (self.$el.find("#sanpham"))[0];
						if (!!select && !!select.selectize){
							select.selectize.destroy();
							self.setObject = false;
							self.setDuocLieu = false;
							self.selectizeDuoclieu();
						}
					}
				});
			});
		},
		selectizeGACP: function(){
			var self = this;
            var $selectize = self.$el.find('#chungnhangacp').selectize({
                valueField: 'id',
                labelField: 'so_giay_chungnhan',
                searchField: ['so_giay_chungnhan', 'ten_sanpham', 'ten_khoa_hoc','tenkhongdau'],
				preload: true,
				render: {
					option: function (item, escape) {
						return `<div class="option">${item.so_giay_chungnhan}</div>`;
					}
				},
                load: function(query, callback) {
                    var query_filter = {"filters": {"$or": [
                        { "ten_sanpham": { "$likeI": (query) } },
                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
						{ "ten_khoa_hoc": { "$likeI": (query) } },
						{ "so_giay_chungnhan": {"$eq":  gonrinApp().convert_khongdau(query) }}
                        ]}
					};
					let chungnhangacp = self.model.get("chungnhangacp");
					if (!!chungnhangacp && self.setObjectGACP === false){
						callback([chungnhangacp]);
						self.setObjectGACP = true;
					}
                    var url = (self.getApp().serviceURL || "") + '/api/v1/chungnhangacp?results_per_page=20' + (query_filter? "&q=" + JSON.stringify(query_filter): "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            callback(res.objects);
                            var chungnhangacp_id = self.model.get("chungnhangacp_id");
                            if (self.setGACP === false && !!chungnhangacp_id) {
                                var $selectz = (self.$el.find('#chungnhangacp'))[0];
								$selectz.selectize.setValue([chungnhangacp_id]);
								self.setGACP = true;
								let trangthai = self.model.get("trangthai");
								if (trangthai === 5){
									// đã tạo phiếu nhập
									$selectz.selectize.disable();
								}
                            }
                        }
                    });  

                },
                onChange: function(value, isOnInitialize) {
                    var $selectz = (self.$el.find('#chungnhangacp'))[0];
                    var obj = $selectz.selectize.options[value];
                    if (obj !== null && obj !== undefined) {
                        var id = self.model.get("id");
                        if (self.loadGACP === true || !id) {
                            // logic: nếu phiếu đó chưa có id - phiếu tạo mới thì set data vật tư
                            // k tính sự kiện onchange khi set data vật tư lần đầu	
                            self.model.set({
								"chungnhangacp_id": value
                            });
                        } else {
							// sự kiện khi update phiếu, set data vật tư lần đầu
							let chungnhangacp_id = self.model.get("chungnhangacp_id");
							if (!chungnhangacp_id){
								self.model.set({
									"chungnhangacp_id": value
								});
							}
                            self.loadGACP = true;
						}
						if  (!!obj.ten_sanpham){
							self.$el.find(".ten_sanpham").text(obj.ten_sanpham);
						}
						if (!!obj.thoigian_batdau_hieuluc){
							let text = gonrinApp().parseInputDateString(obj.thoigian_batdau_hieuluc).format("DD/MM/YYYY");
							self.$el.find(".thoigian_batdau_hieuluc").text(text);
						}
						if (!!obj.thoigian_ketthuc_hieuluc){
							let text = gonrinApp().parseInputDateString(obj.thoigian_ketthuc_hieuluc).format("DD/MM/YYYY");
							self.$el.find(".thoigian_ketthuc_hieuluc").text(text);
						}
					}
					else{
						self.model.set({
							"chungnhangacp_id": null
						});
					}
                }
            });
		}
    });

});