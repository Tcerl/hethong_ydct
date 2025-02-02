define(function(require) {
	"use strict";
	var $                   = require('jquery'),
    _                   	= require('underscore'),
    Gonrin					= require('gonrin');

	var filterschema = {
		"text": {
		    "type": "string"
		},
	};
	
	return Gonrin.FilterView.extend({
    	template : `<div class="search-collection"><input type="text" filter-bind="value:text" placeholder="Tìm kiếm..." class="form-control"></div>`,
    	modelSchema	: filterschema,
    	urlPrefix: "/api/v1/",
    	collectionName: "filter",
    	sessionKey : "filter",
    	bindings: 'filter-bind',
    	uiControl:[
			{
				  field: "text",
			}
    	],

    	render:function() {
    		var self = this;
    		//session here
    		// this.getDataFromSession();
    		this.applyBindings();
    		
    		self.model.on("change", function() {
    			self.triggerFilter();
    		});
    		
    		var $textEl = self.getFieldElement("text");
			var timer = null;
			if ($textEl !== null) {
				$textEl.unbind("keyup").bind("keyup", function($event) {
					timer = setTimeout(function() {
						var val = $textEl.val();
						self.model.set("text", val);
					}, 700);
				});
	
				$textEl.unbind("keypress").bind("keypress", function($event) {
					if (timer) {
						clearTimeout(timer);
					}
				});
			}
		},
		isEmptyFilter:function(){
			var self = this;
			var text = self.model.get("text");
			if(text === undefined || text === "" || text === null){
				return true;
			}
			return false;
		}
    });
});