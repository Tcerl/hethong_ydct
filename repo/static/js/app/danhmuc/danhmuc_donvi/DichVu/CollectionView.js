define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/bases/tpl/collection.html');
	var CustomFilterView      = require('app/bases/CustomFilterView');
    return Gonrin.CollectionView.extend({
    	template : template,
    	modelSchema	: {},
    	urlPrefix: "/api/v1/",
		collectionName: "dichvu_kythuat",
		tools : [
			{
				name: "create",
				type: "button",
				buttonClass: "btn-success btn-sm",
				label: "TRANSLATE:CREATE",
				visible: function(){
					return this.getApp().hasRole("admin");
				},
				command: function(){
					var self = this;
					self.getApp().getRouter().navigate('dichvu/model');
				}
			},
		],
    	uiControl:{
    		fields: [
				{ 
					field: "id",label:"ID",width:250,readonly: true, visible:false
				},
				{ field: "ten_dichvu", label: "Tên dịch vụ", width:250},
				{ field: "ma_dichvu", label: "Mã dịch vụ", width:100},
				{ field: "gia_dichvu", label: "Giá dịch vụ (VND)", width:80,
					template: function (rowData) {
						if (rowData.gia_dichvu != null && rowData.gia_dichvu !== "") {
							return (Number(rowData.gia_dichvu).toLocaleString())
						}
						return "";
					}
				},
				{ field: "ma_gia", label: "Mã giá dịch vụ", width:80},
		     ],
		     onRowClick: function(event){
		    	if(event.rowId){
		        		var path = 'dichvu/model?id='+ event.rowId;
		        		this.getApp().getRouter().navigate(path);
		        }
				// this.getApp().loading(); 
				// this.getApp().alert("haha");
		    	
		    },
		    language:{
        		no_records_found:"Chưa có dữ liệu"
        	},
        	noResultsClass:"alert alert-default no-records-found",
        	datatableClass:"table table-mobile",
		    onRendered: function (e) {
				gonrinApp().responsive_table();
				this.$el.find('.grid_container').addClass('mt-3');
			}
    	},
	    render:function() {
			var self = this;
			this.$el.find('.page-title').text('Danh sách dịch vụ');
			var currentUser = gonrinApp().currentUser;
			var filter = new CustomFilterView({
    			el: self.$el.find("#grid_search")
    		});
			filter.render();
			filter.$el.find('.search-collection input').attr("placeholder", "Nhập tên dịch vụ, mã dịch vụ, mã giá, gía để tìm kiếm.")
    		self.uiControl.orderBy = [{"field": "ten_dichvu", "direction": "asc"}];
    		if(!filter.isEmptyFilter()) {
				var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
				var filters = {"$or": [
					{"ten_dichvu_khongdau": {"$likeI": gonrinApp().convert_khongdau(text) }},
					{"ma_dichvu": {"$likeI": gonrinApp().convert_khongdau(text) }},
				]}
    			self.uiControl.filters = filters;
    		} else {
				var filters = {"$and": [
					{"ten_dichvu_khongdau": {"$likeI": "" }}
				]}
    			self.uiControl.filters = filters;
			}
    		self.applyBindings();
    		
    		filter.on('filterChanged', function(evt) {
    			var $col = self.getCollectionElement();
    			var text = !!evt.data.text ? evt.data.text.trim() : "";
				if ($col) {
					if (text !== null){
						var filters = {"$or": [
							{"ten_dichvu_khongdau": {"$likeI": gonrinApp().convert_khongdau(text) }},
							{"ma_dichvu": {"$likeI": gonrinApp().convert_khongdau(text) }},
						]}
						self.uiControl.filters = filters;
						$col.data('gonrin').filter(filters);
					} else {
						self.uiControl.filters = null;
					}
				}
				self.applyBindings();
    		});
			this.applyBindings();

			// self.$el.find(".toolbar").append('<button type="text" class="btn btn-info btn-sm ml-2 import-excel">Import excel</button>');
			// self.$el.find(".import-excel").unbind("click").bind("click", function () {
			// 	self.$el.find("#upload_files").click();
			// });
			// self.$el.find("#upload_files").on("change", function(e) {
            //     self.importDichVu();
            // });
			return this;
		},
		importDichVu: function () {
			var self = this;
			var file = self.$el.find("#upload_files")[0].files[0];
            self.getApp().showloading();
            if (!!file ) {
                self.function_upload_file(file);
            } else {
                self.getApp().hideloading();
                self.getApp().notify("Vui lòng chọn đúng định dạng tệp");
                return;
            }
		},
		function_upload_file: function(result) {
            var self = this;
            var http = new XMLHttpRequest();
            var fd = new FormData();
            fd.append('file', result, result.name);
            http.open('POST', gonrinApp().serviceURL + '/api/v1/dichvu/import');
            var token = !!gonrinApp().currentUser ? gonrinApp().currentUser.token : null;
            http.setRequestHeader("X-USER-TOKEN", token);
            http.setRequestHeader("type_file", 1);
            http.upload.addEventListener('progress', function(evt) {
                if (evt.lengthComputable) {
                    var percent = evt.loaded / evt.total;
                    percent = parseInt(percent * 100);

                }
            }, false);
            http.addEventListener('error', function() {
                self.getApp().hideloading();
                self.getApp().notify("Không tải được file lên hệ thống");
            }, false);
            http.onreadystatechange = function() {
                self.getApp().hideloading();
                if (http.status === 200) {
                    if (http.readyState === 4) {

                        var data_file = JSON.parse(http.responseText),
                            link, p, t;
						gonrinApp().notify("Tải dữ liệu thành công.");
						gonrinApp().getRouter().refresh();
                    }
                } else {
                    self.getApp().notify("Không thể file ảnh lên hệ thống");
                }
            };
            http.send(fd);
        },
    });

});