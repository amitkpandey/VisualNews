var chart;
var arr;
var options;

var xLabel = 'time';
var yLabel = 'reddit sentiment';
var valueLabel = 'cluster size';
var balloonText = "";
setBalloonText();

function setup() {
  /*[ {
	    "y": 10,
	    "x": 14,
	    "value": 59,
	    "y2": -5,
	    "x2": -3,
	    "value2": 44
	  }, {
	    "y": 5,
	    "x": 3,
	    "value": 50,
	    "y2": -15,
	    "x2": -8,
	    "value2": 12
	  }, {
	    "y": -10,
	    "x": 8,
	    "value": 19,
	    "y2": -4,
	    "x2": 6,
	    "value2": 35
	  }, {
	    "y": -6,
	    "x": 5,
	    "value": 65,
	    "y2": -5,
	    "x2": -6,
	    "value2": 168
	  }, {
	    "y": 15,
	    "x": -4,
	    "value": 92,
	    "y2": -10,
	    "x2": -8,
	    "value2": 102
	  }, {
	    "y": 13,
	    "x": 1,
	    "value": 8,
	    "y2": -2,
	    "x2": 0,
	    "value2": 41
	  }, {
	    "y": 1,
	    "x": 6,
	    "value": 35,
	    "y2": 0,
	    "x2": -3,
	    "value2": 16
	  } ]);*/
	options = {
		"num_clusters": 20,
		"start_time": 0,
		"end_time": 0,
		"x-axis": "date",
		"y-axis": "reddit_sentiment", // popularity is reddit + twitter
		"value": "cluster_size",
	};
	arr = [];
	for (var i = 0; i < 50; i++)
		arr.push({y: Math.random(), x: Math.random(), value: Math.random()});
	display(arr);
}

function update() {
	chart.validateData();
}

function updateXAxis(name) {
	chart.valueAxes[0].title = name;
	xLabel = name;
	setBalloonText();
	chart.graphs[0].balloonText = balloonText;
	chart.validateNow();
}

function updateYAxis(name) {
	chart.valueAxes[1].title = name;
	yLabel = name;
	setBalloonText();
	chart.graphs[0].balloonText = balloonText;
	chart.validateNow();
}

function setBalloonText() {
	balloonText = "tags:<b>[[cluster_labels]]</b><br> _id:<b>[[_id]]</b><br> " + xLabel + ":<b>[[x]]</b><br> " + yLabel + 
			":<b>[[y]]</b><br> " + valueLabel + ":<b>[[value]]</b><br> ";
}

function display(data) {
	chart = AmCharts.makeChart( "chartdiv", {
	  "type": "xy",
	  "theme": "dark",
	  "balloon":{
	  	"fixedPosition":true,
			"maxWidth": 1000000
	  },
		// "dataLoader": {
	  //   "url": "data.json",
	  //   "format": "json"
  	// },
  	"dataProvider": null,
	  "valueAxes": [ {
	    "position": "bottom",
	    "axisAlpha": 0,
			"title": "Time",
			"titleColor": "#FFFFFF",
			"titleFontSize": 12
	  }, {
	    "minMaxMultiplier": 1.2,
	    "axisAlpha": 0,
	    "position": "left",
			"title": "Reddit Sentiment",
			"titleColor": "#FFFFFF",
			"titleFontSize": 12
	  } ],
	  "graphs": [ {
	    "balloonText": balloonText,
			"balloonWidth": 40,
	    "bullet": "circle",
	    "bulletBorderAlpha": 0.2,
	    "bulletAlpha": 0.8,
	    "lineAlpha": 0,
	    "fillAlphas": 0,
	    "valueField": "value",
	    "xField": "x",
	    "yField": "y",
			"maxBulletSize": 100,
			"colorField": "color"
	  }, {
	    "balloonText": "x:<b>[[x]]</b> y:<b>[[y]]</b><br>value:<b>[[value]]</b>",
	    "bullet": "circle",
	    "bulletBorderAlpha": 0.2,
	    "bulletAlpha": 0.8,
	    "lineAlpha": 0,
	    "fillAlphas": 0,
	    "valueField": "value2",
	    "xField": "x2",
	    "yField": "y2",
	    "maxBulletSize": 100
	  } ],
	  "marginLeft": 46,
	  "marginBottom": 35,
		"listeners": [{
			"event": "clickGraphItem",
	    "method": function(event) {
				var id = event.item.dataContext._id

				console.log(id);
				request_args = {
					"_id": id,
					"cluster_name": event.item.dataContext.cluster_name
				}

				$.get("get-cluster-data", request_args, function (data, status) {
					if (status === 'success') {
						data = JSON.parse(data);
						// console.log(data);
						var info = {title:"", info:[], elements:[]};
						if (data.articles != null)
							for (var i = 0; i < data.articles.length; i++) {
								var s = data.articles[i];
								var b = s.indexOf("––") > 0 ? s.indexOf("––") : s.length;
								var s1 = s.substring(0, b).trim();
								var s2 = s.substring(b + 2).trim();
								console.log(s1);
								console.log(s2);
								info.elements.push({title: s1, description: s2, url: data.links[i]});
							}
						// TODO format values
						// if (data.date != null)
						// 	info.info.push({label: "date", value: data.date});
						if (data.cluster_size != null)
							info.info.push({label: "cluster size", value: "Size: " + (Math.round(data.cluster_size*100) / 100) });
						if (data.reddit_sentiment != null)
							info.info.push({label: "reddit sentiment", value: "Reddit: " + (Math.round(data.reddit_sentiment*1000) / 1000)});
						if (data.twitter_sentiment != null)
							info.info.push({label: "twitter sentiment", value: "Twitter: " + (Math.round(data.twitter_sentiment*1000) / 1000) });
						if (data.labels != null) {
							var str = "Tags: ";
							for (var i = 0; i < data.labels.length; i++) // show first 5 tags
								str += data.labels[i] + ", ";
							if (str.length != 0) {
								str = str.substring(0, str.length - 2);
								info.info.push({label: "tags", value: str});
							}
						}

						// console.log("--- get cluster data: ---");
						// console.log(info);
						displayInfo(info);
					} else {
					  	console.log("response was not 200");
					}
				});
	    }
		}],
	  "export": {
	    "enabled": true
	  }
	});

	load()
}

function load() {
	$.get("request-data", options, function (data, status) {
		if (status === 'success') {
		    // console.log(data);
		    chart.dataProvider = AmCharts.parseJSON(data);

		} else {
		  	console.log("response was not 200");
		}
		update();
	});
}
