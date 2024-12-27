define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/thongke/tpl/chitiet_thugom.html');
    var ChungNhanCo = require('app/giaychungnhanco/ModalViewData');
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
                self.showData(list_baocao);

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
                            { "loai_donvi": { "$eq": 4} },
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
            if (Array.isArray(list_baocao) && list_baocao.length >0){
                let length = list_baocao.length;
                for (var i =0; i<length; i++){
                    var item = list_baocao[i];
                    var ten_donvi = item.ten_donvi;
                    var list_sanpham = list_baocao[i]["list_sanpham"];
                    if (list_sanpham === undefined || list_sanpham === null){
                        list_sanpham = [];
                    }
                    var counter = list_sanpham.length;
                    var tr_first = `<tr>
                        <td rowspan = "` + counter + `">` + (ten_donvi? ten_donvi : "") + `</td>
                    `;
                    var list_tr = [];
                    if (list_sanpham.length>0){
                        for (var j=0; j<list_sanpham.length; j++){
                            var sanpham = list_sanpham[j];
                            var ten_duoc_lieu = sanpham.ten_duoc_lieu;
                            var ten_khoa_hoc = sanpham.ten_khoa_hoc;
                            var so_luong_thumua = sanpham.so_luong_thumua;
                            var diachi_thumua = sanpham.diachi_thumua;
                            var dongia = sanpham.dongia;
                            var so_co = sanpham.so_co;
                            var chungnhan_co_id = sanpham.chungnhan_co_id;
                            if (j==0){
                                var td_ten_duoc_lieu = `<td>` + (ten_khoa_hoc? (ten_duoc_lieu + " - " + ten_khoa_hoc) : ten_duoc_lieu) + `</td>`;
                                var td_so_luong_thumua = `<td class ="text-right">` + (so_luong_thumua? Number(so_luong_thumua).toLocaleString("de-DE") : 0) + `</td>`;
                                var td_so_co = "";
                                if (!!chungnhan_co_id && chungnhan_co_id !== ""){
                                    td_so_co = `<td><a class="chungnhanco" chungnhan_co_id ="${chungnhan_co_id}" href="javascript:void(0)">` +so_co + ` </a></td>`;
                                }
                                else{
                                    td_so_co = `<td>` + (so_co? so_co : "") + `</td>`;
                                }
                                var td_diachi_thumua = `<td>` + (diachi_thumua? diachi_thumua : "") + `</td>`;
                                var td_dongia = `<td class="text-right">` + (dongia? Number(dongia).toLocaleString("de-DE") : "") + `</td>`;
                                tr_first += td_ten_duoc_lieu;
                                tr_first += td_so_luong_thumua;	
                                tr_first += td_diachi_thumua;
                                tr_first += td_dongia;
                                tr_first += td_so_co;
                                tr_first += `</tr>`;
                            }
                            else{
                                var tr_second = `<tr>`;
                                var td_ten_duoc_lieu = `<td>` + (ten_khoa_hoc? (ten_duoc_lieu + " - " + ten_khoa_hoc) : ten_duoc_lieu) + `</td>`;
                                var td_so_luong_thumua = `<td class ="text-right">` + (so_luong_thumua? Number(so_luong_thumua).toLocaleString("de-DE") : 0) + `</td>`;
                                var td_so_co = "";
                                if (!!chungnhan_co_id && chungnhan_co_id !== ""){
                                    td_so_co = `<td><a class="chungnhanco" chungnhan_co_id ="${chungnhan_co_id}" href="javascript:void(0)">` +so_co + ` </a></td>`;
                                }
                                else{
                                    td_so_co = `<td>` + (so_co? so_co : "") + `</td>`;
                                }
                                var td_diachi_thumua = `<td>` + (diachi_thumua? diachi_thumua : "") + `</td>`;
                                var td_dongia = `<td class="text-right">` + (dongia? Number(dongia).toLocaleString("de-DE") : "") + `</td>`;
                                tr_second += td_ten_duoc_lieu;
                                tr_second += td_so_luong_thumua;	
                                tr_second += td_diachi_thumua;
                                tr_second += td_dongia;
                                tr_second += td_so_co;
                                tr_second += `</tr>`;
                                list_tr.push(tr_second);
                            }
                        }
                        self.$el.find(".thongkebaocao-thugom .body-data").append(tr_first);
                        for (var index = 0; index < list_tr.length; index ++){
                            var tr = list_tr[index];
                            self.$el.find(".thongkebaocao-thugom .body-data").append(tr);
                        }
                    }
                }
                let chungnhanco_a = self.$el.find("a.chungnhanco");
                let len_a = chungnhanco_a.length;
                for (let i=0; i<len_a; i++){
                    let item_a = chungnhanco_a[i];
                    let chungnhan_co_id = $(item_a).attr("chungnhan_co_id");
                    $(item_a).unbind("click").bind("click", {data: chungnhan_co_id}, (e)=>{
                        if (!!e){
                            e.stopPropagation();
                            let tmp = e.data.data;
                            let co = new ChungNhanCo({viewData: {"id" :  tmp}});
                            co.dialog({size: "large"});
                        }
                    });
                }
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
                        self.congdon_thugom(ngay_bat_dau, ngay_ket_thuc, donvi_id, id_sanpham);
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
        congdon_thugom: function(tungay, denngay, donvi_id, id_sanpham){
            var self = this;
			let url = (self.getApp().serviceURL || "") + '/api/v1/thongke_thugom';
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
			let url = (self.getApp().serviceURL || "") + '/api/v1/excel/thongke_thugom';
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