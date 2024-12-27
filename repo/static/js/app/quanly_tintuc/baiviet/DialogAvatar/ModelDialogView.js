define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template = require('text!app/quanly_tintuc/baiviet/DialogAvatar/tpl/model_dialog.html');   
    var UploadFile = require("app/view/AttachFile/UploadFile"); 
    var DialogCropImage = require('app/quanly_tintuc/baiviet/DialogAvatar/crop_image/ModelDialogView');  
    var DialogManageImage = require('app/quanly_file/quanly_image/ModelDialogView');
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
    	    	name: "defaultgr",
    	    	type: "group",
    	    	groupClass: "toolbar-group",
    	    	buttons: [
					{
						name: "close",
						type: "button",
						buttonClass: "btn-secondary waves-effect width-sm",
						label: "<i class='fas fa-times'></i> Đóng",
						command: function(){
							var self = this;
							this.close()
						}
					},
    	    	]
    	    }
        ],
    	render: function() {
            var self = this;
            var curUser = self.getApp().currentUser;
            if (curUser) {
                self.applyBindings();
                var mode =  self.viewData.mode;
                self.$el.find("#btn_insert_computer").unbind("click").bind("click", function() {
                    var uploadImage = new UploadFile({"viewData": {"type_upload": "image", "type_file": "1"}});
                    uploadImage.render();
                    uploadImage.on("success", (event) => {
                        var file = event.data;
                        var file_type = file.type;
                        if (!!file && !!file_type && (file_type.toLowerCase().includes("jpeg") || file_type.toLowerCase().includes("jpg") || file_type.toLowerCase().includes("png") || file_type.toLowerCase().includes("gif"))) {
                            self.getApp().notify("Tải file thành công!");
                            var url_img = gonrinApp().check_file_minio(file);
                            self.cropImage(url_img, file.name, mode);
                        }
                    });
                });
                self.$el.find("#btn_insert_cloud").unbind("click").bind("click", function() {
                    var model_dialog = new DialogManageImage({"viewData": {}});
                    model_dialog.dialog({size:"large"});
                    model_dialog.on("success", function(file) {
                        var url_img = gonrinApp().check_file_minio(file);
                        self.cropImage(url_img, file.name, mode);
                    });
                });
                self.$el.find("#btn_insert_link_image").unbind("click").bind("click", function() {
                    var link_url_image = self.$el.find("#link_url_image").val();
                    var file_name = "avatar_" + String(Math.floor(1000000 + Math.random() * 9000000)) + ".jpeg";
                    if (!link_url_image) {
                        self.getApp().notify({ message: "Lưu thông tin không thành công"}, { type: "danger", delay: 1000 });
                        return;
                    } else if (link_url_image.startsWith("data:image") == false) {
                        var list_split = link_url_image.split("/");
                        if (list_split.length >= 3 && String(list_split[list_split.length - 1]).trim() != "") {
                            file_name = list_split[list_split.length - 1];
                        }
                    }
                    self.cropImage(link_url_image, file_name, mode);
                });
                return this;
            }
        },
        cropImage: function(url_img, file_name, mode) {
            var self = this;
            var dialog = new DialogCropImage({"viewData": {"url_img": url_img, "file_name": file_name, "mode": mode}});
            dialog.dialog({size:"large"});
            dialog.on("insert_success", function(data) {
                self.trigger('printImg', data);
                self.close()
            });
        }
    });
});