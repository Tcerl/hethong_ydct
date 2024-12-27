define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template = require('text!app/quanly_tintuc/baiviet/DialogCrawlData/tpl/model_dialog.html');   
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
				label: `<i class="fas fa-times"></i> Đóng`,
				command: function(){
					this.close();
				}
			},
			{
				name: "save",
				type: "button",
				buttonClass: "btn-success width-sm ml-2",
				label: `<i class="far fa-save"></i> Lưu`,
				command: function(){
					var self = this;
                    var url_post = self.$el.find("#url_post").val();
                    if (!url_post) {
                        self.getApp().notify({ message: "Vui lòng nhập đường dẫn bài viết"}, { type: "danger", delay: 1000 });
                        return;
                    } 
                    else {
                        url_post = url_post.toLowerCase();
                        if (!(url_post.startsWith("https://suckhoedoisong.vn"))) {
                            self.getApp().notify({ message: "Trang lấy dữ liệu chưa được hỗ trợ. Vui lòng chọn trang khác"}, { type: "danger", delay: 1000 });
                            return;
                        }
                    }

                    var is_sava_link = false;
                    if (self.$el.find("#save_link").is(":checked")) {
                        is_sava_link = true;
                    }
                    var data = {
                        "url_post": url_post,
                        "is_sava_link": is_sava_link
                    }
                    self.trigger("crawl_data", data);
					self.close();
				}
			},
        ],
    	render: function() {
            var self = this;
            return this;
        }
    });

});