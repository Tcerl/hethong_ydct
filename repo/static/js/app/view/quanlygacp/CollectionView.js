define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/view/quanlygacp/tpl/collection.html'),
        schema = require('json!schema/ChungNhanGACPSchema.json');
    var CustomFilterView = require('app/bases/CustomFilterView');

    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "chungnhangacp_collection",
        id_sanpham: null,
        donvi_id: null,
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
                { field: "so_giay_chungnhan", label: "Số chứng nhận GACP", width: 250 },
                { field: "ten_sanpham", label: "Tên dược liệu", width: 250 },
                { field: "donvi", label: "Đơn vị", width: 250, template : function(rowData){
                    if (!!rowData && !!rowData.donvi){
                        return `${rowData.donvi.ten_coso}`;
                    }
                    return "";
                } },
                { field: "loai_nuoitrong_khaithac", label: "Loại quá trình", width: 250, template: function(rowData) {
                    if (!!rowData && !!rowData.loai_nuoitrong_khaithac) {
                        if (rowData.loai_nuoitrong_khaithac === 1){
                            return 'Quá trình nuôi trồng, thu hái dược liệu';
                        }
                        else if (rowData.loai_nuoitrong_khaithac === 2){
                            return 'Quá trình khai thác tự nhiên';
                        }
                    }
                    return "";
                } },
                {
                    field: "thoigian_batdau_hieuluc",
                    label: "Ngày bắt đầu hiệu lực",
                    width: 250,
                    template: function(rowData) {
                        if (!!rowData && !!rowData.thoigian_batdau_hieuluc) {
                            return gonrinApp().parseInputDateString(rowData.thoigian_batdau_hieuluc).format("DD/MM/YYYY");
                        }
                        return "";
                    }
                },
                {
                    field: "thoigian_ketthuc_hieuluc",
                    label: "Ngày kết thúc hiệu lực",
                    width: 250,
                    template: function(rowData) {
                        if (!!rowData && !!rowData.thoigian_ketthuc_hieuluc) {
                            return gonrinApp().parseInputDateString(rowData.thoigian_ketthuc_hieuluc).format("DD/MM/YYYY");
                        }
                        return "";
                    }
                },
                // { field: "trangthai", label: "Trạng thái", width: 250, template: function(rowData) {
                //     if (!!rowData && !!rowData.trangthai) {
                //         if (rowData.trangthai === 2){
                //             return '<span class="text-primary">Đang chờ duyệt</span>';
                //         }
                //         else if (rowData.trangthai ===3){
                //             return '<span class="text-success">Đã duyệt</span>';
                //         }
                //         else if (rowData.trangthai ===1){
                //             return '<span class="text-info">Tạo mới</span>'
                //         }
                //     }
                //     return "";
                // } }
            ],
            onRowClick: function(event) {
                if (event.rowId) {
                    if (!!event.rowData){
                        let loai_nuoitrong_khaithac = event.rowData.loai_nuoitrong_khaithac;
                        if (loai_nuoitrong_khaithac === 1){
                            let path = "gacp_nuoitrong/model?id=" + event.rowId;
                            this.getApp().getRouter().navigate(path);
                        }
                        else if (loai_nuoitrong_khaithac === 2){
                            let path = "gacp_khaithac/model?id=" + event.rowId;
                            this.getApp().getRouter().navigate(path);
                        }
                    }

                }
            },
            language: {
                no_records_found: "Chưa có dữ liệu"
            },
            noResultsClass: "alert alert-default no-records-found",
            datatableClass: "table table-mobile",
            pagination: {
                page: 1,
                pageSize: 100
            }
        },
        render: function() {
            var self = this;
            self.donvi_id =null;
            self.id_sanpham =null;
            self.selectDonvi();
            self.selectizeDuoclieu("duoclieu", self.donvi_id);

            self.$el.find(".btn-search").unbind("click").bind("click", function() {
                self.filterCollection();
            });
            self.$el.find('.btn-clear').unbind("click").bind("click", function() {
                self.$el.find("#loai_nuoitrong_khaithac").val("10");
                self.$el.find("#so_giay_chungnhan").val("");
                let $selectz = (self.$el.find("#duoclieu"))[0];
                if (!!$selectz){
                    $selectz.selectize.clear();
                    self.id_sanpham = null;
                }
                let $selectz1 = (self.$el.find("#donvi"))[0];
                if (!!$selectz1){
                    $selectz1.selectize.clear();
                    self.donvi_id = null;
                }
                self.filterCollection();
            });
            self.applyBindings();
            return this;
        },
        filterCollection: function(){
            var self = this;
            var loai_nuoitrong_khaithac = self.$el.find("#loai_nuoitrong_khaithac").val();
            if (!!loai_nuoitrong_khaithac){
                loai_nuoitrong_khaithac = Number(loai_nuoitrong_khaithac);
            }
            let so_giay_chungnhan = self.$el.find("#so_giay_chungnhan").val();
            let id_sanpham = self.id_sanpham;

            var query = "";
            if (!!so_giay_chungnhan && !!id_sanpham){
                query = {
                    "$and": [
                        {"so_giay_chungnhan": {"$eq": so_giay_chungnhan}},
                        {"id_sanpham": {"$eq": id_sanpham}}
                    ]
                }
            }
            else if (!!so_giay_chungnhan && !id_sanpham){
                query = {
                    "$and": [
                        {"so_giay_chungnhan": {"$eq": so_giay_chungnhan}}
                    ]
                }
            }
            else if (!so_giay_chungnhan && !!id_sanpham){
                query = {
                    "$and": [
                        {"id_sanpham": {"$eq": id_sanpham}}
                    ]
                }
            }

            if (loai_nuoitrong_khaithac != 10){
                if (!!query){
                    query = {
                        "$and": [
                            query,
                            {"loai_nuoitrong_khaithac": {"$eq": loai_nuoitrong_khaithac}}
                        ]
                    }
                }
                else{
                    query = {
                        "$and": [
                            {"loai_nuoitrong_khaithac": {"$eq": loai_nuoitrong_khaithac}}
                        ]
                    }
                }

            }

            if (self.donvi_id){
                if (!!query){
                    query = {
                        "$and":[
                            query,
                            {"donvi_id": {"$eq":  self.donvi_id}}
                        ]
                    }
                }
                else{
                    query =  {
                        "$and": [
                            {"donvi_id": {"$eq":  self.donvi_id}}
                        ]
                    }
                }
            }
            
            var $col = self.getCollectionElement();
            $col.data('gonrin').filter(query);

        },
        parse_date_custom : function(firstDay){
            var tmp = "";
            var firstDay = new Date(firstDay);
            if (isNaN(firstDay) == true){
                return "";
            }
			tmp = tmp + firstDay.getUTCFullYear();
			if (firstDay.getUTCMonth() < 9){
				tmp = tmp + "0" + (firstDay.getUTCMonth() +1)
			}else{
				tmp = tmp + (firstDay.getUTCMonth() +1)
			}
			if (firstDay.getUTCDate() <= 9){
				tmp = tmp + "0" + firstDay.getUTCDate();
			}
			else{
				tmp = tmp + firstDay.getUTCDate();
			}
			if (firstDay.getUTCHours() <=9){
				tmp = tmp + "0" + firstDay.getUTCHours();
			}
			else{
				tmp = tmp + firstDay.getUTCHours();
			}
			if (firstDay.getUTCMinutes() <=9){
				tmp = tmp + "0" + firstDay.getUTCMinutes();
			}
			else{
				tmp = tmp + firstDay.getUTCMinutes();
			}
			if (firstDay.getUTCSeconds() <=9){
				tmp = tmp + "0" + firstDay.getUTCSeconds();
			}
			else{
				tmp = tmp + firstDay.getUTCSeconds();
			}
			return tmp;
        },
        selectDonvi : function(){
            var self = this;
            var $selectize = self.$el.find('#donvi').selectize({
                valueField: 'id',
                labelField: 'ten_coso',
				searchField: ['ten_coso', 'tenkhongdau'],
				preload: true,
				maxOptions : 10,
				maxItems : 1,
                load: function(query, callback) {
                    var query_filter = {"filters": {"$and": [
                        {
                            "$or": [
                                { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                { "ten_coso": { "$likeI": (query) } },
                            ]
                        },
                        {"$or": [
                            { "loai_donvi": { "$eq": 2} },
                            { "loai_donvi": { "$eq": 4} },
                            { "loai_donvi": { "$eq": 5} },
                            { "loai_donvi": { "$eq": 5} },
                            { "loai_donvi": { "$eq": 6} },
                            { "loai_donvi": { "$eq": 7} },
                            { "loai_donvi": { "$eq": 8} },
                            { "loai_donvi": { "$eq": 9} }
                        ]},
                        ]}};
					var url = (self.getApp().serviceURL || "") + '/api/v1/donvi_filter?' + (query_filter? "&q=" + JSON.stringify(query_filter): "");
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
                onChange: function(value, isOnInitialize) {
					var $selectz = (self.$el.find('#donvi'))[0];
					var obj = $selectz.selectize.options[value];
					if (obj !== undefined && obj !== null){
                        let $selectz1 = (self.$el.find("#duoclieu")[0]);
                        if (!!$selectz1  && !!$selectz1 .selectize){
                            $selectz1.selectize.destroy();	
                        }
                        self.selectizeDuoclieu("duoclieu", value);
                        self.donvi_id = value;
					}
					else{
                        let $selectz1 = (self.$el.find("#duoclieu")[0]);
                        if (!!$selectz1  && !!$selectz1 .selectize){
                            $selectz1.selectize.destroy();	
                        }
                        self.selectizeDuoclieu("duoclieu");
                        self.donvi_id = null;
					}
                }
            });
        },
        selectizeDuoclieu : function(html_id,  donvi_id){
            var self = this;
            // tìm kiếm theo danh mục
            if (!!donvi_id){
				var $selectize = self.$el.find('#' + html_id).selectize({
					valueField: 'id_sanpham',
					labelField: 'ten_sanpham',
					searchField: ['ten_sanpham', 'ten_khoa_hoc','tenkhongdau'],
					preload: true,
					sortField: {
						field: 'tenkhongdau',
						direction: 'asc'
					},
					load: function(query, callback) {
						var url = "";
	
						var query_filter = {"filters": {
                            "$and": [
                                    {   "$or": [
                                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                        { "ten_sanpham": { "$likeI": (query) } },
                                        { "ten_khoa_hoc": { "$likeI": gonrinApp().convert_khongdau(query) } }
                                        ]
                                    },
                                    {"donvi_id": {"$eq" : donvi_id}}
                                ]
                            }
						};
						var url = (self.getApp().serviceURL || "") + '/api/v1/sanpham_donvi_filter?results_per_page=15' + (query_filter? "&q=" + JSON.stringify(query_filter): "");
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
					render: {
						option: function (item, escape) {
							return `<div class="option">${item.ten_sanpham} - ${item.ten_khoa_hoc} - ${item.ma_viettat}</div>`;
						}
					},
					onChange: function(value, isOnInitialize) {
                        var obj = $selectize[0].selectize.options[value];
                        if (obj != null && obj != undefined) {
                            self.id_sanpham = value;
                        } 
                        else{
                            self.id_sanpham =null;
                        }
					}
				});
            }
            else{
                var $selectize = self.$el.find('#' + html_id).selectize({
                    valueField: 'id',
                    labelField: 'ten_sanpham',
                    searchField: ['ten_sanpham', 'ten_khoa_hoc','tenkhongdau'],
                    preload: true,
                    sortField: {
                        field: 'tenkhongdau',
                        direction: 'asc'
                    },
                    load: function(query, callback) {
                        var url = "";
    
                        var query_filter = {"filters": {"$or": [
                            { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                            { "ten_sanpham": { "$likeI": (query) } },
                            { "ten_khoa_hoc": { "$likeI": gonrinApp().convert_khongdau(query) } }
                            ]}
                        };
                        var url = (self.getApp().serviceURL || "") + '/api/v1/danhmuc_sanpham_filter?results_per_page=15' + (query_filter? "&q=" + JSON.stringify(query_filter): "");
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
                    render: {
                        option: function (item, escape) {
                            return `<div class="option">${item.ten_sanpham} - ${item.ten_khoa_hoc} - ${item.ma_viettat}</div>`;
                        }
                    },
                    onChange: function(value, isOnInitialize) {
                        var obj = $selectize[0].selectize.options[value];
                        if (obj != null && obj != undefined) {
                            self.id_sanpham = value;
                        } 
                        else{
                            self.id_sanpham =null;
                        }
                    }
                });
            }
		},
    });

});