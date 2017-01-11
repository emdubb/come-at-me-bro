$(document).ready(function(){
  var canvasArray = [];
  var zip = new JSZip();
  $("#fileUpload").change(function(){
    zip.folder("export");
    formatFiles(this, function(){
      exportFiles()
    });
  })

  function formatFiles(that, callback){
    $("#downsample50-file-type-error").hide();
    $("#downsample50success").text("");
    var files = that.files
    console.log(files)
    for (var i = 0; i < files.length; i++) {
      (function(file) {
        console.log(file.type)
        if (file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/svg+xml") {
          var reader = new FileReader();

          reader.onload = function(event) {
            var name = file.name
            var url = event.target.result;

            var img = new Image();
            img.src = url;
            img.width = img.width / 2
            img.height = img.height / 2

            var canvas = document.getElementById("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, img.width, img.height)

            canvas.toBlob(function(blob){
              zip.file("export/" + name, blob);
              canvasArray.push(blob)
              if (canvasArray.length === files.length) {
                callback && callback();
              }
            })

          }
        } else {
          $("#downsample50-file-type-error").show();
        }
        reader.readAsDataURL(file);
      })(files[i]);
    }
  }

  function exportFiles(){
    zip.generateAsync({type:"blob"})
      .then(function(content) {
          saveAs(content, "export.zip");
          console.log("finished!")
          var message = "Your files were successfully exported and should download automatically. If you do not see them, please refresh and try again.";
          $("#downsample50success").append(message);
          // Reset everything to use again
          var canvasArray = [];
          var zip = new JSZip();
      });
  }


})
