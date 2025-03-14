define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    var tpl                 = require('text!tpl/base/NotifyVersion.html');
    
    return Gonrin.DialogView.extend({
    	template : tpl,
    	render:function(){
    		var self = this;
			self.getApp().hideloading();
			console.log("ro rang co chay vao notify ios");
    		var currUser = self.getApp().currentUser;
    		if(currUser !== undefined && currUser!== null){
    			self.$el.find("#link_app").attr({"href":currUser.version.url_apple_store});
			}else{
				self.$el.find("#link_app").attr({'href':'https://itunes.apple.com/us/app/somevabe/id1258218759'});
			}
			self.applyBindings();
    	},
    });

});