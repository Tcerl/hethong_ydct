define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/giaychungnhancq/tpl/collection_cucnew.html'),
        schema = require('json!schema/PhieuKiemNghiemSchema.json');


    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "phieu_kiem_nghiem_collection_filter",
        uiControl: {
            fields: [
                {
                    field: "stt",
                    label: "STT",
                    width: 10
                },
                {
                    field: "ten",
                    label: "Mẫu kiểm nghiệm",
                    width: 200,
                    template: function(rowData) {
                        if (!!rowData && !!rowData.sanpham) {
                            return `${rowData.ten_sanpham} - ${rowData.ma_sanpham}`+ " (" + rowData.sanpham.ten_khoa_hoc + ")";
                        }
                        return "";
                    }
                },
                { field: "ma_kiem_nghiem", label: "Mã số kiểm nghiệm </br>(Phiếu kiểm nghiệm)", width: 150 },
                { field: "so_lo", label: "Số lô", width: 100 },
                {
                    field: "ngay_kiem_nghiem",
                    label: "Ngày kiểm nghiệm",
                    width: 100,
                    template: function(rowData) {
                        if (!!rowData && !!rowData.ngay_kiem_nghiem) {
                            return gonrinApp().parseInputDateString(rowData.ngay_kiem_nghiem).format("DD/MM/YYYY");
                        }
                        return "";
                    }
                },
                { field: "noi_san_suat", label: "Nơi sản xuất", width: 100 },
                { field: "ten_donvi_cap", label: "Tên đơn vị cấp", width: 100 },
                { field: "donvi", label: "Đơn vị", width: 200, template: function(rowData){
                    if (!!rowData && !!rowData.donvi){
                        let ten_donvi = rowData.donvi.ten_coso;
                        if (!!ten_donvi){
                            return ten_donvi;
                        }
                        return "";
                    }
                } },
                // { field: "trangthai", label: "Trạng thái", width: 100, template : function(rowData){
                //     if (!!rowData){
                //         if  (rowData.trangthai == 1){
                //             return '<div class="text-info">Tạo mới</div>';
                //         }
                //         else if (rowData.trangthai ==2){
                //             return '<div class="text-success">Chờ duyệt</div>';
                //         }
                //         else if (rowData.trangthai ==3){
                //             return '<div class="text-primary">Đã duyệt</div>';
                //         }
                //     }
                //     return "";
                // } },
            ],
            onRowClick: function(event) {
                if (event.rowId) {
                    this.setLocalStorage();
                    let path = `viewcoa?id=${event.rowId}`;
                    this.getApp().getRouter().navigate(path);
                }
            },
            language: {
                no_records_found: "Chưa có dữ liệu"
            },
            noResultsClass: "alert alert-default no-records-found",
            datatableClass: "table table-mobile",
            pagination: {
                page: 1,
                pageSize: 20
            },
            onRendered: function(e) {
                gonrinApp().responsive_table();
            }
        },
        tools: [{
            name: "default",
            type: "group",
            groupClass: "toolbar-group",
            buttons: [{
                name: "create",
                type: "button",
                buttonClass: "btn-primary btn-sm d-none new-cq",
                label: "Tạo mới",
                command: function() {
                    var self = this;
                    let path = `phieu_kiem_nghiem/model`;
                    gonrinApp().getRouter().navigate(path);
                }
            }, ]
        }, ],
        render: function() {
            var self = this;
            self.selectDonvi();
            var currentUser = gonrinApp().currentUser;
            var tuyendonvi_id = "";
            if (!!currentUser && !! currentUser.donvi){
                tuyendonvi_id = currentUser.donvi.tuyendonvi_id;
            }
            if(tuyendonvi_id == "10"){
                self.$el.find(".import-excel").remove();
            }
            else{
                self.$el.find(".new-cq").removeClass("d-none");
            }
            self.$el.find('#tungay').datetimepicker({
                format: "DD/MM/YYYY",
                textFormat: "DD/MM/YYYY",
                extraFormats: ["DDMMYYYY"],
                parseInputDate: function(val) {
                    return gonrinApp().parseInputDateString(val);
                },
                parseOutputDate: function(date) {
                    return gonrinApp().parseOutputDateString(date);
                },
                disabledComponentButton: true
            });
            self.$el.find('#denngay').datetimepicker({
                format: "DD/MM/YYYY",
                textFormat: "DD/MM/YYYY",
                extraFormats: ["DDMMYYYY"],
                parseInputDate: function(val) {
                    return gonrinApp().parseInputDateString(val);
                },
                parseOutputDate: function(date) {
                    return gonrinApp().parseOutputDateString(date);
                },
                disabledComponentButton: true
            });
            var data_cache = window.sessionStorage.getItem('datafilter_danhsach_coa_cuc');
            if (!!data_cache) {
                data_cache = JSON.parse(data_cache);
                if (!!data_cache.makiemnghiem) {
                    self.$el.find("#makiemnghiem").val(data_cache.makiemnghiem);
                }
                if (!!data_cache.ten_sanpham) {
                    self.$el.find("#ten_sanpham").val(data_cache.ten_sanpham);
                }
                if (data_cache.trangthai != null && data_cache.trangthai != undefined && data_cache.trangthai != "") {
                    self.$el.find("#trangthai").val(data_cache.trangthai);
                }
                if (!!data_cache.ngay_bat_dau) {
                    self.$el.find("#tungay").data('gonrin').setValue(data_cache.ngay_bat_dau);
                }
                if (!!data_cache.ngay_ket_thuc) {
                    self.$el.find("#denngay").data('gonrin').setValue(data_cache.ngay_ket_thuc);
                }
                var $selectz = (self.$el.find('#donvi'))[0];
                if (!!$selectz && !!data_cache.donvi_obj){
                    $selectz.selectize.addOption(data_cache.donvi_obj);
                    self.$el.find('#donvi')[0].selectize.setValue(data_cache.donvi_obj.id)
                }
                 
            }

            self.uiControl.filters = self.filterCollection(false);
            self.uiControl.orderBy = [{ "field": "ngay_kiem_nghiem", "direction": "desc" }];
            self.applyBindings();
            window.sessionStorage.removeItem('datafilter_danhsach_coa_cuc');
            self.$el.find(".btn-search").unbind("click").bind("click", function() {
                self.filterCollection(true);
            });
            self.$el.find('.btn-clear').unbind("click").bind("click", function() {
                self.$el.find('#tungay').data('gonrin').setValue(null);
                self.$el.find('#denngay').data('gonrin').setValue(null);
                self.$el.find("#makiemnghiem").val("");
                self.$el.find("#trangthai").val("10");
                self.$el.find("#ten_sanpham").val("");
                let $selectz = (self.$el.find("#donvi"))[0];
                if (!!$selectz){
                    $selectz.selectize.clear();
                }
                self.filterCollection(true);
            });
            return this;
        },
        setLocalStorage: function () {
            var myStorage = window.sessionStorage;
            var self = this;
            var makiemnghiem = self.$el.find('#makiemnghiem').val();
            var ten_sanpham = self.$el.find("#ten_sanpham").val();
            var trangthai = self.$el.find("#trangthai").val();
            var ngay_bat_dau = self.$el.find("#tungay").data('gonrin').getValue();
            var ngay_ket_thuc = self.$el.find("#denngay").data('gonrin').getValue();
            var tmp = gonrinApp().parseInputDateString(ngay_ket_thuc);
            var ngay_ket_thuc = self.parse_date_custom((moment(tmp).set({hour:23,minute:59,second:59})));
            var donvi_id = "";
            var donvi_obj = null;
            var $selectz = (self.$el.find("#donvi"))[0];
            if (!!$selectz){
                donvi_id = $selectz.selectize.getValue();
                var check_donvi = $selectz.selectize.options[donvi_id];
                if (!!check_donvi){
                    donvi_obj = {"id":check_donvi.id, "ten_coso":check_donvi.ten_coso,"tenkhongdau":check_donvi.tenkhongdau}
                }
            }
            var data = JSON.stringify({
                "makiemnghiem": makiemnghiem,
                "ten_sanpham":ten_sanpham,
                "trangthai": trangthai,
                "ngay_bat_dau": ngay_bat_dau,
                "ngay_ket_thuc": ngay_ket_thuc,
                "donvi_obj": donvi_obj
            });
            myStorage.setItem('datafilter_danhsach_coa_cuc', data);
            
        },
        filterCollection: function(is_query) {
            var self = this;
            var tu_ngay = self.$el.find('#tungay').data('gonrin').getValue(),
                den_ngay = self.$el.find('#denngay').data('gonrin').getValue(),
                makiemnghiem = self.$el.find("#makiemnghiem").val(),
                ten_sanpham = self.$el.find("#ten_sanpham").val(),
                trangthai = self.$el.find("#trangthai").val();
                var tmp = gonrinApp().parseInputDateString(den_ngay);
                var den_ngay = self.parse_date_custom((moment(tmp).set({hour:23,minute:59,second:59})));
            var query_time = "";
            if (tu_ngay !== null && tu_ngay !== undefined && den_ngay !== null && den_ngay !== undefined && tu_ngay !== "" && den_ngay !== "") {
                query_time = {
                    "$and": [
                        { "ngay_kiem_nghiem": { "$gte": tu_ngay } },
                        { "ngay_kiem_nghiem": { "$lte": (den_ngay) } },
                    ]
                };
            } else if (tu_ngay !== null && tu_ngay !== undefined && tu_ngay !== "") {
                query_time = {
                    "$and": [
                        { "ngay_kiem_nghiem": { "$gte": tu_ngay } }
                    ]
                };
            } else if (den_ngay !== null && den_ngay !== undefined && den_ngay !== "") {
                query_time = {
                    "$and": [
                        { "ngay_kiem_nghiem": { "$lte": (den_ngay) } },
                    ]
                };
            }

            let donvi_id = "";
            let $selectz = (self.$el.find("#donvi"))[0];
            if (!!$selectz){
                donvi_id = $selectz.selectize.getValue();
            }

            var query = "";
            if (trangthai !== null && trangthai !== undefined && trangthai !== "" && query_time !== "") {
                if (trangthai != 10){
                    query = {
                        "$and": [
                            { "trangthai": { "$eq": trangthai } },
                            query_time,
                            {
                                "$or": [
                                    { "ma_kiem_nghiem": { "$likeI": makiemnghiem } },
                                    { "ten_sanpham": { "$likeI": ten_sanpham } }
                                ]
                            }
                        ]
                    }
                }
                else{
                    query = {
                        "$and": [
                            query_time,
                            {
                                "$or": [
                                    { "ma_kiem_nghiem": { "$likeI": makiemnghiem } },
                                    { "ten_sanpham": { "$likeI": ten_sanpham } }
                                ]
                            }
                        ]
                    }
                }

            } else if (trangthai !== null && trangthai !== undefined && trangthai !== "" && query_time == "") {
                if (trangthai != 10){
                    query = {
                        "$and": [
                            { "trangthai": { "$eq": trangthai } },
                            { "ma_kiem_nghiem": { "$likeI": makiemnghiem }},
                            { "ten_sanpham": { "$likeI": ten_sanpham } }
    
                        ]
                    }
                }
                else{
                    query = {
                        "$and": [
                            { "ma_kiem_nghiem": { "$likeI": makiemnghiem }},
                            { "ten_sanpham": { "$likeI": ten_sanpham } }
    
                        ]
                    }
                }

            } else if (query_time !== "") {
                query = {
                    "$and": [
                        query_time,
                        { "ten_sanpham": { "$likeI": ten_sanpham } },
                        { "ma_kiem_nghiem": { "$likeI": makiemnghiem }}
                    ]
                }
            } else {
                query = { "$or": [{ "ma_kiem_nghiem": { "$likeI": makiemnghiem } },
                { "ten_sanpham": { "$likeI": ten_sanpham } }] }
            }


            if (!!donvi_id){
                query = {
                    "$and": [
                        query,
                        {"donvi_id" : {"$eq" : donvi_id}}
                    ]
                }
            }

            if (query !== "" && is_query == true) {
                var $col = self.getCollectionElement();
                $col.data('gonrin').filter(query);
            }
            return query;
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

					}
					else{
					}
                }
            });
        }
    });

});