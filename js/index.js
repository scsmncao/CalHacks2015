google.load('visualization', '1', {'packages': ['geochart', 'corechart']});
$(document).ready(function() {
  google.setOnLoadCallback(drawMap);
  var chart;
  var data;
  var options;
  document.getElementById("go").onclick = showLender;
  function drawMap() {

    data = new google.visualization.DataTable();

    data.addColumn('number', 'latitude');                                
    data.addColumn('number', 'longitude');
    data.addColumn('string', 'name');
    data.addColumn('number', 'color'); 
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
              data.addRows([[latitude, longitude, loan['name'], 2, parseInt(loan['id']), loan['use']]]);
          });
        },
        async: false
      });
    }

    options = {
      displayMode: 'markers', 
      legend: 'none',
      enableRegionInteractivity: 'false',
      backgroundColor: '#73CBFF',
      sizeAxis: {minSize:5,  maxSize: 5},
      colorAxis: {minValue: 1, maxValue:3,  colors: ['#00853f', '#e31b23']}
    };

  chart = new google.visualization.GeoChart(document.getElementById('chart_div'));

  google.visualization.events.addListener(chart, 'select', function() {
      var selectionIdx = chart.getSelection()[0].row;
      var markerName = data.getValue(selectionIdx, 2);
      var id = data.getValue(selectionIdx, 4);
      $.ajax({
        url:"http://api.kivaws.org/v1/loans/" + id.toString() + ".json",
        success: function(result) {
          $(".left-col").empty();
          $(".right-col").empty();
          $(".visualizations").empty();
          appendUserInfo(result);
        },
        async: false
      });
  });
  
  chart.draw(data, options);
  };

  function showLender() {
    var id = document.getElementById('id').value;
    $.ajax({
        url:"http://api.kivaws.org/v1/lenders/" + id.toString() + ".json",
        success: function(result) {
          var lender = result['lenders'][0];
          $(".left-col").empty();
          $(".right-col").empty();
          appendLenderInfo(result);
        },
        async: false
      });
  }

  function appendUserInfo(result) {
    var loan = result['loans'][0];

    $(".left-col").append("<div class=\"user-image\"><img src=\"http://www.kiva.org/img/w200h200/" + loan['image']['id'] + ".jpg\"></img></div>");

    $(".right-col").append("<div class=\"name\"><h1>" + loan['name'] + "</h1></div>");
    $(".right-col").append("<div class=\"town-country\">" + loan['location']['town'] + ", " + loan['location']['country'] + "</div>");
    $(".right-col").append("<div class=\"user-info-line\">" + loan['sector'] + "</div>");
    $(".right-col").append("<div class=\"user-info-line\">$" + loan['funded_amount'] + "/$" + loan['loan_amount'] + " funded</div>");
    $(".right-col").append("<div class=\"user-info-line\">" + loan['use'] + "</div>");
    
  }

  function appendLenderInfo(result) {
    var lender = result['lenders'][0];

    $(".left-col").append("<div class=\"user-image\"><img src=\"http://www.kiva.org/img/w200h200/" + lender['image']['id'] + ".jpg\"></img></div>");

    $(".right-col").append("<div class=\"name\"><h1>" + lender['name'] + "</h1></div>");
    $(".right-col").append("<div class=\"town-country\">" + lender['whereabouts'] + "</div>");
    $(".right-col").append("<div class=\"user-info-line\">Loans made: " + lender['loan_count'] + "</div>");
    // $(".right-col").append("<div class=\"funding\">$" + loan['funded_amount'] + "/$" + loan['loan_amount'] + " funded</div>");
    $(".right-col").append("<div class=\"user-info-line\">" + lender['occupational_info'] + "</div>");
    var id = document.getElementById('id').value;
    $.ajax({
        url:"http://api.kivaws.org/v1/lenders/" + id.toString() + "/loans.json",
        success: function(result) {
          $(".visualizations").empty();
          $(".visualizations").append("<div id=\"sectorpiechart\"></div>");
          $(".visualizations").append("<div id=\"loanstatuspiechart\"></div>");
          generateLenderGraphs(result);
        },
        async: false
      });
    
  }

  function generateLenderGraphs(result) {
    var loans = result['loans'];
    var sectorCount = [
      ["Sector", "Number of Loans"],
      ["Agriculture", 0],
      ["Arts", 0],
      ["Clothing", 0],
      ["Construction", 0],
      ["Education", 0],
      ["Entertainment", 0],
      ["Food", 0],
      ["Health", 0],
      ["Housing", 0],
      ["Manufacturing", 0],
      ["Personal Use", 0],
      ["Retail", 0],
      ["Services", 0],
      ["Transportation", 0],
      ["Wholesale", 0]
    ];

    var loanStatusCount = [
      ["Loan Status", "Number of Loans"],
      ["Fundraising", 0],
      ["Funded", 0],
      ["In Repayment", 0],
      ["Paid", 0],
      ["Defaulted", 0],
      ["Refunded", 0]
    ];

    _.each(loans, function(loan) {
      sector = loan['sector'];
      status = loan['status'];
      switch (sector) {
        case "Agriculture":
          sectorCount[1][1]++;
          break;
        case "Arts":
          sectorCount[2][1]++;
          break;
        case "Clothing":
          sectorCount[3][1]++;
          break;
        case "Construction":
          sectorCount[4][1]++;
          break;
        case "Education":
          sectorCount[5][1]++;
          break;
        case "Entertainment":
          sectorCount[6][1]++;
          break;
        case "Food":
          sectorCount[7][1]++;
          break;
        case "Health":
          sectorCount[8][1]++;
          break;
        case "Housing":
          sectorCount[9][1]++;
          break;
        case "Manufacturing":
          sectorCount[10][1]++;
          break;
        case "Personal Use":
          sectorCount[11][1]++;
          break;
        case "Retail":
          sectorCount[12][1]++;
          break;
        case "Services":
          sectorCount[13][1]++;
          break;
        case "Transportation":
          sectorCount[14][1]++;
          break;
        case "Wholesale":
          sectorCount[15][1]++;
          break;
        default:
          console.log("sector doesn't match any found");
          break;
      } 

      switch (status) {
        case "fundraising":
          loanStatusCount[1][1]++;
          break;
        case "funded":
          loanStatusCount[2][1]++;
          break;
        case "in_repayment":
          loanStatusCount[3][1]++;
          break;
        case "paid":
          loanStatusCount[4][1]++;
          break;
        case "defaulted":
          loanStatusCount[5][1]++;
          break;
        case "refunded":
          loanStatusCount[6][1]++;
          break;
      }   
    });

    var sectorPieData = google.visualization.arrayToDataTable(sectorCount);
    var sectorPieOptions = {
      title: 'Loan Allocation'
    };
    var sectorPieChart = new google.visualization.PieChart(document.getElementById('sectorpiechart'));
    sectorPieChart.draw(sectorPieData, sectorPieOptions);

    var loanStatusData = google.visualization.arrayToDataTable(loanStatusCount);
    var loanStatusOptions = {
      title: 'Loan Status Breakdown'
    };
    var loanStatusChart = new google.visualization.PieChart(document.getElementById('loanstatuspiechart'));
    loanStatusChart.draw(loanStatusData, loanStatusOptions);
  }

  window.onresize = function(event) {
    chart.draw(data, options);
  };

});