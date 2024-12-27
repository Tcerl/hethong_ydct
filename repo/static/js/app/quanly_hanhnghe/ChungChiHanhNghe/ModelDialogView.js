define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/quanly_hanhnghe/ChungChiHanhNghe/tpl/model.html'),
        schema = require('json!schema/ChungChiHanhNgheSchema.json');
    var ManageFileVIew = require("app/view/AttachFile/ManageFileUploadView");
    var RejectDialogView = require('app/bases/RejectDialogView');
    return Gonrin.ModelDialogView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "chungchi_hanhnghe",
        bindings: "data-cchn-chitiet",
        tools: [
            {
                name: "defaultgr",
                type: "group",
                groupClass: "toolbar-group",
                buttons: [
                    {
                        name: "back",
                        type: "button",
                        buttonClass: "btn-secondary waves-effect width-sm",
                        label: `<i class="fas fa-times-circle"></i> Đóng`,
                        command: function() {
                            var self = this;
                            self.close();
                        }
                    },
                    {
                        name: "save",
                        type: "button",
                        buttonClass: "btn-success width-sm ml-2 btn-update",
                        label: `<i class="far fa-save"></i> Lưu`,
                        visible: function() {
                            return (gonrinApp().hasRole('admin') || gonrinApp().hasRole('admin_donvi'));
                        },
                        command: function() {
                            var self = this;
                            var so_giay_phep = self.model.get("so_giay_phep");
                            if (so_giay_phep == null || so_giay_phep == undefined || so_giay_phep.trim() == "") {
                                self.getApp().notify({ message: "Mã CCHN không được để trống" }, { type: "danger", delay: 2000 });
                                return;
                            } 
                            self.getApp().showloading();
                            self.model.save(null, {
                                success: function(model, respose, options) {
                                    self.getApp().hideloading();
                                    self.getApp().notify("Lưu thông tin thành công");
                                    self.trigger("saveData");
                                    self.close();
                                },
                                error: function(xhr, status, error) {
                                    self.getApp().hideloading();
                                    try {
                                        if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
                                            self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                            self.getApp().getRouter().navigate("login");
                                        } 
                                        else {
                                            self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 2000 });
                                        }
                                    } 
                                    catch (err) {
                                        self.getApp().notify({ message: "Lưu thông tin không thành công" }, { type: "danger", delay: 2000 });
                                    }
                                },
                            });
                        }
                    },
                    {
                        name: "delete",
                        type: "button",
                        buttonClass: "btn-danger width-sm ml-2 btn-delete",
                        label: `<i class="fas fa-trash-alt"></i> Xoá`,
                        visible: function () {
                            var viewData = this.viewData;
                            return  (gonrinApp().hasRole('admin') || gonrinApp().hasRole('admin_donvi')) && !!viewData && viewData.id;
                        },
                        command: function() {
                            var self = this;
                            var view = new RejectDialogView({viewData: {"text": "Xóa chứng chỉ này thì sẽ không thể khôi phục lại và bản ghi dữ liệu này sẽ được xóa vĩnh viễn."}});
                            view.dialog();
                            view.on("confirm",(e) => {
                                self.getApp().showloading();
                                self.model.destroy({
                                    success: function (model, response) {
                                        self.getApp().hideloading();
                                        self.getApp().notify('Xoá dữ liệu thành công');
                                        self.trigger("saveData");
                                        self.close();
                                    },
                                    error: function (xhr, status, error) {
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
                                    },
                                });
                            });
                        }
                    },
                ],
            }
        ],
        uiControl: {
            fields: [
                {
                    field: "ngay_cap",
                    uicontrol: "datetimepicker",
                    format: "DD/MM/YYYY",
                    textFormat: "DD/MM/YYYY",
                    extraFormats: ["DDMMYYYY"],
                    parseInputDate: function (val) {
						return gonrinApp().parseInputDateString(val);
					},
					parseOutputDate: function (date) {
						return gonrinApp().parseOutputDateString(date, "YYYYMMDD");
					},
                    disabledComponentButton: true
                },
                {
                    field: "ngay_hieu_luc",
                    uicontrol: "datetimepicker",
                    format: "DD/MM/YYYY",
                    textFormat: "DD/MM/YYYY",
                    extraFormats: ["DDMMYYYY"],
					parseInputDate: function (val) {
						return gonrinApp().parseInputDateString(val);
					},
					parseOutputDate: function (date) {
						return gonrinApp().parseOutputDateString(date, "YYYYMMDD");
					},
                    disabledComponentButton: true
                },
                {
                    field: "ngay_het_han",
                    uicontrol: "datetimepicker",
                    format: "DD/MM/YYYY",
                    textFormat: "DD/MM/YYYY",
                    extraFormats: ["DDMMYYYY"],
                    parseInputDate: function (val) {
						return gonrinApp().parseInputDateString(val);
					},
					parseOutputDate: function (date) {
						return gonrinApp().parseOutputDateString(date, "YYYYMMDD");
					},
                    disabledComponentButton: true
                },
                {
                    field: "hinh_thuc",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: "1", text: "Xét hồ sơ" },
                        { value: "2", text: "Thi" }
                    ],
                },
                {
                    field: "loai_chungchi",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: 1, text: "Chứng chỉ hành nghề y" },
                        { value: 2, text: "Chứng chỉ hành nghề dược" }
                    ],
                },
            ]
        },
        render: function() {
            var self = this;
            var id = null;
            var viewData = self.viewData;
            if (!!viewData) {
                id = viewData.id;
            }
			if (id) {
				self.model.set('id', id);
				self.model.fetch({
					success: function(data) {
						self.applyBindings();
                        self.initEvent();
					},
					error: function(xhr, status, error) {
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
							self.getApp().notify({ message: "Có lỗi xảy ra, vui lòng thử lại sau" }, { type: "danger", delay: 1000 });
						}
					},
				});
			} 
            else {
				self.applyBindings();
                if (!!viewData && !!viewData.nguoi_hanhnghe_id) {
                    var nguoi_hanhnghe_id = viewData.nguoi_hanhnghe_id;
                    self.model.set("nguoi_hanhnghe_id", nguoi_hanhnghe_id);
                    self.initEvent();
                }
                else {
					self.getApp().notify({ message: "Có lỗi xảy ra, vui lòng thử lại sau" }, { type: "danger", delay: 1000 });
                    return
				}
			}
        },
        selectizeVanBang: function() {
            var self = this;
            var load_first = true;
            var $select = self.$el.find('#selectize-vanbang').selectize({
                maxItems: 1,
                valueField: 'id',
                labelField: 'ten',
                searchField: ['ten', 'tenkhongdau'],
                preload: true,
                load: function(query, callback) {
                    var url = (self.getApp().serviceURL || "") + '/api/v1/vanbang_chuyenmon_filter?page=1&results_per_page=100';
                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        error: function() {
                            callback();
                        },
                        success: function(res) {
                            callback(res.objects);
                            if (load_first) {
                                load_first = false;
                                if (!!self.model.get('ma_vanbang_cm')) {
                                    $select[0].selectize.setValue(self.model.get('ma_vanbang_cm'));
                                } 
                            }
                        }
                    });
                },
                onItemAdd: function(value, $item) {
                    if (value != self.model.get("ma_vanbang_cm")) {
                        var obj = $select[0].selectize.options[value];
                        delete obj.$order;
                        self.model.set({
                            "ma_vanbang_cm": value,
                            "ten_vanbang_cm": obj.ten,
                            "vanbang": obj
                        });
                    }
                },
                onItemRemove: function() {
                    self.model.set({
                        "ma_vanbang_cm": null,
                        "ten_vanbang_cm": null,
                        "vanbang": null
                    });
                }
            });
        },
        initEvent: function() {
			var self = this;
            self.selectizeVanBang();
			var fileView = new ManageFileVIew({ viewData: { "listFile": self.model.get('dinhkem_chungchi'), "el_btn_upload": ".btn-add-file" }, el: self.$el.find(".list-attachment") });
			fileView.render();
			fileView.on("change", (event) => {
				var listfile = event.data;
				self.model.set('dinhkem_chungchi', listfile);
			});
			self.$el.find(".btn-add-file").unbind("click").bind("click", function() {
				fileView.$el.find("#upload_files").trigger('click');
			});
		},
    });
});