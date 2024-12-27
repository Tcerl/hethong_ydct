define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/thongke/tpl/thongke_doanhnghiep.html');
    var Thongke_thugomm = require("app/thongke/Thongke_thugom");
    var Thongke_nhapxuat = require("app/thongke/Thongke_nhapxuat");



    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: {
            "tungay": {
                "type": "string"
            },
            "denngay": {
                "type": "string"
            }
        },
    	urlPrefix: "/api/v1/",
        collectionName: "thongke",
        id_sanpham: null,
        donvi_id: null,
        arrTonKho: [],
    	tools : [
    	    {
    	    	name: "defaultgr",
    	    	type: "group",
    	    	groupClass: "toolbar-group",
    	    	buttons: [
					{
						name: "back",
						type: "button",
						buttonClass: "btn-secondary waves-effect width-sm",
						label: "TRANSLATE:BACK",
						command: function(){
							var self = this;
							Backbone.history.history.back();
						}
					},
    	    	],
    	    }],
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
            self.id_sanpham = null;
            self.donvi_id = null;
            self.arrTonKho = [];
            let currentUser = gonrinApp().currentUser;
            if (!!currentUser){
                self.donvi_id = currentUser.donvi_id;
            }
            self.applyBindings();
            self.register_event();
            self.$el.find("#filter-condition").val("1");
            self.$el.find("#filter-condition").trigger("change");
            self.selectizeDuoclieu('chonduoclieu', self.donvi_id);
            self.selectizeDuoclieu('chonduoclieu1', self.donvi_id);
        },
        getTonKhoDuocLieu: function(){
            var self  = this;
            let url = (self.getApp().serviceURL || "") + '/api/v1/get_duoclieu_tonkho_hientai';
            $.ajax({
				url: url,
                type: 'POST',
                data: JSON.stringify({donvi_id: self.donvi_id}),
				headers: {
					'content-type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				},
				success: function(response) {
					if (!!response){
                        let list_duoclieu = response.objects;
                        if (Array.isArray(list_duoclieu) == false){
                            list_duoclieu = [];
                        }
                        let count = response.count;
                        if (count == 0){
                            let createDanhmuc = false;
                            self.$el.find("#exampleModalCenter").modal("show");
                            self.$el.find('#exampleModalCenter .btn-create').unbind("click").bind("click", (e)=>{
                                createDanhmuc = true;
                            })
                            self.$el.find("#exampleModalCenter").on("hidden.bs.modal", function (e) {
                                if (createDanhmuc == true) {
                                    self.getApp().getRouter().navigate("sanpham_donvi/create");
                                }
                                else{
                                    self.$el.find(".thongke-donvi").html("");
                                    self.$el.find(".thongke-donvi").append(`
                                        <div class="col-12">
                                            <h5 class="text-danger">Vui lòng thiết lập danh mục dược của liệu đơn vị để sử dụng đầy đủ chức năng của hệ thống</h5>
                                            <button class="btn btn-sm btn-primary btn-create">Tạo danh mục</button>
                                        </div>
                                    `);
                                    self.$el.find(".thongke-donvi .btn-create").unbind("click").bind("click", ()=>{
                                        self.getApp().getRouter().navigate("sanpham_donvi/create");
                                    })
                                }
                            });
                        }
                        
                        else if (list_duoclieu.length ==0){
                            self.$el.find("#exampleModalCenter1").modal("show");
                            let createPhieuNhap = false;
                            self.$el.find('#exampleModalCenter1 .btn-create').unbind("click").bind("click", (e)=>{
                                createPhieuNhap = true;
                            })
                            self.$el.find("#exampleModalCenter1").on("hidden.bs.modal", function (e) {
                                if (createPhieuNhap == true) {
                                    self.getApp().getRouter().navigate("phieunhapkho/model");
                                }
                                else{
                                    self.$el.find(".thongke-donvi").html("");
                                    self.$el.find(".thongke-donvi").append(`
                                        <div class="col-12">
                                            <h5 class="text-danger">Vui lòng cập nhật số lượng Nhập/Xuất</h5>
                                            <button class="btn btn-sm btn-primary btn-create">Tạo phiếu nhập</button>
                                        </div>
                                    `);
                                    self.$el.find(".thongke-donvi .btn-create").unbind("click").bind("click", ()=>{
                                        self.getApp().getRouter().navigate("phieunhapkho/model");
                                    })
                                }
                            });
                        }
                        self.arrTonKho = list_duoclieu;
                        self.showTonKho(list_duoclieu);
                        self.showPieChart(list_duoclieu);
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
        showTonKho: function(list_duoclieu){
            var self = this;
            self.$el.find("#duoclieu_trongkho tbody").html("");
            let length = list_duoclieu.length;
            if (length>0){
                self.$el.find(".list_duoclieu").removeClass("d-none");
            }
            else{
                self.$el.find("#duoclieu_trongkho tbody").html(`<tr>
                    <td class="text-primary" colspan="4">Không có dữ liệu</td>
                </tr>`);
            }
            for (let i=0; i<length; i++){
                let item = list_duoclieu[i];
                let id_sanpham = item.id_sanpham;
                self.$el.find("#duoclieu_trongkho tbody").append(`
                    <tr id ="${item.id_sanpham}">
                        <td class="text-center">${i+1}</td>
                        <td class="text-primary ten_sanpham">${item.ten_sanpham? item.ten_sanpham: ""}</td>
                        <td>${item.ma_sanpham? item.ma_sanpham: ""}</td>
                        <td class="text-right text-primary soluong">${item.soluong? Number(item.soluong).toLocaleString("de-DE"): 0}</td>
                    </tr>
                `);
                self.$el.find(`#${item.id_sanpham}`).unbind("click").bind("click",{data: id_sanpham} ,(e)=>{
                    if (!!e){
                        e.stopPropagation();
                        self.$el.find("#duoclieu_trongkho tr").removeClass("text-danger");
                        self.$el.find(`#duoclieu_trongkho .ten_sanpham`).removeClass("text-danger").addClass("text-primary");
                        self.$el.find(`#duoclieu_trongkho .soluong`).removeClass("text-danger").addClass("text-primary");
                        let id_sanpham = e.data.data;
                        self.$el.find(`#${id_sanpham}`).addClass("text-danger");
                        self.$el.find(`#${id_sanpham} .ten_sanpham`).addClass("text-danger").removeClass("text-primary");
                        self.$el.find(`#${id_sanpham} .soluong`).addClass("text-danger").removeClass("text-primary");
                        self.$el.find(".thongkebaocao-xuatnhapton.sanpham").removeClass("d-none");
                        self.id_sanpham = id_sanpham;
                        self.congdon_phanphoi(self.model.get("tungay"), self.model.get("denngay"), self.donvi_id, self.id_sanpham);
                        let select_duoclieu = (self.$el.find("#chonduoclieu"))[0];
                        if (!!select_duoclieu && select_duoclieu.selectize){
                            select_duoclieu.selectize.setValue(id_sanpham);
                        }
                    }

                });
            }
        },
        showPieChart: function(list_duoclieu){
            var self = this;
            if (Array.isArray(list_duoclieu) === false){
                list_duoclieu = [];
            }
            //show 6 cai
            let arr= [];
            let arrKhac = [];
            let length = list_duoclieu.length;
            let total = 0;
            if (length >6){
                for (let i=0; i<6; i++){
                    let item = list_duoclieu[i];
                    let tmp = [];
                    tmp.push(`${item.ten_sanpham}-${item.ma_sanpham}`, item.soluong);
                    arr.push(tmp);
                    total += item.soluong;
                }
                let soluong = 0;
                for (let i=6; i< length; i++){
                    let item = list_duoclieu[i];
                    soluong += item.soluong;
                    total += item.soluong;
                    let ten_sanpham = item.ten_sanpham;
                    let tmp = {
                        id: ten_sanpham,
                        value: item.soluong
                    }
                    arrKhac.push(tmp);
                }
                let objs = [];
                objs.push('Khác',soluong);
                arr.push(objs);
            }
            else{
                arr = list_duoclieu.map((value) =>{
                    return [`${value.ten_sanpham}-${value.ma_sanpham}`, value.soluong];
                })
            }
            let chart = c3.generate({
                bindto: `#pie-chart`,
                data: {
                    type: 'pie',
                    columns: arr,
                    onmouseover: function(elemData){
                    },
                },
                tooltip: {
                    show: true,
                    contents: function(d,defaultTitleFormat,defaultValueFormat, color){
                        let objs = d[0];
                        let elColor = color(objs);
                        if (!!objs){
                            if (objs.id === "Khác"){
                                let xml = `<div class="row custom-c3-tooltip">`;
                                xml += arrKhac.map((item)=>{
                                    return `<div class="col-5 border-right"><svg width="20" height="20">
                                    <rect width="20" height="15" style="fill:${elColor}" />
                                  </svg> <span>${item.id?item.id:""}</span></div>
                                        <div class="col-7">
                                            <label>Số lượng: <span>${item.value? Number(item.value).toLocaleString("de-DE"): 0} (KG)</span></label>
                                            <label>Tỉ lệ: <span>${item.value? Number(item.value/total*100).toFixed(1): 0} (%)</span></label>
                                        </div>`
                                }).join("");
                                xml+=`</div>`;
                                return xml;
                            }
                            else{
                                return `<div class="row custom-c3-tooltip">
                                <div class="col-5 border-right">
                                <svg width="20" height="20">
                                <rect width="20" height="15" style="fill:${elColor}" />
                              </svg>  <span>${objs.id?objs.id:""}</span>
                                </div>
                                <div class="col-7">
                                    <label>Số lượng: <span>${objs.value? Number(objs.value).toLocaleString("de-DE"): 0} (KG)</span></label>
                                    <label>Tỉ lệ: <span>${objs.ratio? Number(objs.ratio*100).toFixed(1): 0} (%)</span></label>
                                </div>
                            
                            </div>`
                            }
                        }
                    },
                    position: function (data, width, height, element) {
                        return {top: 0, left: 0};
                    }
                },
                legend: {
                    show: true
                }
            });
        },
        showPieChartXuatKho: function(list_duoclieu){
            var self = this;
            if (Array.isArray(list_duoclieu) === false){
                list_duoclieu = [];
            }
            //show 6 cai
            let arr= [];
            let arrKhac = [];
            let length = list_duoclieu.length;
            let total = 0;
            if (length >6){
                for (let i=0; i<6; i++){
                    let item = list_duoclieu[i];
                    let tmp = [];
                    tmp.push(`${item.ten_sanpham}-${item.ma_sanpham}`, item.soluong);
                    arr.push(tmp);
                    total += item.soluong;
                }
                let soluong = 0;
                for (let i=6; i< length; i++){
                    let item = list_duoclieu[i];
                    soluong += item.soluong;
                    total += item.soluong;
                    let ten_sanpham = item.ten_sanpham;
                    let tmp = {
                        id: ten_sanpham,
                        value: item.soluong
                    }
                    arrKhac.push(tmp);
                }
                let objs = [];
                objs.push('Khác',soluong);
                arr.push(objs);
            }
            else{
                arr = list_duoclieu.map((value) =>{
                    return [`${value.ten_sanpham}-${value.ma_sanpham}`, value.soluong];
                })
            }
            let chart = c3.generate({
                bindto: `#pie-chart-xuat`,
                data: {
                    type: 'pie',
                    columns: arr,
                    onmouseover: function(elemData){
                    },
                },
                tooltip: {
                    show: true,
                    contents: function(d,defaultTitleFormat,defaultValueFormat, color){
                        let objs = d[0];
                        let elColor = color(objs);
                        if (!!objs){
                            if (objs.id === "Khác"){

                                let xml = `<div class="row custom-c3-tooltip">`;
                                xml += arrKhac.map((item)=>{
                                    return `<div class="col-5 border-right"><svg width="20" height="20">
                                    <rect width="20" height="15" style="fill:${elColor}" />
                                  </svg> <span>${item.id?item.id:""}</span></div>
                                        <div class="col-7">
                                            <label>Số lượng: <span>${item.value? Number(item.value).toLocaleString("de-DE"): 0} (KG)</span></label>
                                            <label>Tỉ lệ: <span>${item.value? Number(item.value/total*100).toFixed(1): 0} (%)</span></label>
                                        </div>`
                                }).join("");
                                xml+=`</div>`;
                                return xml;
                            }
                            else{
                                return `<div class="row custom-c3-tooltip">
                                <div class="col-5 border-right">
                                <svg width="20" height="20">
                                <rect width="20" height="15" style="fill:${elColor}" />
                              </svg>  <span>${objs.id?objs.id:""}</span>
                                </div>
                                <div class="col-7">
                                    <label>Số lượng: <span>${objs.value? Number(objs.value).toLocaleString("de-DE"): 0} (KG)</span></label>
                                    <label>Tỉ lệ: <span>${objs.ratio? Number(objs.ratio*100).toFixed(1): 0} (%)</span></label>
                                </div>
                            
                            </div>`
                            }
                        }
                    },
                    position: function (data, width, height, element) {
                        return {top: 0, left: 0};
                    }
                },
                legend: {
                    show: true
                }
            });
        },
        congdon_phanphoi: function(tungay, denngay, donvi_id, id_sanpham){
            var self = this;
            let url = (self.getApp().serviceURL || "") + '/api/vi/thongke_donvi';
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
                        self.$el.find(".thongkebaocao-xuatnhapton").removeClass("d-none");
                        self.$el.find(".filter-search").removeClass("d-none");
                        let list_baocao = response.list_baocao;
                        // self.showDataPhanPhoi(list_baocao);
                        self.showDataPhanPhoiNew(list_baocao);
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
        showDataPhanPhoi: function(list_baocao){
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
                            if (j==0){
                                var chitiet_nhap_xuat = sanpham.chitiet_nhap_xuat;
                                if (chitiet_nhap_xuat === undefined || chitiet_nhap_xuat === null){
                                    chitiet_nhap_xuat = [];
                                }
                                if (chitiet_nhap_xuat.length == 0){
                                    var td_ten_duoc_lieu = `<td>` + (ten_khoa_hoc? (ten_duoc_lieu + " - " + ten_khoa_hoc) : ten_duoc_lieu) + `</td>`;
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
                                        var td_ten_duoc_lieu = `<td>` + (ten_khoa_hoc? (ten_duoc_lieu + " - " + ten_khoa_hoc) : ten_duoc_lieu) + `</td>`;
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
                                        var td_ten_duoc_lieu = `<td>` + (ten_khoa_hoc? (ten_duoc_lieu + " - " + ten_khoa_hoc) : ten_duoc_lieu) + `</td>`;
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
                                        var td_ten_duoc_lieu = `<td>` + (ten_khoa_hoc? (ten_duoc_lieu + " - " + ten_khoa_hoc) : ten_duoc_lieu) + `</td>`;
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
                                    var td_ten_duoc_lieu = `<td rowspan ="` + (chitiet_nhap_xuat.length+1) + `">` + (ten_khoa_hoc? (ten_duoc_lieu + " - " + ten_khoa_hoc) : ten_duoc_lieu) + `</td>`;
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
                                        <td>` + (ten_khoa_hoc? (ten_duoc_lieu + " - " + ten_khoa_hoc) : ten_duoc_lieu) + `</td>
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
                                        <td>` + (ten_khoa_hoc? (ten_duoc_lieu + " - " + ten_khoa_hoc) : ten_duoc_lieu) + `</td>
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
                                        <td>` + (ten_khoa_hoc? (ten_duoc_lieu + " - " + ten_khoa_hoc) : ten_duoc_lieu) + `</td>
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
                                        <td>` + (ten_khoa_hoc? (ten_duoc_lieu + " - " + ten_khoa_hoc) : ten_duoc_lieu) + `</td>
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
                                    var td_ten_duoc_lieu = `<td rowspan ="` + (chitiet_nhap_xuat.length+1) + `">` + (ten_khoa_hoc? (ten_duoc_lieu + " - " + ten_khoa_hoc) : ten_duoc_lieu) + `</td>`;
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
        },
        register_event: function(){
            var self = this;
            self.$el.find("#filter-condition").on("change", (e)=>{
                e.stopPropagation();
                let filter = self.$el.find("#filter-condition").val();
                //Danh muc san pham
                if (filter == 1){
                    let select_duoclieu = (self.$el.find("#chonduoclieu1"))[0];
                    if (!!select_duoclieu && select_duoclieu.selectize){
                        select_duoclieu.selectize.clear();
                    }
                    self.$el.find(".sanpham").removeClass("d-none");
                    self.$el.find(".list_co").addClass("d-none");
                    self.$el.find(".co_info").addClass("d-none");
                    self.$el.find(".list_cq").addClass("d-none");
                    self.$el.find(".cq_info").addClass("d-none");
                    self.$el.find(".list_giayphep").addClass("d-none");
                    self.$el.find(".giayphep_info").addClass("d-none");
                    let firstDay = new Date(moment().year(), moment().month(), 1);
                    let lastDay = new Date();
                    self.model.set("tungay", firstDay);
                    self.model.set("denngay",self.parse_date_custom((moment(lastDay).set({hour:23,minute:59,second:59,millisecond:59}))));
                    self.getTonKhoDuocLieu();
                    self.congdon_phanphoi(self.model.get("tungay"), self.model.get("denngay"), self.donvi_id, null);
                    self.getSoluongXuat(self.model.get("tungay"), self.model.get("denngay"), self.donvi_id);
                }
                //Danh sach CO
                else if (filter ==2){
                    self.$el.find(".sanpham").addClass("d-none");
                    self.$el.find(".list_co").removeClass("d-none");
                    self.$el.find(".list_cq").addClass("d-none");
                    self.$el.find(".cq_info").addClass("d-none");
                    self.$el.find(".list_giayphep").addClass("d-none");
                    self.$el.find(".giayphep_info").addClass("d-none");
                    self.getCo();
                }
                //Danh sach CQ
                else if (filter ==3){
                    self.$el.find(".sanpham").addClass("d-none");
                    self.$el.find(".list_co").addClass("d-none");
                    self.$el.find(".co_info").addClass("d-none");
                    self.$el.find(".list_giayphep").addClass("d-none");
                    self.$el.find(".giayphep_info").addClass("d-none");
                    self.$el.find(".list_cq").removeClass("d-none");
                    self.getCQ();
                }
                else if (filter ==4){
                    self.$el.find(".sanpham").addClass("d-none");
                    self.$el.find(".list_co").addClass("d-none");
                    self.$el.find(".co_info").addClass("d-none");
                    self.$el.find(".list_cq").addClass("d-none");
                    self.$el.find(".cq_info").addClass("d-none");
                    self.$el.find(".list_giayphep").removeClass("d-none");
                    self.getNhapKhau();
                }
            });
            self.$el.find(".btn-search").unbind("click").bind("click", ()=>{
                self.congdon_phanphoi(self.model.get("tungay"), self.model.get("denngay"), self.donvi_id, self.id_sanpham);
                self.getSoluongXuat(self.model.get("tungay"), self.model.get("denngay"), self.donvi_id);
            });
            self.$el.find(".btn-clean").unbind("click").bind("click", (e)=>{
                e.stopPropagation();
                self.id_sanpham = null;
                let firstDay = new Date(moment().year(), moment().month(), 1);
                let lastDay = new Date();
                self.model.set("tungay", firstDay);
                if (typeof self.model.get("tungay") !== "string"){
					self.model.set("tungay", self.parse_date_custom(firstDay));
				}
                self.model.set("denngay",self.parse_date_custom((moment(lastDay).set({hour:23,minute:59,second:59,millisecond:59}))));
                self.$el.find("#duoclieu_trongkho tr").removeClass("text-primary");
                self.$el.find(".btn-search").click();
                let select_duoclieu = (self.$el.find("#chonduoclieu"))[0];
                self.$el.find("#duoclieu_trongkho tr").removeClass("text-danger");
                self.$el.find(`#duoclieu_trongkho .ten_sanpham`).removeClass("text-danger").addClass("text-primary");
                self.$el.find(`#duoclieu_trongkho .soluong`).removeClass("text-danger").addClass("text-primary");
                if (!!select_duoclieu && select_duoclieu.selectize){
                    select_duoclieu.selectize.clear();
                }
            });
            self.$el.find(".btn-excel").unbind("click").bind("click",function(e){
				e.stopPropagation();
				e.preventDefault();
                self.xuatExcel(self.model.get("tungay"), self.model.get("denngay"), self.donvi_id, self.id_sanpham);			
            });
        },
        getCo: function(){
            var self  = this;
            let url = (self.getApp().serviceURL || "") + '/api/v1/giaychungnhanco?results_per_page=50';
            $.ajax({
				url: url,
                type: 'GET',
				headers: {
					'content-type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				},
				success: function(response) {
					if (!!response){
                        let list_co = response.objects;
                        if (Array.isArray(list_co) === false){
                            list_co = [];
                        }
                        self.showDataCo(list_co)
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
        showDataCo: function(list_co){
            var self = this;
            let length = list_co.length;
            self.$el.find('#list_co tbody').html("");
            if (length === 0){
                self.$el.find("#list_co tbody").html(`<tr>
                <td class="text-primary" colspan="4">Không có dữ liệu</td>
            </tr>`);
            }

            for (let i=0; i<length; i++){
                let item = list_co[i];
                let chitiet_giayphep = item.chitiet_giayphep;
                if (Array.isArray(chitiet_giayphep) === false){
                    chitiet_giayphep = [];
                }
                let text_sanpham = chitiet_giayphep.map((value)=>{
                    return value.ten_sanpham;
                }).join(', ');
                self.$el.find('#list_co tbody').append(`
                    <tr id="${item.id}">
                        <td>${i+1}</td>
                        <td>${text_sanpham}</td>
                        <td>${item.so_co}</td>
                        <td>${gonrinApp().parseInputDateString(item.thoigian_cap_co).format('DD/MM/YYYY')}</td>
                    </tr>
                `);
                self.$el.find(`#${item.id}`).unbind("click").bind("click",{data: item}, (e)=>{
                    if (!!e){
                        self.$el.find(".co_info").removeClass("d-none");
                        self.$el.find(`#list_co tr`).removeClass("text-danger");
                        self.$el.find(`#${item.id}`).addClass("text-danger");
                        e.stopPropagation();
                        //show thông tin CO                        
                        let chungnhan_co = e.data.data;
                        if (!!chungnhan_co){
                            self.$el.find(".so_co span").text(chungnhan_co.so_co);
                            self.$el.find(".so_giay_phep span").text(chungnhan_co.so_giay_phep? chungnhan_co.so_giay_phep: "");
                            self.$el.find(".thoigian_cap_co span").text(gonrinApp().parseInputDateString(chungnhan_co.thoigian_cap_co).format('DD/MM/YYYY'));
                            self.$el.find(".ten_donvi_sanxuat span").text(chungnhan_co.ten_donvi_sanxuat? chungnhan_co.ten_donvi_sanxuat: "");
                            let quocgia_donvi_sanxuat = chungnhan_co.quocgia_donvi_sanxuat;
                            let ten_quocgia_sanxuat = "";
                            if (!!quocgia_donvi_sanxuat){
                                ten_quocgia_sanxuat = quocgia_donvi_sanxuat.ten;
                            }
                            self.$el.find(".quocgia_donvi_sanxuat span").text(ten_quocgia_sanxuat);
                            self.$el.find(".ten_donvi_phanphoi span").text(chungnhan_co.ten_donvi_phanphoi? chungnhan_co.ten_donvi_phanphoi: "");
                            let quocgia_donvi_phanphoi = chungnhan_co.quocgia_donvi_phanphoi;
                            let ten_quocgia_phanphoi = "";
                            if (!!quocgia_donvi_phanphoi){
                                ten_quocgia_phanphoi = quocgia_donvi_phanphoi.ten;
                            }
                            self.$el.find(".quocgia_donvi_phanphoi span").text(ten_quocgia_phanphoi);
                            self.$el.find(".ngay_khoi_hanh span").text(gonrinApp().parseInputDateString(chungnhan_co.ngay_khoi_hanh));
                            self.$el.find(".ngay_nhap_canh span").text(gonrinApp().parseInputDateString(chungnhan_co.ngay_nhap_canh));
                            self.$el.find(".donvi_chungnhan_co span").text(chungnhan_co.donvi_chungnhan_co? chungnhan_co.donvi_chungnhan_co: "");
                            self.$el.find(".ten_duoclieu span").text(text_sanpham);

                        //show soluong CO
                        let chitiet_giayphep = chungnhan_co.chitiet_giayphep;
                        self.showSoluongCo(chitiet_giayphep);
                        }

                    }   
                });
            }
        },
        getSoluongXuat: function(tungay, denngay, donvi_id){
            var self = this;
            let url = (self.getApp().serviceURL || "") + '/api/v1/getphieuxuat';
			$.ajax({
				url: url,
				type: 'POST',
				data: JSON.stringify({"ngay_bat_dau":tungay, "ngay_ket_thuc":denngay,"donvi_id":donvi_id}),
				headers: {
					'content-type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				},
				success: function(response) {
					if (!!response){
                        let list_duoclieu = response.objects;
                        if (Array.isArray(list_duoclieu) == false){
                            list_duoclieu = [];
                        }
                        self.showPieChartXuatKho(list_duoclieu);
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
							return `<div class="option">${item.ten_sanpham} - ${item.ten_khoa_hoc} - ${item.ma_sanpham}</div>`;
						}
					},
					onChange: function(value, isOnInitialize) {

                        var $selectz = (self.$el.find(`#${html_id}`))[0];
						var obj = $selectz.selectize.options[value];
						if (obj !== undefined && obj !== null){
                            self.id_sanpham = value;
                            if (html_id === "chonduoclieu1"){
                                let arr = self.arrTonKho.filter((val)=>{
                                    return val.id_sanpham ==  value;
                                })
                                self.showTonKho(arr);
                            }
						}
						else{
                            self.id_sanpham = null;
                            if (html_id=== "chonduoclieu1"){
                                self.showTonKho(self.arrTonKho);
                            }
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
                            return `<div class="option">${item.ten_sanpham} - ${item.ten_khoa_hoc} - ${item.ma_sanpham}</div>`;
                        }
                    },
                    onChange: function(value, isOnInitialize) {
						var $selectz = (self.$el.find("#chonduoclieu"))[0];
						var obj = $selectz.selectize.options[value];
						if (obj !== undefined && obj !== null){
                            self.id_sanpham = value;
						}
						else{
                            self.id_sanpham = null;
						}
                    }
                });
            }
        },
        showDataPhanPhoiNew: function(list_baocao){
            var self = this;
            self.$el.find(".thongkebaocao-xuatnhapton .body-data").html("");
            //báo cáo đơn vị chỉ có 1 báo cáo trả về
            if (Array.isArray(list_baocao) === true && list_baocao.length ==1){
                let list_sanpham = list_baocao[0].list_sanpham;
                if  (Array.isArray(list_sanpham)=== false){
                    list_sanpham = [];
                }
                let length = list_sanpham.length;
                for (let i=0; i<length;i++){
                    let item_sanpham = list_sanpham[i];
                    self.$el.find(".thongkebaocao-xuatnhapton .body-data").append(`
                        <tr id="${item_sanpham.id_sanpham}_${item_sanpham.ma_kho}">        
                            <td>${item_sanpham.ten_duoc_lieu? item_sanpham.ten_duoc_lieu : ""}</td>
                            <td>${item_sanpham.ten_kho? item_sanpham.ten_kho: ""}</td>
                            <td class="text-right">${item_sanpham.ton_dau_ky? Number(item_sanpham.ton_dau_ky).toLocaleString("de-DE"): 0}</td>
                            <td class="text-right">${item_sanpham.nhap_trong_ky? Number(item_sanpham.nhap_trong_ky).toLocaleString("de-DE"):0}</td>
                            <td class="text-right">${item_sanpham.xuat_trong_ky? Number(item_sanpham.xuat_trong_ky).toLocaleString("de-DE"):0}</td>
                            <td class="text-right">${item_sanpham.ton_cuoi_ky? Number(item_sanpham.ton_cuoi_ky).toLocaleString("de-DE"):0}</td>
                            <td class="chitiet text-primary custom-chitiet-nhapxuat">Chi tiết</td>
                        </tr>
                    `);
                    let chitiet_nhap_xuat = item_sanpham.chitiet_nhap_xuat;
                    self.$el.find(`#${item_sanpham.id_sanpham}_${item_sanpham.ma_kho}`).unbind("click").bind("click",{data: chitiet_nhap_xuat}, (e)=>{
                        if (!!e && !!e.data.data){
                            e.stopPropagation();
                            let params = e.data.data;
                            let thongke_nhapxuat = new Thongke_nhapxuat({viewData: params});
                            thongke_nhapxuat.dialog({size:"large"});
                        }
                    })
                }
            }
        },
        showSoluongCo: function(chitiet_giayphep){
            var self = this;
            self.$el.find(".soluong_conlai_co .body-data").html("");
            if (Array.isArray(chitiet_giayphep) === false){
                chitiet_giayphep = [];
            }
            let length = chitiet_giayphep.length;
            for (let i=0; i<length; i++){
                let item_co = chitiet_giayphep[i];
                let soluong_danhap = item_co.soluong_danhap;
                if (!soluong_danhap){
                    soluong_danhap = 0;
                }
                let soluong = item_co.soluong;
                if (!soluong){
                    soluong = 0;
                }
                let soluong_conlai = soluong - soluong_danhap;
                if (!soluong_conlai){
                    soluong_conlai = 0;
                }
                let ten_sanpham = item_co.ten_sanpham;
                self.$el.find(".soluong_conlai_co .body-data").append(`
                
                    <tr>
                        <td>${ten_sanpham}</td>
                        <td class="text-right">${soluong? Number(soluong).toLocaleString("de-DE"): 0}</td>
                        <td class="text-right">${soluong_danhap? Number(soluong_danhap).toLocaleString("de-DE"): 0}</td>
                    </tr>
                `);
            }
        },
        getCQ: function(){
            var self  = this;
            let url = (self.getApp().serviceURL || "") + '/api/v1/phieu_kiem_nghiem';
            $.ajax({
				url: url,
                type: 'GET',
				headers: {
					'content-type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				},
				success: function(response) {
					if (!!response){
                        let list_cq = response.objects;
                        if (Array.isArray(list_cq) === false){
                            list_cq = [];
                        }
                        self.showDataCq(list_cq)
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
        showDataCq: function(list_cq){
            var self = this;
            self.$el.find('#list_cq tbody').html("");
            let length = list_cq.length;
            if (length === 0){
                self.$el.find("#list_cq tbody").html(`<tr>
                <td class="text-primary" colspan="4">Không có dữ liệu</td>
            </tr>`);
            }
            for (let i=0; i<length; i++){
                let item = list_cq[i];
                self.$el.find('#list_cq tbody').append(`
                    <tr id="${item.id}">
                        <td>${i+1}</td>
                        <td>${item.ten_sanpham}</td>
                        <td>${item.ma_kiem_nghiem}</td>
                        <td>${gonrinApp().parseInputDateString(item.ngay_kiem_nghiem).format('DD/MM/YYYY')}</td>
                    </tr>
                `);
                self.$el.find(`#${item.id}`).unbind("click").bind("click",{data: item}, (e)=>{
                    if (!!e){
                        self.$el.find(".cq_info").removeClass("d-none");
                        self.$el.find("#list_cq tr").removeClass("text-danger");
                        self.$el.find(`#${item.id}`).addClass("text-danger");
                        e.stopPropagation();
                        //show thông tin CO                        
                        let chungnhan_cq = e.data.data;
                        if (!!chungnhan_cq){
                            self.$el.find(".ma_kiem_nghiem span").text(chungnhan_cq.ma_kiem_nghiem? chungnhan_cq.ma_kiem_nghiem: "");
                            self.$el.find(".ngay_kiem_nghiem span").text(gonrinApp().parseInputDateString(item.ngay_kiem_nghiem).format('DD/MM/YYYY'));
                            self.$el.find(".ten_sanpham span").text(chungnhan_cq.ten_sanpham? chungnhan_cq.ten_sanpham: "");
                            self.$el.find(".ten_donvi_cap span").text(chungnhan_cq.ten_donvi_cap? chungnhan_cq.ten_donvi_cap: "");
                            self.$el.find(".diachi_donvi_cap span").text(chungnhan_cq.diachi_donvi_cap? chungnhan_cq.diachi_donvi_cap: "");
                            self.$el.find(".ten_donvi_yeucau span").text(chungnhan_cq.ten_donvi_yeucau? chungnhan_cq.ten_donvi_yeucau: "");
                            self.$el.find(".nguoi_lay_mau span").text(chungnhan_cq.nguoi_lay_mau? chungnhan_cq.nguoi_lay_mau: "");
                            self.$el.find(".nguoi_giao_mau span").text(chungnhan_cq.nguoi_giao_mau? chungnhan_cq.nguoi_giao_mau: "");
                            self.$el.find(".nguoi_nhan_mau span").text(chungnhan_cq.nguoi_nhan_mau? chungnhan_cq.nguoi_nhan_mau: "");
                            self.$el.find(".tinh_trang_mau span").text(chungnhan_cq.tinh_trang_mau? chungnhan_cq.tinh_trang_mau: "");
                            self.$el.find(".noi_san_suat span").text(chungnhan_cq.noi_san_suat? chungnhan_cq.noi_san_suat: "");
                            self.$el.find(".nuoc_sanxuat span").text(chungnhan_cq.nuoc_sanxuat? chungnhan_cq.nuoc_sanxuat: "");
                        }
                    }   
                });
            }
        },
        getNhapKhau: function(){
            var self  = this;
            let url = (self.getApp().serviceURL || "") + '/api/v1/giayphep_nhapkhau';
            $.ajax({
				url: url,
                type: 'GET',
				headers: {
					'content-type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				},
				success: function(response) {
					if (!!response){
                        let list_giayphep = response.objects;
                        if (Array.isArray(list_giayphep) === false){
                            list_giayphep = [];
                        }
                        self.showDataNhapKhau(list_giayphep)
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
        showDataNhapKhau: function(list_giayphep){
            var self = this;
            self.$el.find('#list_giayphep tbody').html("");
            let length = list_giayphep.length;
            if (length === 0){
                self.$el.find("#list_giayphep tbody").html(`<tr>
                <td class="text-primary" colspan="4">Không có dữ liệu</td>
            </tr>`);
            }
            for (let i=0; i<length; i++){
                let item = list_giayphep[i];
                let chitiet_giayphep = item.chitiet_giayphep;
                if (Array.isArray(chitiet_giayphep) === false){
                    chitiet_giayphep = [];
                }
                let text_sanpham = chitiet_giayphep.map((value)=>{
                    return value.ten_sanpham;
                }).join(', ');
                self.$el.find('#list_giayphep tbody').append(`
                    <tr id="${item.id}">
                        <td>${i+1}</td>
                        <td>${text_sanpham}</td>
                        <td>${item.so_giay_phep}</td>
                        <td>${gonrinApp().parseInputDateString(item.thoigian_capphep).format('DD/MM/YYYY')}</td>
                    </tr>
                `);
                self.$el.find(`#${item.id}`).unbind("click").bind("click",{data: item}, (e)=>{
                    if (!!e){
                        self.$el.find(".giayphep_info").removeClass("d-none");
                        self.$el.find("#list_giayphep tr").removeClass("text-danger");
                        self.$el.find(`#${item.id}`).addClass("text-danger");
                        e.stopPropagation();
                        let giayphep = e.data.data;
                        if (!!giayphep){
                            self.$el.find(".so_giay_phep span").text(giayphep.so_giay_phep? giayphep.so_giay_phep: "");
                            self.$el.find(".thoigian_capphep span").text(gonrinApp().parseInputDateString(item.thoigian_capphep).format('DD/MM/YYYY'));
                            self.$el.find(".thoigian_hieuluc_batdau span").text(gonrinApp().parseInputDateString(item.thoigian_hieuluc_batdau).format('DD/MM/YYYY'));
                            self.$el.find(".thoigian_hieuluc_ketthuc span").text(gonrinApp().parseInputDateString(item.thoigian_hieuluc_ketthuc).format('DD/MM/YYYY'));
                            self.$el.find(".duoclieu_nhapkhau span").text(text_sanpham);

                        }                    

                    }   
                });
            }
        },
        xuatExcel: function(tungay, denngay, donvi_id, id_sanpham){
            var self = this;
			let url = (self.getApp().serviceURL || "") + '/api/v1/excel/thongke_donvi';
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