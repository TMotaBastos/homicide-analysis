var weaponChart = dc.seriesChart('#weapon-chart');

d3.csv('data/database.csv', function(csv) {
  csv = csv.filter(d => d['Weapon'] != "Unknown");
  csv.forEach(d => {
    var weapon = d['Weapon'];
    if (weapon == "Firearm" || weapon == "Handgun" || weapon == "Shotgun" || weapon == "Gun" || weapon == "Rifle") {
      d['Weapon'] = "Gun";
    } else if (weapon == "Suffocation") {
      d['Weapon'] = "Strangulation";
    }
  });
  
  var homicides = crossfilter(csv);

  var homicidesByWeaponDimension = homicides.dimension(d => [d['Weapon'], +d['Year']])
  var homicidesGroup = homicidesByWeaponDimension.group().reduceCount();

  weaponChart
    .width(768)
    .height(480)
    .chart(function(c) { return dc.lineChart(c).interpolate('linear'); })
    .x(d3.scale.linear().domain([1980,2014]))
    .brushOn(false)
    .yAxisLabel("Homicides")
    .xAxisLabel("Year")
    .clipPadding(10)
    .elasticY(true)
    .dimension(homicidesByWeaponDimension)
    .group(homicidesGroup)
    .mouseZoomable(true)
    .seriesAccessor(function(d) {return d.key[0];})
    .keyAccessor(function(d) {return +d.key[1];})
    .valueAccessor(function(d) {return +d.value;})
    .legend(dc.legend().x(568).y(0).itemHeight(13).gap(5).horizontal(1).legendWidth(200).itemWidth(100));

  weaponChart.yAxis().tickFormat(function(d) {return d3.format(',d')(d);});
  weaponChart.margins().left += 10;
  weaponChart.margins().bottom += 5;

  dc.renderAll()
})
