define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/quanly_thuongmai_dientu/SanPhamViPham/tpl/model.html'),
    	schema 				= require('json!schema/SanPhamViPhamDonViSchema.json');
	var RejectDialogView = require('app/bases/RejectDialogView');

    return Gonrin.ModelDialogView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "sanpham_vipham_donvi",
    	tools : [
			{
				name: "back",
				type: "button",
				buttonClass: "btn-secondary waves-effect width-sm",
				label: `<i class="fas fa-times-circle"></i> Đóng`,
				command: function() {
					var self = this;
					self.close();
				}
			},
			{
				name: "save",
				type: "button",
				buttonClass: "btn-success width-sm ml-2",
				label:  `<i class="far fa-save"></i> Lưu`,
				visible: function() {
                    var currentUser = gonrinApp().currentUser;
                    return (!!currentUser && !!currentUser.donvi && currentUser.donvi.tuyendonvi_id == '3');
                },
				command: function(){
					var self = this;
					var isValidData = self.validateData();
					if(!isValidData){
						return;
					}
					self.getApp().showloading();
					self.model.save(null,{
						success: function (model, respose, options) {
							self.getApp().hideloading();
							self.getApp().notify("Lưu thông tin thành công");
							self.trigger("saveData");
                        	self.close();
						},
						error: function(xhr, status, error) {
							self.getApp().hideloading();
							try {
								if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED"){
									self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
									self.getApp().getRouter().navigate("login");
								} 
								else {
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
					var currentUser = gonrinApp().currentUser;
					var self = this;
                    return (!!self.viewData && self.viewData.id && !!currentUser && !!currentUser.donvi && currentUser.donvi.tuyendonvi_id == '3');
                },
				command: function() {
					var self = this;
					var view = new RejectDialogView({ viewData: { "text": "Bạn có chắc chắn muốn xóa bản ghi này không?" } });
					view.dialog();
					view.on("confirm", (e) => {
						self.getApp().showloading();
						self.model.destroy({
							success: function(model, response) {
								self.getApp().hideloading();
								self.getApp().notify('Xoá dữ liệu thành công');
								self.trigger("saveData");
                        		self.close();
							},
							error: function(xhr, status, error) {
								self.getApp().hideloading();
								try {
									if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED"){
										self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
										self.getApp().getRouter().navigate("login");
									} 
									else {
										self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
									}
								}
								catch (err) {
									self.getApp().notify({ message: "Xóa thông tin không thành công"}, { type: "danger", delay: 1000 });
								}
							}
						});
					});
				}
			},
		],
		uiControl: {
            fields: [
				{
                    field: "thoigian_vipham",
                    uicontrol: "datetimepicker",
                    format: "DD/MM/YYYY",
                    textFormat: "DD/MM/YYYY",
                    extraFormats: ["DDMMYYYY"],
                    parseInputDate: function (val) {
                        return gonrinApp().parseInputDateString(val);
                    },
                    parseOutputDate: function (date) {
                        return gonrinApp().parseOutputDateString(date, "YYYYMMDD");
                    },
                    disabledComponentButton: true,
                },
            ]
        },
    	render: function() {
    		var self = this;
    		var id = !!self.viewData ? self.viewData.id : null;
    		if (id) {
    			this.model.set('id',id);
        		this.model.fetch({
        			success: function(data) {
        				self.applyBindings();
						self.selectizeSanPhamViPham(self);
        			},
        			error: function() {
    					self.getApp().notify({ message: "Có lỗi xảy ra, vui lòng thử lại sau"}, { type: "danger", delay: 1000 });
    				},
        		});
    		}
			else {
    			self.applyBindings();
				self.selectizeSanPhamViPham(self);
    		}
		},
		validateData: function() {
			var self = this;
			var id_sanpham = self.model.get('id_sanpham'),
				id_donvi_cungung = self.model.get('id_nhacungcap');
			if (!id_donvi_cungung) {
				self.getApp().notify({ message: "Vui lòng chọn nhà cung cấp"}, { type: "danger", delay: 1000 });
				return false;
			}
			if (!id_sanpham) {
				self.getApp().notify({ message: "Vui lòng chọn sản phẩm"}, { type: "danger", delay: 1000 });
				return false;
			}
			return true;
		},
		selectizeSanPhamViPham: function(self, disable_nhacungcap=false, disable_sanpham=false, nhacungcap_selector='#selectize_donvi_cungung', sanpham_selector='#selectize_sanpham', id_nhacungcap='id_nhacungcap', id_sanpham="id_sanpham", nhacungcap_object="thongtin_nhacungcap", sanpham_object="thongtin_sanpham"){
			var set_NhaCungCap = false,
				set_SanPham = false;
			function controlSelectize(){
				if(self.model.get(id_nhacungcap)){
					self.$el.find(sanpham_selector)[0].selectize.enable();
				} else{
					self.$el.find(sanpham_selector)[0].selectize.disable();
				}

				if(disable_nhacungcap){
					self.$el.find(nhacungcap_selector)[0].selectize.disable();
				}
				if(disable_sanpham){
					self.$el.find(sanpham_selector)[0].selectize.disable();
				}
			};
			function loadNhaCungCap(query = '', callback){
				if (set_NhaCungCap == false && !!self.model.get(id_nhacungcap)) {
                    callback([self.model.get(nhacungcap_object)]);
                    self.$el.find(nhacungcap_selector)[0].selectize.setValue(self.model.get(id_nhacungcap));
                    var objects = self.$el.find(nhacungcap_selector)[0].selectize.options[self.model.get(id_nhacungcap)];
                    if (!!objects) delete objects.$order;
					set_NhaCungCap = true;
                }
                var arr_filters = [
                    {'deleted': {'$eq': false}},
                ];
                if(!!query){
                    arr_filters.push({ "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } });                             
                }
				var query_filter = {
					"filters": {
						"$and": [
							{ "donvi_id": { "$likeI": gonrinApp().convert_khongdau(gonrinApp().currentUser.donvi_id) } },
							{"$and": arr_filters}
						],
						"order_by": [{ "field": "donvi_id", "direction": "asc" }]
					}
				};
				var queryString = (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
                
                var url =
                    (self.getApp().serviceURL || "") + "/api/v2/donvi_cungung?results_per_page=100" + queryString;
                $.ajax({
                    url: url,
                    type: "GET",
                    dataType: "json",
                    success: function(response) {
                        callback(response.objects);
                    },
                    error: function() {
                        callback();
                    },
                });
			};
			function loadSanPham(query='', callback) {
				var selectedNhacungcapId = self.model.get(id_nhacungcap);
				if (set_SanPham == false && !!self.model.get(id_sanpham)) {
                    callback([self.model.get(sanpham_object)]);
                    self.$el.find(sanpham_selector)[0].selectize.setValue(self.model.get(id_sanpham));
                    var objects = self.$el.find(sanpham_selector)[0].selectize.options[self.model.get(id_sanpham)];
                    if (!!objects) delete objects.$order;
					set_SanPham = true;
                }
				var arr_filters = [
					{'deleted': {'$eq': false}},
				];
				
				if (!!selectedNhacungcapId) {
					arr_filters.push({ "id_nhacungcap": { "$eq": selectedNhacungcapId } });
				}
				
				if (!!query) {
					arr_filters.push({ "tenkhongdau_nhacungcap": { "$likeI": gonrinApp().convert_khongdau(query) } });
				}
				
				var query_filter = {
					"filters": {
						"$and": arr_filters
					},
					"order_by": [{ "field": "ten", "direction": "asc" }]
				};
				
				var url =
					(self.getApp().serviceURL || "") + "/api/v2/danhmucsanpham?results_per_page=50" + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
				$.ajax({
					url: url,
					type: "GET",
					dataType: "json",
					success: function(response) {
						var filteredProducts = response.objects.filter(function(product) {
							return product.id_nhacungcap === selectedNhacungcapId;
						});
						callback(filteredProducts);
					},
					error: function() {
						callback();
					},
				});
			};			
			function selectizeNhaCungCap(){
				var $select = self.$el.find(nhacungcap_selector).selectize({
					maxItems:1,
					valueField: "id",
					labelField: "ten_donvi",
					searchField: ["ma_donvi", "ten_donvi","tenkhongdau"],
					preload:true,
					placeholder:'Chọn nhà cung cấp',
					load: function(query, callback){
						loadNhaCungCap(query,callback);
					},
					onItemAdd: function(value, $item){
						var obj = $select[0].selectize.options[value];
						delete obj.$order;
						var obj_nhacungcap ={
							"id_nhacungcap": obj.id,
							"ma_nhacungcap": obj.ma_donvi,
							"ten_nhacungcap":obj.ten_donvi,
							"tenkhongdau_nhacungcap":obj.tenkhongdau
						}
						self.model.set({
							[nhacungcap_object]: obj_nhacungcap,
							[id_nhacungcap]: value
						});
						self.$el.find(sanpham_selector)[0].selectize.clear();
                        self.$el.find(sanpham_selector)[0].selectize.clearOptions();
                        if (!!self.model.get(sanpham_object) && self.model.get(sanpham_object)['id_nhacungcap'] != value) {
                            self.model.set({
                                [id_sanpham]: null,
                                [sanpham_object]: null,
								"ma_sanpham":null
                            })
                        }
                        if ((!!self.model.get(sanpham_object) && self.model.get(sanpham_object)['id_nhacungcap'] != value) || !self.model.get(sanpham_object) || !self.$el.find(sanpham_object)[0].selectize.getValue()) {
                            self.$el.find(sanpham_selector)[0].selectize.load(function(callback) {
                                loadSanPham('', callback);
                            });
                        }
                        controlSelectize();
					},
					onItemRemove: function() {
                        self.model.set({
                            [nhacungcap_object]: null,
                            [id_nhacungcap]: null,
                            [sanpham_object]: null,
                            [id_sanpham]: null,
							"ma_sanpham": null
                            
                        });
                        self.$el.find(sanpham_object)[0].selectize.clear();
                        controlSelectize();

                    }
				});
			};
			function selectizeSanPham() {
				var $select = self.$el.find(sanpham_selector).selectize({
					maxItems: 1,
					valueField: 'id',
					labelField: 'ten_sanpham',
					searchField: ['ten_sanpham', 'tenkhongdau', 'ma_sanpham'],
					preload: true,
					placeholder: "Chọn sản phẩm",
					load: function(query, callback) {
						loadSanPham(query, callback);
					},
					
					onItemAdd: function(value, $item) {
						var obj = $select[0].selectize.options[value];
						var obj_sanpham = {
							"id_sanpham": obj.id,
							"ma_sanpham": obj.ma_sanpham,
							"ten_sanpham": obj.ten_sanpham,
							"tenkhongdau_sanpham":obj.tenkhongdau_sanpham
						};
						
						self.model.set({
							[sanpham_object]: obj_sanpham,
							[id_sanpham]: value
						});
					},
					onItemRemove: function() {
						self.model.set({
							[sanpham_object]: null,
							[id_sanpham]: null,
							"ma_sanpham":null
						});
						controlSelectize();
					}
				});
			};			
			selectizeNhaCungCap();
			selectizeSanPham();
			controlSelectize();
		},
    });
});