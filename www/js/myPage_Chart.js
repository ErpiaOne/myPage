//최근갱신일 버튼 눌렀을 경우
function refresh(kind, gu, admin_code, ERPiaApi_url)
{
	$("#loading").css("display","block");
	// AmCharts.loadJSON(ERPiaApi_url + "/renewalDay.asp?admin_code="+ admin_code +"&kind="+ kind +"&swm_gu="+ gu, "refresh"); //최근갱신일 로딩
	AmCharts.loadJSON(ERPiaApi_url + "/graph_DataUpdate.asp?admin_code="+ admin_code +"&kind="+ kind +"&swm_gu="+ gu, "refresh");
	makeCharts(kind, gu, admin_code,ERPiaApi_url);
}


// 처음 로딩 할때
function renewalDay(kind, gu, admin_code, ERPiaApi_url)
{
	$("#loading").css("display","block");
	// AmCharts.loadJSON(ERPiaApi_url + "/renewalDay.asp?admin_code="+ admin_code +"&kind="+ kind +"&swm_gu="+ gu, "refresh"); //최근갱신일 로딩
	AmCharts.loadJSON(ERPiaApi_url + "/graph_DataUpdate.asp?admin_code="+ admin_code +"&kind="+ kind +"&swm_gu="+ gu, "refresh");
	makeCharts(kind, gu, admin_code,ERPiaApi_url);
}

function makeCharts(kind, gu, admin_code, ERPiaApi_url){

	// 날짜
	var d= new Date();
	var month = d.getMonth() + 1;
	var day = d.getDate();
	//일주일전
	var w = new Date(Date.parse(d) -7 * 1000 * 60 * 60 * 24)
	var wMonth = w.getMonth() + 1;
	var wDay = w.getDate();
	//30일전
	var m = new Date(Date.parse(d) -30 * 1000 * 60 * 60 * 24)
	var mMonth = m.getMonth() + 1;
	var mDay = m.getDate();
	//1년 전
	var tm = new Date(Date.parse(d) -365 * 1000 * 60 * 60 * 24)
	var tmMonth = tm.getMonth() + 1;
	var tmDay = tm.getDate();

	var nowday = d.getFullYear() + '-' + (month<10 ? '0':'') + month + '-' + (day<10 ? '0' : '') + day;
	var aWeekAgo = w.getFullYear() + '-' + (wMonth<10 ? '0':'') + wMonth + '-' + (wDay<10 ? '0' : '') + wDay;
	var aMonthAgo = m.getFullYear() + '-' + (mMonth<10 ? '0':'') + mMonth + '-' + (mDay<10 ? '0' : '') + mDay;
	var aYearAgo = tm.getFullYear() + '-' + (tmMonth<10 ? '0':'') + tmMonth + '-' + (tmDay<10 ? '0' : '') + tmDay;

	$("input[name=gu_hidden]").val(gu);

	$("button[name=btnW]").removeClass();
	$("button[name=btnM]").removeClass();
	$("button[name=btnY]").removeClass();

	$("button[name=btnW]").addClass("btn bg-purple btn-xs");
	$("button[name=btnM]").addClass("btn bg-purple btn-xs");
	$("button[name=btnY]").addClass("btn bg-purple btn-xs");

	$('div[name=gridBody]').hide();		//gigler추가
	$('div[name=' + kind + ']').show();

	if (gu == 1) {
		$("button[name=btnW]").removeClass();
		$("button[name=btnW]").addClass("btn btn-warning btn-xs");
		$("input[name=gu_hidden]").val(1);
		sDate = aWeekAgo;
		eDate = nowday;
		temp ="주간 - ";
	} else if (gu == 2) {
		$("button[name=btnM]").removeClass();
		$("button[name=btnM]").addClass("btn btn-warning btn-xs");
		$("input[name=gu_hidden]").val(2);
		sDate = aMonthAgo;
		eDate = nowday;
		temp = "월간 - ";
	} else if (gu == 3) {
		$("button[name=btnY]").removeClass();
		$("button[name=btnY]").addClass("btn btn-warning btn-xs");
		$("input[name=gu_hidden]").val(3);
		sDate = aYearAgo;
		eDate = nowday;
		temp ="년간 - ";
	}

	if (kind == "meachul_jem" || kind == "meaip_jem" || kind == "beasonga" || kind == "meachul_onoff" || kind == "meachul_cs")
	{

		AmCharts.checkEmptyDataPie = function (kind) {
			// add some bogus data
			var dp = {};
			dp[kind.titleField] = "";
			dp[kind.valueField] = 1;
			kind.dataProvider.push(dp)

			var dp = {};
			dp[kind.titleField] = "";
			dp[kind.valueField] = 1;
			kind.dataProvider.push(dp)

			var dp = {};
			dp[kind.titleField] = "";
			dp[kind.valueField] = 1;
			kind.dataProvider.push(dp)

			// disable slice labels
			kind.labelsEnabled = false;

			// add label to let users know the chart is empty
			kind.addLabel("50%", "50%", "조회할 데이터가 없습니다.", "middle", 15);

						//  x    y     text                          위치   fontsize
			kind.addLabel(20, 0, temp + sDate + " ~ " + eDate, "left", 12);  /*			변경		 */

			// dim the whole chart
			kind.alpha = 0.3;
			return;
		}

		AmCharts.addInitHandler(function(kind) {
		  if (kind.dataProvider === undefined || kind.dataProvider.length === 0) {
			AmCharts.checkEmptyDataPie(kind);
			return;
		}

		 if (kind.legend === undefined || kind.legend.truncateLabels === undefined)
		return;

		var cnt1 = 0
		for (var i in kind.dataProvider) {
		  if (kind.dataProvider[i].value < 0)
		  {
			cnt1 = cnt1 + 1
		  }
		}

		if (kind.dataProvider.length === cnt1 )
		{
			AmCharts.checkEmptyDataPie(kind);
		}

		kind.addLabel(20, 0, temp + sDate + " ~ " + eDate, "left", 12);  /*			변경		 */

		 var titleField =""
		 var legendTitleField=""
		  // init fields
		  titleField = kind.titleField;
		  legendTitleField = kind.titleField+"Legend";
		  // iterate through the data and create truncated label properties
		  for(var i = 0; i < kind.dataProvider.length; i++) {
			var label = kind.dataProvider[i][kind.titleField];
			if (label.length > kind.legend.truncateLabels)
			  label = label.substr(0, kind.legend.truncateLabels-1)+'...'
			  kind.dataProvider[i][legendTitleField] = label;
		  }		
		  // replace chart.titleField to show our own truncated field
		  kind.titleField = legendTitleField;			  
		  // make the balloonText use full title instead
		  kind.balloonText = kind.balloonText.replace(/\[\[title\]\]/, "[["+titleField+"]]");

		  //var containerHeight =$(window).height()-100;
		  //kind.height = containerHeight


		}, ["pie"]);
	}else //if (kind == "meachul_7" || kind == "banpum" || kind == "beasongb" || kind == "Meachul_ik" || kind == "meaip_7" || kind == "beasong_gu" )// 추가
	{
		AmCharts.checkEmptyData = function (kind) {
			if ( 0 == kind.dataProvider.length ) {
				// set min/max on the value axis
				kind.valueAxes[0].minimum = 0;
				kind.valueAxes[0].maximum = 100;

				// add dummy data point
				var dataPoint = {
					dummyValue: 0
				};
				dataPoint[kind.categoryField] = '';
				kind.dataProvider = [dataPoint];

				// add label to let users know the chart is empty
				kind.addLabel("50%", "50%", "조회할 데이터가 없습니다.", "middle", 15);
							//  x    y     text                          위치   fontsize
				kind.addLabel(20, 0, temp + sDate + " ~ " + eDate, "left", 12);  /*			변경		 */

				// set opacity of the chart div
				//kind.chartDiv.style.opacity = 0.3;

				// redraw it
				kind.validateNow();
			}
		}

		AmCharts.addInitHandler(function(kind) {

			if (kind.dataProvider === undefined || kind.dataProvider.length === 0) {
				AmCharts.checkEmptyData(kind);
				return;
			}

			kind.addLabel(20, 0, temp + sDate + " ~ " + eDate, "left", 12);

			var containerWidth = $(window).width() - 100;

			// if (containerWidth <= 500)//화면 넓이가 374보다 작으면 라벨 각의 값을 준다
			// {
			// 	kind.categoryAxis.autoRotateAngle = -60;
			// 	kind.categoryAxis.autoRotateCount = 4;
			// }
			// else
			// {
			// 	kind.categoryAxis.autoRotateAngle = 0;
			// 	kind.categoryAxis.autoRotateCount = 0;
			// }
		}, ["serial"]);
	}

	height = $(window).height()-300;
	$('#' + kind).css('height', height+'px');

	$(window).resize(function () {
		height = $(window).height()-300;
		$('#' + kind).css('height', height+'px');
	});

	switch (kind)
	{
		case "meaip_jem" :			//거래처별 매입 점유율
		console.log('거래처별 매입 점유율');
		chartData = AmCharts.loadJSON(ERPiaApi_url + "/JSon_Proc_graph.asp?kind=meaip_jem&value_kind=meaip_jem&admin_code=" + admin_code + "&swm_gu=" + gu)
			// for (var i in chartData) {
			//   chartData[i].litres = chartData[i].value;
			//   chartData[i].absValue = Math.abs(chartData[i].value);
			// }

			var chart = AmCharts.makeChart("meaip_jem", {
				"type": "pie",
 			        "balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> 원</span></span> ([[percents]]%)</span>",
				"showZeroSlices": true,		//20160622(성책추가, 마이너스 금액이 뜰경우 그래프 표현이 안되어 정보만이라도 표시)
				"minRadius": 50,
				"maxLabelWidth":50,
				"titleField": "name",
				"valueField": "value",
				"fontSize": 12,
				"theme": "dark",
			        "labelsEnabled": true,
			        "legend": {
			        "enabled": false,
				  "truncateLabels": 10 // custom parameter
			    },
				"allLabels": [],
				"balloon": {},
				"labelRadius": 1,
				"dataProvider": chartData
			});
			break;

		case "meachul_jem" :			//사이트별 매출 점유율
		console.log('사이트별 매출 점유율');

		chartData = AmCharts.loadJSON(ERPiaApi_url + "/JSon_Proc_graph.asp?kind=meachul_jem&value_kind=meachul_jem&admin_code=" + admin_code + "&swm_gu=" + gu)
			// for (var i in chartData) {
			//   chartData[i].litres = chartData[i].value;
			//   chartData[i].absValue = Math.abs(chartData[i].value);
			// }


			var chart = AmCharts.makeChart("meachul_jem", {
				"type": "pie",
				"startDuration": 1, //차트 애니메이션
 			     "balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<span style='font-size:20px;'>[[value]]원</span> ([[percents]]%)</span>",
				"minRadius": 50,
				"maxLabelWidth":50,
				"titleField": "name",
				"valueField": "value",//"value",
				"fontSize": 12,
				"theme": "dark",
				"startDuration": 1,
			    "labelsEnabled": true,
			    "legend": {
			      "enabled": false,
				  "truncateLabels": 10 // custom parameter
			    },
				"allLabels": [],
				"balloon": {},
				"labelRadius": 1,
				 "dataProvider": chartData
			});

			break;

		case "brand_top5" :			//브랜드별 매출 Top 5
		console.log('브랜드별 매출 Top 5');

		chartData = AmCharts.loadJSON(ERPiaApi_url + "/JSon_Proc_graph.asp?kind=brand_top5&value_kind=brand_top5&admin_code=" + admin_code + "&swm_gu=" + gu)

			var chart = AmCharts.makeChart("brand_top5", {
				"type": "serial",
				"startDuration": 1, //차트 애니메이션
				 "theme": "dark",
				"categoryField": "name",
				"rotate": true,
				"autoMarginOffset": 40,
				"autoMargins": false,
				"marginBottom": 40,
				"marginRight": 40,
				"marginTop": 40,
				"marginLeft": 20,
				"categoryAxis": {
					"gridPosition": "middle",
					"position": "left",
					"inside": true,
					"labelFunction": function(label) {
					  if (label.length > 10)
						return label.substr(0, 10) + '...';
					  return label;
					}
				},
				"trendLines": [],
				"graphs": [
					{
					"fillAlphas": 0.9,
					"lineAlpha": 0.2,
					"title": "금액",
					"type": "column",
					"valueAxis": "ValueAxis-1",
					"balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> 원</span>",
					"valueField": "value"
				},{
					"bullet": "square",
					"bulletBorderAlpha": 1,
					"bulletBorderThickness": 1,
					"bulletSize": 16,
					"valueAxis": "ValueAxis-2",
					"lineThickness": 3,
					"title": "수량",
					"balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> 개</span>",
					"valueField": "su"
				}],

				"guides": [],
				"prefixesOfBigNumbers": [
					{
						"number": 10000,
						"prefix": ""
					}
				],
				"valueAxes": [
					{
						"id": "ValueAxis-1",
						"position": "top",
						"title": "",
						"axisAlpha": 0,
						"usePrefixes": true
					},
					{
						"id": "ValueAxis-2",
						"title": "",
						"usePrefixes": true,
						"axisAlpha": 0,
						"precision" : 0, // 추추추
						"position": "bottom"
					}
				],
				"allLabels": [
					{
						"id": "ValueAxis-1",
						"text": "금액(만원)",
						"bold": true,
						"size": 12,
						"x": 20,
						"y": 15
					},
					{
						"id": "ValueAxis-2",
						"text": "수량(개)",
						"bold": true,
						"size": 12,
						"align": "right",
						"x": 70,
						"y": "95%"
					}
				],
				"balloon": {},
				"titles": [],
				"dataProvider": chartData,
				"export": {
					"enabled": true
				 },
                "legend": {
					"enabled": true,
					"autoMargins": false,
					"bottom": 0,
					"top": 0,
					"left": 0,
					"right": 0,
					"verticalGap": 0,
                    "align": "center",
                    "markerType": "circle",
					"balloonText" : "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>"
                }
			});

			break;

		case "meachul_top5" :			//상품별 매출 TOP5
		console.log('상품별 매출 TOP5');

		chartData = AmCharts.loadJSON(ERPiaApi_url + "/JSon_Proc_graph.asp?kind=meachul_top5&value_kind=meachul_top5&admin_code=" + admin_code + "&swm_gu=" + gu)

			var chart = AmCharts.makeChart("meachul_top5", {
				"type": "serial",
				"startDuration": 1,
				 "theme": "dark",
				"categoryField": "name",
				"rotate": true,
				"autoMarginOffset": 10,
				"autoMargins": false,
				"marginBottom": 40,
				"marginRight": 40,
				"marginTop": 50,
				"marginLeft": 20,
				"categoryAxis": {
					"gridPosition": "middle",
					"position": "left",
					"inside": true,
					"labelFunction": function(label) {
					  if (label.length > 10)
						return label.substr(0, 10) + '...';
					  return label;
					}
				},
				"graphs": [
					{
					"fillAlphas": 0.9,
					"lineAlpha": 0.2,
					"title": "금액", //금액
					"type": "column",
					"valueAxis": "ValueAxis-1",
					"balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> 원</span>",
					"valueField": "value"
				},{
					"bullet": "square",
					"bulletBorderAlpha": 1,
					"bulletBorderThickness": 1,
					"bulletSize": 16,
//					"id": "AmGraph-2",
					"valueAxis": "ValueAxis-2",
					"lineThickness": 3,
					"title": "수량", //수량
					"balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> 개</span>",
					"valueField": "su"
				}],
				"prefixesOfBigNumbers": [
					{
						"number": 10000,
						"prefix": ""
					}
				],
				"allLabels": [
					{
						"id": "ValueAxis-1",
						"text": "금액(만원)",
						"bold": true,
						"size": 12,
						"x": 20,
						"y": 15
					},
					{
						"id": "ValueAxis-2",
						"text": "수량(개)",
						"bold": true,
						"size": 12,
						"align": "right",
						"x": 80,
						"y": "93%"
					}
				],
				"valueAxes": [
					{
						"id": "ValueAxis-1",
						"position": "top",
						"title": "",
						"axisAlpha": 0,
						"usePrefixes": true
					},
					{
						"id": "ValueAxis-2",
						"title": "",
						"usePrefixes": true,
						"axisAlpha": 0,
						"precision" : 0, //// 추가!
						"position": "bottom"
					}
				],
				"dataProvider": chartData,
				"export": {
					"enabled": true
				 },
                "legend": {
					"enabled": true,
					"autoMargins": false,
					"bottom": 0,
					"top": 0,
					"left": 0,
					"right": 0,
					"verticalGap": 0,
                    "align": "center",
                    "markerType": "circle",
					"balloonText" : "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>"
                }
			});

			break;

		// case "scm" :		//scm
		// console.log('scm');
		// chartData = AmCharts.loadJSON(ERPiaApi_url + "/JSon_Proc_graph.asp?Kind=scm&Value_Kind=scm&admin_code=" + admin_code + "&swm_gu=" + gu)

		// 	var chart = AmCharts.makeChart("scm", {
		// 		"type": "serial",
		// 		"startDuration": 1, //차트 애니메이션
		// 	    	"theme": "dark",
		// 		"autoMarginOffset": 20,
		// 		"autoMargins": false,
		// 		"marginBottom": 60,
		// 		"marginRight": 80,
		// 		"marginTop": 10,
		// 		"marginLeft": 80,
		// 		"dataProvider": chartData ,
		// 		"prefixesOfBigNumbers": [
		// 			{
		// 				"number": 10000,
		// 				"prefix": ""
		// 			}
		// 		],
		// 		"valueAxes": [
		// 			{
		// 				"id": "ValueAxis-1",
		// 				"title": "금액",
		// 				"titleRotation": 0,
		// 				"usePrefixes": true
		// 			},
		// 			{
		// 				"id": "ValueAxis-2",
		// 				"title": "수량",
		// 				"titleRotation": 0,
		// 				"position": "right"
		// 			}
		// 		],
		// 		"graphs": [{
		// 			"balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> 개</span>",
		// 			"fillAlphas": 0.9,
		// 			"lineAlpha": 0.2,
		// 			"title": "수량",
		// 			"type": "column",
		// 			"valueAxis": "ValueAxis-2",
		// 			"valueField": "su"
		// 		}, {
		// 			"balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> 원</span>",
		// 			"fillAlphas": 0.9,
		// 			"lineAlpha": 0.2,
		// 			"title": "금액",
		// 			"type": "column",
		// 			"clustered":false,
		// 			"columnWidth":0.5,
		// 			"valueAxis": "ValueAxis-1",
		// 			"valueField": "value"
		// 		}],
		// 		"plotAreaFillAlphas": 0.1,
		// 		"categoryField": "name",
		// 		"categoryAxis": {
		// 			"gridPosition": "start",
		// 			"autoRotateAngle" : 0,
		// 			"autoRotateCount": 1,
		// 		},
		// 		"export": {
		// 			"enabled": true
		// 		 },
  //               "legend": {
  //                   "align": "center",
  //                   "markerType": "circle",
		// 			"balloonText" : "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>"
  //               }
		// 	});

		// 	break;

		case "Meachul_ik" :			//매출이익 증감율
		console.log('매출이익 증감율');

		chartData = AmCharts.loadJSON(ERPiaApi_url + "/JSon_Proc_graph.asp?kind=Meachul_ik&value_kind=Meachul_ik&admin_code=" + admin_code + "&swm_gu=" + gu)

			var chart = AmCharts.makeChart("Meachul_ik", {
			   	"type": "serial",
				"startDuration": 1, //차트 애니메이션
			    	"theme": "dark",
				"dataProvider": chartData,

				"autoMarginOffset": 1,
				"autoMargins": true,
				"marginBottom": 30,
				"marginRight": 50,
				"marginTop": 50,
				"marginLeft": 50,


				"prefixesOfBigNumbers": [
					{
						"number": 10000,
						"prefix": ""
					}
				],
				"valueAxes": [
					{
						"id": "ValueAxis-1",
						//"title": "매출이익",
						//"title": "이익액",
						"titleRotation": 0,
						//"position": "t",
						"usePrefixes": true
					},
					{
						"id": "ValueAxis-2",
						//"title": "공급이익",
						"usePrefixes": true
						//"position": "right"
					},
					{
						"id": "ValueAxis-3",
						//"title": "공급이익 증감율",
						//"title": "증감율(%)",
						"titleRotation": 0,
						//"recalculateToPercents": true,
						//"usePrefixes": true,
						"position": "right"
					},
					{
						"id": "ValueAxis-4",
						//"title": "매출이익 증감율",
						//"recalculateToPercents": true,
						//"usePrefixes": true,
						"position": "right"
					}
				],
				"allLabels": [
					{
						"id": "ValueAxis-1",
						"text": "이익액(만원)",
						"bold": true,
						"size": 12,
						"align": "left",
						"x": 20,
						"y": 20
					},
					{
						"id": "ValueAxis-2",
						"text": "",
						"align": "left",
						"x": 20,
						"y": 0
					},
					{
						"id": "ValueAxis-3",
						"text": "증감율(%)",
						"bold": true,
						"size": 12,
						"align": "right",
						"x": "98%",
						"y": 20
					},
					{
						"id": "ValueAxis-4",
						"text": "",
						"align": "right",
						"x": "98%",
						"y": 0
					}
				],
				"graphs": [{
					"balloonText": "[[category]]: <b>[[value]]</b>",
					"fillAlphas": 0.9,
					"lineAlpha": 0.2,
					"title": "공급이익",
					"type": "column",
					"valueAxis": "ValueAxis-2",
					"valueField": "value1",
					"highField": "value2",
					"lowField": "value2",
					"position" : "left"
				}, {
					"balloonText": "[[category]]: <b>[[value]]</b>",
					"fillAlphas": 0.9,
					"lineAlpha": 0.2,
					"title": "매출이익",
					"type": "column",
					"clustered":false,
					"columnWidth":0.5,
					"valueAxis": "ValueAxis-1",
					"valueField": "value2",
					"highField": "value1",
					"lowField": "value1",
					"position" : "left"
				}, {
					"id": "graph3",
					"balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> %</span>",
					"bullet": "round",
					"lineThickness": 3,
					"bulletSize": 7,
					"bulletBorderAlpha": 1,
					"bulletColor": "#FFFFFF",
					"useLineColorForBulletBorder": true,
					"bulletBorderThickness": 3,
					"fillAlphas": 0,
					"lineAlpha": 1,
					"title": "공급이익율",
					"valueField": "su1",
					"valueAxis": "ValueAxis-3",
					"highField": "su2",
					"lowField": "su2",
					"position" : "right"
				}, {
					"id": "graph4",
					"balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> %</span>",
					"bullet": "round",
					"lineThickness": 3,
					"bulletSize": 7,
					"bulletBorderAlpha": 1,
					"bulletColor": "#FFFFFF",
					"useLineColorForBulletBorder": true,
					"bulletBorderThickness": 3,
					"fillAlphas": 0,
					"lineAlpha": 1,
					"title": "매출이익율",
					"valueField": "su2",
					"valueAxis": "ValueAxis-4",
					"highField": "su1",
					"lowField": "su1",
					"position" : "right"
				  }
				],
				"plotAreaFillAlphas": 0.1,
				"categoryField": "name",
				"categoryAxis": {
					"gridPosition": "start",
					//"autoRotateAngle" : -50.4,
					//"autoRotateCount": 1,
				},
				"export": {
					"enabled": true
				 },
                "legend": {
					"enabled": true,
					"autoMargins": false,
					"bottom": 0,
					"top": 0,
					"left": 0,
					"right": 0,
					"verticalGap": 0,
                    "align": "center",
					"position": "bottom",
                    "markerType": "circle",
					"balloonText" : "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>"
                }

			});

			break;

		case "meachul_7" :			//매출 실적 추이
		console.log('매출 실적 추이');
		chartData = AmCharts.loadJSON(ERPiaApi_url + "/JSon_Proc_graph.asp?kind=meachul_7&value_kind=meachul_7&admin_code=" + admin_code + "&swm_gu=" + gu)

			var chart = AmCharts.makeChart("meachul_7", {
			"type": "serial",
			"startDuration": 1, //차트 애니메이션
			"theme": "dark",
			"addClassNames": true,

			"autoMarginOffset": 1,
			"autoMargins": true,
			"marginBottom": 30,
			"marginRight": 50,
			"marginTop": 50,
			"marginLeft": 50,

			"mouseWheelScrollEnabled": false,
			"balloon": {
				"adjustBorderColor": false,
				"horizontalPadding": 10,
				"verticalPadding": 8,
				"startDuration": 1,
				"color": "#ffffff"
			},
				"prefixesOfBigNumbers": [
							{
								"number": 10000,
								"prefix": ""
							}
				],
				"dataProvider": chartData,
				"valueAxes": [
						{
							"id": "ValueAxis-1",
							"title": "",
							"titleRotation": 0,
							"usePrefixes": true,
							"position": "left"
						},
						{
							"id": "ValueAxis-2",
							"title": "",
							"titleRotation": 0,
							"position": "right"
						}
					],
				"allLabels": [
					{
						"id": "ValueAxis-1",
						"text": "금액(만원)",
						"bold": true,
						"size": 12,
						"x": 20,
						"y": 20
					},
					{
						"id": "ValueAxis-2",
						"text": "수량(개)",
						"bold": true,
						"size": 12,
						"align": "right",
						"x": "98%",
						"y": 20
					}
				],
				   "graphs": [{
					"id": "graph1",
					"alphaField": "alpha",
					"balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> 원</span>",
					"fillAlphas": 1,
					"title": "금액(취소반품 제외)",
					"type": "column",
					"valueField": "value",
					"dashLengthField": "dashLengthColumn",
					"startDuration": 1,
					"ValueAxis": "ValueAxis-1"
				  }, {
					"id": "graph2",
					"balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> 개</span>",
					"bullet": "round",
					"lineThickness": 3,
					"bulletSize": 7,
					"bulletBorderAlpha": 1,
					"bulletColor": "#FFFFFF",
					"useLineColorForBulletBorder": true,
					"bulletBorderThickness": 3,
					"fillAlphas": 0,
					"lineAlpha": 1,
					"title": "수량(취소반품 제외)",
					"valueField": "su",
					"valueAxis": "ValueAxis-2",
					"startDuration": 1,
					"position" : "right"
				  }],
				  "categoryField": "name",
				  "categoryAxis": {
					"gridPosition": "start",
					"axisAlpha": 0,
					"tickLength": 0,
					"size": 8
				  },
				  "export": {
					"enabled": true
				  },
                "legend": {
					"enabled": true,
					"align": "center",
					"autoMargins": false,
					"bottom": 0,
					"top": 0,
					"left": 0,
					"right": 0,
					"verticalGap": 0,
                    "align": "center",
                    "markerType": "circle",
					"balloonText" : "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>"
                }
			});

			break;

		case "meaip_7" :			//매입현황
		console.log('/매입현황');

		chartData = AmCharts.loadJSON(ERPiaApi_url + "/JSon_Proc_graph.asp?kind=meaip_7&value_kind=meaip_7&admin_code=" + admin_code + "&swm_gu=" + gu)

			var chart = AmCharts.makeChart("meaip_7", {
			   	"type": "serial",
			    	"startDuration": 1, //차트 애니메이션
				"theme": "dark",
				"dataProvider": chartData,
				"autoMargins": true,
				"marginBottom": 30,
				"marginRight": 50,
				"marginTop": 40,
				"marginLeft": 50,

				"prefixesOfBigNumbers": [
					{
						"number": 10000,
						"prefix": ""
					}
				],
				"valueAxes": [
					{
						"id": "ValueAxis-1",
						//"title": "금액",
						"titleRotation": 0,
						"usePrefixes": true
					},
					{
						"id": "ValueAxis-2",
						//"title": "수량",
						"titleRotation": 0,
						"precision" : 0,
						"position": "right"
					}
				],
				"allLabels": [
					{
						"id": "ValueAxis-1",
						"text": "금액(만원)",
						"bold": true,
						"size": 12,
						"x": 20,
						"y": 20
					},
					{
						"id": "ValueAxis-2",
						"text": "수량(개)",
						"bold": true,
						"size": 12,
						"align": "right",
						"x": "98%",
						"y": 20
					}
				],
				"graphs": [{
//					"balloonText": "수량: <b>[[value]]</b>",
					"balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> 개</span>",
					"fillAlphas": 0.9,
					"lineAlpha": 0.2,
					"title": "수량",
					"type": "column",
					"valueAxis": "ValueAxis-2",
					"valueField": "su"
				}, {
//					"balloonText": "금액: <b>[[value]]</b>",
					"balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> 원</span>",
					"fillAlphas": 0.9,
					"lineAlpha": 0.2,
					"title": "금액",
					"type": "column",
					"clustered":false,
					"columnWidth":0.5,
					"valueAxis": "ValueAxis-1",
					"valueField": "value"
				}],
				"plotAreaFillAlphas": 0.1,
				"categoryField": "name",
				"categoryAxis": {
					"gridPosition": "start",
					"autoRotateAngle" : 0,
					"autoRotateCount": 1,
				},
				"export": {
					"enabled": true
				 },
                 "legend": {
					"enabled": true,
					"autoMargins": false,
					"bottom": 0,
					"top": 0,
					"left": 0,
					"right": 0,
					"verticalGap": 0,
                    "align": "center",
                    "markerType": "circle",
					"balloonText" : "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>"
                }
			});

			break;

		case "beasonga" :			//금일 출고 현황
		console.log('금일 출고 현황');

		chartData = AmCharts.loadJSON(ERPiaApi_url + "/JSon_Proc_graph.asp?kind=beasonga&value_kind=beasonga&admin_code=" + admin_code + "&swm_gu=" + gu)
			// for (var i in chartData) {
			//   chartData[i].litres = chartData[i].value;
			//   chartData[i].absValue = Math.abs(chartData[i].value);
			// }

			var chart = AmCharts.makeChart("beasonga", {
			  "type": "pie",
			  "startDuration": 1, //차트 애니메이션
			  "theme": "dark",
			  "minRadius": 50,
			  "maxLabelWidth":50,
			  "dataProvider": chartData,
			  "titleField": "name",
			  "valueField": "value",//"value",
			  "labelRadius": 5,
			  "radius": "42%",
			  "innerRadius": "60%",
//			  "labelText": "[[title]]:[[percents]]%",
			  "labelsEnabled": true,
			  "legend": {
			    "enabled": false,
			    "truncateLabels": 10 // custom parameter
			  },
			  "balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]원</span> ([[percents]]%)</span>",
			  "export": {
				"enabled": true
			  }

			});

			break;

		case "beasong_gu" :			//택배사별 구분건수 통계
		console.log('택배사별 구분건수 통계');

		chartData = AmCharts.loadJSON(ERPiaApi_url + "/JSon_Proc_graph.asp?kind=beasong_gu&value_kind=beasong_gu&admin_code=" + admin_code + "&swm_gu=" + gu)

			var chart = AmCharts.makeChart("beasong_gu", {
					"type": "serial",
					"startDuration": 1, //차트 애니메이션
					"theme": "dark",

					"autoMarginOffset": 1,
					"autoMargins": true,

					"marginBottom": 60,
					"marginRight": 50,
					"marginTop": 30,
					"marginLeft": 50,

					"legend": {
						"horizontalGap": 10,
						"maxColumns": 1,
						"position": "right",
						"useGraphSettings": true,
						"markerSize": 10
					},
					"dataProvider": chartData,
					"valueAxes": [{
						"stackType": "regular",
						"axisAlpha": 0.3,
						"gridAlpha": 0
					}],
					"graphs": [{
						"balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> 건</span>",
						"fillAlphas": 0.8,
						"labelText": "[[value]]",
						"lineAlpha": 0.3,
						"title": "선불",
						"type": "column",
						"color": "#000000",
						"valueField": "value"
					}, {
						"balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> 건</span>",
						"fillAlphas": 0.8,
						"labelText": "[[value]]",
						"lineAlpha": 0.3,
						"title": "착불",
						"type": "column",
						"color": "#000000",
						"valueField": "value1"
					}, {
						"balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> 건</span>",
						"fillAlphas": 0.8,
						"labelText": "[[value]]",
						"lineAlpha": 0.3,
						"title": "신용",
						"type": "column",
						"color": "#000000",
						"valueField": "value2"
					}],
					"categoryField": "name",
					"categoryAxis": {
						"gridPosition": "start",
						"axisAlpha": 0,
						"gridAlpha": 0,
						"position": "left"
					},
					"export": {
						"enabled": true
					 },
				// "allLabels": [
				// 	{
				// 		"id": "Label-1",
				// 		"text": temp + sDate + " ~ " + eDate,
				// 		"x": 10,
				// 		"y": 0
				// 	}
				// ]
			});

			break;

		case "meachul_onoff" :			//온 오프라인 비교 매출
			console.log('온 오프라인 비교 매출');

			chartData = AmCharts.loadJSON(ERPiaApi_url + "/JSon_Proc_graph.asp?kind=meachul_onoff&value_kind=meachul_onoff&admin_code=" + admin_code + "&swm_gu=" + gu)
			// for (var i in chartData) {
			//   chartData[i].litres = chartData[i].value;
			//   chartData[i].absValue = Math.abs(chartData[i].value);
			// }

			var chart = AmCharts.makeChart("meachul_onoff", {
				"type": "pie",
				"startDuration": 1, //차트 애니메이션
				"balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]원</span> ([[percents]]%)</span>",
				"minRadius": 50,
				"maxLabelWidth":50,
				"labelText": "[[title]]: [[percents]]%",
				"titleField": "name",
				"valueField": "value",//"value",
				"fontSize": 12,
				"theme": "dark",
			    "labelsEnabled": true,
			    "legend": {
			      "enabled": false,
			      "truncateLabels": 10 // custom parameter
			    },
				"allLabels": [],
				"balloon": {},
				"titles": [],
				"labelRadius": 1,
				 dataProvider: chartData
			});

			break;

		case "banpum" :			//매출 반품 현황
			console.log('매출 반품 현황');
			chartData = AmCharts.loadJSON(ERPiaApi_url + "/JSon_Proc_graph.asp?kind=banpum&value_kind=banpum&admin_code=" + admin_code + "&swm_gu=" + gu)

			var chart = AmCharts.makeChart("banpum", {
				"type": "serial",
			  "startDuration": 1, //차트 애니메이션
			  "theme": "dark",
			  "addClassNames": true,
			  "autoMarginOffset": 20,
			  "autoMargins": false,
			  "marginBottom": 30,
			  "marginRight": 50,
			  "marginTop": 50,
			  "marginLeft": 50,

			  "balloon": {
				"adjustBorderColor": false,
				"horizontalPadding": 10,
				"verticalPadding": 8,
				"color": "#ffffff"
			  },
				"prefixesOfBigNumbers": [
							{
								"number": 10000,
								"prefix": ""
							}
				],
				"dataProvider": chartData,
				"valueAxes": [
						{
							"id": "ValueAxis-1",
							//"title": "금액",
							"titleRotation": 0,
							"usePrefixes": true,
							"position": "left"
						},
						{
							"id": "ValueAxis-2",
							//"title": "수량",
							"titleRotation": 0,
							"precision" : 0,
							"position": "right"
						}
					],
				"allLabels": [
					{
						"id": "ValueAxis-1",
						"text": "금액(만원)",
						"bold": true,
						"size": 12,
						"x": 20,
						"y": 20
					},
					{
						"id": "ValueAxis-2",
						"text": "수량(개)",
						"bold": true,
						"size": 12,
						"align": "right",
						"x": "98%",
						"y": 20
					}
				],
				  "graphs": [{
					"id": "graph1",
					"alphaField": "alpha",
					"balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> 원</span>",
					"fillAlphas": 1,
					"title": "금액",
					"type": "column",
					"valueField": "value",
					"dashLengthField": "dashLengthColumn",
					"ValueAxis": "ValueAxis-1"
				  }, {
					"id": "graph2",
					"balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> 개</span>",
					"bullet": "round",
					"lineThickness": 3,
					"bulletSize": 7,
					"bulletBorderAlpha": 1,
					"bulletColor": "#FFFFFF",
					"useLineColorForBulletBorder": true,
					"bulletBorderThickness": 3,
					"fillAlphas": 0,
					"lineAlpha": 1,
					"title": "수량",
					"valueField": "su",
					"valueAxis": "ValueAxis-2",
					"position" : "right"
				  }],
				  "categoryField": "name",
				  "categoryAxis": {
					"gridPosition": "start",
					"axisAlpha": 0,
					"tickLength": 0
				  },
				  "export": {
					"enabled": true
				  },
                "legend": {
					"enabled": true,
					"autoMargins": false,
					"bottom": 0,
					"top": 0,
					"left": 0,
					"right": 0,
					"verticalGap": 0,
                    "align": "center",
                    "markerType": "circle",
					"balloonText" : "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>"
                }
			});

			break;

		case "banpum_top5" 	:			//상품별 매출 반품 건수/ 반품액 Top 5
			console.log('상품별 매출 반품 건수/ 반품액 Top 5');
			chartData = AmCharts.loadJSON(ERPiaApi_url + "/JSon_Proc_graph.asp?kind=banpum_top5&value_kind=banpum_top5&admin_code=" + admin_code + "&swm_gu=" + gu)

			var chart = AmCharts.makeChart("banpum_top5", {
				"type": "serial",
			    	"startDuration": 1, //차트 애니메이션
				"theme": "dark",
				"categoryField": "name",
				"rotate": true,
				"autoMarginOffset": 40,
				"autoMargins": false,
				"marginBottom": 50,
				"marginRight": 40,
				"marginTop": 50,
				"marginLeft": 20,
				"categoryAxis": {
					"gridPosition": "middle",
					"position": "left",
					"inside": true,
					"labelFunction": function(label) {
					  if (label.length > 10)
						return label.substr(0, 10) + '...';
					  return label;
					}
				},
				"trendLines": [],
				"graphs": [
					{
					"fillAlphas": 0.9,
					"lineAlpha": 0.2,
					"title": "금액",
					"type": "column",
					"valueAxis": "ValueAxis-1",
					"balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> 원</span>",
					"valueField": "value"
				},{
					"bullet": "square",
					"bulletBorderAlpha": 1,
					"bulletBorderThickness": 1,
					"bulletSize": 16,
//					"id": "AmGraph-2",
					"valueAxis": "ValueAxis-2",
					"lineThickness": 3,
					"title": "수량",
					"balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> 개</span>",
					"valueField": "su"
				}],
				"guides": [],
				"prefixesOfBigNumbers": [
					{
						"number": 10000,
						"prefix": ""
					}
				],
				"valueAxes": [
					{
						"id": "ValueAxis-1",
						"position": "top",
						"title": "",
						"axisAlpha": 0,
						"usePrefixes": true
					},
					{
						"id": "ValueAxis-2",
						"title": "",
						"usePrefixes": true,
						"axisAlpha": 0,
						"precision" : 0,
						"position": "bottom"
					}
				],
				"allLabels": [
					{
						"id": "ValueAxis-1",
						"text": "금액(만원)",
						"bold": true,
						"size": 12,
						"x": 20,
						"y": 15
					},
					{
						"id": "ValueAxis-2",
						"text": "수량(개)",
						"bold": true,
						"size": 12,
						"align": "right",
						"x": 70,
						"y": "93%"
					}
				],
				"balloon": {},
				"titles": [],
				"dataProvider": chartData,
				"export": {
					"enabled": true
				 },
                "legend": {
					"enabled": true,
					"autoMargins": false,
					"bottom": 0,
					"top": 0,
					"left": 0,
					"right": 0,
					"verticalGap": 0,
                    "align": "center",
                    "markerType": "circle",
					"balloonText" : "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>"
                }
			});

			break;

		case "meachul_cs" :			//CS 컴플레인 현황
		console.log('CS 컴플레인 현황');
		chartData = AmCharts.loadJSON(ERPiaApi_url + "/JSon_Proc_graph.asp?kind=meachul_cs&value_kind=meachul_cs&admin_code=" + admin_code + "&swm_gu=" + gu)
			// for (var i in chartData) {
			//   chartData[i].litres = chartData[i].value;
			//   chartData[i].absValue = Math.abs(chartData[i].value);
			// }

			var chart = AmCharts.makeChart("meachul_cs", {
				"type": "pie",
				"startDuration": 1, //차트 애니메이션
				"balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]원</span> ([[percents]]%)</span>",
				"minRadius": 50,
				"maxLabelWidth":50,
				"labelText": "[[title]]: [[percents]]%",
				"titleField": "name",
				"valueField": "value",//"value",
				"fontSize": 12,
				"theme": "dark",
			    "labelsEnabled": true,
			    "legend": {
			      "enabled": false,
			      "truncateLabels": 10 // custom parameter
			    },
				"allLabels": [],
				"balloon": {},
				"titles": [],
				"labelRadius": 5,
				 dataProvider: chartData
			});

			break;

		case "meaip_commgoods" :			//상품별 매입건수/매입액 top5
			console.log('상품별 매입건수/매입액 top5');
			chartData = AmCharts.loadJSON(ERPiaApi_url + "/JSon_Proc_graph.asp?kind=meaip_commgoods&value_kind=meaip_commgoods&admin_code=" + admin_code + "&swm_gu=" + gu)

			var chart = AmCharts.makeChart("meaip_commgoods", {
				"type": "serial",
			    	"startDuration": 1, //차트 애니메이션
				"theme": "dark",
				"categoryField": "name",
				"rotate": true,
				"autoMarginOffset": 40,
				"autoMargins": false,
				"marginBottom": 40,
				"marginRight": 40,
				"marginTop": 50,
				"marginLeft": 20,
				"categoryAxis": {
					"gridPosition": "middle",
					"position": "left",
					"inside": true,
					"labelFunction": function(label) {
					  if (label.length > 10)
						return label.substr(0, 10) + '...';
					  return label;
					}
				},
				"trendLines": [],
				"graphs": [
					{
					"fillAlphas": 0.9,
					"lineAlpha": 0.2,
					"title": "금액",
					"type": "column",
					"valueAxis": "ValueAxis-1",
					"balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> 원</span>",
					"valueField": "value"
				},{
					"bullet": "square",
					"bulletBorderAlpha": 1,
					"bulletBorderThickness": 1,
					"bulletSize": 16,
//					"id": "AmGraph-2",
					"valueAxis": "ValueAxis-2",
					"lineThickness": 3,
					"title": "수량",
					"balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> 개</span>",
					"valueField": "su"
				}],
				"guides": [],
				"prefixesOfBigNumbers": [
					{
						"number": 10000,
						"prefix": ""
					}
				],
				"valueAxes": [
					{
						"id": "ValueAxis-1",
						"position": "top",
						"title": "",
						"axisAlpha": 0,
						"usePrefixes": true
					},
					{
						"id": "ValueAxis-2",
						"title": "",
						"usePrefixes": true,
						"axisAlpha": 0,
						"precision" : 0,
						"position": "bottom"
					}
				],
				"allLabels": [
					{
						"id": "ValueAxis-1",
						"text": "금액(만원)",
						"bold": true,
						"size": 12,
						"x": 20,
						"y": 15
					},
					{
						"id": "ValueAxis-2",
						"text": "수량(개)",
						"bold": true,
						"size": 12,
						"align": "right",
						"x": 70,
						"y": "95%"
					}
				],
				"balloon": {},
				"titles": [],
				"dataProvider": chartData,
				"export": {
					"enabled": true
				 },
                "legend": {
					"enabled": true,
					"autoMargins": false,
					"bottom": 0,
					"top": 0,
					"left": 0,
					"right": 0,
					"verticalGap": 0,
                    "align": "center",
                    "markerType": "circle",
					"balloonText" : "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>"
                }
			});

			break;

		case "JeGo_TurnOver" :			//재고회전율top5
			console.log('재고회전율top5');
			chartData = AmCharts.loadJSON(ERPiaApi_url + "/JSon_Proc_graph.asp?kind=JeGo_TurnOver&value_kind=JeGo_TurnOver&admin_code=" + admin_code + "&swm_gu=" + gu)

			var chart = AmCharts.makeChart("JeGo_TurnOver", {
				"type": "serial",
				 "theme": "dark",
				"categoryField": "name",
				"rotate": true,
				"startDuration": 1,

				"categoryAxis": {
					"gridPosition": "start",
					"position": "left"
				},
				"trendLines": [],
				"graphs": [
					{
					"fillAlphas": 0.9,
					"lineAlpha": 0.2,
					"title": "회전율",
					"type": "column",
					"valueAxis": "ValueAxis-1",
					"balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> %</span>",
					"valueField": "value"
				},{
					"bullet": "square",
					"bulletBorderAlpha": 1,
					"bulletBorderThickness": 1,
					"bulletSize": 16,
//					"id": "AmGraph-2",
					"valueAxis": "ValueAxis-2",
					"lineThickness": 3,
					"title": "소진 기준일",
					"balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> 일</span>",
					"valueField": "su"
				}],
				"guides": [],
				"prefixesOfBigNumbers": [
					{
						"number": 10000,
						"prefix": ""
					}
				],
				"valueAxes": [
					{
						"id": "ValueAxis-1",
						"position": "top",
						"title": "회전율",
						"axisAlpha": 0,
						"usePrefixes": true
					},
					{
						"id": "ValueAxis-2",
						"title": "소진일",
						"usePrefixes": true,
						"axisAlpha": 0,
						"position": "bottom"
					}
				],
				"allLabels": [],
				"balloon": {},
				"titles": [],
				"dataProvider": chartData,
				"export": {
					"enabled": true
				 }
			});

			break;

		case "beasongb" :			//출고현황
			console.log('출고현황');
			chartData = AmCharts.loadJSON(ERPiaApi_url + "/JSon_Proc_graph.asp?kind=beasongb&value_kind=beasongb&admin_code=" + admin_code + "&swm_gu=" + gu)

			var chart = AmCharts.makeChart("beasongb", {
			  "type": "serial",
			  "startDuration": 1, //차트 애니메이션
			  "addClassNames": true,
			  "theme": "dark",
			  
			  "autoMarginOffset": 1,
			  "autoMargins": true,
			  "marginBottom": 30,
			  "marginRight": 50,
			  "marginTop": 50,
			  "marginLeft": 50,
			  "balloon": {
				"adjustBorderColor": false,
				"horizontalPadding": 10,
				"verticalPadding": 8,
				"color": "#ffffff"
			  },
				"prefixesOfBigNumbers": [
							{
								"number": 10000,
								"prefix": ""
							}
				],
				"dataProvider": chartData,
				"valueAxes": [
						{
							"id": "ValueAxis-1",
							//"title": "건수",
							"titleRotation": 0,
							"usePrefixes": true,
							"position": "left"
						}
					],
				"allLabels": [
					{
						"id": "ValueAxis-1",
						"text": "건수",
						"bold": true,
						"size": 12,
						"x": 20,
						"y": 20
					}
				],
				  "graphs": [{
					"id": "graph1",
					"alphaField": "alpha",
					"balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> 건</span>",
					"fillAlphas": 1,
					"title": "건수",
					"type": "column",
					"valueField": "value",
					"dashLengthField": "dashLengthColumn",
					"ValueAxis": "ValueAxis-1"
				  }],
				  "categoryField": "name",
				  "categoryAxis": {
					"gridPosition": "start",
					"axisAlpha": 0,
					"tickLength": 0
				  },
				  "export": {
					"enabled": true
				  }
			});

			break;

		default :
			break;

	}

	if(chart.dataProvider[0].name == undefined || chart.dataProvider[0].name == ''){
		$("button[name=btnGrid]").css('background', '#7b7b7b');
		$("button[name=btnGrid]").css('color', '#686868');
	}else{
		$("button[name=btnGrid]").css('background', '#ececed');
		$("button[name=btnGrid]").css('color', '#444444');
	}

}
