define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/quanlykho/KetQuaTrungThau1/tpl/collection.html'),
		schema 				= require('json!schema/KetQuaTrungThauSchema.json');
    
    return Gonrin.CollectionView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
    	collectionName: "ketquathau",
    	uiControl:{
	    	fields: [
				{ field: "thoigian_trungthau", label: "Ngày trúng thầu", width:180, template:function(rowData){
					if(rowData !== undefined){
						if (rowData.thoigian_trungthau !== null && rowData.thoigian_trungthau !== undefined){
                            return gonrinApp().parseInputDateString(rowData.thoigian_trungthau).format("DD/MM/YYYY");
						}
					}
					return "";
				  } },
				  { field: "thoigian_batdau", label: "Thời gian thực hiện", width:220, template:function(rowData){
					if(rowData !== undefined){
						var result = "";
						if (rowData.thoigian_batdau !== null && rowData.thoigian_batdau !== undefined){
							result = gonrinApp().parseInputDateString(rowData.thoigian_batdau).format("DD/MM/YYYY");
						}
						if (result !==""){
							result = result + " -> ";
						}
						if (rowData.thoigian_ketthuc !== null && rowData.thoigian_ketthuc !== undefined){
							result = result + gonrinApp().parseInputDateString(rowData.thoigian_ketthuc).format("DD/MM/YYYY");
						}
						return result;
					}
					return "";
				  } },
				{ field: "ten_goi_thau", label: "Tên gói thầu", width:250, template:function(rowData){
					if(rowData !== undefined && rowData.ten_goi_thau !== null){
						return rowData.ten_goi_thau;
					}
					return "";
				  } },
				{ field: "ten_nguoi_lap_phieu", label: "Người lập hồ sơ", width:200 },
				{ field: "updated_at", label: "Thời gian cập nhật", width:180, template:function(rowData){
					if(rowData !== undefined){
						if (rowData.updated_at !== null && rowData.updated_at !== undefined){
							return gonrinApp().timestampFormat(rowData.updated_at*1000, "DD/MM/YYYY hh:mm");
						}
					}
					return "";
				  } },
				  
	           	 
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
			{
				name: "default",
				type: "group",
				groupClass: "toolbar-group",
				buttons: [
					{
						name: "create",
						type: "button",
						buttonClass: "btn-primary btn-sm",
						label: `<i class="fa fa-plus"></i> Thêm mới gói thầu`,
						command: function() {
						  	var self = this;
							gonrinApp().getRouter().navigate(this.collectionName + '/model');
						}
					},
				]
			},
		],
		render:function(){
			var self = this;
			var tungay = self.$el.find('.tungay').datetimepicker({
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
		   var denngay = self.$el.find('.denngay').datetimepicker({
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
						   "thoigian_trungthau" : {"$ge" : ngay_bat_dau}
					   }
					   self.uiControl.filters = filters;
					   var $col = self.getCollectionElement();
					   $col.data('gonrin').filter(filters);
				   }
				   else if  (ngay_bat_dau === null && ngay_ket_thuc !== null){
					   var filters = {
						   "thoigian_trungthau" : {"$le" : (ngay_ket_thuc + 86399)}
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
							   {"thoigian_trungthau" : {"$ge" : ngay_bat_dau }},
							   {"thoigian_trungthau" : {"$le" : (ngay_ket_thuc+86399)}}
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
    	filterCollection: function () {
			var self = this;
			var tu_ngay = self.$el.find('#tungay').data('gonrin').getValue(),
				den_ngay = self.$el.find('#dengay').data('gonrin').getValue();
				var tmp = gonrinApp().parseInputDateString(den_ngay);
                var den_ngay = self.parse_date_custom((moment(tmp).set({hour:23,minute:59,second:59})));
			var query_time = "";
			if (tu_ngay !== null && tu_ngay !== undefined && den_ngay !== null && den_ngay !== undefined && tu_ngay !== "" && den_ngay !== "") {
				query_time = { "$and": [
					{"thoigian_nhap": { "$gte": tu_ngay}},
					{"thoigian_nhap": { "$lte": (den_ngay )}},
				]};
			} else if (tu_ngay !== null && tu_ngay !== undefined && tu_ngay !== "") {
				query_time = { "$and": [
					{"thoigian_nhap": { "$gte": tu_ngay}}
				]};
			} else if (den_ngay !== null && den_ngay !== undefined && den_ngay !== "") {
				query_time = { "$and": [
					{"thoigian_nhap": { "$lte": (den_ngay)}},
				]};
			}

			if (query_time !== "") {
				var $col = self.getCollectionElement();
				$col.data('gonrin').filter(query);
			}
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
		}
    });

});