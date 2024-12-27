define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/bases/tpl/collection.html');
    var CustomFilterView      = require('app/bases/CustomFilterView'),
        ModelDialogReadOnly = require('app/quanly_tintuc/baiviet/ModelDialogViewReadOnly');
    return Gonrin.CollectionDialogView.extend({
        template: template,
        modelSchema: {},
        urlPrefix: "/api/v1/",
        collectionName: "get_history_post",

        tools: [],
        uiControl: {
            fields: [
                { field: "stt", label: "STT", width:"50px" },
                { field: "title", label: "Tiêu đề" },
                { field: "account_name", label: "Người cập nhật" },
                {
                    field: "updated_time",
                    label: "Thời gian cập nhật",
                    template: function(rowData) {
                        if (!!rowData.updated_time) {
                            var item = rowData.updated_time;
                            return item.substring(6, 8) + "/" + item.substring(4, 6) + "/"+item.substring(0, 4) + "  " + item.substring(8, 10)+ ":" + item.substring(10, 12)+ ":" + item.substring(12, 14);
                        } else {
                            return "";
                        }
                    }
                },
                {
                    field: "action",
                    label: "Loại hành động",
                    template: function(rowData) {
                        if (rowData.action == "change_status") {
                            return "Thay đổi trạng thái";
                        } 
                        else if (rowData.action == "POST") {
                            return "Tạo mới bài viết";
                        } 
                        else if (rowData.action == "PUT") {
                            return "Cập nhật bài viết";
                        } 
                        else if (rowData.action == "DELETE") {
                            return "Xóa bài viết";
                        }
                        return ""
                    }
                },
                { field: "ip", label: "Location" }

            ],
            onRowClick: function(event) {
                if (event.rowId) {
                    var self = this;
                    var model_dialog = new ModelDialogReadOnly({"viewData": {"id":event.rowData.id, "post_id":event.rowData.post_id}});
                    model_dialog.dialog({size:"large", "className":"modal-custom-n"});
                }
            }
        },
        render: function() {
            var self = this;
            var post_id = self.viewData.post_id;
            if (post_id == undefined){
                self.getApp().notify("Tham số không hợp lệ");
            }
            var filter = {"post_id": { "$eq": post_id}};
            self.uiControl.filters = filter;
            self.$el.find("#title_page").text("Lịch sử cập nhật bài viết");
    		self.applyBindings();
			self.$el.find("table").addClass("table-hover");
			self.$el.find("table").removeClass("table-striped");

            return this;
        },
    });

});