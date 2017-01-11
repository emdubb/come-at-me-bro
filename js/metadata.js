$(document).ready(function(){
  var canvasArray = [];
  var malformedRatios = [];
  var zip = new JSZip();
  $("#remix1080FileUpload").change(function(){
    zip.folder("Remix1080p");
    var that = this;
    formatFiles(this, "Remix1080p/thumbnail/", 300, 448, "_thumbnail@2x", "Remix1080", function(){
      canvasArray = [];
      malformedRatios = [];
      formatFiles(that, "Remix1080p/posters/", 600, 896, "_posters@2x", "Remix1080", function(){
        exportFiles("Remix1080")
      });
    });
  });

  $("#remix720FileUpload").change(function(){
    zip.folder("Remix720p");
    var that = this;
    formatFiles(this, "Remix720p/thumbnail/", 150, 224, "_thumbnail", "Remix720", function(){
      canvasArray = [];
      malformedRatios = [];
      formatFiles(that, "Remix720p/posters/", 300, 448, "_posters", "Remix720", function(){
        exportFiles("Remix720")
      });
    });
  });

  $("#wirelessFileUpload").change(function(){
    zip.folder("Wireless");
    var that = this;
    formatFiles(this, "Wireless/thumbnail/", 750, 448, "_thumbnail", "Wireless", function(){
      canvasArray = [];
      malformedRatios = [];
      formatFiles(that, "Wireless/posters/", 750, 1120, "_posters", "Wireless", function(){
        exportFiles("Wireless")
      });
    });
  });

  function formatFiles(that, path, exportWidth, exportHeight, nameExtension, system, callback){
    switch (system) {
      case "Remix1080":
        $("#remix1080error").text("");
        $("#remix1080success").text("");
        break;
      case "Remix720":
        $("#remix720error").text("");
        $("#remix720success").text("");
        break;
      case "Wireless":
        $("#wirelessError").text("");
        $("#wirelessSuccess").text("");
        break;
    }
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
              var message
              if (canvasArray.length === files.length) {
                if (error == true) {
                  message = "<p>The following files were an improper ratio and were unable to be downsized: <em>" + malformedRatios.join(', '); + "</em></p>"
                } else {
                  message = ""
                }
                switch (system) {
                  case "Remix1080":
                    $("#remix1080error").append("<p>" + message + "</p>");
                    break;
                  case "Remix720":
                    $("#remix720error").append("<p>" + message + "</p>");
                    break;
                  case "Wireless":
                    $("#wirelesserror").append("<p>" + message + "</p>");
                    break;
                }
                callback && callback();
              }
            })

          }
        } else {
          var message = "<p>The uploaded file type is not supported! Only JPG, PNG, and SVG images are supported.</p>"
          switch (system) {
            case "Remix1080":
              $("#remix1080success").append(message);
              break;
            case "Remix720":
              $("#remix720success").append(message);
              break;
            case "Wireless":
              $("#wirelessSuccess").append(message);
              break;
          }
        }
        reader.readAsDataURL(file);
      })(files[i]);
    }
  }

  function exportFiles(system){
    zip.generateAsync({type:"blob"})
      .then(function(content) {
          saveAs(content, system + ".zip");
          console.log("finished!");
          var message = "Your files were successfully exported and should download automatically. If you do not see them, please refresh and try again.";
          switch (system) {
            case "Remix1080":
              $("#remix1080success").append(message);
              break;
            case "Remix720":
              $("#remix720success").append(message);
              break;
            case "Wireless":
              $("#wirelessSuccess").append(message);
              break;
          }
          // Reset everything to use again
          canvasArray = [];
          malformedRatios = [];
          zip = new JSZip();
      });
  }


})
