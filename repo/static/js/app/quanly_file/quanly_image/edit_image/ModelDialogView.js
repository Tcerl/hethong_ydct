define(function (require) {
  "use strict";
  var $ = require('jquery'),
    _ = require('underscore'),
    Gonrin = require('gonrin');

  var template = require('text!app/quanly_file/quanly_image/edit_image/tpl/model_dialog.html');
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
            command: function () {
              var self = this;
              self.close()
            }
          },
        ]
      },
      // {
      //   name: "save",
      //   type: "button",
      //   buttonClass: "btn-success width-sm ml-2",
      //   label: `<i class="far fa-save"></i> Lưu`,
      //   command: function () {
      //     var self = this;

      //     self.close();
      //   }
      // },
    ],
    render: function () {
      var self = this;
      var curUser = self.getApp().currentUser;
      if (curUser) {
        self.applyBindings();

        var viewData = self.viewData;

        self.editImage(viewData.url_file);

        return this;
      }
    },
    editImage: function (url_file) {
      var self = this;
      const config = {
        source: url_file,
        onSave: (editedImageObject, designState) => {
          self.upload(editedImageObject);
        },
        annotationsCommon: {
          fill: '#ff0000'
        },
        Text: { text: 'Filerobot...' },
        translations: {
          profile: 'Profile',
          coverPhoto: 'Cover photo',
          facebook: 'Facebook',
          socialMedia: 'Social Media',
          fbProfileSize: '180x180px',
          fbCoverPhotoSize: '820x312px',
        },
        Crop: {
          presetsItems: [
            {
              titleKey: 'classicTv',
              descriptionKey: '4:3',
              ratio: 4 / 3,
              // icon: CropClassicTv, // optional, CropClassicTv is a React Function component. Possible (React Function component, string or HTML Element)
            },
            {
              titleKey: 'cinemascope',
              descriptionKey: '21:9',
              ratio: 21 / 9,
              // icon: CropCinemaScope, // optional, CropCinemaScope is a React Function component.  Possible (React Function component, string or HTML Element)
            },
            {
              titleKey: 'chinhnv',
              descriptionKey: '8:5',
              ratio: 8 / 5,
              // icon: CropClassicTv, // optional, CropClassicTv is a React Function component. Possible (React Function component, string or HTML Element)
            },
          ],
          presetsFolders: [
            {
              titleKey: 'socialMedia', // will be translated into Social Media as backend contains this translation key
              // icon: Social, // optional, Social is a React Function component. Possible (React Function component, string or HTML Element)
              groups: [
                {
                  titleKey: 'facebook',
                  items: [
                    {
                      titleKey: 'profile',
                      width: 180,
                      height: 180,
                      descriptionKey: 'fbProfileSize',
                    },
                    {
                      titleKey: 'coverPhoto',
                      width: 820,
                      height: 312,
                      descriptionKey: 'fbCoverPhotoSize',
                    },
                  ],
                },
              ],
            },
          ],
        },
        savingPixelRatio: 1,
        tabsIds: ['Adjust', 'Annotate', 'Watermark', 'Finetune', 'Filters', 'Annotate', 'Resize'], // or ['Adjust', 'Annotate', 'Watermark']
        defaultTabId: "Annotate", // or 'Annotate'
        defaultToolId: "Text", // or 'Text'
      };

      // Assuming we have a div with id="editor_container"
      const filerobotImageEditor = new FilerobotImageEditor(
        self.$el.find('#editor_container')[0],
        config
      );

      filerobotImageEditor.render({
        onClose: (closingReason) => {
          console.log('Closing reason', closingReason);
          filerobotImageEdtior.terminate();
        }
      });
    },
    urltoFile: function (url, filename, mimeType) {
      return (fetch(url)
        .then(function (res) { return res.arrayBuffer(); })
        .then(function (buf) { return new File([buf], filename, { type: mimeType }); })
      );
    },
    upload: function (editedImageObject) {
      var self = this;
      self.urltoFile(editedImageObject.imageBase64, editedImageObject.fullName, editedImageObject.mimeType).then(function (file) {
        if (file.name != "" && file.name != null) {
          self.function_upload_file(self, file);
        }
      });
    },
    function_upload_file: function(model, result) {
      // var self = this;
      model.getApp().showloading();
      var http = new XMLHttpRequest();
      var fd = new FormData();
      fd.append('file', result, result.name);
      fd.append('type_file', "1");

      // fd.append('user_id', gonrinApp().currentUser.id);
      // fd.append('domain', gonrinApp().serviceURL);
      // fd.append('path_api', "/api/v1/current_user");

      // var url = gonrinApp().domain_upload_url + '/api/v1/' + gonrinApp().prefix_url_file;
      var url = gonrinApp().serviceURL + '/api/v1/upload';
      http.open('POST', url);

      var token = !!gonrinApp().currentUser ? gonrinApp().currentUser.token : null;
      http.setRequestHeader("X-USER-TOKEN", token);

      // http.upload.addEventListener('progress', function(evt) {
      //     if (evt.lengthComputable) {
      //         var percent = evt.loaded / evt.total;
      //         percent = parseInt(percent * 100);
      //     }
      // }, false);
      
      http.addEventListener('error', function(r) {
          model.getApp().hideloading();
          model.getApp().notify("Không tải được file lên hệ thống");
      }, false);

      http.onreadystatechange = function() {
          model.getApp().hideloading();
          
          if (http.status === 200) {
              if (http.readyState === 4) {

                  var data_file = JSON.parse(http.responseText);
                  var data = {
                      "id": data_file.id,
                      "name": data_file.name,
                      "type": data_file.extname,
                      "link": data_file.link
                  };
                  model.trigger('success', data);
                  model.close();
              }
          } else {
              model.getApp().notify("Không thể tải file lên hệ thống");
          }
      };
      http.send(fd);
    },
  });
});