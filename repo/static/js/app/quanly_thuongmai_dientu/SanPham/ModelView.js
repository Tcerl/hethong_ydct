define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/quanly_thuongmai_dientu/SanPham/tpl/model.html'),
        schema = require('json!schema/DanhMucSanPhamSchema.json');
    var danhmuc_donvitinh = require("json!app/constant/donvitinh.json");
    var ManageFileVIew = require("app/view/AttachFile/ManageFileUploadView");
    var RejectDialogView = require('app/bases/RejectDialogView');
    return Gonrin.ModelView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "danhmuc_sanpham",
        initialize: function() {
			this.state = {
				danhsach_nhomsanpham: [],
                nha_cung_cap: [],
                nha_san_xuat: [],
			};
		},
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
                buttonClass: "btn-success btn width-sm ml-1",
                label: `<i class="far fa-save"></i> Lưu`,
                visible: function() {
                    var currentUser = gonrinApp().currentUser;
                    return (!!currentUser && !!currentUser.donvi && currentUser.donvi.tuyendonvi_id == '3');
                },
                command: function() {
                    var self = this;
                    var isValidData = self.validateData();
                    if (!isValidData) {
                        return;
                    }
                    var mota_editor = new Quill('#mota-editor');
                    self.model.set("mota", mota_editor.container.innerHTML);
                    self.getApp().showloading();
                    self.model.save(null, {
                        success: function(model, respose, options) {
                            self.getApp().hideloading();
                            self.getApp().notify("Lưu thông tin thành công");
                            self.getApp().getRouter().navigate("sanpham/collection");
                        },
                        error: function(xhr, status, error) {
                            self.getApp().hideloading();
                            try {
                                if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
                                    self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                    self.getApp().getRouter().navigate("login");
                                } 
                                else {
                                    self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                                }
                            } 
                            catch (err) {
                                self.getApp().notify({ message: "Lưu thông tin không thành công" }, { type: "danger", delay: 1000 });
                            }
                        }
                    });
                }
            },
            {
                name: "delete",
                type: "button",
                buttonClass: "btn-danger width-sm btn ml-1",
                label: `<i class="fas fa-trash-alt"></i> Xóa`,
                visible: function() {
                    var currentUser = gonrinApp().currentUser;
                    return (this.getApp().getRouter().getParam("id") !== null && !!currentUser && !!currentUser.donvi && currentUser.donvi.tuyendonvi_id == '3');
                },
                command: function() {
                    var self = this;
                    var view = new RejectDialogView({viewData: {"text": "Xóa sản phẩm này thì sẽ không thể khôi phục lại và bản ghi dữ liệu này sẽ được xóa vĩnh viễn."}});
                    view.dialog();
                    view.on("confirm",(e) => {
                        self.getApp().showloading();
                        self.model.destroy({
                            success: function(model, response) {
                                self.getApp().hideloading();
                                self.getApp().notify('Xoá dữ liệu thành công');
                                self.getApp().getRouter().navigate("sanpham/collection");
                            },
                            error: function(xhr, status, error) {
                                self.getApp().hideloading();
                                try {
                                    if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
                                        self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                        self.getApp().getRouter().navigate("login");
                                    } 
                                    else {
                                        self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                                    }
                                } 
                                catch (err) {
                                    self.getApp().notify({ message: "Xóa thông tin không thành công" }, { type: "danger", delay: 1000 });
                                }
                            }
                        });
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
            var id = self.getApp().getRouter().getParam("id");
            
            var mota_editor = new Quill('#mota-editor', {
                theme: 'snow',
                modules: {
                    'toolbar': [[{ 'font': [] }, { 'size': [] }], ['bold', 'italic', 'underline', 'strike'], [{ 'color': [] }, { 'background': [] }], [{ 'script': 'super' }, { 'script': 'sub' }], [{ 'header': [false, 1, 2, 3, 4, 5, 6] }, 'blockquote', 'code-block'], [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }], ['direction', { 'align': [] }], ['link', 'image', 'video'], ['clean']]
                },
            });
            
            if (id) {
                this.model.set('id', id);
                this.model.fetch({
                    success: function(data) {
                        self.applyBindings();
                        if (!self.model.get('donvitinh')) {
                            self.model.set('donvitinh', 'kg')
                        }
                        let mota = self.model.get("mota");
                        if (!!mota){
                            const delta = mota_editor.clipboard.convert(self.model.get("mota"));
                            mota_editor.setContents(self.model.get("mota"));
                            mota_editor.setContents(delta, 'silent');
                        }
                        var fileView = new ManageFileVIew({ viewData: { "listFile": self.model.get('hinhanh'), "$el_btn_upload": self.$el.find(".btn-add-file") }, el: self.$el.find(".list-attachment") });
                        fileView.render();
                        fileView.on("change", (event) => {
                            var listfile = event.data;
                            self.model.set('hinhanh', listfile);
                        });
                        self.$el.find(".btn-add-file").unbind("click").bind("click", function() {
                            fileView.$el.find("#upload_files").trigger('click');
                        });
                    },
                    error: function() {
                        self.getApp().notify("Lỗi lấy dữ liệu từ hệ thống");
                    },
                });
            } 
            else {
                self.applyBindings();
                var fileView = new ManageFileVIew({ viewData: { "listFile": self.model.get('hinhanh'), "$el_btn_upload": self.$el.find(".btn-add-file") }, el: self.$el.find(".list-attachment") });
                fileView.render();
                fileView.on("change", (event) => {
                    var listfile = event.data;
                    self.model.set('hinhanh', listfile);
                });
                self.$el.find(".btn-add-file").unbind("click").bind("click", function() {
                    fileView.$el.find("#upload_files").trigger('click');
                });
                if (!self.model.get('donvitinh')) {
                    self.model.set('donvitinh', 'kg')
                }
            }

            self.getDataSource();
            self.expandDetail();
            if (!!currentUser && !!currentUser.donvi && currentUser.donvi.tuyendonvi_id == '3') {

            } 
            else {
                self.$el.find('.btn-add-file').remove();
            }

            return this;
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
            if (!self.model.get('ten_sanpham')) {
                self.getApp().notify({ message: "Chưa nhập tên sản phẩm" }, { type: "danger", delay: 1000 });
                return false;
            }
            if (!self.model.get('ma_sanpham')) {
                self.getApp().notify({ message: "Chưa nhập mã sản phẩm" }, { type: "danger", delay: 1000 });
                return false;
            }
            return true;
        },
        getDataSource: function() {
            var self = this;
            var url_nhomsanpham = (self.getApp().serviceURL || "") + '/api/v1/nhomsanpham_donvi?page=1&results_per_page=1000';
            var query_filter = {
                "filters": {
                    "$and": [
                        { "donvi_id": { "$likeI": gonrinApp().convert_khongdau(gonrinApp().currentUser.donvi_id) } }
                    ],
                    "order_by": [{ "field": "donvi_id", "direction": "asc" }]
                }
            };
            var queryString = (query_filter ? "&q=" + JSON.stringify(query_filter) : "");
            $.ajax({
                url: url_nhomsanpham + queryString,
                type: "GET",
                dataType: "json",
                success: function(data) {
                    self.state.danhsach_nhomsanpham = data.objects;
                    self.selectizeNhomSanPham();
                },
            });
            $.ajax({
                url: "/api/v2/nhasanxuat_donvi",
                type: "GET",
                dataType: "json",
                success: function(data) {
                    self.state.nha_san_xuat = data.objects;
                    self.selectizeNhaSanXuat();
                },
            });
            $.ajax({
                url: "/api/v2/donvi_cungung",
                type: "GET",
                dataType: "json",
                success: function(data) {
                    self.state.nha_cung_cap = data.objects;
                    self.selectizeNhaCungCap();
                },
            });
        },
        selectizeNhomSanPham: function() {
            var self = this;
            var $selectize = self.$el.find('#selectize-nhomsanpham').selectize({
                maxItems: 1,
                valueField: 'id',
                labelField: 'ten_nhom',
                searchField: ['ten_nhom', 'tenkhongdau'],
                options: self.state.danhsach_nhomsanpham,
                preload: true,
                load: function(query, callback) {
                    if (!!self.model.get("ma_nhom")) {
                        $selectize[0].selectize.setValue(self.model.get("ma_nhom"));
                    }
                },
                onChange: function(value) {
                    var nhomsanpham = $selectize[0].selectize.options[value];
                    if (nhomsanpham) delete nhomsanpham.$order;
                    self.model.set({
                        'ma_nhom': value,
                        'ten_nhom': nhomsanpham?.ten_nhom
                    });

                }
            });
        },
        selectizeNhaSanXuat: function() {
            var self = this;
            var $selectize = self.$el.find('#selectize-nhasanxuat').selectize({
                maxItems: 1,
                valueField: 'id',
                labelField: 'ten',
                searchField: ['ten', 'tenkhongdau'],
                options: self.state.nha_san_xuat,
                preload: true,
                load:function(query,callback){
                    if(self.model.get("id_nhasanxuat")){
                        $selectize[0].selectize.setValue(self.model.get("id_nhasanxuat"));
                    }
                    else{
                        if ( !!self.model.get('id')) { 
                            self.$el.find('#selectize-nhasanxuat')[0].selectize.setValue(self.model.get("id"));
                        }
                        var url='/api/v2/nhasanxuat_donvi' + (query ? "?text_filter=" + query : "");
                        $.ajax({
                            url:url,
                            type:"GET",
                            dataType:"json",
                            error: function() {
                                callback();
                            },
                            success: function(res) {
                                var obj = res.objects;
                                callback(obj);
                            },
                        });
                    }
                },
                onChange:function(value){
                    var nhasanxuat = $selectize[0].selectize.options[value];
                    var currentData = self.model.get("nhasanxuat_donvi");
                    if (!currentData || currentData.id !== value) {
                        if (!!nhasanxuat) {
                            self.model.set({
                                'id_nhasanxuat': nhasanxuat.id,
                                'ma_nhasanxuat': nhasanxuat.ma,
                                'ten_nhasanxuat': nhasanxuat.ten
                            });
                        }
                        else{
                            self.model.set({
                                'id_nhasanxuat': null,
                                'ma_nhasanxuat': null,
                                'ten_nhasanxuat': null
                            });
                        }
                    }
                },
            });
        },
        selectizeNhaCungCap: function() {
            var self = this;
            var $selectize = self.$el.find('#selectize-nhacungcap').selectize({
                maxItems: 1,
                valueField: 'id',
                labelField: 'ten_donvi',
                searchField: ['ten_donvi', 'tenkhongdau'],
                options: self.state.nha_cung_cap,
                preload: true,
                load:function(query,callback){
                    if(self.model.get("id_nhacungcap")){
                        $selectize[0].selectize.setValue(self.model.get("id_nhacungcap"));
                    }
                    else{
                        if (!!self.model.get('id')) { 
                            self.$el.find('#selectize-nhacungcap')[0].selectize.setValue(self.model.get("id"));
                        }
                        var url='/api/v2/donvi_cungung' + (query ? "?text_filter=" + query : "");
                        $.ajax({
                            url:url,
                            type:"GET",
                            dataType:"json",
                            error: function() {
                                callback();
                            },
                            success: function(res) {
                                var obj = res.objects;
                                callback(obj);
                            },
                        });
                    }
                },
                onChange:function(value){
                    var nhacungcap = $selectize[0].selectize.options[value];
                    var currentData = self.model.get("donvi_cungung");
                    if (!currentData || currentData.id !== value) {
                        if (!!nhacungcap) {
                            self.model.set({
                                'id_nhacungcap': nhacungcap.id,
                                'ma_nhacungcap': nhacungcap.ma_donvi,
                                'ten_nhacungcap': nhacungcap.ten_donvi
                            });
                        }
                        else{
                            self.model.set({
                                'id_nhacungcap': null,
                                'ma_nhacungcap': null,
                                'ten_nhacungcap': null
                            });
                        }
                    }
                },
            });
        }
    });

});