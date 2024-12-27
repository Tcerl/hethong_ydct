define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/quanly_tintuc/baiviet/tpl/model.html'),
        schema = require('json!schema/PostSchema.json');
    return Gonrin.ModelDialogView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "post",
        hasChange: false,
        uiControl: {
            fields: [
                {
                    field: "is_show_avatar",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: true, text: "Hiển thị" },
                        { value: false, text: "Ẩn" }
                    ],
                }, 
                {
                    field: "style_display",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: 0, text: "SIZE M" },
                        { value: 1, text: "SIZE L" },
                        { value: 2, text: "MAGAZINE" },
                        { value: 3, text: "INFOGRAPHIC" },
                        { value: 4, text: "VIDEO TỰ CHẠY" },
                        { value: 5, text: "BÀI HỎI ĐÁP" }
                    ],
                }, 
                {
                    field: "is_show_icon",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: true, text: "Hiển thị" },
                        { value: false, text: "Ẩn" }
                    ],
                }, 
                {
					field:"publish_time",
					uicontrol:"datetimepicker",
					format:"DD/MM/YYYY",
					textFormat:"DD/MM/YYYY",
					extraFormats:["DDMMYYYY"],
                    cssClass: "ml-datetimepicker",
                    parseInputDate: function(val){
						return gonrinApp().parseDate(val);
					},
					parseOutputDate: function(date){
						return date.unix();
					},
					disabledComponentButton: true
				},
                {
                    field: "is_post_video",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: true, text: "Có" },
                        { value: false, text: "Không" }
                    ],
                }, 
                {
                    field: "is_sensitive",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: true, text: "Có nhạy cảm" },
                        { value: false, text: "Không nhạy cảm" }
                    ],
                }, 
                {
                    field: "show_suggestion",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: 0, text: "Tin thông thường" },
                        { value: 1, text: "Tin tiêu điểm" }
                    ],
                }, 
                {
                    field: "is_show",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: 1, text: "Hiện" },
                        { value: 0, text: "Ẩn" }
                    ],
                },
                {
                    field: "is_highlights_home",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: true, text: "Có" },
                        { value: false, text: "Không" }
                    ],
                }, 
                {
                    field: "is_highlights_category",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: true, text: "Có" },
                        { value: false, text: "Không" }
                    ],
                }, 
                {
                    field: "is_post_pr",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: true, text: "Có" },
                        { value: false, text: "Không" }
                    ],
                }, 
                {
                    field: "is_highlights_category",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: true, text: "Có" },
                        { value: false, text: "Không" }
                    ],
                }, 
                {
                    field: "allow_comment",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: true, text: "Có" },
                        { value: false, text: "Không" }
                    ],
                }, 
                {
                    field: "allow_show_advertisement",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: true, text: "Có" },
                        { value: false, text: "Không" }
                    ],
                }, 
            ]
        },
        tools: [{
                name: "back",
                type: "button",
                buttonClass: "btn-secondary waves-effect width-sm",
                label: "<i class='fas fa-arrow-circle-left'></i> Quay lại",
                command: function(){
                    this.close();
                }
            },
            
        ],
        loadcss:function(url) {
        	if (!$("link[href='"+url+"']").length){
        		var link = document.createElement("link");
                link.type = "text/css";
                link.rel = "stylesheet";
                link.href = url;
                document.getElementsByTagName("head")[0].appendChild(link);
        	}
            
        },
        render: function() {
            var self = this;
            self.loadcss(self.getApp().staticURL + "css/styles_post.css")
            var screen_width = $(window).width();
            if (screen_width < 500) {
                self.$el.find("#custom_editor").addClass("d-none");
                self.$el.find(".right-sidenav").addClass("d-none");
                self.$el.find("#closebtn_left").unbind("click").bind("click", function() {
                    self.$el.find("#closebtn_left").addClass("d-none");
                    self.$el.find("#left_nav").removeClass("d-none");
                    self.$el.find(".left-sidenav").width("12%");
                    self.$el.find("#content_left").addClass("d-none");
                    self.$el.find("#custom_editor").removeClass("d-none");
                    self.$el.find(".right-sidenav").removeClass("d-none");
                    self.$el.find(".right-sidenav").width("12%");
                    self.$el.find("#right_side_ext").addClass("d-none");
                });
                self.$el.find("#left_nav").unbind("click").bind("click", function() {
                    self.$el.find(".left-sidenav").width("100%");
                    self.$el.find("#custom_editor").addClass("d-none");
                    self.$el.find(".right-sidenav").addClass("d-none");
                    self.$el.find("#closebtn_left").removeClass("d-none");
                    self.$el.find("#left_nav").addClass("d-none");
                    self.$el.find("#content_left").removeClass("d-none");
                });
                self.$el.find("#right_nav").unbind("click").bind("click", function() {
                    var right_nav_width = self.$el.find(".right-sidenav").width();
                    if (right_nav_width < "60") {
                        self.$el.find("#right_side_ext").removeClass("d-none");
                        self.$el.find(".right-sidenav").width("93%");
                        self.$el.find("#custom_editor").addClass("d-none");
                        self.$el.find(".left-sidenav").addClass("d-none");
                    }
                    else {
                        self.$el.find("#right_side_ext").addClass("d-none");
                        self.$el.find(".right-sidenav").width("12%");
                        self.$el.find("#custom_editor").removeClass("d-none");
                        self.$el.find(".left-sidenav").removeClass("d-none");
                    }
                });
                self.$el.find(".closebtn-right").unbind("click").bind("click", function() {
                    //chinhnv_review: chuyển thành self.$el.find
                    self.$el.find("#right_side_ext").addClass("d-none");
                    self.$el.find(".right-sidenav").width("12%");
                    self.$el.find("#custom_editor").removeClass("d-none");
                    self.$el.find(".left-sidenav").removeClass("d-none");
                });
            }
            else {
                self.$el.find("#left_nav").unbind("click").bind("click", function() {
                    self.$el.find(".left-sidenav").width("420px");
                    if (screen_width < 1600 && screen_width >= 1370){
                        self.$el.find(".left-sidenav").width("340px");
                    }
                    else if (screen_width < 1370){
                        self.$el.find(".left-sidenav").width("275px");
                        self.$el.find("#custom_editor").width("640px");
                    }
                    self.$el.find("#closebtn_left").removeClass("d-none");
                    self.$el.find("#left_nav").addClass("d-none");
                    self.$el.find("#content_left").removeClass("d-none");
                });
                self.$el.find("#closebtn_left").unbind("click").bind("click", function() {
                    self.$el.find("#closebtn_left").addClass("d-none");
                    self.$el.find("#left_nav").removeClass("d-none");
                    self.$el.find(".left-sidenav").width("60px");
                    self.$el.find("#content_left").addClass("d-none");
                });
            
                self.$el.find("#right_nav").unbind("click").bind("click", function() {
                    var right_nav_width = self.$el.find(".right-sidenav").width();
                    if (right_nav_width == "60") {
                        self.$el.find("#right_side_ext").removeClass("d-none");
                        self.$el.find(".right-sidenav").width("420px");
                        if (screen_width < 1600 && screen_width >= 1370){
                            self.$el.find(".right-sidenav").width("340px");
                        }
                        else if (screen_width < 1370){
                            self.$el.find(".right-sidenav").width("275px");
                            self.$el.find("#right_side_ext").width("240px");
                            self.$el.find("#right_side").width("45px");
                            self.$el.find("#custom_editor").width("640px");
                        }
                    }
                    else {
                        self.$el.find("#right_side_ext").addClass("d-none");
                        self.$el.find(".right-sidenav").width("60px");
                    }
                });
                self.$el.find(".closebtn-right").unbind("click").bind("click", function() {
                    self.$el.find("#right_side_ext").addClass("d-none");
                    self.$el.find(".right-sidenav").width("60px");
                });
            }
            
            self.$el.find("#tinymce_editor").attr({"id":"mce-readyonly"});
            
            self.$el.find(".input-group-addon-custom").click(function(e){
                // Have to stop propagation here
                e.stopPropagation();
                self.$el.find(".clockpicker").clockpicker('show').clockpicker('toggleView', 'hours');
            });

            self.$el.find("#title_info").unbind("click").bind("click", function() {
                self.$el.find("#content_info").toggleClass("d-none");
            });

            self.$el.find("#title_setting").unbind("click").bind("click", function() {
                self.$el.find("#content_setting").toggleClass("d-none");
            });
            
            self.$el.find("#title_seo").unbind("click").bind("click", function() {
                self.$el.find("#content_seo").toggleClass("d-none");
            });
            
            var currentUser = self.getApp().currentUser;

            if (!!currentUser) {
                var view_id = self.viewData.id;
                var post_id = self.viewData.post_id;
                if (!!view_id && !!post_id){
                    $.ajax({
                        url: (self.getApp().serviceURL || "") + '/api/v1/get_detail_history_post?id=' + view_id+"&post_id="+post_id,
                        method: 'GET',
                        dataType: "json",
                        contentType: "application/json",
                        success: function(data, res) {
                            self.model.set(data.data.data);
                            self.initEditor();
                            self.applyBindings();
                            $(".modal-custom-n .modal-dialog").addClass("m-0");
                            var hour_time = self.model.get("hour_time");
                            if (hour_time) {
                                self.$el.find("#hour_time").val(hour_time);
                            }
                            self.previewSeoGoogle();
                            var title = self.model.get("title");
                            //chinhnv_review: chuyển thành self.$el.find
                            self.$el.find("#title").val(title);
                            var description = self.model.get("description");
                            self.$el.find("#description").val(description);
                            
                            var title_google = self.model.get("title_google");
                            self.$el.find("#title_google").val(title_google);
                            
                            var description_google = self.model.get("description_google");
                            self.$el.find("#description_google").val(description_google);
                            
                            self.eventKeyup();
                            self.renderRelatedNews();
                            
                            $(".clockpicker").clockpicker();
                            self.selectizeTags();
                            self.selectizeTagsSearch();
                            self.render_avatar(self.model.get("image_thumbnail"), "image_thumbnail");
                            self.selectizeCategory();
                            self.selectizeRelatedCategory();
                            self.selectizeAgeGroup();
                            
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
                                self.getApp().notify({ message: "Lỗi truy cập dữ liệu, vui lòng thử lại sau" }, { type: "danger", delay: 1000 });
                            }
                        },
                    });


                    
                }
                
            }
        },
        selectizeTags: function() {
            var self = this;
            self.$el.find("#selectize-tags").val(self.model.get("tags"));

            self.$el.find('#selectize-tags').selectize({
                delimiter: ",",
                plugins: ['remove_button'],
                persist: true,
                createOnBlur: true,
                create: true,
                onChange: function(value) {
                    self.model.set("tags", value);
                },
            });
        },
        selectizeTagsSearch: function() {
            var self = this;
            self.$el.find("#selectize-tags-search").val(self.model.get("tags_display"));

            self.$el.find('#selectize-tags-search').selectize({
                delimiter: ",",
                plugins: ['remove_button'],
                persist: true,
                createOnBlur: true,
                create: true,
                onChange: function(value) {
                    self.model.set("tags_display", value);
                },
            });
        },
        view_file_attach: function(file, class_file) {
            var self = this;
            var name = file.name,
                id = file.id,
                type = file.type;
            var url_file = gonrinApp().check_image(file),
                viewfile = self.$el.find("#" + class_file);
            var file_type = file.type;
            if (!!file.type && (file_type.toLowerCase().includes("jpeg") || file_type.toLowerCase().includes("jpg") || file_type.toLowerCase().includes("png"))) {
                viewfile.empty();
                viewfile.append(`<div id="img_` + id + `" class="img" style="margin-left: 10px !important;">
                    <img class="img-cus view_image_` + id + `" src="` + url_file + `" id="` + id + `" style="width:70px; height:68px;">
                    <div class="text-center">
                        <span class="text-danger btn_dlt_` + id + ` ml-1" style="cursor: pointer;"><b>Xoá</b></span>
                    </div>
                </div>`);
                self.$el.find("." + file.id).unbind("click").bind("click", { obj: { "url": url_file, "class_file": class_file } }, function(e) {
                    var object = e.data.obj;
                    var img = document.createElement('img');
                    img.src = object.url;
                    img.onload = function(e) {
                        gonrinApp().openPhotoSwipe(0, $("#" + object.class_file));
                    };
                    img.onerror = function(e) {};
                });
                self.$el.find(".btn_dlt_" + id).unbind("click").bind("click",{obj:id}, function(e) {
                    var id_data = e.data.obj;
                    var file = self.model.get(class_file);
                    if (file) {
                        self.$el.find("#img_" + id_data).remove();
                        self.getApp().notify("Xóa ảnh " + file.name + file.type + " thành công!");
                        self.model.set(class_file, null);
                    }
                });
            }
        },
        render_avatar: function(file, id_avatar) {
            var self = this;
            var url_file = gonrinApp().check_image(file)
            self.$el.find('#' + id_avatar).css('background-image', 'url(' + url_file + ')');
        },
        initEditor: function() {
            var self = this;
            tinymce.remove('textarea#mce-readyonly');
            tinymce.init({
                selector: 'textarea#mce-readyonly',
                // document_base_url: url_service,
                relative_urls : false,
                remove_script_host : false,
                convert_urls : true,
                content_css: [
                    "static/css/font.css",
                    "static/vendor/tinymce/tinymce_custom.css"
                ],
                // plugins: 'contextmenu example print preview paste importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern noneditable help charmap emoticons fullpage',
                plugins: 'preview paste importcss searchreplace autolink autosave save code fullscreen link media table hr lists wordcount quickbars',
                // plugins: 'preview paste importcss searchreplace autolink autosave save code visualchars fullscreen image link media table hr lists wordcount imagetools template',
                // imagetools_cors_hosts: ['picsum.photos'],
                menubar:false,
                // menubar: 'file edit view insert format tools table help',
                // toolbar: 'undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media template link anchor codesample | ltr rtl',
                toolbar: 'save | box_related_news | related_one_news | quote | box_highlight | image_custom | media | link | fullscreen | preview | hr | numlist | bullist',
                toolbar_sticky: true,
                save_onsavecallback: function () { console.log('Saved'); },
                autosave_ask_before_unload: false,
                autosave_interval: "1s",
                autosave_prefix: "{path}{query}-{id}-",
                autosave_restore_when_empty: false,
                autosave_retention: "2m",
                importcss_append: true,
                automatic_uploads: true,
                font_formats: `Arial=Arial; 
                                Arialbd=Arialbd; 
                                Arialbi=Arialbi; 
                                Ariali=Ariali; 
                                Arialn=Arialn; 
                                Arialnb=Arialnb; 
                                Arialnbi=Arialnbi; 
                                Arialni=Arialni; 
                                Baloo2 Bold=Baloo2-Bold; 
                                Baloo2 ExtraBold=Baloo2-ExtraBold; 
                                Baloo2 Medium=Baloo2-Medium; 
                                Baloo2 Regular=Baloo2-Regular; 
                                Baloo2 SemiBold=Baloo2-SemiBold; 
                                BalooBhaijaan2 VariableFont=BalooBhaijaan2-VariableFont_wght; 
                                BarlowSemiCondensed Black=BarlowSemiCondensed-Black; 
                                BarlowSemiCondensed BlackItalic=BarlowSemiCondensed-BlackItalic; 
                                BarlowSemiCondensed Bold=BarlowSemiCondensed-Bold; 
                                BarlowSemiCondensed BoldItalic=BarlowSemiCondensed-BoldItalic; 
                                BarlowSemiCondensed ExtraBold=BarlowSemiCondensed-ExtraBold; 
                                BarlowSemiCondensed ExtraBoldItalic=BarlowSemiCondensed-ExtraBoldItalic; 
                                BarlowSemiCondensed ExtraLight=BarlowSemiCondensed-ExtraLight; 
                                BarlowSemiCondensed ExtraLightItalic=BarlowSemiCondensed-ExtraLightItalic; 
                                BarlowSemiCondensed Italic=BarlowSemiCondensed-Italic; 
                                BarlowSemiCondensed Light=BarlowSemiCondensed-Light; 
                                BarlowSemiCondensed LightItalic=BarlowSemiCondensed-LightItalic; 
                                BarlowSemiCondensed Medium=BarlowSemiCondensed-Medium; 
                                BarlowSemiCondensed MediumItalic=BarlowSemiCondensed-MediumItalic; 
                                BarlowSemiCondensed Regular=BarlowSemiCondensed-Regular; 
                                BarlowSemiCondensed SemiBold=BarlowSemiCondensed-SemiBold; 
                                BarlowSemiCondensed SemiBoldItalic=BarlowSemiCondensed-SemiBoldItalic; 
                                BarlowSemiCondensed BlackItalic=BarlowSemiCondensed-BlackItalic; 
                                BarlowSemiCondensed Thin=BarlowSemiCondensed-Thin; 
                                BarlowSemiCondensed ThinItalic=BarlowSemiCondensed-ThinItalic;
                                HelveticaNeue Bold=Helvetica-Neue-Bold;
                                HelveticaNeue Bold Italic=Helvetica-Neue-Bold-Italic;
                                HelveticaNeue Italic=Helvetica-Neue-Italic;
                                Lato Regular=Lato-Regular;
                                NotoSerif Bold=NotoSerif-Bold;
                                NotoSerif BoldItalic=NotoSerif-BoldItalic;
                                NotoSerif Italic=NotoSerif-Italic;
                                NotoSerif Regular=NotoSerif-Regular;
                                NunitoSans Black=NunitoSans-Black; 
                                NunitoSans BlackItalic=NunitoSans-BlackItalic; 
                                NunitoSans Bold=NunitoSans-Bold; 
                                NunitoSans BoldItalic=NunitoSans-BoldItalic; 
                                NunitoSans ExtraBold=NunitoSans-ExtraBold; 
                                NunitoSans ExtraBoldItalic=NunitoSans-ExtraBoldItalic; 
                                NunitoSans ExtraLight=NunitoSans-ExtraLight; 
                                NunitoSans ExtraLightItalic=NunitoSans-ExtraLightItalic; 
                                NunitoSans Italic=NunitoSans-Italic; 
                                NunitoSans Light=NunitoSans-Light; 
                                NunitoSans LightItalic=NunitoSans-LightItalic; 
                                NunitoSans Regular=NunitoSans-Regular;
                                NunitoSans SemiBold=NunitoSans-SemiBold;
                                NunitoSans SemiBoldItalic=NunitoSans-SemiBoldItalic;
                                Roboto Regular=Roboto-Regular;
                                RobotoCondensed Bold=RobotoCondensed-Bold;
                                Roboto Black=Roboto-Black;
                                RobotoSlab ExtraBold=RobotoSlab-ExtraBold;
                                YesevaOne Regular=YesevaOne-Regular;`,
                fontsize_formats: "8px 9px 10px 11px 12px 13px 14px 15px 16px 17px 18px 19px 20px 22px 24px 26px 28px 30px 32px 34px 36px",
                template_cdate_format: '[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]',
                template_mdate_format: '[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]',
                height: 520,
                quickbars_insert_toolbar: 'image_custom media quote box_related_news related_one_news box_highlight hr',
                quickbars_selection_toolbar: 'fontselect fontsizeselect formatselect bold italic underline forecolor backcolor link searchreplace alignleft aligncenter alignright alignjustify numlist bullist',
                quickbars_image_toolbar: false,  //tắt toolbar căn chỉnh ảnh
                object_resizing : false,  //tắt kéo thả ở góc img thay đổi kích thước img
                noneditable_noneditable_class: "mceNonEditable",
                toolbar_mode: 'sliding',
                //Possible Values: 'floating', 'sliding', 'scrolling', or 'wrap'
                // contextmenu: "link image imagetools | copy paste",
                contextmenu: "link",
                paste_preprocess : function(pl, o) {
                    var str = o.content;
                    // o.content = `<figure class="tinybox block-image">
                    // <div>
                    //     <img src="https://suckhoedoisong.qltns.mediacdn.vn/324455921873985536/2022/2/16/tt-son-1644995316359924675402.jpg" >
                    // </div>
                    // <figcaption class="block-caption">Chú thích</figcaption></figure>`;
                    console.log(str)
                },
                content_style: 'body { font-family: NotoSerif-Regular; font-size:17px }',
                setup:function(editor) { 
                    editor.on('init', function (e) {
                        var content_editor = self.model.get("content");
                        if (content_editor != null && content_editor != "") {
                            editor.setContent(content_editor);
                            $('#tinymce_editor').val(content_editor);
                        }
                        
                    })
                    self.custom_button(editor);
                    
                    // editor.on('keyup', function(e) {
                    //     self.model.set("content", editor.getContent());
                    // });
                    editor.on('click', function(e) {
                        tinymce.dom.DomQuery(".tox-pop").removeClass("d-none");
                    });
                    editor.on('change', function () {
                        tinymce.triggerSave();
                        // chkSubmit();
                    });
                }
            });
        },
        custom_button: function(editor) {
            //Chèn ảnh 
            editor.ui.registry.addButton('image_custom', {
                icon: "image",
                tooltip: 'Chèn ảnh',
                onAction: function () {
                    var model_dialog = new DialogMedia({"viewData": {}});
                    model_dialog.dialog({size:"large"});
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    model_dialog.on("success", function(file) {
                        var url_file = gonrinApp().check_image(file);
                        var html = `<figure class="tinybox block-image">
                                <div>
                                    <img src="`+ url_file +`" id="img_` + file.id + `">
                                </div>
                                <figcaption class="block-caption">Ảnh minh họa</figcaption></figure>`
                        tinymce.dom.DomQuery(".tox-pop").removeClass("d-none");
                        editor.insertContent(html);
                    });
                }
            });
            editor.ui.registry.addButton('img_align_left', {
                icon: 'align-left',
                tooltip: 'Nằm bên trái',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-image');
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    tinymce.DOM.removeClass(el, 'alignCenter');
                    tinymce.DOM.removeClass(el, 'alignRight');
                    tinymce.DOM.addClass(el, 'alignLeft');
                }
            });

            editor.ui.registry.addButton('img_align_right', {
                icon: 'align-right',
                tooltip: 'Nằm bên phải',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-image');
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    tinymce.DOM.removeClass(el, 'alignCenter');
                    tinymce.DOM.removeClass(el, 'alignLeft');
                    tinymce.DOM.addClass(el, 'alignRight');
                }
            });
            editor.ui.registry.addButton('img_align_center', {
                icon: 'align-center',
                tooltip: 'Nằm giữa',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-image');
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    tinymce.DOM.removeClass(el, 'alignRight');
                    tinymce.DOM.removeClass(el, 'alignLeft');
                    tinymce.DOM.addClass(el, 'alignCenter');
                }
            });

            editor.ui.registry.addButton('remove_image', {
                icon: 'remove',
                tooltip: 'Xóa',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-image');
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    el.remove();
                }
            });

            editor.ui.registry.addButton('add_line_top_toolbar_image', {
                icon: 'action-prev',
                tooltip: 'Tạo dòng bên trên',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-image');
                    var p = document.createElement("p");
                    var br = document.createElement("br");
                    br.setAttribute("data-mce-bogus", "1"); 
                    p.appendChild(br);
                    el.before(p);
                }
            });

            editor.ui.registry.addButton('add_line_bottom_toolbar_image', {
                icon: 'action-next',
                tooltip: 'Tạo dòng bên dưới',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-image');
                    var p = document.createElement("p");
                    var br = document.createElement("br");
                    br.setAttribute("data-mce-bogus", "1"); 
                    p.appendChild(br);
                    el.after(p);
                }
            });

            editor.ui.registry.addContextToolbar('toolbar_image', {
                predicate: function (node) {
                    if (node.classList.contains('block-image')) {
                        tinymce.DOM.addClass(node, 'selected');
                        return true;
                    }
                    tinymce.activeEditor.dom.removeClass(tinymce.activeEditor.dom.select('.block-image'), 'selected');
                    return false;
                },
                items: 'img_align_left | img_align_center | img_align_right | add_line_top_toolbar_image | add_line_bottom_toolbar_image | remove_image',
                position: 'node',
                scope: 'node'
            });

            //Trích dẫn
            function chooseTypeQuote(quote_content = "", author_name = "", input_link = "", type = "1", old_content = null, old_author_name = "", old_link = "", old_type = "1") {
                return {
                    title: 'Chọn mẫu hiển thị trích dẫn',
                    body: {
                        type: 'panel',
                        items: [
                            {
                                type: 'selectbox',
                                name: 'choosetype',
                                label: 'Chọn kiểu hiển thị',
                                class: "sss",
                                items: [
                                    { value: "1", text: 'Mẫu 1' },
                                    { value: "2", text: 'Mẫu 2' },
                                    { value: "3", text: 'Mẫu 3' }
                                ]
                            },
                            {
                                type: 'htmlpanel',
                                html: `<div class="preview-content-block">
                                        <div class="blockquote type-` + type + `">
                                            <div class="icon icon-quote"></div>
                                            <div class="content-quote">` + quote_content + `</div>
                                            <div class="footer">
                                                <div class="author">
                                                    <div class="icon-author" style="background-image: url(/static/images_template/logo_bmte.jpg);"></div>
                                                    <p class="author-name">` + author_name + `</p>
                                                </div>
                                                <div class="link-view">
                                                    <p class="link">` + input_link + `</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>`                                  
                            }
                        ]
                    },
                    buttons: [
                        {
                            type: 'custom',
                            name: 'edit',
                            text: 'Sửa',
                            disabled: false
                        },
                        {
                            type: 'custom',
                            name: 'done',
                            text: 'Hoàn tất',
                            primary: true,
                            disabled: false
                        }
                    ],
                    initialData: {
                        choosetype: type
                    },
                    onCancel: () => {
                        if (old_content != null) {
                            if (old_type == "1") {
                                editor.insertContent(`<div class="tinybox block-quote" data-type="` + old_type + `" data-content='` + old_content + `' data-link='` + old_link + `' data-name='` + old_author_name + `'>
                                    <div class="quote-content">` + old_content + `</div>
                                    <div class="quote-author">
                                        <span class="q-avatar"><img src="/static/images_template/logo_bmte.jpg"></span>
                                        <span class="q-name">` + old_author_name + `</span>
                                        <span class="q-link">
                                            <a href="` + old_link + `" target="_blank">` + old_link + `</a>
                                        </span>
                                    </div>
                                </div>`);
                            }
                            else if (old_type == "2") {
                                editor.insertContent(`<div class="tinybox block-quote" data-type="` + old_type + `" data-content='` + old_content + `' data-link='` + old_link + `' data-name='` + old_author_name + `'>
                                    <div class="icon-quote"></div>
                                    <div class="quote-content">` + old_content + `</div>
                                    <div class="quote-author">
                                        <span class="q-avatar"><img src="/static/images_template/logo_bmte.jpg"></span>
                                        <span class="q-name">` + old_author_name + `</span>
                                        <span class="q-link">
                                            <a href="` + old_link + `" target="_blank">` + old_link + `</a>
                                        </span>
                                    </div>
                                </div>`);
                            }
                            else if (old_type == "3") {
                                editor.insertContent(`<div class="tinybox block-quote" data-type="` + old_type + `" data-content='` + old_content + `' data-link='` + old_link + `' data-name='` + old_author_name + `'>
                                    <div class="quote-author">
                                        <span class="q-avatar"><img src="/static/images_template/logo_bmte.jpg"></span>
                                        <span class="q-name">` + old_author_name + `</span>
                                    </div>
                                    <div class="quote-content">` + old_content + `</div>
                                    <span class="q-link">
                                        <a href="` + old_link + `" target="_blank">` + old_link + `</a>
                                    </span>
                                </div>`);
                            }
                        }
                    },
                    onChange: function (dialogApi, details) {
                        var data = dialogApi.getData();
                        var chooseType = data.choosetype;
                        if (chooseType == "1") {
                            tinymce.dom.DomQuery(".preview-content-block .blockquote").removeClass("type-2").removeClass("type-3").addClass("type-1");
                        }
                        else if (chooseType == "2") {
                            tinymce.dom.DomQuery(".preview-content-block .blockquote").removeClass("type-1").removeClass("type-3").addClass("type-2");
                        }
                        else if (chooseType == "3") {
                            tinymce.dom.DomQuery(".preview-content-block .blockquote").removeClass("type-1").removeClass("type-2").addClass("type-3");
                        }
                    },
                    onAction: function (dialogApi, details) {
                        var data = dialogApi.getData();
                        var chooseType = data.choosetype;
                        if (details.name === 'edit') {
                            editor.windowManager.open(dialogEditQuote(quote_content, author_name, input_link, chooseType, old_content, old_author_name, old_link, old_type));
                            tinymce.dom.DomQuery(".tox-dialog").addClass("dialog-edit");
                        } 
                        else if (details.name === 'done') {
                            if (chooseType == "1") {
                                editor.insertContent(`<div class="tinybox block-quote" data-type="` + chooseType + `" data-content='` + quote_content + `' data-link='` + input_link + `' data-name='` + author_name + `'>
                                    <div class="quote-content">` + quote_content + `</div>
                                    <div class="quote-author">
                                        <span class="q-avatar"><img src="/static/images_template/logo_bmte.jpg"></span>
                                        <span class="q-name">` + author_name + `</span>
                                        <span class="q-link">
                                            <a href="` + input_link + `" target="_blank">` + input_link + `</a>
                                        </span>
                                    </div>
                                </div>`);
                            }
                            else if (chooseType == "2") {
                                editor.insertContent(`<div class="tinybox block-quote" data-type="` + chooseType + `" data-content='` + quote_content + `' data-link='` + input_link + `' data-name='` + author_name + `'>
                                    <div class="icon-quote"></div>
                                    <div class="quote-content">` + quote_content + `</div>
                                    <div class="quote-author">
                                        <span class="q-avatar"><img src="/static/images_template/logo_bmte.jpg"></span>
                                        <span class="q-name">` + author_name + `</span>
                                        <span class="q-link">
                                            <a href="` + input_link + `" target="_blank">` + input_link + `</a>
                                        </span>
                                    </div>
                                </div>`);
                            }
                            else if (chooseType == "3") {
                                editor.insertContent(`<div class="tinybox block-quote" data-type="` + chooseType + `" data-content='` + quote_content + `' data-link='` + input_link + `' data-name='` + author_name + `'>
                                    <div class="quote-author">
                                        <span class="q-avatar"><img src="/static/images_template/logo_bmte.jpg"></span>
                                        <span class="q-name">` + author_name + `</span>
                                    </div>
                                    <div class="quote-content">` + quote_content + `</div>
                                    <span class="q-link">
                                        <a href="` + input_link + `" target="_blank">` + input_link + `</a>
                                    </span>
                                </div>`);
                            }
                        }
                        
                        dialogApi.close();
                    }
                };
            }

            function dialogEditQuote(quote_content = "", author_name = "", input_link = "", type = "1", old_content = null, old_author_name = "", old_link = "", old_type = "1")
            {
                return {
                    title: 'Trích dẫn',
                    body: {
                        type: 'panel',
                        items: [
                            {
                                type: 'textarea',
                                name: 'quote_content'
                            },
                            {
                                type: 'input',
                                name: 'author_name',
                                label: 'Thương hiệu, tác giả'
                            },
                            {
                                type: 'input',
                                name: 'input_link',
                                label: 'Link đính kèm'
                            }
                        ]
                    },
                    initialData: {
                        quote_content: quote_content,
                        author_name: author_name,
                        input_link: input_link
                    },
                    buttons: [
                        {
                            text: 'Đóng',
                            type: 'custom',
                            name: 'close',
                            disabled: false
                        },
                        {
                            type: 'custom',
                            name: 'choose',
                            text: 'Chọn mẫu',
                            primary: true,
                            disabled: false
                        }
                    ],
                    onCancel: () => {
                        if (old_content != null) {
                            if (old_type == "1") {
                                editor.insertContent(`<div class="tinybox block-quote" data-type="` + old_type + `" data-content='` + old_content + `' data-link='` + old_link + `' data-name='` + old_author_name + `'>
                                    <div class="quote-content">` + old_content + `</div>
                                    <div class="quote-author">
                                        <span class="q-avatar"><img src="/static/images_template/logo_bmte.jpg"></span>
                                        <span class="q-name">` + old_author_name + `</span>
                                        <span class="q-link">
                                            <a href="` + old_link + `" target="_blank">` + old_link + `</a>
                                        </span>
                                    </div>
                                </div>`);
                            }
                            else if (old_type == "2") {
                                editor.insertContent(`<div class="tinybox block-quote" data-type="` + old_type + `" data-content='` + old_content + `' data-link='` + old_link + `' data-name='` + old_author_name + `'>
                                    <div class="icon-quote"></div>
                                    <div class="quote-content">` + old_content + `</div>
                                    <div class="quote-author">
                                        <span class="q-avatar"><img src="/static/images_template/logo_bmte.jpg"></span>
                                        <span class="q-name">` + old_author_name + `</span>
                                        <span class="q-link">
                                            <a href="` + old_link + `" target="_blank">` + old_link + `</a>
                                        </span>
                                    </div>
                                </div>`);
                            }
                            else if (old_type == "3") {
                                editor.insertContent(`<div class="tinybox block-quote" data-type="` + old_type + `" data-content='` + old_content + `' data-link='` + old_link + `' data-name='` + old_author_name + `'>
                                    <div class="quote-author">
                                        <span class="q-avatar"><img src="/static/images_template/logo_bmte.jpg"></span>
                                        <span class="q-name">` + old_author_name + `</span>
                                    </div>
                                    <div class="quote-content">` + old_content + `</div>
                                    <span class="q-link">
                                        <a href="` + old_link + `" target="_blank">` + old_link + `</a>
                                    </span>
                                </div>`);
                            }
                        }
                    },
                    onChange: function (dialogApi, details) {
                        var data = dialogApi.getData();
                        var toggle = data.highlight_content != "" ? dialogApi.enable : dialogApi.disable;
                        toggle('choose');
                    },
                    onAction: function (api, details) {
                        if (details.name == "close") {
                            if (old_content != null) {
                                if (old_type == "1") {
                                    editor.insertContent(`<div class="tinybox block-quote" data-type="` + old_type + `" data-content='` + old_content + `' data-link='` + old_link + `' data-name='` + old_author_name + `'>
                                        <div class="quote-content">` + old_content + `</div>
                                        <div class="quote-author">
                                            <span class="q-avatar"><img src="/static/images_template/logo_bmte.jpg"></span>
                                            <span class="q-name">` + old_author_name + `</span>
                                            <span class="q-link">
                                                <a href="` + old_link + `" target="_blank">` + old_link + `</a>
                                            </span>
                                        </div>
                                    </div>`);
                                }
                                else if (old_type == "2") {
                                    editor.insertContent(`<div class="tinybox block-quote" data-type="` + old_type + `" data-content="` + old_content + `" data-link="` + old_link + `" data-name="` + old_author_name + `">
                                        <div class="icon-quote"></div>
                                        <div class="quote-content">` + old_content + `</div>
                                        <div class="quote-author">
                                            <span class="q-avatar"><img src="/static/images_template/logo_bmte.jpg"></span>
                                            <span class="q-name">` + old_author_name + `</span>
                                            <span class="q-link">
                                                <a href="` + old_link + `" target="_blank">` + old_link + `</a>
                                            </span>
                                        </div>
                                    </div>`);
                                }
                                else if (old_type == "3") {
                                    editor.insertContent(`<div class="tinybox block-quote" data-type="` + old_type + `" data-content='` + old_content + `' data-link='` + old_link + `' data-name='` + old_author_name + `'>
                                        <div class="quote-author">
                                            <span class="q-avatar"><img src="/static/images_template/logo_bmte.jpg"></span>
                                            <span class="q-name">` + old_author_name + `</span>
                                        </div>
                                        <div class="quote-content">` + old_content + `</div>
                                        <span class="q-link">
                                            <a href="` + old_link + `" target="_blank">` + old_link + `</a>
                                        </span>
                                    </div>`);
                                }
                            }
                            api.close();
                        }
                        else if (details.name == "choose") {
                            var data = api.getData();
                            var quote_content = data.quote_content;
                            if (quote_content == "") {
                                alert("Vui lòng nhập nội dung trích dẫn!");
                            }
                            else {
                                var input_link = data.input_link;
                                var author_name = data.author_name;
                                api.close();
                                editor.windowManager.open(chooseTypeQuote(quote_content, author_name, input_link, type, old_content, old_author_name, old_link, old_type));
                                tinymce.dom.DomQuery(".tox-dialog").addClass("dialog-choose-type");
                            }
                            
                        }
                    }
                };
            }

            editor.ui.registry.addButton('quote', {
                icon: "quote",
                tooltip: 'Chèn trích dẫn',
                onAction: function () {
                    editor.windowManager.open(dialogEditQuote());
                    tinymce.dom.DomQuery(".tox-dialog").addClass("dialog-edit");
                }
            });

            editor.ui.registry.addButton('quote_edit', {
                icon: 'edit-block',
                tooltip: 'Chỉnh sửa',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-quote');
                    var quote_content = el.getAttribute("data-content"),
                        author_name = el.getAttribute("data-name"),
                        input_link = el.getAttribute("data-link"),
                        type = el.getAttribute("data-type");
                    el.remove();
                    editor.windowManager.open(dialogEditQuote(quote_content, author_name, input_link, type, quote_content, author_name, input_link, type));
                    tinymce.dom.DomQuery(".tox-dialog").addClass("dialog-edit");
                }
            });

            function configQuote(quote_content = "", author_name = "", input_link = "", type = "1", old_content = null, old_author_name = "", old_link = "", old_type = "1") {
                return {
                    title: 'Chọn mẫu hiển thị trích dẫn',
                    body: {
                        type: 'panel',
                        items: [
                            {
                                type: 'selectbox',
                                name: 'choosetype',
                                label: 'Chọn kiểu hiển thị',
                                class: "sss",
                                items: [
                                    { value: "1", text: 'Mẫu 1' },
                                    { value: "2", text: 'Mẫu 2' },
                                    { value: "3", text: 'Mẫu 3' }
                                ]
                            },
                            {
                                type: 'htmlpanel',
                                html: `<div class="preview-content-block">
                                        <div class="blockquote type-` + type + `">
                                            <div class="icon icon-quote"></div>
                                            <div class="content-quote">` + quote_content + `</div>
                                            <div class="footer">
                                                <div class="author">
                                                    <div class="icon-author" style="background-image: url(/static/images_template/logo_bmte.jpg);"></div>
                                                    <p class="author-name">` + author_name + `</p>
                                                </div>
                                                <div class="link-view">
                                                    <p class="link">` + input_link + `</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>`                                  
                            }
                        ]
                    },
                    buttons: [
                        {
                            text: 'Đóng',
                            type: 'custom',
                            name: 'close',
                            disabled: false
                        },
                        {
                            type: 'custom',
                            name: 'done',
                            text: 'Hoàn tất',
                            primary: true,
                            disabled: false
                        }
                    ],
                    initialData: {
                        choosetype: type
                    },
                    onCancel: () => {
                        if (old_content != null) {
                            if (old_type == "1") {
                                editor.insertContent(`<div class="tinybox block-quote" data-type="` + old_type + `" data-content='` + old_content + `' data-link='` + old_link + `' data-name='` + old_author_name + `'>
                                    <div class="quote-content">` + old_content + `</div>
                                    <div class="quote-author">
                                        <span class="q-avatar"><img src="/static/images_template/logo_bmte.jpg"></span>
                                        <span class="q-name">` + old_author_name + `</span>
                                        <span class="q-link">
                                            <a href="` + old_link + `" target="_blank">` + old_link + `</a>
                                        </span>
                                    </div>
                                </div>`);
                            }
                            else if (old_type == "2") {
                                editor.insertContent(`<div class="tinybox block-quote" data-type="` + old_type + `" data-content='` + old_content + `' data-link='` + old_link + `" data-name='` + old_author_name + `'>
                                    <div class="icon-quote"></div>
                                    <div class="quote-content">` + old_content + `</div>
                                    <div class="quote-author">
                                        <span class="q-avatar"><img src="/static/images_template/logo_bmte.jpg"></span>
                                        <span class="q-name">` + old_author_name + `</span>
                                        <span class="q-link">
                                            <a href="` + old_link + `" target="_blank">` + old_link + `</a>
                                        </span>
                                    </div>
                                </div>`);
                            }
                            else if (old_type == "3") {
                                editor.insertContent(`<div class="tinybox block-quote" data-type="` + old_type + `" data-content='` + old_content + `' data-link='` + old_link + `' data-name='` + old_author_name + `'>
                                    <div class="quote-author">
                                        <span class="q-avatar"><img src="/static/images_template/logo_bmte.jpg"></span>
                                        <span class="q-name">` + old_author_name + `</span>
                                    </div>
                                    <div class="quote-content">` + old_content + `</div>
                                    <span class="q-link">
                                        <a href="` + old_link + `" target="_blank">` + old_link + `</a>
                                    </span>
                                </div>`);
                            }
                        }
                    },
                    onChange: function (dialogApi, details) {
                        var data = dialogApi.getData();
                        var chooseType = data.choosetype;
                        if (chooseType == "1") {
                            tinymce.dom.DomQuery(".preview-content-block .blockquote").removeClass("type-2").removeClass("type-3").addClass("type-1");
                        }
                        else if (chooseType == "2") {
                            tinymce.dom.DomQuery(".preview-content-block .blockquote").removeClass("type-1").removeClass("type-3").addClass("type-2");
                        }
                        else if (chooseType == "3") {
                            tinymce.dom.DomQuery(".preview-content-block .blockquote").removeClass("type-1").removeClass("type-2").addClass("type-3");
                        }
                    },
                    onAction: function (dialogApi, details) {
                        var data = dialogApi.getData();
                        var chooseType = data.choosetype;
                        if (details.name === 'close') {
                            if (old_content != null) {
                                if (old_type == "1") {
                                    editor.insertContent(`<div class="tinybox block-quote" data-type="` + old_type + `" data-content='` + old_content + `' data-link='` + old_link + `' data-name='` + old_author_name + `'>
                                        <div class="quote-content">` + old_content + `</div>
                                        <div class="quote-author">
                                            <span class="q-avatar"><img src="/static/images_template/logo_bmte.jpg"></span>
                                            <span class="q-name">` + old_author_name + `</span>
                                            <span class="q-link">
                                                <a href="` + old_link + `" target="_blank">` + old_link + `</a>
                                            </span>
                                        </div>
                                    </div>`);
                                }
                                else if (old_type == "2") {
                                    editor.insertContent(`<div class="tinybox block-quote" data-type="` + old_type + `" data-content='` + old_content + `' data-link='` + old_link + `' data-name='` + old_author_name + `'>
                                        <div class="icon-quote"></div>
                                        <div class="quote-content">` + old_content + `</div>
                                        <div class="quote-author">
                                            <span class="q-avatar"><img src="/static/images_template/logo_bmte.jpg"></span>
                                            <span class="q-name">` + old_author_name + `</span>
                                            <span class="q-link">
                                                <a href="` + old_link + `" target="_blank">` + old_link + `</a>
                                            </span>
                                        </div>
                                    </div>`);
                                }
                                else if (old_type == "3") {
                                    editor.insertContent(`<div class="tinybox block-quote" data-type="` + old_type + `" data-content='` + old_content + `' data-link='` + old_link + `' data-name='` + old_author_name + `'>
                                        <div class="quote-author">
                                            <span class="q-avatar"><img src="/static/images_template/logo_bmte.jpg"></span>
                                            <span class="q-name">` + old_author_name + `</span>
                                        </div>
                                        <div class="quote-content">` + old_content + `</div>
                                        <span class="q-link">
                                            <a href="` + old_link + `" target="_blank">` + old_link + `</a>
                                        </span>
                                    </div>`);
                                }
                            }
                        } 
                        else if (details.name === 'done') {
                            if (chooseType == "1") {
                                editor.insertContent(`<div class="tinybox block-quote" data-type="` + chooseType + `" data-content='` + quote_content + `' data-link='` + input_link + `' data-name='` + author_name + `'>
                                    <div class="quote-content">` + quote_content + `</div>
                                    <div class="quote-author">
                                        <span class="q-avatar"><img src="/static/images_template/logo_bmte.jpg"></span>
                                        <span class="q-name">` + author_name + `</span>
                                        <span class="q-link">
                                            <a href="` + input_link + `" target="_blank">` + input_link + `</a>
                                        </span>
                                    </div>
                                </div>`);
                            }
                            else if (chooseType == "2") {
                                editor.insertContent(`<div class="tinybox block-quote" data-type="` + chooseType + `" data-content='` + quote_content + `' data-link='` + input_link + `' data-name='` + author_name + `'>
                                    <div class="icon-quote"></div>
                                    <div class="quote-content">` + quote_content + `</div>
                                    <div class="quote-author">
                                        <span class="q-avatar"><img src="/static/images_template/logo_bmte.jpg"></span>
                                        <span class="q-name">` + author_name + `</span>
                                        <span class="q-link">
                                            <a href="` + input_link + `" target="_blank">` + input_link + `</a>
                                        </span>
                                    </div>
                                </div>`);
                            }
                            else if (chooseType == "3") {
                                editor.insertContent(`<div class="tinybox block-quote" data-type="` + chooseType + `" data-content='` + quote_content + `' data-link='` + input_link + `' data-name='` + author_name + `'>
                                    <div class="quote-author">
                                        <span class="q-avatar"><img src="/static/images_template/logo_bmte.jpg"></span>
                                        <span class="q-name">` + author_name + `</span>
                                    </div>
                                    <div class="quote-content">` + quote_content + `</div>
                                    <span class="q-link">
                                        <a href="` + input_link + `" target="_blank">` + input_link + `</a>
                                    </span>
                                </div>`);
                            }
                        }
                        
                        dialogApi.close();
                    }
                };
            }
            editor.ui.registry.addButton('quote_config', {
                icon: 'settings',
                tooltip: 'Cấu hình',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-quote');
                    var quote_content = el.getAttribute("data-content"),
                        author_name = el.getAttribute("data-name"),
                        input_link = el.getAttribute("data-link"),
                        type = el.getAttribute("data-type");
                    el.remove();
                    editor.windowManager.open(configQuote(quote_content, author_name, input_link, type, quote_content, author_name, input_link, type));
                    tinymce.dom.DomQuery(".tox-dialog").addClass("dialog-choose-type");
                }
            });

            editor.ui.registry.addButton('remove_quote', {
                icon: 'remove',
                tooltip: 'Xóa',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-quote');
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    el.remove();
                }
            });

            editor.ui.registry.addButton('add_line_top_toolbar_quote', {
                icon: 'action-prev',
                tooltip: 'Tạo dòng bên trên',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-quote');
                    var p = document.createElement("p");
                    var br = document.createElement("br");
                    br.setAttribute("data-mce-bogus", "1"); 
                    p.appendChild(br);
                    el.before(p);
                }
            });

            editor.ui.registry.addButton('add_line_bottom_toolbar_quote', {
                icon: 'action-next',
                tooltip: 'Tạo dòng bên dưới',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.block-quote');
                    var p = document.createElement("p");
                    var br = document.createElement("br");
                    br.setAttribute("data-mce-bogus", "1"); 
                    p.appendChild(br);
                    el.after(p);
                }
            });

            editor.ui.registry.addContextToolbar('toolbar_quote', {
                predicate: function (node) {
                    if (node.classList.contains('block-quote')) {
                        tinymce.DOM.addClass(node, 'selected');
                        return true;
                    }
                    tinymce.activeEditor.dom.removeClass(tinymce.activeEditor.dom.select('.block-quote'), 'selected');
                    return false;
                },
                items: 'quote_edit | quote_config | add_line_top_toolbar_quote | add_line_bottom_toolbar_quote | remove_quote',
                position: 'node',
                scope: 'node'
            });

            //Box tin liên quan
            editor.ui.registry.addButton('box_related_news', {
                icon: "unordered-list",
                tooltip: 'Chèn box tin liên quan',
                onAction: function () {
                    var model_dialog = new DialogBoxRelatedNews({"viewData": {"related_news": null, "type": "1"}});
                    model_dialog.dialog({size:"large"});
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    model_dialog.on("savePost", function(html) {
                        tinymce.dom.DomQuery(".tox-pop").removeClass("d-none");
                        editor.insertContent(html);
                    });
                }
            });

            editor.ui.registry.addButton('box_related_news_left', {
                icon: 'align-left',
                tooltip: 'Nằm bên trái',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.related-news-box');
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    tinymce.DOM.removeClass(el, 'alignRight');
                    tinymce.DOM.addClass(el, 'alignLeft');
                }
            });

            editor.ui.registry.addButton('box_related_news_right', {
                icon: 'align-right',
                tooltip: 'Nằm bên phải',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.related-news-box');
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    tinymce.DOM.removeClass(el, 'alignLeft');
                    tinymce.DOM.addClass(el, 'alignRight');
                }
            });

            editor.ui.registry.addButton('box_related_news_edit', {
                icon: 'edit-block',
                tooltip: 'Chỉnh sửa',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.related-news-box');
                    var el_id = el.getAttribute("id");
                    var type = el.getAttribute("data-type");
                    var list_post = tinymce.activeEditor.dom.select('#' + el_id + ' .list-news li');
                    var related_news = [];
                    if (list_post instanceof Array && list_post.length > 0) {
                        for (var i = 0; i < list_post.length; i++) {
                            var post = {
                                "id": list_post[i].getAttribute("data-id"),
                                "title": list_post[i].getAttribute("data-title"),
                                "path": list_post[i].getAttribute("data-path"),
                                "image_thumbnail_url": list_post[i].getAttribute("data-image_thumbnail_url"),
                                "publish_time": list_post[i].getAttribute("data-publish_time"),
                                "category_name": list_post[i].getAttribute("data-category_name")
                            };
                            related_news.push(post);
                        }
                    }
                    var model_dialog = new DialogBoxRelatedNews({"viewData": {"related_news": related_news, "box_related_news_id": el_id, "type": type}});
                    model_dialog.dialog({size:"large"});
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    model_dialog.on("savePost", function(html) {
                        tinymce.dom.DomQuery(".tox-pop").removeClass("d-none");
                        el.remove();
                        editor.insertContent(html);
                    });
                }
            });

            editor.ui.registry.addButton('box_related_news_config', {
                icon: 'settings',
                tooltip: 'Cấu hình',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.related-news-box');
                    var el_id = el.getAttribute("id");
                    var type = el.getAttribute("data-type");
                    var list_post = tinymce.activeEditor.dom.select('#' + el_id + ' .list-news li');
                    var related_news = [];
                    if (list_post instanceof Array && list_post.length > 0) {
                        for (var i = 0; i < list_post.length; i++) {
                            var post = {
                                "id": list_post[i].getAttribute("data-id"),
                                "title": list_post[i].getAttribute("data-title"),
                                "path": list_post[i].getAttribute("data-path"),
                                "image_thumbnail_url": list_post[i].getAttribute("data-image_thumbnail_url"),
                                "publish_time": list_post[i].getAttribute("data-publish_time"),
                                "category_name": list_post[i].getAttribute("data-category_name")
                            };
                            related_news.push(post);
                        }
                    }
                    var model_dialog = new DialogChooseType({"viewData": {"list_post": related_news, "type": type}});
                    model_dialog.dialog({size:"small"});
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    model_dialog.on("chooseType", function(html) {
                        tinymce.dom.DomQuery(".tox-pop").removeClass("d-none");
                        el.remove();
                        editor.insertContent(html);
                    });
                }
            });

            editor.ui.registry.addButton('remove_box_related_news', {
                icon: 'remove',
                tooltip: 'Xóa',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.related-news-box');
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    el.remove();
                }
            });

            editor.ui.registry.addButton('add_line_top_box_related_news', {
                icon: 'action-prev',
                tooltip: 'Tạo dòng bên trên',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.related-news-box');
                    var p = document.createElement("p");
                    var br = document.createElement("br");
                    br.setAttribute("data-mce-bogus", "1"); 
                    p.appendChild(br);
                    el.before(p);
                }
            });

            editor.ui.registry.addButton('add_line_bottom_box_related_news', {
                icon: 'action-next',
                tooltip: 'Tạo dòng bên dưới',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.related-news-box');
                    var p = document.createElement("p");
                    var br = document.createElement("br");
                    br.setAttribute("data-mce-bogus", "1"); 
                    p.appendChild(br);
                    el.after(p);
                }
            });

            editor.ui.registry.addContextToolbar('toolbar_box_related_news', {
                predicate: function (node) {
                    if (node.classList.contains('related-news-box')) {
                        tinymce.DOM.addClass(node, 'selected');
                        return true;
                    }
                    tinymce.activeEditor.dom.removeClass(tinymce.activeEditor.dom.select('.related-news-box'), 'selected');
                    return false;
                },
                items: 'box_related_news_left | box_related_news_right | box_related_news_edit | box_related_news_config | add_line_top_box_related_news | add_line_bottom_box_related_news | remove_box_related_news',
                position: 'node',
                scope: 'node'
            });


            //Chèn 1 tin liên quan
            editor.ui.registry.addButton('related_one_news', {
                icon: "new-document",
                tooltip: 'Chèn 1 tin liên quan',
                onAction: function () {
                    var model_dialog = new DialogRelatedOneNews({"viewData": {"related_one_news": null}});
                    model_dialog.dialog({size:"large"});
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    model_dialog.on("savePost", function(html) {
                        editor.insertContent(html);
                    });
                }
            });

            editor.ui.registry.addButton('related_one_news_edit', {
                icon: 'edit-block',
                tooltip: 'Chỉnh sửa',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.related-one-news');
                    var related_one_news = {
                        "id": el.getAttribute("data-id"),
                        "title": el.getAttribute("data-title"),
                        "description": el.getAttribute("data-description"),
                        "path": el.getAttribute("data-path"),
                        "image_thumbnail_url": el.getAttribute("data-image_thumbnail_url")
                    };
                    var model_dialog = new DialogRelatedOneNews({"viewData": {"related_one_news": related_one_news}});
                    model_dialog.dialog({size:"large"});
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    model_dialog.on("savePost", function(html) {
                        el.remove();
                        editor.insertContent(html);
                    });
                }
            });

            editor.ui.registry.addButton('remove_related_one_news', {
                icon: 'remove',
                tooltip: 'Xóa',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.related-one-news');
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    el.remove();
                }
            });

            editor.ui.registry.addButton('add_line_top_related_one_news', {
                icon: 'action-prev',
                tooltip: 'Tạo dòng bên trên',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.related-one-news');
                    var p = document.createElement("p");
                    var br = document.createElement("br");
                    br.setAttribute("data-mce-bogus", "1"); 
                    p.appendChild(br);
                    el.before(p);
                }
            });

            editor.ui.registry.addButton('add_line_bottom_related_one_news', {
                icon: 'action-next',
                tooltip: 'Tạo dòng bên dưới',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.related-one-news');
                    var p = document.createElement("p");
                    var br = document.createElement("br");
                    br.setAttribute("data-mce-bogus", "1"); 
                    p.appendChild(br);
                    el.after(p);
                }
            });

            editor.ui.registry.addContextToolbar('toolbar_related_one_news', {
                predicate: function (node) {
                    if (node.classList.contains('related-one-news')) {
                        tinymce.DOM.addClass(node, 'selected');
                        return true;
                    }
                    tinymce.activeEditor.dom.removeClass(tinymce.activeEditor.dom.select('.related-one-news'), 'selected');
                    return false;
                },
                items: 'related_one_news_edit | add_line_top_related_one_news | add_line_bottom_related_one_news | remove_related_one_news',
                position: 'node',
                scope: 'node'
            });


            //Box nội dung nổi bật
            function chooseTypeBoxHighlight(highlight_content = "", input_link = "", type = "1", old_content = null, old_link = "", old_type = "1") {
                return {
                    title: 'Chọn mẫu hiển thị nội dung nổi bật',
                    body: {
                        type: 'panel',
                        items: [
                            {
                                type: 'selectbox',
                                name: 'choosetype',
                                label: 'Chọn kiểu hiển thị',
                                class: "sss",
                                items: [
                                    { value: "1", text: 'Mẫu 1' },
                                    { value: "2", text: 'Mẫu 2' }
                                ]
                            },
                            {
                                type: 'htmlpanel',
                                html: `<div class="preview-content-block">
                                        <div class="boxhighlight type-` + type + `">
                                            <div class="boxhighlight-content">` + highlight_content + `</div>
                                            <div class="boxhighlight-link">` + input_link + `</div>
                                        </div>
                                    </div>`                                  
                            }
                        ]
                    },
                    buttons: [
                        {
                            type: 'custom',
                            name: 'edit',
                            text: 'Sửa',
                            disabled: false
                        },
                        {
                            type: 'custom',
                            name: 'done',
                            text: 'Hoàn tất',
                            primary: true,
                            disabled: false
                        }
                    ],
                    initialData: {
                        choosetype: type
                    },
                    onCancel: () => {
                        if (old_content != null) {
                            editor.insertContent(`<div class="tinybox box-highlight" data-type="` + old_type + `" data-content='` + old_content + `' data-link='` + old_link + `'>
                                <div class="boxhighlight-content">` + old_content + `</div>
                                <a href="` + old_link + `" class="boxhighlight-link" target="_blank">` + old_link + `</a> 
                            </div>`);
                        }
                    },
                    onChange: function (dialogApi, details) {
                        var data = dialogApi.getData();
                        var chooseType = data.choosetype;
                        if (chooseType == "1") {
                            tinymce.dom.DomQuery(".preview-content-block .boxhighlight").removeClass("type-2").addClass("type-1");
                        }
                        else if (chooseType == "2") {
                            tinymce.dom.DomQuery(".preview-content-block .boxhighlight").removeClass("type-1").addClass("type-2");
                        }
                    },
                    onAction: function (dialogApi, details) {
                        var data = dialogApi.getData();
                        var chooseType = data.choosetype;
                        if (details.name === 'edit') {
                            editor.windowManager.open(editBoxHighlight(highlight_content, input_link, chooseType, old_content, old_link, old_type));
                            tinymce.dom.DomQuery(".tox-dialog").addClass("dialog-edit");
                        } 
                        else if (details.name === 'done') {
                            editor.insertContent(`<div class="tinybox box-highlight" data-type="` + chooseType + `" data-content='` + highlight_content + `' data-link='` + input_link + `'>
                                <div class="boxhighlight-content">` + highlight_content + `</div>
                                <a href="` + input_link + `" class="boxhighlight-link" target="_blank">` + input_link + `</a> 
                            </div>`);
                        }
                        
                        dialogApi.close();
                    }
                };
            }

            function editBoxHighlight(highlight_content = "", input_link = "", type = "1", old_content = null, old_link = "", old_type = "1")
            {
                return {
                    title: 'Nội dung nổi bật',
                    body: {
                        type: 'panel',
                        items: [
                            {
                                type: 'textarea',
                                name: 'highlight_content',
                            },
                            {
                                type: 'input',
                                name: 'input_link',
                                label: 'Link đính kèm'
                            }
                        ]
                    },
                    initialData: {
                        highlight_content: highlight_content,
                        input_link: input_link
                    },
                    buttons: [
                        {
                            text: 'Đóng',
                            type: 'custom',
                            name: 'close',
                            disabled: false
                        },
                        {
                            type: 'custom',
                            name: 'choose',
                            text: 'Chọn mẫu',
                            primary: true,
                            disabled: false
                        }
                    ],
                    onCancel: () => {
                        if (old_content != null) {
                            editor.insertContent(`<div class="tinybox box-highlight" data-type="` + old_type + `" data-content='` + old_content + `' data-link='` + old_link + `'>
                                <div class="boxhighlight-content">` + old_content + `</div>
                                <a href="` + old_link + `" class="boxhighlight-link" target="_blank">` + old_link + `</a> 
                            </div>`);
                        }
                    },
                    onChange: function (dialogApi, details) {
                        var data = dialogApi.getData();
                        var toggle = data.highlight_content != "" ? dialogApi.enable : dialogApi.disable;
                        toggle('choose');
                    },
                    onAction: function (api, details) {
                        if (details.name == "close") {
                            if (old_content != null) {
                                editor.insertContent(`<div class="tinybox box-highlight" data-type="` + old_type + `" data-content='` + old_content + `' data-link='` + old_link + `'>
                                    <div class="boxhighlight-content">` + old_content + `</div>
                                    <a href="` + old_link + `" class="boxhighlight-link" target="_blank">` + old_link + `</a> 
                                </div>`);
                            }
                            api.close();
                        }
                        else if (details.name == "choose") {
                            var data = api.getData();
                            var highlight_content = data.highlight_content;
                            console.log(highlight_content)
                            if (highlight_content == "") {
                                alert("Vui lòng nhập nội dung nổi bật!");
                            }
                            else {
                                var input_link = data.input_link;
                                api.close();
                                editor.windowManager.open(chooseTypeBoxHighlight(highlight_content, input_link, type, old_content, old_link, old_type));
                                tinymce.dom.DomQuery(".tox-dialog").addClass("dialog-choose-type");
                            }
                            
                        }
                    }
                };
            }

            editor.ui.registry.addButton('box_highlight', {
                icon: "comment",
                tooltip: 'Box nội dung nổi bật',
                onAction: function () {
                    editor.windowManager.open(editBoxHighlight());
                    tinymce.dom.DomQuery(".tox-dialog").addClass("dialog-edit");
                }
            });

            editor.ui.registry.addButton('box_highlight_edit', {
                icon: 'edit-block',
                tooltip: 'Chỉnh sửa',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.box-highlight');
                    var highlight_content = el.getAttribute("data-content"),
                        input_link = el.getAttribute("data-link"),
                        type = el.getAttribute("data-type");
                    el.remove();
                    editor.windowManager.open(editBoxHighlight(highlight_content, input_link, type, highlight_content, input_link, type));
                    tinymce.dom.DomQuery(".tox-dialog").addClass("dialog-edit");
                }
            });


            function configBoxHighlight(highlight_content = "", input_link = "", type = "1", old_content = null, old_link = "", old_type = "1") {
                return {
                    title: 'Chọn mẫu hiển thị nội dung nổi bật',
                    body: {
                        type: 'panel',
                        items: [
                            {
                                type: 'selectbox',
                                name: 'choosetype',
                                label: 'Chọn kiểu hiển thị',
                                class: "sss",
                                items: [
                                    { value: "1", text: 'Mẫu 1' },
                                    { value: "2", text: 'Mẫu 2' }
                                ]
                            },
                            {
                                type: 'htmlpanel',
                                html: `<div class="preview-content-block">
                                        <div class="boxhighlight type-` + type + `">
                                            <div class="boxhighlight-content">` + highlight_content + `</div>
                                            <div class="boxhighlight-link">` + input_link + `</div>
                                        </div>
                                    </div>`                                  
                            }
                        ]
                    },
                    buttons: [
                        {
                            text: 'Đóng',
                            type: 'custom',
                            name: 'close',
                            disabled: false
                        },
                        {
                            type: 'custom',
                            name: 'done',
                            text: 'Hoàn tất',
                            primary: true,
                            disabled: false
                        }
                    ],
                    initialData: {
                        choosetype: type
                    },
                    onCancel: () => {
                        if (old_content != null) {
                            editor.insertContent(`<div class="tinybox box-highlight" data-type="` + old_type + `" data-content='` + old_content + `' data-link='` + old_link + `'>
                                <div class="boxhighlight-content">` + old_content + `</div>
                                <a href="` + old_link + `" class="boxhighlight-link" target="_blank">` + old_link + `</a> 
                            </div>`);
                        }
                    },
                    onChange: function (dialogApi, details) {
                        var data = dialogApi.getData();
                        var chooseType = data.choosetype;
                        if (chooseType == "1") {
                            tinymce.dom.DomQuery(".preview-content-block .boxhighlight").removeClass("type-2").addClass("type-1");
                        }
                        else if (chooseType == "2") {
                            tinymce.dom.DomQuery(".preview-content-block .boxhighlight").removeClass("type-1").addClass("type-2");
                        }
                    },
                    onAction: function (dialogApi, details) {
                        if (details.name == "close") {
                            if (old_content != null) {
                                editor.insertContent(`<div class="tinybox box-highlight" data-type="` + old_type + `" data-content='` + old_content + `' data-link='` + old_link + `'>
                                    <div class="boxhighlight-content">` + old_content + `</div>
                                    <a href="` + old_link + `" class="boxhighlight-link" target="_blank">` + old_link + `</a> 
                                </div>`);
                            }
                        }
                        else if (details.name === 'done') {
                            var data = dialogApi.getData();
                            var chooseType = data.choosetype;
                            editor.insertContent(`<div class="tinybox box-highlight" data-type="` + chooseType + `" data-content='` + highlight_content + `' data-link='` + input_link + `'>
                                <div class="boxhighlight-content">` + highlight_content + `</div>
                                <a href="` + input_link + `" class="boxhighlight-link" target="_blank">` + input_link + `</a> 
                            </div>`);
                        }
                        
                        dialogApi.close();
                    }
                };
            }
            editor.ui.registry.addButton('box_highlight_config', {
                icon: 'settings',
                tooltip: 'Cấu hình',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.box-highlight');
                    var highlight_content = el.getAttribute("data-content"),
                        input_link = el.getAttribute("data-link"),
                        type = el.getAttribute("data-type");
                    el.remove();
                    editor.windowManager.open(configBoxHighlight(highlight_content, input_link, type, highlight_content, input_link, type));
                    tinymce.dom.DomQuery(".tox-dialog").addClass("dialog-choose-type");
                }
            });

            editor.ui.registry.addButton('remove_box_highlight', {
                icon: 'remove',
                tooltip: 'Xóa',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.box-highlight');
                    tinymce.dom.DomQuery(".tox-pop").addClass("d-none");
                    el.remove();
                }
            });

            editor.ui.registry.addButton('add_line_top_box_highlight', {
                icon: 'action-prev',
                tooltip: 'Tạo dòng bên trên',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.box-highlight');
                    var p = document.createElement("p");
                    var br = document.createElement("br");
                    br.setAttribute("data-mce-bogus", "1"); 
                    p.appendChild(br);
                    el.before(p);
                }
            });

            editor.ui.registry.addButton('add_line_bottom_box_highlight', {
                icon: 'action-next',
                tooltip: 'Tạo dòng bên dưới',
                onAction: function () {
                    const node = tinymce.activeEditor.selection.getNode();
                    const el = tinymce.activeEditor.dom.getParent(node, '.box-highlight');
                    var p = document.createElement("p");
                    var br = document.createElement("br");
                    br.setAttribute("data-mce-bogus", "1"); 
                    p.appendChild(br);
                    el.after(p);
                }
            });

            editor.ui.registry.addContextToolbar('toolbar_box_highlight', {
                predicate: function (node) {
                    if (node.classList.contains('box-highlight')) {
                        tinymce.DOM.addClass(node, 'selected');
                        return true;
                    }
                    tinymce.activeEditor.dom.removeClass(tinymce.activeEditor.dom.select('.box-highlight'), 'selected');
                    return false;
                },
                items: 'box_highlight_edit | box_highlight_config | add_line_top_box_highlight | add_line_bottom_box_highlight | remove_box_highlight',
                position: 'node',
                scope: 'node'
            });
        },
        selectizeCategory: function() {
            var self = this;
            var selectize_load_first = true;
            var $selectize = self.$el.find('#category_parent').selectize({
                maxItems: 1,
                // plugins: ["remove_button"],
                valueField: 'id',
                labelField: 'name',
                searchField: ['name', 'unsigned_name'],
                preload: true,
                placeholder: "Chọn chuyên mục",
                
                load: function(query, callback) {
                    var url = (self.getApp().serviceURL || "") + '/api/v1/get-list-category' + (query ? "?text_filter=" + query : "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            var obj = res.objects;
                            callback(obj);
                            
                            if (selectize_load_first) {
                                selectize_load_first = false;
                                var category_id = self.model.get('category_id');
                                if (category_id != "" && category_id != null && category_id != undefined) {
                                    $selectize[0].selectize.setValue(category_id);
                                }
                            }
                        }
                    });
                },
                render: {
                    option: function (item, escape) {
						if (!!item && !!item.cate_parent_id) {
							return '<div class=" px-2 border-bottom">'
                            + '<h5 class="px-3 ">' + item.name + '</h5>'
                            + '</div>';
						}
						else {
                            return '<div class=" px-2 border-bottom">'
                            + '<h5 class="py-0 font-weight-400 ">'  + item.name + '</h5>'
                            + '</div>';
                        }
                    }
                },
                onItemAdd: function(value, $item) {
                    self.model.set({
                        "category_id": value
                    })
                },
                onItemRemove: function(value) {
                    self.model.set({
                        "category_id": null
                    })
                }
            });
        },
        selectizeRelatedCategory: function() {
            var self = this;
            var selectize_load_first = true;
            var $selectize = self.$el.find('#selectize-related_category').selectize({
                plugins: ["remove_button"],
                valueField: 'id',
                labelField: 'name',
                searchField: ['name', 'unsigned_name'],
                preload: true,
                placeholder: "Chọn chuyên mục",
                
                load: function(query, callback) {
                    var url = (self.getApp().serviceURL || "") + '/api/v1/get-list-category' + (query ? "?text_filter=" + query : "");
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            var obj = res.objects;
                            callback(obj);
                            if (selectize_load_first) {
                                selectize_load_first = false;
                                var related_category = self.model.get('related_category');
                                if (related_category instanceof Array && related_category.length > 0) {
                                    $selectize[0].selectize.setValue(related_category);
                                }
                            }
                        }
                    });
                },
                render: {
                    option: function (item, escape) {
						if (!!item && !!item.cate_parent_id) {
							return '<div class=" px-2 border-bottom">'
                            + '<h5 class="px-3 ">' + item.name + '</h5>'
                            + '</div>';
						}
						else {
                            return '<div class=" px-2 border-bottom">'
                            + '<h5 class="py-0 font-weight-400 ">'  + item.name + '</h5>'
                            + '</div>';
                        }
                    }
                },
                onItemAdd: function(value, $item) {
                    self.addRelatedCategory(value);
                },
                onItemRemove: function(value) {
                    self.removeRelatedCategory(value);
                }
            });
        },
        convertToSlug: function(Text) {
            // return Text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');   // return a---b
            return Text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');     // return a-b          
        },
        removeVietnameseTones: function(strdata) {
            if (strdata == null || strdata == undefined || strdata == '') {
                return '';
            }
            var str = strdata.toLowerCase();
            str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
            str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
            str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
            str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
            str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
            str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
            str = str.replace(/đ/g,"d");

            //chinhnv_review: ở trên đã lowercase thì đoạn replace kí tự hoa này k cần thiết 
            // str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
            // str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
            // str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
            // str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
            // str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
            // str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
            // str = str.replace(/Đ/g, "D");
            // Some system encode vietnamese combining accent as individual utf-8 characters
            // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
            str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
            str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
            // Remove extra spaces
            // Bỏ các khoảng trắng liền nhau
            // str = str.replace(/ + /g," ");
            // str = str.trim();
            // Remove punctuations
            // Bỏ dấu câu, kí tự đặc biệt
            str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g," ");
            str = str.trim();
            return str;
        },
        renderRelatedNews: function() {
            var self = this;
            var related_news = self.model.get("related_news");
            if (related_news instanceof Array && related_news.length > 0) {
                self.$el.find("#list_post").html("");
                var data = JSON.stringify({
                    data: related_news
                });
                var url = self.getApp().serviceURL + '/api/v1/related-news';
                $.ajax({
                    url: url,
                    type: 'POST',
                    data: data,
                    headers: {
                        'content-type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    dataType: 'json',
                    success: function(data) {
                        var list_related_news = data.related_news;
                        if (list_related_news instanceof Array && list_related_news.length > 0) {
                            for (var i = 0; i < list_related_news.length; i++) {
                                self.renderImgNews(list_related_news[i]);
                            }
                        }
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
                    }
                });
            }
        },
        renderImgNews: function(post) {
            var self = this;
            self.$el.find("#list_post").append(`
            <li class="post" id="post_` + post.id + `">
                <div class="img_post"> 
                    <img src="static`+ post.image_thumbnail + `" alt="img">
                </div>
                <div class="content_post">
                    <h5 style="margin-top: 0px !important">` + post.title + `</h5>
                    <ul class="post_details simple">
                        <li class="category">` + post.category_name + `</li>
                    </ul>
                </div>
                <span class="delete-related-new" id="delete_` + post.id + `" title="Xóa">&times;</span>
            </li>
            `);
            self.$el.find("#delete_" + post.id).unbind("click").bind("click", function(){
                self.$el.find("#post_" + post.id).remove();
                self.deletePost(post);
            });
        },
        validate: function() {
            var self = this;
            var title = self.model.get("title"),
                category_id = self.model.get("category_id"),
                image_thumbnail = self.model.get("image_thumbnail"),
                tac_gia = self.model.get("tac_gia");
            
            if (!title || title == null || title == "") {
                self.getApp().notify({message: "Vui lòng nhập tiêu đề bài viết"}, {type: "danger", delay: 1000});
                return false;
            } 
            else if (!category_id || category_id == null || category_id == "") {
                self.getApp().notify({message: "Vui lòng chọn chuyên mục chính cho bài viết"}, {type: "danger", delay: 1000});
                return false;
            } 
            else if (!tac_gia || tac_gia == null || tac_gia == "") {
                self.getApp().notify({message: "Vui lòng nhập tác giả cho bài viết"}, {type: "danger", delay: 1000});
                return false;
            } 
            else if (!image_thumbnail || image_thumbnail == null || image_thumbnail == "") {
                self.getApp().notify({message: "Vui lòng chọn ảnh đại diện bài viết"}, {type: "danger", delay: 1000});
                return false;
            } 
            
            var unsigned_title = self.removeVietnameseTones(title);
            var path = self.convertToSlug(unsigned_title);
            self.model.set("unsigned_title", unsigned_title);
            self.model.set("path", path);
            return true;
        },
        previewSeoGoogle: function() {
            var self = this;
            
            if (!!(self.model.get("title_google"))) {
                self.$el.find(".seo-preview .title").text(self.model.get("title_google"))
            }
            else if (!!(self.model.get("title"))) {
                self.$el.find(".seo-preview .title").text(self.model.get("title"))
            }
            
            if (!!(self.model.get("description_google"))) {
                self.$el.find(".seo-preview .sapo").text(self.model.get("description_google"))
            }
            else if (!!(self.model.get("description"))) {
                self.$el.find(".seo-preview .sapo").text(self.model.get("description"))
            }
        },
        eventKeyup: function() {
            var self = this;
            self.$el.find("#title").keyup(function() {
                var title = $(this).val();
                self.model.set("title", title);
                self.previewSeoGoogle();
            });
            self.$el.find("#description").keyup(function() {
                var description = $(this).val();
                self.model.set("description", description);
                self.previewSeoGoogle();
            });
            self.$el.find("#title_google").keyup(function() {
                var title_google = $(this).val();
                self.model.set("title_google", title_google);
                self.previewSeoGoogle();
            });
            self.$el.find("#description_google").keyup(function() {
                var description_google = $(this).val();
                self.model.set("description_google", description_google);
                self.previewSeoGoogle();
            });
        },
        selectizeAgeGroup: function() {
            var self = this;
            var $selectize = self.$el.find('#selectize-age_group').selectize({
                plugins: ["remove_button"],
                valueField: 'id',
                labelField: 'ten_nhom',
                searchField: ['ten_nhom', 'tenkhongdau'],
                preload: true,
                placeholder: "Chọn nhóm tuổi",
                
                load: function(query, callback) {
                    var token = localStorage.getItem("token");
                    var url = 'https://somevabe-dev.baocaoyte.com/api/v1/nhomtuoi_filter?results_per_page=100';
                    $.ajax({
                        url: url,
                        type: 'GET',
                        headers: {
                            'content-type': 'application/json',
                            'X-USER-TOKEN': token
                        },
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            var obj = res.objects;
                            callback(obj);
                            var age_group = self.model.get('age_group');
                            if (age_group instanceof Array && age_group.length > 0) {
                                $selectize[0].selectize.setValue(age_group);
                            }
                        }
                    });
                },
                onItemAdd: function(value, $item) {
                    self.addAgeGroup(value);
                },
                onItemRemove: function(value) {
                    self.removeAgeGroup(value);
                }
            });
        },
        viewHistory: function(){
            var self = this;
            var post_id = self.model.get('id');
            if (post_id == null || post_id == undefined || post_id == ""){
                self.getApp().notify("Không có lịch sử thay đổi");
                return false;
            } else {
                var history_dialog = new HistoryDialog({"viewData": {"post_id": post_id}});
                history_dialog.dialog({size:"large"});
                    // model_dialog.on("savePost", function(html) {
                    //     editor.insertContent(html);
                    // });
            //     $.ajax({
            //         url: (self.getApp().serviceURL || "") + '/api/v1/get_history_post',
            //         method: 'POST',
            //         data: JSON.stringify({"post_id":post_id}),
            //         dataType: "json",
            //         contentType: "application/json",
            //         success: function(data) {
            //             if(!!data){
            //                 #grid_history_post
            //             }
            //         },
            //         error: function(xhr, status, error) {
            //             try {
            //                 if (($.parseJSON(xhr.responseText).error_code) === "SESSION_EXPIRED") {
            //                     self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
            //                     self.getApp().getRouter().navigate("login");
            //                 } else {
            //                     self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 1000 });
            //                 }
            //             } catch (err) {
            //                 self.getApp().notify({ message: "Lỗi truy cập dữ liệu, vui lòng thử lại sau" }, { type: "danger", delay: 1000 });
            //             }
            //         },
            // }
            }
        }

    });
});