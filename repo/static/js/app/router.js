define(function(require) {

    "use strict";

    var $ = require('jquery'),
        Gonrin = require('gonrin');
    //        storejs		= require('store');
    var Login = require('app/login/LoginView');
    // var RegisterView = require('app/register/RegisterView');
    // var ActiveAccountView = require('app/register/ActiveAccountView');
    // // var HomeView	= require('app/home/HomeView');
    // // var RecorverAccountView	= require('app/view/HeThong/User/RecoverXaPhuong/view/RecoverXaPhuongView');
    var ForgotPasswordView = require('app/bases/ForgotPasswordView');
    var navdata = require('app/bases/Nav/route');

    return Gonrin.Router.extend({
        routes: {
            "index": "index",
            "login": "login",
            "logout": "logout",
            "forgot": "forgotPassword",
            "register": "register",
            "confirm-active": "confirm_active",
            "confirm-changepass": "confirm_changepass",
            // "home":"home_page",
            "switch/menungang" : "switch_ticket",
            "switch/menudoc" : "switch_quanlycanbo",
            "error": "error_page",
            "*path": "defaultRoute"
        },
        defaultRoute: function() {

        },
        index: function() {},
        switch_ticket: function () {
            var self = this;
            var currentUser = gonrinApp().currentUser;
            if (currentUser) {
                self.getApp().renderTicketLayout(currentUser);
            }
            // self.getApp().renderTicketLayout();
        },
        switch_quanlycanbo: function () {
            var self = this;
            var currentUser = gonrinApp().currentUser;
            console.log("cu", currentUser);
            if (currentUser) {
                self.getApp().renderTplMenuDoc(currentUser);
            }
        },
        logout: function() {
            var self = this;
            $.ajax({
                url: self.getApp().serviceURL + '/logout',
                dataType: "json",
                success: function(data) {
                    gonrinApp().getRouter().navigate("login");
                    self.getApp().currentUser = null;
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    console.log(self.getApp().translate("LOGOUT_ERROR"));
                    self.getApp().currentUser = null;
                    var loginview = new Login({ el: $('.content-contain') });
                    loginview.render();
                },
            });
        },
        error_page: function() {
            var app = this.getApp();
            if (app.$content) {
                app.$content.html("Error Page");
            }
            return;
        },
        login: function() {
            var loginview = new Login({ el: $('#contaner-template') });
            loginview.render();
        },
        register: function() {
            var registerView = new RegisterView({ el: $('#contaner-template') });
            registerView.render();
        },
        confirm_active: function() {
            var view = new ActiveAccountView({ el: $('#contaner-template') });
            view.render();
        },
        confirm_changepass: function() {
            console.log("active account");
            var view = new ActiveAccountView({ el: $('#contaner-template') });
            view.render();
        },
        // home_page: function(){
        // 	var view = new HomeView({el: $('.content-contain')});
        // 	view.render();
        // },

        forgotPassword: function() {
            var recoverView = new ForgotPasswordView({ el: $('#contaner-template') });
            recoverView.render();
        },
        registerAppRoute: function(){
            var self = this;
            $.each(navdata, function(idx, entry){
                var entry_path = _.result(entry,'route');
                // console.log("self.getApp().$content====",self.getApp().$content);
                // console.log("entry['$ref']=======",entry_path);
                // if (self.getApp().$content == undefined || self.getApp().$content.length ==0){
                //     self.getApp().$content = $("#contaner-template");
                // }
                self.route(entry_path, entry.collectionName, function(){
                    require([ entry['$ref'] ], function ( View) {
                        var view = new View({el: self.getApp().$content, viewData:entry.viewData});
                        view.render();
                    });
                });
            });
            Backbone.history.start();
        },
    });

});