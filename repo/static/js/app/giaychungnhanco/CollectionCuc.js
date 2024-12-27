define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/giaychungnhanco/tpl/collection_cuc_new.html'),
        schema = require('json!schema/GiayChungNhanCOSchema.json');

    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "giaychungnhanco_collection_filter",
        uiControl: {
            fields: [
                {
                    field: "stt",
                    label: "STT",
                    width: 10
                },
                { field: "loai_co", label : "Loại CO", width : 130, template : function(rowData){
                    if (rowData !== undefined && rowData !== null){
                        if (rowData.loai_co == 1){
                            return '<div>Ngoài nước</div>';
                        }
                        else if (rowData.loai_co == 2){
                            return '<div>Trong nước</div>';
                        }
                        return "";
                    }
                }},
                { 
                    field: "so_co", 
                    label: "Số CO", 
                    width: 180,
                    template: function(rowData) {
                        if (!!rowData && !!rowData.so_co) {
                            return `<a id="`+ rowData.id +`" class="text-break so-co" href="#viewco?id=`+ rowData.id +`" target="_self">`+rowData.so_co+`</a>`;
                        }
                        return '';
                    }

                 },
                // { field: "so_giay_phep", label: "Số giấy phép", width: 180 },
                { field: "donvi_chungnhan_co", label: "Đơn vị chứng nhận" },
                { field: "ten_donvi_tiepnhan", label: "Đơn vị tiếp nhận" },
                {
                    field: "thoigian_cap_co",
                    label: "Ngày cấp CO",
                    template: function(rowData) {
                        if (!!rowData && !!rowData.thoigian_cap_co) {
                            return gonrinApp().parseInputDateString(rowData.thoigian_cap_co).format('DD/MM/YYYY');
                        }
                        return '';
                    }
                },
                {
                    field: "command",
                    label: "Tệp đính kèm",
                    width: "140px",
                    template: function(rowData) {
                        var result = "";
                        if (!!rowData && !!rowData.chungtu_dinhkem) {
                            for(var i=0; i< rowData.chungtu_dinhkem.length; i++){
                                var item = rowData.chungtu_dinhkem[i];
                                var link = gonrinApp().uploadURL + item.link;
                                result = result + `<a class="text-break" href="`+ link +`" target="_blank">`+item.name+`</a><br>`
                            }
                        }
                        return result;
                    }
                },
                { field: "trangthai", label: "Trạng thái", width: 100, template : function(rowData){
                    if (!!rowData){
                        if (rowData.trangthai ==2){
                            return '<div class="text-success">Chờ duyệt</div>';
                        }
                        else if (rowData.trangthai ==3){
                            return '<div class="text-primary">Đã duyệt</div>';
                        }
                        else if (rowData.trangthai ==1){
                            return '<div class="text-info">Tạo mới</div>';
                        }
                    }
                    return "";
                } },
            ],
            // onRowClick: function(event) {
            //     if (event.rowId) {
            //         this.setLocalStorage();
            //         let path = `viewco?id=${event.rowId}`;
            //         this.getApp().getRouter().navigate(path);
            //     }
            // },
            selectionMode: false,
            selectedTrClass:"",
            selectedRowsClass:"",
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
                var self = this;
                let arr = self.$el.find("a.so-co");
                let length = arr.length;
                for (let i=0; i<length; i++){
                    let item = arr[i];
                    let item_id = $(item).attr("id");
                    self.$el.find(`#${item_id}`).unbind('click').bind('click', function(e) {
                        e.stopPropagation();
                        self.setLocalStorage();
                        let path = `viewco?id=${item_id}`;
                        self.getApp().getRouter().navigate(path);
                    });
                }
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
                buttonClass: "btn-primary btn-sm d-none new-co",
                label: "Tạo mới",
                command: function() {
                    var self = this;
                    let path = `giaychungnhanco/model`;
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
                self.$el.find(".new-co").removeClass("d-none");
            }
            var tungay = self.$el.find('#tungay').datetimepicker({
                textFormat: 'DD/MM/YYYY',
                extraFormats: ['DDMMYYYY'],
                parseInputDate: function(val) {
                    return gonrinApp().parseInputDateString(val);
                },
                parseOutputDate: function(date) {
                    return gonrinApp().parseOutputDateString(date);
                },
                disabledComponentButton: true
            });
            var denngay = self.$el.find('#denngay').datetimepicker({
                textFormat: 'DD/MM/YYYY',
                extraFormats: ['DDMMYYYY'],
                parseInputDate: function(val) {
                    return gonrinApp().parseInputDateString(val);
                },
                parseOutputDate: function(date) {
                    return gonrinApp().parseOutputDateString(date);
                },
                disabledComponentButton: true
            });
            var data_cache = window.sessionStorage.getItem('datafilter_danhsach_co_cuc');
            if (!!data_cache) {
                data_cache = JSON.parse(data_cache);
                if (data_cache.so_co != null && data_cache.so_co != undefined) {
                    self.$el.find("#so_co").val(data_cache.so_co);
                }
                if (data_cache.donvicap != null && data_cache.donvicap != undefined) {
                    self.$el.find("#donvicap").val(data_cache.donvicap);
                }
                if (data_cache.loai_co != null && data_cache.loai_co != undefined) {
                    self.$el.find("#loai_co").val(data_cache.loai_co);
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
            self.uiControl.orderBy = [{ "field": "thoigian_cap_co", "direction": "desc" }];
            self.applyBindings();
            window.sessionStorage.removeItem('datafilter_danhsach_co_cuc');
            self.$el.find(".btn-search").unbind("click").bind("click", function() {
                self.filterCollection(true);
            });
            self.$el.find('.btn-clear').unbind("click").bind("click", function() {
                tungay.data('gonrin').setValue(null);
                denngay.data('gonrin').setValue(null);
                self.$el.find("#so_co").val("");
                self.$el.find("#donvicap").val("");
                self.$el.find("#trangthai").val("10");
                self.$el.find("#loai_co").val("10");
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
            var ngay_bat_dau = self.$el.find('#tungay').data('gonrin').getValue(),
            ngay_ket_thuc = self.$el.find('#denngay').data('gonrin').getValue(),
            so_co = self.$el.find("#so_co").val(),
            donvicap = self.$el.find("#donvicap").val();
            var trangthai = self.$el.find("#trangthai").val();
            var tmp = gonrinApp().parseInputDateString(ngay_ket_thuc);
            var ngay_ket_thuc = self.parse_date_custom((moment(tmp).set({hour:23,minute:59,second:59})));
            var loai_co = self.$el.find("#loai_co").val();
            
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
                "so_co": so_co,
                "trangthai": trangthai,
                "ngay_bat_dau": ngay_bat_dau,
                "ngay_ket_thuc": ngay_ket_thuc,
                "donvicap":donvicap,
                "loai_co":loai_co,
                "donvi_obj": donvi_obj
            });
            myStorage.setItem('datafilter_danhsach_co_cuc', data);
            
        },
        filterCollection: function(is_query) {
            var self = this;
            var tu_ngay = self.$el.find('#tungay').data('gonrin').getValue(),
                den_ngay = self.$el.find('#denngay').data('gonrin').getValue(),
                so_co = self.$el.find("#so_co").val(),
                donvicap = self.$el.find("#donvicap").val();
                var trangthai = self.$el.find("#trangthai").val();
                var tmp = gonrinApp().parseInputDateString(den_ngay);
                var den_ngay = self.parse_date_custom((moment(tmp).set({hour:23,minute:59,second:59})));
                var loai_co = self.$el.find("#loai_co").val();


            let donvi_id = "";
            let $selectz = (self.$el.find("#donvi"))[0];
            if (!!$selectz){
                donvi_id = $selectz.selectize.getValue();
            }

            var query_time = "";
            if (tu_ngay !== null && tu_ngay !== undefined && den_ngay !== null && den_ngay !== undefined && tu_ngay !== "" && den_ngay !== "") {
                if (trangthai  != 10){
                    query_time = {
                        "$and": [
                            { "thoigian_cap_co": { "$gte": tu_ngay } },
                            { "thoigian_cap_co": { "$lte": (den_ngay) } },
                            {"trangthai" : {"$eq" : Number(trangthai)}}
                        ]
                    };
                }
                else{
                    query_time = {
                        "$and": [
                            { "thoigian_cap_co": { "$gte": tu_ngay } },
                            { "thoigian_cap_co": { "$lte": (den_ngay) } },
                        ]
                    };
                }

            } else if (tu_ngay !== null && tu_ngay !== undefined && tu_ngay !== "") {
                if (trangthai != 10){
                    query_time = {
                        "$and": [
                            { "thoigian_cap_co": { "$gte": tu_ngay } },
                            {"trangthai" : {"$eq" : Number(trangthai)}}
                        ]
                    };
                }
                else{
                    query_time = {
                        "$and": [
                            { "thoigian_cap_co": { "$gte": tu_ngay } },
                        ]
                    };
                }

            } else if (den_ngay !== null && den_ngay !== undefined && den_ngay !=="") {
                if (trangthai != 10){
                    query_time = {
                        "$and": [
                            { "thoigian_cap_co": { "$lte": (den_ngay) } },
                            {"trangthai" : {"$eq" : Number(trangthai)}}
                        ]
                    };
                }
                else{
                    query_time = {
                        "$and": [
                            { "thoigian_cap_co": { "$lte": (den_ngay) } },
                        ]
                    };
                }
            }

            var query = "";
            if (donvicap !== null && donvicap !== undefined && donvicap !== "" && query_time !== "") {
                if (trangthai != 10){
                    query = {
                        "$and": [
                            { "donvi_chungnhan_co": { "$likeI": donvicap } },
                            query_time,
                            {
                                "$or": [{ "so_co": { "$likeI": so_co } }]
                            },
                            {"trangthai" : {"$eq" : Number(trangthai)}}
                        ]
                    }
                }
                else{
                    query = {
                        "$and": [
                            { "donvi_chungnhan_co": { "$likeI": donvicap } },
                            query_time,
                            {
                                "$or": [{ "so_co": { "$likeI": so_co } }]
                            },
                        ]
                    }
                }

            } else if (donvicap !== null && donvicap !== undefined && donvicap !== "" && query_time == "") {
                if (trangthai != 10){
                    query = {
                        "$and": [
                            { "donvi_chungnhan_co": { "$likeI": donvicap } },
                            {
                                "$or": [
                                    { "so_co": { "$likeI": so_co } },
                                ]
                            },
                            {"trangthai" : {"$eq" : Number(trangthai)}}
                        ]
                    }
                }
                else{
                    query = {
                        "$and": [
                            { "donvi_chungnhan_co": { "$likeI": donvicap } },
                            {
                                "$or": [
                                    { "so_co": { "$likeI": so_co } },
                                ]
                            },
                        ]
                    }
                }

            } else if (query_time !== "") {
                if (trangthai != 10){
                    query = {
                        "$and": [
                            query_time,
                            {
                                "$or": [{ "so_co": { "$likeI": so_co } }]
                            },
                            {"trangthai" : {"$eq" : Number(trangthai)}}
                        ]
                    }
                }
                else{
                    query = {
                        "$and": [
                            query_time,
                            {
                                "$or": [{ "so_co": { "$likeI": so_co } }]
                            },
                        ]
                    }
                }

            } else {
                if (trangthai != 10){
                    query =   {"$and" : [
                        { "$or": [{ "so_co": { "$likeI": so_co } }] },
                        {"trangthai" : {"$eq" : Number(trangthai)}}
                    ]} 
                }
                else{
                    query =   {"$and" : [
                        { "$or": [{ "so_co": { "$likeI": so_co } }] },
                    ]} 
                }

            }
            if (!!donvi_id){
                query = {
                    "$and": [
                        query,
                        {"donvi_id" : {"$eq" : donvi_id}}
                    ]
                }
            }

            if (!!loai_co && loai_co != "10"){
                query = {
                    "$and": [
                        query,
                        {"loai_co": {"$eq": loai_co}}
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