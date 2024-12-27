define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin'),
        storejs = require('vendor/store'),
        tpl = require('text!app/news/tpl/newscollection.html');
    var url_service = gonrinApp().serviceURL;
    return Gonrin.ModelView.extend({
        template: tpl,
        modelSchema: {},
        render: function() {
            var self = this;
            self.$el.find("#back").unbind("click").bind("click", function() {
                self.getApp().getRouter().navigate("home");
            });
            var query = { "filters": { "$and": [{ "status": { "$eq": 1 } }, { "show": { "$eq": 1 } }] }, "order_by":[{"field": "updated_at", "direction": "desc"}] };

            var url = self.getApp().serviceURL + "/api/v1/post?results_per_page=100&max_results_per_page=100" + (query ? "&q=" + JSON.stringify(query) : "");

            $.ajax({
                url: url,
                type: 'GET',
                headers: {
                    'content-type': 'application/json'
                },
                dataType: 'json',
                success: function(data) {
                    if (data.num_results >= 1) {
                        self.render_news_collection(data.objects);
                    }
                },
                error: function(xhr, status, error) {
                    // " });
                }
            });
            self.applyBindings();
            return this;
        },
        render_news_collection: function(data) {
            var self = this;
            // self.$el.find(".news_collection").empty();
            data.forEach((item, key) => {
                var full_url_image = self.validate_image(item.image);
                self.$el.find(".news_collection").append('<div class="col-12 ">'+
                '<div class="single-news" id="' + item.id + '"><img class="img-fluid" src="' + full_url_image + '"><div class="sub-content"><label>'+ item.title +'</label><span class="">' + moment.unix(item.created_at).local().format("DD/MM/YYYY") + '</span><div class="title-content"> ' + item.description + '</div></div></div><br></div>');
                // self.$el.find(".news_collection").append('<div class="col-6 "><div class="" id="' + item.id + '"><div class=" container-2 row"><div class=""><img class="img-fluid" src="' + full_url_image + '"></div><div class=""><p class="sub-content">Tin tức ngày: ' + moment.unix(item.created_at).local().format("DD/MM/YYYY") + '</p><label class="title-content"> ' + item.title + '</label></div></div><br></div></div>');
                // self.$el.find(".news_collection").append('<a id="' + item.id + '"><div class="container-2">' +
                //     '<img class="img-fluid" src="' + full_url_image + '" />' +
                //     '<br><label class="title-content"> ' +
                //     '</label>' + item.title + '<p class="sub-content"> ' + moment.unix(item.created_at).local().format("DD/MM/YYYY") + '</p>' +
                //     '</div></a>'
                // );
                self.$el.find("#" + item.id).unbind("click").bind("click", function() {
                    gonrinApp().getRouter().navigate("news/model?id=" + item.id);
                });
            });
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