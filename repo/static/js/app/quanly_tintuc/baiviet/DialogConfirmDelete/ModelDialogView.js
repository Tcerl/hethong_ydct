define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template = require('text!app/quanly_tintuc/baiviet/DialogConfirmDelete/tpl/model_dialog.html');   
    return Gonrin.ModelDialogView.extend({
    	template: template,
        modelSchema: {},
        urlPrefix: "",
        collectionName: "",
        uiControl: {
            fields: [
        
            ]
        },
		tools: [
            {
				name: "back",
				type: "button",
				buttonClass: "btn-secondary waves-effect width-sm",
				label: `<i class="fas fa-times"></i> Hủy`,
				command: function(){
					this.close();
				}
			},
			{
				name: "save",
				type: "button",
				buttonClass: "btn-danger width-sm ml-2",
				label: `<i class="far fa-check-circle"></i> Đồng ý`,
				command: function(){
					var self = this;
                    self.trigger("confirm");
					self.close();
				}
			},
        ],
    	render: function() {
            var self = this;
            self.$el.find(".page-title").text("Xóa bình luận");
            return this;
        }
    });

});