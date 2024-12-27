define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/thongke/tpl/newmodel.html');
    var Thongke_thugomm = require("app/thongke/Thongke_thugom");
	var ChitietNhapKhau = require('app/thongke/ChitietNhapKhau');
    var ChitietThuGom   = require('app/thongke/ChitietThuGom');
    var ChitietPhanPhoi = require('app/thongke/ChitietPhanPhoi');
    var ChitietNuoitrong = require('app/thongke/ChitietNuoitrong');
    var ChitietKhaiThac = require('app/thongke/ChitietKhaiThac');

    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: {
            "loai_bao_cao": {
				"type": "number"
			},
			"donvi_id" : {
				"type" : "string"
            },
            "tungay": {
                "type": "string"
            },
            "denngay": {
                "type":"string"
            }
		},
    	urlPrefix: "/api/v1/",
    	collectionName: "thongke",
		state: null,
        setIdDuoclieuChart: false,
		setIdDuoclieuChartDonvi: false,
		ten_donvi: null,
		ten_sanpham: null,
		ten_khoa_hoc: null,
		ma_viettat: null,
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
					{
						field:"loai_bao_cao",
						uicontrol:"combobox",
						textField: "text",
						valueField: "value",
						cssClass:"form-control loai_bao_cao",
							dataSource: [
							{ value: 2, text: "Báo Cáo Nhập Khẩu" },
							{ value: 1, text: "Báo Cáo Xuất Nhập Tồn" },
							{ value: 3, text: "Báo Cáo Thu Gom" },
						],
					},
            	]
			},
    	render:function(){
            var self = this;
            self.setIdDuoclieuChart = false;
			self.setIdDuoclieuChartDonvi = false;
			self.ten_donvi = null;
            self.applyBindings();
            self.register_event();
			var firstDay = new Date(moment().year(), moment().month(), 1);
			var lastDay = new Date();
			self.model.set("tungay", firstDay);
            self.model.set("denngay",self.parse_date_custom((moment(lastDay).set({hour:23,minute:59,second:59,millisecond:59}))));
            // self.congdon_duoc_lieu(self.model.get("tungay"), self.model.get("denngay"));
            
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
                        self.congdon_nhapkhau(ngay_bat_dau, ngay_ket_thuc, donvi_id, id_sanpham);
                        self.congdon_thugom(ngay_bat_dau, ngay_ket_thuc, donvi_id, id_sanpham);
                        self.congdon_phanphoi(ngay_bat_dau, ngay_ket_thuc, donvi_id, id_sanpham);
                        self.congdon_nuoitrong(ngay_bat_dau, ngay_ket_thuc, donvi_id, id_sanpham);
                        self.congdon_khaithac(ngay_bat_dau, ngay_ket_thuc, donvi_id, id_sanpham);
					}
				}				
            });
            
            self.$el.find(".btn-search").click();				

			self.$el.find(".btn-clean").unbind("click").bind("click",function(e){
				e.stopPropagation();
                e.preventDefault();
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

		},
		render_chart:function(){
			var self = this;
			var donvi_id = null;
			self.$el.find("#morris-bar-stacked").html("");
			var $selectz = (self.$el.find('#donvi-chart'))[0];
			if ($selectz !== undefined &&  $selectz.selectize !== undefined && $selectz.selectize !== null){
				var obj = $selectz.selectize.getValue();
				if (obj !== null && obj !== undefined && obj !=="") {
					donvi_id = obj;
				}
			}
			var id_sanpham = null;
			var selectz_duoc_lieu = (self.$el.find("#duoclieu-chart"))[0];
			if (selectz_duoc_lieu !== undefined && selectz_duoc_lieu !== null){
				var tmp = selectz_duoc_lieu.selectize.getValue();
				if (tmp !== null && tmp !== undefined && tmp !== ""){
					id_sanpham = tmp;
				}
			}
			var url = (self.getApp().serviceURL || "") + '/api/v1/thongke-chart';
			$.ajax({
				url: url,
				type: 'POST',
				data: JSON.stringify({"id_sanpham":id_sanpham,"donvi_id":donvi_id}),
				headers: {
					'content-type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				},
				success: function(response) {
					
					var MorrisCharts = function() {};

					//creates Stacked chart
					MorrisCharts.prototype.createStackedChart  = function(element, data, xkey, ykeys, labels, lineColors) {
						Morris.Bar({
							element: element,
							data: data,
							xkey: xkey,
							ykeys: ykeys,
							stacked: true,
							labels: labels,
							hideHover: 'auto',
							dataLabels: false,
							resize: true, //defaulted to true
							gridLineColor: 'rgba(65, 80, 95, 0.07)',
							barColors: lineColors
						});
					},
					MorrisCharts.prototype.init = function() {

						//creating Stacked chart
						var $stckedData  = [];
						// var $stckedData  = [
						// 	{ y: '2007', a: 45, b: 180, c: 100 },
						// 	{ y: '2008', a: 75,  b: 65, c: 80 },
						// 	{ y: '2009', a: 100, b: 90, c: 56 },
						// 	{ y: '2010', a: 75,  b: 65, c: 89 },
						// 	{ y: '2011', a: 100, b: 90, c: 120 },
						// 	{ y: '2012', a: 75,  b: 65, c: 110 },
						// 	{ y: '2013', a: 50,  b: 40, c: 85 },
						// 	{ y: '2014', a: 75,  b: 65, c: 52 },
						// 	{ y: '2015', a: 50,  b: 40, c: 77 },
						// 	{ y: '2016', a: 75,  b: 65, c: 90 },
						// 	{ y: '2017', a: 100, b: 90, c: 130 },
						// 	{ y: '2018', a: 80, b: 65, c: 95 }
						// ];
						//{"key":key, "month":month, "year":year, "loai_vattu":nhom_vattu,"ton_dau_ky":0,"nhap_trong_ky":0,"xuat_trong_ky":0,"ton_cuoi_ky":0}
						for(var i=0; i< response.list_baocao.length; i++){
							var item = response.list_baocao[i];
							$stckedData.push({ y: (item.month+'-'+item.year), a: item.xuat_trong_ky, b: item.nhap_trong_ky, c: item.ton_cuoi_ky })
						}
						var colors = ['#1abc9c','#3bafda','#e3eaef'];
						var dataColors = $("#morris-bar-stacked").data('colors');
						if (dataColors) {
							colors = dataColors.split(",");
						}
						this.createStackedChart('morris-bar-stacked', $stckedData, 'y', ['a', 'b', 'c'], ["SL Xuất", "SL Nhập", "SL Tồn"], colors);
					},
					//init
					$.MorrisCharts = new MorrisCharts, $.MorrisCharts.Constructor = MorrisCharts
					$.MorrisCharts.init();
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
		congdon_duoc_lieu : function(tungay, denngay){
			var self = this;
            let ngay_bat_dau = tungay;
            let ngay_ket_thuc = denngay;
			
			var donvi_id = null;
			var $selectz = (self.$el.find('#selectize-programmatic'))[0];
			if ($selectz !== undefined && $selectz.selectize !== undefined && $selectz.selectize !== null){
				var obj = $selectz.selectize.getValue();
				if (obj !== null && obj !== undefined && obj !== "") {
					donvi_id = obj;
				}
			}
			var loai_bao_cao = self.model.get("loai_bao_cao");
			if (loai_bao_cao === undefined || loai_bao_cao === null){
				loai_bao_cao = 2;
			}
			var id_sanpham = "";
			var selectize_duoclieu = (self.$el.find('#selectize-duoc-lieu'))[0];
			if (selectize_duoclieu.selectize !== undefined && selectize_duoclieu.selectize !== null){
				var obj = selectize_duoclieu.selectize.getValue();
				if (obj !== undefined && obj !== null && obj !== ""){
					id_sanpham = obj;
				}
			}

			var url = (self.getApp().serviceURL || "") + '/api/v1/thongke';
			$.ajax({
				url: url,
				type: 'POST',
				data: JSON.stringify({"ngay_bat_dau":ngay_bat_dau, "ngay_ket_thuc":ngay_ket_thuc, "id_sanpham":id_sanpham,"donvi_id":donvi_id , "loai_bao_cao" : loai_bao_cao}),
				headers: {
					'content-type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				},
				success: function(response) {
					self.$el.find(".body-data").html("");
					if (loai_bao_cao == 1){
						self.$el.find(".thongkebaocao-xuatnhapton").removeClass("d-none");
						self.$el.find(".thongkebaocao-nhapkhau").addClass("d-none");
						self.$el.find(".thongkebaocao-thugom").addClass("d-none");
						var list_counter = [];
						
						if (!!response && response.list_baocao instanceof Array && response.list_baocao.length>0){
							for (var i=0; i<response.list_baocao.length; i++){
								var counter = 0;
								var item = response.list_baocao[i];
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
						if (!!response && response.list_baocao instanceof Array && response.list_baocao.length>0){
							for (var i=0; i<response.list_baocao.length; i++){
								var counter = list_counter[i];
								var item = response.list_baocao[i];
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
												var td_ton_dau_ky = `<td class="text-center">` + (ton_dau_ky? ton_dau_ky : 0) + `</td>`;
												var td_nhap_trong_ky = `<td class="text-center">` + (nhap_trong_ky? nhap_trong_ky : 0) +`</td>`;
												var td_xuat_trong_ky = `<td class="text-center">` + (xuat_trong_ky? xuat_trong_ky : 0) + `</td>`;
												var td_ton_cuoi_ky = `<td class="text-center">` + (ton_cuoi_ky? ton_cuoi_ky : 0) + `</td>`;
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
													var td_ton_dau_ky = `<td class="text-center">` + (ton_dau_ky? ton_dau_ky : 0) + `</td>`;
													var td_nhap_trong_ky = `<td class="text-center">` + (nhap_trong_ky? nhap_trong_ky : 0) +`</td>`;
													var td_xuat_trong_ky = `<td class="text-center">` + (xuat_trong_ky? xuat_trong_ky : 0) + `</td>`;
													var td_ton_cuoi_ky = `<td class="text-center">` + (ton_cuoi_ky? ton_cuoi_ky : 0) + `</td>`;
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
													var td_ton_dau_ky = `<td class="text-center">` + (ton_dau_ky? ton_dau_ky : 0) + `</td>`;
													var td_nhap_trong_ky = `<td class="text-center">` + (nhap_trong_ky? nhap_trong_ky : 0) +`</td>`;
													var td_xuat_trong_ky = `<td class="text-center">` + (xuat_trong_ky? xuat_trong_ky : 0) + `</td>`;
													var td_ton_cuoi_ky = `<td class="text-center">` + (ton_cuoi_ky? ton_cuoi_ky : 0) + `</td>`;
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
													var td_ton_dau_ky = `<td class="text-center">` + (ton_dau_ky? ton_dau_ky : 0) + `</td>`;
													var td_nhap_trong_ky = `<td class="text-center">` + (nhap_trong_ky? nhap_trong_ky : 0) +`</td>`;
													var td_xuat_trong_ky = `<td class="text-center">` + (xuat_trong_ky? xuat_trong_ky : 0) + `</td>`;
													var td_ton_cuoi_ky = `<td class="text-center">` + (ton_cuoi_ky? ton_cuoi_ky : 0) + `</td>`;
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
												var td_ton_dau_ky = `<td class="text-center">` + (ton_dau_ky? ton_dau_ky : 0) + `</td>`;
												var td_nhap_trong_ky = `<td class="text-center">` + (nhap_trong_ky? nhap_trong_ky : 0) +`</td>`;
												var td_xuat_trong_ky = `<td class="text-center">` + (xuat_trong_ky? xuat_trong_ky : 0) + `</td>`;
												var td_ton_cuoi_ky = `<td class="text-center">` + (ton_cuoi_ky? ton_cuoi_ky : 0) + `</td>`;
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
														<td class="text-center">` + (chitiet_nhap_xuat[k].soluong_nhap? chitiet_nhap_xuat[k].soluong_nhap : "") + `</td>
														<td class="text-center">` + (chitiet_nhap_xuat[k].soluong_xuat? chitiet_nhap_xuat[k].soluong_xuat : "") + `</td>
														<td></td>
														<td class= "text-primary ` + donvi_id + `" id = "` + sanpham.id_sanpham + `" donvi_id = "` + donvi_id + `">` + (chitiet_nhap_xuat[k].ten_dv_cungung? chitiet_nhap_xuat[k].ten_dv_cungung : "") + `</td>
														</tr>`;
														list_tr.push(tr_tmp);
													}
													else if (ma_dv_cungung == "THNT" || ma_dv_cungung == "THKT"){
														var tr_tmp = `<tr>
														<td></td>
														<td class="text-center">` + (chitiet_nhap_xuat[k].soluong_nhap? chitiet_nhap_xuat[k].soluong_nhap : "") + `</td>
														<td class="text-center">` + (chitiet_nhap_xuat[k].soluong_xuat? chitiet_nhap_xuat[k].soluong_xuat : "") + `</td>
														<td></td>
														<td class="text-primary">` + (chitiet_nhap_xuat[k].ten_dv_cungung? chitiet_nhap_xuat[k].ten_dv_cungung : "") + `</td>
														</tr>`;
														list_tr.push(tr_tmp);
													}
													else{
														var tr_tmp = `<tr>
														<td></td>
														<td class="text-center">` + (chitiet_nhap_xuat[k].soluong_nhap? chitiet_nhap_xuat[k].soluong_nhap : "") + `</td>
														<td class="text-center">` + (chitiet_nhap_xuat[k].soluong_xuat? chitiet_nhap_xuat[k].soluong_xuat : "") + `</td>
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
													<td class="text-center">` + (ton_dau_ky? ton_dau_ky : 0) + `</td>
													<td class="text-center">` + (nhap_trong_ky? nhap_trong_ky : 0) + `</td>
													<td class="text-center">` + (xuat_trong_ky? xuat_trong_ky : 0) + `</td>
													<td class="text-center">` + (ton_cuoi_ky? ton_cuoi_ky : 0) + `</td>
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
													<td class="text-center">` + (ton_dau_ky? ton_dau_ky : 0) + `</td>
													<td class="text-center">` + (nhap_trong_ky? nhap_trong_ky : 0) + `</td>
													<td class="text-center">` + (xuat_trong_ky? xuat_trong_ky : 0) + `</td>
													<td class="text-center">` + (ton_cuoi_ky? ton_cuoi_ky : 0) + `</td>
													<td class= "text-primary ` + donvi_id + `" id = "` + sanpham.id_sanpham + `" donvi_id = "` + donvi_id + `">` + (ten_dv_cungung? ten_dv_cungung : "") + `</td>
													</tr>`;
													list_tr.push(tr_tmp);	

												}
												else if (ma_dv_cungung == "THNT" || ma_dv_cungung == "THKT"){
													var tr_tmp = `<tr>
													<td>` + (ten_khoa_hoc? (ten_duoc_lieu + " - " + ten_khoa_hoc) : ten_duoc_lieu) + `</td>
													<td class="text-center">` + (ton_dau_ky? ton_dau_ky : 0) + `</td>
													<td class="text-center">` + (nhap_trong_ky? nhap_trong_ky : 0) + `</td>
													<td class="text-center">` + (xuat_trong_ky? xuat_trong_ky : 0) + `</td>
													<td class="text-center">` + (ton_cuoi_ky? ton_cuoi_ky : 0) + `</td>
													<td class="text-primary">` + (ten_dv_cungung? ten_dv_cungung : "") + `</td>
													</tr>`;
													list_tr.push(tr_tmp);
												}
												else{
													var tr_tmp = `<tr>
													<td>` + (ten_khoa_hoc? (ten_duoc_lieu + " - " + ten_khoa_hoc) : ten_duoc_lieu) + `</td>
													<td class="text-center">` + (ton_dau_ky? ton_dau_ky : 0) + `</td>
													<td class="text-center">` + (nhap_trong_ky? nhap_trong_ky : 0) + `</td>
													<td class="text-center">` + (xuat_trong_ky? xuat_trong_ky : 0) + `</td>
													<td class="text-center">` + (ton_cuoi_ky? ton_cuoi_ky : 0) + `</td>
													<td>` + (ten_dv_cungung? ten_dv_cungung : "") + `</td>
													</tr>`;
													list_tr.push(tr_tmp);	
												}

											}
											else{
												var td_ten_duoc_lieu = `<td rowspan ="` + (chitiet_nhap_xuat.length+1) + `">` + (ten_khoa_hoc? (ten_duoc_lieu + " - " + ten_khoa_hoc) : ten_duoc_lieu) + `</td>`;
												var td_ton_dau_ky = `<td class="text-center">` + (ton_dau_ky? ton_dau_ky : 0) + `</td>`;
												var td_nhap_trong_ky = `<td class="text-center">` + (nhap_trong_ky? nhap_trong_ky : 0) +`</td>`;
												var td_xuat_trong_ky = `<td class="text-center">` + (xuat_trong_ky? xuat_trong_ky : 0) + `</td>`;
												var td_ton_cuoi_ky = `<td class="text-center">` + (ton_cuoi_ky? ton_cuoi_ky : 0) + `</td>`;
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
														<td class="text-center">` + (chitiet_nhap_xuat[k].soluong_nhap? chitiet_nhap_xuat[k].soluong_nhap : "") + `</td>
														<td class="text-center">` + (chitiet_nhap_xuat[k].soluong_xuat? chitiet_nhap_xuat[k].soluong_xuat : "") + `</td>
														<td></td>
														<td class= "text-primary ` + donvi_id + `" id = "` + sanpham.id_sanpham + `" donvi_id = "` + donvi_id + `">` + (chitiet_nhap_xuat[k].ten_dv_cungung? chitiet_nhap_xuat[k].ten_dv_cungung : "") + `</td>
														</tr>`;
														list_tr.push(tr_tmp);
													}
													else if (ma_dv_cungung == "THNT" || ma_dv_cungung == "THKT"){
														var tr_tmp = `<tr>
														<td></td>
														<td class="text-center">` + (chitiet_nhap_xuat[k].soluong_nhap? chitiet_nhap_xuat[k].soluong_nhap : "") + `</td>
														<td class="text-center">` + (chitiet_nhap_xuat[k].soluong_xuat? chitiet_nhap_xuat[k].soluong_xuat : "") + `</td>
														<td></td>
														<td class="text-primary">` + (chitiet_nhap_xuat[k].ten_dv_cungung? chitiet_nhap_xuat[k].ten_dv_cungung : "") + `</td>
														</tr>`;
														list_tr.push(tr_tmp);
													}
													else{
														var tr_tmp = `<tr>
														<td></td>
														<td class="text-center">` + (chitiet_nhap_xuat[k].soluong_nhap? chitiet_nhap_xuat[k].soluong_nhap : "") + `</td>
														<td class="text-center">` + (chitiet_nhap_xuat[k].soluong_xuat? chitiet_nhap_xuat[k].soluong_xuat : "") + `</td>
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
						if (!!response && response.list_baocao instanceof Array && response.list_baocao.length >0){
							for (var i=0; i<response.list_baocao.length; i++){
								var item = response.list_baocao[i];
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
					}
					else if (loai_bao_cao == 2){
						self.$el.find(".thongkebaocao-xuatnhapton").addClass("d-none");
						self.$el.find(".thongkebaocao-nhapkhau").removeClass("d-none");
						self.$el.find(".thongkebaocao-thugom").addClass("d-none");
						if (!!response && response.list_baocao instanceof Array && response.list_baocao.length >0){
							for (var i=0; i< response.list_baocao.length; i++){
								var item = response.list_baocao[i];
								var ten_donvi = item.ten_donvi;
								var list_sanpham = item["list_sanpham"];
								if (list_sanpham === undefined || list_sanpham === null){
									list_sanpham = [];
								}
								var counter = list_sanpham.length;
								var tr_first = `<tr>
									<td rowspan = "` + counter + `">` + (ten_donvi? ten_donvi : "") + `</td>
								`;
								var list_tr = []
								if (list_sanpham.length >0){
									for (let j=0; j<list_sanpham.length; j++){
										var sanpham = list_sanpham[j];
										var ten_duoc_lieu = sanpham.ten_duoc_lieu;
										var ten_khoa_hoc = sanpham.ten_khoa_hoc;
										var so_giay_phep = sanpham.so_giay_phep;
										var so_luong_capphep = sanpham.so_luong_capphep;
										var so_luong_nhap = sanpham.so_luong_nhap;
										var so_co = sanpham.so_co;
										var donvi_sanxuat = sanpham.donvi_sanxuat;
										var cuakhau = sanpham.cuakhau;
										var dongia = sanpham.dongia;
										var id_giay_phep = sanpham.id_giay_phep;
										var chungnhan_co_id = sanpham.chungnhan_co_id;
										if (j==0){
											var td_ten_duoc_lieu = `<td>` + (ten_khoa_hoc? (ten_duoc_lieu + " - " + ten_khoa_hoc) : ten_duoc_lieu) + `</td>`;
											var td_so_giay_phep = ``;
											if (!!id_giay_phep && id_giay_phep !== ""){
												td_so_giay_phep = `<td><a target="_blank" href="/#giayphep_nhapkhau/model?id=` + id_giay_phep + `">` +so_giay_phep + ` </a></td>`;
											}
											else{
												td_so_giay_phep = `<td>` + (so_giay_phep? so_giay_phep : "") + `</td>`;
											}
											var td_so_luong_capphep = `<td class ="text-center">` + (so_luong_capphep? so_luong_capphep : 0) + `</td>`;
											var td_so_luong_nhap = `<td class ="text-center">` + (so_luong_nhap? so_luong_nhap : 0) + `</td>`;
											if (so_co === undefined || so_co === null){
												so_co = [];
											}
											if (chungnhan_co_id === undefined || chungnhan_co_id === null){
												chungnhan_co_id = [];
											}
											var td_so_co = `<td>`;
											for (var k=0;k<so_co.length;k++){
												var tmp_td_so_co = "";
												if (!!chungnhan_co_id[k] && chungnhan_co_id[k] !== ""){
													tmp_td_so_co = `<div><a target="_blank" href="/#giaychungnhanco/model?id=` + chungnhan_co_id[k] + `">` +so_co[k] + ` </a></div>`;
												}
												else{
													tmp_td_so_co = `<div>` + (so_co[k]? so_co[k] : "") + `</div>`;
												}
												td_so_co +=tmp_td_so_co;
											}
											td_so_co += `</td>`;
											var td_donvi_sanxuat = `<td>` + (donvi_sanxuat? donvi_sanxuat : "") + `</td>`;
											var td_cuakhau = `<td>` + (cuakhau? cuakhau : "") + `</td>`;
											var td_dongia = `<td>` + (dongia? dongia : "") + `</td>`;
											tr_first += td_ten_duoc_lieu;
											tr_first += td_so_giay_phep;
											tr_first += td_so_luong_capphep;
											tr_first += td_so_luong_nhap;
											tr_first += td_so_co;
											tr_first += td_donvi_sanxuat;
											tr_first += td_cuakhau;
											tr_first += td_dongia;
											tr_first += `</tr>`;
										}
										else{
											var tr_second = `<tr>`;
											var td_ten_duoc_lieu = `<td>` + (ten_khoa_hoc? (ten_duoc_lieu + " - " + ten_khoa_hoc) : ten_duoc_lieu) + `</td>`;
											var td_so_giay_phep = ``;
											if (!!id_giay_phep && id_giay_phep !== ""){
												td_so_giay_phep = `<td><a target="_blank" href="/#giayphep_nhapkhau/model?id=` + id_giay_phep + `">` +so_giay_phep + ` </a></td>`;
											}
											else{
												td_so_giay_phep = `<td>` + (so_giay_phep? so_giay_phep : "") + `</td>`;
											}
											var td_so_luong_capphep = `<td class ="text-center">` + (so_luong_capphep? so_luong_capphep : 0) + `</td>`;
											var td_so_luong_nhap = `<td class ="text-center">` + (so_luong_nhap? so_luong_nhap : 0) + `</td>`;
											if (so_co === undefined || so_co === null){
												so_co = [];
											}
											if (chungnhan_co_id === undefined || chungnhan_co_id === null){
												chungnhan_co_id = [];
											}
											var td_so_co = `<td>`;
											for (var k=0;k<so_co.length;k++){
												var tmp_td_so_co = "";
												if (!!chungnhan_co_id[k] && chungnhan_co_id[k] !== ""){
													tmp_td_so_co = `<div><a target="_blank" href="/#giaychungnhanco/model?id=` + chungnhan_co_id[k] + `">` +so_co[k] + ` </a></div>`;
												}
												else{
													tmp_td_so_co = `<div>` + (so_co[k]? so_co[k] : "") + `</div>`;
												}
												td_so_co +=tmp_td_so_co;
											}
											td_so_co += `</td>`;
											var td_donvi_sanxuat = `<td>` + (donvi_sanxuat? donvi_sanxuat : "") + `</td>`;
											var td_cuakhau = `<td>` + (cuakhau? cuakhau : "") + `</td>`;
											var td_dongia = `<td>` + (dongia? dongia : "") + `</td>`;
											tr_second += td_ten_duoc_lieu;
											tr_second += td_so_giay_phep;
											tr_second += td_so_luong_capphep;
											tr_second += td_so_luong_nhap;
											tr_second += td_so_co;
											tr_second += td_donvi_sanxuat;
											tr_second += td_cuakhau;
											tr_second += td_dongia;
											tr_second += `</tr>`;
											list_tr.push(tr_second);
										}
									}
									self.$el.find(".thongkebaocao-nhapkhau .body-data").append(tr_first);
									for (var index =0; index < list_tr.length; index ++){
										var tr = list_tr[index];
										self.$el.find(".thongkebaocao-nhapkhau .body-data").append(tr);
									}
								}
							}
						}
					}
					else if (loai_bao_cao == 3){
						self.$el.find(".thongkebaocao-xuatnhapton").addClass("d-none");
						self.$el.find(".thongkebaocao-nhapkhau").addClass("d-none");
						self.$el.find(".thongkebaocao-thugom").removeClass("d-none");
						if (!!response && response.list_baocao instanceof Array && response.list_baocao.length >0){
							for (var i =0; i<response.list_baocao.length; i++){
								var item = response.list_baocao[i];
								var ten_donvi = item.ten_donvi;
								var list_sanpham = response.list_baocao[i]["list_sanpham"];
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
											var td_so_luong_thumua = `<td class ="text-center">` + (so_luong_thumua? so_luong_thumua : 0) + `</td>`;
											var td_so_co = "";
											if (!!chungnhan_co_id && chungnhan_co_id !== ""){
												td_so_co = `<td><a target="_blank" href="/#giaychungnhanco/model?id=` + chungnhan_co_id + `">` +so_co + ` </a></td>`;
											}
											else{
												td_so_co = `<td>` + (so_co? so_co : "") + `</td>`;
											}
											var td_diachi_thumua = `<td>` + (diachi_thumua? diachi_thumua : "") + `</td>`;
											var td_dongia = `<td>` + (dongia? dongia : "") + `</td>`;
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
											var td_so_luong_thumua = `<td class ="text-center">` + (so_luong_thumua? so_luong_thumua : 0) + `</td>`;
											var td_so_co = "";
											if (!!chungnhan_co_id && chungnhan_co_id !== ""){
												td_so_co = `<td><a target="_blank" href="/#giaychungnhanco/model?id=` + chungnhan_co_id + `">` +so_co + ` </a></td>`;
											}
											else{
												td_so_co = `<td>` + (so_co? so_co : "") + `</td>`;
											}
											var td_diachi_thumua = `<td>` + (diachi_thumua? diachi_thumua : "") + `</td>`;
											var td_dongia = `<td>` + (dongia? dongia : "") + `</td>`;
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
						}
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
					var $selectz = (self.$el.find('#donvi-board'))[0];
					var obj = $selectz.selectize.options[value];
					if (obj !== undefined && obj !== null){
                        self.donvi_id = value;
                        self.ten_donvi = obj.ten_coso;
                        let $selectz1 = (self.$el.find("#chonduoclieu")[0]);
                        if (!!$selectz1  && !!$selectz1 .selectize){
                            $selectz1.selectize.destroy();	
                        }
                        self.selectizeDuoclieu("chonduoclieu", value);
					}
					else{
                        self.donvi_id = null;
                        self.ten_donvi = null;
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
					searchField: ['ten_sanpham', 'ten_khoa_hoc','tenkhongdau', 'ma_sanpham'],
					preload: true,
                    sortField: [
						{
							field: 'ten_sanpham',
							direction: 'asc'
						},
						{
							field: 'tenkhongdau',
							direction: 'asc'
						}
					],
					load: function(query, callback) {
						var url = "";
	
						var query_filter = {"filters": {
                            "$and": [
                                    {   "$or": [
                                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                        { "ten_sanpham": { "$likeI": (query) } },
										{ "ten_khoa_hoc": { "$likeI": gonrinApp().convert_khongdau(query) } },
										{ "ten_khoa_hoc": { "$likeI": gonrinApp().convert_khongdau(query) } },
										{ "ma_sanpham": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                        ]
                                    },
                                    {"donvi_id": {"$eq" : donvi_id}}
								],
								"order_by": [{ "field": "ten_sanpham", "direction": "asc" }]
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
						var $selectz = (self.$el.find("#chonduoclieu"))[0];
						var obj = $selectz.selectize.options[value];
						if (obj !== undefined && obj !== null){
							self.ten_sanpham = obj.ten_sanpham;
							self.ten_khoa_hoc = obj.ten_khoa_hoc;
							self.ma_viettat = obj.ma_viettat;
						}
						else{
							self.ten_sanpham = null;
							self.ten_khoa_hoc = null;
							self.ma_viettat = null;
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
                    sortField: [
						{
							field: 'ten_sanpham',
							direction: 'asc'
						},
						{
							field: 'tenkhongdau',
							direction: 'asc'
						}
					],
                    load: function(query, callback) {
                        var url = "";
    
                        var query_filter = {"filters": {"$or": [
                            { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                            { "ten_sanpham": { "$likeI": (query) } },
                            { "ten_khoa_hoc": { "$likeI": gonrinApp().convert_khongdau(query) } }
							],
                            "order_by": [{ "field": "ten_sanpham", "direction": "asc" }]
						}
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
						var $selectz = (self.$el.find("#chonduoclieu"))[0];
						var obj = $selectz.selectize.options[value];
						if (obj !== undefined && obj !== null){
							self.ten_sanpham = obj.ten_sanpham;
							self.ten_khoa_hoc = obj.ten_khoa_hoc;
							self.ma_viettat = obj.ma_viettat;
						}
						else{
							self.ten_sanpham = null;
							self.ten_khoa_hoc = null;
							self.ma_viettat = null;
						}
                    }
                });
            }
        },
        register_event: function(){
            var self = this;
            self.selectDonvi();
			self.selectDonviChart();
			self.selectDonviChartCuc();
            var currentUser = self.getApp().currentUser;
			var tuyendonvi_id = null;
			var loai_donvi = null;
			if (currentUser !== undefined && currentUser !== null && currentUser.donvi !== null){
				if (currentUser.donvi.tuyendonvi_id !== null){
					tuyendonvi_id = currentUser.donvi.tuyendonvi_id;
				}
				loai_donvi = currentUser.donvi.loai_donvi;
			}
			if (loai_donvi == "5" || loai_donvi == "7" || loai_donvi == "9" || loai_donvi == "6" || loai_donvi == "8"){
				self.getFieldElement("loai_bao_cao").data('gonrin').setDataSource([{ value: 1, text: "Báo cáo xuất nhập tồn" },{ value: 3, text: "Báo cáo thu gom"}]);
                self.model.set("loai_bao_cao", 1);
                let donvi_id = currentUser.donvi_id;
                if (!!donvi_id){
                    self.selectizeDuoclieu("chonduoclieu", donvi_id);
					self.selectizeDuoclieuChart(donvi_id);
					self.selectizeDuoclieuChartCuc(donvi_id);
                }
			}
			else{
                self.selectizeDuoclieu("chonduoclieu");
				self.selectizeDuoclieuChart();
				self.selectizeDuoclieuChartCuc();
				if (gonrinApp().hasRole("lanhdao")){
					self.model.set("loai_bao_cao", 2);
				}
				else{
					self.model.set("loai_bao_cao", 1);
				}
			}
			if (tuyendonvi_id === undefined || tuyendonvi_id === null || (tuyendonvi_id !="7" && tuyendonvi_id != "10")){
				self.$el.find("#loaidonvi_cungung").prop("disabled", true);
				self.$el.find(".timkiem-donvi-baocao").remove();
				self.$el.find(".timkiem-donvi-chart").remove();
			}
			if ((tuyendonvi_id == "10" || tuyendonvi_id == 10) && (gonrinApp().hasRole('lanhdao'))){
				self.$el.find("#loai_bao_cao").attr("style", "pointer-events:none");
			}

			self.$el.find(".btn-search-detail").unbind("click").bind("click", (e)=>{
				e.stopPropagation();
				self.getDataChart();
			})

			self.$el.find(".btn-search-detail").trigger("click");

			self.$el.find(".btn-clear-detail").unbind("click").bind("click", (e)=>{
				e.stopPropagation();
				self.$el.find("#loai_thongke").val("10");
				let select1 = self.$el.find("#duoclieu-chart-detail")[0];
				if (!!select1 && !!select1.selectize){
					select1.selectize.clear();
				}
				let select2 = self.$el.find("#donvi-chart-detail")[0];
				if (!!select2 && !!select2.selectize){
					select2.selectize.clear();
				}
				self.$el.find(".btn-search-detail").trigger("click");
			})
        },
        selectizeDuoclieuChart: function(donvi_id){
            var self = this;
            // tìm kiếm theo danh mục
            if (!!donvi_id){
                var $selectize = self.$el.find("#duoclieu-chart").selectize({
                    valueField: 'id_sanpham',
                    labelField: 'ten_sanpham',
                    searchField: ['ten_sanpham', 'ten_khoa_hoc','tenkhongdau'],
                    preload: true,
                    sortField: [
						{
							field: 'ten_sanpham',
							direction: 'asc'
						},
						{
							field: 'tenkhongdau',
							direction: 'asc'
						}
					],
                    load: function(query, callback) {
                        var url = "";
    
                        var query_filter = {"filters": {
                            "$and": [
                                    {   "$or": [
                                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                        { "ten_sanpham": { "$likeI": (query) } },
										{ "ten_khoa_hoc": { "$likeI": gonrinApp().convert_khongdau(query) } },
										{ "ma_sanpham": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                        ]
                                    },
                                    {"donvi_id": {"$eq" : donvi_id}}
								],
								"order_by": [{ "field": "ten_sanpham", "direction": "asc" }]
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
                                if (Array.isArray(res.objects) ===true && res.objects.length >0){
                                    let objs = res.objects[0];
                                    let id_sanpham = objs.id_sanpham;
                                    if (!!id_sanpham && self.setIdDuoclieuChartDonvi === false){
                                        $selectize[0].selectize.setValue(id_sanpham);
                                        self.setIdDuoclieuChartDonvi = true;
                                    }
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
                        self.render_chart();
                    }
                });
            }
            else{
                var $selectize = self.$el.find("#duoclieu-chart").selectize({
                    valueField: 'id',
                    labelField: 'ten_sanpham',
                    searchField: ['ten_sanpham', 'ten_khoa_hoc','tenkhongdau'],
                    preload: true,
                    sortField: [
						{
							field: 'ten_sanpham',
							direction: 'asc'
						},
						{
							field: 'tenkhongdau',
							direction: 'asc'
						}
					],
                    load: function(query, callback) {
                        var url = "";
    
                        var query_filter = {"filters": {"$or": [
                            { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                            { "ten_sanpham": { "$likeI": (query) } },
							{ "ten_khoa_hoc": { "$likeI": gonrinApp().convert_khongdau(query) } },
							{ "ma_sanpham": { "$likeI": gonrinApp().convert_khongdau(query) } },
							],
                            "order_by": [{ "field": "ten_sanpham", "direction": "asc" }]
						}
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
                                if (Array.isArray(res.objects) ===true && res.objects.length >0){
                                    let objs = res.objects[0];
                                    let id_sanpham = objs.id;
                                    if (!!id_sanpham && self.setIdDuoclieuChart === false){
                                        $selectize[0].selectize.setValue(id_sanpham);
                                        self.setIdDuoclieuChart = true;
                                    }
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
                        self.render_chart();
                    }
                });
            } 
        },
        selectDonviChart : function(){
            var self = this;
            var $selectize = self.$el.find('#donvi-chart').selectize({
                valueField: 'id',
                labelField: 'ten_coso',
				searchField: ['ten_coso', 'tenkhongdau'],
				preload: true,
				maxOptions : 10,
				maxItems : 1,
                load: function(query, callback) {
                    var query_filter = {"filters": {"$and": [
                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                        { "ten_coso": { "$likeI": (query) } },
                        {"$or": [
                            { "loai_donvi": { "$eq": 2} },
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
					var $selectz = (self.$el.find('#donvi-chart'))[0];
					var obj = $selectz.selectize.options[value];
					if (obj !== undefined && obj !== null){
                        let $selectz1 = (self.$el.find("#duoclieu-chart")[0]);
                        if (!!$selectz1  && !!$selectz1 .selectize){
                            $selectz1.selectize.destroy();	
                        }
                        self.selectizeDuoclieuChart(value);
					}
					else{
                        let $selectz1 = (self.$el.find("#duoclieu-chart")[0]);
                        if (!!$selectz1  && !!$selectz1 .selectize){
                            $selectz1.selectize.destroy();	
                        }
                        self.selectizeDuoclieuChart();
					}
                }



            });
        },
        congdon_nhapkhau: function(tungay, denngay, donvi_id, id_sanpham){
            var self = this;
			let url = (self.getApp().serviceURL || "") + '/api/v1/thongke_nhapkhau';
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
                        let soluong_nhapkhau = response.soluong_nhapkhau
                        self.$el.find(".nhapkhau").text(Number(soluong_nhapkhau).toLocaleString("de-DE"));
                        let list_baocao = response.list_baocao;
                        self.$el.find(".soluong_nhapkhau").unbind("click").bind("click", ()=>{
                            let chitiet = new ChitietNhapKhau({viewData: {"list_baocao": list_baocao, "filters" : params}});
                            chitiet.dialog({size: "large"});
                        });
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
                        let soluong_thugom = response.soluong_thugom
                        self.$el.find(".thugom").text(Number(soluong_thugom).toLocaleString("de-DE"));
                        let list_baocao = response.list_baocao;
                        self.$el.find(".soluong_thugom").unbind("click").bind("click", ()=>{
                            let chitiet = new ChitietThuGom({viewData: {"list_baocao": list_baocao, "filters" : params}});
                            chitiet.dialog({size: "large"});
                        });
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
        congdon_phanphoi: function(tungay, denngay, donvi_id, id_sanpham){
			var self = this;
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
            let url = (self.getApp().serviceURL || "") + '/api/v1/thongke_phanphoi';
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
                        let soluong_phanphoi = response.soluong_phanphoi
                        self.$el.find(".muaban").text(Number(soluong_phanphoi).toLocaleString("de-DE"));
                        let list_baocao = response.list_baocao;
                        self.$el.find(".soluong_muaban").unbind("click").bind("click", ()=>{
                            let chitiet = new ChitietPhanPhoi({viewData: {"list_baocao": list_baocao, "filters" : params}});
                            chitiet.dialog({size: "large"});
                        });
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
        congdon_nuoitrong: function(tungay, denngay, donvi_id, id_sanpham){
			var self = this;
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
            let url = (self.getApp().serviceURL || "") + '/api/v1/thongke_nuoitrong';
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
                        let soluong_nuoitrong = response.soluong_nuoitrong
                        self.$el.find(".nuoitrong").text(Number(soluong_nuoitrong).toLocaleString("de-DE"));
                        let list_baocao = response.list_baocao;
                        self.$el.find(".soluong_nuoitrong").unbind("click").bind("click", ()=>{
                            let chitiet = new ChitietNuoitrong({viewData: {"list_baocao": list_baocao, "filters" : params}});
                            chitiet.dialog({size: "large"});
                        });
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
        congdon_khaithac: function(tungay, denngay, donvi_id, id_sanpham){
            var self = this;
			let url = (self.getApp().serviceURL || "") + '/api/v1/thongke_khaithac';
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
                        let soluong_khaithac = response.soluong_khaithac
                        self.$el.find(".khaithac").text(Number(soluong_khaithac).toLocaleString("de-DE"));
                        let list_baocao = response.list_baocao;
                        self.$el.find(".soluong_khaithac").unbind("click").bind("click", ()=>{
                            let chitiet = new ChitietKhaiThac({viewData: {"list_baocao": list_baocao, "filters" : params}});
                            chitiet.dialog({size: "large"});
                        });
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
		selectizeDuoclieuChartCuc: function(donvi_id){
            var self = this;
            // tìm kiếm theo danh mục
            if (!!donvi_id){
                var $selectize = self.$el.find("#duoclieu-chart-detail").selectize({
                    valueField: 'id_sanpham',
                    labelField: 'ten_sanpham',
                    searchField: ['ten_sanpham', 'ten_khoa_hoc','tenkhongdau'],
                    preload: true,
                    sortField: [
						{
							field: 'ten_sanpham',
							direction: 'asc'
						},
						{
							field: 'tenkhongdau',
							direction: 'asc'
						}
					],
                    load: function(query, callback) {
                        var url = "";
    
                        var query_filter = {"filters": {
                            "$and": [
                                    {   "$or": [
                                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                        { "ten_sanpham": { "$likeI": (query) } },
										{ "ten_khoa_hoc": { "$likeI": gonrinApp().convert_khongdau(query) } },
										{ "ma_sanpham": { "$likeI": gonrinApp().convert_khongdau(query) } },
                                        ]
                                    },
                                    {"donvi_id": {"$eq" : donvi_id}}
								],
								"order_by": [{ "field": "ten_sanpham", "direction": "asc" }]
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
 
                    }
                });
            }
            else{
                var $selectize = self.$el.find("#duoclieu-chart-detail").selectize({
                    valueField: 'id',
                    labelField: 'ten_sanpham',
                    searchField: ['ten_sanpham', 'ten_khoa_hoc','tenkhongdau'],
                    preload: true,
                    sortField: [
						{
							field: 'ten_sanpham',
							direction: 'asc'
						},
						{
							field: 'tenkhongdau',
							direction: 'asc'
						}
					],
                    load: function(query, callback) {
                        var url = "";
    
                        var query_filter = {"filters": {"$or": [
                            { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                            { "ten_sanpham": { "$likeI": (query) } },
                            { "ten_khoa_hoc": { "$likeI": gonrinApp().convert_khongdau(query) } }
							],
                            "order_by": [{ "field": "ten_sanpham", "direction": "asc" }]
						}
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

                    }
                });
            } 
        },
        selectDonviChartCuc : function(){
            var self = this;
            var $selectize = self.$el.find('#donvi-chart-detail').selectize({
                valueField: 'id',
                labelField: 'ten_coso',
				searchField: ['ten_coso', 'tenkhongdau'],
				preload: true,
				maxOptions : 10,
				maxItems : 1,
                load: function(query, callback) {
                    var query_filter = {"filters": {"$and": [
                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
                        { "ten_coso": { "$likeI": (query) } },
                        {"$or": [
                            { "loai_donvi": { "$eq": 2} },
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
					var $selectz = (self.$el.find('#donvi-chart-detail'))[0];
					var obj = $selectz.selectize.options[value];
					if (obj !== undefined && obj !== null){
                        let $selectz1 = (self.$el.find("#duoclieu-chart-detail")[0]);
                        if (!!$selectz1  && !!$selectz1 .selectize){
                            $selectz1.selectize.destroy();	
                        }
                        self.selectizeDuoclieuChartCuc(value);
					}
					else{
                        let $selectz1 = (self.$el.find("#duoclieu-chart-detail")[0]);
                        if (!!$selectz1  && !!$selectz1 .selectize){
                            $selectz1.selectize.destroy();	
                        }
                        self.selectizeDuoclieuChartCuc();
					}
                }



            });
		},
		getDataChart: function(){
			var self = this;
			var donvi_id = null;
			var $selectz = (self.$el.find('#donvi-chart-detail'))[0];
			if ($selectz !== undefined &&  $selectz.selectize !== undefined && $selectz.selectize !== null){
				var obj = $selectz.selectize.getValue();
				if (obj !== null && obj !== undefined && obj !=="") {
					donvi_id = obj;
				}
			}
			var id_sanpham = null;
			var selectz_duoc_lieu = (self.$el.find("#duoclieu-chart-detail"))[0];
			if (selectz_duoc_lieu !== undefined && selectz_duoc_lieu !== null){
				var tmp = selectz_duoc_lieu.selectize.getValue();
				if (tmp !== null && tmp !== undefined && tmp !== ""){
					id_sanpham = tmp;
				}
			}	
			var url = (self.getApp().serviceURL || "") + '/api/v1/thongke/chart';
			let loai_thongke = self.$el.find("#loai_thongke").val();
			let params ={
				loai_thongke,
				donvi_id,
				id_sanpham
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
						if (loai_thongke === "10" || !loai_thongke){
							let dataX = response.month;
							let dataY = [response?.result.nhapkhau, response?.result.thugom, response?.result.nuoitrong, response?.result.khaithac];
							self.showChart(dataX,dataY);
						}
						else if(loai_thongke === "1"){
							let dataX = response.month;
							let dataY = [response?.result.nhapkhau];
							self.showChart(dataX,dataY);
						}
						else if (loai_thongke === "3"){
							let dataX = response.month;
							let dataY = [response?.result.thugom];
							self.showChart(dataX,dataY);
						}
						else if (loai_thongke === "4"){
							let dataX = response.month;
							let dataY = [response?.result.nuoitrong];
							self.showChart(dataX,dataY);
						}
						else if (loai_thongke === "5"){
							let dataX = response.month;
							let dataY = [response?.result.khaithac];
							self.showChart(dataX,dataY);
						}

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
		showChart: function(dataX, dataY){
			var self = this;
			let chart = c3.generate({
                bindto: `#chart-detail`,
				data: {
					columns: dataY,
					type: 'bar',
				},
				bar: {
					width: {
						ratio: 0.5 // this makes bar width 50% of length between ticks
					}
					// or
					//width: 100 // this makes bar width 100px
				},
				axis: {
					x: {
						type: 'category',
						categories: dataX
					}
				}
			});
		}
    });

});