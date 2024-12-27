define(function (require) {
    "use strict";
    var $ = require("jquery"),
      _ = require("underscore"),
      Gonrin = require("gonrin"),
      tpl = require("text!app/giaychungnhanco/tpl/warning.html");
    return Gonrin.ModelDialogView.extend({
      template: tpl,
      modelSchema: {},
      render: function () {
        var self = this;
        var viewData = self.viewData;
        if(!!viewData ){
            if (Array.isArray(viewData)=== false){
                viewData = [];
            }
  
          var result_html = viewData.map((item, index)=>{
            return `<tr><td>${item.id}</td> <td><span>${gonrinApp().parseInputDateString(item.thoigian_nhap).format('DD/MM/YYYY')}</span></td></tr>`;
          });
          self.$el.find('#result').append(result_html)
        }
        self.applyBindings();
      },
      
    });
  });
  