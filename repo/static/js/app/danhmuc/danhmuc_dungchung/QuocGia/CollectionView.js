define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/bases/tpl/collection.html');
	
	var ModelDialogView = require("app/danhmuc/danhmuc_dungchung/QuocGia/ModelView");
    return Gonrin.CollectionView.extend({
    	template : template,
    	modelSchema	: {},
    	urlPrefix: "/api/v1/",
    	collectionName: "quocgia",
		tools : [
		],
    	uiControl:{
    		fields: [
	    	    //  { 
	    	    // 	field: "id",label:"ID",width:250,readonly: true, visible:false
	    	    //  },
				{ field: "stt", label: "STT", width:50},
	    	     { field: "id", label: "Mã", width:200},
		     	 { field: "ten", label: "Tên"},
		     ],
		     onRowClick: function(event){
				var self = this;
		    	if(event.rowId){
					var dialog = new ModelDialogView({"viewData": {"id": event.rowId}});
					dialog.dialog();
					dialog.on("saveData", function () {
						self.doFilter();
					})
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
			this.$el.find('.page-title').text('Danh sách quốc gia');
			this.applyBindings();
			this.$el.addClass('category-common');
			return this;
    	},
		doFilter: function () {
			var self = this;
			var $col = self.getCollectionElement();
			$col.data('gonrin').filter(null);
		}
    });

});