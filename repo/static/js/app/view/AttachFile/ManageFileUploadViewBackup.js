define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var    PhotoSwipe 		= require('vendor/photoswipe/photoswipe'),
		PhotoSwipeUI_Default = require('vendor/photoswipe/photoswipe-ui-default');

    var itemTemplate = require('text!app/view/AttachFile/tpl/attachfile.html'),
        template = `<input type="file" class="form-control d-none" id="upload_files" lang="vi" accept="audio/*|video/*|image/*|MIME_type" >
        <table class="table table-centered table-nowrap table-bordered table-sm table-file-dinhkem mb-0">
            <thead class="thead-light">
                <tr class="">
                    <th scope="col">Tên file</th>
                    <th scope="col">Thời gian cập nhật</th>
                    <th scope="col"></th>
                </tr>
            </thead>
            <tbody class="danhsach-file">
                
            </tbody>
        </table>`,
        itemSchema = require('json!app/view/AttachFile/SchemaAttachFile.json');

    // if ($(window).width() <= 650) {
    //     itemTemplate = require('text!app/view/AttachFile/tpl/mobileattachfile.html');
    // }
    var Compressor = require('../../../../vendor/compressor');
    return Gonrin.ModelView.extend({
        template: template,
        bindings: 'data-file-bind',
        modelSchema: itemSchema,
        uiControl: {},
        list_image:[],
        register: false,
        render: function() {
            var self = this;
            self.list_image = [];
            self.$el.find("#upload_files").on("change", function(e) {
                self.process_upload_file();
            });
            if (self.viewData && self.viewData.register){
                self.register = true;
            }
            if(self.viewData.$el_btn_upload){
                self.viewData.$el_btn_upload.unbind("click").bind('click',function(){
                    self.$el.find("#upload_files").trigger('click'); 
                });
            }
            if(self.viewData && self.viewData.listFile && self.viewData.listFile.length>0){
                self.list_image = self.viewData.listFile;
                self.$el.find('.table-file-dinhkem').show();
                for(var i=0; i<self.viewData.listFile.length; i++){
                    var itemData = self.viewData.listFile[i];
                    self.renderItem(itemData);
                }
            } else {
                self.$el.find('.table-file-dinhkem').hide();
            }
            this.applyBindings();
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
        renderItem: function(itemData) {
            var self = this;
            if(self.$el.find("#tr_"+itemData.id) && self.$el.find("#tr_"+itemData.id).length>0){
                return "";
            }
            
            var name = itemData.name,
                id = itemData.id,
                link = self.check_url_file(itemData.link),
                updated_at = itemData.updated_at,
                type = itemData.type;
            // var new_item_tpl = $('<tr id="tr_'+id+'">');
            var new_item_tpl = $(`<tr id="${id}">`);

            new_item_tpl.html(itemTemplate);
            if (link && type && (type.includes("jpg") || type.includes("png"))) {
                new_item_tpl.find("#name_file").html(name + type);
                new_item_tpl.find(".url_file button").addClass(id);
                if (!!updated_at){
                    let text_updated_at = gonrinApp().parseDate(updated_at);
                    new_item_tpl.find('.updated_at').html(`${text_updated_at? text_updated_at.format('DD/MM/YYYY') : ""}`);
                }
                else{
                    new_item_tpl.find('.updated_at').html(``);
                }
                new_item_tpl.find("#name_file").append('<img class="d-none list-image" src="'+link+'">');
                new_item_tpl.find("#name_file").unbind("click").bind("click",{obj:{"url":link,"id":id}},function(e){
                    var object = e.data.obj;
                    var img = document.createElement('img');
                    img.src = object.url;
                    img.onload = function(e){
                        // gonrinApp().openPhotoSwipe( 0, self.$el.find(".danhsach-file") );
                        var index = 0;
                        var thumbElements = self.$el.find(".danhsach-file tr");
                        for (var i = 0; i< thumbElements.length; i++) {
                            var id_img_element = $(thumbElements[i]).attr("id");
                            if (id_img_element == object.id) {
                                index = i;
                            }
                        }
                        self.openPhotoSwipe(index, self.$el, "danhsach-file");
                    };
                    img.onerror = function(e) {
                    };
                });

            } else if (link) {
                new_item_tpl.find("#name_file").html(name + type);
                new_item_tpl.find(".url_file").attr("href", link).attr("target", "_blank");
                if (!!updated_at){
                    let text_updated_at = gonrinApp().parseDate(updated_at);
                    new_item_tpl.find('.updated_at').html(`${text_updated_at? text_updated_at.format('DD/MM/YYYY') : ""}`);
                }
                else{
                    new_item_tpl.find('.updated_at').html(``);
                }
            }
            self.$el.find(".danhsach-file").append(new_item_tpl);
            new_item_tpl.find("#itemRemove").unbind("click").bind("click",{obj:id}, function(e) {
                var id_data = e.data.obj;
                var list = self.list_image;
                if (list !== undefined && list.length > 0) {
                    var list_to_set_image = [];
                    list.forEach((image, index) => {
                        if (id_data == image.id) {
                            // self.$el.find("#tr_"+id_data).remove();
                            self.$el.find(`#${id_data}`).remove();
                        } else {
                            list_to_set_image.push(image);
                        }
                    });
                    if (list_to_set_image.length == 0) {
                        self.$el.find('.table-file-dinhkem').hide();
                    }
                    self.list_image = list_to_set_image;
                }
                self.trigger('change', {"data": self.list_image});
            });
        },
        process_upload_file: function() {
            var self = this;
            self.$el.find("#upload_files")[0].files[0]
            var file = self.$el.find("#upload_files")[0].files[0];
            self.getApp().showloading();
            if (!!file && file.type.match('image*')) {
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
            } else if (!!file && !file.type.match('image*')) {
                self.function_upload_file(file);
            } else {
                self.getApp().hideloading();
                self.getApp().notify("Có lỗi trong quá trình xử lý file, vui lòng thử lại sau");
                return;
            }
        },
        check_url_file: function(link) {
            var self = this;
            var url_image = ""

            if (!!link) {
                if (link.startsWith("https://") || link.startsWith("http://")) {
                    url_image = link;
                } else {
                    if(link.startsWith("/")){
                        if (link.startsWith("/anhduoclieu")){
                            url_image = gonrinApp().staticURL + link.substring(1);;
                        }
                        else{
                            url_image = gonrinApp().uploadURL + link.substring(1);;
                        }
                    }else{
                        if (link.startsWith("/anhduoclieu")){
                            url_image = gonrinApp().staticURL + link;
                        }
                        else{
                            url_image = gonrinApp().uploadURL + link;
                        }
                    }
                    
                }
            }
            return url_image;
        },
        function_upload_file: function(result) {
            var self = this;
            var token = !!gonrinApp().currentUser ? gonrinApp().currentUser.token : null;
            var user_id = !!gonrinApp().currentUser ? gonrinApp().currentUser.id : "";
            var http = new XMLHttpRequest();
            var fd = new FormData();
            fd.append('file', result, result.name);
            fd.append('user_id', gonrinApp().currentUser?.id);
            fd.append('domain', gonrinApp().serviceURL);
            fd.append('path_api', "/api/v1/current_user");


            // http.open('POST', gonrinApp().serviceURL + '/api/v1/upload');
            http.open('POST', gonrinApp().serviceUpload);

            
            http.setRequestHeader("X-USER-TOKEN", token);
            http.setRequestHeader("X-Auth-Token", "token-store-file");
            http.setRequestHeader("X-USER-ID", user_id);


            if (self.register){
                http.setRequestHeader("X-REGISTER", true);
            }

            // http.upload.addEventListener('progress', function(evt) {
            //     if (evt.lengthComputable) {
            //         var percent = evt.loaded / evt.total;
            //         percent = parseInt(percent * 100);

            //     }
            // }, false);
            http.addEventListener('error', function() {
                self.getApp().hideloading();
                self.getApp().notify("Không tải được file lên hệ thống");
            }, false);
            http.onreadystatechange = function() {
                self.getApp().hideloading();
                if (http.status === 200) {
                    if (http.readyState === 4) {

                        var data_file = JSON.parse(http.responseText);
                        console.log("ManageFileUploadView.function_upload_file.data_file =====",data_file)
                        var data = {
                            "id": data_file.id,
                            "name": data_file.name,
                            "type": data_file.extname,
                            "link": data_file.link,
                            "updated_at": gonrinApp().parseInputDateString(data_file.updated_at).unix(),
                            "size": data_file.size
                        };
                        self.getApp().notify("Tải file thành công!");
                        var list_file_dinhkem = self.list_image;
                        if (list_file_dinhkem == null || list_file_dinhkem == undefined) {
                            list_file_dinhkem = [];
                        }
                        if (list_file_dinhkem instanceof Array) {
                            var arraylist_file_dinhkem = [];
                            var exist = false;
                            if (list_file_dinhkem.length == 0) {
                                arraylist_file_dinhkem.push(data);
                                self.renderItem(data);
                            } else {
                                for (var i = 0; i < list_file_dinhkem.length; i++) {
                                    if (data.id == list_file_dinhkem[i].id) {
                                        exist= true;
                                    } 
                                    arraylist_file_dinhkem.push(list_file_dinhkem[i]);      
                                }
                                if (exist == false) {
                                    arraylist_file_dinhkem.push(data);
                                    self.renderItem(data);
                                }
                                
                            }
                            self.list_image = arraylist_file_dinhkem;
                            if (arraylist_file_dinhkem.length == 0) {
                                self.$el.find('.table-file-dinhkem').hide();
                            } else {
                                self.$el.find('.table-file-dinhkem').show();
                            }
                            self.trigger('change', { data: self.list_image });
                        }
                    }
                } else {
                    self.getApp().notify("Không thể file lên hệ thống");
                }
            };
            http.send(fd);
        },
        openPhotoSwipe : function(index, galleryElement, class_file, disableAnimation, fromURL) {
            var self = this;
            var pswpElement = document.querySelectorAll('.pswp')[0];
            var items = self.parseThumbnailElements(galleryElement, class_file);
            var options = {index:index};
            // Pass data to PhotoSwipe and initialize it
            var gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
            gallery.init();
        },
        parseThumbnailElements : function(el, class_file = "list-image") {
            var self = this;
            var thumbElements = el.find("." + class_file + " img");
            var items = [];
            for(var i = 0; i < thumbElements.length; i++) {
                // create slide object
                var item = {
                    src: thumbElements[i].getAttribute('src'),
                    w: parseInt(thumbElements[i].naturalWidth, 10),
                    h: parseInt(thumbElements[i].naturalHeight, 10)
                };
                item.el = thumbElements[i]; // save link to element for getThumbBoundsFn
                items.push(item);
            }
            return items;
        },
    });

});