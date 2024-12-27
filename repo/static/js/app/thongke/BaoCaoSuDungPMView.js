define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 				= require('text!app/thongke/tpl/baocao_donvi.html');

    return Gonrin.ModelView.extend({
    	template : template,
    	modelSchema	: {},
    	urlPrefix: "/api/v1/",
    	collectionName: "thongke_hoatdong_donvi",
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
            	]
			},
    	render:function(){
			var self = this;
			self.applyBindings();
			var currentUser = self.getApp().currentUser;
			if (currentUser !== undefined && currentUser !== null && currentUser.donvi !== null && currentUser.donvi.tuyendonvi_id == 10){
			}else{
				self.getApp().notify("Không có quyền thực hiện hành động này!");
				self.getApp().getRouter().navigate("login");
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
			tungay.data("gonrin").setValue(self.parse_date_custom(firstDay));
			denngay.data("gonrin").setValue( self.parse_date_custom((moment(lastDay).set({hour:23,minute:59,second:59,millisecond:59}))));
			self.process(tungay,denngay);
			self.$el.find(".btn-search").unbind("click").bind("click",function(e){
				e.stopPropagation();
				e.preventDefault();
				var ngay_bat_dau = tungay.data("gonrin").getValue();
				var ngay_ket_thuc = denngay.data("gonrin").getValue();
				if (ngay_bat_dau === undefined || ngay_bat_dau === null){
					self.getApp().notify({message: "Vui lòng chọn ngày bắt đầu."}, { type : "danger", delay : 3000});
					return false;
				} else if (ngay_ket_thuc === undefined || ngay_ket_thuc === null){
					self.getApp().notify({message: "Vui lòng chọn ngày kết thúc."}, { type : "danger", delay : 3000});
					return false;
				} else{
					if (ngay_ket_thuc < ngay_bat_dau){
						self.getApp().notify({message: "Vui lòng chọn ngày kết thúc lớn hơn ngày bắt đầu."}, { type : "danger", delay : 3000});
						return false;
					} else {
						self.process(tungay,denngay);
					}
				}				
			});
			
			
		},
		process : function(el_tungay, el_denngay){
			var self = this;
			var ngay_bat_dau = el_tungay.data("gonrin").getValue();
			var ngay_ket_thuc = el_denngay.data("gonrin").getValue();
			
			// var donvi_id = null;
			// var $selectz = (self.$el.find('#selectize-programmatic'))[0];
			// if ($selectz !== undefined && $selectz.selectize !== undefined && $selectz.selectize !== null){
			// 	var obj = $selectz.selectize.getValue();
			// 	if (obj !== null && obj !== undefined && obj !== "") {
			// 		donvi_id = obj;
			// 	}
			// }

			var url = (self.getApp().serviceURL || "") + '/api/v1/thongke_hoatdong_donvi';
			$.ajax({
				url: url,
				type: 'POST',
				data: JSON.stringify({"ngay_bat_dau":ngay_bat_dau, "ngay_ket_thuc":ngay_ket_thuc}),
				headers: {
					'content-type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				},
				success: function(response) {
					// self.$el.find(".body-data").html("");
					
					$("#grid-donvi-sudung").grid({
						showSortingIndicator: true,
						onValidateError: function (e) {
						},
						language: {
							no_records_found: "không tìm thấy đơn vị nào phù hợp điều kiện tìm kiếm"
						},
						noResultsClass: "alert alert-default no-records-found",
						refresh: true,
						orderByMode: "client",
						fields: [
							{ field: "stt", label: "STT", sortable: { order: "asc" } },
							{ field: "nguoidaidien", label: "Người đại diện" },
							{ field: "sogiayphep", label: "Số giấy phép" },
							{ field: "ten_coso", label: "Tên đơn vị" },
							{ field: "diachi", label: "Địa chỉ" },
							{ field: "text_action", label: "Hoạt động thực hiện" },
						],
						dataSource: response.donvi_baocao,
						primaryField: "id",
						selectionMode: "single",
						pagination: {
							page: 1,
							pageSize: 50
						},
						// onRowClick: function (event) {
						// 	if (event.rowId) {
						// 		gonrinApp().getRouter().navigate("user/chitiet?id=" + event.rowId);
						// 	}
						// },
					});
					$("#grid-khong-donvi-sudung").grid({
						showSortingIndicator: true,
						onValidateError: function (e) {
						},
						language: {
							no_records_found: "không tìm thấy đơn vị nào phù hợp điều kiện tìm kiếm"
						},
						noResultsClass: "alert alert-default no-records-found",
						refresh: true,
						orderByMode: "client",
						fields: [
							{ field: "stt", label: "STT", sortable: { order: "asc" } },
							{ field: "nguoidaidien", label: "Người đại diện" },
							{ field: "sogiayphep", label: "Số giấy phép" },
							{ field: "ten_coso", label: "Tên đơn vị" },
							{ field: "diachi", label: "Địa chỉ" },
							{ field: "dienthoai", label: "Điện thoại" },
						],
						dataSource: response.donvi_khong_baocao,
						primaryField: "id",
						selectionMode: "single",
						pagination: {
							page: 1,
							pageSize: 50
						},
						// onRowClick: function (event) {
						// 	if (event.rowId) {
						// 		gonrinApp().getRouter().navigate("user/chitiet?id=" + event.rowId);
						// 	}
						// },
					});
					
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
    });

});