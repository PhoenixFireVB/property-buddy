var config = {};

function getFeaturesForLocation(position) {

  console.log("Checking features for position:");
  console.log(position);

  var ll = [position.coords.longitude, position.coords.latitude];
  //var ll = [-76.195987, 36.893076]; // NFK

  d3.json(config.Norfolk.boundary, function(error, mapData) {
    console.log("Checking " + ll + " in NFK");
    var features = mapData.features[0];
    if (d3.geoContains(features, ll)) {
      console.log("Location is NFK");
      var msg = "<p>You are in Norfolk</p>";
      d3.select("#location").html(msg);
      checkAICUZ(config.Norfolk.AICUZ, ll, "NFK");
      checkFloodZone_NFK(ll);
    } else {
      console.log("Location is not in NFK")
    }
  });

  d3.json(config.VirginiaBeach.boundary, function(error, mapData) {
    console.log("Checking " + ll + " in VB");
    var features = mapData.features[0];
    if (d3.geoContains(features, ll)) {
      console.log("Location is VB");
      var msg = "<p>You are in Virginia Beach</p>";
      d3.select("#location").html(msg);
      checkAICUZ(config.VirginiaBeach.AICUZ, ll);
      checkFloodZone(config.VirginiaBeach.FIRM, ll);
    } else {
      console.log("Location is not in VB")
    }
  });

}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getFeaturesForLocation);
  } else {
    d3.select("body").append("span")
      .text("Geolocation is not supported by this browser.");
  }
}

function checkAICUZ(url, ll) {
  d3.request(url)
    .mimeType("application/json")
    .response(function(xhr) {
      return JSON.parse(xhr.responseText);
    })
    .get(function(data) {

      var msg = "<p class='preamble'>AICUZ Noise Zone:</p>";

      var z = checkFeaturesForAICUZNoiseLevel(data.features, ll);

      msg += z;

      d3.select("#aicuz").html(msg);

    });
}

// TODO: update from 2009 to 2015. Something wrong with the 2015 API
function checkFloodZone(url, ll) {
  var LL = L.latLng(ll[1],ll[0]);
  // use location to find out which census block they are inside.
    L.esri.query({
      url: url
    }).intersects(LL).run(function(error, floodZones){
      var msg = "<p class='preamble'>Flood Zone (2015)</p>";

      msg += checkFeaturesForFloodZone(floodZones.features, ll, "VB");

      d3.select("#flood").html(msg);

    });
}

function checkFeaturesForAICUZNoiseLevel(features, ll) {
  var msg = "";
  var lvl = 0;
  $(features).each(function() {
    var f = $(this);
    if (f && f[0]) {
      if (d3.geoContains(f[0], ll)) {
        if (f[0].properties.NOISE_LEV_) {
          lvl = parseInt(f[0].properties.NOISE_LEV_);
        } else if (f[0].properties.ZONE_) {
          lvl = parseInt(f[0].properties.ZONE_);
        } else {
          lvl = 0;
        }
        return lvl;
      }
    }
  });

  msg += "<p class='aicuz'>" + lvl + "</p>";


  switch (lvl) {
    case 0: {
      d3.select("#aicuz").classed("_0", true);
    }
    case 50:
      {
        d3.select("#aicuz").classed("_50", true);
      }
      break;
    case 55:
      {
        d3.select("#aicuz").classed("_55", true);
      }
      break;
    case 60:
      {
        d3.select("#aicuz").classed("_60", true);
      }
      break;
    case 65:
      {
        d3.select("#aicuz").classed("_65", true);
      }
      break;
    case 70:
      {
        d3.select("#aicuz").classed("_70", true);
      }
      break;
    case 75:
      {
        d3.select("#aicuz").classed("_75", true);
      }
      break;
    case 80:
      {
        d3.select("#aicuz").classed("_80", true);
      }
      break;
    case 85:
      {
        d3.select("#aicuz").classed("_85", true);
      }
      break;
  }

  return msg;
}

function checkFeaturesForFloodZone(features, ll, city) {
  var msg = "";
  var lvl = 0;
  $(features).each(function() {
    var f = $(this);
    if (f && f[0]) {
      if (d3.geoContains(f[0], ll)) {
        var fz = f[0].properties.FLD_ZONE;
        msg += "<p class='flood'>" + fz + "</p>";
        return;
      }
    }
  });
  return msg;
}

$(document).ready(function() {
  config = JSON.parse($("#config").val());
  getLocation();
})
