define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/danhmuc/danhmuc_donvi/DanhMucVatTu/tpl/collection.html'),
    	schema 				= require('json!schema/DanhMucVatTuDonViSchema.json');
    var CustomFilterView = require('app/bases/CustomFilterView');
    var danhmuc_donvitinh = require('json!app/constant/donvitinh.json');
    return Gonrin.CollectionView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
		collectionName: "danhmuc_vattu_donvi",
		loai_vat_tu: "",
		tools: [
			{
				name: "create",
				type: "button",
				buttonClass: " btn-success btn-sm",
                label: "Tạo mới",
                visible: function(){
					return this.getApp().hasRole("admin_donvi") || this.getApp().hasRole("canbo");
				},
				command: function () {
					var self = this;
					self.getApp().getRouter().navigate("danhmuc_vattu_donvi/model");
				},
			},
		],
    	uiControl:{
	    	fields: [
				{ field: "ten_vattu", label: "Tên vật tư", width:250 },
				{ field: "ma_vattu", label: "Mã vật tư"},
				{field: "donvitinh", label: "Đơn vị tính",
                    template: function (rowData) {
                        if (rowData.donvitinh !== null && rowData.donvitinh !== undefined) {
                            for(var i=0; i< danhmuc_donvitinh.length; i++){
                                if(danhmuc_donvitinh[i].value === rowData.donvitinh){
                                    return danhmuc_donvitinh[i].text;
                                }
                            }
                        }
                        return "";
                    }
                },
				{field: "ten_nhom", label: "Thuộc nhóm", width:150}
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
	    render:function(){
			var self = this;
            self.loai_vat_tu = "1";
            var currentUser = gonrinApp().currentUser;
			this.uiControl.orderBy = [{"field": "ten_vattu", "direction": "asc"}];
			self.$el.find(".danhsachvattu").on("change.gonrin", function() {
                self.loai_vat_tu = self.$el.find(".danhsachvattu").val();
                if (self.loai_vat_tu == "tatca") {
                    var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
                    var filters = {
                        "$or": [
                            { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(text) } },
                            { "ma_vattu": { "$likeI": gonrinApp().convert_khongdau(text) } }
                        ]
                    };
                    var $col = self.getCollectionElement();
                    $col.data('gonrin').filter(filters);
                } else {
                    var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
                    var filters = {
                        "$and": [
                            {"$or": [
                                { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(text) } },
                                { "ma_vattu": { "$likeI": gonrinApp().convert_khongdau(text) } }
                            ]},
                            { "ma_nhom": { "$eq": self.loai_vat_tu } },
                        ]
                    };
                    var $col = self.getCollectionElement();
                    $col.data('gonrin').filter(filters);
                }
            });
			var filter = new CustomFilterView({
                el: self.$el.find("#grid_search"),
                sessionKey: self.collectionName + "_filter"
            });
            filter.render();
            filter.model.set("text", "");
            filter.$el.find('.search-collection input').attr("placeholder", "Nhập mã vật tư, tên vật tư để tìm kiếm")
            self.applyBindings();
            filter.on('filterChanged', function(evt) {
                var $col = self.getCollectionElement();
                var text = !!evt.data.text ? evt.data.text.trim() : "";
                if ($col) {
                    if (text !== null) {
                        var filters;
                        if (self.loai_vat_tu !== null && self.loai_vat_tu !== "" && self.loai_vat_tu !== "tatca") {
                            filters = {
                                "$and": [
                                    {"$or": [
                                        { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(text) } },
                                        { "ma_vattu": { "$likeI": gonrinApp().convert_khongdau(text) } }
                                    ]},
                                    { "ma_nhom": { "$eq": self.loai_vat_tu } },
                                ]
                            };
                        } else {
                            filters = {"$or": [
                                { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(text) } },
                                { "ma_vattu": { "$likeI": gonrinApp().convert_khongdau(text) } }
                            ]}
                        }
                        $col.data('gonrin').filter(filters);
                        self.applyBindings();
                    } else {
                        if (self.loai_vat_tu !== null && self.loai_vat_tu !== "" && self.loai_vat_tu !== "tatca") {
                            filters = {
                                "$and": [
                                    { "ma_nhom": { "$eq": self.loai_vat_tu } },
                                ]
                            };
                            $col.data('gonrin').filter(filters);
                            self.applyBindings();
                        }
                    }
                }
                self.applyBindings();
            });
            self.$el.find("table").addClass("table-hover");
            self.$el.find("table").removeClass("table-striped");

            self.select_nhom_vat_tu("selectize-nhom-vattu");
			this.applyBindings();
			return this;
        },
        
        select_nhom_vat_tu : function(html_id){
            var self = this;
            var $selectize = self.$el.find('#' + html_id).selectize({
                valueField: 'id',
                labelField: 'ten_nhom_vattu',
                searchField: ['ten_nhom_vattu', 'tenkhongdau'],
                preload: true,
                load: function(query, callback) {
					var url = (self.getApp().serviceURL || "") + "/api/v1/nhom_vattu?page=1&results_per_page=15"
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
                }
			});
        }
    	
    });

});