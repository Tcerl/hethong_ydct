define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin'),
        tpl = require('text!app/news/tpl/newsmodel.html'),
        schema = require('text!app/view/CategoryPost/PostAdminSchema.json');
    return Gonrin.ModelView.extend({
        template: tpl,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "post",
        render: function() {
            var self = this;
            var id = self.getApp().getRouter().getParam("id");
            self.$el.find("#back").unbind("click").bind("click", function() {
                self.getApp().getRouter().navigate("news/collection");
            });
            if (id) {
                this.model.set('id', id);

                this.model.fetch({
                    success: function(data) {
                        var image = self.model.get("image"),
                            content = self.model.get("content"),
                            created_at = self.model.get("created_at"),
                            title = self.model.get("title");
                        var full_url_image = self.validate_image(image);
                        self.$el.find(".img-fluid").attr("src", full_url_image);
                        self.$el.find(".title-content").text(title);
                        self.$el.find(".ngaygio_tao").text(moment.unix(created_at).local().format("DD/MM/YYYY H:mm:ss"))
                        self.$el.find(".content").html(content);
                    },
                    error: function() {
                        // self.getApp().notify("Get data Eror");
                        // self.loader({ message: "LOADER_RELOAD" });
                    },
                });
            }
            return this;
        },
        validate_image: function(url_image) {
            if (!url_image) {
                return "";
            } else {
                if (url_image.startsWith("https://somevabe.com/chuyengiatuvan")) {
                    url_image = url_image;
                } else {
                    url_image = static_url + url_image;
                }
                return url_image;
            }
        },
    });
});