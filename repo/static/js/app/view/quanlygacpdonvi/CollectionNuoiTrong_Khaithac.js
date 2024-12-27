define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/view/quanlygacpdonvi/tpl/collection_nuoitrong_khaithac.html'),
        schema = require('json!schema/ChungNhanGACPSchema.json');

    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "chungnhangacp",
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
                {
                    field: "thoigian_batdau_hieuluc",
                    label: "Ngày bắt đầu hiệu lực",
                    template: function(rowData) {
                        if (!!rowData && !!rowData.thoigian_batdau_hieuluc) {
                            return gonrinApp().parseInputDateString(rowData.thoigian_batdau_hieuluc).format("DD/MM/YYYY");
                        }
                        return "";
                    }
                },
                {
                    field: "thoigian_ketthuc_hieuluc",
                    label: "Ngày bắt đầu hiệu lực",
                    template: function(rowData) {
                        if (!!rowData && !!rowData.thoigian_ketthuc_hieuluc) {
                            return gonrinApp().parseInputDateString(rowData.thoigian_ketthuc_hieuluc).format("DD/MM/YYYY");
                        }
                        return "";
                    }
                },
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
                            let path = "quanlygacp_nuoitrong/model?id=" + event.rowId;
                            this.getApp().getRouter().navigate(path);
                        }
                        else if (loai_nuoitrong_khaithac === 2){
                            let path = "quanlygacp_khaithac/model?id=" + event.rowId;
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
            self.id_sanpham = null;
            let currentUser = gonrinApp().currentUser;
            if (!!currentUser && !!currentUser.donvi_id){
                self.selectizeDuoclieu("duoclieu", currentUser.donvi_id);
            }
            self.$el.find(".btn-new-nuoitrong").unbind("click").bind("click",(e)=>{
                e.stopPropagation();
                let path = `quanlygacp_nuoitrong/model`
                gonrinApp().getRouter().navigate(path);
            })
            self.$el.find(".btn-new-khaithac").unbind("click").bind("click",(e)=>{
                e.stopPropagation();
                let path = `quanlygacp_khaithac/model`
                gonrinApp().getRouter().navigate(path);
            })
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

            var $col = self.getCollectionElement();
            $col.data('gonrin').filter(query);
            // if (query != ""){
            //     var $col = self.getCollectionElement();
            //     $col.data('gonrin').filter(query);
            // }
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