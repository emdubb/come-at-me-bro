$(document).ready(function(){
  var canvasArray = [];
  var malformedRatios = [];
  var zip = new JSZip();
  zip.folder("Remix1080p");
  $("#remix1080FileUpload").change(function(){
    console.log('dat export', this)
    var that = this;
    formatFiles(this, "Remix1080p/thumbnail/", 300, 448, "_thumbnail", function(){
      canvasArray = [];
      malformedRatios = [];
      formatFiles(that, "Remix1080p/posters/", 600, 896, "_posters", function(){
        exportFiles()
      });
    });
  })

  function formatFiles(that, path, exportWidth, exportHeight, nameExtension, callback){
    $("#remix1080error").text("");
    $("#remix1080success").text("");
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
            var name = splitName.join('.') + nameExtension + "." + fileExtension;

            var url = event.target.result;

            var img = new Image();
            img.src = url;
            var ratio = parseFloat((img.width/img.height).toFixed(5))

            if (ratio == 0.66964) {
              console.log("valid movie ratio");
              img.width = exportWidth
              img.height = exportHeight
            } else if (ratio == 1) {
              console.log("valid audio ratio");
              img.width = exportWidth
              img.height = exportWidth
            } else {
              img.width = img.width
              img.height = img.height
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
              zip.file(path + name, blob);
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
          saveAs(content, "Remix1080p.zip");
          console.log("finished!")
          $("#remix1080success").append("Your files were successfully exported and should download automatically. If you do not see them, please refresh and try again.")
          // Reset everything to use again
          canvasArray = [];
          malformedRatios = [];
          zip = new JSZip();
          zip.folder("Remix1080p");
      });
  }


})
