// BufferLoader class ---------------------------------------------------------
function BufferLoader(context, urlList, callback) {
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = {};
  this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var loader = this;

  request.onload = function() {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          console.debug('error decoding file data: ' + url);
          return;
        }

        //Use the url as the key in the array.
        loader.bufferList[url] = buffer;
        // console.debug('BufferLoader: ' + loader.bufferList[url]);
        
        if (++loader.loadCount == loader.urlList.length)
          loader.onload(loader.bufferList);
      }
    );
  }

  request.onerror = function(e) {
    alert('BufferLoader: XHR error - ' + e);
  }

  request.send();
}

BufferLoader.prototype.load = function() {
	for (var i = 0; i < this.urlList.length; ++i)
  {
    var path = this.urlList[i];
    // Check if an array was passed in. If so, load each one in.
    if( path instanceof Array)
    {
      for(var k = 0; k < path.length; ++k)
      {
        this.loadBuffer(path[k], i+k);
        i = i+k;
      }
    }
    else 
    {
      this.loadBuffer(path, i);
    }
		
  }
}
// end BufferLoader Class