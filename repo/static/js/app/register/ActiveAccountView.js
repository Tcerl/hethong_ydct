define(function(require) {

    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin'),
        storejs = require('vendor/store'),
        tpl = require('text!app/register/tpl/activate.html'),
        template = _.template(tpl);
    var ResetPasswordView = require("app/bases/ResetPasswordView");
    return Gonrin.View.extend({
        render: function() {
            var self = this;
            this.$el.html(template());
            var Array_id = ["one", "two", "three", "four", "five", "six"];
            Array_id.forEach((item, index) => {
                self.$el.find("#" + item).on('keyup touchend', function() {
                    var input_number = self.$el.find("#" + item);
                    if (input_number.val().length >= input_number.data("maxlength")) {
                        if (input_number.val().length > input_number.data("maxlength")) {
                            input_number.val(input_number.val().substring(0, 1));
                        }
                        if (index != 6) {
                            self.$el.find("#" + Array_id[index + 1]).focus();
                        }
                    }
                });
            });
            this.$el.find("#resend_email").unbind("click").bind("click", function() {
                var uid = self.getApp().getParameterUrl("uid");
                var data = JSON.stringify({
                    uid: uid
                });

                self.getApp().showloading();

                var path = self.getApp().serviceURL + '/api/v1/register/resend-email';
                if (gonrinApp().getRouter().currentRoute().route === "confirm_changepass") {
                    path = self.getApp().serviceURL + '/api/v1/forgotpass/resend-email';
                }
                $.ajax({
                    url: path,
                    type: 'POST',
                    data: data,
                    headers: {
                        'content-type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    dataType: 'json',
                    success: function(data) {
                        var one = self.$el.find("#one").val('');
                        var two = self.$el.find("#two").val('');
                        var three = self.$el.find("#three").val('');
                        var four = self.$el.find("#four").val('');
                        var five = self.$el.find("#five").val('');
                        var six = self.$el.find("#six").val('');
                        self.getApp().notify({ message: "Gửi email thành công" }, { type: "info", delay: 2000 });

                    },
                    error: function(xhr, status, error) {
                        try {
                            self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 2000 });
                        } catch (err) {
                            self.getApp().notify({ message: "Có lỗi xảy ra, vui lòng thử lại sau" }, { type: "danger", delay: 2000 });
                        }
                    },
                    complete: function() {
                        self.getApp().hideloading();
                        return false;
                    }
                });
                return false;
            });
            self.$el.find("#button-forgot-password").unbind("click").bind("click", function() {
                self.process();
                return false;
            });
            this.$el.find("#back").unbind("click").bind("click", function() {
                self.getApp().getRouter().navigate("login")
                return false;
            });
            return this;
        },
        process: function() {
            var self = this;
            var one = self.$el.find("#one").val();
            var two = self.$el.find("#two").val();
            var three = self.$el.find("#three").val();
            var four = self.$el.find("#four").val();
            var five = self.$el.find("#five").val();
            var six = self.$el.find("#six").val();

            if (one === "" || two === "" || three === "" || four === "" || five === "" || six === "") {
                self.getApp().notify({ message: "Vui lòng nhập đầy đủ 6 số" }, { type: "danger", delay: 2000 });
                return false;
            }
            var str_active = '' + one + two + three + four + five + six;
            var uid = self.getApp().getParameterUrl("uid");
            var data = JSON.stringify({
                active: str_active,
                uid: uid
            });

            self.getApp().showloading();
            var path = self.getApp().serviceURL + '/api/v1/register/active';
            if (gonrinApp().getRouter().currentRoute().route === "confirm_changepass") {
                path = self.getApp().serviceURL + '/api/v1/forgotpass/active';
            }
            $.ajax({
                url: path,
                type: 'POST',
                data: data,
                headers: {
                    'content-type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                dataType: 'json',
                success: function(data) {

                    if (gonrinApp().getRouter().currentRoute().route === "confirm_changepass") {
                        self.getApp().notify({ message: "Xác nhận thành công" }, { delay: 2000 });
                        var view = new ResetPasswordView({ el: $('#contaner-template'), viewData: { "id": data.id, "active": str_active } });
                        view.render();
                    }
                    //  else {
                    //     self.getApp().notify({ message: "Kích hoạt thành công" }, { delay: 2000 });
                    //     $.ajaxSetup({
                    //         headers: {
                    //             'X-USER-TOKEN': data.token
                    //         }
                    //     });
                    //     storejs.set('X-USER-TOKEN', data.token);
                    //     self.getApp().postLogin(data);
                    // }

                },
                error: function(xhr, status, error) {
                    try {
                        self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger", delay: 2000 });
                    } catch (err) {
                        self.getApp().notify({ message: "Có lỗi xảy ra, vui lòng thử lại sau" }, { type: "danger", delay: 2000 });
                    }
                },
                complete: function() {
                    self.getApp().hideloading();
                    return false;
                }
            });
        },

    });

});