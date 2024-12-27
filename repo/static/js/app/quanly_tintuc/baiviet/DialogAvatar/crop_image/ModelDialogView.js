define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template = require('text!app/quanly_tintuc/baiviet/DialogAvatar/crop_image/tpl/model_dialog.html'); 
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
							self.close()
						}
					},
    	    	]
    	    },
            {
                name: "save",
                type: "button",
                buttonClass: "btn-success width-sm ml-2",
                label: `<i class="far fa-save"></i> Lưu`,
                command: function() {
                    var self = this;
                    var $image = self.$el.find("#mainImage");
                    var result = $image.cropper('getCroppedCanvas');
                    var url = result.toDataURL('image/png');
                    var file_name = self.model.get("file_name");
                    var file_name_crop = "Edit-" + file_name + ".png";
                    self.urltoFile(url, file_name_crop, 'image/png').then(function(file) { 
                        if (file.name != "" && file.name != null) {
                            self.function_upload_file(file);
                        }
                    });
                }
            },
        ],
    	render: function() {
            var self = this;
            var curUser = self.getApp().currentUser;
            if (curUser) {
                self.applyBindings();
                var url_img = self.viewData.url_img,
                    file_name = self.viewData.file_name,
                    mode = self.viewData.mode;
                self.model.set("file_name", file_name);
                var $image = self.$el.find("#mainImage");
                $image.attr("src", url_img);
                $image.on('error', function(event) {
                    self.getApp().notify({ message: "Ảnh không hợp lệ"}, { type: "danger", delay: 1000 });
                    setTimeout(function() {
                        self.close();
                    }, 2000)
                    return;
                });

                $image.on('load', function() {
                    var height = this.height;
                    var width = this.width;
                    var minContainerHeight = 686;
                    var minContainerWidth = minContainerHeight * width/height;
                    if (minContainerWidth > 1116) {
                        minContainerWidth = 1116;
                        minContainerHeight = minContainerWidth * height/width;
                        if (width <= minContainerWidth) {
                            minContainerHeight = height;
                            minContainerWidth = width;
                        }
                    }
                    else {
                        if (height <= minContainerHeight) {
                            minContainerHeight = height;
                            minContainerWidth = width;
                        }
                    }
                    var aspectRatio = 40 / 21;
                    if (mode == "avatar_thuong") {
                        aspectRatio = 40 / 21;
                    }
                    else if (mode = "avatar_vuong") {
                        aspectRatio = 1 / 1;
                    }
                    var options = {
                        aspectRatio: aspectRatio,
                        minContainerWidth: minContainerWidth,
                        minContainerHeight: minContainerHeight,
                        preview: '.img-preview',
                        crop: function (e) {}
                    };
                    
                    $image.on().cropper(options);
                });
                return this;
            }
            
            
        },
        urltoFile: function(url, filename, mimeType) {
            return (fetch(url)
                .then(function(res){return res.arrayBuffer();})
                .then(function(buf){return new File([buf], filename,{type:mimeType});})
            );
        },
        function_upload_file: function(result) {
            var self = this;
            var http = new XMLHttpRequest();
            var fd = new FormData();
            fd.append('file', result, result.name);
            fd.append('type_file', "1");
            // fd.append('user_id', gonrinApp().currentUser.id);
            // fd.append('domain', gonrinApp().serviceURL);
            // fd.append('path_api', "/api/v1/current_user");
            // var url = gonrinApp().domain_upload_url + '/api/v1/' + gonrinApp().prefix_url_file;
            var url = gonrinApp().serviceURL + '/api/v1/upload';
            http.open('POST', url);
            var token = !!gonrinApp().currentUser ? gonrinApp().currentUser.token : null;
            http.setRequestHeader("X-USER-TOKEN", token);
            
            http.addEventListener('error', function(r) {
                self.getApp().hideloading();
                self.getApp().notify("Không tải được file lên hệ thống");
            }, false);

            http.onreadystatechange = function() {
                self.getApp().hideloading();
                if (http.status === 200) {
                    if (http.readyState === 4) {
                        var data_file = JSON.parse(http.responseText);
                        var data = {
                            "id": data_file.id,
                            "name": data_file.name,
                            "type": data_file.extname,
                            "link": data_file.link
                        };
                        self.trigger('insert_success', data);
                        self.close();
                    }
                } else {
                    self.getApp().notify("Không thể tải file lên hệ thống");
                }
            };
            http.send(fd);
        },
    });
});