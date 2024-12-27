const { some } = require('underscore');

define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/danhmuc/danhmuc_sanpham/SanPham/tpl/viewdata.html'),
        schema = require('json!schema/DanhMucSanPhamSchema.json');
    return Gonrin.ModelView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "sanpham",
        isExpand: false,
        tools: [
            {
                name: "back",
                type: "button",
                buttonClass: "btn-secondary btn mr-1",
                label: `<i class="fas fa-arrow-circle-left"></i> Quay lại`,
                command: function() {
                    var self = this;
                    Backbone.history.history.back();
                }
            },
            {
                name:"update",
                type: "button",
                buttonClass: "btn-primary btn",
                label: `<i class="fas fa-edit"></i> Cập nhật`,
                visible: function() {
                    var currentUser = gonrinApp().currentUser;
                    return gonrinApp().hasRole('admin') || (!!currentUser && !!currentUser.donvi && currentUser.donvi.tuyendonvi_id == '10');
                },
                command: function(){
                    var self = this;
                    let id = self.getApp().getRouter().getParam("id");
                    let path = `sanpham/model?id=${id}`;
                    self.getApp().getRouter().navigate(path);
                }
            }
        ],
        uiControl: {

        },
        render: function() {
            var self = this;
            var id = this.getApp().getRouter().getParam("id");
            if (id) {
                //progresbar quay quay
                this.model.set('id', id);
                this.model.fetch({
                    success: function(data) {
                        self.applyBindings();
                        let hinhanh = self.model.get("hinhanh");
                        if (Array.isArray(hinhanh) && hinhanh.length >0){
                            let showImage = hinhanh[0];
                            let linkImage = showImage.link;
                            if (!!linkImage && linkImage.startsWith("duoclieucocq")){
                                let fullImage = (self.getApp().serviceURL + `/uploadcocq/${linkImage}`);
                                self.$el.find(`.image_duoclieu`).append(`
                                    <img class="mw-100" src="${fullImage}">
                                `)
                            }
                            else{
                                let fullImage = (self.getApp().serviceURL + `/static/${linkImage}`);
                                self.$el.find(`.image_duoclieu`).append(`
                                    <img class="mw-100" src="${fullImage}">
                                `)
                            }
 
                        }
                        let mota = self.model.get("mota");
                        if (!!mota){
                            if (mota.startsWith("<div")){
                                self.$el.find(".mota").html(mota);
                                let freeText = self.$el.find(".mota div p")[0].innerHTML;
                                self.$el.find(".mota").html(freeText);
                            }
                            else{
                                self.$el.find(".mota").html(mota);
                            }
                        }
                    },
                    error: function() {
                        self.getApp().notify("Lỗi lấy dữ liệu từ hệ thống");
                    },
                    complete: function() {

                    }
                });
            } else {
                self.applyBindings();

            }
        }
    });

});