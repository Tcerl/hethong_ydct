define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template = require('text!app/quanly_tintuc/baiviet/DialogAttachFile/tpl/model_dialog.html');  
    var DialogManageFile = require("app/quanly_file/attachment/ModelDialogView"); 
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
							this.close()
						}
					},
                    {
                        name: "save",
                        type: "button",
                        buttonClass: "btn-success width-sm ml-2",
                        label: `<i class="fas fa-plus"></i> Chèn`,
                        command: function(){
                            var self = this;
                            if (!self.file_name) {
                                self.getApp().notify({ message: "Vui lòng nhập tiêu đề" }, { type: "danger", delay: 1000 });
                                return
                            }
                            else if (!self.url_file) {
                                self.getApp().notify({ message: "Vui lòng nhập đường dẫn" }, { type: "danger", delay: 1000 });
                                return
                            }
                            
                            self.trigger("attach_file", self.file_name, self.url_file, self.title_attach_file);
                            self.close();
                        }
                    }
    	    	]
    	    }
        ],
        file_name: "",
        url_file: "",
        title_attach_file: "",
    	render: function() {
            var self = this;
            var curUser = self.getApp().currentUser;
            if (curUser) {
                self.applyBindings();
                self.file_name = self.viewData.file_name;
                self.url_file = self.viewData.url_file;
                self.title_attach_file = self.viewData.title_attach_file;
                if (self.file_name && self.url_file) {
                    if (self.title_attach_file) {
                        self.$el.find("#title_attach_file").val(self.title_attach_file);
                    }
                    self.$el.find("#file_name").val(self.file_name);
                    self.$el.find("#url_file").val(self.url_file);
                    self.renderPreview();
                }
                self.$el.find("#title_attach_file").keyup(function() {
                    self.title_attach_file = $(this).val();
                    self.renderPreview();
                });
                self.$el.find("#file_name").keyup(function() {
                    self.file_name = $(this).val();
                    self.renderPreview();
                });
                self.$el.find("#url_file").keyup(function() {
                    self.url_file = $(this).val();
                    self.renderPreview();
                });
                self.$el.find("#choose_file").unbind("click").bind("click", function() {
                    var dialog = new DialogManageFile({"viewData": {}});
                    dialog.dialog({size:"large"});
                    dialog.on("success", function(file) {
                        self.url_file = gonrinApp().check_file_minio(file);
                        self.file_name = file.name;
                        self.$el.find("#file_name").val(self.file_name);
                        self.$el.find("#url_file").val(self.url_file);
                        self.renderPreview();
                    });
                });
                return this;
            }
        },
        renderPreview: function() {
            var self = this;
            self.$el.find("#preview_attach_file").html("");
            if (self.file_name && self.url_file) {
                var title_html = "";
                if (self.title_attach_file) {
                    title_html = `<div class='file-attach-title'><p>`+ self.title_attach_file +`</p></div>`;
                }
                var html = `
                    <div class='file-attach'>
                        `+ title_html +`
                        <div class='file-attach-content'>
                            <div class='file-attach-icon'>
                                <a href='`+ self.url_file +`' target='_blank'>
                                    <img src='static/images_template/image_file_icons/file.png'>
                                </a>
                            </div>
                            <div class='file-attach-info'>
                                <a target='_blank' href='`+ self.url_file +`'>` + self.file_name + ` &nbsp;&nbsp;<button type="button" class="btn-download"><i class="fas fa-file-download"></i> Tải xuống</button></a>
                            </div>
                        </div>
                    </div>
                `;
                self.$el.find("#preview_attach_file").append(html);
            }
        }
    });

});