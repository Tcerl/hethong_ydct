define(function (require) {
    "use strict";
    var $ = require("jquery"),
      _ = require("underscore"),
      Gonrin = require("gonrin"),
      tpl = require("text!app/giaychungnhanco/tpl/resultsaveco.html");
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
            return `<tr>
                        <td>${item.ten_duoclieu?item.ten_duoclieu:""}</td> 
                        <td><span>${item.ma_HS?item.ma_HS:""}</span></td>
                        <td><span>${item.ma_HS? Number(item.soluong).toLocaleString("de-DE"):""}</span></td>
                    </tr>`;
          });
          self.$el.find('#result').append(result_html)
        }
        self.applyBindings();
      },
      
    });
  });
  