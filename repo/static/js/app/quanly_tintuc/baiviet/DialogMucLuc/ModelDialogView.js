define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template = require('text!app/quanly_tintuc/baiviet/DialogMucLuc/tpl/model_dialog.html');  
    return Gonrin.ModelDialogView.extend({
    	template: template,
        modelSchema: {},
        urlPrefix: "",
        collectionName: "",
        uiControl: {
            fields: [
        
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
							this.close()
						}
					},
                    {
                        name: "save",
                        type: "button",
                        buttonClass: "btn-success width-sm ml-2",
                        label: `<i class="far fa-save"></i> Lưu`,
                        command: function(){
                            var self = this;
                            self.trigger("insert_toc", self.array_level, self.html);
                            self.close();
                        }
                    }
    	    	]
    	    }
        ],
        array_toc: [],
        array_level: [],
        html: ``,
    	render: function() {
            var self = this;
            self.array_toc = [];
            self.html = ``;
            
            var curUser = self.getApp().currentUser;
            if (curUser) {
                self.applyBindings();
                self.array_toc = self.viewData.array_toc;
                self.array_level = self.viewData.array_level;
                if (self.array_level.length == 0) {
                    self.array_level = ["toc-level-0", "toc-level-1"];
                }
                for (var i = 0; i < self.array_level.length; i++) {
                    var id = self.array_level[i].replaceAll("-","_");
                    self.$el.find("#" + id).prop('checked', true);
                }
                self.changeCheckbox();
                self.$el.find("#toc_level_0").unbind("click").bind("click", function() {
                    var index = self.array_level.indexOf("toc-level-0");
                    if (self.$el.find("#toc_level_0").is(":checked")) {
                        if (index < 0) {
                            self.array_level.push("toc-level-0");
                        }
                    }
                    else {
                        if (index > -1) {
                            self.array_level.splice(index, 1);
                        }
                    }
                    self.changeCheckbox();
                });
                self.$el.find("#toc_level_1").unbind("click").bind("click", function() {
                    var index = self.array_level.indexOf("toc-level-1");
                    if (self.$el.find("#toc_level_1").is(":checked")) {
                        if (index < 0) {
                            self.array_level.push("toc-level-1");
                        }
                    }
                    else {
                        if (index > -1) {
                            self.array_level.splice(index, 1);
                        }
                    }
                    self.changeCheckbox();
                });
                self.$el.find("#toc_level_2").unbind("click").bind("click", function() {
                    var index = self.array_level.indexOf("toc-level-2");
                    if (self.$el.find("#toc_level_2").is(":checked")) {
                        if (index < 0) {
                            self.array_level.push("toc-level-2");
                        }
                    }
                    else {
                        if (index > -1) {
                            self.array_level.splice(index, 1);
                        }
                    }
                    self.changeCheckbox();
                });
                self.$el.find("#toc_level_3").unbind("click").bind("click", function() {
                    var index = self.array_level.indexOf("toc-level-3");
                    if (self.$el.find("#toc_level_3").is(":checked")) {
                        if (index < 0) {
                            self.array_level.push("toc-level-3");
                        }
                    }
                    else {
                        if (index > -1) {
                            self.array_level.splice(index, 1);
                        }
                    }
                    self.changeCheckbox();
                });

                return this;
            }
        },
        changeCheckbox: function() {
            var self = this;
            var html = ``;
            var array_toc = self.array_toc;
            var array_level = self.array_level;
            if (array_level.length > 0 && array_toc.length > 0) {
                html += `<div class="toc-content"><div class="toc-title">Nội dung:</div><ul>`;
                for (var i = 0; i < array_toc.length; i++) {
                    if (array_toc[i].innerText != "\n") {
                        if (array_level.includes((array_toc[i].classList)[1])) {
                            var str = array_toc[i].innerText;
                            var str_lowercase = str.toLowerCase();
                            str_lowercase = str_lowercase.replaceAll(".","").replaceAll(/ /g,"-");
                            html += `<li class="toc-level ` + (array_toc[i].classList)[1] + `"><a href="#`+ str_lowercase +`">` + str + `</a></li>`
                        }
                    }
                }
                html += `</ul></div>`;
            }
            
            self.html = html;
            self.renderPreview();
        },
        renderPreview: function() {
            var self = this;
            self.$el.find("#block_toc").html("");
            if (self.html != "") {
                self.$el.find("#block_toc").append(`
                    <div class="block-toc">` + self.html + `</div>
                `);
            }
        }
    });

});