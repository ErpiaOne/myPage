/*매입&매출 환경설정 컨트롤러 - 이경민[2015-12]*/
angular.module('starter.controllers').controller('MconfigCtrl', function($scope, $rootScope, $ionicPopup, $ionicHistory, $cordovaToast, $state, $location, $ionicPlatform, ERPiaAPI, MconfigService, app) {
	console.log('MconfigCtrl(매입&매출 기본값 조회 컨트롤러)');
	//단가지정배열(매출) 1. 매입가 2. 도매가 3. 인터넷가 4. 소매가 5. 권장소비자가
    $scope.MchulDn = [
      { num: 0, id: '거래처등록단가' },
      { num: 1, id: '매입가' },
      { num: 2, id: '도매가' },
      { num: 3, id: '인터넷가' },
      { num: 4, id: '소매가' },
      { num: 5, id: '권장소비자가' }
    ];
    //단가지정배열(매입) 1. 매입가 2. 도매가 3. 인터넷가 4. 소매가 5. 권장소비자가
    $scope.MeaipDn = [
      { num: 0, id: '거래처등록단가' },
      { num: 1, id: '매입가' },
      { num: 2, id: '도매가' },
      { num: 3, id: '인터넷가' },
      { num: 4, id: '소매가' },
      { num: 5, id: '권장소비자가' }
    ];
    //기본매출최근등록수불 1. 최근등록수불 2. 매출출고 3. 매출반품
    $scope.configbasicS = [
      { id: '최근등록수불', num: 1 },
      { id: '매출출고', num: 2 },
      { id: '매출반품', num: 3 }
    ];
    //기본매입최근등록수불 1. 최근등록수불 2. 매입입고 3. 매입반품
    $scope.configbasicM = [
      { id: '최근등록수불', num: 1 },
      { id: '매입입고', num: 2 },
      { id: '매입반품', num: 3 }
    ];

    $scope.basicYN_M = 'N'// erpia에 기본 매장이 설정되어있는지 확인하는여부

    $rootScope.setupData={};
    $rootScope.mejanglists=[];
    $rootScope.changolists=[];
    $rootScope.mejang2 =[]; // 체인지 변수
    $scope.placeYN = {
    	yn : false
    }

	/*erpia 환경설정값*/
	MconfigService.erpia_basicSetup($scope.loginData.Admin_Code, $scope.loginData.UserId)
	.then(function(data){
		if(data.list[0].Sale_Place_Code.length == 0){
			var er_placecode = '000';
			$scope.placeYN = false;
		}else{
			var er_placecode = data.list[0].Sale_Place_Code;
			$scope.placeYN = true;
		}
		$rootScope.setupData.basic_Place_Code = er_placecode;
		/*환경설정값 있는지 먼저 불러오기.- 이경민*/
	    	MconfigService.basicSetup($scope.loginData.Admin_Code, $scope.loginData.UserId, er_placecode)
		.then(function(data){
			if(data != null){
				$rootScope.setupData = data;
			}

			/*기본 매장조회 - 이경민[2015-12]*/
			MconfigService.basicM($scope.loginData.Admin_Code, $scope.loginData.UserId)
			.then(function(data){
				$scope.mejanglists = data.list;
				
				/*기본 창고조회  - 이경민[2015-12]*/
				MconfigService.basicC($scope.loginData.Admin_Code, $scope.loginData.UserId, $rootScope.setupData.basic_Place_Code)
				.then(function(data){
					$scope.changolists = data.list;
					var gubun = false;
					for(var i = 0; i < $scope.changolists.length; i++){ 
						if($scope.changolists[i].Code == $rootScope.setupData.basic_Ch_Code){
							var gubun = true;
							break;
						}
					}
					if(gubun == false){
						$rootScope.setupData.basic_Ch_Code = '000';
					}
				})
			})
		})
	});
   	

	/*매장에따른 연계창고 조회 - 이경민[2015-12]*/
	$scope.Link_Chango = function(){
		MconfigService.basicC($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, $rootScope.setupData.basic_Place_Code)
		.then(function(data){
			console.log('여기오나?=>', $rootScope.changolists);
			$scope.changolists = [];
			console.log($rootScope.changolists);
			$scope.changolists = data.list;
			if($scope.setupData.basic_Place_Code == '000'){ //매장미지정을 선택할 경우 본사창고 디폴트
				$scope.setupData.basic_Ch_Code = '101';
			}else{
				$scope.setupData.basic_Ch_Code = '000';
			}

		})
	}

	/*뒤로 -> 취소 & 수정 & 저장 - 이경민[2015-12]*/
	$scope.configback=function(){
		$ionicPopup.show({
			title: '<b>경고</b>',
			subTitle: '',
			content: '저장하시겠습니까?',
			buttons: [
				{
					text: 'No',
					onTap: function(e){
						$ionicHistory.goBack();
					}
				},
				{
					text: 'Yes',
					type: 'button-positive',
					onTap: function(e) {
						if($rootScope.setupData.basic_Ch_Code == '000'){			//창고가 선택되지 않았을때.
							if(ERPiaAPI.toast == 'Y') $cordovaToast.show('창고를 선택해주세요.', 'short', 'center');
							else alert('창고를 선택해주세요.');
						}else {
							if($rootScope.setupData.state == 0) var mode = 'update';
							else var mode = 'insert';

							MconfigService.configIU($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, $rootScope.setupData, mode)
							.then(function(data){
								if(data.list[0].rslt == 'Y'){
									$ionicHistory.goBack();
								}else{
									if(ERPiaAPI.toast == 'Y') $cordovaToast.show('수정에 성공하지 못하였습니다', 'short', 'center');
									else alert('수정에 성공하지 못하였습니다');
								}
							})
						}
					}
				},
			]
		})
	}
})

/* 매입&매출 전표조회 컨트롤러 - 이경민[2015-12]*/
.controller('MLookupCtrl', function($scope, $rootScope, $ionicLoading, $ionicModal, $ionicHistory, $timeout, $state, $ionicScrollDelegate, $ionicPopup, $cordovaToast, $ionicSlideBoxDelegate, ERPiaAPI, MLookupService, MiuService, MconfigService, app) {
	console.log('MLookupCtrl(매입&매출 전표조회&상제조회 컨트롤러)');
	console.log('구별 =>', $rootScope.distinction);
	$ionicHistory.clearCache();
	// $ionicHistory.clearHistory();
	$scope.searchmode='normal';
	$scope.moreloading = 0;

	$scope.reqparams = {  	//날짜검색에 필요한 파라미터
		sDate : '',
		eDate : ''
	};

	$scope.date = {
		sDate1 : '',
		eDate1 : ''
	};

	/*거래처명*/
	$scope.company = {
		username : '',
		name : '', // 거래처이름
		code : 0, // 거래처 코드
		dam : '0',
		damid : '0'
	};

	/* 형변환 */
	$scope.date.sDate1 = new Date();
	$scope.date.eDate1 = new Date();
	$scope.reqparams.sDate = new Date();
	$scope.reqparams.eDate = new Date();

	$scope.lasts = 5; //결과값은 기본으로 0~4까지 5개 띄운다
	$scope.chit_lists=[]; //조회된 전표리스트

	$scope.pageCnt = 1;
	$scope.balance = false;
	$rootScope.m_no ='';

	/* 최상단으로 */
	$scope.scrollTop = function() {
    	$ionicScrollDelegate.scrollTop();
    };

	/* 오늘날짜 구하기 */
	$scope.dateMinus=function(days){
	    var nday = new Date();  //오늘 날짜..
	    nday.setDate(nday.getDate() - days); //오늘 날짜에서 days만큼을 뒤로 이동
	    var yy = nday.getFullYear();
	    var mm = nday.getMonth()+1;
	    var dd = nday.getDate();

	    if( mm<10) mm="0"+mm;
	    if( dd<10) dd="0"+dd;
	    return yy + "-" + mm + "-" + dd;
	}

	$scope.todate=$scope.dateMinus(0); // 오늘날짜


	$scope.onTouch = function(){
		$ionicSlideBoxDelegate.enableSlide(false);
	 };
	$scope.onRelease = function(){
		$ionicSlideBoxDelegate.enableSlide(true);
	};
	$scope.nextSlide = function() {
		$ionicSlideBoxDelegate.next();
	 };
	$scope.previousSlide = function() {
		$ionicSlideBoxDelegate.previous();
	};

	/* 조회시작일 - 김형석[2015-11] */
	$scope.mydate1=function(sdate1){
		var nday = new Date(sdate1);  //선택1 날짜..
		var yy = nday.getFullYear();
		var mm = nday.getMonth()+1;
		var dd = nday.getDate();
		if( mm<10) mm="0"+mm;
		if( dd<10) dd="0"+dd;
		$scope.reqparams.sDate = yy + "-" + mm + "-" + dd;
		if($scope.reqparams.sDate =="1970-01-01"){
			var nday = new Date();//오늘 날짜..
			var yy = nday.getFullYear();
			var mm = nday.getMonth()+1;
			var dd = nday.getDate();
			if( mm<10) mm="0"+mm;
			if( dd<10) dd="0"+dd;
			$scope.reqparams.sDate = yy + "-" + mm + "-" + dd;
		}
		$scope.date.sDate1=new Date($scope.reqparams.sDate);

		if($scope.date.sDate1>$scope.date.eDate1){
			$scope.reqparams.eDate = yy + "-" + mm + "-" + dd;
			$scope.date.eDate1=new Date($scope.date.sDate1);
		}
	};
	/* 조회마감일 - 김형석[2015-11] */
	$scope.mydate2=function(edate1){
		var nday = new Date(edate1);  //선택2 날짜
		var yy = nday.getFullYear();
		var mm = nday.getMonth()+1;
		var dd = nday.getDate();

		if( mm<10) mm="0"+mm;
		if( dd<10) dd="0"+dd;

		$scope.reqparams.eDate = yy + "-" + mm + "-" + dd;
		if($scope.reqparams.eDate =="1970-01-01"){
			var nday = new Date();//오늘 날짜..
			var yy = nday.getFullYear();
			var mm = nday.getMonth()+1;
			var dd = nday.getDate();
			if( mm<10) mm="0"+mm;
			if( dd<10) dd="0"+dd;
			$scope.reqparams.eDate = yy + "-" + mm + "-" + dd;
		}
		$scope.date.eDate1=new Date($scope.reqparams.eDate);

		if($scope.date.eDate1 < $scope.date.sDate1){
			$scope.reqparams.sDate = yy + "-" + mm + "-" + dd;
			$scope.date.sDate1=new Date($scope.date.eDate1);
		}
	};


	$scope.mydate1($scope.date.sDate1);
	$scope.mydate2($scope.date.eDate1);

	$scope.chit_lists = [];

	/*거래처 자동완성기능 (매입+매출 전표 마스터조회쪽) - 이경민[2016-01]*/
    	$scope.companyDatas = []; // 자동완성 배열

     	$scope.company_auto = function() {
	     	var cusname = escape($scope.company.username);
	     	if($scope.companyDatas != undefined && $scope.companyDatas.length != 0){
	     		$scope.companylatelyDatas = '';
	     		$scope.companyDatas.splice(0, $scope.companyDatas.length); 		// 이전에 검색한 데이터 목록 초기화
	     	}else{
	     		$scope.companyDatas = '';
	     	}
			MiuService.company_sear($scope.loginData.Admin_Code, $scope.loginData.UserId, cusname)
			.then(function(data){
				$scope.companyDatas = data.list;
				$scope.companylatelyDatas = '';
			})
   	}

    /*거래처 최근 검색목록 - 2016-01*/
    $scope.company_lately =  function(){
    		if($scope.company.username.length == 0){
    			var gubun = 'Ger'
    			MiuService.companyAndgoods_lately($scope.loginData.Admin_Code, $scope.loginData.UserId, gubun)
			.then(function(data){
				if(data != '<!--Parameter Check-->'){
					$scope.companylatelyDatas = [];
					for(var i = 0; i < data.list.length; i++){
						if($rootScope.distinction == 'meaip'){
							if(data.list[i].SM_Gubun == 'M' && data.list[i].Search_Ger_Name.length != 0){
								$scope.companylatelyDatas.push(data.list[i]);
							}
						}else{
							if(data.list[i].SM_Gubun == 'S' && data.list[i].Search_Ger_Name.length != 0){
								$scope.companylatelyDatas.push(data.list[i]);
							}
						}
					}
				}
			})
    		}
    }

    /*거래처창고 조회후 값저장 - 이경민[2015-12]*/
    $scope.company_Func2=function(gname,gcode,gdamid){
    		$scope.companylatelyDatas = ''; // data배열 초기화
	       	$scope.company.name=gname;
	      	 $scope.company.username = gname;
		$scope.company.code=gcode;
		if(!gdamid){
			$scope.company.dam = '0';
			$scope.company.damid = '0';
		}else{
			$scope.company.damid=gdamid;
			for(var i = 0; i < $scope.damdanglist.length; i++){
		       		if($scope.company.damid == $scope.damdanglist[i].user_id){
		       			$scope.company.dam = $scope.damdanglist[i].user_name;
		       			break;
		       		}
		       	}
		}
    }

   	 /*거래처창고 조회후 값저장 - 이경민[2015-12]*/
    	$scope.company_Func=function(gname,gcode,gdamid){
	    	$scope.companyDatas = ''; // data배열 초기화
	     	$scope.company.name=gname;
	    	$scope.company.username = gname;
		$scope.company.code=gcode;
		if(!gdamid){
			$scope.company.dam = '0';
			$scope.company.damid = '0';
		}else{
			$scope.company.damid=gdamid;
			for(var i = 0; i < $scope.damdanglist.length; i++){
		       		if($scope.company.damid == $scope.damdanglist[i].user_id){
		       			$scope.company.dam = $scope.damdanglist[i].user_name;
		       			break;
		       		}else if(i == $scope.damdanglist.length-1 && $scope.company.damid != $scope.damdanglist[i].user_id){
		       			$scope.company.dam = '0';
					$scope.company.damid = '0';
		       		}
		       	}
		}
       }

       /* 담당자 조회 - 이경민[2015-12] */
       $scope.dam = function(damdanglist){
	       	for(var i = 0; i < damdanglist.length; i++){
	       		if($scope.company.damid == damdanglist[i].user_id){
	       			$scope.company.dam = damdanglist[i].user_name;
	       			break;
	       		}
	       	}
       }

	/* 거래처명 + 기간검색 & 기간검색 - 이경민[2015-12] */
	$scope.searches = function(){
		$scope.chit_atmSum = 0;
		$scope.chit_jiSum = 0;
		$scope.balance = false;
		$scope.money.emoon = 0;
		$scope.money.hap = 0;
		$scope.chit_lists = [];
		$scope.moreloading=1;
    		$scope.pageCnt=1;
    		$scope.maxover=0;
    		$scope.companylatelyDatas = '';
    		if($scope.company.username.length != 0){
    			var gubun = 'Ger';
	    		MiuService.companyAndgoods_latelysave($scope.loginData.Admin_Code, $scope.loginData.UserId, gubun, $scope.company.username, $scope.company.code)
			.then(function(data){
			})
    		}
		$scope.loadingani();
		$scope.sear_day(1);//날짜+거래처 검색 == 금일 일주일 일개월 버튼과 구별하기위함.
	}

	$scope.money = {
		emoon : 0,
		hap : 0,
		meaipchulsum : 0
	}

	/* 금일/ 일주일/ 일개월 / 날짜만검색 - 이경민[2015-12] */
	$scope.sear_day = function(agoday) {
		$scope.chit_lists=[];
		$rootScope.end_data = [];
		$scope.chit_atmSum = 0;
		$scope.chit_jiSum = 0;
		$scope.pageCnt = 1;
		$scope.searchmode='normal'; //더보기 초기화
		$scope.loadingani();

		if(agoday != 1){
			$scope.reqparams.sDate = $scope.dateMinus(agoday);
		     	$scope.reqparams.eDate = $scope.dateMinus(0);
	     	}

	     	$scope.mydate1($scope.reqparams.sDate);
		$scope.mydate2($scope.reqparams.eDate);

		MLookupService.chit_lookup($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.reqparams, $scope.company.name, 1)
		.then(function(data){
			$scope.maxover=0;
			$scope.chit_atmSum = 0;
			$scope.chit_jiSum = 0;
			$timeout(function(){
				if(data == '<!--Parameter Check-->'){//조회된 결과 없을경우
					$scope.moreloading=0;
					$scope.maxover = 1;
					$scope.balance = false;
					$scope.money.emoon = 0;
					$scope.money.hap = 0;
					$scope.chit_atmSum = 0;
					$scope.chit_jiSum = 0;
					$scope.money.meaipchulsum = 0;
				}else{
					$scope.money.meaipchulsum = 0;
					if(data.list.length < 5){
						$scope.moreloading=0;
						$scope.maxover = 1;
					}
					var list_cnt = data.list.length;

					$scope.chit_lists = data.list;

					MLookupService.chit_lookup($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.reqparams, $scope.company.name, -1)
					.then(function(data){
						if($rootScope.distinction == 'meaip'){
							$scope.money.meaipchulsum = parseInt(data.list[0].Meaip_Amt);
						}else{
							$scope.money.meaipchulsum = parseInt(data.list[0].MeaChul_Amt);
						}
					})

					if($scope.company.code !=  0){
						MLookupService.eMoon($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.reqparams, $scope.company.code)
						.then(function(data){
							$scope.balance = true;
							$scope.money.emoon = data.list[0].Jan_Amt;
							console.log(data.list[0].All_Amt,'////', data.list[0].JiGup_Amt);
							if(data.list[0].All_Amt != null && data.list[0].All_Amt != undefined){
								$scope.money.hap = data.list[0].All_Amt;
							}else{
								$scope.money.hap = 0;
							}
							if(data.list[0].JiGup_Amt != null && data.list[0].JiGup_Amt != undefined){
								$scope.chit_jiSum = data.list[0].JiGup_Amt;
							}else{
								$scope.chit_jiSum = 0;
							}

							if( data.list[0].IpKum_Amt != null &&  data.list[0].IpKum_Amt != undefined){
								$scope.chit_atmSum = data.list[0].IpKum_Amt;
							}else{
								$scope.chit_atmSum = 0;
							}
						})
					}else{
						$scope.balance = false;
						$scope.money.emoon = 0;
						$scope.money.hap = 0;
						$scope.chit_atmSum = 0;
						$scope.chit_jiSum = 0;
					}
				}
				$scope.moreloading=0;

			}, 1000);
		})
	};
	$scope.sear_day(0);

	/*전표 더보기 - 김형석[2015-11]*/
	$scope.search_more = function() {
		$rootScope.loadingani();
		switch($scope.searchmode){
			case 'normal' :
				if($scope.chit_lists.length>0){
			  		if($scope.maxover==0){
						$scope.pageCnt+=1;

						MLookupService.chit_lookup($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.reqparams, $scope.company.name, $scope.pageCnt)
						.then(function(data){
							$timeout(function(){
								$scope.maxover=0;
								if(data == '<!--Parameter Check-->'){//조회된 결과 없을경우
									$scope.maxover = 1;
								}else{
									if(data.list.length < 5){
										$scope.maxover = 1;
										for(var m = 0; m < data.list.length; m++){
											$scope.chit_lists.push(data.list[m]);
										}
									}else{
										for(var m = 0; m < data.list.length; m++){
											$scope.chit_lists.push(data.list[m]);
										}
									}
								}
								$scope.moreloading=0;
							}, 1000);
						})
					}
				} break;

			case 'detail' :
				if($scope.chit_lists.length>0){
			  		if($scope.maxover==0){
						$scope.pageCnt+=1;

					    	MLookupService.detailSet($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.reqparams,$scope.company, $scope.detail.Place_Code, $scope.pageCnt, $scope.todate)
						.then(function(data){
							$timeout(function(){
								$scope.maxover=0;
								if(data == '<!--Parameter Check-->'){//조회된 결과 없을경우
									if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회된 데이터가 없습니다.', 'short', 'center');
									else alert('조회된 데이터가 없습니다.');
									$scope.maxover = 1;
								}else{
									for(var m = 0; m < data.list.length; m++){
										$scope.chit_lists.push(data.list[m]);
									}
								}
							}, 1000);
						})
					}
				} break;
		}
	};

	/*거래처명 초기화 - 이경민[2015-12]*/
	$scope.clearcompany = function(){
		$scope.companyDatas = '';
		$scope.companylatelyDatas = '';
		$scope.company.username = '';
		$scope.company.name = '';
		$scope.company.code = 0;
	}

	/* 매입전표 조회 - 이경민[2015-12] */
	$scope.chit_de = function(no){
		$rootScope.m_no = no;
		$ionicHistory.clearCache();
		// $ionicHistory.clearHistory();
		if($rootScope.distinction == 'meaip') $state.go('app.meaip_depage', {}, {location:'replace'}); 	/* 매입일 경우 */
		else $state.go('app.meachul_depage', {}, {location:'replace'}); 						/* 매출일 경우 */
	}

	 /*빠른등록(매입매출통합) 모달 - 이경민[2015-12] */
	$ionicModal.fromTemplateUrl('meaipchul/quickreg_modal.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.quickregM = modal;
	});

	$scope.quicklists = []; // 빠른등록리스트 저장배열

	/* 빠른등록내역 조회 - 이경민[2015-12]*/
	$scope.quickReg = function(){
		if($scope.quicklists[0] != undefined){
			$scope.quicklists.splice(0, $scope.quicklists.length); // 배열초기화
		}
		var mode = 'select_list';
		var no = '';
		MLookupService.quickReg($scope.loginData.Admin_Code, $scope.loginData.UserId, mode, no)
		.then(function(data){
			if(data == '<!--Parameter Check-->'){
			if(ERPiaAPI.toast == 'Y') $cordovaToast.show('등록된" 빠른등록" 템플렛이 없습니다. 자주거래되는 매입/매출전표를 빠른등록으로 등록하여 보다 빠르게 등록해보세요. (기등록된 전표 상세보기에서 ★를 눌러주세요.)', 'short', 'center');
			else alert('등록된" 빠른등록" 템플렛이 없습니다. 자주거래되는 매입/매출전표를 빠른등록으로 등록하여 보다 빠르게 등록해보세요. (기등록된 전표 상세보기에서 ★를 눌러주세요.)');
			}else{
				for(var i =0; i < data.list.length; i++){
					if($rootScope.distinction == 'meaip') var no = data.list[i].iL_No;
					else var no = data.list[i].Sl_No;
						$scope.quicklists.push({
						GerCode : data.list[i].GerCode,
						GerName : data.list[i].GerName,
						GoodsName : data.list[i].GoodsName,
						Subul_kind : data.list[i].Subul_kind,
						No : no,
						checked : false
					});
				}
			}
			$scope.quickregM.show();
		})
	}

	$scope.useYN_Check_quick = function(gubun){ // 빠른등록 모달 
		switch (gubun){
			case 1 :
				if($rootScope.priv_meaip.save == 'Y' && $rootScope.priv_wongaYN == 'N'){ // 저장권한이 있으면서 원가 공개권한이 있는 사람
					$scope.quickReg();
				}else{
					if(ERPiaAPI.toast == 'Y') $cordovaToast.show('등록 권한이 없습니다.', 'long', 'center');
					else console.log('등록 권한이 없습니다.');
				}
				break;
			case 2 :
				if($rootScope.priv_meachul.save == 'Y'){
					$scope.quickReg();
				}else{
					if(ERPiaAPI.toast == 'Y') $cordovaToast.show('등록 권한이 없습니다.', 'long', 'center');
					else console.log('등록 권한이 없습니다.');
				}
				break;
		}
	}

	/* 빠른등록리스트 체크박스관련 - 이경민[2015-12] */
	$scope.quickcheck = function(index){
	 	for(var i = 0; i < $scope.quicklists.length; i++){
			if(i != index){
				$scope.quicklists[i].checked = false;
			}
  		}
	}

	/* 빠른등록리스트 저장 및 해제 - 이경민[2015-12] */
	$scope.quickde = function(){
	 	for(var i = 0; i < $scope.quicklists.length; i++){
	 		if($scope.quicklists[i].checked == true){
	 			var no = $scope.quicklists[i].No;
	 			var star = 'ion-android-star';
	 			var mode = 'unused';
	 			if(ERPiaAPI.toast == 'Y') $cordovaToast.show('빠른등록이 해제되었습니다.', 'short', 'center');
				else alert('빠른등록이 해제되었습니다.');
				MLookupService.quickReg($scope.loginData.Admin_Code, $scope.loginData.UserId, mode, no)
					.then(function(data){
				})
	 			$scope.quicklists.splice(i, 1);//체크 배열 없애기.
	 			break;
	 		}else if(i == $scope.quicklists.length-1 && $scope.quicklists[i].checked != true){ // 마지막 항목까지 true아니면 선택된 것이 없는거야.
	 			if(ERPiaAPI.toast == 'Y') $cordovaToast.show('선택 된 값이 없습니다.', 'short', 'center');
				else alert('선택 된 값이 없습니다.');
	 		}
	 	}
	}

	/* 빠른등록리스트에 추가 - 이경민[2015-12] */
	$scope.quick_i = function(){
		for(var i = 0; i < $scope.quicklists.length; i++){
			$scope.quickregM.hide();
			if($scope.quicklists[i].checked == true){
				if($rootScope.distinction == 'meaip'){
					$rootScope.iu = 'qi';
					$rootScope.mode = '등록';
					$rootScope.u_no = $scope.quicklists[i].No;
					$state.go('app.meaip_IU', {}, {location:'replace'});
					$ionicHistory.clearCache();
					// $ionicHistory.clearHistory();
				}else{
					$rootScope.iu = 'qi';
					$rootScope.mode = '등록';
					$rootScope.u_no = $scope.quicklists[i].No;
					$state.go('app.meachul_IU', {}, {location:'replace'});
					$ionicHistory.clearCache();
					// $ionicHistory.clearHistory();
				}
				break;
			}
		}
	}

	/* 빠른등록모달 취소 - 이경민[2015-12] */
	$scope.quickMcancle = function(){
		$scope.quickregM.hide();
	}

	/*등록페이지 전환 - 이경민[2015-12]*/
	$scope.meaipchul_i = function(){
		$rootScope.iu = 'i';
		$rootScope.mode='등록';
		$ionicHistory.clearCache();
		// $ionicHistory.clearHistory();

		if($rootScope.distinction == 'meaip'){
			if($rootScope.priv_meaip.master_useYN == 'Y' && $rootScope.priv_meaip.save == 'Y' && $rootScope.priv_wongaYN == 'N'){
				$state.go('app.meaip_IU', {}, {location:'replace'});
			}else{
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('등록 권한이 없습니다.', 'short', 'center');
				else console.log('등록 권한이 없습니다.');
			}
			
		}else{
			if($rootScope.priv_meachul.master_useYN == 'Y' && $rootScope.priv_meachul.save == 'Y'){
				$state.go('app.meachul_IU', {}, {location:'replace'});
			}else{
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('등록 권한이 없습니다.', 'short', 'center');
				else console.log('등록 권한이 없습니다.');
			}
			
		} 
	}

	/* 빠른등록 모달 - 이경민[2015-12] */
	$ionicModal.fromTemplateUrl('meaipchul/detailSet_modal.html', {
		scope: $scope
	}).then(function(modal){
		$scope.detailSet_modal = modal;
	});

	$scope.detail = {
		Place_Code : '0'
	}

	/*상세조회셋 슬라이드관련 - 이경민[2015-12]*/
     	$scope.slideChanged = function(index) {
     		if($rootScope.distinction == 'meaip'){
     			var module_M = 'meaip';
     			if(index == 1) var module_T = 'meaip_select_detail_lately';
     			else var module_T = 'meaip_select_detail_fast';
     		}else{
     			var module_M = 'meachul';
     			if(index == 1) var module_T = 'meachul_select_detail_lately';
     			else var module_T = 'meachul_select_detail_fast';
     		}
		switch(index) {
			case 0: console.log('I am on slide 0'); break;
			case 1: $scope.Select_OptSet('L'); $rootScope.ActsLog(module_M, module_T); $scope.loadingani(); break;
			case 2: $scope.Select_OptSet('R'); $rootScope.ActsLog(module_M, module_T); $scope.loadingani(); break;
		}
	};

    	/*조회셋 모달 - 이경민[2015-12] */
   	$scope.detailSet_openModal = function() {
		//조회셋 초기화
		$scope.company.username = '';
		$scope.company.name = '';
		$scope.company.code = 0;
		$scope.company.dam = '0';
		$scope.company.damid = '0';
		$scope.detail.Place_Code = '0';


		$scope.detailSet_modal.show();
		/*기본 매장조회 - 이경민[2015-12] */
		MconfigService.basicM($scope.loginData.Admin_Code, $scope.loginData.UserId)
		.then(function(data){
			$scope.mejanglists = data.list;
		})
		/*기본 담당자 조회 - 이경민[2015-12] */
		MLookupService.damdang($scope.loginData.Admin_Code)
		.then(function(data){
			$scope.damdanglist = data.list;
		})
	};

   	/*조회셋 검색 - 이경민[2015-12] */
	$scope.detailset_up = function(){
		$scope.searchmode='detail';
		if($scope.company.dam == '0') $scope.company.dam = '';
		if($scope.company.damid == '0') $scope.company.damid = '';
		if($scope.detail.Place_Code == '0') $scope.detail.Place_Code = '';

		var gubun = 'N'; // 매출총액조회와 매출전표조회 구분
	    	/* 조회셋 조회 - 이경민[2015-12] */
	    	MLookupService.detailSet($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.reqparams,$scope.company, $scope.detail.Place_Code, 1, $scope.todate, gubun)
		.then(function(data){
			MLookupService.lqdetail_set($scope.loginData.Admin_Code, $scope.loginData.UserId,$scope.reqparams,$scope.company,$scope.detail.Place_Code,1)
			.then(function(data){
			})

			if(data == '<!--Parameter Check-->'){
				console.log('조회된 결과 없음.');
				$scope.company.dam = '0';
				$scope.company.damid = '0';
				$scope.detail.Place_Code = '0';
			}else{
				$scope.chit_lists = [];//조회배열 초기화
				$scope.chit_lists = data.list;
				var gubun = 'Y';
				MLookupService.detailSet($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.reqparams,$scope.company, $scope.detail.Place_Code, 1, $scope.todate, gubun)
				.then(function(data){
					console.log('data =>', data);
					if($rootScope.distinction == 'meaip'){
						$scope.money.meaipchulsum = parseInt(data.list[0].Meaip_Amt);
					}else{
						$scope.money.meaipchulsum = parseInt(data.list[0].Meachul_Amt);
					}

				})

				if($scope.company.code !=  0){
					MLookupService.eMoon($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.reqparams, $scope.company.code)
					.then(function(data){
						$scope.balance = true;

						if(data.list[0].Jan_Amt != null && data.list[0].Jan_Amt != undefined){
							$scope.money.emoon = data.list[0].Jan_Amt;
						}else{
							$scope.money.emoon = 0;
						}

						if(data.list[0].All_Amt != null && data.list[0].All_Amt != undefined){
							$scope.money.hap = data.list[0].All_Amt;
						}else{
							$scope.money.hap = 0;
						}

						if(data.list[0].JiGup_Amt != null && data.list[0].JiGup_Amt != undefined){
							$scope.chit_jiSum = data.list[0].JiGup_Amt;
						}else{
							$scope.chit_jiSum = 0;
						}

						if( data.list[0].IpKum_Amt != null &&  data.list[0].IpKum_Amt != undefined){
							$scope.chit_atmSum = data.list[0].IpKum_Amt;
						}else{
							$scope.chit_atmSum = 0;
						}
					})
				}else{
					$scope.balance = false;
					$scope.money.emoon = 0;
					$scope.money.hap = 0;
					$scope.chit_atmSum = 0;
					$scope.chit_jiSum = 0;
				}
				$scope.detailSet_modal.hide();
			}
		})

	}

	$scope.OptsetList =[];
	/* 상세조회셋리스트조회 - 이경민[2015-12] */
	$scope.Select_OptSet = function(mode) {
		MLookupService.Select_OptSet($scope.loginData.Admin_Code, $scope.loginData.UserId, mode, $scope.damdanglist)
		.then(function(data){
			$scope.OptsetList = data.list;
		})
    	}

    	/* 전표 즐겨찾기 - 이경민[2015-12] */
	$scope.quickdetail = function(){
		MLookupService.lqdetail_set($scope.loginData.Admin_Code, $scope.loginData.UserId,$scope.reqparams,$scope.company,$scope.detail.Place_Code,2,$scope.todate)
		.then(function(data){
			if(data.list[0].rslt == 'Y'){
				if($rootScope.distinction == 'meaip') $rootScope.ActsLog('meaip', 'meaip_save_Favorit');
				else $rootScope.ActsLog('meachul', 'meachul_save_Favorit');

				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('등록되었습니다.', 'short', 'center');
				else alert('등록되었습니다.');
			}else{
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('등록이 완료되지 않았습니다.<br>다시 시도해주세요.', 'short', 'center');
				else alert('등록이 완료되지 않았습니다.<br>다시 시도해주세요.');
			}
		})
		$scope.loadingani();
	}
	/* 상세조회셋 조회관련 - 이경민[2015-12] */
    	$scope.OpsetScopeCarry=function(index){
	    	$ionicSlideBoxDelegate.slide(0, 500);
	    	if($scope.OptsetList[index].sel_Ger_Name == null || $scope.OptsetList[index].sel_Ger_Name == '') $scope.OptsetList[index].sel_Ger_Name = '';
	    	if($scope.OptsetList[index].sel_Ger_Code == null || $scope.OptsetList[index].sel_Ger_Code == '') $scope.OptsetList[index].sel_Ger_Code = '0';
		if($scope.OptsetList[index].sel_Damdang == null || $scope.OptsetList[index].sel_Damdang == '' || $scope.OptsetList[index].sel_Damdang == '미지정') $scope.OptsetList[index].sel_Damdang = '0';
		if($scope.OptsetList[index].sel_Place_Name == null || $scope.OptsetList[index].sel_Place_Name == '') $scope.OptsetList[index].sel_Place_Name = '';
	    	if($scope.OptsetList[index].sel_Place_Code == null || $scope.OptsetList[index].sel_Place_Code == '') $scope.OptsetList[index].sel_Place_Code = '0';

	    	if($scope.OptsetList[index].sel_Sdate == 'today'){
	    		$scope.reqparams.sDate = $scope.todate;
	    		$scope.date.sDate1 = new Date($scope.reqparams.sDate);
	    	}else{
	    		$scope.reqparams.sDate = $scope.OptsetList[index].sel_Sdate;
	    		$scope.date.sDate1 = new Date($scope.reqparams.sDate);
	    	}

	    	if($scope.OptsetList[index].sel_Edate == 'today'){
	    		$scope.reqparams.eDate = $scope.todate;
	    		$scope.date.eDate1 = new Date($scope.reqparams.eDate);
	    	}else{
	    		$scope.reqparams.eDate = $scope.OptsetList[index].sel_Edate;
	    		$scope.date.eDate1 = new Date($scope.reqparams.eDate);
	    	}

			$scope.company.username = $scope.OptsetList[index].sel_Ger_Name;
			$scope.company.name = $scope.OptsetList[index].sel_Ger_Name;
			$scope.company.code = $scope.OptsetList[index].sel_Ger_Code;
			/*담당자 지정하는 부분*/
			for(var i = 0; i < $scope.damdanglist.length; i++){
				if($scope.OptsetList[index].sel_Damdang == $scope.damdanglist[i].user_name){
					$scope.company.dam = $scope.damdanglist[i].user_name;
					$scope.company.damid = $scope.damdanglist[i].user_id;
					break;
				}
			}

			$scope.detail.Place_Code = $scope.OptsetList[index].sel_Place_Code;
	}

	$scope.onTouch = function(){
		$ionicSlideBoxDelegate.enableSlide(false);
	 };

	$scope.onRelease = function(){
		$ionicSlideBoxDelegate.enableSlide(true);
	};

	$scope.nextSlide = function() {
		$ionicSlideBoxDelegate.next();
	 };

	$scope.previousSlide = function() {
		$ionicSlideBoxDelegate.previous();
	};

	/* 빠른등록&최근검색내역 삭제 - 이경민[2015-12] */
	$scope.detailSet_Delete = function(index) {
           	MLookupService.Delete_OptSet($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.OptsetList[index].idx)
		.then(function(data){
			if(data.list[0].rslt == 'Y'){
				$scope.OptsetList.splice(index,1);
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('삭제되었습니다.', 'short', 'center');
				else alert('삭제되었습니다.');

			}else{
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('삭제가 정상적으로 되지 않았습니다.<br>다시 시도해주세요.', 'short', 'center');
				else alert('삭제가 정상적으로 되지 않았습니다.<br>다시 시도해주세요.');
			}
		})
    	};

    	/* 상세조회셋모닫 닫기 - 이경민[2015-12] */
	$scope.detailSet_closeModal = function() {
	      $scope.detailSet_modal.hide();
	};
})

/* 매입&매출 전표상세조회 컨트롤러 - 이경민[2015-12] */
.controller('MLookup_DeCtrl', function($scope, $rootScope, $ionicModal, $ionicPopup, $ionicHistory, $state, $cordovaToast, ERPiaAPI, MLookupService, MiuService, tradeDetailService) {

 	/*매출매입 상세조회 - 이경민[2015-12]*/
	MLookupService.chit_delookup($scope.loginData.Admin_Code, $scope.loginData.UserId, $rootScope.m_no)
	.then(function(data){
		console.log('여기! =>',data);
		$scope.chit_dedata = data.list;
		if($scope.chit_dedata[0].MobileQuickReg == 'N'){
			$scope.ionstar = "ion-android-star-outline";
			$scope.starcss = '#aca5b5';
		}else{
			$scope.ionstar = "ion-android-star";
			$scope.starcss = '#f6be5c';
		}
		//매장미지정일 경우
		if($scope.chit_dedata[0].Sale_Place_Name == null){
			$scope.chit_dedata[0].Sale_Place_Name = '매장미지정';
		}

		/* 총 수량 & 가격 */
		$scope.qtysum = 0;//총 수량
		$scope.pricesum = 0;//총 가격

		for (var i = 0; i < $scope.chit_dedata.length; i++) {
			$scope.qtysum = parseInt($scope.qtysum) + parseInt($scope.chit_dedata[i].G_Qty);
			$scope.gop = parseInt($scope.chit_dedata[i].G_Qty)*parseInt($scope.chit_dedata[i].G_Price);
			$scope.pricesum = parseInt($scope.pricesum) + parseInt($scope.gop);
		}
	})

	/*빠른등록 사용&미사용 - 이경민[2015-12]*/
	$scope.m_quick = function(no,starname){
	 	if(starname == 'ion-android-star-outline'){
	 		$scope.ionstar = "ion-android-star";
	 		$scope.starcss = '#f6be5c';

	 		var mode = 'use';
	 		if(ERPiaAPI.toast == 'Y') $cordovaToast.show('즐겨찾는 리스트로 등록되었습니다.', 'short', 'center');
			else alert('즐겨찾는 리스트로 등록되었습니다.');

			if($rootScope.distinction == 'meaip'){
				$rootScope.ActsLog('meaip', 'meaip_select_Favorit');
			}else{
				$rootScope.ActsLog('meachul', 'meachul_select_Favorit');
			}
			

	 	}else{
	 		$scope.ionstar = "ion-android-star-outline";
	 		$scope.starcss = '#aca5b5';
	 		var mode = 'unused';
	 		var ilno = ilno;

	 		if(ERPiaAPI.toast == 'Y') $cordovaToast.show('즐겨찾는 리스트에서 해제되었습니다.', 'short', 'center');
			else alert('즐겨찾는 리스트에서 해제되었습니다.');
	 	}

	 	MLookupService.quickReg($scope.loginData.Admin_Code, $scope.loginData.UserId, mode, no)
			.then(function(data){
		})
	}

	/*수정페이지 전환 - 이경민[2015-12]*/ 
	$scope.meaipchul_u = function(no){
		// $ionicHistory.clearHistory();
		$ionicHistory.clearCache();
       
		MLookupService.u_before_check($scope.loginData.Admin_Code, $scope.loginData.UserId, no)
		.then(function(data){
			if(data.list[0].Rslt == 0){ // --------------- 세금계산서 및 배송정보 미존재
				$rootScope.iu = 'u';
				$rootScope.mode='수정';
				$rootScope.u_no = no;
				if($rootScope.distinction == 'meaip')  $state.go('app.meaip_IU', {}, {location:'replace'});
				else $state.go('app.meachul_IU', {}, {location:'replace'});
			}else{
				$rootScope.iu = 'sb_u';
				if(data.list[0].Rslt == 1){ // --------------- 세금계산서 존재
					var data_alert = '세금계산서가 발행된 전표는<br>창고,매장만 수정 가능합니다.';
				}else if(data.list[0].Rslt == -2){  // --------------- 배송정보 존재
					var data_alert = '연계된 배송정보가 존재합니다.<br>이중출고의 위험이 있어 모바일에서는<br>배송정보 삭제가 불가하며, <br>일부(창고,매장,단가,입금정보)만 수정이 가능합니다.';
					$rootScope.iu = 'sb_ui';
				}else if(data.list[0].Rslt == -1){  // --------------- 세금계산서 & 배송정보 존재
					var data_alert = '세금계산서와 배송정보가 모두 존재합니다.<br>창고,매장만 수정가능합니다.';
					$rootScope.iu = 'sb_u';
				}
				$ionicPopup.show({
					title: '<b>경고</b>',
					subTitle: '',
					content: data_alert,
					buttons: [
					{
						text: 'No',
						onTap: function(e){}
					},
					{
						text: 'Yes',
						type: 'button-positive',
						onTap: function(e) {
							$rootScope.mode='수정';
							$rootScope.u_no = no;
							if($rootScope.distinction == 'meaip') $state.go('app.meaip_IU', {}, {location:'replace'});
							else $state.go('app.meachul_IU', {}, {location:'replace'});
						}
					},
				]})
			}
		})
	}

	/*삭제 - 이경민[2015-12]*/
	$scope.chitDeleteF = function(no){
		$ionicHistory.clearCache();
		// $ionicHistory.clearHistory();
		MLookupService.d_before_check($scope.loginData.Admin_Code, $scope.loginData.UserId, no)
		.then(function(data){
			var decheck = 'N';
			if(data.list[0].Rslt == 0){ // --------------- 세금계산서 및 배송정보 미존재
			var decheck = 'd';
				$rootScope.mode='삭제가능';
				$rootScope.u_no = no;
				$rootScope.tax_u = false;
				var data_alert = '정말로 삭제하시겠습니까?';
			}else if(data.list[0].Rslt == 1){ // --------------- 세금계산서 존재
				var data_alert = '세금계산서가 발행된 전표는 삭제가 불가능합니다.';
			}else if(data.list[0].Rslt == -2){// --------------- 배송정보 존재
				var data_alert = '연계된 배송정보가 존재합니다. 삭제가 불가능합니다.';
			}else if(data.list[0].Rslt == -1){  // --------------- 세금계산서 & 배송정보 존재
				var data_alert = '세금계산서와 배송정보가 모두 존재합니다. 삭제가 불가능합니다.';
			}
			$ionicPopup.show({
				title: '<b>경고</b>',
				subTitle: '',
				content: data_alert,
				buttons: [
				{
					text: 'No',
					onTap: function(e){}
				},
				{
					text: 'Yes',
					type: 'button-positive',
					onTap: function(e) {
						if(decheck == 'd'){
							MiuService.d_data($scope.loginData.Admin_Code, $scope.loginData.UserId, no)
							.then(function(data){
							if(data.list[0].rslt == 'Y'){
								if(ERPiaAPI.toast == 'Y') $cordovaToast.show('전표가 삭제되었습니다.', 'short', 'center');
								else alert('전표가 삭제되었습니다.');
								if($rootScope.distinction == 'meaip'){ /* 매입일 경우 */
									$rootScope.ActsLog('meaip', 'meaip_select_dele');
									$ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
									$state.go('app.meaip_page', {}, {location:'replace'});
								}else{ /* 매출일 경우 */
									$rootScope.ActsLog('meachul', 'meachul_select_dele');
									$ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
									$state.go('app.meachul_page', {}, {location:'replace'});
								}
							}
							})
						}
					}
				},
				]
			})
		})
	}
	/* 수정/삭제 권한 확인 펑션 - 이경민[2016-07-29] */
	$scope.useYN_Check_upandde = function(gubun, no){
		if(gubun == 'update'){
			if($rootScope.priv_meaip.save == 'Y' && $rootScope.distinction == 'meaip' || $rootScope.priv_meachul.save == 'Y' && $rootScope.distinction == 'meachul'){
				$scope.meaipchul_u(no);
			}else{
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('수정 권한이 없습니다.', 'long', 'center');
				else console.log('수정 권한이 없습니다.');
			}
		}else{
			if($rootScope.priv_meaip.de == 'Y' && $rootScope.distinction == 'meaip' || $rootScope.priv_meachul.de == 'Y' && $rootScope.distinction == 'meachul'){
				$scope.chitDeleteF(no);
			}else{
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('삭제 권한이 없습니다.', 'long', 'center');
				else console.log('삭제 권한이 없습니다.');
			}
		}
	}


	/*뒤로 제어 - 이경민[2015-12]*/
	$scope.backControll=function(){
		$ionicHistory.clearCache();
		$ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
		if($rootScope.distinction == 'meaip'){
			$state.go('app.meaip_page', {}, {location:'replace'});
		}else{
			$state.go('app.meachul_page', {}, {location:'replace'});
		}
	}
})

/* 매입&매출 등록/수정 컨트롤러 - 이경민[2015-12] */
.controller('MiuCtrl', function($scope, $rootScope, $ionicPopup, $ionicModal, $cordovaBarcodeScanner, $ionicHistory, $timeout, $state, $cordovaToast, ERPiaAPI, MconfigService, MiuService, MLookupService, app) {
	console.log('MiuCtrl');
	if($rootScope.iu == 'sb_u'){
		$scope.sbu = true;
	}else if($rootScope.iu == 'sb_ui'){
		$scope.sbu = true;
		$scope.sbb = true;
	}else{
		$scope.sbu = false;
	}

	/* 날짜생성 - 김형석[2015-12] */
	$scope.dateMinus=function(days){
	    var nday = new Date();  //오늘 날짜..
	    nday.setDate(nday.getDate() - days); //오늘 날짜에서 days만큼을 뒤로 이동
	    var yy = nday.getFullYear();
	    var mm = nday.getMonth()+1;
	    var dd = nday.getDate();

	    if( mm<10) mm="0"+mm;
	    if( dd<10) dd="0"+dd;

	    return yy + "-" + mm + "-" + dd;
	}

	/* date형변환에 필요한 그릇 - 김형석[2015-12] */
	$scope.date={
		todate : '',
		payday : '',
		todate1 : '',
		payday1 : ''
	}

	$scope.datetypes='';
	$scope.date.todate=$scope.dateMinus(0); //오늘날짜 스코프
	$scope.date.payday=$scope.dateMinus(0);
	$scope.date.todate1=new Date($scope.date.todate);
	$scope.date.payday1=new Date($scope.date.payday);


	/*매입일/매출일 날짜 형변환하기 - 김형석[2015-12] */
	$scope.datechange=function(date,num){
		var nday = new Date(date);
	    var yy = nday.getFullYear();
	    var mm = nday.getMonth()+1;
	    var dd = nday.getDate();

	    if( mm<10) mm="0"+mm;
	    if( dd<10) dd="0"+dd;

		switch(num){
			case 1 :
				$scope.date.todate = yy + "-" + mm + "-" + dd;
				if($scope.date.todate =="1970-01-01"){
					var nday = new Date();//오늘 날짜..
					var yy = nday.getFullYear();
					var mm = nday.getMonth()+1;
					var dd = nday.getDate();
					if( mm<10) mm="0"+mm;
					if( dd<10) dd="0"+dd;
					$scope.date.todate = yy + "-" + mm + "-" + dd;
				}
				$scope.date.todate1=new Date($scope.date.todate);
				break;

			case 2 :
				$scope.date.payday = yy + "-" + mm + "-" + dd;
				if($scope.date.payday =="1970-01-01"){
					var nday = new Date();//오늘 날짜..
					var yy = nday.getFullYear();
					var mm = nday.getMonth()+1;
					var dd = nday.getDate();
					if( mm<10) mm="0"+mm;
					if( dd<10) dd="0"+dd;
					$scope.date.payday = yy + "-" + mm + "-" + dd;
				}
				$scope.date.payday1 = new Date($scope.date.payday);
				break;
		}

	};

	/*자동슬라이드 - 이경민[2015-12]*/
	$scope.basictype=true;
	$scope.basic2type=false;
	$scope.basic3type=false;
	$scope.upAnddown="ion-arrow-up-b";
	$scope.upAnddown2="ion-arrow-down-b";
	$scope.upAnddown3="ion-arrow-down-b";

	/*거래처 객체 - 이경민[2015-12]*/
	$scope.datas = {
		subulkind : 0,
		userGerName : '', // 사용자가 입력한 거래처명
		GerName : '',
		GerCode : 0,
		totalsumprices : 0, //합계
		remk : '' // 관리비고
	}

	 /*체크데이터 - 이경민[2015-12]*/
	$scope.m_check = {
		cusCheck : 'f',
		subulCheck  : 'f',
		meajangCheck : 'f',
		changoCheck : 'f'
	}

	 /*매입&매출 기본정보 - 이경민[2015-12]*/
	$scope.setupData={
		basic_Place_Code : 0,
		basic_Ch_Code : 0
	};

	 /*상품등록 리스트*/
    	$scope.goodsaddlists=[];
   	$scope.checkedDatas=[];

    	/*상품검색 selectBoxList*/
    	$scope.modeselectlist=[
	    { Name: '상품명', Code: 'Select_GoodsName' },
	    { Name: '자체코드', Code: 'Select_G_OnCode' },
	    { Name: '상품코드', Code: 'Select_G_Code' },
	    { Name: '공인바코드', Code: 'Select_GI_Code' }
    	];

    	/* goods Search modal - 이경민[2015-12]*/
    	$ionicModal.fromTemplateUrl('meaipchul/goods_Modal.html', {
    		scope: $scope
   	}).then(function(modal) {
   		$scope.goodsmodal = modal;
    	});

    	/*유저가 쓴 상품이름 & 검색 모드 - 이경민[2015-12]*/
    	$scope.user = {
    		userGoodsName : '',
    		userMode : 'Select_GoodsName'
    	};

    	$scope.subul = [
		{checked : false},
		{checked : false},
		{checked : false},
		{checked : false},
	];

	    /*지급정보 구분 - one(현금) two(통장) th(어음) fo(카드)  - 이경민[2015-12]*/
	$scope.payment=[
		{ one : false, name : '현금결제', checked : false },
		{ two : false, name : '통장결제', checked : false },
		{ th : false, name : '어음결제', checked : false },
		{ fo : false, name : '카드결제', checked : false }
	];

	$scope.pay={
		use : true,
		payprice : 0, // 지급액
		paycardbank : '', //은행&카드 정보
		gubun : 4,
		acno : '', //지급전표 정보 (수정시 사용)
		no : '', // 전표번호 (수정시 사용)
		codenum : -1,
		goods_del : 'N', // 상품 삭제 Y&N
		goods_seq_end : 0,
		delete : true
	};

	/*은행/카드 정보  - 이경민[2015-12]*/
	$scope.paycardbank=[];
	$scope.paytype = false;

	$scope.paylist=[];

    	$scope.bar = 'N'; //바코드로 검색인가 아닌가 구별하기위함.

	 /* page up And down  - 이경민[2015-12]*/
	$scope.Next=function(){
		if($scope.basictype == true){
			$scope.basictype= false;
			$scope.upAnddown="ion-arrow-down-b";
		}else{
			$scope.basictype=true;
			$scope.basic2type=false;
			$scope.basic3type=false;
			$scope.upAnddown="ion-arrow-up-b";
			$scope.upAnddown2="ion-arrow-down-b";
			$scope.upAnddown3="ion-arrow-down-b";
		}
	}
	$scope.Next2=function(){
		if($scope.basic2type == true){
			$scope.basic2type= false;
			$scope.upAnddown2="ion-arrow-down-b";
		}else{
			$scope.basic2type=true;
			$scope.basictype=false;
			$scope.basic3type=false;
			$scope.upAnddown2="ion-arrow-up-b";
			$scope.upAnddown="ion-arrow-down-b";
			$scope.upAnddown3="ion-arrow-down-b";
		}
	}
	$scope.Next3=function(){
		if($scope.basic3type == true){
			$scope.basic3type= false;
			$scope.upAnddown3="ion-arrow-down-b";
		}else{
			$scope.basic3type=true;
			$scope.basictype=false;
			$scope.basic2type=false;
			$scope.upAnddown3="ion-arrow-up-b";
			$scope.upAnddown="ion-arrow-down-b";
			$scope.upAnddown2="ion-arrow-down-b";
		}
	}

	/*erpia 환경설정값*/
	MconfigService.erpia_basicSetup($scope.loginData.Admin_Code, $scope.loginData.UserId)
	.then(function(data){
		if(data.list[0].Sale_Place_Code.length == 0){
			var er_placecode = '000';
			$scope.placeYN = false;
		}else{
			var er_placecode = data.list[0].Sale_Place_Code;
			$scope.placeYN = true;
		}
		/*환경설정값 있는지 먼저 불러오기.- 이경민*/
	    	MconfigService.basicSetup($scope.loginData.Admin_Code, $scope.loginData.UserId, er_placecode)
		.then(function(data){
			if(data != null){
				$scope.setupData = data;
				$scope.m_check.meajangCheck = 't';
				$scope.m_check.changoCheck = 't';
			
				if($rootScope.distinction == 'meaip' && $rootScope.iu == 'i'){  //매입 수불구분확인 -------------------- 매입일경우
					var i = $scope.setupData.basic_Subul_Meaip;
					switch (i) {
					    case '1' :  switch($scope.setupData.basic_Subul_Meaip_Before){
					    		   		case 'I' : console.log('I'); $scope.datas.subulkind=111; $scope.subul[0].checked=true;  $scope.subul[1].checked=false; break;
					    		   		case 'B' : console.log('B'); $scope.datas.subulkind=122; $scope.subul[1].checked=true; $scope.subul[0].checked=false; break;
					    		   		case 'N' : console.log('N'); break;
					    		   }
					    		   break;
					    case '2' : $scope.datas.subulkind=111; $scope.subul[0].checked=true; $scope.subul[1].checked=false; break;
					    case '3' : $scope.datas.subulkind=122; $scope.subul[1].checked=true; $scope.subul[0].checked=false; break;

					    default : console.log('수불카인드 오류'); $scope.m_check.subulCheck = 'f'; break; // 최근등록수불로 되어있는데 등록된 값 없을경우
					}
					if($scope.datas.subulkind == 0){
						$scope.m_check.subulCheck = 'f';
					}
				}else if($rootScope.distinction == 'meachul' && $rootScope.iu == 'i'){  //매출 수불구분확인 -------------------- 매출일경우
					var i = $scope.setupData.basic_Subul_Sale;
					switch (i) {
					    case '1' :  switch($scope.setupData.basic_Subul_Sale_Before){
					    		   		case 'C' : console.log('C'); $scope.datas.subulkind=221; $scope.subul[2].checked=true; $scope.subul[3].checked=false; break;
					    		   		case 'B' : console.log('B'); $scope.datas.subulkind=212; $scope.subul[3].checked=true; $scope.subul[2].checked=false; break;
					    		   		case 'N' : console.log('N'); break;
					    		    }
					    		   break;
					    case '2' : $scope.datas.subulkind=221; $scope.subul[2].checked=true; $scope.subul[3].checked=false; break;
					    case '3' : $scope.datas.subulkind=212; $scope.subul[3].checked=true; $scope.subul[2].checked=false; break;

					    default : console.log('수불카인드 오류'); $scope.m_check.subulCheck = 'f'; break; // 최근등록수불로 되어있는데 등록된 값 없을경우
					  }
					  if($scope.datas.subulkind == 0){
					  	$scope.m_check.subulCheck = 'f';
					  }
				}
			}

			/*기본 매장조회 - 이경민[2015-12]*/
			MconfigService.basicM($scope.loginData.Admin_Code, $scope.loginData.UserId)
			.then(function(data){
				$scope.mejanglists = data.list;

				/*기본 창고조회  - 이경민[2015-12]*/
				MconfigService.basicC($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, $scope.setupData.basic_Place_Code)
				.then(function(data){
					$scope.changolists = data.list;
					var gubun = false;
					for(var i = 0; i < $scope.changolists.length; i++){ ////여기여기!
						if($scope.changolists[i].Code == $scope.setupData.basic_Ch_Code){
							var gubun = true;
							break;
						}
					}
					if(gubun == false){
						$scope.setupData.basic_Ch_Code = '000';
						$scope.m_check.changoCheck = 'f';
					}
						////////////////////////////////////////////// 수정일경우 데이터 불러오기 - 이경민[2015-12] //////////////////////////////////////////////////////////
						if($rootScope.iu == 'u' || $rootScope.iu == 'qi' || $rootScope.iu == 'sb_u' || $rootScope.iu == 'sb_ui'){
							/*전표 상세조회 -- 날짜 paydate(입출일), todate(지급일) - 이경민[2015-12]*/
							MLookupService.chit_delookup($scope.loginData.Admin_Code, $scope.loginData.UserId, $rootScope.u_no)
							.then(function(data){
								if($rootScope.iu != 'i'){
									$scope.datas.remk = data.list[0].Remk;
								}else{
									$scope.datas.remk = '';
								}
								
								if($rootScope.distinction == 'meaip'){
									if($rootScope.iu == 'u' || $rootScope.iu == 'sb_u' || $rootScope.iu == 'sb_ui' ){
										$scope.date.todate1 = new Date(data.list[0].Meaip_Date);
										$scope.date.todate = data.list[0].Meaip_Date;
									}else{
										$scope.date.todate1 = $scope.date.todate1=new Date($scope.dateMinus(0));
										$scope.date.todate = $scope.dateMinus(0);
									} //오늘날짜 스코프
									$scope.pay.acno = data.list[0].AC_No;
									$scope.pay.no = data.list[0].iL_No;
									$scope.pay.goods_seq_end = data.list[data.list.length-1].Seq;

									if(data.list[0].IpJi_Date.length > 0){
										if($rootScope.iu == 'u' || $rootScope.iu == 'sb_u' || $rootScope.iu == 'sb_ui' ){
											$scope.date.payday1 = new Date(data.list[0].IpJi_Date);
											$scope.date.payday = data.list[0].IpJi_Date;
										}else{
											$scope.date.payday1=new Date($scope.date.payday);
											$scope.date.payday=$scope.dateMinus(0);
										}
									}
								}else{
									if($rootScope.iu == 'u' || $rootScope.iu == 'sb_u' || $rootScope.iu == 'sb_ui' ){
										$scope.date.todate1 = new Date(data.list[0].MeaChul_Date);
										$scope.date.todate = data.list[0].MeaChul_Date;
									}else{
										$scope.date.todate1 = $scope.date.todate1=new Date($scope.dateMinus(0));
										$scope.date.todate = $scope.dateMinus(0);
									}
									$scope.pay.acno = data.list[0].AC_No;
									$scope.pay.no = data.list[0].Sl_No;
									$scope.pay.goods_seq_end = data.list[data.list.length-1].Seq;
									if(data.list[0].IpJi_Date.length > 0){
										if($rootScope.iu == 'u' || $rootScope.iu == 'sb_u' || $rootScope.iu == 'sb_ui' ){
											$scope.date.payday1 = new Date(data.list[0].IpJi_Date);
											$scope.date.payday = data.list[0].IpJi_Date;
										}else{
											$scope.date.payday1=new Date($scope.date.payday);
											$scope.date.payday=$scope.dateMinus(0);
										}

									}
								}

								/*조회된 창고랑 매장 - 이경민[2015-12]*/
								if(data.list[0].Sale_Place_Code.length == 0){
									$scope.setupData.basic_Place_Code = '000';
								}else{
									$scope.setupData.basic_Place_Code = data.list[0].Sale_Place_Code;
								}
								$scope.setupData.basic_Ch_Code = data.list[0].Ccode;


								/*조회된 수불카인드 - 이경민[2015-12]*/
								$scope.datas.subulkind = parseInt(data.list[0].Subul_kind);
								switch ($scope.datas.subulkind){
									case 111 : $scope.subul[0].checked = true; $scope.subul[1].checked=false; break;
									case 122 : $scope.subul[1].checked = true; $scope.subul[0].checked=false; break;
									case 221 : $scope.subul[2].checked = true; $scope.subul[3].checked=false; break;
									case 212 : $scope.subul[3].checked = true; $scope.subul[2].checked=false; break;
								}

								/* 수정시 중복 컨텐츠 색변경 */
								var numlist = '';
								for(var i=0; i < data.list.length; i++){
									for(var j=0; j < data.list.length; j++){
										if(i != j && data.list[i].G_Code == data.list[j].G_Code){
											var numlist = numlist + i + '/' ;
										}
									}
								}
								console.log('이게 머야 =>', data.list);
								for(var i=0; i < data.list.length; i++){
									$scope.goodsaddlists.push({
										overlap_color : '#000',
										name : data.list[i].G_Name,
										num : parseInt(data.list[i].G_Qty),
										goodsprice : data.list[i].G_Price,
										code : data.list[i].G_Code,
										goods_seq : data.list[i].Seq,
										stand : data.list[i].G_Stand,
										state : 'u' // 디비에있는 데이터인지 확인하기위해. / 티삭제시 필요
									});
								}
								if(numlist.length > 1){
									$scope.num_list = [];
									$scope.num_list = numlist.split('/');
									for(var o=0; o < $scope.num_list.length-1; o++){
										$scope.goodsaddlists[$scope.num_list[o]].overlap_color = '#FF5E00';
									}
								}

								$scope.m_check.meajangCheck = 't';
								$scope.m_check.changoCheck = 't';
								$scope.m_check.subulCheck = 't';

								$scope.company_Func(data.list[0].GerName,data.list[0].GerCode,data.list[0].G_GDamdang);
								$scope.checkup();

								/*지급구분 - 이경민[2015-12]*/
								if(data.list[0].IpJi_Gubun.length > 0){
									$scope.pay.use = false;
									if($rootScope.iu == 'u' || $rootScope.iu == 'sb_u' || $rootScope.iu == 'sb_ui' )  $scope.pay.delete=false;
									else  $scope.pay.delete=true;
									$scope.pay.payprice = parseInt(data.list[0].IpJi_Amt);
									switch(parseInt(data.list[0].IpJi_Gubun)){
										case 701 : $scope.payment[0].checked = true; $scope.pay.gubun = 0; break;
										case 721 : $scope.payment[0].checked = true; $scope.pay.gubun = 0; break;

										case 702 : $scope.payment[1].checked = true; $scope.pay.gubun = 1; break;
										case 722 : $scope.payment[1].checked = true; $scope.pay.gubun = 1; break;

										case 703 : $scope.payment[3].checked = true; $scope.pay.gubun = 3; break;
										case 723 : $scope.payment[3].checked = true; $scope.pay.gubun = 3; break;

										case 704 : $scope.payment[2].checked = true; $scope.pay.gubun = 2; break;
										case 724 : $scope.payment[2].checked = true; $scope.pay.gubun = 2; break;

										default : console.log('셀렉트 된 것이 없습니다.'); break;
									}
									if(data.list[0].IpJi_Gubun == 703 || data.list[0].IpJi_Gubun == 723){
										$scope.Payments_division(3);
										$scope.pay.paycardbank = data.list[0].Card_Code + ',' + data.list[0].Card_Name + ',' + data.list[0].Card_Num;
										$scope.pay.codenum = data.list[0].Card_Code;
									}else if(data.list[0].IpJi_Gubun == 702 || data.list[0].IpJi_Gubun == 722){
										$scope.Payments_division(1);
										$scope.pay.paycardbank = data.list[0].Bank_Code + ',' + data.list[0].Bank_Name + ',' + data.list[0].Bank_Account;
										$scope.pay.codenum = data.list[0].Bank_Code;
									}else{
										for(var i=0; i<2; i++){
											$scope.paylist.push({
									    			code : '',
									    			name : '',
									    			num : 0
								    			});
										}
									}
									$scope.payinsert();
								}
							})
							if($rootScope.iu == 'qi'){
								$rootScope.iu = 'i';
							}
						}
						////////////////////////////////////////////// 수정 끝 //////////////////////////////////////////////////////////////////////////////
				})
			})
		})
	});
	
	$rootScope.Jego_Pro = function(){
		/* Jego조회로 넘어온 매입/매출 상품 등록 */
		if($rootScope.JegoGoods != undefined){
			if($rootScope.distinction == 'meaip'){
				$scope.goodsaddlists.push({
								overlap_color : '#000',
								name : $rootScope.JegoGoods[0].G_Name,
								num : 1,
								goodsprice : parseInt($rootScope.JegoGoods[0].G_Dn1),
								code : $rootScope.JegoGoods[0].G_Code,
								stand : $rootScope.JegoGoods[0].G_Stand
							});
			}else{
				$scope.goodsaddlists.push({
								overlap_color : '#000',
								name : $rootScope.JegoGoods[0].G_Name,
								num : 1,
								goodsprice : parseInt($rootScope.JegoGoods[0].G_Dn2),
								code : $rootScope.JegoGoods[0].G_Code,
								stand : $rootScope.JegoGoods[0].G_Stand
							});
			}		
		}
	}
	
	$rootScope.Jego_Pro();
	/*거래처명 초기화 - 이경민[2015-12]*/
	$scope.clearcompany = function(){
		$scope.datas.userGerName = '';
		$scope.datas.GerName = '';
		$scope.datas.GerCode = 0;
		$scope.companyDatas = '';
		$scope.companylatelyDatas = '';
	}

	/*매장에따른 연계창고 조회 - 이경민[2015-12]*/
	$scope.Link_Chango = function(){
		MconfigService.basicC($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.setupData.basic_Place_Code)
		.then(function(data){
			$scope.changolists = data.list;
			if($scope.setupData.basic_Place_Code == 000){ //매장미지정을 선택할 경우 본사창고 디폴트
				$scope.setupData.basic_Place_Code = '000';
				$scope.setupData.basic_Ch_Code = '101';
			}else{
				$scope.setupData.basic_Ch_Code = $scope.changolists[0].Code;
				$scope.m_check.changoCheck = 'f';
			}

		})
	}

	/*거래처 자동완성기능 (매입+매출 등록/수정쪽) - 이경민[2015-12]*/
    $scope.companyDatas = []; // 자동완성 배열

     $scope.company_auto = function() {
     	var cusname = escape($scope.datas.userGerName);
     	if($scope.companyDatas != undefined && $scope.companyDatas.length != 0){
     		$scope.companylatelyDatas = '';
     		$scope.companyDatas.splice(0, $scope.companyDatas.length); // 이전에 검색한 데이터 목록 초기화
     	}else{
     		$scope.companyDatas = '';
     	}
		MiuService.company_sear($scope.loginData.Admin_Code, $scope.loginData.UserId, cusname)
		.then(function(data){
			$scope.companyDatas = data.list;
			$scope.companylatelyDatas = '';
		})
    }

    /*거래처 최근 검색목록 - 이경민[2015-12]*/
    $scope.company_lately =  function(){
    		if($scope.datas.userGerName.length == 0){
    			$scope.companyDatas = '';
    			var gubun = 'Ger';
    			MiuService.companyAndgoods_lately($scope.loginData.Admin_Code, $scope.loginData.UserId, gubun)
			.then(function(data){
				if(data != '<!--Parameter Check-->'){
					$scope.companylatelyDatas = [];
					for(var i = 0; i < data.list.length; i++){
						if($rootScope.distinction == 'meaip' && data.list[i].Search_Ger_Name.length != 0 ){
							if(data.list[i].SM_Gubun == 'M'){
								$scope.companylatelyDatas.push(data.list[i]);
							}
						}else{
							if(data.list[i].SM_Gubun == 'S' && data.list[i].Search_Ger_Name.length != 0 ){
								$scope.companylatelyDatas.push(data.list[i]);
							}
						}
					}
				}
			})
    		}
    }

   	/*거래처창고 조회후 값저장 - 이경민[2015-12]*/
    	$scope.company_Func2=function(gname,gcode){
    		$scope.companylatelyDatas = ''; // data배열 초기화
	        	$scope.datas.userGerName = gname;
	        	$scope.datas.GerName=gname;
		$scope.datas.GerCode=gcode;
		$scope.m_check.cusCheck = 't';
    	}

    /*거래처창고 조회후 값저장 - 이경민[2015-12]*/
    $scope.company_Func=function(gname,gcode){
    	$scope.companyDatas = ''; // data배열 초기화
	$scope.datas.GerName=gname;
	$scope.datas.userGerName = gname;
	$scope.datas.GerCode=gcode;
	$scope.m_check.cusCheck = 't';

	var gubun = 'Ger';
	MiuService.companyAndgoods_latelysave($scope.loginData.Admin_Code, $scope.loginData.UserId, gubun, gname, gcode)
	.then(function(data){
	})
    }

    /*거래처 상세조회 - 이경민[2015-12]*/
 	 $scope.CompDetailData={};
	  $scope.gerDetail=function(){
	  MiuService.company_detail_sear($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.datas.GerCode)
		.then(function(data){
			if(data.G_Code == '업체정보가없습니다.'){
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('거래처명을 검색해주세요.', 'long', 'center');
				else alert('거래처명을 검색해주세요.');
			}else{
				$scope.CompDetailData = data.list[0];
				if($scope.CompDetailData.Use_Recent_DanGa_YN=='Y'){
					$scope.CompDetailData.Use_Recent_DanGa_YN='/ 최근단가 우선적용'
				}else{
					$scope.CompDetailData.Use_Recent_DanGa_YN=''
				}
				$ionicPopup.alert({
			        title: '<b>거래처정보</b>',
			        subTitle: '',
			        template: '<table><tr><td width="40%" style="border-right:1px solid black;">거래처명</td><td width="60%" style="padding-left:5px">'+$scope.CompDetailData.G_Name+'</td></tr><tr><td width="40%" style="border-right:1px solid black;">매출단가</td><td width="60%" style="padding-left:5px">'+$scope.CompDetailData.G_DanGa_Gu+$scope.CompDetailData.Use_Recent_DanGa_YN+'</td></tr><tr><td width="40%" style="border-right:1px solid black;">전화번호</td><td width="60%" style="padding-left:5px">'+$scope.CompDetailData.G_Tel+'</td></tr><tr><td width="40%" style="border-right:1px solid black;">배송지 주소</td><td width="60%" style="padding-left:5px">'+$scope.CompDetailData.G_Juso+'</td></tr><tr><td width="40%" style="border-right:1px solid black;">최근 매입일</td><td width="60%" style="padding-left:5px">'+$scope.CompDetailData.Recent_purchase_date+'</td></tr><tr><td width="40%" style="border-right:1px solid black;">최근 매출일</td><td width="60%" style="padding-left:5px">'+$scope.CompDetailData.Recent_sales_date+'</td></tr></table>'
	    			})
			}
		})
	};
	/* 창고 저장 - 이경민[2015-12]*/
	$scope.Changosave = function(){
		$scope.m_check.changoCheck = 't';
	}

	 /*상품조회모달  - 이경민[2015-12]*/
	$scope.goods_searchM = function(num){
		$scope.moreloading=0;
		$scope.pageCnt=1;
		$scope.maxover=0;
		var goodsname = escape($scope.user.userGoodsName);

		if($rootScope.distinction == 'meaip'){
			switch ($scope.user.userMode)
			{
				case 'Select_GoodsName' : var module_T = 'meaip_save_Goods_Name'; break;
				case 'Select_G_OnCode' : var module_T = 'meaip_save_Goods_G_OnCode'; break;
				case 'Select_G_Code' : var module_T = 'meaip_save_Goods_G_Code'; break;
				case 'Select_GI_Code' : var module_T = 'meaip_save_Goods_GI_Code'; break;
			}
			$rootScope.ActsLog('meaip', module_T);
		}else{
			switch ($scope.user.userMode)
			{
				case 'Select_GoodsName' : var module_T = 'meachul_save_Goods_Name'; break;
				case 'Select_G_OnCode' : var module_T = 'meachul_save_Goods_G_OnCode'; break;
				case 'Select_G_Code' : var module_T = 'meachul_save_Goods_G_Code'; break;
				case 'Select_GI_Code' : var module_T = 'meachul_save_Goods_GI_Code'; break;
			}
			$rootScope.ActsLog('meachul', module_T);
		}

		if($scope.user.userMode == 'Select_GoodsName'){
			MiuService.goods_sear($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.user.userMode, goodsname, $scope.setupData.basic_Ch_Code,$scope.pageCnt)
			.then(function(data){
				if($scope.user.userGoodsName.length != 0 && data != '<!--Parameter Check-->' && num == 1 ){ // 최근 상품 거래 조회목록에 저장.
					var gubun = 'Goods';
					MiuService.companyAndgoods_latelysave($scope.loginData.Admin_Code, $scope.loginData.UserId, gubun,goodsname)
					.then(function(data){
					})
				}
				$scope.goodslists = data.list;
			})
		}else{
		MiuService.goods_sear($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.user.userMode, goodsname, $scope.setupData.basic_Ch_Code)
		.then(function(data){
			if($scope.user.userGoodsName.length != 0 && data != '<!--Parameter Check-->' && num == 1 ){ // 최근 상품 거래 조회목록에 저장.
				var gubun = 'Goods';
				MiuService.companyAndgoods_latelysave($scope.loginData.Admin_Code, $scope.loginData.UserId, gubun,goodsname)
				.then(function(data){
				})
			}
			$scope.goodslists = data.list;
			$scope.moreloading=0;
			$scope.maxover = 1;
			$scope.pageCnt=1;
			})
		}
		if($scope.checkedDatas.length != 0){
			$scope.checkedDatas.splice(0,$scope.checkedDatas.length);
		}
		$scope.goodlately_slists = '';
		$scope.goodsmodal.show();
	}

	/*상품 최근 검색 조회 - 이경민[2015-12]*/
	$scope.goods_lately = function(){
		if($scope.user.userGoodsName.length == 0 || $scope.user.userGoodsName.length == undefined){
			var gubun = 'Goods';
			MiuService.companyAndgoods_lately($scope.loginData.Admin_Code, $scope.loginData.UserId, gubun)
			.then(function(data){
				if(data != '<!--Parameter Check-->'){
					$scope.goodlately_slists = data.list;
				}
			})
		}
	}

	/*상품최근검색 목록 초기화 - 이경민[2015-12]*/
	$scope.clear_goods = function(){
		$scope.goodlately_slists = '';
		$scope.user.userGoodsName = '';
	}
	/* 상품최근검색 목록 조회 - 이경민[2015-12] */
	$scope.goods_lately_serarch = function(name){
		$scope.user.userGoodsName = name;
		$scope.goodlately_slists = '';
		$scope.goods_searchM(2);
		$rootScope.loadingani();
	}

    	/* 더보기 버튼 클릭시(페이징) - 김형석[2015-12] */
	$scope.goods_more = function() {
		var goodsname = escape($scope.user.userGoodsName);
		if($scope.goodslists.length>0){
			if($scope.maxover==0){
				$scope.pageCnt+=1;
				$scope.moreloading=1;
				MiuService.goods_sear($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.user.userMode, goodsname, $scope.setupData.basic_Ch_Code,$scope.pageCnt)
				.then(function(data){
					$scope.maxCnt=0;
					$timeout(function(){
						if(data != '<!--Parameter Check-->'){
							for(var i=0; i<data.list.length; i++){
								$scope.goodslists.push(data.list[i]);
							}
						}else{
							$scope.moreloading=0;
							$scope.maxover = 1;
						}
						$scope.moreloading=0;
					}, 1000);
				})
			}
		}
	};
	/* 1000단위 콤마 - 이경민[2015-12] */
	function commaChange(Num){
		fl=""
		Num = new String(Num)
		temp=""
		co=3
		num_len=Num.length
		while (num_len>0){
			num_len=num_len-co
			if(num_len<0){
				co=num_len+co;
				num_len=0
			}
			temp=","+Num.substr(num_len,co)+temp
		}
		rResult =  fl+temp.substr(1);
		return rResult;
	}

	$scope.goods_priv = function(){
		if(ERPiaAPI.toast == 'Y') $cordovaToast.show('상품조회 권한이 없습니다.', 'short', 'center');
		else console.log('상품조회 권한이 없습니다.');
	}


	/* 상품정보 디테일 조회 - 이경민[2015-12] */
	$scope.goodsDetail=function(indexnum){
		$scope.G_NameS =  $scope.goodslists[indexnum].G_Name;
		$scope.G_OnCodeS = $scope.goodslists[indexnum].G_OnCode;
		//상품명, 자체코드가 11글자보다 크면 <BR>태그를 삽입하여 한줄 띄게 만든다 ( IONIC POPUP 깨지는 문제 해결방안) - 김형석
		if($scope.goodslists[indexnum].G_Name.length>7) $scope.G_NameS = $scope.goodslists[indexnum].G_Name.substring(0,8) + '<br>' + $scope.goodslists[indexnum].G_Name.substring(8,$scope.goodslists[indexnum].G_Name.length);
		if($scope.goodslists[indexnum].G_OnCode.length>11) $scope.G_OnCodeS = $scope.goodslists[indexnum].G_OnCode.substring(0,10) + '<br>' + $scope.goodslists[indexnum].G_OnCode.substring(10,$scope.goodslists[indexnum].G_OnCode.length);
		var td = '<td width="40%" style="border-right:1px solid black; font-size: 0.8em;">';
		var td2 = '<td width="55%" style="padding-left:5px; font-size: 0.8em;">';
		 
			if($rootScope.priv_wongaYN == 'N')  var wonga_meaip = commaChange($scope.goodslists[indexnum].G_Dn1)
			else var wonga_meaip = '******'
		var alert_template = '<table width="100%">' +
						'<tr>' +
							td + '상품명</td>' +
							td2 + $scope.G_NameS + '</td>' +
						'</tr>' +
						'<tr>' +
							td + '규격</td>' +
							td2 + $scope.goodslists[indexnum].G_Stand + '</td>' +
						'</tr>' +
						'<tr>' +
							td + '로케이션</td>' +
							td2 + $scope.goodslists[indexnum].Location + '</td>' +
						'</tr>' +
						'<tr>' +
							td + '자체코드</td>' +
							td2 + $scope.G_OnCodeS + '</td>' +
						'</tr>' +
						'<tr>' +
							td + '제조사</td>' +
							td2 + $scope.goodslists[indexnum].G_JeaJoChe + '</td>' +
						'</tr>' +
						'<tr>' +
							td + '브랜드</td>' +
							td2 + $scope.goodslists[indexnum]. Brand_Name+ '</td>' +
						'</tr>' +
						'<tr>' +
							td + '매입가</td>' +
							td2 + wonga_meaip + '</td>' +
						'</tr>' +
						'<tr>' +
							td + '도매가</td>' +
							td2 + commaChange($scope.goodslists[indexnum].G_Dn2) + '</td>' +
						'</tr>' +
						'<tr>' +
							td + '인터넷가</td>' +
							td2 + commaChange($scope.goodslists[indexnum].G_Dn3) + '</td>' +
						'</tr>' +
						'<tr>' +
							td + '소매가</td>' +
							td2 + commaChange($scope.goodslists[indexnum].G_Dn4) + '</td>' +
						'</tr>' +
						'<tr>' +
							td + '권장소비자가</td>' +
							td2 + commaChange($scope.goodslists[indexnum].G_Dn5) + '</td>' +
						'</tr>' +
						'<tr>' +
							td + '입수량</td>' +
							td2 + $scope.goodslists[indexnum].Box_In_Qty + '</td>' +
						'</tr>' +
						'<tr>' +
							td + '재고</td>' +
							td2 + $scope.goodslists[indexnum].Jego + '</td>' +
						'</tr>' +
						'<tr>' +
							td + '출고대기</td>' +
							td2 + $scope.goodslists[indexnum].ChulGoDeagi + '</td>' +
						'</tr>' +
						'</table>';
		$ionicPopup.alert({
			title: '<b>상품 정보</b>',
			subTitle: '',
			template: alert_template
		})
	};

	/*상품체크박스 - 이경민[2015-12]*/
	$scope.goodsCheck=function(goodsdata){
		$scope.checkcaught='no';
		for(var i=0; i<$scope.checkedDatas.length; i++){
			if($scope.checkedDatas[i] == goodsdata){
				$scope.checkedDatas.splice(i, 1);
				$scope.checkcaught='yes';
				break;
			}
		}
		if($scope.checkcaught != 'yes'){
			$scope.checkedDatas.push(goodsdata);

		}
	}

	/* 선택상품 재고조회 - 이경민[2016-10-05] */
	$scope.GoodsJego = function(){
		var GCode = '';
		if($scope.checkedDatas.length == 0){
			console.log('상품을 선택해주세요.');
		}else if($scope.checkedDatas.length > 10){
			console.log('10개 이하로 선택해주세요.');
		}else{
			for(var i = 0; i < $scope.checkedDatas.length; i++){
				if(i == 0){
					var GCode = $scope.checkedDatas[i].G_Code;
				}else{
					var GCode = GCode + ',' + $scope.checkedDatas[i].G_Code;
				}
			}
			$scope.goodsmodal.hide();
		}

		$rootScope.GCode = GCode;
		$state.go("app.jego_search");
	}

    	/*선택된 상품들을 등록리스트에 저장 --> 이중 $scope - 이경민[2015-12] */
    	$scope.checkdataSave=function(){
		if($scope.goodsaddlists.length > 0){
			var check = 'N';
			for(var j=0; j < $scope.goodsaddlists.length; j++){
				for(var o=0; o < $scope.checkedDatas.length; o++){
					if($scope.goodsaddlists[j].code == $scope.checkedDatas[o].G_Code){
						$scope.goodsaddlists[j].overlap_color = '#FF5E00';
						$scope.checkedDatas[o].overlap_color = '#FF5E00';
					}
				}
			}
		}else{
			for(var o=0; o < $scope.checkedDatas.length; o++){
				$scope.checkedDatas[o].overlap_color = '#000';
			}
		}
		for(var i=0; i < $scope.checkedDatas.length; i++){
			if($rootScope.distinction == 'meaip') var d = $scope.setupData.basic_Dn_Meaip;
			else var d = $scope.setupData.basic_Dn_Sale;
			if(d == 0) d = '0';
			if(d == '0' && $scope.datas.GerCode != 0){
				MiuService.com_Dn($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.checkedDatas[i].G_Code, $scope.datas.GerCode,i,$scope.bar)
				.then(function(data){
					if(data.data.list[0].G_Discount_Or_Up == undefined || data.data.list[0].G_Discount_Or_Up != 'D' && data.data.list[0].G_Discount_Or_Up != 'U'){
						var price = data.data.list[0].G_Dn0;
					}else{
						if(data.data.list[0].G_Discount_Or_Up == 'D'){ // 할인
							var yulsik = parseInt(data.data.list[0].G_Discount_Yul) * 0.01;
							var yul = parseInt(data.data.list[0].G_Dn0) * yulsik;
							var price = parseInt(data.data.list[0].G_Dn0) - parseInt(yul);
						}else{ // 할증
							var yulsik = parseInt(data.data.list[0].G_Discount_Yul) * 0.01;
							var yul = parseInt(data.data.list[0].G_Dn0) * yulsik;
							var price = parseInt(data.data.list[0].G_Dn0) + parseInt(yul);
						}
					}
					$scope.test1(price,data.i,data.bar);
				})
			}else{
				switch(d){
					case '0': console.log('거래처별 단가'); var price = $scope.checkedDatas[i].G_Dn3; break;
					case '1': console.log('매입가&매출가'); var price = $scope.checkedDatas[i].G_Dn1; break;
					case '2': console.log('도매가'); var price = $scope.checkedDatas[i].G_Dn2; break;
					case '3': console.log('인터넷가'); var price = $scope.checkedDatas[i].G_Dn3; break;
					case '4': console.log('소매가'); var price = $scope.checkedDatas[i].G_Dn4; break;
					case '5': console.log('권장소비자가'); var price = $scope.checkedDatas[i].G_Dn5; break;

					default : console.log('설정안되있습니다.'); break;
				}
				if($scope.bar == 'Y'){
					$scope.bargoods = {
						num : 1
					}
					$ionicPopup.show({
						template: '<input type="number" ng-model="bargoods.num" style="text-align:right">',
						title: '('+ $scope.checkedDatas[0].G_Code +')<br>' + $scope.checkedDatas[0].G_Name,
						subTitle: '수량을 입력해주세요.',
						scope: $scope,
						buttons: [
							{
								text: '확인',
								onTap: function(e){
								if($scope.bargoods.num != 0){
									$scope.goodsaddlists.push({
										overlap_color : $scope.checkedDatas[0].overlap_color,
										name : $scope.checkedDatas[0].G_Name,
										num : parseInt($scope.bargoods.num),
										goodsprice : parseInt(price),
										code : $scope.checkedDatas[0].G_Code,
										stand : $scope.checkedDatas[0].G_Stand
									});
									$scope.checkedDatas.splice(0, $scope.checkedDatas.length);
									$scope.bar = 'N';
									}else{
										alert('0개는 등록 할 수 없습니다. 다시 시도해주세요.');
									}
								}
							},
						]
					});
				}else{
					if($rootScope.iu == 'i'){
						$scope.goodsaddlists.push({
							overlap_color : $scope.checkedDatas[i].overlap_color,
							name : $scope.checkedDatas[i].G_Name,
							num : 1,
							goodsprice : parseInt(price),
							code : $scope.checkedDatas[i].G_Code,
							stand : $scope.checkedDatas[i].G_Stand
						});
					}else{
						$scope.goodsaddlists.push({
							overlap_color : $scope.checkedDatas[i].overlap_color,
							name : $scope.checkedDatas[i].G_Name,
							num : 1,
							goodsprice : parseInt(price),
							code : $scope.checkedDatas[i].G_Code,
							goods_seq : parseInt($scope.pay.goods_seq_end) + 1,
							stand : $scope.checkedDatas[i].G_Stand,
							state : 'i'
						});
						$scope.pay.goods_seq_end = parseInt($scope.pay.goods_seq_end) + 1;
					}
				}
			}
			console.log("goodsaddlists =>", $scope.goodsaddlists);

		}
		/*펑션안 펑션 - 서비스거쳐 값안넘어오는 현상때문 - 이경민[2016-01]*/
		$scope.test1 = function(price,i,bar){
			if(bar == 'Y'){
				$scope.bargoods = {
					num : 1
				}
				$ionicPopup.show({
					template: '<input type="number" ng-model="bargoods.num" style="text-align:right">',
					title: '('+ $scope.checkedDatas[0].G_Code +')<br>' + $scope.checkedDatas[0].G_Name,
					subTitle: '수량을 입력해주세요.',
					scope: $scope,
					buttons: [
						{
							text: '확인',
							onTap: function(e){
								if($scope.bargoods.num != 0){
									$scope.goodsaddlists.push({
										overlap_color : $scope.checkedDatas[0].overlap_color,
										name : $scope.checkedDatas[0].G_Name,
										num : parseInt($scope.bargoods.num),
										goodsprice : parseInt(price),
										code : $scope.checkedDatas[0].G_Code,
										stand : $scope.checkedDatas[0].G_Stand
									});
									$scope.checkedDatas.splice(0, $scope.checkedDatas.length);
									$scope.bar = 'N';
								}else{
									alert('0개는 등록 할 수 없습니다. 다시 시도해주세요.');
								}
							}
						},
					]
				});
			}else{
				if($rootScope.iu == 'i'){
					$scope.goodsaddlists.push({
						overlap_color : $scope.checkedDatas[i].overlap_color,
						name : $scope.checkedDatas[i].G_Name,
						num : 1,
						goodsprice : parseInt(price),
						code : $scope.checkedDatas[i].G_Code,
						stand : $scope.checkedDatas[i].G_Stand
					});
				}else{
					$scope.goodsaddlists.push({
						overlap_color : $scope.checkedDatas[i].overlap_color,
						name : $scope.checkedDatas[i].G_Name,
						num : 1,
						goodsprice : parseInt(price),
						code : $scope.checkedDatas[i].G_Code,
						goods_seq : parseInt($scope.pay.goods_seq_end) + 1,
						stand : $scope.checkedDatas[i].G_Stand,
						state : 'i'
					});
					$scope.pay.goods_seq_end = parseInt($scope.pay.goods_seq_end) + 1;
				}
			}
		}
		$scope.bar = 'N';
		$scope.user.userGoodsName = '';
		$scope.clear_goods();
		$scope.goodsmodal.hide(); //goods_seq : data.list[i].Seq
	}

	/*상품조회모달 닫기*/
	$scope.goods_searchM_close = function(){
		$scope.checkedDatas.splice(0,$scope.checkedDatas.length);
		$scope.clear_goods();
		$scope.goodsmodal.hide();
	}

	/*바코드 스캔하기*/
	$scope.scanBarcode = function() {
		if($scope.checkedDatas.length != 0){
			$scope.checkedDatas.splice(0, $scope.checkedDatas.length);
		}
		$cordovaBarcodeScanner.scan().then(function(imageData) {
			if ($ionicHistory.backView()&&imageData.text=='') {
			}else{
				MiuService.barcode($scope.loginData.Admin_Code, $scope.loginData.UserId, imageData.text)
				.then(function(data){
					if(data == undefined){
						if(ERPiaAPI.toast == 'Y') $cordovaToast.show('일치하는 데이터가 없습니다.', 'short', 'center');
						else alert('일치하는 데이터가 없습니다.');
					}else{
						if($rootScope.distinction == 'meaip') $rootScope.ActsLog('meaip', 'meaip_select_barcode');
						else $rootScope.ActsLog('meachul', 'meachul_select_barcode'); 
						
						for(var b=0; b < data.list.length; b++){
							$scope.checkedDatas.push(data.list[b]);
							$scope.bar = 'Y';
						}
						$scope.checkdataSave();
					}
				})
			}
		}, function(error) {
		console.log("An error happened -> " + error);
		});
	}
	$scope.goods_seqlist = [];

	/* 해당 상품리스트항목 삭제 - 이경민[2015-12] */
	$scope.goodsDelete=function(index){
		if($rootScope.iu == 'u' && $scope.goodsaddlists[index].state == 'u'){
			$scope.pay.goods_del = 'Y';
			$scope.goods_seqlist.push({
				seq : $scope.goodsaddlists[index].goods_seq
			});
		}

		if($scope.goodsaddlists.length > 0){
			var check = 'N';
			var ch_num = 0;
			for(var j=0; j < $scope.goodsaddlists.length; j++){
				if(index != j && $scope.goodsaddlists[index].code == $scope.goodsaddlists[j].code){
					ch_num = ch_num + 1;
					$scope.goodsaddlists[j].overlap_color = 'check';
				}
			}

			if(ch_num < 2){
				for(var o=0; o < $scope.goodsaddlists.length; o++){
					if($scope.goodsaddlists[o].overlap_color == 'check'){
						$scope.goodsaddlists[o].overlap_color = '#000';
					}
				}
			}else if(ch_num > 1){
				for(var o=0; o < $scope.goodsaddlists.length; o++){
					if($scope.goodsaddlists[o].overlap_color == 'check'){
						$scope.goodsaddlists[o].overlap_color = '#FF5E00';
					}
				}
			}
			$scope.goodsaddlists.splice(index,1);
		}
	}

	/*상품 종합 합계 가격 구하기 - 이경민[2015-12] */
	$scope.goods_totalprice1=function(){
		$scope.datas.totalsumprices = 0;
		for(var count=0;count<$scope.goodsaddlists.length;count++){
			var sum = parseInt($scope.goodsaddlists[count].goodsprice) * parseInt($scope.goodsaddlists[count].num);
			$scope.datas.totalsumprices = $scope.datas.totalsumprices + sum;
		}
	};


	$scope.meaipchul_subul=function(index){
		if($scope.sbu == false){
			/*수불구분 활성화/비활성화*/
			if($rootScope.distinction == 'meaip'){
				if(index == 0){
					if($scope.subul[0].checked == false) {
						$scope.subul[0].checked = true;
					}
					$scope.subul[1].checked = false;
					$scope.datas.subulkind = 111;

				}else if(index == 1){
					if($scope.subul[1].checked == false) {
						$scope.subul[1].checked = true;
					}
					$scope.subul[0].checked = false;
					$scope.datas.subulkind = 122;
				}
			}else{
				if(index == 2){
					if($scope.subul[2].checked == false) {
						$scope.subul[2].checked = true;
					}
					$scope.subul[3].checked = false;
					$scope.datas.subulkind = 221;

				}else if(index == 3){
					if($scope.subul[3].checked == false) {
						$scope.subul[3].checked = true;
					}
					$scope.subul[2].checked = false;
					$scope.datas.subulkind = 212;
				}
			}
		}	
	}

	/*자동슬라이드업 - 이경민[2015-12] */
	$scope.checkup=function(){
		if($scope.datas.subulkind != 0){// 수불구분
			$scope.m_check.subulCheck = 't';
		}

		if($rootScope.iu == 'sb_u' || $rootScope.iu == 'sb_ui'){ // 세금계산서와 연계배송정보 존재 시 수정 => 창고와 매장만 수정가능
			$scope.basic2type=false;
			$scope.upAnddown2="ion-arrow-down-b";
			$scope.basictype= true;
			$scope.upAnddown="ion-arrow-up-b";
		}else{
			if($scope.m_check.cusCheck == 't' && $scope.m_check.subulCheck == 't' && $scope.m_check.meajangCheck == 't' && $scope.m_check.changoCheck == 't'){
				/*상품폼 열기*/
				$scope.basic2type=true;
				$scope.upAnddown2="ion-arrow-up-b";
				/*매입폼닫기*/
				$scope.basictype= false;
				$scope.upAnddown="ion-arrow-down-b";
			}
		}
	}


	/* ij modal - 이경민[2015-12] */
	$ionicModal.fromTemplateUrl('meaipchul/meaipchul_ij.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.ijmodal = modal;
	});

	/* 지급전표 펑션 - 이경민[2015-12] */
	$scope.ijmodal_function = function(){
		if($scope.datas.GerCode == 0 || $scope.datas.subulkind == 0 || $scope.goodsaddlists.length == 0){ // 거래처명 선택 x && 상품선택 x
		if($scope.datas.GerCode == 0){
			if(ERPiaAPI.toast == 'Y') $cordovaToast.show('거래처를 선택해주세요.', 'short', 'center');
			else alert('거래처를 선택해주세요.');
			$scope.basictype=true;
			$scope.basic2type=false;
			$scope.basic3type=false;
			$scope.upAnddown="ion-arrow-up-b";
			$scope.upAnddown2="ion-arrow-down-b";
			$scope.upAnddown3="ion-arrow-down-b";

		}else if($scope.datas.subulkind == 0){
			if(ERPiaAPI.toast == 'Y') $cordovaToast.show('수불구분을 지정하지 않었습니다.', 'short', 'center');
			else alert('수불구분을 지정하지 않었습니다.');
			$scope.basictype=true;
			$scope.basic2type=false;
			$scope.basic3type=false;
			$scope.upAnddown="ion-arrow-up-b";
			$scope.upAnddown2="ion-arrow-down-b";
			$scope.upAnddown3="ion-arrow-down-b";

		}else{
			if(ERPiaAPI.toast == 'Y') $cordovaToast.show('상품정보가 존재하지 않습니다. 한번더 확인하세요.', 'short', 'center');
			else alert('상품정보가 존재하지 않습니다. 한번더 확인하세요.');
			$scope.basictype=false;
			$scope.basic2type=true;
			$scope.basic3type=false;
			$scope.upAnddown="ion-arrow-down-b";
			$scope.upAnddown2="ion-arrow-up-b";
			$scope.upAnddown3="ion-arrow-down-b";

		}
		}else{
			$scope.totalnum = 0;
			for(var i =0; i < $scope.goodsaddlists.length; i++){
				$scope.totalnum = parseInt($scope.totalnum) + parseInt($scope.goodsaddlists[i].num);
				if($scope.goodsaddlists[i].num == 0){
					if(ERPiaAPI.toast == 'Y') $cordovaToast.show('0개의 상품은 등록할 수 없습니다.', 'short', 'center');
					else alert('0개의 상품은 등록할 수 없습니다.');
					$scope.basictype=false;
					$scope.basic2type=true;
					$scope.basic3type=false;
					$scope.upAnddown="ion-arrow-down-b";
					$scope.upAnddown2="ion-arrow-up-b";
					$scope.upAnddown3="ion-arrow-down-b";
					break;
				}else if(isNaN($scope.datas.totalsumprices) || $scope.goodsaddlists[i].num == null || $scope.goodsaddlists[i].num == undefined){ //상품가격이 제대로 입력되지 않았을시. -->isNaN == NaN걸러주는거
					if(ERPiaAPI.toast == 'Y') $cordovaToast.show('상품정보를 바르게 적어주세요.', 'short', 'center');
					else alert('상품정보를 바르게 적어주세요.');
					$scope.basictype=false;
					$scope.basic2type=true;
					$scope.basic3type=false;
					$scope.upAnddown="ion-arrow-down-b";
					$scope.upAnddown2="ion-arrow-up-b";
					$scope.upAnddown3="ion-arrow-down-b";
					break;
				}else if(i == $scope.goodsaddlists.length-1 && $scope.goodsaddlists[i].goodsprice != null || i == $scope.goodsaddlists.length-1 && $scope.goodsaddlists[i].goodsprice != undefined){
					$scope.ijmodal.show();
				}
			}
		}
	}

	/* 지급전표 삭제 - 이경민[2015-12] */
	$scope.paydelete = function(){
		$ionicPopup.show({
			title: '경고',
			subTitle: '',
			content: '지급전표를 삭제합니다.',
			buttons: [
				{
					text: 'No',
					onTap: function(e){
				}
				},
				{
					text: 'Yes',
					type: 'button-positive',
					onTap: function(e) {
						$scope.pay.gubun = 4;
						$scope.pay.paycardbank = 'no';
						for(var i = 0; i<4; i++){
							$scope.payment[i].checked = false;
						}
						$scope.pay.use = true;
						$scope.pay.payprice =  0;
					}
				},
			]
		})
	}

	$scope.paylist = [
	{ code : '', name : '', num : 0 },
	{ code : '', name : '', num : 0 }
	]

	/* 지급구분 - 이경민[2015-12] */
	$scope.Payments_division=function(index){
		$scope.pay.gubun = index;
		/*지급액 활성화/비활성화*/
		if($scope.payment[index].checked == true) $scope.pay.use = false;
		else $scope.pay.use = true;

		for(var i = 0; i < $scope.payment.length; i++){
			if(i != index){
				$scope.payment[i].checked = false;
			}
		}

		if(index == 1 && $scope.payment[index].checked == true || index == 3 && $scope.payment[index].checked == true){
			$scope.pay.paycardbank = 'no';
			$scope.pay.codenum = -1;
			$scope.paycardbank.splice(0,$scope.paycardbank.length);
			$scope.paytype = true;
			MiuService.ij_data($scope.loginData.Admin_Code, $scope.loginData.UserId, index)
			.then(function(data){
				if(data == '<!--Parameter Check-->'){
					if(ERPiaAPI.toast == 'Y') $cordovaToast.show('ERPIa에 등록되어있는 카드/통장정보가 없습니다. 등록 후 사용해주세요.', 'long', 'center');
					else alert('ERPIa에 등록되어있는 카드/통장정보가 없습니다. 등록 후 사용해주세요.');
					$scope.paytype = false;
				}else{
					if(index == 1){
						$scope.payname = '은행';
						if($scope.pay.paycardbank.length<3) $scope.pay.paycardbank = 'no';
						for(var i=0; i < data.list.length; i++){
							$scope.paycardbank.push({
								num : data.list[i].Bank_Account,
								name : data.list[i].Bank_Name,
								code : data.list[i].Bank_Code
							});
						}
					}else{
					$scope.payname = '카드';
					if($scope.pay.paycardbank.length<3) $scope.pay.paycardbank = 'no';
						for(var i=0; i < data.list.length; i++){
							$scope.paycardbank.push({
								num : data.list[i].Card_Num,
								name : data.list[i].Card_Name,
								code : data.list[i].Card_Code
							});
						}
					}
				}
				
			})
		}else{
			$scope.paycardbank.splice(0,$scope.paycardbank.length);
			$scope.paytype = false;
			$scope.pay.codenum = -1;
			$scope.pay.paycardbank = 'no';
			for(var i=0; i<2; i++){
				$scope.paylist[i] = {
					code : '',
					name : '',
					num : 0
				};
			}
		}
	}

	/* 지급전표 insert - 이경민[2015-12] */
	$scope.payinsert = function(){
		if($scope.paylist.length > 0){
			$scope.paylist.splice(0,$scope.paylist.length);
		}
		$scope.pay_datas = $scope.pay.paycardbank.split(',');

		if($scope.payment[1].checked == true){ // 은행
			$scope.paylist[0] = {
				code :  $scope.pay_datas[0],
				name :  $scope.pay_datas[1],
				num :  $scope.pay_datas[2]
			};
			$scope.paylist[1] = {
				code : '',
				name : '',
				num : 0
			}
		}else{ //카드
			$scope.paylist[0] = {
				code : '',
				name : '',
				num : 0
			};
			$scope.paylist[1] = {
				code :  $scope.pay_datas[0],
				name :  $scope.pay_datas[1],
				num :  $scope.pay_datas[2]
			};
		}
	}
	/* 지급모달 닫기 - 이경민[2015-12] */
	$scope.ijmodalCancel = function(){
		$scope.ijmodal.hide();
	}


	$scope.insertGoodsF=function(){
	    	if($scope.pay.use == false && $scope.pay.payprice == 0){
	    		if(ERPiaAPI.toast == 'Y') $cordovaToast.show('지급액을 확인해주세요.', 'short', 'center');
			else alert('지급액을 확인해주세요.');
	    	}else if($scope.payment[3].checked == true && $scope.pay.paycardbank == 'no' || $scope.payment[1].checked == true && $scope.pay.paycardbank == 'no'){
	 		if(ERPiaAPI.toast == 'Y') $cordovaToast.show('카드/통장을 선택해주세요.', 'short', 'center');
			else alert('카드/통장을 선택해주세요.');
	    	}else{
		    	if($scope.payment[0].checked != true && $scope.payment[1].checked != true && $scope.payment[2].checked != true && $scope.payment[3].checked != true){
		    		$scope.pay.gubun = 4;
		    	}
		    	$ionicPopup.show({
				title: '<b>전표저장</b>',
				content: '전표를 저장하시겠습니까?',
				buttons: [
					{
						text: 'No',
						onTap: function(e){}
					},
					{
						text: 'Yes',
						type: 'button-positive',
						onTap: function(e) {
							$ionicHistory.clearCache();
							
							if ($rootScope.distinction == 'meaip') $rootScope.ActsLog('meaip', 'meaip_master_save');
							else $rootScope.ActsLog('meachul', 'meachul_master_save');

							if($scope.pay.gubun == 0){ // 현금
								var module_T = 'ij_money';
							}else if($scope.pay.gubun == 1){ // 통장
								var module_T = 'ij_bank';
							}else if($scope.pay.gubun == 2){	//어음
								var module_T = 'ij_note';
							}else if($scope.pay.gubun == 3){ // 카드
								var module_T = 'ij_card';
							}

							if($rootScope.distinction == 'meaip'){
								var module_T = 'meaip_save_' + module_T;
								$rootScope.ActsLog('meaip', module_T);
							}else {
								var module_T = 'meachul_save_' + module_T;
								$rootScope.ActsLog('meachul', module_T);
							} 
							if($rootScope.iu == 'i'){
								MiuService.subulupdate($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.datas.subulkind)
								.then(function(data){
								});

								MiuService.i_data($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.pay, $scope.paylist, $scope.date, $scope.goodsaddlists,$scope.setupData,$scope.datas)
								.then(function(data){
									$ionicPopup.show({
										title: '<b>저장완료</b>',
										content: '전표가 저장되었습니다. <br> 확인하시겠습니까?',
										buttons: [
											{
												text: 'No',
												onTap: function(e){
													$scope.ijmodal.hide();
													if($rootScope.distinction == 'meaip'){ /* 매입일 경우 */
														$ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
														$state.go('app.meaip_page', {}, {location:'replace'});
													}else{ /* 매출일 경우 */
														$ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
														$state.go('app.meachul_page', {}, {location:'replace'});
													}
												}
											},
											{
												text: 'Yes',
												type: 'button-positive',
												onTap: function(e) {
													$scope.ijmodal.hide();
													if($rootScope.distinction == 'meaip'){ /* 매입일 경우 */
														$rootScope.m_no = data.list[0].iL_No;
														$state.go('app.meaip_depage', {}, {location:'replace'});
													}else{ /* 매출일 경우 */
														$rootScope.m_no = data.list[0].SL_No;
														$state.go('app.meachul_depage', {}, {location:'replace'});
													}
												}
											},
										]
									})
								})
							}else{
								if($rootScope.iu == 'sb_u' || $rootScope.iu == 'sb_ui') $rootScope.iu = 'u';
								if($scope.pay.gubun == 4 && $scope.pay.delete == false){
									MiuService.pay_delete($scope.loginData.Admin_Code, $scope.loginData.UserId,$scope.pay.acno)
									.then(function(data){
									});
								}
								MiuService.u_data($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.pay, $scope.paylist, $scope.date, $scope.goodsaddlists,$scope.setupData,$scope.datas,$scope.goods_seqlist)
								.then(function(data){
									$ionicPopup.alert({
										title: '<b>수정완료</b>',
										content: '전표가 수정되었습니다.',
									});
									$scope.ijmodal.hide();
									$ionicHistory.clearCache();
									if($rootScope.distinction == 'meaip'){ /* 매입일 경우 */
										$ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
										$state.go('app.meaip_page', {}, {location:'replace'});
									}else{ /* 매출일 경우 */
										$ionicHistory.nextViewOptions({disableBack:true, historyRoot:true});
										$state.go('app.meachul_page', {}, {location:'replace'});
									}
								})
								if($scope.pay.goods_del == 'Y'){
									for(var i = 0; i < $scope.goods_seqlist.length; i++){
										var seq = $scope.goods_seqlist[i].seq;
										MiuService.seq_del($scope.loginData.Admin_Code, $scope.loginData.UserId, $scope.pay.no, seq)
										.then(function(data){
										})
									}
									$scope.pay.goods_del = 'N';
								}
							}
						}
					},
				]
			})
		}
	}

	/* 뒤로 제어 - 이경민[2015-12] */
	$scope.backControll=function(){
		$ionicPopup.show({
			title: '<b>경고</b>',
			subTitle: '',
			content: '작성중인 내용이 지워집니다.<br> 계속진행하시겠습니까?',
			buttons: [
				{
					text: 'No',
					onTap: function(e){}
				},
				{
					text: 'Yes',
					type: 'button-positive',
					onTap: function(e) {
						if($rootScope.distinction == 'meaip'){ /* 매입일 경우 */
							$scope.goodsaddlists = [];
							$ionicHistory.clearCache();
							$ionicHistory.goBack();
						}else{ /* 매출일 경우 */
							$ionicHistory.clearCache();
							$scope.goodsaddlists = [];
							$ionicHistory.goBack();
						}
					}
				},
			]
		})
	}
});

//////////////////////////////////////////////////매입&매출 통합 다시 (끝) /////////////////////////////////////////////////////////////////////