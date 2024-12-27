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
		collectionName: "donvi_cungung",
		tools : [
			{
				name: "create",
				type: "button",
				buttonClass: "btn-success btn-sm",
				label: "TRANSLATE:CREATE",
				command: function(){
					var self = this;
					self.getApp().getRouter().navigate('donvi_cungung/model');
				}
			},
		],
    	uiControl:{
    		fields: [
	    	     { 
	    	    	field: "id",label:"ID",width:250,readonly: true, visible:false
	    	     },
				{ field: "ten", label: "Tên đơn vị", width:250 },
				{ field: "sodienthoai", label: "Số điện thoại", width:120 },
				{ field: "diachi", label: "Địa chỉ"},
		     ],
		     onRowClick: function(event){
		    	if(event.rowId){
		        		var path = 'donvi_cungung/model?id='+ event.rowId;
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
	    render:function() {
			var self = this;
			this.$el.find('.page-title').text('Danh sách đơn vị cung ứng');
			var currentUser = gonrinApp().currentUser;
			if (!currentUser){
				self.getApp().notify("Hết phiên đăng nhập, vui lòng đăng nhập lại");
				self.getApp().getRouter().navigate("login");
				return;
			}
			var filter = new CustomFilterView({
    			el: self.$el.find("#grid_search")
    		});
    		filter.render();
    		self.uiControl.orderBy = [{"field": "ten", "direction": "asc"}];
    		if(!filter.isEmptyFilter()) {
				var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
				var filters = {"$and": [
					{"tenkhongdau": {"$likeI": gonrinApp().convert_khongdau(text) }}
				]}
				// if (this.getApp().hasRole('admin') === false) {
				// 	filters = {"$and": [
				// 		{"donvi_id": {"$eq": currentUser.donvi_id}},
				// 		{"tenkhongdau": {"$likeI": gonrinApp().convert_khongdau(text) }}
				// 	]}
				// }
    			self.uiControl.filters = filters;
    		} else {
				var filters = {"$and": [
					{"tenkhongdau": {"$likeI": "" }}
				]}
				// if (this.getApp().hasRole('admin') === false) {
				// 	filters = {"$and": [
				// 		{"donvi_id": {"$eq": currentUser.donvi_id}}
				// 	]}
				// }
    			self.uiControl.filters = filters;
			}
    		self.applyBindings();
    		
    		filter.on('filterChanged', function(evt) {
    			var $col = self.getCollectionElement();
    			var text = !!evt.data.text ? evt.data.text.trim() : "";
				if ($col) {
					if (text !== null){
						var filters = {"$and": [
							{"tenkhongdau": {"$likeI": gonrinApp().convert_khongdau(text) }}
						]};
						// if (this.getApp().hasRole('admin') === false) {
						// 	filters = {"$and": [
						// 		{"donvi_id": {"$eq": currentUser.donvi_id}},
						// 		{"tenkhongdau": {"$likeI": gonrinApp().convert_khongdau(text) }}
						// 	]}
						// }
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
		// importDichVu: function () {
		// 	var self = this;
		// 	var file = self.$el.find("#upload_files")[0].files[0];
        //     self.getApp().showloading();
        //     if (!!file ) {
        //         self.function_upload_file(file);
        //     } else {
        //         self.getApp().hideloading();
        //         self.getApp().notify("Vui lòng chọn đúng định dạng tệp");
        //         return;
        //     }
		// },
		// function_upload_file: function(result) {
        //     var self = this;
        //     var http = new XMLHttpRequest();
        //     var fd = new FormData();
        //     fd.append('file', result, result.name);
        //     http.open('POST', gonrinApp().serviceURL + '/api/v1/dichvu/import');
        //     var token = !!gonrinApp().currentUser ? gonrinApp().currentUser.token : null;
        //     http.setRequestHeader("X-USER-TOKEN", token);
        //     http.setRequestHeader("type_file", 1);
        //     http.upload.addEventListener('progress', function(evt) {
        //         if (evt.lengthComputable) {
        //             var percent = evt.loaded / evt.total;
        //             percent = parseInt(percent * 100);

        //         }
        //     }, false);
        //     http.addEventListener('error', function() {
        //         self.getApp().hideloading();
        //         self.getApp().notify("Không tải được file lên hệ thống");
        //     }, false);
        //     http.onreadystatechange = function() {
        //         self.getApp().hideloading();
        //         if (http.status === 200) {
        //             if (http.readyState === 4) {

        //                 var data_file = JSON.parse(http.responseText),
        //                     link, p, t;
		// 				gonrinApp().notify("Tải dữ liệu thành công.");
		// 				gonrinApp().getRouter().refresh();
        //             }
        //         } else {
        //             self.getApp().notify("Không thể file ảnh lên hệ thống");
        //         }
        //     };
        //     http.send(fd);
        // },
    });

});