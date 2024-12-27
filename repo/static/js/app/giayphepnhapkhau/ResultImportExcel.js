define(function (require) {
    "use strict";
    var $ = require("jquery"),
      _ = require("underscore"),
      Gonrin = require("gonrin"),
      tpl = require("text!app/giayphepnhapkhau/tpl/result.html");
    return Gonrin.ModelDialogView.extend({
      template: tpl,
      modelSchema: {},
      render: function () {
        var self = this;
        var viewData = self.viewData;
        if(!!viewData && !!viewData.listFailed){
          var listFailed = viewData.listFailed;
          var countCreate = viewData.countCreate;
          var countUpdate = viewData.countUpdate;
          var total_html = `<span class="font-weight-bold" style="font-size: 18px">Tổng số tạo mới: <span class="text-danger">${countCreate}</span>. Tổng số cập nhật: <span class="text-danger">${countUpdate}</span>. Tổng số thất bại: <span class="text-danger">${listFailed.length}</span></span>`
          self.$el.find('#total').append(total_html);
  
          var result_html = listFailed.map((item, index)=>{
            return `<tr><td>${item.index}</td> <td><span class="text-primary">${item.lydo}</span></td></tr>`;
          });
          self.$el.find('#result').append(result_html)
        }
        self.applyBindings();
      },
      
    });
  });
  