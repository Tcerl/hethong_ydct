define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
	var tpl                 = require('text!app/notifications/tpl/model.html'),
	template = _.template(tpl);

    return Gonrin.DialogView.extend({
		template : tpl,
    	render:function(){
			var self = this;
			// this.$el.html(template());
			// self.$el.find("#myModalNotify").modal("show");
    		var data = self.viewData;
    		if (data!== undefined && data !== null){
    			self.$el.find(".modal-title").html(data.title);
    			self.$el.find(".modal-body").html(data.content);	
    			if (data.url !== undefined && data.url !==null && data.url!==""){
					var navigate_url = data.url.split("#")[1];
					self.$el.find("#btn_detail").attr("href", "#"+ navigate_url);
					if (data.type == "call_video") {
						self.$el.find("#btn_detail").attr("target", "_blank");
					}
    				self.$el.find("#btn_detail").unbind('click').bind('click',function(){
						var href = self.$el.find("#btn_detail").attr("href");
						if (href == undefined || href == null || href == "") {
							if (data.url.indexOf("somevabe.com/chuyengiatuvan")>=0){
								if (data.url.indexOf("#")>=0){
									var navigate_url = data.url.split("#")[1];
									$(".modal").modal('hide');
									gonrinApp().getRouter().navigate(navigate_url);
									
								}else{
									window.open(data.url,"_self");
								}
							}else{
								window.open(data.url,"_self");
							}
							self.close();
						} else {
							self.close();
							// self.$el.find("#btn_close").click();
						}
    				});
    			}else{
    				self.$el.find("#btn_detail").hide();
    			}
			}
			self.$el.find("#btn_close").unbind('click').bind('click',function(){
				// self.$el.find("#myModalNotify").modal("hide");
				let type = data.type;
				if (type=== "logout"){
					self.close();
					gonrinApp().getRouter().navigate("logout");
				}
				else{
					self.close();
				}
    		});
			self.applyBindings();
    	},
    });

});