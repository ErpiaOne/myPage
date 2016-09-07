/* ERPia 차트 컨트롤러 - 이경민[2016-03] */
angular.module('starter.controllers').controller("IndexCtrl", function($rootScope, $scope, $stateParams, $q, $location, $window, $timeout, ERPiaAPI, statisticService, IndexService, $cordovaToast, app, $ionicLoading, $ionicSlideBoxDelegate, $ionicSideMenuDelegate) {


	/* 차트 리스트 목록관련 - 이경민[2016-01] */
	$scope.chartlist = false;
	$scope.chrtlistF = function(){
		if($scope.chartlist == false){
			$scope.chartlist = true;
		}else{
			$scope.chartlist = false;
		}
	}
	$scope.chart_index = 0; /*차트 현재 선택된 인덱스 저장*/

	/*차트 슬라이드 관련*/
	$scope.onTouch = function(){
		$ionicSlideBoxDelegate.enableSlide(false);
		$ionicSideMenuDelegate.canDragContent(false);
	 };

	$scope.onRelease = function(){
		$ionicSlideBoxDelegate.enableSlide(true);
		$ionicSideMenuDelegate.canDragContent(false);
	};

	$scope.nextSlide = function() {
		$ionicSlideBoxDelegate.next();
		$ionicSideMenuDelegate.canDragContent(false);
	 };

	$scope.previousSlide = function() {
		$ionicSlideBoxDelegate.previous();
		$ionicSideMenuDelegate.canDragContent(false);
	};

	$scope.dashBoard = {};
	var indexList = [];
	// 날짜
	var d= new Date();
	var month = d.getMonth() + 1;
	var day = d.getDate();
	//일주일전
	var w = new Date(Date.parse(d) -7 * 1000 * 60 * 60 * 24)
	var wMonth = w.getMonth() + 1;
	var wDay = w.getDate();

	var nowTime = (d.getHours() < 10 ? '0':'') + d.getHours() + ":"
	nowTime += (d.getMinutes() < 10 ? '0':'') + d.getMinutes() + ":";
	nowTime += (d.getSeconds() < 10 ? '0':'') + d.getSeconds();
	var nowday = d.getFullYear() + '-' + (month<10 ? '0':'') + month + '-' + (day<10 ? '0' : '') + day;
	var aWeekAgo = w.getFullYear() + '-' + (wMonth<10 ? '0':'') + wMonth + '-' + (wDay<10 ? '0' : '') + wDay;
	$rootScope.nowTime = '최근 조회 시간 :' + nowday + ' ' + nowTime;

	$scope.pushf = function(){
		console.log('여기와랑~');
	}

	/* erpia메인홈 데이터 세팅 - 이경민[2016-01] */
	$scope.ERPiaBaseData = function(){
		$scope.loadingani();
		/*금일 / 전일 매출액 조회*/
		IndexService.meachulamt($scope.loginData.Admin_Code)
		.then(function(response){
			$scope.dashBoard.M_today = response.list[0].today;
			$scope.dashBoard.M_before = response.list[0].before;
		})

		IndexService.dashBoard('erpia_dashBoard', $scope.loginData.Admin_Code, aWeekAgo, nowday)
		.then(function(processInfo){
			console.log('erpia_dashBoard', processInfo);

			$scope.dashBoard.E_NewOrder = processInfo.data.list[0].CNT_JuMun_New;
			$scope.dashBoard.E_BsComplete = processInfo.data.list[0].CNT_BS_NO;
			$scope.dashBoard.E_InputMno = processInfo.data.list[0].CNT_BS_No_M_No;
			$scope.dashBoard.E_CgComplete = processInfo.data.list[0].CNT_BS_Before_ChulGo;
			$scope.dashBoard.E_RegistMno = processInfo.data.list[0].CNT_BS_After_ChulGo_No_Upload;

			// 날짜
			var d= new Date();
			var month = d.getMonth() + 1;
			var day = d.getDate();
			var nowTime = (d.getHours() < 10 ? '0':'') + d.getHours() + ":"
			nowTime += (d.getMinutes() < 10 ? '0':'') + d.getMinutes() + ":";
			nowTime += (d.getSeconds() < 10 ? '0':'') + d.getSeconds();
			var nowday = d.getFullYear() + '-' + (month<10 ? '0':'') + month + '-' + (day<10 ? '0' : '') + day;
			$rootScope.nowTime = '최근 조회 시간 :' + nowday + ' ' + nowTime;
		},
		function(){
			if(ERPiaAPI.toast == 'Y') $cordovaToast.show('IndexService Error', 'long', 'center');
			else alert('IndexService Error');
		});
	}

	$scope.ERPiaBaseData();

	var request = null;
	var indexList = [];
	$scope.gu = 1;
	var c_line = "0";
	/* 상세표보기 - 이경민[2016-02] */
	function commaChange(Num)
	{
		Num = new String(Num)

		var numlist = Num.split('.');

		if(numlist[1] != undefined){
			Num = numlist[0];
		}

		fl=""
		temp=""
		co=3

		if(Num < 0){// 마이너스 금액일경우
			Num = Num.replace(/\-/g,'');
			fl = '-';
		}

		num_len=Num.length
		while (num_len>0)
		{
			num_len=num_len-co
			if(num_len<0)
			{
				co=num_len+co;
				num_len=0
			}
			temp=","+Num.substr(num_len,co)+temp
		}
		rResult =  fl+temp.substr(1);
		return rResult;
	}

	/* 차트에서 표시해줄 테이블 생성하는 함수 - 이경민[2016-01] */
	function insertRow(data, kind)
	{
		var strHtml = "";
		var strSubject = "";
		var strSubgu="";
		switch($('input[name=gu_hidden]').val()){
			case "1": strSubgu = " (주간)"; break;
			case "2": strSubgu = " (월간)"; break;
			case "3": strSubgu = " (년간)"; break;
		}
		var th = "<th style='color: #fff; background: #4f4f5e; font-size: 0.9em; padding:5px; white-space: nowrap;'>";
		switch (kind)
		{
			case "Meachul_halfyear" :
				strHtml = "<tr><th style='color:white'>순번</th><th style='color:white'>구분</th><th style='color:white'>온라인매출액</th><th style='color:white'>오프라인매출액</th></tr>";
				strSubject = "최근 6개월 매출액" + strSubgu;
				break;
			case "meaip_jem" :
				strHtml = "<tr>" + th +"순번</th>" + th + "구분</th>" + th + "금액</th></tr>";
				strSubject = "거래처별 매입 점유율 TOP 10" + strSubgu;
				break;
			case "meachul_jem" :
				strHtml = "<tr>" + th + "번호</th>" + th + "사이트명</th>" + th + "매출액</th></tr>";
				strSubject = "사이트별 매출 점유율"  + strSubgu ;
				break;
			case "brand_top5" :
				strHtml = "<tr>" + th + "번호</th>" + th + "브랜드명</th>" + th + "수량</th>" + th + "금액</th></tr>";
				strSubject = "브랜드별 매출 TOP 5" + strSubgu;
				break;
			case "meachul_top5" :
				strHtml = "<tr>" + th + "번호</th>" + th + "상품명</th>" + th + "수량</th>" + th + "금액</th></tr>";
				strSubject = "상품별 매출 TOP 5" + strSubgu;
				break;
			case "scm" :
				strHtml = "<tr>" + th + "번호</th>" + th + "구분</th>" + th + "수량</th>" + th + "금액</th></tr>";
				strSubject = "SCM " + strSubgu;
				break;
			case "meachul_7" :
				strHtml = "<tr>" + th + "날짜</th>" + th + "수량</th>" + th + "금액</th></tr>";
				strSubject = "매출 실적 추이" + strSubgu;
				break;
			case "meaip_7" :
				strHtml = "<tr>" + th + "번호</th>" + th + "날짜</th>" + th + "수량</th>" + th + "금액</th></tr>";
				strSubject = "매입 현황" + strSubgu;
				break;
			case "beasonga" :
				strHtml = "<tr>" + th + "순번</th>" + th + "구분</th>" + th + "건수</th></tr>";
				strSubject = "금일 출고 현황" + strSubgu;
				break;
			case "beasong_gu" :
				strHtml = "<tr>" + th + "순번</th>" + th + "구분</th>" + th + "선불</th>" + th + "착불</th>" + th + "신용</th></tr>";
				strSubject = "택배사별 구분 건수 통계" + strSubgu;
				break;
			case "meachul_onoff" :
				strHtml = "<tr>" + th + "구분</th>" + th + "금액</th></tr>";
				strSubject = "온오프라인 비교 매출" + strSubgu;
				break;
			case "banpum" :
				strHtml = "<tr>" + th + "날짜</th>" + th + "수량</th>" + th + "금액</th></tr>";
				strSubject = "매출 반품 현황" + strSubgu;
				break;
			case "banpum_top5" :
				strHtml = "<tr>" + th + "번호</th>" + th + "상품명</th>" + th + "수량</th>" + th + "금액</th></tr>";
				strSubject = "상품별 매출 반품 건수/반품액 TOP5" + strSubgu;
				break;
			case "meachul_cs" :
				strHtml = "<tr>" + th + "번호</th>" + th + "구분</th>" + th + "건수</th></tr>";
				strSubject = "CS 컴플레인 현황" + strSubgu;
				break;
			case "meaip_commgoods" :
				strHtml = "<tr>" + th + "번호</th>" + th + "상품명</th>" + th + "수량</th>" + th + "금액</th></tr>";
				strSubject = "상품별 매입건수/매입액 TOP5" + strSubgu;
				break;
			case "JeGo_TurnOver" :
				strHtml = "<tr>" + th + "순번</th>" + th + "구분</th>" + th + "소진일</th>" + th + "회전율</th></tr>";
				strSubject = "재고 회전율 TOP5" + strSubgu;
				break;
			case "beasongb" :
				strHtml = "<tr>" + th + "순번</th>" + th + "날짜</th>" + th + "건수</th></tr>";
				strSubject = "출고현황" + strSubgu;
				break;
		}

		$("div[name=gridSubject]").html("<font style='color:#000000; font-weight:bold;'>" + strSubject + "</font>");
		
		/*상세 표보기 부분 - 이경민[2016-01]*/
		var td = "<td style='font-size: 0.85em; padding: 4px; color: #2a2a2a; vertical-align: middle; font-weight: bold;'>";
		for (i=0, len=data.length; i<len; i++)
		{
			switch (kind)
			{
				case  "Meachul_halfyear":
					strHtml = strHtml + "<tr>";
					strHtml = strHtml + td;
					strHtml = strHtml +  (i+1) ;
					strHtml = strHtml + "</td>";
					strHtml = strHtml + td;
					strHtml = strHtml + data[i].category.replace("<br>", " ");
					strHtml = strHtml + "</td>";
					strHtml = strHtml + td;
					strHtml = strHtml + commaChange(data[i].c_on) + " 원";
					strHtml = strHtml + "</td>";
					strHtml = strHtml + td;
					strHtml = strHtml + commaChange(data[i].c_off) + " 원";
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "</tr>";
					break;

				case  "meaip_jem": case "meachul_jem" :
					strHtml = strHtml + "<tr>";
					strHtml = strHtml + td;
					strHtml = strHtml +  (i+1) ;
					strHtml = strHtml + "</td>";
					strHtml = strHtml + td;
					strHtml = strHtml + data[i].name;
					strHtml = strHtml + "</td>";
					strHtml = strHtml + td;
					strHtml = strHtml + commaChange(data[i].value) + "원";
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "</tr>";
					break;
				case "meachul_top5" : case "brand_top5" : case "banpum_top5" : case "meaip_7" : case "meaip_commgoods" : case "scm" :
					strHtml = strHtml + "<tr>";
					strHtml = strHtml + td;
					strHtml = strHtml +  (i+1) ;
					strHtml = strHtml + "</td>";
					strHtml = strHtml + td;
					strHtml = strHtml + data[i].name;
					strHtml = strHtml + "</td>";
					strHtml = strHtml + td;
					strHtml = strHtml + commaChange(data[i].su);
					strHtml = strHtml + "</td>";
					strHtml = strHtml + td;
					strHtml = strHtml + commaChange(data[i].value) + "원";
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "</tr>";
					break;
				case "meachul_cs": case "beasonga": case "beasongb" :
					strHtml = strHtml + "<tr>";
					strHtml = strHtml + td;
					strHtml = strHtml +  (i+1) ;
					strHtml = strHtml + "</td>";
					strHtml = strHtml + td;
					strHtml = strHtml + data[i].name;
					strHtml = strHtml + "</td>";
					strHtml = strHtml + td;
					strHtml = strHtml + commaChange(data[i].value) + "건";
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "</tr>";
					break;
				case "meachul_onoff" :
					strHtml = strHtml + "<tr>";
					strHtml = strHtml + td;
					strHtml = strHtml + data[i].name;
					strHtml = strHtml + "</td>";
					strHtml = strHtml + td;
					strHtml = strHtml + commaChange(data[i].value) + "원";
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "</tr>";
					break;
				case  "meachul_7": case "banpum": case "meaip_7":
					strHtml = strHtml + "<tr>";
					strHtml = strHtml + td;
					strHtml = strHtml + data[i].name;
					strHtml = strHtml + "</td>";
					strHtml = strHtml + td;
					strHtml = strHtml + commaChange(data[i].su);
					strHtml = strHtml + "</td>";
					strHtml = strHtml + td;
					strHtml = strHtml + commaChange(data[i].value) + "원";
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "</tr>";
					break;
				case  "beasong_gu" :
					strHtml = strHtml + "<tr>";
					strHtml = strHtml + td;
					strHtml = strHtml +  (i+1) ;
					strHtml = strHtml + "</td>";
					strHtml = strHtml + td;
					strHtml = strHtml + data[i].name;
					strHtml = strHtml + "</td>";
					strHtml = strHtml + td;
					strHtml = strHtml + commaChange(data[i].value) + "건";
					strHtml = strHtml + "</td>";
					strHtml = strHtml + td;
					strHtml = strHtml + commaChange(data[i].value1) + "건";
					strHtml = strHtml + "</td>";
					strHtml = strHtml + td;
					strHtml = strHtml + commaChange(data[i].value2) + "건";
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "</tr>";
					break;
				case  "JeGo_TurnOver" :
					strHtml = strHtml + "<tr style='color:white'>";
					strHtml = strHtml + td;
					strHtml = strHtml +  (i+1) ;
					strHtml = strHtml + "</td>";
					strHtml = strHtml + td;
					strHtml = strHtml + data[i].name;
					strHtml = strHtml + "</td>";
					strHtml = strHtml + td;
					strHtml = strHtml + commaChange(data[i].su);
					strHtml = strHtml + "</td>";
					strHtml = strHtml + td;
					strHtml = strHtml + commaChange(data[i].value) + " %";
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "</tr>";
					break;
				default :
					strHtml = strHtml + "<tr>";
					strHtml = strHtml + td;
					strHtml = strHtml + "</td>";
					strHtml = strHtml + "</tr>";
					break;
			}
		}
		$("table[name=tbGrid]").html(strHtml);
	}

	/* AmCharts에서 Json 데이터를 불러오는 함수 - 이경민[2016-01] */
	AmCharts.loadJSON = function(url, load_kind) {
		// create the request
		if (window.XMLHttpRequest) {
		// IE7+, Firefox, Chrome, Opera, Safari
			var request = new XMLHttpRequest();
		} else {
		// code for IE6, IE5
			var request = new ActiveXObject('Microsoft.XMLHTTP');
		}
		request.open('POST', url, false);
		request.send();
		if(load_kind != 'Meachul_halfyear'){
			var tmpAlert = "최근갱신일 : <br>";
		}else if(load_kind == 'Meachul_halfyear'){
			response = eval(request.responseText);
		}


		if (load_kind == "refresh")
		{	$scope.loadingani();
			response = eval(request.responseText);
			// $rootScope.time_ref = response[0].in_date;
			$.each(response[0], function(index, jsonData){
						tmpAlert += jsonData;
			});
			$("h3[name=refresh_date]").html(tmpAlert);
		}

		/* 상세 표 보기 - 이경민[2016-01] */
		if (load_kind == "gridInfo")
		{
			response = eval(request.responseText);
			$.each(response[0], function(index, jsonData){
				tmpAlert += jsonData;
			});
			/* 상세보기 그리드 생성  - 이경민[2016-01] */
			insertRow(response, $scope.kind);
		}

		if(load_kind == undefined){
			if(request.response.length < 5){
				$('div[name=loading2]').css('display','block');
			}else{
				$('div[name=loading2]').css('display','none');
				if(request.readyState == 1 || request.readyState == 2 || request.readyState == 3)
				{
					$("#loading").css("display","block");
				}
				else if(request.readyState == 4)
				{
					 if (request.status == 200)
					{
						$("#loading").css("display","none");
					}
				}
			}
		}
		return eval(request.responseText);
	};
	$scope.tabs = [];

	/* 슬라이드 될때마다 - 이경민[2016-04] */
	$scope.slideC= function(index) {
		var num = parseInt(index);
		$ionicSlideBoxDelegate.slide(num, 500);
		$scope.chartlist = false;
		$scope.loadingani();
	};
	function SimplePubSub() {
		var events = {};
		return {
			on : function(names, handler) {
				names.split(' ').forEach(function(name) {
					if (!events[name]) {
						events[name] = [];
					}
					events[name].push(handler);
				});
				return this;
			},
			trigger : function(name, args) {
				angular.forEach(events[name], function(handler) {
					handler.call(null, args);
				});
				return this;
			}
		};
	};
	
	$scope.movezero = function(tabs){
	    	var data = {
	    		index: 0
	    	}

	    	$scope.slideHasChanged(0, tabs);

	}
	$scope.events = new SimplePubSub();

	$scope.slideHasChanged = function(index, tabs) {
		$scope.events.trigger("slideChange", {
			"index" : index
		});
		$timeout(function() {
			if ($scope.onSlideMove)
				$scope.onSlideMove({
					"index" : eval(index)
				}, tabs);
		}, 100);
	};

	$scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
		$scope.events.trigger("ngRepeatFinished", {
			"event" : ngRepeatFinishedEvent
		});
	});
	
	/* ERPia 차트화면에서 위에 차트 이름을 보여주는 부분. (차트 이름을 변경시켜야 하므로 서버에 저장하고 이를 불러옴.) - 이경민[2016-04]*/
	statisticService.title('myPage_Config_Stat', 'select_Title', $scope.loginData.Admin_Code, $rootScope.loginState, $scope.loginData.UserId, $rootScope.deviceInfo.uuid)
	.then(function(data){
		for(var i =0; i < data.length; i++){
			if(data[i].visible == 'Y'){
				$scope.tabs.push(data[i]);
			}
		}
		$scope.movezero($scope.tabs);
	})

	 $scope.updateSlider = function () {
            $ionicSlideBoxDelegate.update();
        }

	$scope.kind= '', $scope.htmlCode= '';

	/* 차트를 슬라이드 할 때마다 차트가 생성되도록 하는 함수. 처음부터 모든 차트를 불러오면 너무 느려서 슬라이드할 때마다 불러오도록 변경함. - 이경민[2016-04]*/
	$scope.onSlideMove = function(data, tabs) {
		$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});
		// 로딩화면 안돌아서 추가
		$timeout(function(){
			$ionicLoading.hide();
		      
			$scope.sn = 1;
			if($scope.chartlist != false){
				data.index = parseInt(data.index);
				$scope.chartlist = false;
			}
			/*홈 차트*/
			console.log("You have selected " + data.index + " tab");
			$scope.loadingani();
			var index = data.index;

			$scope.kind = tabs[index].title;

			var module_T = '';
			switch ($scope.kind){
			case 'meaip_jem' : module_T = 'chart1'; break;
			case 'meachul_jem' : module_T = 'chart2'; break;
			case 'brand_top5' : module_T = 'chart3'; break;
			case 'meachul_top5' : module_T = 'chart4'; break;
			case 'meachul_7' : module_T = 'chart5'; break;
			case 'meaip_7' : module_T = 'chart6'; break;
			case 'beasonga' : module_T = 'chart7'; break;
			case 'beasong_gu' : module_T = 'chart8'; break;
			case 'meachul_onoff' : module_T = 'chart9'; break;
			case 'banpum' : module_T = 'chart10'; break;
			case 'banpum_top5' : module_T = 'chart11'; break;
			case 'meachul_cs' : module_T = 'chart12'; break;
			case 'meaip_commgoods' : module_T = 'chart13'; break;
			case 'JeGo_TurnOver' : module_T = 'chart14'; break;
			case 'beasongb' : module_T = 'chart15'; break;
			}
			
			$rootScope.ActsLog('chart', module_T);
			if(index > 0){
				var titlename = tabs[index].name;
			}else{
				var titlename = '최근 6개월간 매출액';
			}

			// 차트를 그리는 부분 (장선임님이 만든 ASP 참조를 참조해서 만들어야함.) - 이경민
			if($scope.kind === "beasonga" || $scope.kind == "Meachul_halfyear"){
				$scope.htmlCode2 = '<button name="btnGrid" class="btn btn-box-tool" style="height:28px;"><i class="fa fa-bars"></i></button>';

			}else{
				$scope.htmlCode2 = 		'<button name="btnW" style="height:28px;" class="btn bg-purple btn-xs" onclick="makeCharts(\''+ $scope.kind +'\',\'1\',\''+ $scope.loginData.Admin_Code +'\',\'' + ERPiaAPI.url + '\');">주간</button>'+
									'<button name="btnM" style="margin-left: 3px; height:28px;" class="btn bg-purple btn-xs" onclick="makeCharts(\''+ $scope.kind +'\',\'2\',\''+ $scope.loginData.Admin_Code +'\',\'' + ERPiaAPI.url + '\');">월간</button>'+
									'<button name="btnY" style="margin-left: 3px; height:28px;" class="btn bg-purple btn-xs" onclick="makeCharts(\''+ $scope.kind +'\',\'3\',\''+ $scope.loginData.Admin_Code +'\',\'' + ERPiaAPI.url + '\');">년간</button>&nbsp;&nbsp;&nbsp;&nbsp;'+
									'<button name="btnGrid" class="btn btn-box-tool" style="height:28px;"><i class="fa fa-bars"></i></button>';
			}

			$scope.htmlCode = '<div class="box-title" style="color:#fff; padding-top:15px; padding-bottom:10px; background: #bcb6c3; color: #000; font-weight: bold; font-size: 1.1em;">'+
							titlename+
						'</div>'+
						'<input type="hidden" name="gu_hidden">' +
						'<div class="direct-chat">'+
							'<div class="box-header" style="text-align: left; padding-left: 20px; padding-top: 13px; vertical-align: top; background: #7a6e80;">'+
								'<button class="fa fa-refresh" style="-webkit-appearance:none; -webkit-border-radius: 0; width: 28px; height: 28px; color: #fff; background: #dd8369; text-align: center; vertical-align: middle; border: 0; margin-top: -18px; margin-right: 10px; padding: 0;" name="refreshW" data-toggle="" onclick="javascript:refresh(\''+ $scope.kind +'\',\''+$scope.gu+'\',\''+ $scope.loginData.Admin_Code +'\',\'' + ERPiaAPI.url + '\');"  style="height:28px; width: 28px; vertical-align: top; color: #fff; border: 0; background-color: #dd8369;"></button>'+
								'<h3 class="box-title" name="refresh_date" style="color:#fff; height: 28px;"></h3>'+
								'<div class="pull-right">'+
									$scope.htmlCode2 +
								'</div>'+
							'</div>'+

							'<div class="box-body" style="padding:20px 10px;">'+
								'<div id=\"'+$scope.kind+'\" style="width: 100%; height: 320px;"></div>'+
								'<div name="gridBody" style="background: #ececed;">'+
									'<ul class="contacts-list">'+
										'<li>'+
											'<div name="gridSubject" style="width: 100%; height: 40px; padding-top:10px; text-align:center; background:#a6b3cb; margin-bottom: 20px;"><font style="font-weight:bold; font-size:11pt;"></font></div>'+
											'<table name="tbGrid" class="table table-bordered" style="color:rgb(100, 100, 100); width:100%; font-size:11pt; margin-bottom:10px;">'+
											'</table>'+
											'<div style="width:100%; text-align:center;">'+
												'<button name="btnGridClose" class="btn bg-orange margin">닫기</button>'+
											'</div>'+
										'</li>'+
									'</ul>'+
								'</div>'+
							'</div>'+
						'</div>';

			$('#'+data.index).html($scope.htmlCode); renewalDay($scope.kind,'1',$scope.loginData.Admin_Code,ERPiaAPI.url);
			$scope.loadingani();

			/*새로고침 버튼 클릭시 - 이경민[2016-02]*/
			$("button[name=refreshW]").click(function() {
				$("div[name=gridBody]").css('display', 'none');
				$('#' + $scope.kind).css('display', 'block');
				$scope.btn();
				if($scope.sn == 1){
					$("button[name=btnW]").click();
				}else if($scope.sn == 2){
					$("button[name=btnM]").click();
				}else if($scope.sn == 3){
					$("button[name=btnY]").click();
				}
				$scope.loadingani();

			});
			/*주간버튼 클릭시 - 이경민[2016-02]*/
			$("button[name=btnW]").click(function() {
				$scope.sn = 1;
				$("div[name=gridBody]").css('display', 'none');
				$('#' + $scope.kind).css('display', 'block');
				$scope.btn();
				$scope.loadingani();
			});
			/*월간버튼 클릭시 - 이경민[2016-02]*/
			$("button[name=btnM]").click(function() {
				$scope.sn = 2;
				$("div[name=gridBody]").css('display', 'none');
				$('#' + $scope.kind).css('display', 'block');
				$scope.btn();
				$scope.loadingani();
			});
			/*연간버튼 클릭시 - 이경민[2016-02]*/
			$("button[name=btnY]").click(function() {
				$scope.sn = 3;
				$("div[name=gridBody]").css('display', 'none');
				$('#' + $scope.kind).css('display', 'block');
				$scope.btn();
				$scope.loadingani();
			});
			
			$scope.btn = function(){ // 새로고침 버튼 색상 
				if($("button[name=btnGrid]").css('color') == 'rgb(68, 68, 68)'){   // 정보있을때
					$("button[name=btnGrid]").css('background', '#ececed');
					$("button[name=btnGrid]").css('color', '#444');
				}else{
					$("button[name=btnGrid]").css('background', '#7b7b7b');
					$("button[name=btnGrid]").css('color', '#686868');
				}
			}

			$scope.btn();

			$("button[name=btnGrid]").click(function() {
				$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});
				$timeout(function(){
					$ionicLoading.hide();
					if($("button[name=btnGrid]").css('color') == 'rgb(68, 68, 68)' ){  // 정보있을때
						if ($('div[name=gridBody]').css('display') == 'none') {
							$('div[name=gridBody]').css('display','block');
							$('#' + $scope.kind).css('display', 'none');
							$scope.gu = $("input[name=gu_hidden]").val();
							AmCharts.loadJSON(ERPiaAPI.url + "/JSon_Proc_graph.asp?kind="+ $scope.kind +"&value_kind="+ $scope.kind +"&admin_code=" + $scope.loginData.Admin_Code + "&swm_gu=" + $scope.gu + "&Ger_code=" + $rootScope.userData.GerCode, "gridInfo");
						} else {
							$("div[name=gridBody]").css('display', 'none');
							$('#' + $scope.kind).css('display', 'block');

						}
					}
				}, 500);
			});
			$("button[name=btnGridClose]").click(function() {
				$("div[name=gridBody]").css('display', 'none');
				$('#' + $scope.kind).css('display', 'block');
			});
		}, 500);
	};
})

/* 통계리포트 설정 컨트롤러 - 이경민[2015-12] */
.controller('configCtrl_statistics', function($scope, $rootScope, statisticService, publicFunction, app, ERPiaAPI){
	/* 차트타이틀 전체 조회 - 이경민[2016-12] */
	$scope.titleall = function(){
		statisticService.title('myPage_Config_Stat', 'select_Title', $scope.loginData.Admin_Code, $rootScope.loginState, $scope.loginData.UserId, $rootScope.deviceInfo.uuid)
		.then(function(data){
			$scope.items = data;
			$scope.items.splice(0,1);
		})
	}
	$scope.titleall();

	/* 뒤로가기했을경우 홈이슈 수정 - 이경민[2016-03] */
	$scope.backno = function(){
		$scope.data.showReorder = true;
		$scope.data.showDelete = true;
		$scope.items = [];
		$scope.titleall();
	}

	$scope.data = {
		showReorder : true,
		showDelete : true
	}
	$scope.rslist = 'X';

	/* 아이템을 옮길때 리스트 순서변경. - 이경민[2016-03] */
	$scope.moveItem = function(item, fromIndex, toIndex) {
		$scope.rslist = 'O';
		$scope.items.splice(fromIndex, 1);
    		$scope.items.splice(toIndex, 0, item);

		$scope.rsltList = '';
		for(var i = 0; i < $scope.items.length; i++){
			$scope.items[i].cntOrder = i+1;
			$scope.rsltList += $scope.items[i].cntOrder + '^';
			$scope.rsltList += $scope.items[i].Idx + '^';
			$scope.rsltList += $scope.items[i].visible + '^|';
		}
		console.log($scope.rsltList);

	};

	/* 순서저장 - 이경민[2016-03] */
	$scope.movesave = function(){
		if($scope.rslist != 'X'){
			$scope.rslist = 'X';
			statisticService.save('myPage_Config_Stat', 'save_Statistic', $scope.loginData.Admin_Code, $rootScope.loginState, $scope.loginData.UserId, $scope.rsltList, $rootScope.deviceInfo.uuid);
		}
	}

	/* 리스트 안보이게 - 이경민[구현예정] */
	$scope.onItemDelete = function(items, index) {
		if($scope.items[index].visible == 'Y'){
			$scope.items[index].visible = 'N';
		}else{
			$scope.items[index].visible = 'Y';
		}
		$scope.rsltList = '';
		$scope.rslist = 'O';
		for(var i = 0; i < $scope.items.length; i++){
			$scope.items[i].cntOrder = i+1;
			$scope.rsltList += $scope.items[i].cntOrder + '^';
			$scope.rsltList += $scope.items[i].Idx + '^';
			$scope.rsltList += $scope.items[i].visible + '^|';
		}
	};

});
