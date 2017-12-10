var mapChart = dc.geoChoroplethChart("#map-chart");;
var timelineChart = dc.barChart('#timeline-chart');
var weaponChart = dc.rowChart('#weapon-chart');

var months = {
  "January": "01",
  "February": "02",
  "March": "03",
  "April": "04",
  "May": "05",
  "June": "06",
  "July": "07",
  "August": "08",
  "September": "09",
  "October": "10",
  "November": "11",
  "December": "12",
};

d3.csv('data/database.csv', function(csv) {
  d3.json("data/us-states.json", function (statesJson) {
    console.log(csv);
    
    var dateFormat = d3.time.format('%m/%Y');
    csv.forEach(function (d) {
      d.dd = dateFormat.parse(months[d.Month] + "/" + d.Year);
      d.monthD3 = d3.time.month(d.dd);
    });
    
    var homicides = crossfilter(csv);
  
    var timelineChartDimension = homicides.dimension(d => d.monthD3);
    var timelineGroup = timelineChartDimension.group().reduceCount();
    var states = homicides.dimension(function (d) {
      return d["State"];
    });
    var stateHomicides = states.group().reduceCount();
    var weaponDimension = homicides.dimension(d => d.Weapon);
    var weaponGroup = weaponDimension.group().reduceCount();

    weaponChart
      .width(400)
      .height(400)
      .margins({top: 0, right: 50, bottom: 20, left: 70})
      .x(d3.scale.linear().domain([6,20]))
      .elasticX(true)
      .dimension(weaponDimension)
      .group(weaponGroup)
      .labelOffsetX(-70);
  
    timelineChart.width(990)
      .height(40)
      .margins({top: 0, right: 50, bottom: 20, left: 40})
      .dimension(timelineChartDimension)
      .group(timelineGroup)
      .centerBar(true)
      .gap(1)
      .x(d3.time.scale().domain([new Date(1980, 0, 1), new Date(2014, 11, 31)]))
      .alwaysUseRounding(true);
  
    timelineChart.yAxis().tickFormat(d => "");
    timelineChart.yAxis().tickSize(d => 0);

    mapChart.width(990)
      .height(500)
      .dimension(states)
      .group(stateHomicides)
      .colors(d3.scale.quantize().range(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"]))
      .colorDomain([308, 62095])
      .colorCalculator(function (d) { return d ? mapChart.colors()(d) : '#ccc'; })
      .overlayGeoJson(statesJson.features, "state", function (d) {
        return d.properties.name;
      })
      .valueAccessor(function(kv) {
        return kv.value;
      });

    mapChart.on("preRender", function(chart) {
      chart.colorDomain(d3.extent(chart.data(), chart.valueAccessor()));
    });
    mapChart.on("preRedraw", function(chart) {
      chart.colorDomain(d3.extent(chart.data(), chart.valueAccessor()));
    });

    dc.renderAll()
  });
})
