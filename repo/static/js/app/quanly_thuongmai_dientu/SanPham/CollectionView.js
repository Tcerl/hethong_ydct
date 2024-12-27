define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/bases/tpl/collection.html');
    var CustomFilterView = require('app/bases/CustomFilterView');
    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: {},
        urlPrefix: "/api/v1/",
        collectionName: "danhmuc_sanpham",
        uiControl: {
            fields: [{
                    field: "stt",
                    label: "STT",
                    width: 10
                },
                { field: "ten_sanpham", label: "Tên", width: 250 },
                { field: "ten_khoa_hoc", label: "Tên khoa học", width: 250 },
                { field: "ma_sanpham", label: "Mã sản phẩm", width: 100 },
                { field: "bophan_sudung", label: "Bộ phận", width: 250 },
            ],
            onRowClick: function(event) {
                if (event.rowId) {
                    var path = 'sanpham/view?id=' + event.rowId;
                    this.getApp().getRouter().navigate(path);
                }

            },
            language: {
                no_records_found: "Chưa có dữ liệu"
            },
            pagination: {
                page: 1,
                pageSize: 100
            },
            noResultsClass: "alert alert-default no-records-found",
            datatableClass: "table table-mobile",
        },
        tools: [
            {
            name: "default",
            type: "group",
            groupClass: "toolbar-group",
            buttons: [
                {
                    name: "create",
                    type: "button",
                    buttonClass: "btn-primary btn-sm",
                    label: `<i class="fa fa-plus"></i> Thêm mới`,
                    command: function() {
                        var self = this;
                        let path = `sanpham/model`;
                        gonrinApp().getRouter().navigate(path);
                    }
                },
                // {
                //     name:"downloadExcel",
                //     type: "button",
                //     buttonClass: "btn-success btn-sm ml-1",
                //     label: `<i class="fas fa-download"></i> Tải danh mục dùng chung`,
                //     command: function() {
                //         var self = this;
                //         let path = self.getApp().serviceURL + '/static/template_import_excel/DanhSachDuocLieuDungChung.xlsx';
                //         window.open(path, '_blank');
                //     }
                // }
            ]
        }, ],
        render: function() {
            var self = this;
            self.$el.find('.page-title').text('Danh sách sản phẩm');
            var currentUser = self.getApp().currentUser;
            if (currentUser === undefined || currentUser === null || currentUser.donvi == null) {
                self.getApp().notify({ message: "Hết phiên làm việc, vui lòng đăng nhập lại!" }, { type: "danger", delay: 1000 });
                self.getApp().getRouter().navigate("login");
                return false;
            }
            if (!!self.getApp().hasRole('admin') || currentUser.donvi.tuyendonvi_id != "3") {
                self.getApp().notify({ message: "Bạn không có quyền truy cập" }, { type: "danger", delay: 1000 });
                self.getApp().getRouter().navigate("login");
                return false;
            }
            self.uiControl.orderBy = [{ "field": "tenkhongdau", "direction": "asc" }, { "field": "ten_sanpham", "direction": "asc" }];
            self.applyBindings();
            var filter = new CustomFilterView({
                el: self.$el.find("#grid_search"),
                sessionKey: self.collectionName + "_filter"
            });
            filter.render();
            filter.on('filterChanged', function(evt) {
                var $col = self.getCollectionElement();
                var text = !!evt.data.text ? evt.data.text.trim() : "";
                if ($col) {
                    if (text !== null) {
                        var filters = {
                            "$and": [
                                {"$or": [
                                    { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(text) } },
                                    { "ten_khoa_hoc": { "$likeI": gonrinApp().convert_khongdau(text) } },
                                    { "ma_sanpham": { "$likeI": gonrinApp().convert_khongdau(text) } },
                                    { "ten_sanpham": { "$likeI": (text) } }
                                ]}
                            ]
                            
                        }
                        $col.data('gonrin').filter(filters);
                    }
                }
                self.applyBindings();
            });
            self.$el.find("table").addClass("table-hover");
            self.$el.find("table").removeClass("table-striped");
            return this;
        },
        downloadExcel: function(){
            var self = this;
            self.getApp().showloading();
			$.ajax({
				url: (self.getApp().serviceURL || "") + '/api/v1/export_excel_danhmuc_chung',
				dataType: "json",
				contentType: "application/json",
				method: 'POST',
				data: JSON.stringify(params),
				success: function(response) {
					self.getApp().hideloading();
                    window.open(response, "_blank");
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
        }
    });

});