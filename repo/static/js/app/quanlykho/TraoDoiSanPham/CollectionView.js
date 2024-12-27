define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/quanlykho/TraoDoiSanPham/tpl/collection.html'),
		schema 				= require('json!app/quanlykho/TraoDoiSanPham/Schema.json');

    
    return Gonrin.CollectionView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "lich_su_trao_doi_san_pham",
    	uiControl:{
	    	fields: [
                { field: "donvi_xuat_ten", label: "Đơn vị xuất dược liệu", width:200},
		     	{ field: "donvi_tiepnhan_ten", label: "Đơn vị tiếp nhận dược liệu", width:200},
                 
				{ field: "thoigian_traodoi", label: "Thời gian xuất hàng", width:250 , template : function(rowData){
					if(!!rowData && !!rowData.thoigian_traodoi){
						return gonrinApp().parseInputDateString(rowData.thoigian_traodoi).format("DD/MM/YYYY");
					}
					return "";
				}},
				{ field: "trangthai", label: "Trạng thái", width:250 , template : function(rowData){
                    if (!!rowData && !!rowData.trangthai == 1){
                        return '<span class = "text-success">Đã xác nhận</span>';
                    }
                    else if (!!rowData && rowData.trangthai == 0){
                        return '<span class = "text-primary">Chưa xác nhận</span>';
					}
					else{
						return "";
					}
                }}
		     ],
		     onRowClick: function(event){
				if(event.rowId){
					var path = this.collectionName + '/model?id='+ event.rowId;
					this.getApp().getRouter().navigate(path);
				}
			},
			language:{
				no_records_found:"Chưa có dữ liệu"
			},
			noResultsClass:"alert alert-default no-records-found",
			datatableClass:"table table-mobile",
			onRendered: function (e) {
				gonrinApp().responsive_table();
			}
		},
		tools: [
		],
	     render:function(){
			var self = this;
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

		   self.$el.find(".btn-search").unbind("click").bind("click", function(){
			   var ngay_bat_dau = tungay.data("gonrin").getValue();
			   var ngay_ket_thuc = denngay.data("gonrin").getValue();
			   if (ngay_bat_dau === null && ngay_ket_thuc ===null){
				   self.getApp().notify({message: "Vui lòng chọn thời gian tìm kiếm."}, { type : "danger", delay : 3000});
				   return false;
			   }
			   else{
				   if (ngay_bat_dau !== null && ngay_ket_thuc == null){
					   var filters = {
						   "thoigian_traodoi" : {"$ge" : ngay_bat_dau}
					   }
					   self.uiControl.filters = filters;
					   var $col = self.getCollectionElement();
					   $col.data('gonrin').filter(filters);
				   }
				   else if  (ngay_bat_dau === null && ngay_ket_thuc !== null){
					   var filters = {
						   "thoigian_traodoi" : {"$le" : (ngay_ket_thuc)}
					   }
					   self.uiControl.filters = filters;
					   var $col = self.getCollectionElement();
					   $col.data('gonrin').filter(filters);
				   }
				   else{
					   if (ngay_ket_thuc < ngay_bat_dau){
						   self.getApp().notify({message: "Vui lòng chọn ngày kết thúc lớn hơn hoặc bằng ngày bắt đầu."}, {type: "danger", delay : 1000});
						   return false;
					   }
					   else{
						   var filters = {"$and" : [
							   {"thoigian_traodoi" : {"$ge" : ngay_bat_dau }},
							   {"thoigian_traodoi" : {"$le" : (ngay_ket_thuc)}}
						   ]}
						   self.uiControl.filters = filters;
						   var $col = self.getCollectionElement();
						   $col.data('gonrin').filter(filters);
					   }
				   }
			   }
		   });
		   self.applyBindings();
		   return this;
    	},
    });

});