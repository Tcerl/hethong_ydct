const { event } = require('jquery');

define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/thongke/tpl/chitiet_phanphoi.html');
    var Thongke_thugomm = require("app/thongke/Thongke_thugom");
    var ChitietNhapXuat = require('app/thongke/ChitietNhapXuat');
    return Gonrin.ModelDialogView.extend({
    	template : template,
    	modelSchema	: {
            "tungay": {
                "type": "string"
            },
            "denngay": {
                "type":"string"
            }
        },
        donvi_id: null,
        ten_donvi: null,
        setObjDonvi: false,
        setIdDonvi: false,
        ten_sanpham: null,
        id_sanpham : null,
        ten_khoa_hoc: null,
        ma_viettat: null,
        setObjDuoclieu: false,
        setIdDuoclieu: false,
        uiControl:{
            fields:[
                {
                    field: "tungay",
                    uicontrol: "datetimepicker",
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
                },
                {
                    field: "denngay",
                    uicontrol: "datetimepicker",
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
                },
            ]
        },
        render:function(){
            var self = this;
            self.ten_donvi = null;
            self.donvi_id =  null;
            self.setObjDonvi = false;
            self.setIdDonvi = false;
            self.id_sanpham = null;
            self.ten_sanpham = null;
            self.ten_khoa_hoc = null;
            self.ma_viettat = null;
            self.setIdDuoclieu = false;
            self.setObjDuoclieu = false;
            var currentUser = self.getApp().currentUser;
            var tuyendonvi_id = null;
            if (currentUser !== undefined && currentUser !== null && currentUser.donvi !== null){
				if (currentUser.donvi.tuyendonvi_id !== null){
					tuyendonvi_id = currentUser.donvi.tuyendonvi_id;
				}
			}
            if (tuyendonvi_id === undefined || tuyendonvi_id === null || (tuyendonvi_id !="7" && tuyendonvi_id != "10")){
				self.$el.find(".timkiem-donvi-baocao").remove();
			}
            var viewData =  self.viewData;
            if (!!viewData){
                let list_baocao = viewData.list_baocao;

                let filters = viewData.filters;
                if (!!filters){
                    let ngay_bat_dau = filters.ngay_bat_dau;
                    let ngay_ket_thuc = filters.ngay_ket_thuc;
                    if (!!ngay_bat_dau){
                        self.model.set("tungay", ngay_bat_dau);
                        self.model.set("denngay", ngay_ket_thuc);
                    }
                    let id_sanpham = filters.id_sanpham;
                    let ten_sanpham = filters.ten_sanpham;
                    let ten_khoa_hoc = filters.ten_khoa_hoc;
                    let ma_viettat = filters.ma_viettat;
                    if (!!id_sanpham && !!ten_sanpham){
                        self.id_sanpham = id_sanpham,
                        self.ten_sanpham = ten_sanpham;
                        self.ten_khoa_hoc = ten_khoa_hoc;
                        self.ma_viettat = ma_viettat;
                    }
                    let donvi_id = filters.donvi_id;
                    let ten_donvi = filters.ten_donvi;
                    if (!!donvi_id && !!ten_donvi){
                        self.donvi_id = donvi_id;
                        self.ten_donvi = ten_donvi;
                        self.selectDonvi();
                    }
                    else{
                        self.selectDonvi();
                        self.selectizeDuoclieu("chonduoclieu");
                    }
                }
                self.showData(list_baocao);


                self.register_event();
            }
			self.applyBindings();
            
        },
        selectDonvi : function(){
            var self = this;
            var $selectize = self.$el.find('#donvi-board').selectize({
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
                            { "loai_donvi": { "$eq": 5} },
                            { "loai_donvi": { "$eq": 5} },
                            { "loai_donvi": { "$eq": 6} },
                            { "loai_donvi": { "$eq": 7} },
                            { "loai_donvi": { "$eq": 8} },
                            { "loai_donvi": { "$eq": 9} }
                        ]},
                        ]}};
                    if (!!self.donvi_id && !!self.ten_donvi && self.setObjDonvi === false){
                        let objs = {
                            id: self.donvi_id,
                            ten_coso: self.ten_donvi
                        }
                        callback([objs]);
                        self.setObjDonvi = true;
                    }
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
                            if (!!self.donvi_id && self.setIdDonvi === false){
                                $selectize[0].selectize.setValue(self.donvi_id);
                                self.setIdDonvi = true;
                            }
                        }
                    });
                },
                onChange: function(value, isOnInitialize) {
					var $selectz = (self.$el.find('#donvi-board'))[0];
					var obj = $selectz.selectize.options[value];
					if (obj !== undefined && obj !== null){
                        let $selectz1 = (self.$el.find("#chonduoclieu")[0]);
                        if (!!$selectz1  && !!$selectz1 .selectize){
                            $selectz1.selectize.destroy();
                        }
                        self.selectizeDuoclieu("chonduoclieu", value);
					}
					else{
                        let $selectz1 = (self.$el.find("#chonduoclieu")[0]);
                        if (!!$selectz1  && !!$selectz1 .selectize){
                            $selectz1.selectize.destroy();	
                        }
                        self.selectizeDuoclieu("chonduoclieu");
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
                        if (!!self.id_sanpham && !!self.ten_sanpham && self.setObjDuoclieu === false){
                            let objs = {
                                id_sanpham: self.id_sanpham,
                                ten_sanpham: self.ten_sanpham,
                                ten_khoa_hoc: self.ten_khoa_hoc,
                                ma_viettat: self.ma_viettat
                            }
                            callback([objs]);
                            self.setObjDuoclieu = true;
                        }
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
                                if (!!self.id_sanpham && self.setIdDuoclieu === false){
                                    $selectize [0].selectize.setValue(self.id_sanpham);
                                    self.setIdDuoclieu = true;
                                }
							}
						});  
	
					},
					render: {
						option: function (item, escape) {
							return `<div class="option">${item.ten_sanpham} - ${item.ten_khoa_hoc} - ${item.ma_viettat}</div>`;
						}
					},
					onChange: function(value, isOnInitialize) {
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
                        if (!!self.id_sanpham && !!self.ten_sanpham && self.setObjDuoclieu === false){
                            let objs = {
                                id: self.id_sanpham,
                                ten_sanpham: self.ten_sanpham,
                                ten_khoa_hoc: self.ten_khoa_hoc,
                                ma_viettat: self.ma_viettat
                            }
                            callback([objs]);
                            self.setObjDuoclieu = true;
                        }
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
                                if (!!self.id_sanpham && self.setIdDuoclieu === false){
                                    $selectize [0].selectize.setValue(self.id_sanpham);
                                    self.setIdDuoclieu = true;
                                }
                            }
                        });  
    
                    },
                    render: {
                        option: function (item, escape) {
                            return `<div class="option">${item.ten_sanpham} - ${item.ten_khoa_hoc} - ${item.ma_viettat}</div>`;
                        }
                    },
                    onChange: function(value, isOnInitialize) {
    
                    }
                });
            }
        },
        parse_date_custom : function(firstDay){
			var tmp = "";
			var firstDay = new Date(firstDay);
			if (isNaN(firstDay) == true){
                return "";
            }
			tmp = tmp + firstDay.getFullYear();
			if (firstDay.getMonth() < 9){
				tmp = tmp + "0" + (firstDay.getMonth() +1)
			}else{
				tmp = tmp + (firstDay.getMonth() +1)
			}
			if (firstDay.getDate() <= 9){
				tmp = tmp + "0" + firstDay.getDate();
			}
			else{
				tmp = tmp + firstDay.getDate();
			}
			if (firstDay.getHours() <=9){
				tmp = tmp + "0" + firstDay.getHours();
			}
			else{
				tmp = tmp + firstDay.getHours();
			}
			if (firstDay.getMinutes() <=9){
				tmp = tmp + "0" + firstDay.getMinutes();
			}
			else{
				tmp = tmp + firstDay.getMinutes();
			}
			if (firstDay.getMilliseconds() <=9){
				tmp = tmp + "0" + firstDay.getMilliseconds();
			}
			else{
				tmp = tmp + firstDay.getMilliseconds();
			}
			return tmp;
        },
        showData: function(list_baocao){
            var self = this;
            var list_counter = [];
            if (Array.isArray(list_baocao) && list_baocao.length >0){
                let length = list_baocao.length;
                for (var i=0; i<length; i++){
                    var counter = 0;
                    var item = list_baocao[i];
                    var list_sanpham = item.list_sanpham;
                    for (var j =0; j< list_sanpham.length; j++){
                        var cnt_sanpham = list_sanpham[j];
                        var sl_nhap = cnt_sanpham.nhap_trong_ky;
                        var sl_xuat = cnt_sanpham.xuat_trong_ky;
                        var cnt_chitiet_nhap_xuat = cnt_sanpham.chitiet_nhap_xuat;
                        if (cnt_chitiet_nhap_xuat.length > 1){
                            counter += (cnt_chitiet_nhap_xuat.length +1);
                        }
                        else{
                            if((cnt_chitiet_nhap_xuat.length ==1) && ( (cnt_chitiet_nhap_xuat[0].soluong_nhap != sl_nhap) || (cnt_chitiet_nhap_xuat[0].soluong_xuat != sl_xuat) ) ){
                                counter += (cnt_chitiet_nhap_xuat.length +1);
                            }
                            else{
                                counter +=1;
                            }
                        }
                    }
                    list_counter.push(counter);
                }
            }

            if (Array.isArray(list_baocao) && list_baocao.length >0){
                let length = list_baocao.length;
                for (var i=0; i<length; i++){
                    var counter = list_counter[i];
                    var item = list_baocao[i];
                    var ten_donvi =  item.ten_donvi;
                    var donvi_id = item.donvi_id;
                    var tr_first = `<tr>
                        <td rowspan = "` + counter + `">` + ten_donvi + `</td>
                    `;
                    var list_tr = [];
                    var list_sanpham = item.list_sanpham;
                    if (list_sanpham.length > 0){
                        for (var j=0; j<list_sanpham.length;j++){
                            var sanpham = list_sanpham[j];
                            var ten_duoc_lieu = sanpham.ten_duoc_lieu;
                            var ten_khoa_hoc = sanpham.ten_khoa_hoc;
                            var ton_dau_ky = sanpham.ton_dau_ky;
                            var nhap_trong_ky = sanpham.nhap_trong_ky;
                            var xuat_trong_ky = sanpham.xuat_trong_ky;
                            var ton_cuoi_ky = sanpham.ton_cuoi_ky;
                            var ma_sanpham = sanpham.ma_sanpham;
                            if (j==0){
                                var chitiet_nhap_xuat = sanpham.chitiet_nhap_xuat;
                                if (chitiet_nhap_xuat === undefined || chitiet_nhap_xuat === null){
                                    chitiet_nhap_xuat = [];
                                }
                                if (chitiet_nhap_xuat.length == 0){
                                    var td_ten_duoc_lieu = `<td class="thongke_chitiet" donvi_id="${donvi_id}" ten_donvi="${ten_donvi}" id_sp="${sanpham.id_sanpham}" ten_khoa_hoc=${ten_khoa_hoc} ma_sp ="${ma_sanpham}" ten_sp="${ten_duoc_lieu}">` + (ten_khoa_hoc? (ten_duoc_lieu + " - " + ten_khoa_hoc) : ten_duoc_lieu) + `</td>`;
                                    var td_ton_dau_ky = `<td class="text-right">` + (ton_dau_ky? Number(ton_dau_ky).toLocaleString("de-DE") : 0) + `</td>`;
                                    var td_nhap_trong_ky = `<td class="text-right">` + (nhap_trong_ky? Number(nhap_trong_ky).toLocaleString("de-DE") : 0) +`</td>`;
                                    var td_xuat_trong_ky = `<td class="text-right">` + (xuat_trong_ky? Number(xuat_trong_ky).toLocaleString("de-DE") : 0) + `</td>`;
                                    var td_ton_cuoi_ky = `<td class="text-right">` + (ton_cuoi_ky? Number(ton_cuoi_ky).toLocaleString("de-DE") : 0) + `</td>`;
                                    var td_dv_cungung = `<td></td>`;
                                    tr_first +=td_ten_duoc_lieu;
                                    tr_first+=td_ton_dau_ky;
                                    tr_first+=td_nhap_trong_ky
                                    tr_first +=td_xuat_trong_ky;
                                    tr_first+=td_ton_cuoi_ky;
                                    tr_first+=td_dv_cungung;
                                    tr_first +=`</tr>`;
                                }
                                else if ((chitiet_nhap_xuat.length ==1) && (chitiet_nhap_xuat[0].soluong_nhap == nhap_trong_ky) && (chitiet_nhap_xuat[0].soluong_xuat == xuat_trong_ky)){
                                    var ten_dv_cungung = chitiet_nhap_xuat[0].ten_dv_cungung;
                                    var ma_dv_cungung = chitiet_nhap_xuat[0].ma_dv_cungung;
                                    if (ma_dv_cungung == "TG"){
                                        var td_ten_duoc_lieu = `<td class="thongke_chitiet" donvi_id="${donvi_id}" ten_donvi="${ten_donvi}" id_sp="${sanpham.id_sanpham}" ten_khoa_hoc=${ten_khoa_hoc} ma_sp ="${ma_sanpham}" ten_sp="${ten_duoc_lieu}">` + (ten_khoa_hoc? (ten_duoc_lieu + " - " + ten_khoa_hoc) : ten_duoc_lieu) + `</td>`;
                                        var td_ton_dau_ky = `<td class="text-right">` + (ton_dau_ky? Number(ton_dau_ky).toLocaleString("de-DE") : 0) + `</td>`;
                                        var td_nhap_trong_ky = `<td class="text-right">` + (nhap_trong_ky? Number(nhap_trong_ky).toLocaleString("de-DE") : 0) +`</td>`;
                                        var td_xuat_trong_ky = `<td class="text-right">` + (xuat_trong_ky? Number(xuat_trong_ky).toLocaleString("de-DE") : 0) + `</td>`;
                                        var td_ton_cuoi_ky = `<td class="text-right">` + (ton_cuoi_ky? Number(ton_cuoi_ky).toLocaleString("de-DE") : 0) + `</td>`;
                                        var td_dv_cungung = `<td class= "text-primary ` + donvi_id + `" id = "` + sanpham.id_sanpham + `" donvi_id = "` + donvi_id + `">` + (ten_dv_cungung? ten_dv_cungung : "") + `</td>`;
                                        tr_first +=td_ten_duoc_lieu;
                                        tr_first+=td_ton_dau_ky;
                                        tr_first+=td_nhap_trong_ky
                                        tr_first +=td_xuat_trong_ky;
                                        tr_first+=td_ton_cuoi_ky;
                                        tr_first+=td_dv_cungung
                                        tr_first +=`</tr>`;
                                    }
                                    else if (ma_dv_cungung == "THNT" || ma_dv_cungung == "THKT"){
                                        var td_ten_duoc_lieu = `<td class="thongke_chitiet" donvi_id="${donvi_id}" ten_donvi="${ten_donvi}" id_sp="${sanpham.id_sanpham}" ten_khoa_hoc=${ten_khoa_hoc} ma_sp ="${ma_sanpham}" ten_sp="${ten_duoc_lieu}">` + (ten_khoa_hoc? (ten_duoc_lieu + " - " + ten_khoa_hoc) : ten_duoc_lieu) + `</td>`;
                                        var td_ton_dau_ky = `<td class="text-right">` + (ton_dau_ky? Number(ton_dau_ky).toLocaleString("de-DE") : 0) + `</td>`;
                                        var td_nhap_trong_ky = `<td class="text-right">` + (nhap_trong_ky? Number(nhap_trong_ky).toLocaleString("de-DE") : 0) +`</td>`;
                                        var td_xuat_trong_ky = `<td class="text-right">` + (xuat_trong_ky? Number(xuat_trong_ky).toLocaleString("de-DE") : 0) + `</td>`;
                                        var td_ton_cuoi_ky = `<td class="text-right">` + (ton_cuoi_ky? Number(ton_cuoi_ky).toLocaleString("de-DE") : 0) + `</td>`;
                                        var td_dv_cungung = `<td class= "text-primary">` + (ten_dv_cungung? ten_dv_cungung : "") + `</td>`;
                                        tr_first +=td_ten_duoc_lieu;
                                        tr_first+=td_ton_dau_ky;
                                        tr_first+=td_nhap_trong_ky
                                        tr_first +=td_xuat_trong_ky;
                                        tr_first+=td_ton_cuoi_ky;
                                        tr_first+=td_dv_cungung
                                        tr_first +=`</tr>`;
                                    }
                                    else{
                                        var td_ten_duoc_lieu = `<td class="thongke_chitiet" donvi_id="${donvi_id}" ten_donvi="${ten_donvi}" id_sp="${sanpham.id_sanpham}" ten_khoa_hoc=${ten_khoa_hoc} ma_sp ="${ma_sanpham}" ten_sp="${ten_duoc_lieu}">` + (ten_khoa_hoc? (ten_duoc_lieu + " - " + ten_khoa_hoc) : ten_duoc_lieu) + `</td>`;
                                        var td_ton_dau_ky = `<td class="text-right">` + (ton_dau_ky? Number(ton_dau_ky).toLocaleString("de-DE") : 0) + `</td>`;
                                        var td_nhap_trong_ky = `<td class="text-right">` + (nhap_trong_ky? Number(nhap_trong_ky).toLocaleString("de-DE") : 0) +`</td>`;
                                        var td_xuat_trong_ky = `<td class="text-right">` + (xuat_trong_ky? Number(xuat_trong_ky).toLocaleString("de-DE") : 0) + `</td>`;
                                        var td_ton_cuoi_ky = `<td class="text-right">` + (ton_cuoi_ky? Number(ton_cuoi_ky).toLocaleString("de-DE") : 0) + `</td>`;
                                        var td_dv_cungung = `<td>` + (ten_dv_cungung? ten_dv_cungung : "") + `</td>`;
                                        tr_first +=td_ten_duoc_lieu;
                                        tr_first+=td_ton_dau_ky;
                                        tr_first+=td_nhap_trong_ky
                                        tr_first +=td_xuat_trong_ky;
                                        tr_first+=td_ton_cuoi_ky;
                                        tr_first+=td_dv_cungung
                                        tr_first +=`</tr>`;
                                    }
                                }
                                else{
                                    var td_ten_duoc_lieu = `<td class="thongke_chitiet" donvi_id="${donvi_id}" ten_donvi="${ten_donvi}" id_sp="${sanpham.id_sanpham}" ten_khoa_hoc=${ten_khoa_hoc} ma_sp ="${ma_sanpham}" ten_sp="${ten_duoc_lieu}" rowspan ="` + (chitiet_nhap_xuat.length+1) + `">` + (ten_khoa_hoc? (ten_duoc_lieu + " - " + ten_khoa_hoc) : ten_duoc_lieu) + `</td>`;
                                    var td_ton_dau_ky = `<td class="text-right">` + (ton_dau_ky? Number(ton_dau_ky).toLocaleString("de-DE") : 0) + `</td>`;
                                    var td_nhap_trong_ky = `<td class="text-right">` + (nhap_trong_ky? Number(nhap_trong_ky).toLocaleString("de-DE") : 0) +`</td>`;
                                    var td_xuat_trong_ky = `<td class="text-right">` + (xuat_trong_ky? Number(xuat_trong_ky).toLocaleString("de-DE") : 0) + `</td>`;
                                    var td_ton_cuoi_ky = `<td class="text-right">` + (ton_cuoi_ky? Number(ton_cuoi_ky).toLocaleString("de-DE") : 0) + `</td>`;
                                    var td_dv_cungung = `<td></td>`;
                                    tr_first +=td_ten_duoc_lieu;
                                    tr_first+=td_ton_dau_ky;
                                    tr_first+=td_nhap_trong_ky
                                    tr_first +=td_xuat_trong_ky;
                                    tr_first+=td_ton_cuoi_ky;
                                    tr_first+=td_dv_cungung	;
                                    tr_first +=`</tr>`;
                                    for (var k=0;k<chitiet_nhap_xuat.length;k++){
                                        var ma_dv_cungung = chitiet_nhap_xuat[k].ma_dv_cungung;
                                        if (ma_dv_cungung == "TG"){
                                            var tr_tmp = `<tr>
                                            <td></td>
                                            <td class="text-right">` + (chitiet_nhap_xuat[k].soluong_nhap? Number(chitiet_nhap_xuat[k].soluong_nhap).toLocaleString("de-DE") : "") + `</td>
                                            <td class="text-right">` + (chitiet_nhap_xuat[k].soluong_xuat? Number(chitiet_nhap_xuat[k].soluong_xuat).toLocaleString("de-DE") : "") + `</td>
                                            <td></td>
                                            <td class= "text-primary ` + donvi_id + `" id = "` + sanpham.id_sanpham + `" donvi_id = "` + donvi_id + `">` + (chitiet_nhap_xuat[k].ten_dv_cungung? chitiet_nhap_xuat[k].ten_dv_cungung : "") + `</td>
                                            </tr>`;
                                            list_tr.push(tr_tmp);
                                        }
                                        else if (ma_dv_cungung == "THNT" || ma_dv_cungung == "THKT"){
                                            var tr_tmp = `<tr>
                                            <td></td>
                                            <td class="text-right">` + (chitiet_nhap_xuat[k].soluong_nhap? Number(chitiet_nhap_xuat[k].soluong_nhap).toLocaleString("de-DE") : "") + `</td>
                                            <td class="text-right">` + (chitiet_nhap_xuat[k].soluong_xuat? Number(chitiet_nhap_xuat[k].soluong_xuat).toLocaleString("de-DE") : "") + `</td>
                                            <td></td>
                                            <td class="text-primary">` + (chitiet_nhap_xuat[k].ten_dv_cungung? chitiet_nhap_xuat[k].ten_dv_cungung : "") + `</td>
                                            </tr>`;
                                            list_tr.push(tr_tmp);
                                        }
                                        else{
                                            var tr_tmp = `<tr>
                                            <td></td>
                                            <td class="text-right">` + (chitiet_nhap_xuat[k].soluong_nhap? Number(chitiet_nhap_xuat[k].soluong_nhap).toLocaleString("de-DE") : "") + `</td>
                                            <td class="text-right">` + (chitiet_nhap_xuat[k].soluong_xuat? Number(chitiet_nhap_xuat[k].soluong_xuat).toLocaleString("de-DE") : "") + `</td>
                                            <td></td>
                                            <td>` + (chitiet_nhap_xuat[k].ten_dv_cungung? chitiet_nhap_xuat[k].ten_dv_cungung : "") + `</td>
                                            </tr>`;
                                            list_tr.push(tr_tmp);
                                        }
                                    }
                                }
                            }
                            else{
                                var chitiet_nhap_xuat = sanpham.chitiet_nhap_xuat;
                                if (chitiet_nhap_xuat === undefined || chitiet_nhap_xuat === null){
                                    chitiet_nhap_xuat = [];
                                }
                                if (chitiet_nhap_xuat.length == 0){
                                    var tr_tmp = `<tr>
                                        <td class="thongke_chitiet" donvi_id="${donvi_id}" ten_donvi="${ten_donvi}" id_sp="${sanpham.id_sanpham}" ten_khoa_hoc=${ten_khoa_hoc} ma_sp ="${ma_sanpham}" ten_sp="${ten_duoc_lieu}">` + (ten_khoa_hoc? (ten_duoc_lieu + " - " + ten_khoa_hoc) : ten_duoc_lieu) + `</td>
                                        <td class="text-right">` + (ton_dau_ky? Number(ton_dau_ky).toLocaleString("de-DE") : 0) + `</td>
                                        <td class="text-right">` + (nhap_trong_ky? Number(nhap_trong_ky).toLocaleString("de-DE") : 0) + `</td>
                                        <td class="text-right">` + (xuat_trong_ky? Number(xuat_trong_ky).toLocaleString("de-DE") : 0) + `</td>
                                        <td class="text-right">` + (ton_cuoi_ky? Number(ton_cuoi_ky).toLocaleString("de-DE") : 0) + `</td>
                                        <td></td>
                                    </tr>`;
                                    list_tr.push(tr_tmp);	
                                }
                                else if ((chitiet_nhap_xuat.length ==1) && (chitiet_nhap_xuat[0].soluong_nhap == nhap_trong_ky) && (chitiet_nhap_xuat[0].soluong_xuat == xuat_trong_ky)){
                                    var ten_dv_cungung = chitiet_nhap_xuat[0].ten_dv_cungung;
                                    var ma_dv_cungung = chitiet_nhap_xuat[0].ma_dv_cungung;
                                    if (ma_dv_cungung == "TG"){
                                        var tr_tmp = `<tr>
                                        <td class="thongke_chitiet" donvi_id="${donvi_id}" ten_donvi="${ten_donvi}" id_sp="${sanpham.id_sanpham}" ten_khoa_hoc=${ten_khoa_hoc} ma_sp ="${ma_sanpham}" ten_sp="${ten_duoc_lieu}">` + (ten_khoa_hoc? (ten_duoc_lieu + " - " + ten_khoa_hoc) : ten_duoc_lieu) + `</td>
                                        <td class="text-right">` + (ton_dau_ky? Number(ton_dau_ky).toLocaleString("de-DE") : 0) + `</td>
                                        <td class="text-right">` + (nhap_trong_ky? Number(nhap_trong_ky).toLocaleString("de-DE") : 0) + `</td>
                                        <td class="text-right">` + (xuat_trong_ky? Number(xuat_trong_ky).toLocaleString("de-DE") : 0) + `</td>
                                        <td class="text-right">` + (ton_cuoi_ky? Number(ton_cuoi_ky).toLocaleString("de-DE") : 0) + `</td>
                                        <td class= "text-primary ` + donvi_id + `" id = "` + sanpham.id_sanpham + `" donvi_id = "` + donvi_id + `">` + (ten_dv_cungung? ten_dv_cungung : "") + `</td>
                                        </tr>`;
                                        list_tr.push(tr_tmp);	

                                    }
                                    else if (ma_dv_cungung == "THNT" || ma_dv_cungung == "THKT"){
                                        var tr_tmp = `<tr>
                                        <td class="thongke_chitiet" donvi_id="${donvi_id}" ten_donvi="${ten_donvi}" id_sp="${sanpham.id_sanpham}" ten_khoa_hoc=${ten_khoa_hoc} ma_sp ="${ma_sanpham}" ten_sp="${ten_duoc_lieu}">` + (ten_khoa_hoc? (ten_duoc_lieu + " - " + ten_khoa_hoc) : ten_duoc_lieu) + `</td>
                                        <td class="text-right">` + (ton_dau_ky? Number(ton_dau_ky).toLocaleString("de-DE") : 0) + `</td>
                                        <td class="text-right">` + (nhap_trong_ky? Number(nhap_trong_ky).toLocaleString("de-DE") : 0) + `</td>
                                        <td class="text-right">` + (xuat_trong_ky? Number(xuat_trong_ky).toLocaleString("de-DE") : 0) + `</td>
                                        <td class="text-right">` + (ton_cuoi_ky? Number(ton_cuoi_ky).toLocaleString("de-DE") : 0) + `</td>
                                        <td class="text-primary">` + (ten_dv_cungung? ten_dv_cungung : "") + `</td>
                                        </tr>`;
                                        list_tr.push(tr_tmp);
                                    }
                                    else{
                                        var tr_tmp = `<tr>
                                        <td class="thongke_chitiet" donvi_id="${donvi_id}" ten_donvi="${ten_donvi}" id_sp="${sanpham.id_sanpham}" ten_khoa_hoc=${ten_khoa_hoc} ma_sp ="${ma_sanpham}" ten_sp="${ten_duoc_lieu}">` + (ten_khoa_hoc? (ten_duoc_lieu + " - " + ten_khoa_hoc) : ten_duoc_lieu) + `</td>
                                        <td class="text-right">` + (ton_dau_ky? Number(ton_dau_ky).toLocaleString("de-DE") : 0) + `</td>
                                        <td class="text-right">` + (nhap_trong_ky? Number(nhap_trong_ky).toLocaleString("de-DE") : 0) + `</td>
                                        <td class="text-right">` + (xuat_trong_ky? Number(xuat_trong_ky).toLocaleString("de-DE") : 0) + `</td>
                                        <td class="text-right">` + (ton_cuoi_ky? Number(ton_cuoi_ky).toLocaleString("de-De") : 0) + `</td>
                                        <td>` + (ten_dv_cungung? ten_dv_cungung : "") + `</td>
                                        </tr>`;
                                        list_tr.push(tr_tmp);	
                                    }

                                }
                                else{
                                    var td_ten_duoc_lieu = `<td class="thongke_chitiet" donvi_id="${donvi_id}" ten_donvi="${ten_donvi}" id_sp="${sanpham.id_sanpham}" ten_khoa_hoc=${ten_khoa_hoc} ma_sp ="${ma_sanpham}" ten_sp="${ten_duoc_lieu}" rowspan ="` + (chitiet_nhap_xuat.length+1) + `">` + (ten_khoa_hoc? (ten_duoc_lieu + " - " + ten_khoa_hoc) : ten_duoc_lieu) + `</td>`;
                                    var td_ton_dau_ky = `<td class="text-right">` + (ton_dau_ky? Number(ton_dau_ky).toLocaleString("de-DE") : 0) + `</td>`;
                                    var td_nhap_trong_ky = `<td class="text-right">` + (nhap_trong_ky? Number(nhap_trong_ky).toLocaleString("de-DE") : 0) +`</td>`;
                                    var td_xuat_trong_ky = `<td class="text-right">` + (xuat_trong_ky? Number(xuat_trong_ky).toLocaleString("de-DE") : 0) + `</td>`;
                                    var td_ton_cuoi_ky = `<td class="text-right">` + (ton_cuoi_ky? Number(ton_cuoi_ky).toLocaleString("de-DE") : 0) + `</td>`;
                                    var td_dv_cungung = `<td></td>`;
                                    var tr_second = `<tr>`;
                                    tr_second +=td_ten_duoc_lieu;
                                    tr_second +=td_ton_dau_ky;
                                    tr_second +=td_nhap_trong_ky;
                                    tr_second +=td_xuat_trong_ky;
                                    tr_second +=td_ton_cuoi_ky;
                                    tr_second +=td_dv_cungung;
                                    tr_second += `</tr>`;
                                    list_tr.push(tr_second);
                                    for (var k=0;k<chitiet_nhap_xuat.length;k++){
                                        var ma_dv_cungung = chitiet_nhap_xuat[k].ma_dv_cungung;
                                        if (ma_dv_cungung == "TG"){
                                            var tr_tmp = `<tr>
                                            <td></td>
                                            <td class="text-right">` + (chitiet_nhap_xuat[k].soluong_nhap? Number(chitiet_nhap_xuat[k].soluong_nhap).toLocaleString("de-DE") : "") + `</td>
                                            <td class="text-right">` + (chitiet_nhap_xuat[k].soluong_xuat? Number(chitiet_nhap_xuat[k].soluong_xuat).toLocaleString("de-DE") : "") + `</td>
                                            <td></td>
                                            <td class= "text-primary ` + donvi_id + `" id = "` + sanpham.id_sanpham + `" donvi_id = "` + donvi_id + `">` + (chitiet_nhap_xuat[k].ten_dv_cungung? chitiet_nhap_xuat[k].ten_dv_cungung : "") + `</td>
                                            </tr>`;
                                            list_tr.push(tr_tmp);
                                        }
                                        else if (ma_dv_cungung == "THNT" || ma_dv_cungung == "THKT"){
                                            var tr_tmp = `<tr>
                                            <td></td>
                                            <td class="text-right">` + (chitiet_nhap_xuat[k].soluong_nhap? Number(chitiet_nhap_xuat[k].soluong_nhap).toLocaleString("de-DE") : "") + `</td>
                                            <td class="text-right">` + (chitiet_nhap_xuat[k].soluong_xuat? Number(chitiet_nhap_xuat[k].soluong_xuat).toLocaleString("de-DE") : "") + `</td>
                                            <td></td>
                                            <td class="text-primary">` + (chitiet_nhap_xuat[k].ten_dv_cungung? chitiet_nhap_xuat[k].ten_dv_cungung : "") + `</td>
                                            </tr>`;
                                            list_tr.push(tr_tmp);
                                        }
                                        else{
                                            var tr_tmp = `<tr>
                                            <td></td>
                                            <td class="text-right">` + (chitiet_nhap_xuat[k].soluong_nhap? Number(chitiet_nhap_xuat[k].soluong_nhap).toLocaleString("de-DE") : "") + `</td>
                                            <td class="text-right">` + (chitiet_nhap_xuat[k].soluong_xuat? Number(chitiet_nhap_xuat[k].soluong_xuat).toLocaleString("de-DE") : "") + `</td>
                                            <td></td>
                                            <td>` + (chitiet_nhap_xuat[k].ten_dv_cungung? chitiet_nhap_xuat[k].ten_dv_cungung : "") + `</td>
                                            </tr>`;
                                            list_tr.push(tr_tmp);
                                        }
                                    }
                                }
                            }
                        }
                        self.$el.find(".thongkebaocao-xuatnhapton .body-data").append(tr_first);
                        for (var index= 0; index <list_tr.length; index ++){
                            var tr = list_tr[index];
                            self.$el.find(".thongkebaocao-xuatnhapton .body-data").append(tr);
                        }
                    }
                }
            }

            if (Array.isArray(list_baocao) && list_baocao.length >0){
                let length = list_baocao.length;
                for (var i=0; i<length; i++){
                    var item = list_baocao[i];
                    var donvi_id = item.donvi_id;
                    var list_sanpham = item.list_sanpham;
                    for (var j =0; j< list_sanpham.length; j++){
                        var sanpham = list_sanpham[j];
                        var id_sanpham = sanpham.id_sanpham;
                        if (!!id_sanpham && !!donvi_id){
                            self.$el.find(".thongkebaocao-xuatnhapton .body-data #" + id_sanpham + "." +donvi_id).unbind("click"). bind("click", function(){
                                var params = {
                                    "donvi_id" : $(this).attr("donvi_id"),
                                    "id_sanpham" : $(this).attr("id")
                                }
                                var thongke_thugom = new Thongke_thugomm({viewData : {data : params}});
                                thongke_thugom.dialog({size : "large"});
                            })
                        }
                    }
                }
            }
            let xml_thongke_chitiet = self.$el.find(".thongke_chitiet");
            let xml_length = xml_thongke_chitiet.length;
            for (let i=0; i<xml_length;i++){
                let xml = xml_thongke_chitiet[i];
                let id_sanpham = $(xml).attr("id_sp");
                let donvi_id = $(xml).attr("donvi_id");
                let ten_donvi = $(xml).attr("ten_donvi");
                let ma_sanpham = $(xml).attr("ma_sp");
                let ten_khoa_hoc = $(xml).attr("ten_khoa_hoc");
                let ten_sanpham = $(xml).attr("ten_sp");
                let tungay = self.model.get("tungay");
                let denngay = self.model.get("denngay");
                let params = {
                    ngay_bat_dau: tungay,
                    ngay_ket_thuc: denngay,
                    id_sanpham,
                    donvi_id,
                    ten_donvi,
                    ten_sanpham,
                    ten_khoa_hoc,
                    ma_viettat: ma_sanpham
                }
                $(xml).unbind("click").bind("click", {data: params}, (event) =>{
                    event.stopPropagation();
                    let data = event.data.data;
                    if (!!data){
                        let chitietNhapXuat = new ChitietNhapXuat({viewData: {"filters" :params}});
                        chitietNhapXuat.dialog({size:'large'});
                    }
                })
            }


        },
        register_event: function(){
            var self = this;
            self.$el.find(".btn-search").unbind("click").bind("click",function(e){
				e.stopPropagation();
				e.preventDefault();
                let ngay_bat_dau = self.model.get("tungay");
                let ngay_ket_thuc = self.model.get("denngay");
				if (ngay_bat_dau === undefined || ngay_bat_dau === null){
					self.getApp().notify({message: "Vui lòng chọn ngày bắt đầu."}, { type : "danger", delay : 3000});
					return false;
				}
				else if (ngay_ket_thuc === undefined || ngay_ket_thuc === null){
					self.getApp().notify({message: "Vui lòng chọn ngày kết thúc."}, { type : "danger", delay : 3000});
					return false;
				}
				else{
					if (ngay_ket_thuc < ngay_bat_dau){
						self.getApp().notify({message: "Vui lòng chọn ngày kết thúc lớn hơn ngày bắt đầu."}, { type : "danger", delay : 3000});
						return false;
					}
					else {
                        // self.congdon_duoc_lieu(ngay_bat_dau,ngay_ket_thuc);
                        let $selectz1 = (self.$el.find("#chonduoclieu")[0]);
                        let id_sanpham = "";
                        if (!!$selectz1 && !!$selectz1.selectize){
                            id_sanpham =  $selectz1.selectize.getValue();
                        }
                        let $selectz2 = (self.$el.find("#donvi-board")[0]);
                        let donvi_id = "";
                        if (!!$selectz2 && !!$selectz2.selectize){
                            donvi_id = $selectz2.selectize.getValue();
                        }
                        self.congdon_phanphoi(ngay_bat_dau, ngay_ket_thuc, donvi_id, id_sanpham);
					}
				}				
            });

            self.$el.find(".btn-clean").unbind("click").bind("click",function(e){
				e.stopPropagation();
                e.preventDefault();
                var firstDay = new Date(moment().year(), moment().month(), 1);
                var lastDay = new Date();
                self.model.set("tungay", firstDay);
                if (typeof self.model.get("tungay") !== "string"){
					self.model.set("tungay", self.parse_date_custom(firstDay));
				}
                self.model.set("denngay",self.parse_date_custom((moment(lastDay).set({hour:23,minute:59,second:59,millisecond:59}))));
				var $selectz = (self.$el.find('#donvi-board'))[0];
				if (!!$selectz && !! $selectz.selectize){
					self.$el.find('#donvi-board').selectize()[0].selectize.clear();
				}
				var $selectz1 = (self.$el.find('#chonduoclieu'))[0];
				if (!!$selectz1 && !!$selectz1.selectize){
					self.$el.find('#chonduoclieu').selectize()[0].selectize.clear();
				}
				self.$el.find(".btn-search").click();				
            });
            
            self.$el.find(".btn-excel").unbind("click").bind("click",function(e){
				e.stopPropagation();
				e.preventDefault();
                let ngay_bat_dau = self.model.get("tungay");
                let ngay_ket_thuc = self.model.get("denngay");
				if (ngay_bat_dau === undefined || ngay_bat_dau === null){
					self.getApp().notify({message: "Vui lòng chọn ngày bắt đầu."}, { type : "danger", delay : 3000});
					return false;
				}
				else if (ngay_ket_thuc === undefined || ngay_ket_thuc === null){
					self.getApp().notify({message: "Vui lòng chọn ngày kết thúc."}, { type : "danger", delay : 3000});
					return false;
				}
				else{
					if (ngay_ket_thuc < ngay_bat_dau){
						self.getApp().notify({message: "Vui lòng chọn ngày kết thúc lớn hơn ngày bắt đầu."}, { type : "danger", delay : 3000});
						return false;
					}
					else {
                        // self.congdon_duoc_lieu(ngay_bat_dau,ngay_ket_thuc);
                        let $selectz1 = (self.$el.find("#chonduoclieu")[0]);
                        let id_sanpham = "";
                        if (!!$selectz1 && !!$selectz1.selectize){
                            id_sanpham =  $selectz1.selectize.getValue();
                        }
                        let $selectz2 = (self.$el.find("#donvi-board")[0]);
                        let donvi_id = "";
                        if (!!$selectz2 && !!$selectz2.selectize){
                            donvi_id = $selectz2.selectize.getValue();
                        }
                        self.xuatExcel(ngay_bat_dau, ngay_ket_thuc, donvi_id, id_sanpham);
					}
				}				
            });
        },
        congdon_phanphoi: function(tungay, denngay, donvi_id, id_sanpham){
            var self = this;
            let url = (self.getApp().serviceURL || "") + '/api/v1/thongke_phanphoi';
			$.ajax({
				url: url,
				type: 'POST',
				data: JSON.stringify({"ngay_bat_dau":tungay, "ngay_ket_thuc":denngay, "id_sanpham":id_sanpham,"donvi_id":donvi_id}),
				headers: {
					'content-type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				},
				success: function(response) {
					if (!!response){
                        self.$el.find(".body-data").html("");
                        let list_baocao = response.list_baocao;
                        self.showData(list_baocao);
					}
				},
				error: function(xhr, status, error) {
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
        },
        xuatExcel: function(tungay, denngay, donvi_id, id_sanpham){
            var self = this;
			let url = (self.getApp().serviceURL || "") + '/api/v1/excel/thongke_phanphoi';
			let params = {
				ngay_bat_dau: tungay,
				ngay_ket_thuc: denngay,
				id_sanpham,
				donvi_id,
				ten_donvi: self.ten_donvi,
				ten_sanpham: self.ten_sanpham,
				ten_khoa_hoc: self.ten_khoa_hoc,
				ma_viettat: self.ma_viettat
			}
			$.ajax({
				url: url,
				type: 'POST',
				data: JSON.stringify(params),
				headers: {
					'content-type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				},
				success: function(response) {
					if (!!response){
                        window.open(response, "_blank");
					}
				},
				error: function(xhr, status, error) {
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
    });

});