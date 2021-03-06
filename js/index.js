google.load('visualization', '1', {'packages': ['geochart', 'corechart']});
$(document).ready(function() {

  $(".search").click(showLender);

  $('.search_bar').keydown(function(event) {
        if (event.keyCode == 13) {
            showLender();
            return false;
         }
    });

  $(".allocation").click(switchGraphs);
  $(".impact").click(switchGraphs);
  $(".status").click(switchGraphs);

  $(".forcegraph").hide();
  $(".info").hide();
  google.setOnLoadCallback(drawMap);
  var chart;
  var data;
  var options;
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
    displayImage();
    $(".right-col").append("<div class=\"name\"><h1>" + loan['name'] + " | " + loan['sector'] + "</h1></div>");
    $(".right-col").append("<div class=\"user-info-line\">" + loan['location']['town'] + ", " + loan['location']['country'] + "</div>");
    $(".right-col").append("<div class=\"user-info-line\">$" + loan['funded_amount'] + "/$" + loan['loan_amount'] + " funded</div>");
    $(".right-col").append("<div class=\"user-info-line\">" + loan['use'] + "</div>");
    $(".right-col").append("<div class=\"user-info-line-bold\">Impact Rating: " + round(calculateImpact(loan)) + "</div>");

    $(".visualizations").empty();
    $(".tabs").hide();
    
    if (loan['sector'] == "Education") {
      $(".visualizations").append("<div class=\"infotitle\"><h1>Key Economic Factor</h1></div>");
      $(".visualizations").append("<div class=\"infochart\" id=\"litratelinegraph\"></div>");
      generateUserLiteracyRateLineGraph(result);
    } else if (loan['sector'] == "Agriculture") {
      $(".visualizations").append("<div class=\"infotitle\"><h1>Key Economic Factor</h1></div>");
      $(".visualizations").append("<div class=\"infochart\" id=\"cereallinegraph\"></div>");
      generateUserCerealPerCapitaLineGraph(result);
    }
    $(".visualizations").append("<div class=\"infotitle\"><h1>Key Economic Factor</h1></div>");
    $(".visualizations").append("<div class=\"infochart\" id=\"gnilinegraph\"></div>");
    generateUserGNILineGraph(result);
    $(".forcegraph").show();
  }

  function generateUserGNILineGraph(result) {
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Year');                                
    data.addColumn('number', 'Country');
    data.addColumn('number', 'World');

    loanCountry = result['loans'][0]['location']['country_code'];

    $.ajax({
      url: "data/countryHash.json",
      dataType: 'json',
      async: false,
      success: function(data) {
        loanCountry = data[loanCountry]
      }
    });

    var capitaCodes = {};

    $.ajax({
      url: "data/capita_codes.json",
      dataType: 'json',
      async: false,
      success: function(data) {
        capitaCodes = data
      }
    });

    var countryData = [];
    var worldData = []

    // country data
    $.ajax({
        url:"https://www.quandl.com/api/v3/datasets/" + capitaCodes['codes'][loanCountry] + "/data.json?api_key=933ptffRpv3GEuLyHnas&start_date=2000-01-01&order=asc",
        success: function(result) {
          countryData = result['dataset_data']['data'];
        },
        async: false
      });

    // world data
    $.ajax({
        url:"https://www.quandl.com/api/v3/datasets/UN/NA_1_33/data.json?api_key=933ptffRpv3GEuLyHnas&start_date=2000-01-01&order=asc",
        success: function(result) {
          worldData = result['dataset_data']['data'];
        },
        async: false
      });

    for (i = 0; i < 14; i++) {
      data.addRows([[(i + 2000).toString(), countryData[i][1], worldData[i][1]]]);
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

    var literacyCodes = {}

    $.ajax({
      url: "data/literacy_codes.json",
      dataType: 'json',
      async: false,
      success: function(data) {
        literacyCodes = data
      }
    });

    var countryData = [];
    var worldData = []

    // country data
    $.ajax({
        url:"https://www.quandl.com/api/v3/datasets/" + literacyCodes['codes'][loanCountry] + "/data.json?api_key=933ptffRpv3GEuLyHnas&start_date=2000-01-01&order=asc",
        success: function(result) {
          countryData = result['dataset_data']['data'];
        },
        async: false
      });

    // world data
    $.ajax({
        url:"https://www.quandl.com/api/v3/datasets/" + literacyCodes['codes']['World'] + "/data.json?api_key=933ptffRpv3GEuLyHnas&start_date=2000-01-01&order=asc",
        success: function(result) {
          worldData = result['dataset_data']['data'];
        },
        async: false
      });

    for (i = 0; i < 14; i++) {
      if (countryData[i] && worldData[i]) {
        data.addRows([[(i + 2000).toString(), countryData[i][1], worldData[i][1]]]);
      }
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

  function generateUserCerealPerCapitaLineGraph(result) {
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Year');                                
    data.addColumn('number', 'Country');
    data.addColumn('number', 'World');


    var cerealCodes = {}

    $.ajax({
      url: "data/cereal_codes.json",
      dataType: 'json',
      async: false,
      success: function(data) {
        cerealCodes = data
      }
    });

    var countryData = [];
    var worldData = []

    // country data
    $.ajax({
        url:"https://www.quandl.com/api/v3/datasets/" + cerealCodes['codes'][loanCountry] + "/data.json?api_key=933ptffRpv3GEuLyHnas&start_date=2000-01-01&order=asc",
        success: function(result) {
          countryData = result['dataset_data']['data'];
        },
        async: false
      });

    // world data
    $.ajax({
        url:"https://www.quandl.com/api/v3/datasets/" + cerealCodes['codes']['World'] + "/data.json?api_key=933ptffRpv3GEuLyHnas&start_date=2000-01-01&order=asc",
        success: function(result) {
          worldData = result['dataset_data']['data'];
        },
        async: false
      });

    for (i = 0; i < 14; i++) {
      if (countryData[i] && worldData[i]) {
        data.addRows([[(i + 2000).toString(), countryData[i][1], worldData[i][1]]]);
      }
    }


    var options = {
          title: 'Cereal Production per Capita vs. World Average',
          vAxis: { title: "Metric Tonnes per Capita" },
          curveType: 'function',
          legend: { position: 'right' }
        };

    var chart = new google.visualization.LineChart(document.getElementById('cereallinegraph'));
    chart.draw(data, options);
  }

  function showLender() {
    var id = document.getElementById('id').value;
    $(".info").show();
    $.ajax({
        url:"http://api.kivaws.org/v1/lenders/" + id.toString() + ".json",
        success: function(result) {
          var lender = result['lenders'][0];
          $(".left-col").empty();
          $(".right-col").empty();
          $(".forcegraph").hide();
          appendLenderInfo(result);
        },
        async: false
      });
    $('html:not(:animated), body:not(:animated)').animate({
          scrollTop: $("#map").offset().top
      }, 750);
  }

  function appendLenderInfo(result) {
    var lender = result['lenders'][0];

    $(".left-col").append("<div class=\"user-image\"><img src=\"http://www.kiva.org/img/w200h200/" + lender['image']['id'] + ".jpg\"></img></div>");
    displayImage();
    $(".right-col").append("<div class=\"name\"><h1>" + lender['name'] + "</h1></div>");
    $(".right-col").append("<div class=\"user-info-line\">" + lender['whereabouts'] + "</div>");
    $(".right-col").append("<div class=\"user-info-line\">Loans made: " + lender['loan_count'] + "</div>");
    $(".right-col").append("<div class=\"user-info-line\">" + lender['occupational_info'] + "</div>");
    $(".tabs").show();
    var id = document.getElementById('id').value;
    $.ajax({
        url:"http://api.kivaws.org/v1/lenders/" + id.toString() + "/loans.json",
        success: function(result) {
          $(".visualizations").empty();
          $(".visualizations").append("<div class=\"allocation_tab\"><div class=\"infotitle\"><h1>Where You Are Lending</h1></div><div class=\"infochart\" id=\"sectorpiechart\"></div></div>");
          $(".visualizations").append("<div class=\"impact_tab\"><div class=\"infotitle\"><h1>Where You Are Making a Difference</h1></div><div class=\"infochart\" id=\"sectorimpactchart\"></div></div>");
          $(".visualizations").append("<div class=\"status_tab\"><div class=\"infotitle\"><h1>How Your Loans Are Doing </h1></div><div class=\"infochart\" id=\"loanstatuspiechart\"></div></div>");
          populateLoanMap(result);
          generateLenderGraphs(result);
          $(".impact_tab").hide();
          $(".status_tab").hide();
        },
        async: false
      });

  }

  function switchGraphs() {
    console.log("in switch graphs");
    console.log($(this).text().replace(/\s/g, ''));
    if ($(this).text().replace(/\s/g, '') === 'Allocation') {
      console.log("click allocation");
      $(".impact_tab").hide();
      $(".status_tab").hide();
      $(".allocation_tab").show();
    }
    if ($(this).text().replace(/\s/g, '') === 'Impact') {
      console.log("click impact");
      $(".impact_tab").show();
      $(".status_tab").hide();
      $(".allocation_tab").hide();
    }
    if ($(this).text().replace(/\s/g, '') === 'Status') {
      console.log("click status");
      $(".impact_tab").hide();
      $(".status_tab").show();
      $(".allocation_tab").hide();
    }
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
        tooltip = "Impact Score: " + round(impact) + "\n" + loan['location']['country'] + "\n" + loan['location']['town'] + ", " + loan['location']['country'] + "\n" + loan['use']; 
        data.addRows([[latitude, longitude, loan['name'], impact, parseInt(loan['id']), tooltip]]);
    });

    chart.draw(data, options);
  }

  function getClosestDataPoint(loanYear, country, url) {
    var closestDifference = 0
    var closestYear = 0
    var dataObj = {};

    $.ajax({
      url: url,
      dataType: 'json',
      async: false,
      success: function(data) {
        dataObj = data;
      }
    });

    var countryData = [];
    var worldData = [];

    if (country in dataObj['codes']) {
      // country data
      $.ajax({
          url:"https://www.quandl.com/api/v3/datasets/" + dataObj['codes'][country] + "/data.json?api_key=933ptffRpv3GEuLyHnas&start_date=2000-01-01&order=asc",
          success: function(result) {
            countryData = result['dataset_data']['data'];
          },
          async: false
        });
    }
    $.ajax({
      url:"https://www.quandl.com/api/v3/datasets/" + dataObj['codes']['World'] + "/data.json?api_key=933ptffRpv3GEuLyHnas&start_date=2000-01-01&order=asc",
      success: function(result) {
        countryData = result['dataset_data']['data'];
      },
      async: false
    });
    var closestDate = 100;
    var closestNum = 0;
    _.each(countryData, function(date) {
      if (Math.abs(parseInt(date[0]) - parseInt(loanYear)) < closestDate) {
        closestNum = Math.abs(parseInt(date[0]) - parseInt(loanYear));
        closestDate = date[1];
      }
    });
    return closestDate/3;
  }

  function calculateImpact(loan) {
    loanCountry = loan['location']['country_code'];
    $.ajax({
      url: "data/countryHash.json",
      dataType: 'json',
      async: false,
      success: function(data) {
        loanCountry = data[loanCountry]
      }
    });
    if (loan['planned_expiration_date']) {
      var loanYear = loan['planned_expiration_date'].split("-")[0];
    }
    else {
      var loanYear = loan['posted_date'].split("-")[0];
    }
        
    var capitaCodes = {};

    $.ajax({
      url: "data/capita_codes.json",
      dataType: 'json',
      async: false,
      success: function(data) {
        capitaCodes = data
      }
    });

    var countryData = [];
    // country data
    $.ajax({
        url:"https://www.quandl.com/api/v3/datasets/" + capitaCodes['codes'][loanCountry] + "/data.json?api_key=933ptffRpv3GEuLyHnas&start_date=2000-01-01&order=asc",
        success: function(result) {
          countryData = result['dataset_data']['data'];
        },
        async: false
      });
    
    // var gniPerCapita = getClosestDataPoint(loanYear, loanCountry, "data/capita_codes.json")
    var gniPerCapita = countryData[Math.min(parseInt(loanYear) - 2000, 13)][1];
    var gniScore = getScoreByBracket(gniPerCapita, [0, 1045, 4125, 12735], false);
    var gniImpact = Math.min((loan['loan_amount']/gniPerCapita) * gniScore, 5);

    console.log(loanCountry);
    console.log("GNI per capita " + gniPerCapita);
    console.log("GNI Score " + gniImpact);
    sector = loan['sector'];

    if (sector == "Clothing" || sector == "Entertainment" 
      || sector == "Manufacturing" || sector == "Retail" 
      || sector == "Services" || sector == "Construction" 
      || sector == "Arts") {
      return gniImpact;
    } else if (sector == "Education") {
        console.log("in education")
        var literacyRate = getClosestDataPoint(loanYear, loanCountry, "data/literacy_codes.json");
        console.log("literacyRate " + literacyRate);
        var literacyScore = getScoreByBracket(literacyRate, [60, 80, 90, 97], false);
        return Math.min((loan['loan_amount']/gniPerCapita) * 2 * literacyScore, 5);

    } else if (sector == "Food") {
      var depthOfHunger = 500;
      var depthOfHungerScore = getScoreByBracket(depthOfHunger, [120, 180, 240, 300], true);
      console.log("depthOfHunger " + depthOfHunger);
      console.log("depthOfHungerScore " + depthOfHungerScore);
      return (gniImpact + depthOfHungerScore)/2;

    } else if (sector == "Health") {
      var lifeExpectancy = getClosestDataPoint(loanYear, loanCountry, "data/life_expect_code.json");
      var lifeExpectancyScore = getScoreByBracket(percentSanitation, [55, 61, 67, 73], false); 
      return (gniImpact + Math.min((loan['loan_amount']/gniPerCapita) * lifeExpectancyScore, 5))/2;

    } else if (sector == "Transportation") {
      var carsPerThousand = getClosestDataPoint(loanYear, loanCountry, "data/cars.json");
      var transportationScore = getScoreByBracket(carsPerThousand, [68, 174, 352, 523], false); 
      return (gniImpact + Math.min((loan['loan_amount']/gniPerCapita) * transportationScore, 5))/2;

    } else if (sector == "Personal Use") {
      var percentSanitation = getClosestDataPoint(loanYear, loanCountry, "data/sanitation.json");
      var sanitationScore = getScoreByBracket(percentSanitation, [25, 43, 61, 79], false);
      return (gniImpact + Math.min((loan['loan_amount']/gniPerCapita) * sanitationScore, 5))/2;

    } else if (sector == "Agriculture") {
      var cerealProduction = getClosestDataPoint(loanYear, loanCountry, "data/cereal_codes.json");
      population = 1000000;
      var prodPerPop = cerealProduction/population;
      var cerealScore = getScoreByBracket(prodPerPop, [0.4, 0.7, 1, 1.3], false);
      return (gniImpact + Math.min((loan['loan_amount']/gniPerCapita) * cerealScore, 5))/2;

    } else {
      return 0;
    }
    
  }

  // supportValues has 4 values
  // assign a score of 5 if value < supportValues[0]
  // assign a score of 4 if supportValues[0] <= value < supportValues[1]
  // and so on
  // if inverse is true, start the score system from 1
  function getScoreByBracket(value, supportValues, inverse) {      
    if (value < supportValues[0]) {
      return inverse ? 1 : 5;
    } else if (value < supportValues[1]) {
      return inverse ? 2 : 4;
    } else if (value < supportValues[2]) {
      return inverse ? 3 : 3;
    } else if (value < supportValues[3]) {
      return inverse ? 4 : 2;
    } else {
      return inverse ? 5 : 1;
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
    var sectorPieOptions = {};
    var sectorPieChart = new google.visualization.PieChart(document.getElementById('sectorpiechart'));
    sectorPieChart.draw(sectorPieData, sectorPieOptions);

    var sectorImpactData = google.visualization.arrayToDataTable(sectorImpact);
    var sectorImpactOptions = {
      hAxis: { title: "Impact Rating", ticks: [1,2,3,4,5] },
      legend: {position: "none"}
    };
    var sectorImpactPieChart = new google.visualization.BarChart(document.getElementById("sectorimpactchart"));
    sectorImpactPieChart.draw(sectorImpactData, sectorImpactOptions);

    var loanStatusData = google.visualization.arrayToDataTable(loanStatusCount);
    var loanStatusOptions = {};
    var loanStatusChart = new google.visualization.PieChart(document.getElementById('loanstatuspiechart'));
    loanStatusChart.draw(loanStatusData, loanStatusOptions);
  }

  window.onresize = function(event) {
    chart.draw(data, options);
  };

  function round(num) {
    return Math.round(num * 100) / 100
  }

  function displayImage(){
    $('.user-image').find('img').each(function(){
      var imgClass = (this.width/this.height > 1) ? 'wide' : 'tall';
      $(this).addClass(imgClass);
    })
  }

});