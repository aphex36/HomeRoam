 $(document).ready(function(){
    //zoom level for Google Map
    //Store the API Key for the use of the http request
    var GoogleMapView = {}
    var DEFAULT_ZOOM = 14;
    var STATUS_OK = 200;
    var key = "AIzaSyCms0eL6W2pdG-KmzLB07tZwIcdCS9cMO4";

    GoogleMapView.displayMap = function(url)
    {
      //Send an http request to get the coordinates using the geocoding API
      var httpObject = new XMLHttpRequest();
      httpObject.addEventListener('load', function()
      {
        //On the load, get the responseText (which should be the stringified JSON object)
        var result = httpObject.responseText
        var output = JSON.parse(result);

        //This will get the first location (or search term)
        firstObject = output.results;
        firstResult = firstObject[0];
        var error = false;
        function initializeMap(firstResult)
        {
          //If something failed (i.e. firstResult is null or something), just set the coordinates to (0,0)
          //Otherwise just get the coordinates from the parsed firstResult
          var latitude;
          var longitude;
          try
          {
            latitude = firstResult.geometry.location.lat;
            longitude = firstResult.geometry.location.lng;

            //Create the map and its marker, and stuff it in the map element
            var centerOfMap=new google.maps.LatLng(latitude,longitude);
            var mapSetUp = {
              center:centerOfMap,
              zoom:DEFAULT_ZOOM,
              mapTypeId:google.maps.MapTypeId.ROADMAP
            };

            var map = new google.maps.Map($(".map")[0], mapSetUp);

            var marker = new google.maps.Marker(
            {
              position: centerOfMap,
            });

            marker.setMap(map);
          }
          catch(err)
          {
            error = true;
            $(".map").html("<div class='error' style='text-align:center'> No location found </div>");
            $(".map").css({"border-style":"solid","border-color":"black"});
          }
        }

        //Call this only after the loading is done
        if(!error)
        {
          google.maps.event.addDomListener(window, 'load', initializeMap(firstResult));
        }
      });

      //Use the get request and send, which is received by the event listener above
      httpObject.open("GET", url);
      httpObject.send();
    }

    //Called when entryView's render is called
    //Display the map using the url
    //If the address is null, just display the default coordinates (shown earlier)
    GoogleMapView.render = function($map, entryData) {
        window.mapElement = $map;
        var addressOfEntry;
        try
        {
          addressOfEntry = entryData.address + "";
        }
        catch(err)
        {
          addressOfEntry = "";
        }
        var formattedAddress = addressOfEntry.split(" ").join("+");
        var url = "https://maps.googleapis.com/maps/api/geocode/json?address="+formattedAddress+"&key="+key;
        GoogleMapView.displayMap(url);
      }
    var $map = $(".map")[0];
    GoogleMapView.render($map, {address: "13535 aeffvadsfaew Road"});
});
