define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/giaychungnhanco/tpl/donvicapco.html'),
        schema = require('json!schema/DanhMucDonViChungNhanCOSchema.json');


    return Gonrin.ModelDialogView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "donvicapco",
        clickSave: false,
        tools: [
            {
                name: "defaultgr",
                type: "group",
                groupClass: "toolbar-group",
                buttons: [
                    {
                        name: "close",
                        type: "button",
                        buttonClass: "btn-secondary btn btn-sm",
                        label: "TRANSLATE:CLOSE",
                        command: function () {
                            var self = this;
                            self.close();
                        }
                    },
                    {
                        name: "save",
                        type: "button",
                        buttonClass: "btn-success btn btn-sm ml-1",
                        label: "TRANSLATE:SAVE",
                        command: function () {
                            var self = this;

                            let ten = self.model.get("ten");
                            if (!ten) {
                                self.getApp().notify({ message: 'Vui lòng nhập tên đơn vị chứng nhận' }, { type: 'danger', delay: 1000 });
                                return false;
                            }

                            if (self.clickSave === true){
                                return;
                            }

                            self.clickSave = true;

                            self.model.save(null, {
                                success: function (model, respose, options) {
                                    self.getApp().notify("Lưu thông tin thành công");
                                    self.clickSave = false;
                                    self.trigger('saveData', { data: self.model.toJSON() });
                                    self.close();
                                },
                                error: function (xhr, status, error) {
                                    self.clickSave = false;
                                    try {
                                        if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
                                            self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                            self.getApp().getRouter().navigate("login");
                                        } else {
                                            self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                                        }
                                    }
                                    catch (err) {
                                        self.getApp().notify({ message: "Lưu thông tin không thành công" }, { type: "danger", delay: 1000 });
                                    }
                                }
                            });
                        }
                    }
                ],
            }],
        uiControl: {
            fields: [

            ]
        },
        render: function () {
            var self = this;
            var viewData = self.viewData;
            self.clickSave = false;
            var id;

            if (id) {
                this.model.set('id', id);
                this.model.fetch({
                    success: function (data) {
                        self.applyBindings();
                    },
                    error: function () {
                        self.getApp().notify(self.getApp().traslate("TRANSLATE:error_load_data"));
                    },
                    complete: function () {

                    }
                });
            }
            else {
                self.applyBindings();
            }
        },
    });

});