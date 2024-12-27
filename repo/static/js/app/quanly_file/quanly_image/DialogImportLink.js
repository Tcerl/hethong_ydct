define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template = `<div class="row text-center py-2" style="justify-content: center;">
            <h4 class="page-title text-uppercase text-center text-primary">Tải ảnh lên từ đường dẫn</h4>
        </div>
        <div class="col-lg-12 col-xs-12 px-1">
                <div class="text-center">
                    <input type="text" class="form-control" placeholder="Nhập đường dẫn ảnh" id="link_url_image">
                </div>
                <div class="text-center mt-1">
                    <button type="button" class="btn btn-info mt-1 mr-2" id="btn_insert_link_image">Tải ảnh</button>
                    <button type="button" class="btn btn-secondary mt-1" id="close">Đóng</button>
                </div>
                <img id="img_link" class="d-none">
            </div>
        </div>
        <style>
            @media (min-width: 576px) {
                .modal-sm {
                    max-width: 350px;
                }
            }
        </style>`; 
    return Gonrin.ModelDialogView.extend({
    	template: template,
        modelSchema: {},
        urlPrefix: "",
        collectionName: "",
        uiControl: {
            fields: [
        
            ]
        },
        can_upload: false,
    	render: function() {
            var self = this;
            self.can_upload = false;
            var curUser = self.getApp().currentUser;
            if (curUser) {
                self.applyBindings();
                self.$el.find("#close").unbind("click").bind("click", function () {
                    self.close();
                    return;
                });
                
                self.$el.find("#btn_insert_link_image").unbind("click").bind("click", function () {
                    self.$el.find("#img_link").unbind("error").on("error", function (e) {
                        if (self.can_upload = true) {
                            self.getApp().notify({ message: "Đường dẫn không phải là ảnh. Vui lòng nhập lại."}, { type: "danger", delay: 1000 });
                            return;
                        }
                        self.can_upload = false;
                    });
                    self.$el.find("#img_link").unbind("load").on("load", function (e) {
                        if (self.can_upload = true) {
                            var link_url_image = self.$el.find("#link_url_image").val();
                            self.uploadFile(link_url_image)
                        }
                        self.can_upload = false;
                    });
                  
                    var link_url_image = self.$el.find("#link_url_image").val();
                    var file_name = "avatar_" + String(Math.floor(1000000 + Math.random() * 9000000));
                    self.can_upload = true;
                    if (!link_url_image) {
                        if (self.can_upload = true) {
                            self.getApp().notify({ message: "Lưu thông tin không thành công"}, { type: "danger", delay: 1000 });
                            return;
                        }
                        self.can_upload = false;
                    } else if (link_url_image.startsWith("data:image") == false) {
                        self.$el.find("#img_link").attr("src", link_url_image);

                        var list_split = link_url_image.split("/");
                        if (list_split.length >= 3 && String(list_split[list_split.length - 1]).trim() != "") {
                            file_name = list_split[list_split.length - 1];
                        }
                    } else {
                        self.$el.find("#img_link").attr("src", link_url_image);
                    }
                });
                return this;
            }
        },
        uploadFile(link_url_image) {
            var self = this;
            var url = gonrinApp().serviceURL + '/api/v1/upload-link/';
            var file_name ="Anh-Upoad-Link-" + String(Math.floor(1000000 + Math.random() * 9000000)) + ".png";

            if (link_url_image.startsWith("data:image") == false) {
                var list_split = link_url_image.split("/");
                if (list_split.length >= 3 && String(list_split[list_split.length - 1]).trim() != "") {
                    file_name = list_split[list_split.length - 1];
                }
            }
            var params = JSON.stringify({
                "url_file": link_url_image,
                "file_name": file_name,
                "type_file": 1
            })
            $.ajax({
                url: url,
                type: 'post',
                data: params,
                headers: {
                    'content-type': 'application/json'
                },
                dataType: 'json',
                success: function(data) {
                    self.trigger('success');
                    self.close();
                },
                error: function(xhr, status, error) {
                    try {
                        if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED") {
                            self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                            self.getApp().getRouter().navigate("login");
                        } else {
                            self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                        }
                    } catch (err) {
                        self.getApp().notify({ message: "Có lỗi xảy ra, vui lòng thử lại sau" }, { type: "danger", delay: 1000 });
                    }
                },
                complete: function() {
                    self.getApp().hideloading();
                    return false;
                }
            });
            // var self = this;
            // if (link_url_image.startsWith("data:image")) {
            //     var file_name ="Anh-Upoad-Link-" + String(Math.floor(1000000 + Math.random() * 9000000)) + ".png";
            //     gonrinApp().base64toFile(link_url_image, file_name, 'image/png').then(function(file) { 
            //         if (file.name != "" && file.name != null) {
            //             gonrinApp().function_upload_file(self, file);
            //         }
            //     });
            // } else {
            //     var xhr = new XMLHttpRequest();
            //     xhr.onload = function() {
            //         var reader = new FileReader();
            //         reader.onloadend = function() {
            //             var file_name ="Anh-Upoad-Link-" + String(Math.floor(1000000 + Math.random() * 9000000)) + ".png",
            //                 list_split = link_url_image.split("/");
            //             if (list_split.length >= 3 && String(list_split[list_split.length - 1]).trim() != "") {
            //                 file_name = list_split[list_split.length - 1];
            //             }
            //             gonrinApp().base64toFile(reader.result, file_name, "image/png").then(function(file) { 
            //                 if (file.name != "" && file.name != null) {
            //                     gonrinApp().function_upload_file(self, file);
            //                 }
            //             });
            //         }
            //         reader.readAsDataURL(xhr.response);
            //     };
            //     xhr.open('GET', link_url_image);
            //     xhr.responseType = 'blob';
            //     xhr.send();
            // }
        },
        // getMimeTypeFromBase64 (base64str) {
        //     var extname = "png",
        //         mimeType = "image/png";

        //     var mimeType_file = base64str.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0];
        //     if (mimeType_file.startsWith("image/")) {
        //         mimeType = mimeType_file;
        //         extname = mimeType.replace("image/", ".");
        //     }
        //     return {
        //         "extname":extname,
        //         "mimeType": mimeType
        //     }
        // }
    });
});