define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/thongke/tpl/model.html');
	var ChitietDuoclieu = require('app/thongke/ChitietDuoclieuModalView');
	var Thongke_thugomm = require("app/thongke/Thongke_thugom");

    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: {
            "loai_bao_cao": {
				"type": "number"
			},
			"donvi_id" : {
				"type" : "string"
			}
		},
    	urlPrefix: "/api/v1/",
    	collectionName: "thongke",
		state: null,
		check_set_duoc_lieu_chart : false,
		check_set_duoc_lieu_baocao : false,
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
			self.check_set_duoc_lieu = false;
			self.check_set_duoc_lieu_baocao = false;
			self.applyBindings();
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
			}
			else{
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
			if ( (tuyendonvi_id == "10" || tuyendonvi_id == 10) && (gonrinApp().hasRole('lanhdao')) ){
				self.$el.find("#loai_bao_cao").attr("style", "pointer-events:none");
			}
			var firstDay = new Date(moment().year(), moment().month(), 1);
			var lastDay = new Date();
			var tungay = self.$el.find('.tungay').datetimepicker({
				format:"DD/MM/YYYY",
				textFormat:"DD/MM/YYYY",
				extraFormats:["DDMMYYYY"],
				parseInputDate: function(val){
					return gonrinApp().parseInputDateString(val);
				},
				parseOutputDate: function(date){
					return gonrinApp().parseOutputDateString(date);
				},
                disabledComponentButton: true
			});
			var denngay = self.$el.find('.denngay').datetimepicker({
				format:"DD/MM/YYYY",
				textFormat:"DD/MM/YYYY",
				extraFormats:["DDMMYYYY"],
				parseInputDate: function(val){
					return gonrinApp().parseInputDateString(val);
				},
				parseOutputDate: function(date){
					return gonrinApp().parseOutputDateString(date);
				},
                disabledComponentButton: true
			});
			self.select_duoclieu_chart("selectize-duoclieu");
			self.select_duoclieu_bao_cao("selectize-duoc-lieu");
			tungay.data("gonrin").setValue(self.parse_date_custom(firstDay));
			denngay.data("gonrin").setValue( self.parse_date_custom((moment(lastDay).set({hour:23,minute:59,second:59,millisecond:59}))));
			self.congdon_duoc_lieu(tungay, denngay);
			self.congdon_soluong(tungay, denngay);
    		self.$el.find(".btn-search").unbind("click").bind("click",function(e){
				e.stopPropagation();
				e.preventDefault();
				var ngay_bat_dau = tungay.data("gonrin").getValue();
				var ngay_ket_thuc = denngay.data("gonrin").getValue();
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
						self.congdon_duoc_lieu(tungay,denngay);
						self.congdon_soluong(tungay, denngay);
					}
				}				
			});
			self.register_timkiem_donvi(tungay, denngay);
			self.register_selectize_chart();
			self.$el.find("input[name='inlineRadioOptions']").change(function() {
				var $selectz = (self.$el.find("#selectize-programmatic")[0]);
				if ($selectz !== undefined || $selectz !== null){
					$selectz.selectize.destroy();	
				}
				self.register_timkiem_donvi(tungay,denngay);
			});
			self.$el.find("input[name='chartRadio']").change(function() {
				var $selectz = (self.$el.find("#selectize-chart")[0]);
				if ($selectz !== undefined || $selectz !== null){
					$selectz.selectize.destroy();	
				}
				self.register_selectize_chart();
			});
			self.$el.find(".btn-clean").unbind("click").bind("click",function(e){
				e.stopPropagation();
				e.preventDefault();
				tungay.data("gonrin").setValue(self.parse_date_custom(firstDay));
				denngay.data("gonrin").setValue( self.parse_date_custom((moment(lastDay).set({hour:23,minute:59,second:59,millisecond:59}))));
				if (loai_donvi == "5" || loai_donvi == "7" || loai_donvi == "9" || loai_donvi == "6" || loai_donvi == "8"){
					self.getFieldElement("loai_bao_cao").data('gonrin').setDataSource([{ value: 1, text: "Báo cáo xuất nhập tồn" },{ value: 3, text: "Báo cáo thu gom"}]);
					self.model.set("loai_bao_cao", 1);
				}
				else{
					self.model.set("loai_bao_cao", 2);
				}
				var $selectz = (self.$el.find('#selectize-programmatic'))[0];
				if (!!$selectz && !! $selectz.selectize){
					self.$el.find('#selectize-programmatic').selectize()[0].selectize.clear();
				}
				var $selectz1 = (self.$el.find('#selectize-duoc-lieu'))[0];
				if (!!$selectz1 && !!$selectz1.selectize){
					self.$el.find('#selectize-duoc-lieu').selectize()[0].selectize.clear();
				}
				self.$el.find(".btn-search").click();				
			});
		},
		register_timkiem_donvi:function(tungay, denngay){
			var self = this;
			var currentUser = self.getApp().currentUser;
			var tuyendonvi_id = null;
			if (currentUser !== undefined && currentUser !== null && currentUser.donvi !== null && currentUser.donvi.tuyendonvi_id !== null){
				tuyendonvi_id = currentUser.donvi.tuyendonvi_id;
			}
			var $selectize = self.$el.find('#selectize-programmatic').selectize({
                valueField: 'id',
                labelField: 'ten_coso',
                searchField: ['ten_coso', 'tenkhongdau'],
                preload: true,
                load: function(query, callback) {
					var query_filter = self.process_query_selectize_tiemkiem_donvi(tuyendonvi_id,query,currentUser);
					var url = (self.getApp().serviceURL || "") + '/api/v1/donvi?' + (query_filter? "&q=" + JSON.stringify(query_filter): "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
							callback(res.objects);
							if (tuyendonvi_id != "10"){
								var donvi_id = currentUser.donvi_id;
								var $selectz = (self.$el.find('#selectize-programmatic'))[0];
								if (!!$selectz && !!$selectz.selectize && !!donvi_id){
									$selectz.selectize.setValue([donvi_id]);
								}
							}
                        }
                    });  

                },
                onChange: function(value, isOnInitialize) {
                    var $selectz = (self.$el.find('#selectize-programmatic'))[0]
                    var obj = $selectz.selectize.options[value];
                    if (obj !== null && obj !== undefined) {
						self.congdon_duoc_lieu(tungay, denngay);
						self.congdon_soluong(tungay, denngay);
                    }
                }
			});
		},
		process_query_selectize_tiemkiem_donvi : function(tuyendonvi_id,query, currentUser){
			var self = this;
			var query_filter ="";
			var donvi_id = "";
			if (!!currentUser && !!currentUser.donvi_id){
				donvi_id = currentUser.donvi_id;
			}
			if (tuyendonvi_id == "10"){
				query_filter = {"filters": {"$and":[
					{ "$or" :[
						{"loai_donvi": { "$eq": 2 }},
						{"loai_donvi": { "$eq": 4 }},
						{"loai_donvi": { "$eq": 5 }},
						{"loai_donvi": { "$eq": 6 }},
						{"loai_donvi": { "$eq": 7 }},
						{"loai_donvi": { "$eq": 8 }},
						{"loai_donvi": { "$eq": 9 }}				
					]},
					{"$or": [
						{ "ten_coso": { "$likeI": (query) } },
						{ "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } }
					]}
				]}
				};
			}
			else{
				query_filter = {"filters": {"$and":[
					{ "loai_donvi": { "$eq": 2 } },
					{"$or": [
						{ "ten_coso": { "$likeI": (query) } },
						{ "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } }
					]},
					{"id" : {"$eq" : donvi_id}}
				]}
				};
			}
			return query_filter;
		},
		register_selectize_chart:function(){
			var self = this;
			var currentUser = self.getApp().currentUser;
			// console.log(currentUser);
			var tuyendonvi_id = null;
			if (currentUser !== undefined && currentUser !== null && currentUser.donvi !== null && currentUser.donvi.tuyendonvi_id !== null){
				tuyendonvi_id = currentUser.donvi.tuyendonvi_id;
			}
			var $selectize2 = self.$el.find('#selectize-chart').selectize({
                valueField: 'id',
                labelField: 'ten_coso',
                searchField: ['ten_coso', 'tenkhongdau'],
                preload: true,
                load: function(query, callback) {
					var query_filter = self.process_query_selectize_tiemkiem_donvi(tuyendonvi_id,query,currentUser);
					var url = (self.getApp().serviceURL || "") + '/api/v1/donvi?' + (query_filter? "&q=" + JSON.stringify(query_filter): "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            callback(res.objects);
							if (tuyendonvi_id != "10"){
								var donvi_id = currentUser.donvi_id;
								var $selectz = (self.$el.find('#selectize-chart'))[0];
								if (!!$selectz && !!$selectz.selectize && !!donvi_id){
									$selectz.selectize.setValue([donvi_id]);
								}
							}
                        }
                    });  

                },
                onChange: function(value, isOnInitialize) {
                    var $selectz = (self.$el.find('#selectize-chart'))[0];
					var obj = $selectz.selectize.options[value];
                    if (obj !== null && obj !== undefined && tuyendonvi_id == "10") {
						self.render_chart();
                    }
                }
			});
		},
		process_query_selectize: function(loai_donvi,tuyendonvi_id,query,currentUser){
			self = this;
			var query_filter ="";
			if (loai_donvi == "1" || loai_donvi ==1){
				if (tuyendonvi_id == "10"){
					query_filter = {"filters": {"$and":[
						{ "loai_donvi": { "$eq": loai_donvi } },
						{"$or": [
							{ "ten_coso": { "$likeI": gonrinApp().convert_khongdau(query) } },
							{ "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } }
						]},
						{"tuyendonvi_id" : {"$neq" : "10"}}
					]}
					};
				}
				else if (tuyendonvi_id == "9" || tuyendonvi_id == "8"){
					query_filter = {"filters": {"$and":[
						{ "loai_donvi": { "$eq": loai_donvi } },
						{"$or": [
							{ "ten_coso": { "$likeI": gonrinApp().convert_khongdau(query) } },
							{ "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } }
						]},
						{"id" : {"$eq" : currentUser.donvi_id}}
					]}
					};
				}
				else if (tuyendonvi_id == "7"){
					query_filter = {"filters": {"$and":[
						{ "loai_donvi": { "$eq": loai_donvi } },
						{"$or": [
							{ "ten_coso": { "$likeI": gonrinApp().convert_khongdau(query) } },
							{ "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } }
						]},
						{"$or" : [
							{"id" : {"$eq" : currentUser.donvi_id}},
							{"tuyendonvi_id" : {"$eq" : "6"}},
							{"tuyendonvi_id" : {"$eq" : "5"}},
							{"tuyendonvi_id" : {"$eq" : "4"}},
							{"tuyendonvi_id" : {"$eq" : "3"}},
							{"tuyendonvi_id" : {"$eq" : "2"}},
							{"tuyendonvi_id" : {"$eq" : "1"}}
						]}
					]}
					};	
				}
				else if (tuyendonvi_id == "5"){
					query_filter = {"filters": {"$and":[
						{ "loai_donvi": { "$eq": loai_donvi } },
						{"$or": [
							{ "ten_coso": { "$likeI": gonrinApp().convert_khongdau(query) } },
							{ "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } }
						]},
						{"$or" : [
							{"id" : {"$eq" : currentUser.donvi_id}},
							{"tuyendonvi_id" : {"$eq" : "4"}},
							{"tuyendonvi_id" : {"$eq" : "1"}},
						]}
					]}
					};	
				}
				else if (tuyendonvi_id == "4"){
					query_filter = {"filters": {"$and":[
						{ "loai_donvi": { "$eq": loai_donvi } },
						{"$or": [
							{ "ten_coso": { "$likeI": gonrinApp().convert_khongdau(query) } },
							{ "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } }
						]},
						{"$or" : [
							{"id" : {"$eq" : currentUser.donvi_id}},
							{"tuyendonvi_id" : {"$eq" : "1"}},
						]}
					]}
					};	
				}
				else {
					query_filter = {"filters": {"$and":[
						{ "loai_donvi": { "$eq": loai_donvi } },
						{"$or": [
							{ "ten_coso": { "$likeI": gonrinApp().convert_khongdau(query) } },
							{ "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } }
						]},
						{"id" : {"$eq" : currentUser.donvi_id}}
					]}
					};	
				}
			}
			else if (loai_donvi == "2" || loai_donvi ==2){
				if (tuyendonvi_id == "10"){
					query_filter = {"filters": {"$and":[
						{ "loai_donvi": { "$eq": loai_donvi }},
						{"$or": [
							{ "ten_coso": { "$likeI": gonrinApp().convert_khongdau(query) } },
							{ "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } }
						]}
					]}
					};
				}
				else if (tuyendonvi_id == "7"){
					var donvi_infor = currentUser.donvi;
					if (donvi_infor !== undefined && donvi_infor !== null && donvi_infor.tinhthanh_id !== null){
						query_filter = {"filters": {"$and":[
							{ "loai_donvi": { "$eq": loai_donvi }},
							{"$or": [
								{ "ten_coso": { "$likeI": gonrinApp().convert_khongdau(query) } },
								{ "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } }
							]},
							{"tinhthanh_id" : {"$eq" : donvi_infor.tinhthanh_id}}
						]}
						};
					}
				}
			}
			return query_filter;
		},
		render_chart:function(){
			var self = this;
			var donvi_id = null;
			self.$el.find("#morris-bar-stacked").html("");
			var $selectz = (self.$el.find('#selectize-chart'))[0];
			if ($selectz !== undefined &&  $selectz.selectize !== undefined && $selectz.selectize !== null){
				var obj = $selectz.selectize.getValue();
				if (obj !== null && obj !== undefined && obj !=="") {
					donvi_id = obj;
				}
			}
			var id_sanpham = null;
			var selectz_duoc_lieu = (self.$el.find("#selectize-duoclieu"))[0];
			if (selectz_duoc_lieu !== undefined && selectz_duoc_lieu !== null){
				var tmp = selectz_duoc_lieu.selectize.getValue();
				if (tmp !== null && tmp !== undefined && tmp !== ""){
					id_sanpham = tmp;
				}
			}
			
			// console.log('donvi=====', donvi_id);
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
		select_duoclieu_chart : function(html_id){
			var self = this;
			let currentUser = gonrinApp().currentUser;
			if (!!currentUser && currentUser.donvi && currentUser.donvi.tuyendonvi_id == "10"){
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
								var tmp = res.objects[0];
								if (!!tmp && self.check_set_duoc_lieu_chart == false){
									$selectize[0].selectize.setValue([tmp.id]);
								}
								self.check_set_duoc_lieu_chart = true;
							}
						});  
	
					},
					render: {
						option: function (item, escape) {
							return `<div class="option">${item.ten_sanpham} - ${item.ten_khoa_hoc} - ${item.ma_viettat}</div>`;
						}
					},
					onChange: function(value, isOnInitialize) {
						if (html_id == "selectize-duoclieu"){
							self.render_chart();
						}
					}
				});
			}
			else{
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
						var query_filter = {"filters": {"$or": [
							{ "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
							{ "ten_sanpham": { "$likeI": (query) } },
							{ "ten_khoa_hoc": { "$likeI": gonrinApp().convert_khongdau(query) } }
							]}
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
								var tmp = res.objects[0];
								if (!!tmp && self.check_set_duoc_lieu_chart == false){
									$selectize[0].selectize.setValue([tmp.id_sanpham]);
								}
								self.check_set_duoc_lieu_chart = true;
							}
						});  
	
					},
					render: {
						option: function (item, escape) {
							return `<div class="option">${item.ten_sanpham} - ${item.ten_khoa_hoc} - ${item.ma_viettat}</div>`;
						}
					},
					onChange: function(value, isOnInitialize) {
						if (html_id == "selectize-duoclieu"){
							self.render_chart();
						}
					}
				});
			}
		},
		select_duoclieu_bao_cao : function(html_id){
            var self = this;
			let currentUser = gonrinApp().currentUser;
			if (!!currentUser && currentUser.donvi && currentUser.donvi.tuyendonvi_id == "10"){
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
						if (html_id == "selectize-duoclieu"){
							self.render_chart();
						}
					}
				});
			}
			else{
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
	
						var query_filter = {"filters": {"$or": [
							{ "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } },
							{ "ten_sanpham": { "$likeI": (query) } },
							{ "ten_khoa_hoc": { "$likeI": gonrinApp().convert_khongdau(query) } }
							]}
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
						if (html_id == "selectize-duoclieu"){
							self.render_chart();
						}
					}
				});
			}


		},
		register_chi_tiet_duoclieu : function(data){
			var self = this;
			self.$el.find(".soluong_nhapkhau").unbind("click").bind("click", function(){
				let chitiet = new ChitietDuoclieu({viewData : {"nguon_cungcap" : 1, "data" : data}});
				chitiet.dialog({size : "large"});

			});
			self.$el.find(".soluong_muaban").unbind("click").bind("click", function(){
				let chitiet = new ChitietDuoclieu({viewData : {"nguon_cungcap" : 2, "data" : data}});
				chitiet.dialog({size : "large"});

			});
			self.$el.find(".soluong_thugom").unbind("click").bind("click", function(){
				let chitiet= new ChitietDuoclieu({viewData : {"nguon_cungcap" : 3, "data" : data}});
				chitiet.dialog({size : "large"});

			});
			self.$el.find(".soluong_nuoitrong").unbind("click").bind("click", function(){
				let chitiet= new ChitietDuoclieu({viewData : {"nguon_cungcap" : 4, "data" : data}});
				chitiet.dialog({size : "large"});

			});
			self.$el.find(".soluong_khaithac").unbind("click").bind("click", function(){
				let chitiet= new ChitietDuoclieu({viewData : {"nguon_cungcap" : 5, "data" : data}});
				chitiet.dialog({size : "large"});

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
		congdon_duoc_lieu : function(el_tungay, el_denngay){
			var self = this;
			var ngay_bat_dau = el_tungay.data("gonrin").getValue();
			var ngay_ket_thuc = el_denngay.data("gonrin").getValue();
			
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
									for (j=0; j<list_sanpham.length; j++){
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
		congdon_soluong: function(el_tungay, el_denngay){
			var self = this;
			var ngay_bat_dau = el_tungay.data("gonrin").getValue();
			var ngay_ket_thuc = el_denngay.data("gonrin").getValue();
			
			var donvi_id = null;
			var $selectz = (self.$el.find('#selectize-programmatic'))[0];
			if ($selectz !== undefined && $selectz.selectize !== undefined && $selectz.selectize !== null){
				var obj = $selectz.selectize.getValue();
				if (obj !== null && obj !== undefined && obj !== "") {
					donvi_id = obj;
				}
			}
			var id_sanpham = "";
			var selectize_duoclieu = (self.$el.find('#selectize-duoc-lieu'))[0];
			if (selectize_duoclieu.selectize !== undefined && selectize_duoclieu.selectize !== null){
				var obj = selectize_duoclieu.selectize.getValue();
				if (obj !== undefined && obj !== null && obj !== ""){
					id_sanpham = obj;
				}
			}
			var url = (self.getApp().serviceURL || "") + '/api/v1/congdon_soluong';
			$.ajax({
				url: url,
				type: 'POST',
				data: JSON.stringify({"ngay_bat_dau":ngay_bat_dau, "ngay_ket_thuc":ngay_ket_thuc, "id_sanpham":id_sanpham,"donvi_id":donvi_id , "loai_bao_cao" : loai_bao_cao}),
				headers: {
					'content-type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				},
				success: function(response) {
					if (!!response){
						let soluong_nhapkhau = response.soluong_nhapkhau;
						if (!!soluong_nhapkhau){
							self.$el.find(".nhapkhau").text(soluong_nhapkhau);
						}
						let soluong_muaban_trongnuoc = response.soluong_muaban_trongnuoc;
						if (!!soluong_muaban_trongnuoc){
							self.$el.find(".muaban").text(soluong_muaban_trongnuoc);
						}
						let soluong_thugom = response.soluong_thugom;
						if (!!soluong_thugom){
							self.$el.find(".thugom").text(soluong_thugom);
						}
						let soluong_nuoitrong = response.soluong_nuoitrong;
						if (!!soluong_nuoitrong){
							self.$el.find(".nuoitrong").text(soluong_nuoitrong);
						}
						let soluong_khaithac = response.soluong_khaithac;
						if (!!soluong_khaithac){
							self.$el.find(".khaithac").text(soluong_khaithac);
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
		}
    });

});