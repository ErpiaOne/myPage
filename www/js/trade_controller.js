/* 거래명세표 컨트롤러 - 이경민[2016-01] */
angular.module('starter.controllers').controller('tradeCtrl', function($scope, $rootScope, $state, $ionicSlideBoxDelegate, $cordovaToast, $ionicModal, $ionicHistory, $location
	, tradeDetailService, ERPiaAPI, $cordovaSocialSharing, $cordovaFileTransfer, $ionicPopup, app){
	$scope.email ={
		toemail : ''
	};

	/* 거래명세서 상세페이지모달 - 이경민[2015-12] */
	$ionicModal.fromTemplateUrl('side/trade_Detail.html',{
		scope : $scope
	}).then(function(modal){
		$rootScope.trade_Detail_Modal = modal;
	});

	$scope.check = {};
	$scope.tradeList = {};
	$scope.pg = 1; // 거래명세서 페이징
	$scope.YNcheck='all'; // 전체보기 디폴트

	/* 거래명세서정보 업로드 - 이경민[2015-12] */
	$scope.reload_tradelist = function(){
		$rootScope.loadingani();
		if($scope.YNcheck == 'all'){
			if($rootScope.userType == 'SCM' || $rootScope.userType == "Normal"){ /* 각각의 로그인 타입별로 보여지는 화면을 다르게 표시 */
				$scope.tradeList.Title = '매출거래처 수신함';
				$scope.tradeList.MeaipMeachul = '매출일';
				$scope.tradeList.Publisher = '발행처';
				$scope.tradeList.isRead = '열람';
				$scope.pg = 1;

				if($rootScope.userType == 'SCM') var type = 'S';
				else var type = 'N';

				/* 거래명세서 리스트조회 - 이경민[2015-12] */
				tradeDetailService.tradeList($scope.loginData.Admin_Code, $rootScope.userData.GerCode, type, $scope.pg)
				.then(function(response){
					if(response.list.length == 0) {
						$scope.haveList = 'N';	// 확인할 명세서가 없습니다. <--구분
						$scope.moreloading=1;
						$scope.maxover=1;
					}else{
						$scope.haveList = 'Y';
						$scope.moreloading=0;
						$scope.pageCnt=1;
						$scope.items = response.list;
						if(response.list.length < 10){
							$scope.maxover = 1;
						}else{
							$scope.maxover=0;
						}
					}
				})
			}else if($rootScope.userType == 'ERPia' || $rootScope.userType == 'Guest'){
				var type = 'E';
				$scope.tradeList.Title = '매출거래처 발송 내역';
				$scope.tradeList.MeaipMeachul = '매입일';
				$scope.tradeList.Publisher = '발송처';
				$scope.tradeList.isRead = '수신확인';
				$scope.pg = 1;

				/* ERPIA거래명세서 조회 - 이경민[2016-01] */
				tradeDetailService.getCntNotRead($scope.loginData.Admin_Code, 'N', type, $scope.pg)
				.then(function(response){
					if(response.list.length == 0) {
						$scope.haveList = 'N';
						$scope.moreloading=1;
					}else{
						$scope.haveList = 'Y';
						$scope.items = response.list;
						$scope.pageCnt=1;
						$scope.moreloading=0;
						if(response.list.length < 10){
							$scope.maxover = 1;
						}else{
							$scope.maxover=0;
						}
					}
				})
			}
		}else{
			$scope.itemsN = [];
			if($scope.haveList == 'N'){
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회할 데이터가 없습니다.', 'long', 'center');
				else alert('조회할 데이터가 없습니다.');
			}else{
				for(var i =0; i < $scope.items.length; i++){
					if($scope.items[i].readYN != 'Y'){
						$scope.itemsN.push($scope.items[i]);
					}
				}

				$scope.items.splice(0, $scope.items.length-1);
				$scope.items = $scope.itemsN;	
			}
		}
	}

	/* 업로드 시간 새로고침 - 이경민[2016-01] */
	$scope.refresh_time = function(){
		var d= new Date();
		var month = d.getMonth() + 1;
		var day = d.getDate();
		var nowTime = (d.getHours() < 10 ? '0':'') + d.getHours() + ":"
		nowTime += (d.getMinutes() < 10 ? '0':'') + d.getMinutes() + ":";
		nowTime += (d.getSeconds() < 10 ? '0':'') + d.getSeconds();
		var nowday = d.getFullYear() + '-' + (month<10 ? '0':'') + month + '-' + (day<10 ? '0' : '') + day;
		$scope.nowtime =  nowday + ' ' + nowTime;
	}
	$scope.refresh_time();

	/* 거래명세표 새로고침 - 이경민[2016-01] */
	$scope.trade_refresh = function(){
		$scope.refresh_time();
		$scope.reload_tradelist();
		$scope.loadingani();
	}

	/*거래명세서 더보기 - 이경민[2016-01] */
	$scope.search_more = function(maxover, checkYN){
		if(maxover == 0){
			$rootScope.loadingani();
		}
		
		if($rootScope.userType == 'SCM' || $rootScope.userType == "Normal"){
			if($rootScope.userType == 'SCM')	var type = 'S';
			else var type = 'N';
			$scope.pg = parseInt($scope.pg) + 1;

			tradeDetailService.tradeList($scope.loginData.Admin_Code, $rootScope.userData.GerCode, type, $scope.pg)
			.then(function(response){
				if(response.list.length < 10) {
					for(var i = 0; i < response.list.length; i++){
						$scope.items.push(response.list[i]);
					}
					$scope.maxover=1;
					$scope.haveList = 'Y';

				}else if(response.list.length == 0) {
					$scope.haveList = 'Y';
					$scope.maxover=1;
				}else{
					for(var i = 0; i < response.list.length; i++){
						$scope.items.push(response.list[i]);
					}
					$scope.haveList = 'Y';
				    	$scope.pageCnt=1;
				    	$scope.maxover=0;
				}


				if(checkYN == 'not'){
						$scope.itemsN = [];
						for(var i =0; i < $scope.items.length; i++){
							if($scope.items[i].readYN != 'Y'){
								$scope.itemsN.push($scope.items[i]);
							}
						}
						$scope.items.splice(0, $scope.items.length-1);
						$scope.items = $scope.itemsN;
					}
			})
		}else if($rootScope.userType == 'ERPia'){
			var type = 'E';
			if($scope.maxover != 1){
				$scope.pg = parseInt($scope.pg) + 1;
				tradeDetailService.getCntNotRead($scope.loginData.Admin_Code, 'N', type, $scope.pg)
				.then(function(response){
					if(response.list.length < 10) {
						for(var i = 0; i < response.list.length; i++){
							$scope.items.push(response.list[i]);
						}
						$scope.maxover=1;
						$scope.haveList = 'Y';

					}else if(response.list.length == 0) {
						$scope.haveList = 'Y';
						$scope.maxover=1;
					}else{
						for(var i = 0; i < response.list.length; i++){
							$scope.items.push(response.list[i]);
						}
						$scope.haveList = 'Y';
					    	$scope.pageCnt=1;
					    	$scope.maxover=0;
					}


					if(checkYN == 'not'){
						$scope.itemsN = [];
						for(var i =0; i < $scope.items.length; i++){
							if($scope.items[i].readYN != 'Y'){
								$scope.itemsN.push($scope.items[i]);
							}
						}
						$scope.items.splice(0, $scope.items.length-1);
						$scope.items = $scope.itemsN;
					}
				})
			}
		}
	}
	$scope.reload_tradelist();

	/* 거래명세서 전체조회 & 미열람건조회 - 이경민[2016-01] */
	$scope.tradechange = function(){
		if($scope.YNcheck == 'not'){
			$scope.YNcheck = 'all';
			$scope.reload_tradelist();
		}else{
			$scope.YNcheck = "not";
			$scope.reload_tradelist();
		}
		$scope.refresh_time();
		$scope.loadingani();
	}

	/* 천단위 콤마찍기 - 이경민[2016-01] */
	function commaChange(Num){
		fl="";
		Num = new String(Num);
		if(Num.indexOf('-') > -1){	// 마이너스 금액 이슈 사항 처리
			var NumTF = "T";
			var Num2 = Num.replace("-", "");	
			Num = Num2;
		}else{
			var NumTF = 'F';
		}
		temp="";
		co=3;
		num_len=Num.length;
		while (num_len>0){
			num_len=num_len-co;
			if(num_len<0){
				co=num_len+co;
				num_len=0;
			}
			temp=","+Num.substr(num_len,co)+temp;
		}
		rResult =  fl+temp.substr(1);
		if ( NumTF == "T" ){
			rResult = '-' + rResult;
		}
		return rResult;
	}
	/* 공백이슈 통합 - 이경민[2016-01] */
	function checklist(obj){
		if(obj == null || obj == undefined){
			obj = '';
		}
		return obj;
	}
	function checklist2(obj){
		if(obj == null || obj == undefined){
			obj = '&nbsp;';
			return obj;
		}else{
			return commaChange(obj);
		}
	}/* // ---- 공백이슈 통합 - 이경민[2016-01] */

	/* 거래명세서  고유키값 채번 - 이경민[2016-01] */
	$scope.tradenumber = function(detaillist){
		$rootScope.detaillist = detaillist;
		tradeDetailService.readDetail_key($scope.loginData.Admin_Code, $rootScope.Sl_No)
		.then(function(response){
			$rootScope.Key_New_No = response.list[0].Key_New_No;
			$scope.html3image($rootScope.detaillist);
		});
	}

	/* 거래명세서 이미지화 - 이경민[2016-01] */
	$scope.html3image = function(detaillist, where){
		console.log(detaillist);
		for(var i = 0; i < detaillist.length; i++){
			var detail = detaillist[i];
			var j = i+1;
			var html_start =  "<html><body><div style='padding: 10px; width: 1080px;'>";
			var html_view1 = "<table width=1080>"
							+ "<tr>"
								+ "<td name='td_User_Date' width=300 align=left>"+ detail.MeaChul_Date + '('+$scope.loginData.UserId+')'  + "</td>"
								+ "<td width=420 align=center style='color:blue;'><u style='font-size:30px;'>거래명세표</u> (공급받는자용)</td>"
								+ "<td name='td_Sl_No_Time' style='color:blue;' width=300 align=right>No."+ $rootScope.Key_New_No+"</td>"
							+ "</tr>"
						+ "</table>";
			var html_view2 = "<table bordercolor='#0100FF' border=3 width=1080 cellspacing=0 cellpadding=0 style='BORDER-COLLAPSE: collapse;'>"
							+ "<tr>"
								+ "<td style='padding: 10px; color:blue; border-left:1px solid #0100FF; border-right:1px solid #0100FF; border-top:1px solid #0100FF; border-bottom:1px solid #0100FF;' width=25 rowspan=4 align=center>공<br/>급<br/>자</td>"
								+ "<td style='padding: 10px; color:blue; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF; border-top:1px solid #0100FF;' width=45>등 록<br/>번 호</td>"
								+ "<td name='td_SaNo1' style='padding: 10px; border-bottom:1px solid #0100FF; border-top:1px solid #0100FF;' colspan=6>" + detail.R_Sano + "</td>"
								+ "<td style='padding: 10px; color:blue; border-top:1px solid #0100FF; border-bottom:1px solid #0100FF; border-left:1px solid #0100FF; border-right:1px solid #0100FF;'  width=25 rowspan=5 align=center>공<br/>급<br/>받<br/>는<br/>자</td>"
								+ "<td style='padding: 10px; color:blue; border-bottom:1px solid #0100FF; border-top:1px solid #0100FF; border-right:1px solid #0100FF;'  width=45>등 록<br/>번 호</td>"
								+ "<td name='td_SaNo2' style='padding: 10px; border-bottom:1px solid #0100FF; border-top:1px solid #0100FF; border-right:1px solid #0100FF;'  colspan=6>" + detail.Sano + "</td>"
							+ "</tr>";
			var html_view3 = "<tr>"
								+ "<td style='padding: 10px; color:blue; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF;'>상 호</td>"
								+ "<td name='td_GerName1' style='padding: 10px; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF;' colspan=2>" + detail.R_Snm +"</td>"
								+ "<td style='padding: 10px; color:blue; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF;' width=10 colspan=2>성 명</td>"
								+ "<td name='td_userName1' style='padding: 10px; border-bottom:1px solid #0100FF;'>" + detail.R_Boss + "</td>"
								+ "<td style='padding: 10px; color:blue; border-bottom:1px solid #0100FF; border-right:1px solid #0100FF;' align=right>(인)</td>"
								+ "<td style='padding: 10px; color:blue; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF;''>상 호</td>"
								+ "<td name='td_GerName2' style='padding: 10px; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF;' colspan=3>" + detail.Snm + "</td>"
								+ "<td style='padding: 10px; color:blue; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF;' width=45>성 명</td>"
								+ "<td name='td_userName2' style='padding: 10px; border-bottom:1px solid #0100FF;'>" + detail.Boss + "</td>"
								+ "<td style='padding: 10px; color:blue; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF;' align=right>(인)</td>"
							+ "</tr>";
			var html_view4 = "<tr>"
							+ "<td style='padding: 10px; color:blue; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF;'>주 소</td>"
							+ "<td name='td_Addr1' style='padding: 10px; border-bottom:1px solid #0100FF;'colspan=6>"+detail.R_Addr+"</td>"
							+ "<td style='padding: 10px; color:blue; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF;'>주 소</td>"
							+ "<td name='td_Addr2' style='padding: 10px; border-bottom:1px solid #0100FF; border-right:1px solid #0100FF;' colspan=6>"+detail.Addr+"</td> "
						+ "</tr>";
			var html_view5 = "<tr>"
							+ "<td style='padding: 10px; color:blue; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF;'>업 태</td>"
							+ "<td name='td_UpType1' style='padding: 10px; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF;'>"+ detail.R_up +"</td>"
							+ "<td style='padding: 10px; color:blue; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF;' width=45>종 목</td>"
							+ "<td name='td_Category1' style='padding: 10px; border-bottom:1px solid #0100FF;' colspan=4>"+detail.R_jong+"</td>"
							+ "<td style='padding: 10px; color:blue; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF;''>업 태</td>"
							+ "<td name='td_UpType2' style='padding: 10px; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF;' colspan=2>"+detail.Up+"</td>"
							+ "<td style='padding: 10px; color:blue; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF;' width=45>종 목</td>"
							+ "<td name='td_Category2'style='padding: 10px; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF;' colspan=3>"+detail.Jong+"</td>"
						+ "</tr>";
			var html_view6 = "<tr>"
							+ "<td style='padding: 10px; color:blue; border-left:1px solid #0100FF; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF;' colspan=2>합계금액</td>"
							+ "<td name='td_TotAmt' style='padding: 10px; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF;' align=right>"+commaChange(detail.Hap)+"</td>"
							+ "<td style='padding: 10px; color:blue; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF;' colspan=2>전잔액</td>"
							+ "<td name='td_PreJanAmt' style='padding: 10px; border-bottom:1px solid #0100FF;' colspan=3 align=right>"+commaChange(detail.Pre_Jan_Amt)+"</td>"
							+ "<td style='padding: 10px; color:blue; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF;'>담 당</td>"
							+ "<td name='td_DamDang' style='padding: 10px; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF;' colspan=2>"+detail.G_GDamdang+"</td>"
							+ "<td style='padding: 10px; color:blue; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF;'>전 화</td>"
							+ "<td name='td_Tel' style='padding: 10px; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF;' colspan=3>"+detail.G_GDamdangTel+"</td>"
						+ "</tr>";
			var html_view7 = "<tr>"
							+  "<td style='padding: 10px; color:blue; border-bottom:1px solid #0100FF; border-left:1px solid #0100FF; border-right:1px solid #0100FF;' colspan=2>입 금 액</td>"
							+ "<td name='td_Deposit 'style='padding: 10px; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF;' align=right>"+commaChange(detail.In_Amt)+"</td>"
							+ "<td style='padding: 10px; color:blue; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF;' colspan=2>현잔액</td>"
							+ "<td name='td_NowJanAmt' style='padding: 10px; border-bottom:1px solid #0100FF;' colspan=3 align=right>" + commaChange(detail.Cur_Jan_Amt )+ "</td>"
							+ "<td style='padding: 10px; color:blue; border-bottom:1px solid #0100FF; border-left:1px solid #0100FF; border-right:1px solid #0100FF;' colspan=2>인 수 자</td>"
							+ "<td name='td_Receiver' style='padding: 10px; border-bottom:1px solid #0100FF; '>"+detail.Boss+"</td>"
							+ "<td style='padding: 10px; color: blue; border-bottom:1px solid #0100FF; border-right:1px solid #0100FF;' align='right'>(인)</td>"
							+ "<td name='td_Receiver_Mark' style='padding: 10px; color:blue; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF;' colspan=4>아래의 금액을&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;합니다.</td>"
						+ "</tr></table>";

			//두번째 테이블
			var html_view8 = "<table bordercolor='#0100FF' border=3 width=1080 style='padding: 10px; margin-top:10px; BORDER-COLLAPSE: collapse;' cellspacing=0 cellpadding=0>"
							+ "<thead style='padding: 10px; color:blue; border-bottom:1px solid #0100FF;'>"
								+ "<th width=550 style='padding: 10px; border-right:1px solid #0100FF;'' colspan=3>품목 및 규격</th>"
								+ "<th style='padding: 10px; border-right:1px solid #0100FF;'' width=97>수 량</th>"
								+ "<th style='padding: 10px; border-right:1px solid #0100FF;'' width=140>단 가</th>"
								+ "<th style='padding: 10px; border-right:1px solid #0100FF;'' width=140>공 급 가 액</th>"
								+ "<th width=140>세 액</th>"
							+ "</thead>";
			var html_view9 = "<tr>"
							+ "<td colspan=3 width=550 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;'>"+ checklist(detail.G_name1)+"</td>"
							+ "<td width=97 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;' align=right>"+checklist(detail.G_ea1)+"</td>"
							+ "<td width=140 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;' align=right>"+checklist2(detail.G_price1)+"</td>"
							+ "<td width=140 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;' align=right>"+checklist2(detail.G_Gong1)+"</td>"
							+ "<td width=140 style='padding: 10px; border-bottom: 1px solid #0100FF;' align=right>"+checklist2(detail.tax1)+"</td>"
						+ "</tr>";
			var html_view10 = "<tr>"
							+ "<td colspan=3 width=550 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;'>"+ checklist(detail.G_name2)+"</td>"
							+ "<td width=97 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;' align=right>"+checklist(detail.G_ea2)+"</td>"
							+ "<td width=140 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;' align=right>"+checklist2(detail.G_price2)+"</td>"
							+ "<td width=140 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;' align=right>"+checklist2(detail.G_Gong2)+"</td>"
							+ "<td width=140 style='padding: 10px; border-bottom: 1px solid #0100FF;' align=right>"+checklist2(detail.tax2)+"</td>"
						+ "</tr>";
			var html_view11 = "<tr>"
							+ "<td colspan=3 width=550 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;'>"+ checklist(detail.G_name3)+"</td>"
							+ "<td width=97 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;' align=right>"+checklist(detail.G_ea3)+"</td>"
							+ "<td width=140 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;' align=right>"+checklist2(detail.G_price3)+"</td>"
							+ "<td width=140 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;' align=right>"+checklist2(detail.G_Gong3)+"</td>"
							+ "<td width=140 style='padding: 10px; border-bottom: 1px solid #0100FF;' align=right>"+checklist2(detail.tax3)+"</td>"
						+ "</tr>";
			var html_view12 = "<tr>"
							+ "<td colspan=3 width=550 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;'>"+ checklist(detail.G_name4)+"</td>"
							+ "<td width=97 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;' align=right>"+checklist(detail.G_ea4)+"</td>"
							+ "<td width=140 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;' align=right>"+checklist2(detail.G_price4)+"</td>"
							+ "<td width=140 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;' align=right>"+checklist2(detail.G_Gong4)+"</td>"
							+ "<td width=140 style='padding: 10px; border-bottom: 1px solid #0100FF;' align=right>"+checklist2(detail.tax4)+"</td>"
						+"</tr>";
			var html_view13 = "<tr>"
							+ "<td colspan=3 width=550 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;'>"+ checklist(detail.G_name5)+"</td>"
							+ "<td width=97 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;' align=right>"+checklist(detail.G_ea5)+"</td>"
							+ "<td width=140 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;' align=right>"+checklist2(detail.G_price5)+"</td>"
							+ "<td width=140 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;' align=right>"+checklist2(detail.G_Gong5)+"</td>"
							+ "<td width=140 style='padding: 10px; border-bottom: 1px solid #0100FF;' align=right>"+checklist2(detail.tax5)+"</td>"
						+ "</tr>";
			var html_view14 = "<tr>"
							+ "<td colspan=3 width=550 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;'>"+ checklist(detail.G_name6)+"</td>"
							+ "<td width=97 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;' align=right>"+checklist(detail.G_ea6)+"</td>"
							+ "<td width=140 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;' align=right>"+checklist2(detail.G_price6)+"</td>"
							+ "<td width=140 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;' align=right>"+checklist2(detail.G_Gong6)+"</td>"
							+ "<td width=140 style='padding: 10px; border-bottom: 1px solid #0100FF;' align=right>"+checklist2(detail.tax6)+"</td>"
						+ "</tr>";
			var html_view15 = "<tr>"
							+ "<td colspan=3 width=550 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;'>"+ checklist(detail.G_name7)+"</td>"
							+ "<td width=97 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;' align=right>"+checklist(detail.G_ea7)+"</td>"
							+ "<td width=140 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;' align=right>"+checklist2(detail.G_price7)+"</td>"
							+ "<td width=140 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;' align=right>"+checklist2(detail.G_Gong7)+"</td>"
							+ "<td width=140 style='padding: 10px; border-bottom: 1px solid #0100FF;' align=right>"+checklist2(detail.tax7)+"</td>"
						+ "</tr>";
			var html_view16 = "<tr>"
							+ "<td colspan=3 width=550 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;'>"+ checklist(detail.G_name8)+"</td>"
							+ "<td width=97 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;' align=right>"+checklist(detail.G_ea8)+"</td>"
							+ "<td width=140 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;' align=right>"+checklist2(detail.G_price8)+"</td>"
							+ "<td width=140 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;' align=right>"+checklist2(detail.G_Gong8)+"</td>"
							+ "<td width=140 style='padding: 10px; border-bottom: 1px solid #0100FF;' align=right>"+checklist2(detail.tax8)+"</td>"
						+ "</tr>";
			var html_view17 = "<tr>"
							+ "<td colspan=3 width=550 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;'>"+ checklist(detail.G_name9)+"</td>"
							+ "<td width=97 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;' align=right>"+checklist(detail.G_ea9)+"</td>"
							+ "<td width=140 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;' align=right>"+checklist2(detail.G_price9)+"</td>"
							+ "<td width=140 style='padding: 10px; border-right:1px solid #0100FF; border-bottom: 1px solid #0100FF;' align=right>"+checklist2(detail.G_Gong9)+"</td>"
							+ "<td width=140 style='padding: 10px; border-bottom: 1px solid #0100FF;' align=right>"+checklist2(detail.tax9)+"</td>"
						+ "</tr>";
			var html_view18 = "<tr>"
							+ "<td colspan=3 width=550 style='padding: 10px; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF;'>"+ checklist(detail.G_name10)+"</td>"
							+ "<td width=97 style='padding: 10px; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF;' align=right>"+checklist(detail.G_ea10)+"</td>"
							+ "<td width=140 style='padding: 10px; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF;' align=right>"+checklist2(detail.G_price10)+"</td>"
							+ "<td width=140 style='padding: 10px; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF;' align=right>"+checklist2(detail.G_Gong10)+"</td>"
							+ "<td width=140 style='padding: 10px; border-bottom:1px solid #0100FF;' align=right>"+checklist2(detail.tax10)+"</td>"
						+ "</tr>";
			var html_view19 = "<tr>"
							+ "<td rowspan=2 style='padding: 10px; width:45px; height:100px; border-right:1px solid #0100FF;'>비 고<br/><br/>사 항</td>"
							+ "<td width=450  style='border-bottom:1px solid #fff;'>"+ detail.bigo +"</td>"
							+ "<td  style='padding: 10px; height:25px; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF; border-left:1px solid #0100FF;'>합계</td>"
							+ "<td style='padding: 10px; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF;' align=right>"+checklist(detail.numhap)+"</td>"
							+ "<td style='padding: 10px; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF;' align=right>"+""+"</td>"
							+ "<td style='padding: 10px; border-right:1px solid #0100FF; border-bottom:1px solid #0100FF;' align=right>"+checklist2(detail.H_Price)+"</td>"
							+ "<td style='padding: 10px; border-bottom:1px solid #0100FF;' align=right>"+checklist2(detail.taxhap)+"</td>"
						+ "</tr>"
						+ "<tr>"
							+ "<td colspan=6 style='border-top: 1px solid #fff;'></td>"
						+ "</tr>"
					+ "</table><span align='center'>(" + j + "/" + detaillist.length + ")</span><br>"

			var html_end =  "</div></body></html>" ;

			var html_string = html_start + html_view1 + html_view2 + html_view3 + html_view4 + html_view5 + html_view6 + html_view7 + html_view8 + html_view9  + html_view10 + html_view11 + html_view12 + html_view13 + html_view14 + html_view15 + html_view16 + html_view17 + html_view18 + html_view19 + html_end;

			var name =  $rootScope.Key_New_No;
			var admincode = detail.Admin_Code; // 저장될 파일명

			console.log('에라이 ㅌ퉤!', html_string);
			if($scope.userType == 'ERPia'){
				var Kind = 'ERPia';
			}else{
				var Kind = 'SCM';
			}
			// 저장될 이미지의 이름
			$scope.test(i,html_string,name,admincode, Kind);
		}

		if($scope.userType == 'ERPia') var login_kind = 'erpia';
		else var login_kind = 'comp';

		var Mutual = detaillist[0].R_Snm;
	    	var url = "http://www.erpia.net/mobile/GereaView_Certify.asp?admin_code=" + detail.Admin_Code + "&user_id=" + $scope.loginData.UserId + "&login_kind=" + login_kind + "&sl_no=" + $rootScope.Key_New_No + '_01';
	    	console.log('url! =>', url);
	    	$scope.shareAnywhere(url);
	}

	/* 거래명세서 이미지화된것 캔버스로 다시한번 떠서 크기 줄이고 asp로 파일전송 - 이경민[2016-01] */
	$scope.test = function(i,html_string, name,admincode,Kind){
		var iframe = document . createElement ( 'iframe' );
		document . body . appendChild ( iframe );
		var iframedoc = iframe . contentDocument || iframe . contentWindow . document ;
		iframedoc.body.innerHTML = html_string ;

		html2canvas ( iframedoc.body ,  {
			onrendered :  function ( canvas )  {
				// document . body . appendChild ( canvas );
				// document . body . removeChild ( iframe );
				/*캔버스 하나더 생성 => 캔버스 사이즈 조절*/
				// var extra_canvas = document.createElement("canvas");
				// canvas.setAttribute('width',700);
				// canvas.setAttribute('height',1020);
				// var ctx = canvas.getContext('2d');
				// ctx.drawImage(canvas,0,0,canvas.width, canvas.height,0,0,700,760);

				var imgageData = canvas.toDataURL("image/png");
				var newData = imgageData.replace('data:image/png;base64,',''); //파일
				document . body . removeChild ( iframe );
				var nameplus = i + 1;
				if(nameplus < 10){
					var imgname = name + "_0" + nameplus;
				}else{
					var imgname = name + "_" + nameplus ;
				}
				$.ajax({
					url: "http://image.erpia.net/fn_save_card_data_image.asp?Kind=" + Kind,
					method: "POST",
					data: { "imgData" : newData, "imgName" : imgname, "imgfolder" : admincode},//QueryString 방식이면, 이상하게 안됨
					error : function (data) {
					alert('죄송합니다. 잠시 후 다시 시도해주세요.');
					return false;
					}
				});
			}
		});
	}

	$scope.shareAnywhere = function(url) {
		// if(where == 'kakao'){
		// 	$cordovaSocialSharing.shareVia("com.kakao.talk","[Erpia 거래명세표] "+'('+Mutual+')'+url);
		// }else if(where == 'sms'){
		// 	$cordovaSocialSharing.shareViaSMS("[Erpia 거래명세표] "+'('+Mutual+')'+url);
		// }else{
		// 	$cordovaSocialSharing.shareViaEmail("[Erpia 거래명세표] "+'('+Mutual+')'+url, "[Erpia 거래명세표] "+'('+Mutual+')');
		// }
		$cordovaSocialSharing.share('ERPIA_Mobile' , '[ERPia 거래명세표]', null, url);
		$scope.toemail ='';
	}

	/*거래명세표 보기 */
	$scope.readTradeDetail = function(dataParam, num){
		if(num == 2){
			$rootScope.Sl_No = dataParam;
		}else{
			$rootScope.Sl_No = dataParam.substring(0, dataParam.indexOf('^'));
			var detail_title = dataParam.substring(dataParam.indexOf('^') + 1);
		}

		tradeDetailService.readDetail($scope.loginData.Admin_Code, $rootScope.Sl_No)
		.then(function(response){
			var numhap = 0; // 수량합계
			var num = 1;
			for(var i = 0; i < response.list.length; i++){
				if(response.list[i].vatYN == 'Y'){// 세액적용
					response.list[i].Hap = 0;
					switch( num ){
					case 1:
						var price = parseInt(response.list[i].G_price1)/1.1;
						price = price * parseInt(response.list[i].G_ea1);
						var gong = Math.round(price);// 반올림함수
						response.list[i].G_Gong1 = gong;
						response.list[i].Hap = parseInt(response.list[i].G_price1)* parseInt(response.list[i].G_ea1);
						response.list[i].numhap = response.list[i].G_ea1;
						response.list[i].tax1 = parseInt(response.list[i].G_price1) * parseInt(response.list[i].G_ea1) - parseInt(response.list[i].G_Gong1);
						response.list[i].pricehap = response.list[i].G_price1;
						if(response.list[i].G_ea2 == null) break;

					case 2:
						var price = parseInt(response.list[i].G_price2)/1.1;
						price = price * parseInt(response.list[i].G_ea2);
						var gong = Math.round(price);
						response.list[i].G_Gong2 = gong;
						response.list[i].Hap = parseInt(response.list[i].Hap) + parseInt(response.list[i].G_price2) * parseInt(response.list[i].G_ea2);
						response.list[i].numhap = parseInt(response.list[i].numhap) + parseInt(response.list[i].G_ea2);
						response.list[i].tax2 = parseInt(response.list[i].G_price2) * parseInt(response.list[i].G_ea2) - parseInt(response.list[i].G_Gong2);
						response.list[i].pricehap = parseInt(response.list[i].pricehap) + parseInt(response.list[i].G_price2);
						if(response.list[i].G_ea3 == null) break;

					case 3:
						var price = parseInt(response.list[i].G_price3)/1.1;
						price = price * parseInt(response.list[i].G_ea3);
						var gong = Math.round(price);
						response.list[i].G_Gong3 = gong;
						response.list[i].Hap = parseInt(response.list[i].Hap) + parseInt(response.list[i].G_price3)* parseInt(response.list[i].G_ea3);
						response.list[i].numhap = parseInt(response.list[i].numhap) + parseInt(response.list[i].G_ea3);
						response.list[i].tax3 = parseInt(response.list[i].G_price3) * parseInt(response.list[i].G_ea3) - parseInt(response.list[i].G_Gong3);
						response.list[i].pricehap = parseInt(response.list[i].pricehap) + parseInt(response.list[i].G_price3);
						if(response.list[i].G_ea4 == null) break;

					case 4:
						var price = parseInt(response.list[i].G_price4)/1.1;
						price = price * parseInt(response.list[i].G_ea4);
						var gong = Math.round(price);
						response.list[i].G_Gong4 = gong;
						response.list[i].Hap = parseInt(response.list[i].Hap) + parseInt(response.list[i].G_price4)* parseInt(response.list[i].G_ea4);
						response.list[i].numhap = parseInt(response.list[i].numhap) + parseInt(response.list[i].G_ea4);
						response.list[i].tax4 = parseInt(response.list[i].G_price4) * parseInt(response.list[i].G_ea4) - parseInt(response.list[i].G_Gong4);
						response.list[i].pricehap = parseInt(response.list[i].pricehap) + parseInt(response.list[i].G_price4);
						if(response.list[i].G_ea5 == null) break;

					case 5:
						var price = parseInt(response.list[i].G_price5)/1.1;
						price = price * parseInt(response.list[i].G_ea5);
						var gong = Math.round(price);
						response.list[i].G_Gong5 = gong;
						response.list[i].Hap = parseInt(response.list[i].Hap) + parseInt(response.list[i].G_price5)* parseInt(response.list[i].G_ea5);
						response.list[i].numhap = parseInt(response.list[i].numhap) + parseInt(response.list[i].G_ea5);
						response.list[i].tax5 = parseInt(response.list[i].G_price5) * parseInt(response.list[i].G_ea5) - parseInt(response.list[i].G_Gong5);
						response.list[i].pricehap = parseInt(response.list[i].pricehap) + parseInt(response.list[i].G_price5);
						if(response.list[i].G_ea6 == null) break;

					case 6:
						var price = parseInt(response.list[i].G_price6)/1.1;
						price = price * parseInt(response.list[i].G_ea6);
						var gong = Math.round(price);
						response.list[i].G_Gong6 = gong;
						response.list[i].Hap = parseInt(response.list[i].Hap) + parseInt(response.list[i].G_price6)* parseInt(response.list[i].G_ea6);
						response.list[i].numhap = parseInt(response.list[i].numhap) + parseInt(response.list[i].G_ea6);
						response.list[i].tax6 = parseInt(response.list[i].G_price6) * parseInt(response.list[i].G_ea6) - parseInt(response.list[i].G_Gong6);
						response.list[i].pricehap = parseInt(response.list[i].pricehap) + parseInt(response.list[i].G_price6);
						if(response.list[i].G_ea7 == null) break;

					case 7:
						var price = parseInt(response.list[i].G_price7)/1.1;
						price = price * parseInt(response.list[i].G_ea7);
						var gong = Math.round(price);
						response.list[i].G_Gong7 = gong;
						response.list[i].Hap = parseInt(response.list[i].Hap) + parseInt(response.list[i].G_price7)* parseInt(response.list[i].G_ea7);
						response.list[i].numhap = parseInt(response.list[i].numhap) + parseInt(response.list[i].G_ea7);
						response.list[i].tax7 = parseInt(response.list[i].G_price7) * parseInt(response.list[i].G_ea5) - parseInt(response.list[i].G_Gong7);
						response.list[i].pricehap = parseInt(response.list[i].pricehap) + parseInt(response.list[i].G_price7);
						if(response.list[i].G_ea8 == null) break;

					case 8:
						var price = parseInt(response.list[i].G_price8)/1.1;
						price = price * parseInt(response.list[i].G_ea8);
						var gong = Math.round(price);
						response.list[i].G_Gong8 = gong;
						response.list[i].Hap = parseInt(response.list[i].Hap) + parseInt(response.list[i].G_price8)* parseInt(response.list[i].G_ea8);
						response.list[i].numhap = parseInt(response.list[i].numhap) + parseInt(response.list[i].G_ea8);
						response.list[i].tax8 = parseInt(response.list[i].G_price8) * parseInt(response.list[i].G_ea8) - parseInt(response.list[i].G_Gong8);
						response.list[i].pricehap = parseInt(response.list[i].pricehap) + parseInt(response.list[i].G_price8);
						if(response.list[i].G_ea9 == null) break;

					case 9:
						var price = parseInt(response.list[i].G_price9)/1.1;
						price = price * parseInt(response.list[i].G_ea9);
						var gong = Math.round(price);
						response.list[i].G_Gong9 = gong;
						response.list[i].Hap = parseInt(response.list[i].Hap) + parseInt(response.list[i].G_price9)* parseInt(response.list[i].G_ea9);
						response.list[i].numhap = parseInt(response.list[i].numhap) + parseInt(response.list[i].G_ea9);
						response.list[i].tax9 = parseInt(response.list[i].G_price9) * parseInt(response.list[i].G_ea9) - parseInt(response.list[i].G_Gong9);
						response.list[i].pricehap = parseInt(response.list[i].pricehap) + parseInt(response.list[i].G_price9);
						if(response.list[i].G_ea10 == null) break;

					case 10:
						var price = parseInt(response.list[i].G_price10)/1.1;
						price = price * parseInt(response.list[i].G_ea10);
						var gong = Math.round(price);
						response.list[i].G_Gong10 = gong;
						response.list[i].Hap = parseInt(response.list[i].Hap) + parseInt(response.list[i].G_price10)* parseInt(response.list[i].G_ea10);
						response.list[i].numhap = parseInt(response.list[i].numhap) + parseInt(response.list[i].G_ea10);
						response.list[i].tax10 = parseInt(response.list[i].G_price10) * parseInt(response.list[i].G_ea10) - parseInt(response.list[i].G_Gong10);
						response.list[i].taxhap = parseInt(response.list[i].taxhap) + parseInt(response.list[i].tax10);
						response.list[i].pricehap = parseInt(response.list[i].pricehap) + parseInt(response.list[i].G_price10);
						break;

					default : console.log('여기올일 없을껄....');
					}
					var hapgu = parseInt(response.list[i].Hap)/1.1;
					response.list[i].H_Price = Math.round(hapgu);
					response.list[i].taxhap = parseInt(response.list[i].Hap) - parseInt(response.list[i].H_Price);
				}else {//세액적용 안함
					console.log('vat미포함 또는 영세율');
					switch( num ){
						case 1:
							response.list[i].numhap = response.list[i].G_ea1;
							response.list[i].taxhap = response.list[i].tax1;
							response.list[i].pricehap = response.list[i].G_price1;
							if(response.list[i].G_ea2 == null) break;

						case 2:
							response.list[i].numhap = parseInt(response.list[i].numhap) + parseInt(response.list[i].G_ea2);
							response.list[i].taxhap = parseInt(response.list[i].taxhap) + parseInt(response.list[i].tax2);
							response.list[i].pricehap = parseInt(response.list[i].pricehap) + parseInt(response.list[i].G_price2);
							if(response.list[i].G_ea3 == null) break;

						case 3:
							response.list[i].numhap = parseInt(response.list[i].numhap) + parseInt(response.list[i].G_ea3);
							response.list[i].taxhap = parseInt(response.list[i].taxhap) + parseInt(response.list[i].tax3);
							response.list[i].pricehap = parseInt(response.list[i].pricehap) + parseInt(response.list[i].G_price3);
							if(response.list[i].G_ea4 == null) break;

						case 4:
							response.list[i].numhap = parseInt(response.list[i].numhap) + parseInt(response.list[i].G_ea4);
							response.list[i].taxhap = parseInt(response.list[i].taxhap) + parseInt(response.list[i].tax4);
							response.list[i].pricehap = parseInt(response.list[i].pricehap) + parseInt(response.list[i].G_price4);
							if(response.list[i].G_ea5 == null) break;

						case 5:
							response.list[i].numhap = parseInt(response.list[i].numhap) + parseInt(response.list[i].G_ea5);
							response.list[i].taxhap = parseInt(response.list[i].taxhap) + parseInt(response.list[i].tax5);
							response.list[i].pricehap = parseInt(response.list[i].pricehap) + parseInt(response.list[i].G_price5);
							if(response.list[i].G_ea6 == null) break;

						case 6:
							response.list[i].numhap = parseInt(response.list[i].numhap) + parseInt(response.list[i].G_ea6);
							response.list[i].taxhap = parseInt(response.list[i].taxhap) + parseInt(response.list[i].tax6);
							response.list[i].pricehap = parseInt(response.list[i].pricehap) + parseInt(response.list[i].G_price6);
							if(response.list[i].G_ea7 == null) break;

						case 7:
							response.list[i].numhap = parseInt(response.list[i].numhap) + parseInt(response.list[i].G_ea7);
							response.list[i].taxhap = parseInt(response.list[i].taxhap) + parseInt(response.list[i].tax7);
							response.list[i].pricehap = parseInt(response.list[i].pricehap) + parseInt(response.list[i].G_price7);
							if(response.list[i].G_ea8 == null) break;

						case 8:
							response.list[i].numhap = parseInt(response.list[i].numhap) + parseInt(response.list[i].G_ea8);
							response.list[i].taxhap = parseInt(response.list[i].taxhap) + parseInt(response.list[i].tax8);
							response.list[i].pricehap = parseInt(response.list[i].pricehap) + parseInt(response.list[i].G_price8);
							if(response.list[i].G_ea9 == null) break;

						case 9:
							response.list[i].numhap = parseInt(response.list[i].numhap) + parseInt(response.list[i].G_ea9);
							response.list[i].taxhap = parseInt(response.list[i].taxhap) + parseInt(response.list[i].tax9);
							response.list[i].pricehap = parseInt(response.list[i].pricehap) + parseInt(response.list[i].G_price9);
							if(response.list[i].G_ea10 == null) break;

						case 10:
							response.list[i].numhap = parseInt(response.list[i].numhap) + parseInt(response.list[i].G_ea10);
							response.list[i].taxhap = parseInt(response.list[i].taxhap) + parseInt(response.list[i].tax10);
							response.list[i].pricehap = parseInt(response.list[i].pricehap) + parseInt(response.list[0].G_price10);
							break;

						default : console.log('여기올일 없을껄....');
					}
				}

			}
			response.list[0].bigo = ' ';
			$scope.detail_items = response.list;
			$rootScope.trade_Detail_Modal.show();
		})
		if($scope.userType != "ERPia") tradeDetailService.chkRead($scope.loginData.Admin_Code, $rootScope.Sl_No, $scope.loginData.UserId, $rootScope.loginState) // 읽었으면!
	}

	 /* 거래명세표 사업자 번호 입력 모달 닫기 - 이경민[2016-01] */
	$scope.close_sano = function(){
		$scope.check_sano_Modal.hide();
	}
	/* 거래명세표 닫기 - 이경민[2016-01] */
	$scope.close = function(){
		$scope.reload_tradelist();
		$scope.trade_Detail_Modal.hide();
	}

	/* 프린트 (거래명세표 화면에서 프린트 버튼의 주석을 해제해야 기능을 사용할 수 있음.. 블루투스 연결까지는 확인했으나 프린트 잉크가 없어서 테스트 못함) - 이경민[2016-01] */
	$scope.print = function(){
		cordova.plugins.printer.isAvailable(
		    	function (isAvailable) {
				var page = document.getElementById('divTradeDetail_Print_Area');
				cordova.plugins.printer.print(page, 'Document.html', function () {
				    alert('printing finished or canceled')
				});
		    }
		);
	}// 각각의 타입별로 안내메세지를 다르게 표시.

	/* 거래명세서 인증모달창 인증확인 - 이경민[2016-01] */
	$scope.check_Sano = function(){
		if($rootScope.userType == "SCM" || $rootScope.userType == "Normal" ){
			if($rootScope.userData.G_Sano.substring($rootScope.userData.G_Sano.lastIndexOf('-') + 1) == $rootScope.userData.Sano || $rootScope.userData.G_Sano.substring($rootScope.userData.G_Sano.lastIndexOf('-') + 1) == ''){ 
			// if($rootScope.userData.Sano== $rootScope.userData.Sano){ //=========== 수정하고 올릴것.
				$scope.check_sano_Modal.hide();
				$ionicHistory.nextViewOptions({
					disableBack: true
				});
				$rootScope.userData.Sano = '';
				$state.go('app.tradeList');
			}else{
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('사업자 번호와 일치하지 않습니다.', 'long', 'center');
				else alert('사업자 번호와 일치하지 않습니다.');
			}
		}else if($rootScope.userType == "ERPia"){
			// $scope.loginData.Pwd = $rootScope.userData.Sano;	// ===========지우고 업데이트 할것.
			if($scope.loginData.Pwd == $rootScope.userData.Sano){
				$scope.check_sano_Modal.hide();
				$ionicHistory.nextViewOptions({
					disableBack: true
				});
				$state.go('app.tradeList');
			}else{
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('비밀번호가 일치하지 않습니다.', 'long', 'center');
				else alert('비밀번호가 일치하지 않습니다.');
			}
		}else if ($rootScope.userType == "Guest"){
			$scope.check_sano_Modal.hide();
			$ionicHistory.nextViewOptions({
				disableBack: true
			});
			$state.go('app.tradeList');
		}
	}
});