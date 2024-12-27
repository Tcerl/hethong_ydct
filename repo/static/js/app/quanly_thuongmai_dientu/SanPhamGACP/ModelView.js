define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/quanly_thuongmai_dientu/SanPhamGACP/tpl/model.html'),
    	schema 				= require('json!schema/SanPhamGACPDonViSchema.json');
	var RejectDialogView = require('app/bases/RejectDialogView');

    return Gonrin.ModelDialogView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "sanpham_gacp_donvi",
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
				// {
                //     field: "trangthai",
                //     uicontrol: "combobox",
                //     textField: "text",
                //     valueField: "value",
                //     cssClass: "form-control",
                //     dataSource: [
				// 		{ value: 1, text: "Đang hoạt động" },
                //         { value: 0, text: "Ngừng hoạt động" },
                //     ],
                // },
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
						self.selectizeDonViCungUng();
						self.selectizeSanPham();
        			},
        			error: function() {
    					self.getApp().notify({ message: "Có lỗi xảy ra, vui lòng thử lại sau"}, { type: "danger", delay: 1000 });
    				},
        		});
    		}
			else {
    			self.applyBindings();
				self.selectizeDonViCungUng();
				self.selectizeSanPham();
    		}
		},
		validateData: function() {
			var self = this;
			var id_sanpham = self.model.get('id_sanpham'),
				donvi_cungung_id = self.model.get('donvi_cungung_id'),
				ten_thuong_mai = self.model.get('ten_thuong_mai'),
				ma_sanpham_donvi = self.model.get('ma_sanpham_donvi');
			if (!id_sanpham) {
				self.getApp().notify({ message: "Vui lòng chọn sản phẩm"}, { type: "danger", delay: 1000 });
				return false;
			}
			if (!donvi_cungung_id) {
				self.getApp().notify({ message: "Vui lòng chọn nhà cung cấp"}, { type: "danger", delay: 1000 });
				return false;
			}
			if (ten_thuong_mai == null || ten_thuong_mai == undefined || ten_thuong_mai.trim() == "") {
				self.getApp().notify({ message: "Chưa nhập tên sản phẩm thương mại"}, { type: "danger", delay: 1000 });
				return false;
			}
			if (ma_sanpham_donvi == null || ma_sanpham_donvi == undefined || ma_sanpham_donvi.trim() == "") {
				self.getApp().notify({ message: "Chưa nhập mã sản phẩm"}, { type: "danger", delay: 1000 });
				return false;
			}
			return true;
		},
		selectizeDonViCungUng: function() {
			var self = this;
			var first_load = true;
			var $selectize = self.$el.find('#selectize_donvi_cungung').selectize({
                maxItems: 1,
                valueField: 'id',
                labelField: 'ten_donvi',
                searchField: ['ten_donvi', 'tenkhongdau', 'ma_donvi'],
                preload: true,
				placeholder: "Chọn nhà cung cấp",
                load: function(query, callback) {
					if (first_load && !!(self.model.get("donvi_cungung_id"))) {
						first_load = false;
						var donvi_cungung_id = self.model.get("donvi_cungung_id"),
							donvi_cungung_ma = self.model.get("donvi_cungung_ma"),
							donvi_cungung_ten = self.model.get("donvi_cungung_ten");
						callback([{'id': donvi_cungung_id, 'ma_donvi': donvi_cungung_ma, 'ten_donvi': donvi_cungung_ten}]);
                        $selectize[0].selectize.setValue(donvi_cungung_id);
					}
                    var query_filter = {
                        "filters": {
                            "$and": [
								{ "$or": [
									{ "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
									{ "ma_donvi": { "$likeI": query } }
								]} 
                            ],
                            "order_by": [{ "field": "ten_donvi", "direction": "asc" }]
                        }
                    };
                    var url = (self.getApp().serviceURL || "") + '/api/v1/donvi_cungung?page=1&results_per_page=15' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            callback(res.objects);
                        }
                    });
                },
                onItemAdd: function(value, $item) {
					if (value != self.model.get("donvi_cungung_id")) {
						var obj = $selectize[0].selectize.options[value];
						self.model.set({
							"donvi_cungung_id": value,
							"donvi_cungung_ma": obj.ma_donvi,
							"donvi_cungung_ten": obj.ten_donvi
						});
					}
                },
                onItemRemove: function(value) {
                    self.model.set({
						"donvi_cungung_id": null,
						"donvi_cungung_ma": null,
						"donvi_cungung_ten": null
					});
                }
            });
		},
		selectizeSanPham: function() {
			var self = this;
			var first_load = true;
			var $selectize = self.$el.find('#selectize_sanpham').selectize({
                maxItems: 1,
                valueField: 'id',
                labelField: 'ten_sanpham',
                searchField: ['ten_sanpham', 'tenkhongdau', 'ma_sanpham', 'ten_khoa_hoc'],
                preload: true,
				placeholder: "Chọn sản phẩm",
                load: function(query, callback) {
					if (first_load && !!(self.model.get("id_sanpham"))) {
						first_load = false;
						var id_sanpham = self.model.get("id_sanpham"),
							ma_sanpham = self.model.get("ma_sanpham"),
							ten_sanpham = self.model.get("ten_sanpham"),
							ten_khoa_hoc = self.model.get("ten_khoa_hoc");
						callback([{'id': id_sanpham, 'ma_sanpham': ma_sanpham, 'ten_sanpham': ten_sanpham, 'ten_khoa_hoc': ten_khoa_hoc}]);
                        $selectize[0].selectize.setValue(id_sanpham);
					}
                    var query_filter = {
                        "filters": {
                            "$and": [
								{ "$or": [
									{ "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
									{ "ma_sanpham": { "$likeI": query } },
									{ "ten_khoa_hoc": { "$likeI": query } },
								]} 
                            ],
                            "order_by": [{ "field": "ten_sanpham", "direction": "asc" }]
                        }
                    };
                    var url = (self.getApp().serviceURL || "") + '/api/v1/danhmuc_sanpham?page=1&results_per_page=15' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            callback(res.objects);
                        }
                    });
                },
                onItemAdd: function(value, $item) {
					if (value != self.model.get("id_sanpham")) {
						var obj = $selectize[0].selectize.options[value];
						self.model.set({
							"id_sanpham": value,
							"ma_sanpham": obj.ma_sanpham,
							"ten_sanpham": obj.ten_sanpham,
							"ten_khoa_hoc": obj.ten_khoa_hoc
						});
					}
                },
                onItemRemove: function(value) {
                    self.model.set({
						"id_sanpham": null,
						"ma_sanpham": null,
						"ten_sanpham": null,
						"ten_khoa_hoc": null
					});
                }
            });
		}
    });
});