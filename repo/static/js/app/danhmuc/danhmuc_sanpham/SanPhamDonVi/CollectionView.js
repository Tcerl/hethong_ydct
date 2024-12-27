define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/bases/tpl/collection.html'),
        schema = require('json!schema/SanPhamDonViSchema.json');
    var CustomFilterView = require('app/bases/CustomFilterView');
    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "sanpham_donvi_filter",
        uiControl: {
            fields: [{
                    field: "stt",
                    label: "STT",
                    width: 10
                },
                {
                    field: "id",
                    label: "ID",
                    width: 250,
                    readonly: true,
                    visible: false
                },
                // { field: "ma_sanpham", label: "Mã", width: 250 },
                { field: "ten_sanpham", label: "Tên", width: 250 },
                { field: "ten_khoa_hoc", label: "Tên khoa học", width: 250 },
                { field: "ma_sanpham", label: "Mã dược liệu", width: 100 },
                {
                    field: "bophan_sudung",
                    label: "Bộ phận",
                    width: 250
                },
            ],
            onRowClick: function(event) {
                if (event.rowId) {
                    var path = 'sanpham_donvi/view?id=' + event.rowId;
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
        tools: [{
            name: "default",
            type: "group",
            groupClass: "toolbar-group",
            buttons: [
                {
                    name: "create",
                    type: "button",
                    buttonClass: "btn-primary btn-sm",
                    label: `<i class="fa fa-plus"></i> Thêm mới`,
                    visible: function() {
                        var tuyendonvi_id = gonrinApp().getTuyenDonVi();
                        return gonrinApp().hasRole("admin") ||  tuyendonvi_id=='1';
                    },
                    command: function() {
                        var self = this;
                        var path = "sanpham_donvi/create";
                        self.getApp().getRouter().navigate(path);
                    }
                },
                {
                    name:"downloadExcel",
                    type: "button",
                    buttonClass: "btn-success btn-sm ml-1",
                    label: `<i class="fas fa-download"></i> Tải danh mục đơn vị`,
                    visible: function() {
                        var tuyendonvi_id = gonrinApp().getTuyenDonVi();
                        return gonrinApp().hasRole("admin") ||  tuyendonvi_id=='1';
                    },
                    command: function() {
                        var self = this;
                        self.downloadExcel();
                    }
                }
        ]
        }, ],
        render: function() {
            var self = this;
            self.$el.find('.page-title').text('Danh sách dược liệu đơn vị');

            self.uiControl.orderBy = [{ "field": "tenkhongdau", "direction": "asc" }, { "field": "ten_sanpham", "direction": "asc" }];

            var filter = new CustomFilterView({
                el: self.$el.find("#grid_search"),
                sessionKey: 'sanpham_donvi' + "_filter"
            });
            filter.render();
            if (!filter.isEmptyFilter()) {
                var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
                var filters = {
                    "$or": [
                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(text) } },
                        { "ten_khoa_hoc": { "$likeI": gonrinApp().convert_khongdau(text) } },
                        { "ma_viettat": { "$likeI": gonrinApp().convert_khongdau(text) } },
                        { "ten_sanpham": { "$likeI": (text) } }
                    ]
                }

                self.uiControl.filters = filters;
            }
            self.applyBindings();
            filter.on('filterChanged', function(evt) {
                var $col = self.getCollectionElement();
                var text = !!evt.data.text ? evt.data.text.trim() : "";
                if ($col) {
                    if (text !== null) {
                        var filters = {
                            "$or": [
                                { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(text) } },
                                { "ten_khoa_hoc": { "$likeI": gonrinApp().convert_khongdau(text) } },
                                { "ma_viettat": { "$likeI": gonrinApp().convert_khongdau(text) } },
                                { "ten_sanpham": { "$likeI": (text) } }
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
				url: (self.getApp().serviceURL || "") + '/api/v1/export_excel_danhmuc_donvi',
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