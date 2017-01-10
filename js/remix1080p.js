$(document).ready(function(){
  var counter = 0;
  var canvasArray = [];
  var malformedRatios = [];
  var zip = new JSZip();
  zip.folder("export");
  $("#remix1080FileUpload").change(function(){
    formatFiles(this, function(){
      exportFiles()
    });
  })

  function formatFiles(that, callback){
    $("#remix1080error").text("")
    var files = that.files
    console.log(files)
    for (var i = 0; i < files.length; i++) {
      (function(file) {
        console.log(file.type)
        if (file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/svg+xml") {
          var reader = new FileReader();

          reader.onload = function(event) {
            var error
            var splitName = file.name.split('.');
            var fileExtension = splitName.pop();
            var name = splitName.join('.') + "_thumbnail." + fileExtension;

            console.log("SPLIT: ", name)
            var url = event.target.result;

            var img = new Image();
            img.src = url;
            var ratio = parseFloat((img.width/img.height).toFixed(5))

            if (ratio == 0.66964) {
              console.log("valid movie ratio");
              img.width = 300
              img.height = 448
            } else if (ratio == 1) {
              console.log("valid audio ratio");
              img.width = 300
              img.height = 300
            } else {
              console.log("invalid ratio", ratio)
              malformedRatios.push(file.name);
              console.log("MALFORMED: ", malformedRatios);
              var error = true;
            }

            var canvas = document.getElementById("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, img.width, img.height)

            canvas.toBlob(function(blob){
              zip.file("export/" + name, blob);
              canvasArray.push(blob)
              if (canvasArray.length === files.length) {
                if (error == true) {
                  message = "<p>The following files were an improper ratio and were unable to be downsized: <em>" + malformedRatios.join(', '); + "</em></p>"
                } else {
                  message = ""
                }
                $("#remix1080error").append("<p>" + message + "</p>");
                callback && callback();
              }
            })

          }
        } else {
          $("#remix1080error").append("<p>The uploaded file type is not supported! Only JPG, PNG, and SVG images are supported.</p>" );
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
      });
  }


})
