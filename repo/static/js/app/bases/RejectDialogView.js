define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');
    return Gonrin.ModelDialogView.extend({
        template: `
        <div class="row">
            <div class="col-12">
                <h3 class="page-title text-uppercase text-center text-primary">Xác nhận</h3>
            </div>
            <hr>
        </div>
        <div class="row py-3">
            <div class="form-group col-12 content-deny">
            
            </div>
        </div>
        <div class="row">
            <div class="form-group col-12">
                <button type="button" class="btn btn-secondary btn-close">Từ chối</button>
                <button type="button" class="btn btn-success confirm">Đồng ý</button>
            </div>
        </div>`,
        modelSchema: {},
        render: function () {
            var self = this;
            var viewData = self.viewData;

            if(!!viewData && !!viewData.text){
                self.$el.find('.content-deny').text(viewData.text);                
            }
            self.$el.find("button.btn-close").unbind("click").bind("click",function(){
                self.trigger("close");
                self.close();
            });
            self.$el.find("button.confirm").unbind("click").bind("click",function(){
                self.trigger("confirm");
                self.close();
            });
        },
    });

});