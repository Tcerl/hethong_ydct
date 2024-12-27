define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template = require('text!app/quanly_tintuc/baiviet/tpl/dialog_choosetype.html');  
    var schema =   require('json!app/quanly_tintuc/baiviet/ChooseTypeSchema.json');
    return Gonrin.ModelDialogView.extend({
    	template: template,
        modelSchema: schema,
        urlPrefix: "",
        collectionName: "",
        uiControl: {
            fields: [
                {
                    field: "display_type",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    cssClass: "form-control",
                    dataSource: [
                        { value: 1, text: "Kiểu 1" },
                        { value: 2, text: "Kiểu 2" },
                        // { value: 3, text: "Kiểu 3" },
                        // { value: 4, text: "Kiểu 4" },
                        // { value: 5, text: "Kiểu 5" },
                        // { value: 6, text: "Kiểu 6" },
                        // { value: 7, text: "Kiểu 7" }
                    ],
                }, 
            ]
        },
		tools: [
            {
    	    	name: "defaultgr",
    	    	type: "group",
    	    	groupClass: "toolbar-group",
    	    	buttons: [
					{
						name: "close",
						type: "button",
						buttonClass: "btn-secondary waves-effect width-sm",
						label: "<i class='fas fa-times'></i> Đóng",
						command: function(){
							var self = this;
							this.close()
						}
					},
    	    	]
    	    },
            {
                name: "save",
                type: "button",
                buttonClass: "btn-success width-sm ml-2",
                label: `<i class="far fa-save"></i> Lưu`,
                command: function() {
                    var self = this;
                    var list_post = self.model.get("list_post");
                    var type = self.model.get("display_type");
                    var box_related_news_id = self.model.get("box_related_news_id");
                    var id = "";
                    if (box_related_news_id != "" && box_related_news_id != null && box_related_news_id != undefined) {
                        id = box_related_news_id;
                    }
                    else {
                        id = self.getApp().default_uuid();
                    }
                    var html = '<div class="tinybox related-news-box alignRight" id="' + id + '" data-type="' + type + '"><div class="related-box"><ul class="list-news">';
                    var prefix_url = "/detail";
                    if (self.getApp().project_name == "TINTUC_TKDH") {
                        prefix_url = "";
                    }
                    if (type == 1) {
                        for (var i = 0; i < list_post.length; i++) {
                            html += `<li data-id="` + list_post[i].id + `" data-title="` + list_post[i].title + `" data-path="` + list_post[i].path + `" data-image_thumbnail_url="` + list_post[i].image_thumbnail_url + `" data-publish_time="` + list_post[i].publish_time + `" data-category_name="` + list_post[i].category_name + `">
                                <a class="link-callout" href="${prefix_url}/` + list_post[i].path + `">
                                    <img src="`+ list_post[i].image_thumbnail_url +`">
                                </a>
                                <h4 class="news-title clearfix">
                                    <a class="title" href="${prefix_url}/` + list_post[i].path + `">` + list_post[i].title + `</a>
                                    <a class="next" href="${prefix_url}/` + list_post[i].path + `"> </a>
                                </h4>
                            </li>`;
                        }
                    }
                    else if (type == 2) {
                        for (var i = 0; i < list_post.length; i++) {
                            html += '<li data-id="' + list_post[i].id + '" data-title="' + list_post[i].title + '" data-path="' + list_post[i].path + '" data-image_thumbnail_url="' + list_post[i].image_thumbnail_url + '" data-publish_time="' + list_post[i].publish_time + '" data-category_name="' + list_post[i].category_name + '"><h3><a href="' + prefix_url + '/' + list_post[i].path + '" class="title">' + list_post[i].title + '</a></h3></li>';
                        }
                    }
                    
                    html += '</ul></div></div>';
                    self.trigger("chooseType", html);
                    self.getApp().notify("Chọn thành công!");
                    self.close();
                }
            },
        ],
    	render: function() {
            var self = this;
            var type = self.viewData.type;
            self.model.set("display_type", parseInt(type));
            self.applyBindings();
            var list_post = self.viewData.list_post;
            self.model.set("list_post", list_post);
            return this;
        },
    });
});