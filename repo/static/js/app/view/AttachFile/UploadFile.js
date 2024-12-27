define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');
    var itemTemplate = require('text!app/view/AttachFile/tpl/attachfile.html'),
        template = '<div id="box_file_upload" class="d-none"></div>',
        itemSchema = require('json!app/view/AttachFile/SchemaAttachFile.json');

    if ($(window).width() <= 650) {
        itemTemplate = require('text!app/view/AttachFile/tpl/mobileattachfile.html');
    }
    var Compressor = require('../../../../vendor/compressor');
    return Gonrin.ItemView.extend({
        template: template,
        bindings: 'data-bind-file',
        modelSchema: itemSchema,
        tagName: 'tr',
        Arr_file: [],
        uiControl: {},
        type_upload: null,
        type_file: null,
        render: function() {
            var self = this;
            self.type_file = null;
            self.type_upload = null;
            self.$el.find("#box_file_upload").html("");
            if (self.viewData.type_upload) {
                self.type_upload = self.viewData.type_upload;
            }
            if (self.viewData.type_file) {
                self.type_file = self.viewData.type_file;
            }
            if (self.type_upload == "image") {
                self.$el.find("#box_file_upload").append(`
                    <input type="file" class="form-control d-none" id="upload_files" lang="vi" accept="image/*" >
                `);
            }
            else if (self.type_upload == "video") {
                self.$el.find("#box_file_upload").append(`
                    <input type="file" class="form-control d-none" id="upload_files" lang="vi" accept="video/*" >
                `);
            }
            else {
                self.$el.find("#box_file_upload").append(`
                    <input type="file" class="form-control d-none" id="upload_files" lang="vi" accept="audio/*|video/*|image/*|MIME_type" >
                `);
            }
            self.applyBindings();
            self.registerView();
            self.$el.find("#upload_files").on("change", function(e) {
                self.Arr_file = [];
                self.process_upload_file();
            });
        },
        check_exist_image: function(id_image) {
            var self = this,
                exist = false;
            var viewData = self.viewData;
            if (!!viewData && (viewData.length > 0)) {
                viewData.forEach((iamge, index) => {

                    if (iamge.id == id_image) {
                        exist = true;
                    }
                });
            }
            return exist;
        },
        registerView: function() {
            var self = this;
            var name = self.model.get("name"),
                id = self.model.get("id"),
                link = self.model.get("link"),
                type = self.model.get("type");
            if (link && type && (type.includes("jpg") || type.includes("png"))) {
                self.$el.html(itemTemplate);
                var url_file = self.check_image(link);
                self.$el.find("#name_file").html(name + type).addClass(id);
                self.$el.find(".url_file button").addClass(id);
                self.trigger('load_image', "id");

            } else if (link) {
                //file la file doc/pdf/text/odt/..
                self.$el.html(itemTemplate);
                var url_file = self.check_image(link);
                self.$el.find("#name_file").html(name + type);
                self.$el.find(".url_file").attr("href", url_file).attr("target", "_blank");
                self.trigger('load_image', "id");

            } else {
                self.$el.find("#upload_files").click();
            }
            self.$el.find("#itemRemove").unbind("click").bind("click", function() {
                self.remove(true);
                self.trigger('remove', self.model.get("id"));
            });
        },
        process_upload_file: function() {
            var self = this;
            self.$el.find("#upload_files")[0].files[0];
            var file = self.$el.find("#upload_files")[0].files[0];
            var file_type = file.type;
            self.getApp().showloading();
            if (!!file && !!file_type) {
                if (self.type_upload == "image") {
                    if (file_type.toLowerCase().includes("jpeg") || file_type.toLowerCase().includes("jpg") || file_type.toLowerCase().includes("png") || file_type.toLowerCase().includes("gif")) {
                        new Compressor(file, {
                            quality: 0.6,
                            success(result) {
                                self.function_upload_file(result);
                            },
                            error(err) {
                                self.getApp().hideloading();
                                self.getApp().notify("Không thể tải tệp lên hệ thống");
                            },
                        });
                    } 
                    else {
                        self.getApp().hideloading();
                        alert("File không được hỗ trợ. Danh sách các đuôi file được hỗ trợ: jpg, jpeg, png, gif.");
                        return;
                    } 
                }
                else if (self.type_upload == "video") {
                    self.function_upload_file(file);
                }
                else {
                    if (file.type.match('image*')) {
                        new Compressor(file, {
                            quality: 0.6,
                            success(result) {
                                self.function_upload_file(result);
                            },
                            error(err) {
                                self.getApp().hideloading();
                                self.getApp().notify("Không thể tải tệp lên hệ thống");
                            },
                        });
                    } else {
                        self.function_upload_file(file);
                    }
                }
            } 
            else {
                self.getApp().hideloading();
                self.getApp().notify("Có lỗi trong quá trình xử lý file, vui lòng thử lại sau");
                return;
            }
        },
        check_image: function(link) {
            var self = this;
            var url_image = ""

            if (!!link) {
                if (link.startsWith("https://") || link.startsWith("http://")) {
                    url_image = link;
                } else {
                    url_image = gonrinApp().staticURL + link;
                }
            }
            return url_image;
        },
        function_upload_file: function(result) {
            var self = this;
            var http = new XMLHttpRequest();
            var fd = new FormData();
            fd.append('file', result, result.name);
            // fd.append('user_id', gonrinApp().currentUser.id);
            // fd.append('domain', gonrinApp().serviceURL);
            // fd.append('path_api', "/api/v1/current_user");
            if (self.type_file) {
                fd.append('type_file', self.type_file);
            }
            // var url = gonrinApp().domain_upload_url + '/api/v1/' + gonrinApp().prefix_url_file;
            var url = gonrinApp().serviceURL + '/api/v1/upload';
            http.open('POST', url);
            var token = !!gonrinApp().currentUser ? gonrinApp().currentUser.token : null;
            http.setRequestHeader("X-USER-TOKEN", token);

            // http.upload.addEventListener('progress', function(evt) {
            //     if (evt.lengthComputable) {
            //         var percent = evt.loaded / evt.total;
            //         percent = parseInt(percent * 100);
            //     }
            // }, false);
            
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
                            "link": data_file.link,
                            "size": data_file.size
                        };
                        self.trigger('success', { data: data });
                    }
                } else {
                    self.getApp().notify("Không thể tải file lên hệ thống");
                }
            };
            http.send(fd);
        },
    });
});