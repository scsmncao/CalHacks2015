google.load('visualization', '1', {'packages': ['geochart']});
$(document).ready(function() {
  google.setOnLoadCallback(drawMap);
  
  function drawMap() {

    var data = new google.visualization.DataTable();

    data.addColumn('number', 'latitude');                                
    data.addColumn('number', 'longitude');
    data.addColumn('string', 'name'); 
    data.addColumn('number', 'value', 'value'); 
    data.addColumn({type:'string', role:'tooltip'});
    for (i = 1; i < 2; i++) {
      $.ajax({
        url: "http://api.kivaws.org/v1/loans/newest.json?page=" + i.toString(),
        success: function(result) {
          var loanList = result['loans'];
          _.each(loanList, function(loan) {
              geoCoord = loan['location']['geo']['pairs'];
              geoCoord = geoCoord.split(" ");
              latitude = parseFloat(geoCoord[0]);
              longitude = parseFloat(geoCoord[1]);
              data.addRows([[latitude, longitude, loan['name'], parseInt(loan['id']), loan['use']]]);
          });
        },
        async: false
      });
    }

    var options = {
      displayMode: 'markers', 
      legend: 'none',
      enableRegionInteractivity: 'true',
      backgroundColor: '#73CBFF',
      sizeAxis: {minSize:5,  maxSize: 5},
      colorAxis: {minValue: 1, maxValue:1,  colors: ['#B92B3D']

    }
  };

  var chart = new google.visualization.GeoChart(document.getElementById('chart_div'));

  google.visualization.events.addListener(chart, 'select', function() {
      var selectionIdx = chart.getSelection()[0].row;
      var markerName = data.getValue(selectionIdx, 2);
      var id = data.getValue(selectionIdx, 3);
      $.ajax({
        url:"http://api.kivaws.org/v1/loans/" + id.toString() + ".json",
        success: function(result) {
          $(".info").empty();
          appendUserInfo(result);
        },
        async: false
      });
  });
  
  chart.draw(data, options);
  };
  function appendUserInfo(result) {
    var loan = result['loans'][0];
    $(".info").append("<div class=\"user-image\"><img src=\"http://www.kiva.org/img/w200h200/" + loan['image']['id'] + ".jpg\"></img></div>");
    $(".info").append("<div class=\"name\">" + loan['name'] + "</div>");
    $(".info").append("<div class=\"town-country\">" + loan['location']['town'] + ", " + loan['location']['country'] + "</div>");
    $(".info").append("<div class=\"use\">" + loan['use'] + "</div>");
  }
});