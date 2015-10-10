// $(document).ready(function() {
//   $.getScript("https://www.google.com/jsapi", function() {
//     console.log("got google visualization");
//   });

//   google.load('visualization', '1', {'packages': ['geochart']});
//   google.setOnLoadCallback(drawMap);
  
//   function drawMap() {

//     var data = new google.visualization.DataTable();

//     data.addColumn('number', 'latitude');                                
//     data.addColumn('number', 'longitude');
//     data.addColumn('string', 'name'); 
//     data.addColumn('number', 'value:', 'value'); 
//     data.addColumn({type:'string', role:'tooltip'});
//     $.ajax({
//       url: "http://api.kivaws.org/v1/loans/newest.json",
//       success: function(result) {
//         var loanList = result['loans'];
//         _.each(loanList, function(loan) {
//             geoCoord = loan['geo']['pairs'];
//             geoCoord = geoCoord.split(" ");
//             latitude = parseInt(geoCoord[0]);
//             longitude = parseInt(geoCoord[1]);
//             data.addRows([[latitude, longitude, loan['name'], 0, loan['fundraising']]]);
//         });
//       }
//     });

//     var options = {
//       displayMode: 'markers', 
//       legend: 'none',
//       enableRegionInteractivity: 'true',

//       sizeAxis: {minSize:5,  maxSize: 5},
//       colorAxis: {minValue: 1, maxValue:1,  colors: ['#B92B3D']

//     }
//   };

//   var chart = new google.visualization.GeoChart(document.getElementById('chart_div'));

//   google.visualization.events.addListener(chart, 'select', function() {
//       var selectionIdx = chart.getSelection()[0].row;
//       var markerName = data.getValue(selectionIdx, 2);
//       console.log("you have selected " + markerName);
//   });
  
//   chart.draw(data, options);
//   };
// });