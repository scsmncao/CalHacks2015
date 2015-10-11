google.load('visualization', '1', {'packages': ['geochart', 'corechart']});
$(document).ready(function() {

  $('.search_bar').keyup(function(event) {
        if (event.keyCode == 13) {
            showLender();
            return false;
         }
    });

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

    options = {
      displayMode: 'markers', 
      enableRegionInteractivity: 'false',
      backgroundColor: '#73CBFF',
      defaultColor: '#f5f5f5',
      sizeAxis: {minSize:8,  maxSize: 8},
      colorAxis: {minValue: 1, maxValue:5, colors: ['white', 'green']}
    };

  chart = new google.visualization.GeoChart(document.getElementsByClassName("chart_div")[0]);
  
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
      
      $('html:not(:animated), body:not(:animated)').animate({
          scrollTop: $("#info").offset().top
      }, 1500);
  });
  
  chart.draw(data, options);
  };

  function appendUserInfo(result) {
    var loan = result['loans'][0];

    $(".left-col").append("<div class=\"user-image\"><img src=\"http://www.kiva.org/img/w200h200/" + loan['image']['id'] + ".jpg\"></img></div>");
    $(".right-col").append("<div class=\"name\"><h1>" + loan['name'] + " | " + round(calculateImpact(loan)) + "</h1></div>");
    $(".right-col").append("<div class=\"town-country\">" + loan['location']['town'] + ", " + loan['location']['country'] + "</div>");
    $(".right-col").append("<div class=\"user-info-line\">" + loan['sector'] + "</div>");
    $(".right-col").append("<div class=\"user-info-line\">$" + loan['funded_amount'] + "/$" + loan['loan_amount'] + " funded</div>");
    $(".right-col").append("<div class=\"user-info-line\">" + loan['use'] + "</div>");

    $(".visualizations").empty();
    
    if (loan['sector'] == "Education") {
      $(".visualizations").append("<div class=\"infochart\" id=\"litratelinegraph\"></div>");
      generateUserLiteracyRateLineGraph(result);
    }

    $(".visualizations").append("<div class=\"infochart\" id=\"gnilinegraph\"></div>");
    generateUserGNILineGraph(result);
  }

  function generateUserGNILineGraph(result) {
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Year');                                
    data.addColumn('number', 'Country');
    data.addColumn('number', 'World');

    for (i = 2000; i < 2015; i++) {
      data.addRows([[i.toString(), Math.floor((Math.random() * 1600) + 400), Math.floor((Math.random() * 1000) + 3000)]]);
    }

    var options = {
          title: 'Gross National Income per Capita vs. World Average',
          curveType: 'function',
          vAxis: { title: "USD (2005) per Capita" },
          legend: { position: 'right' }
        };

    var chart = new google.visualization.LineChart(document.getElementById('gnilinegraph'));
    chart.draw(data, options);
  }

  function generateUserLiteracyRateLineGraph(result) {
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Year');                                
    data.addColumn('number', 'Country');
    data.addColumn('number', 'World');

    for (i = 2000; i < 2015; i++) {
      data.addRows([[i.toString(), Math.floor((Math.random() * 10) + 60), Math.floor((Math.random() * 10) + 70)]]);
    }

    var options = {
          title: 'Literacy Rate vs. World Average',
          vAxis: { title: "Percent" },
          curveType: 'function',
          legend: { position: 'right' }
        };

    var chart = new google.visualization.LineChart(document.getElementById('litratelinegraph'));
    chart.draw(data, options);
  }

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

  function appendLenderInfo(result) {
    var lender = result['lenders'][0];

    $(".left-col").append("<div class=\"user-image\"><img src=\"http://www.kiva.org/img/w200h200/" + lender['image']['id'] + ".jpg\"></img></div>");
    $(".right-col").append("<div class=\"name\"><h1>" + lender['name'] + "</h1></div>");
    $(".right-col").append("<div class=\"town-country\">" + lender['whereabouts'] + "</div>");
    $(".right-col").append("<div class=\"user-info-line\">Loans made: " + lender['loan_count'] + "</div>");
    $(".right-col").append("<div class=\"user-info-line\">" + lender['occupational_info'] + "</div>");
    var id = document.getElementById('id').value;
    $.ajax({
        url:"http://api.kivaws.org/v1/lenders/" + id.toString() + "/loans.json",
        success: function(result) {
          $(".visualizations").empty();
          $(".visualizations").append("<div class=\"infochart\" id=\"sectorpiechart\"></div>");
          $(".visualizations").append("<div class=\"infochart\" id=\"sectorimpactchart\"></div>");
          $(".visualizations").append("<div class=\"infochart\" id=\"loanstatuspiechart\"></div>");
          populateLoanMap(result);
          generateLenderGraphs(result);
        },
        async: false
      });

  }

  function populateLoanMap(result) {
    var loans = result['loans'];
    data = new google.visualization.DataTable();

    data.addColumn('number', 'latitude');                                
    data.addColumn('number', 'longitude');
    data.addColumn('string', 'name');
    data.addColumn('number', 'color'); 
    data.addColumn('number', 'value', 'value'); 
    data.addColumn({type:'string', role:'tooltip'});

    _.each(loans, function(loan) {
        geoCoord = loan['location']['geo']['pairs'];
        geoCoord = geoCoord.split(" ");
        latitude = parseFloat(geoCoord[0]);
        longitude = parseFloat(geoCoord[1]);
        impact = calculateImpact(loan);

        tooltip = loan['location']['town'] + ", " + loan['location']['country'] + "\n" + loan['use']; 
        data.addRows([[latitude, longitude, loan['name'], impact, parseInt(loan['id']), tooltip]]);
    });

    chart.draw(data, options);
  }

  // Clothing, entertainment, manufacturing, retail, services
  function calculateImpact(loan) {
    gniScore = 0;
    gniPerCapita = 1400;
    sector = loan['sector'];
    

    if (gniPerCapita < 1045) {
        gniScore = 4;
      } else if (gniPerCapita < 4125) {
        gniScore = 3;
      } else if (gniPerCapita < 12735) {
        gniScore = 2;
      } else {
        gniScore = 1;
      }

    gniImpact = Math.min((loan['loan_amount']/gniPerCapita) * gniScore, 5);

    if (sector == "Clothing" || sector == "Entertainment" || sector == "Manufacturing" || sector == "Retail" || sector == "Services" || sector == "Construction") {
      return gniImpact
    } else if (sector == "Education") {
        literacyRate = 69;
        literacyScore = 0;

        if (literacyRate <= 60) {
          literacyScore = 5;
        } else if (literacyRate <= 80) {
          literacyScore = 4;
        } else if (literacyRate <= 90) {
          literacyScore = 3;
        } else if (literacyRate <= 97) {
          literacyScore = 2;
        } else {
          literacyScore = 1;
        }

        return Math.min((loan['loan_amount']/gniPerCapita) * 2 * literacyScore, 5);

    } else if (sector == "Food") {
      depthOfHunger = 200;
      depthOfHungerScore = 0;

      if (depthOfHunger < 120) {
        depthOfHungerScore = 1;
      } else if (depthOfHungerScore < 180) {
        depthOfHungerScore = 2;
      } else if (depthOfHungerScore < 240) {
        depthOfHungerScore = 3;
      } else if (depthOfHungerScore < 300) {
        depthOfHungerScore = 4;
      } else {
        depthOfHungerScore = 5;
      }

      return (gniImpact + Math.min((loan['loan_amount']/gniPerCapita) * depthOfHungerScore, 5))/2;

    } else if (sector == "Health") {
      lifeExpectancy = 60;
      lifeExpectancyScore = 0; 
      
      if (lifeExpectancy < 55) {
        lifeExpectancyScore = 5;
      } else if (lifeExpectancy < 61) {
        lifeExpectancyScore = 4;
      } else if (depthOfHungerScore < 67) {
        lifeExpectancyScore = 3;
      } else if (depthOfHungerScore < 73) {
        lifeExpectancyScore = 2;
      } else {
        lifeExpectancyScore = 1;
      }

      return (gniImpact + Math.min((loan['loan_amount']/gniPerCapita) * lifeExpectancyScore, 5))/2;
    } else {
      return 0;
    }
    
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

    var sectorImpact = [
      ["Sector", "Average Impact"],
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
          sectorImpact[1][1] += calculateImpact(loan);
          break;
        case "Arts":
          sectorCount[2][1]++;
          sectorImpact[2][1] += calculateImpact(loan);
          break;
        case "Clothing":
          sectorCount[3][1]++;
          sectorImpact[3][1] += calculateImpact(loan);
          break;
        case "Construction":
          sectorCount[4][1]++;
          sectorImpact[4][1] += calculateImpact(loan);
          break;
        case "Education":
          sectorCount[5][1]++;
          sectorImpact[5][1] += calculateImpact(loan);
          break;
        case "Entertainment":
          sectorCount[6][1]++;
          sectorImpact[6][1] += calculateImpact(loan);
          break;
        case "Food":
          sectorCount[7][1]++;
          sectorImpact[7][1] += calculateImpact(loan);
          break;
        case "Health":
          sectorCount[8][1]++;
          sectorImpact[8][1] += calculateImpact(loan);
          break;
        case "Housing":
          sectorCount[9][1]++;
          sectorImpact[9][1] += calculateImpact(loan);
          break;
        case "Manufacturing":
          sectorCount[10][1]++;
          sectorImpact[10][1] += calculateImpact(loan);
          break;
        case "Personal Use":
          sectorCount[11][1]++;
          sectorImpact[11][1] += calculateImpact(loan);
          break;
        case "Retail":
          sectorCount[12][1]++;
          sectorImpact[12][1] += calculateImpact(loan);
          break;
        case "Services":
          sectorCount[13][1]++;
          sectorImpact[13][1] += calculateImpact(loan);
          break;
        case "Transportation":
          sectorCount[14][1]++;
          sectorImpact[14][1] += calculateImpact(loan);
          break;
        case "Wholesale":
          sectorCount[15][1]++;
          sectorImpact[1][1] += calculateImpact(loan);
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

    for (i = 1; i < sectorImpact.length; i++) {
      sectorImpact[i][1] /= sectorCount[i][1];
      sectorImpact[i][1] = round(sectorImpact[i][1]);
    }

    var sectorPieData = google.visualization.arrayToDataTable(sectorCount);
    var sectorPieOptions = {
      title: 'Loan Allocation'
    };
    var sectorPieChart = new google.visualization.PieChart(document.getElementById('sectorpiechart'));
    sectorPieChart.draw(sectorPieData, sectorPieOptions);

    var sectorImpactData = google.visualization.arrayToDataTable(sectorImpact);
    var sectorImpactOptions = {
      title: 'Average Impact by Sector',
      legend: { position: "none" }
    };
    var sectorImpactPieChart = new google.visualization.BarChart(document.getElementById("sectorimpactchart"));
    sectorImpactPieChart.draw(sectorImpactData, sectorImpactOptions);

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

  function round(num) {
    return Math.round(num * 100) / 100
  }

});