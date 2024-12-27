define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/danhmuc/danhmuc_sanpham/SanPhamDonVi/tpl/model.html'),
        schema = require('json!schema/SanPhamDonViSchema.json');
    var danhmuc_donvitinh = require("json!app/constant/donvitinh.json");
    var ManageFileVIew = require("app/view/AttachFile/ManageFileUploadView");
    return Gonrin.ModelView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "sanpham_donvi",
        isExpand: false,
        tools: [{
                name: "back",
                type: "button",
                buttonClass: "btn-secondary btn",
                label: `<i class="fas fa-arrow-circle-left"></i> Quay lại`,
                command: function() {
                    var self = this;
                    Backbone.history.history.back();
                }
            },
            {
                name: "save",
                type: "button",
                buttonClass: "btn-success width-sm btn ml-2",
                label: `<i class="far fa-save"></i> Lưu`,
                // visible: function() {
                //     return gonrinApp().hasRole('admin_donvi');
                // },
                visible: function() {
					var tuyendonvi_id = gonrinApp().getTuyenDonVi();
					return gonrinApp().hasRole("admin") ||  tuyendonvi_id=='1';
				},
                command: function() {
                    var self = this;
                    var isValidData = self.validateData();
                    if (!isValidData) {
                        return;
                    }
                    var mota_editor = new Quill('#mota-editor');
                    self.model.set("mota", mota_editor.container.innerHTML);
                    self.model.save(null, {
                        success: function(model, respose, options) {
                            self.getApp().notify("Lưu thông tin thành công");
                            self.getApp().getRouter().navigate(self.collectionName + "/collection");

                        },
                        error: function(xhr, status, error) {
                            self.getApp().hideloading();
                            try {
                                if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
                                    self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                    self.getApp().getRouter().navigate("login");
                                } else {
                                    self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                                }
                            } catch (err) {
                                self.getApp().notify({ message: "Lưu thông tin không thành công" }, { type: "danger", delay: 1000 });
                            }
                        }
                    });
                }
            },
            {
                name: "delete",
                type: "button",
                buttonClass: "btn-danger width-sm btn ml-2",
                label: `<i class="fas fa-trash-alt"></i> Xóa`,
                // visible: function() {
                //     return gonrinApp().hasRole('admin_donvi');
                // },
                visible: function() {
					var tuyendonvi_id = gonrinApp().getTuyenDonVi();
					return gonrinApp().hasRole("admin") ||  tuyendonvi_id=='1';
				},
                command: function() {
                    var self = this;
                    var delete_success = null;
                    self.$el.find("#exampleModalCenter").modal("show");
                    self.$el.find(".btn-deleted-continue").unbind("click").bind("click", function () {
                        delete_success = true;
                    });

                    self.$el.find("#exampleModalCenter").on("hidden.bs.modal", function (e) {
                        if (delete_success == true) {
                            self.getApp().showloading();
                            self.model.destroy({
                                success: function(model, response) {
                                    self.getApp().hideloading();
                                    self.getApp().notify('Xoá dữ liệu thành công');
                                    self.getApp().getRouter().navigate(self.collectionName + "/collection");
                                },
                                error: function(xhr, status, error) {
                                    self.getApp().hideloading();
                                    try {
                                        if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
                                            self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                            self.getApp().getRouter().navigate("login");
                                        } else {
                                            self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                                        }
                                    } catch (err) {
                                        self.getApp().notify({ message: "Xóa thông tin không thành công" }, { type: "danger", delay: 1000 });
                                    }
                                }
                            });
                        }
                    });

                }
            },
        ],
        uiControl: {
            fields: [{
                field: "donvitinh",
                uicontrol: "combobox",
                textField: "text",
                valueField: "value",
                cssClass: "form-control",
                dataSource: danhmuc_donvitinh,
                value: "kg"
            }]
        },
        render: function() {
            var self = this;
            var currentUser = self.getApp().currentUser;
            var id = this.getApp().getRouter().getParam("id");
            var mota_editor = new Quill('#mota-editor', {
                theme: 'snow',
                modules: {
                    'toolbar': [[{ 'font': [] }, { 'size': [] }], ['bold', 'italic', 'underline', 'strike'], [{ 'color': [] }, { 'background': [] }], [{ 'script': 'super' }, { 'script': 'sub' }], [{ 'header': [false, 1, 2, 3, 4, 5, 6] }, 'blockquote', 'code-block'], [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }], ['direction', { 'align': [] }], ['link', 'image', 'video'], ['clean']]
                },
            });

            if (id) {
                //progresbar quay quay
                this.model.set('id', id);
                this.model.fetch({
                    success: function(data) {
                        self.applyBindings();
                        var tuyendonvi_id = gonrinApp().getTuyenDonVi();
						if(!gonrinApp().hasRole("admin") && tuyendonvi_id != '1'){
							self.$el.find("input").css("pointer-events","none");
							self.$el.find("textarea").css("pointer-events","none");
							self.$el.find("button").hide();
						}
                        if (!self.model.get('donvitinh')) {
                            self.model.set('donvitinh', 'kg')
                        }
                        let mota = self.model.get("mota");
                        if (!!mota){
                            const delta = mota_editor.clipboard.convert(self.model.get("mota"));
                            mota_editor.setContents(self.model.get("mota"));
                            mota_editor.setContents(delta, 'silent');
                        }
                    },
                    error: function() {
                        self.getApp().notify("Get data Eror");
                    },
                    complete: function() {
                        var fileView = new ManageFileVIew({ viewData: { "listFile": self.model.get('hinhanh'), "$el_btn_upload": self.$el.find(".btn-add-file") }, el: self.$el.find(".list-attachment") });
                        fileView.render();
                        fileView.on("change", (event) => {
                            var listfile = event.data;
                            self.model.set('hinhanh', listfile);
                        });
                    }
                });
            } else {
                self.applyBindings();
                var fileView = new ManageFileVIew({ viewData: { "listFile": self.model.get('hinhanh'), "$el_btn_upload": self.$el.find(".btn-add-file") }, el: self.$el.find(".list-attachment") });
                fileView.render();
                fileView.on("change", (event) => {
                    var listfile = event.data;
                    self.model.set('hinhanh', listfile);
                });
                if (!self.model.get('donvitinh')) {
                    self.model.set('donvitinh', 'kg')
                }
            }

            self.selectizeNhomDuocLieu();
            self.selectizeBoPhan();
            self.expandDetail();
            if (self.getApp().hasRole('admin') || (!!currentUser && !!currentUser.donvi && currentUser.donvi.tuyendonvi_id == '10')) {

            } else {
                self.$el.find('.btn-add-file').remove();
            }


        },
        expandDetail: function() {
            var self = this;
            if (self.isExpand) {
                self.$el.find('#detail').slideDown();
            } else {
                self.$el.find('#detail').slideUp();
            }
            self.$el.find("#view-detail").on('click', function() {
                self.isExpand = !self.isExpand;
                if (self.isExpand) {
                    self.$el.find('#detail').slideDown();
                } else {
                    self.$el.find('#detail').slideUp();
                }
            })
        },
        validateData: function() {
            var self = this;
            // if(!self.model.get('ma_sanpham')){
            // 	self.getApp().notify({ message: "Chưa nhập mã dược liệu"}, { type: "danger", delay: 1000 });
            // 	return false;
            // }
            if (!self.model.get('ten_sanpham')) {
                self.getApp().notify({ message: "Chưa nhập tên dược liệu" }, { type: "danger", delay: 1000 });
                return false;
            }
            if (!self.model.get("ma_sanpham_donvi")){
                self.getApp().notify({message:"Mã dược liệu đơn vị không được để trống"},{type:"danger", delay : 1000});
                return false;
            }
            return true;
        },
        selectizeNhomDuocLieu: function() {
            var self = this;
            var $selectize = self.$el.find('#selectize-nhomduoclieu').selectize({
                maxItems: 1,
                valueField: 'id',
                labelField: 'ten_nhom',
                searchField: ['ten_nhom', 'tenkhongdau'],
                preload: true,
                load: function(query, callback) {
                    var query_filter = {
                        "filters": {
                            "$and": [
                                { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } }
                            ],
                            "order_by": [{ "field": "ten_sanpham", "direction": "asc" }]
                        }
                    };
                    var url = (self.getApp().serviceURL || "") + '/api/v1/nhomsanpham?page=1&results_per_page=1000' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");

                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            callback(res.objects);
                            if (!!self.model.get("ma_nhom")) {
                                $selectize[0].selectize.setValue(self.model.get("ma_nhom"));
                            }
                        }
                    });
                },
                onChange: function(value) {
                    var nhomsanpham = $selectize[0].selectize.options[value];
                    if (nhomsanpham) delete nhomsanpham.$order;
                    self.model.set({
                        'ma_nhom': value,
                        'ten_nhom': nhomsanpham.ten_nhom
                    });

                }
            });
        },

        selectizeBoPhan: function() {
            var self = this;
            var $selectize = self.$el.find('#selectize-bophan').selectize({
                // maxItems: 1,
                valueField: 'id',
                labelField: 'ten_bophan',
                searchField: ['ten_bophan', 'tenkhongdau'],
                preload: true,
                load: function(query, callback) {
                    var query_filter = {
                        "filters": {
                            "$and": [
                                { "tenkhongdau": { "$likeI": gonrinApp().convert_khongdau(query) } }
                            ],
                            "order_by": [{ "field": "ten_bophan", "direction": "asc" }]
                        }
                    };
                    var url = (self.getApp().serviceURL || "") + '/api/v1/bophan?page=1&results_per_page=1000' + (query_filter ? "&q=" + JSON.stringify(query_filter) : "");

                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            callback(res.objects);
                            if (!!self.model.get("danhsach_bophan")) {
                                var danhsach_bophan = self.model.get('danhsach_bophan');
                                var value = [];
                                if (Array.isArray(danhsach_bophan)) {
                                    value = danhsach_bophan.map((item, index) => {
                                        return item.id;
                                    });
                                }
                                $selectize[0].selectize.setValue(value);
                            }
                        }
                    });
                },
                onChange: function(value) {
                    if (!!value) {
                        var arr = value.split(',');
                        var obj = [];
                        for (let i = 0; i < arr.length; i++) {
                            var bophan = $selectize[0].selectize.options[arr[i]];
                            if (bophan) {
                                delete bophan.$order;
                                obj.push(bophan)
                            }
                        }
                        self.model.set('danhsach_bophan', obj);
                    }

                }
            });
        },

    });

});