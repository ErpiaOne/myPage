// 재고현황 컨트롤러
angular.module('starter.controllers').controller('jegoCtrl', function($scope, $rootScope, $ionicPopup, $ionicHistory, $timeout, $cordovaToast, jego_Service, $state, $location, $cordovaBarcodeScanner, $ionicPlatform, $ionicLoading, $ionicModal, ERPiaAPI, app, $ionicSlideBoxDelegate, $ionicSideMenuDelegate) {
	console.log('jegoCtrl(재고현황 조회 컨트롤러)');

	$ionicSideMenuDelegate.canDragContent(true);
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

	$scope.backbtn = function(){
		$ionicHistory.goBack();
		$ionicSideMenuDelegate.canDragContent(true);
	}

	$scope.jegoSearch = 'hap';

	$scope.upAnddown = 'ion-arrow-down-b';
	$scope.upAnddown2 = 'ion-arrow-up-b';
	$scope.upAnddown3 = 'ion-arrow-up-b';

	$scope.basictype=true;
	$scope.basic2type=false;
	$scope.basic3type=false;

	// 통합검색어 
	$scope.jego_searchModule = { all_Search : '' };

	$scope.select_jegoindex = -1;	// 상세보기는 하나씩만 할수있도록...
	$scope.pageCnt = 1;			// 조회결과 페이징 
	$scope.select_CList = '';		// 선택된창고 - multiple
	$scope.morebutton = true;		// 더보기 버튼 활성화 유무

	/* 상세조회 리스트 */
	$rootScope.jego_detail_colum = {
		pro_name 			: '',		// 상품명
		pro_stand 			: '', 		// 규격
		pro_OnCode 		: '',		// 자체코드
		pro_barCode 		: '',		// 바코드
		pro_ChangGo 		: ["ALL"],		// 창고
		OneSelectCode		: '',		// 선택 상품 코드 - 디테일 조회시 필요 

		detail_location 		: '',		// 로케이션
		detail_brand 		: '', 		// 브랜드
		detail_Jejo			: '',		// 제조처

		attent_Kshim_name 	: '',		// 관심항목 이름
		attent_Kshim_code 	: '',		// 관심항목 코드
		attent_Mylist_name 	: '',		// 관심항목 이름
		attent_Mylist_code 	: '',		// 관심항목 코드

		MeachulMonth 		: '0',		// 매출월 1~12
		MeachulListYN 		: 'Y',		// 매출내역 존재여부	: Y 존재 / N 미존재
		MeachulListCtlYN 	: 'N',		// 매출내역 존재옵션 사용여부	: Y / N
		JegoQtyCtl 		: '1',		// 재고수량별 조회 옵션	: 1 -> 재고수량 ALL(기본) / 2 -> 재고 ≠ 0 / 3 -> 재고 = 0 / 4 -> 재고 ≥ 0/ 5 -> 재고 ≤ 0
		JegoQtyCtlYN 		: 'N',		// 재고수량별 조회 옵션 사용여부	: Y / N 
	}

	/* 개월수 */
	$scope.month = [
		{ id : '1' },
		{ id : '2' },
		{ id : '3' },
		{ id : '4' },
		{ id : '5' },
		{ id : '6' },
		{ id : '7' },
		{ id : '8' },
		{ id : '9' },
		{ id : '10' },
		{ id : '11' },
		{ id : '12' }
	]

	/* 열었다 접었다 - 재고 조회화면 헤더? */
	if($rootScope.jegoinfo_header == undefined){
		$rootScope.jegoinfo_header = true;
	}
	

	/* jegoInfo_Header 컨트롤 */
	$rootScope.infoHeader = function(){
		if($rootScope.jegoinfo_header == true){
			$rootScope.jegoinfo_header = false;
		}else{
			$rootScope.jegoinfo_header = true;
		}
	}

	/* 재고조회시 창고 리스트 조회 [이경민 - 2016-09-19] */
	$scope.jego_Changgh = function() {
		$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});$ionicLoading.hide();
		$timeout(function(){
			$rootScope.loadingani();
			if($rootScope.jegoColum != undefined){
				$scope.jego_detail_colum.pro_ChangGo = $rootScope.jegoColum.pro_ChangGo;
			}

			jego_Service.jego_changgoSearch($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId)
			.then(function(data){
				$rootScope.Ch_List = data.list;
				console.log('ckdrh rjator =>', $rootScope.Ch_List)
			});
			$ionicLoading.hide();
		}, 1000);
	}

	$scope.jego_Changgh();

	/* 통합/상세 검색 모드변경 [이경민 - 2016-08-29] */
	$scope.jegoSear_change = function(){
		$timeout(function(){
			$scope.loadingani();
			$ionicSlideBoxDelegate.slide(0, 500);
			if($scope.jegoSearch == 'hap'){
				$scope.jego_Changgh();
				$scope.jegoSearch = 'detail';
			}else if($scope.jegoSearch == 'detail'){
				$scope.jegoSearch = 'hap';
			}
		}, 500);
	}

	/* 재고 상세관리 화면 창 컨트롤 [이경민 - 2016-08-29] */
	$scope.jego_Next = function(num){
		if(num == 1){ // 상품선택
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
		}else if(num == 2){ // 상세선택
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
		}else{ // 관심항목
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
	}

	/* 관심항목/MY LIST 목록조회시 뜨는 모달창(크기 작음) - 이경민[2016-08-30] */
	$ionicModal.fromTemplateUrl('jego_manage/mylist_modal.html',{
		scope : $scope,
		animation: 'scale-in'
	}).then(function(modal){
		$scope.mylist_Modal = modal;
	});

	/* 상품정보관련 세부버튼 클릭시 뜨는 모달창(크기 작음) - 이경민[2016-09-01] */
	$ionicModal.fromTemplateUrl('jego_manage/jegosele_modal.html',{
		scope: $scope,
		animation: 'scale-in'
	}).then(function(modal){
		$scope.jegosele_Modal = modal;
	});

	/* MyList & 관심항목 구분펑션 - 이경민[2016-09-20] */
	$scope.mylist = function(num){
		if(num == 2){
			$scope.listname = "My LIST";
			var mode = 'Util_Select_MyList_M';

		}else{
			$scope.listname = "관심항목";
			var mode = 'Util_Select_KShim_M';
		}
		$scope.AttentionList = [];

		jego_Service.Attention_list($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, mode)
		.then(function(data){
			if(data != '<!--Parameter Check-->'){
				$scope.AttentionList = data.list;
				$scope.mylist_Modal.show();
			}else{
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회결과가 없습니다. ERPIA에서 ' + $scope.listname + '을 지정해주세요.', 'short', 'center');
				else console.log('조회결과가 없습니다. ERPIA에서 ', $scope.listname, '을 지정해주세요.');
			}
		});
	}

	/* MyList & 관심항목 리스트 선택 - 이경민[2016-09-21] */
	$scope.Attent_Choose = function(index){
		if($scope.listname == '관심항목'){
			$rootScope.ActsLog("jego", "jego_Kshim");
			$scope.jego_detail_colum.attent_Kshim_name = $scope.AttentionList[index].K_Name;
			$scope.jego_detail_colum.attent_Kshim_code = $scope.AttentionList[index].K_Code;
			$scope.jego_detail_colum.attent_Mylist_name = '';
			$scope.jego_detail_colum.attent_Mylist_code = '';
		}else{
			$rootScope.ActsLog("jego", "jego_Mylist");
			$scope.jego_detail_colum.attent_Mylist_name = $scope.AttentionList[index].M_Name;
			$scope.jego_detail_colum.attent_Mylist_code = $scope.AttentionList[index].MyCode;
			$scope.jego_detail_colum.attent_Kshim_name = '';
			$scope.jego_detail_colum.attent_Kshim_code = '';
		}
		$scope.mylist_Modal.hide();
	}

	/* MyList & 관심항목 리스트 선택 내역 삭제 - 이경민[2016-09-21] */
	$scope.attent_delete = function(){
		$scope.jego_detail_colum.attent_Kshim_name = '';
		$scope.jego_detail_colum.attent_Kshim_code = '';
		$scope.jego_detail_colum.attent_Mylist_name = '';
		$scope.jego_detail_colum.attent_Mylist_code = '';
	}

	$scope.mylist_cloes = function(){
		$scope.mylist_Modal.hide(); // MyList & 관심항목 모달 닫기
	}

	/* 검색어 삭제 */
	$scope.clearc_keyword = function(){
		$scope.jego_searchModule.all_Search = '';
	}

	/* 상세조회 조회옵션 YN - 이경민[2016-09-28] */
	$scope.YNCheck = function(val){
		if(val == 1){ // 매출월 조회옵션 사용유무
			if($scope.jego_detail_colum.MeachulMonth == '0'){
				$scope.jego_detail_colum.MeachulListCtlYN = 'N';
			}else{
				$rootScope.ActsLog("jego", "jego_month");
				$scope.jego_detail_colum.MeachulListCtlYN = 'Y';
			}
		}else { // 재고수량별 조회 옵션 사용여부
			if($scope.jego_detail_colum.JegoQtyCtl == '1'){
				$scope.jego_detail_colum.JegoQtyCtlYN = 'N';
			}else{
				$scope.jego_detail_colum.JegoQtyCtlYN = 'Y';
			}
		}
	}

	/* X버튼 누르면 조회값 초기화되는 기능 하나로 합침 - 이경민 */
	$scope.jego_search_delete = function(num){
		switch (num){
			case 1 : $scope.jego_detail_colum.pro_name = ''; break;
			case 2 : $scope.jego_detail_colum.pro_stand = ''; break;
			case 3 : $scope.jego_detail_colum.pro_OnCode = ''; break;
			case 4 : $scope.jego_detail_colum.pro_barCode = ''; break;
			case 5 : $scope.jego_detail_colum.detail_location = ''; break;
			case 6 : $scope.jego_detail_colum.detail_brand = ''; break;
			case 7 : $scope.jego_detail_colum.detail_Jejo = ''; break;

			default : console.log('num ->', num); break;
		}
	}

	/* 더보기 버튼 이슈 - 이경민 */
	$scope.MoreBt = function(){
		if($rootScope.jego_result != undefined){
			if($rootScope.jego_result.length < 10){
				$scope.morebutton = false;	
			}else{
				$scope.morebutton = true;	
			}
		}
	}

	$scope.MoreBt();

	/* 통합 검색 서비스 하나로 합침 - 이경민 */
	$scope.hapSearch = function(ChanggoCode, keyword, YN, OneSelectCode, pageCnt){
		jego_Service.main_search($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, ChanggoCode, keyword, YN, OneSelectCode, pageCnt)
		.then(function(data){
			if(data != '<!--Parameter Check-->'){
					$rootScope.jego_result = data.list;
					$scope.jego_Changgh();
					$scope.MoreBt();
					$state.go("app.jego_search");
					$ionicLoading.hide();
			}else{
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회결과가 없습니다.', 'short', 'center');
				else console.log('조회결과가 없습니다.');
				$ionicLoading.hide();
			}
		});
	}



	/* 상세 검색 서비스 하나로 합침 - 이경민 */
	$scope.detail = function(Mode, changgo_key, jegoInfo, pageCnt){
		$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});
			jego_Service.detailJego_search($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, Mode, changgo_key, jegoInfo, pageCnt)
			.then(function(data){
				if(data != '<!--Parameter Check-->'){
					$rootScope.jego_result = data.list;
					$scope.jego_Changgh();
					$scope.MoreBt();
					if($rootScope.jegoMode != 'hap'){
						jego_Service.search_Save($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, $rootScope.changgo_keyword, $rootScope.jegoColum, 'Util_Reg_Select_OptSet_Lately', '')
						.then(function(data){
							if(data == '<!--Parameter Check-->'){
								if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회결과가 없습니다.', 'short', 'center');
								else console.log('조회결과가 없습니다.');
							}
						});
					}
					$ionicLoading.hide();
					$state.go("app.jego_search");
				}else{
					if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회결과가 없습니다.', 'short', 'center');
					else console.log('조회결과가 없습니다.');
					$ionicLoading.hide();
				}
			});
	}

	/* 통합검색 바코드 검색 [이경민 - 2016-08-29] */
	$scope.jego_barc = function(){
		$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});
		$rootScope.jegoMode = $scope.jegoSearch;
		if($scope.jegoSearch == 'hap'){								// 통합 검색시 바코드검색
			$cordovaBarcodeScanner.scan().then(function(imageData) {
				if ($ionicHistory.backView()&&imageData.text=='') {
					if(ERPiaAPI.toast == 'Y') $cordovaToast.show('바코드를 정확히 찍어주세요.', 'short', 'center');
					else console.log('바코드를 정확히 찍어주세요.');
					$ionicLoading.hide();
				}else if(imageData.text.length == 0){
					console.log('취소');
					$ionicLoading.hide();
				}else{
					$rootScope.keyword = imageData.text;
					$scope.morebutton = false;
					$rootScope.jego_detail_colum.CodeSearchYN = 'Y';
					$rootScope.jegoColum = $scope.jego_detail_colum; // 재고 전체 조회 값
					$scope.hapSearch('', imageData.text, 'Y', '', 1);
				}
			}, function(error) {
				console.log("An error happened -> " + error);
			});
		}else {											// 상세검색시 바코드검색
			$cordovaBarcodeScanner.scan().then(function(imageData) {
				if ($ionicHistory.backView()&&imageData.text=='') {
					if(ERPiaAPI.toast == 'Y') $cordovaToast.show('바코드를 정확히 찍어주세요.', 'short', 'center');
					else console.log('바코드를 정확히 찍어주세요.');
					$ionicLoading.hide();
				}else if(imageData.text.length == 0){
					console.log('취소');
					$ionicLoading.hide();
				}else{
					$scope.jego_detail_colum.pro_barCode = imageData.text;
					$scope.morebutton = false;

					/* 창고 코드 조합 */
					if($scope.jego_detail_colum.pro_ChangGo[0] == 'ALL'){
					var mode = "Select_Detail_All";
					var changgo_keyword = "ALL"
					}else{
						var mode = "Select_Detail_ChangGobyul";
						var changgo_keyword = "";
						for(var i = 0; i < $scope.jego_detail_colum.pro_ChangGo.length; i++){
							if(i == 0){
								changgo_keyword = $scope.jego_detail_colum.pro_ChangGo[i];
							}else{
								changgo_keyword = changgo_keyword + ',' +  $scope.jego_detail_colum.pro_ChangGo[i];
							}
						}
					}
					$rootScope.changgo_keyword = changgo_keyword; // 키워드
					$rootScope.jegoColum = $scope.jego_detail_colum; // 재고 전체 조회 값
					$rootScope.jegoMode = $scope.jegoSearch; // 모드
					$scope.detail(mode, changgo_keyword, $scope.jego_detail_colum, 1);
				}
			}, function(error) {
			console.log("An error happened -> " + error);
			});
		}
	}

	/* 재고조회 - 이경민[2016-08] */
	$scope.jego_search = function(){
		$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});
		if($scope.jegoSearch == 'hap'){ 						// 통합검색시 재고조회
			$rootScope.keyword = $scope.jego_searchModule.all_Search;
			$rootScope.jegoMode = $scope.jegoSearch; // 모드
			$scope.jego_detail_colum.pro_ChangGo = ["ALL"];
			$rootScope.jego_detail_colum.CodeSearchYN = 'N';
			$rootScope.jegoColum = $scope.jego_detail_colum; // 재고 전체 조회 값
				if($scope.jego_searchModule.all_Search.length == 0){
					if(ERPiaAPI.toast == 'Y') $cordovaToast.show('검색어를 입력해주세요.', 'short', 'center');
					else console.log('검색어를 입력해주세요.');
					$ionicLoading.hide();

				}else{
					$scope.pageCnt = 1; // 페이징번호 생성
					$scope.hapSearch('', $scope.jego_searchModule.all_Search, 'N', '', $scope.pageCnt);
					$ionicLoading.hide();
				}
		}else{ 										// 상세검색시 재고조회
			var num = 1;
			if($scope.jego_detail_colum.pro_name != '') var num = num + 1;
			if($scope.jego_detail_colum.pro_stand != '') var num = num + 1;
			if($scope.jego_detail_colum.pro_OnCode != '') var num = num + 1;
			if($scope.jego_detail_colum.pro_barCode != '') var num = num + 1;
			if($scope.jego_detail_colum.detail_brand != '') var num = num + 1;
			if($scope.jego_detail_colum.detail_Jejo != '') var num = num + 1;
			if($scope.jego_detail_colum.detail_location != '') var num = num + 1;
			if($scope.jego_detail_colum.attent_Kshim_name != '') var num = num + 1;
			if($scope.jego_detail_colum.attent_Mylist_name != '') var num = num + 1;

			if($scope.jego_detail_colum.pro_ChangGo.length == 0){
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('창고를 선택해주세요.', 'short', 'center');
				else console.log('창고를 선택해주세요.');
				$ionicLoading.hide();
			}else{
				/* 행적로그 저장 */
				switch ($scope.jego_detail_colum.JegoQtyCtl) {
					case '1' : $rootScope.ActsLog("jego", "jego_count_all"); break;
					case '2' : $rootScope.ActsLog("jego", "jego_count_not_jero"); break;
					case '3' : $rootScope.ActsLog("jego", "jego_count_jero"); break;
					case '4' : $rootScope.ActsLog("jego", "jego_count_jero_more"); break;
					case '5' : $rootScope.ActsLog("jego", "jego_count_jero_below"); break;
				}

				if( num > 1 ){
					if($scope.jego_detail_colum.pro_ChangGo[0] == 'ALL'){
					var mode = "Select_Detail_All";
					var changgo_keyword = "ALL"
					}else{
						var mode = "Select_Detail_ChangGobyul";
						var changgo_keyword = "";
						for(var i = 0; i < $scope.jego_detail_colum.pro_ChangGo.length; i++){
							if(i == 0){
								changgo_keyword = $scope.jego_detail_colum.pro_ChangGo[i];
							}else{
								changgo_keyword = changgo_keyword + ',' +  $scope.jego_detail_colum.pro_ChangGo[i];
							}
						}
					}
						/* 값 가지고 페이지 이동.. */
						$rootScope.changgo_keyword = changgo_keyword; // 키워드
						$rootScope.jegoColum = $scope.jego_detail_colum; // 재고 전체 조회 값
						$rootScope.jegoMode = $scope.jegoSearch; // 모드
						$scope.pageCnt = 1;
						$scope.detail(mode, changgo_keyword, $scope.jego_detail_colum, $scope.pageCnt);
				}else{
					if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회조건은 1개 이상 지정해야 합니다.', 'short', 'center');
					else console.log('조회조건은 1개 이상 지정해야 합니다.');
					$ionicLoading.hide();
				}
			}
		}
	}



	/* 재고조회 - 더보기 - 이경민[2016-09-20] */
	$scope.jego_more = function(){
		$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});
		if($scope.changgo_keyword == undefined || $scope.changgo_keyword == "ALL") $scope.changgo_keyword = '';
		$scope.pageCnt = $scope.pageCnt + 1;

		if($rootScope.jegoMode == 'hap'){ 							// 통합조회일 경우 더보기
			jego_Service.main_search($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, $scope.changgo_keyword, $rootScope.keyword, 'N', '', $scope.pageCnt)
			.then(function(data){
				if(data != '<!--Parameter Check-->'){
					$scope.MoreBt();
					for(var m = 0; m < data.list.length; m++){
						$rootScope.jego_result.push(data.list[m]);
					}
					$ionicLoading.hide();
				}else{
					$scope.morebutton = false;
					if(ERPiaAPI.toast == 'Y') $cordovaToast.show('더이상 조회결과가 존재하지 않습니다.', 'short', 'center');
					else console.log('더이상 조회결과가 존재하지 않습니다.');
					$ionicLoading.hide();
				}
			});
		}else{ 												// 상세조회일 경우 더보기
			/* Admin_Code, UserId, Mode, changgo_key, jegoInfo, pageCnt */
			if($scope.changgo_keyword == '') var Mode = 'Select_Detail_All';
			else var Mode = 'Select_Detail_ChangGobyul'; 
			jego_Service.detailJego_search($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, Mode, $scope.changgo_keyword, $rootScope.jegoColum, $scope.pageCnt)
			.then(function(data){
				if(data != '<!--Parameter Check-->'){
					$scope.MoreBt();
					for(var m = 0; m < data.list.length; m++){
						$rootScope.jego_result.push(data.list[m]);
					}
					$ionicLoading.hide();
				}else{
					if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회결과가 없습니다.', 'short', 'center');
					else console.log('조회결과가 없습니다.');
					$ionicLoading.hide();
				}
			});
		}
	}

	/* 재고 상세조회 (전체창고나옴)- 이경민[2016-09-01] */
	$scope.jego_detail = function(index){
		$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});
		if($rootScope.jego_result[index].trfa == false){		// 열기

			$rootScope.ActsLog("jego", "jego_detail_unfold");

			for(var i = 0; i < $rootScope.jego_result.length; i++){
				if(i == index){
					$rootScope.jego_result[index].trfa = true;
				}else{
					$rootScope.jego_result[i].trfa = false;
				}
			}
			
			$scope.select_jegoindex = index;
			if($rootScope.jegoMode == 'hap'){ 						// 통합조회일 경우 상세조회
				jego_Service.main_search($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, 'ALL', '', 'N', $rootScope.jego_result[index].G_Code, 1)
				.then(function(data){
					if(data != '<!--Parameter Check-->'){
						$rootScope.jego_detail_List = data.list;
						$ionicLoading.hide();
					}else{
						if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회결과가 없습니다.', 'short', 'center');
						else console.log('조회결과가 없습니다.');
						$ionicLoading.hide();
					}
				});
			}else{												// 상세조회일 경우 상세조회
				var Mode = 'Select_Detail_One';
				$rootScope.jegoColum.OneSelectCode = $rootScope.jego_result[index].G_Code;
				jego_Service.detailJego_search($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, Mode, $scope.changgo_keyword, $rootScope.jegoColum, 1)
				.then(function(data){
					if(data != '<!--Parameter Check-->'){
						$rootScope.jego_detail_List = data.list;
						$rootScope.jegoColum.OneSelectCode='';
						$ionicLoading.hide();
					}else{
						if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회결과가 없습니다.', 'short', 'center');
						else console.log('조회결과가 없습니다.');
						$ionicLoading.hide();
					}
				});
			}

		}else{		// 닫기
			$rootScope.jego_result[index].trfa = false;
			$rootScope.jego_detail_List = []; // 재고 상세조회 초기화
			$scope.select_jegoindex = -1;
			$ionicLoading.hide();
		}
	}

	/* 창고 선택 후 재조회 */
	$scope.reSelect = function(){
		$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});
		$rootScope.jego_result = [];
		/* 재조회시 선택창고 문자열 만들기 */
		if($scope.jego_detail_colum.pro_ChangGo[0] == 'ALL'){
			var mode = "Select_Detail_All"; // 상세
			$scope.changgo_keyword = ""
		}else{
			var mode = "Select_Detail_ChangGobyul"; // 상세
			$scope.changgo_keyword = "";
			for(var i = 0; i < $scope.jego_detail_colum.pro_ChangGo.length; i++){
				if(i == 0){
					$scope.changgo_keyword = $scope.jego_detail_colum.pro_ChangGo[i];
				}else{
					$scope.changgo_keyword = $scope.changgo_keyword + ',' +  $scope.jego_detail_colum.pro_ChangGo[i];
				}
			}
		}
		console.log('$rootScope.jegoColum', $rootScope.jegoColum);

		if($rootScope.distinction == undefined || $rootScope.distinction == ''){
			$scope.pageCnt = 1; // 재조회일경우 페이지 번호 초기화
			$rootScope.jegoColum.pro_ChangGo = $scope.jego_detail_colum.pro_ChangGo; // 재조회 경우 창고 저장
			if($rootScope.jegoMode == 'hap'){ 							// 통합조회일 경우 창고선택 조회
				jego_Service.main_search($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, $scope.changgo_keyword, $rootScope.keyword, $rootScope.jegoColum.CodeSearchYN, '', $scope.pageCnt)
				.then(function(data){
					if(data != '<!--Parameter Check-->'){
						$rootScope.jego_result = data.list;
						$scope.jego_Changgh();
						$ionicLoading.hide();
					}else{
						if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회결과가 없습니다.', 'short', 'center');
						else console.log('조회결과가 없습니다.');
						$ionicLoading.hide();
					}
				});
			}else{ 												// 상세조회일 경우 창고선택 조회
				jego_Service.detailJego_search($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, mode, $scope.changgo_keyword, $rootScope.jegoColum, $scope.pageCnt)
				.then(function(data){
					if(data != '<!--Parameter Check-->'){
						$rootScope.jego_result = data.list;
						$scope.jego_Changgh();
						$ionicLoading.hide();
					}else{
						if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회결과가 없습니다.', 'short', 'center');
						else console.log('조회결과가 없습니다.');
						$ionicLoading.hide();
					}
				});
			}
		}else if($rootScope.distinction == 'meaip' || $rootScope.distinction == 'meachul'){
			jego_Service.meaipchul_search($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, $scope.changgo_keyword, $rootScope.keyword, 'N', '', $scope.pageCnt, $rootScope.GCode)
			.then(function(data){
				if(data != '<!--Parameter Check-->'){
					$rootScope.jego_result = data.list;
					$scope.jego_Changgh();
					$ionicLoading.hide();
				}else{
					if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회결과가 없습니다.', 'short', 'center');
					else console.log('조회결과가 없습니다.');
					$ionicLoading.hide();
				}
			});
		}
	}

	/* 상품상세 정보, 등록 모달 오픈 */
	$scope.jego_detailModal = function(){
		var i = $scope.select_jegoindex;
		if($scope.select_jegoindex == -1 || $scope.jego_result[i].trfa == false){
			if(ERPiaAPI.toast == 'Y') $cordovaToast.show('상품을 선택해주세요.', 'short', 'center');
			else console.log('상품을 선택해주세요.');
		}else{
			$scope.jegosele_Modal.show();
		}
	}

	/* 선택 상품 상세정보 - 이경민 */
	$scope.pro_detail = function(){
		$rootScope.ActsLog("jego", "jego_proInfo"); 

		var i = $scope.select_jegoindex;
		var code = $rootScope.jego_result[i].G_Code;
		// var code = '9806038000057';
		jego_Service.proDetail($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, code)
		.then(function(data){
			if(data != '<!--Parameter Check-->'){
				$scope.goodslists = data.list;
				$scope.prodetail_open($scope.goodslists);
			}else{
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회결과가 없습니다.', 'short', 'center');
				else console.log('조회결과가 없습니다.');
			}
		});
	}

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

	/* 선택상품 alert 팝업창 */
	$scope.prodetail_open = function(goodslists){
		$scope.G_NameS =  goodslists[0].G_Name;
		$scope.G_OnCodeS = goodslists[0].G_OnCode;

		if(goodslists[0].G_Name.length>7) $scope.G_NameS = goodslists[0].G_Name.substring(0,8) + '<br>' + goodslists[0].G_Name.substring(8,goodslists[0].G_Name.length);
		if(goodslists[0].G_OnCode.length>11) $scope.G_OnCodeS = goodslists[0].G_OnCode.substring(0,10) + '<br>' + goodslists[0].G_OnCode.substring(10,goodslists[0].G_OnCode.length);
		var td = '<td width="40%" style="border-right:1px solid black; font-size: 0.8em;">';
		var td2 = '<td width="55%" style="padding-left:5px; font-size: 0.8em;">';
		 
		if($rootScope.priv_wongaYN == 'N')  var wonga_meaip = commaChange(goodslists[0].G_Dn1)
		else var wonga_meaip = '******'
		var alert_template = '<table width="100%">' +
						'<tr>' +
							td + '상품명</td>' +
							td2 + $scope.G_NameS + '</td>' +
						'</tr>' +
						'<tr>' +
							td + '규격</td>' +
							td2 + goodslists[0].G_Stand + '</td>' +
						'</tr>' +
						'<tr>' +
							td + '로케이션</td>' +
							td2 + goodslists[0].Location + '</td>' +
						'</tr>' +
						'<tr>' +
							td + '자체코드</td>' +
							td2 + $scope.G_OnCodeS + '</td>' +
						'</tr>' +
						'<tr>' +
							td + '제조사</td>' +
							td2 + goodslists[0].G_JeaJoChe + '</td>' +
						'</tr>' +
						'<tr>' +
							td + '브랜드</td>' +
							td2 + goodslists[0]. Brand_Name+ '</td>' +
						'</tr>' +
						'<tr>' +
							td + '매입가</td>' +
							td2 + wonga_meaip + '</td>' +
						'</tr>' +
						'<tr>' +
							td + '도매가</td>' +
							td2 + commaChange(goodslists[0].G_Dn2) + '</td>' +
						'</tr>' +
						'<tr>' +
							td + '인터넷가</td>' +
							td2 + commaChange(goodslists[0].G_Dn3) + '</td>' +
						'</tr>' +
						'<tr>' +
							td + '소매가</td>' +
							td2 + commaChange(goodslists[0].G_Dn4) + '</td>' +
						'</tr>' +
						'<tr>' +
							td + '권장소비자가</td>' +
							td2 + commaChange(goodslists[0].G_Dn5) + '</td>' +
						'</tr>' +
						'<tr>' +
							td + '입수량</td>' +
							td2 + goodslists[0].Box_In_Qty + '</td>' +
						'</tr>' +
						'<tr>' +
							td + '재고</td>' +
							td2 + goodslists[0].Jego + '</td>' +
						'</tr>' +
						'<tr>' +
							td + '출고대기</td>' +
							td2 + goodslists[0].ChulGoDeagi + '</td>' +
						'</tr>' +
						'</table>';
		$ionicPopup.alert({
			title: '<b>상품 정보</b>',
			subTitle: '',
			template: alert_template
		})
	}

	/* 선택상품 매입매출 등록 */
	$scope.meaipchul_Insert = function(gubun){
		var i = $scope.select_jegoindex;
		var code = $rootScope.jego_result[i].G_Code;
		$rootScope.Gubun = gubun;

		if(gubun == 1) $rootScope.ActsLog("jego", "jego_meaip"); 
		else $rootScope.ActsLog("jego", "jego_meachul"); 

		jego_Service.proDetail($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, code)
		.then(function(data){

			if(data != '<!--Parameter Check-->'){
				$rootScope.JegoGoods = data.list;
				$rootScope.iu = 'i';
				var ok = 'Y'; // 매입하다가 매출 또는 매출하다가 매입하려고 할때 

				/* 구분 1일때는 매입 ./ 구분 2일때는 매출이다! */
				if($rootScope.distinction == 'meaip'){
					if(gubun != 1){
						$rootScope.distinction = 'meachul';
						$ionicHistory.goBack();
						$timeout(function(){
							$ionicHistory.clearCache();
							$state.go('app.meachul_IU', {}, {location:'replace'});
						}, 500);

						$rootScope.tabitem.tab1 = 'tab-item';
						$rootScope.tabitem.tab2 = 'tab-item';
						$rootScope.tabitem.tab3 = 'tab-item active';
						$rootScope.tabitem.tab4 = 'tab-item';
						if(ERPiaAPI.toast == 'Y') $cordovaToast.show('상태가 매출등록으로 변경되었습니다.', 'short', 'center');
						else console.log('상태가 매출등록으로 변경되었습니다.');
					}else{
						$rootScope.distinction = 'meaip';
						$ionicHistory.goBack();
						$timeout(function(){
							$ionicHistory.clearCache();
							$state.go('app.meaip_IU', {}, {location:'replace'});
						}, 500);

						$rootScope.tabitem.tab1 = 'tab-item';
						$rootScope.tabitem.tab2 = 'tab-item active';
						$rootScope.tabitem.tab3 = 'tab-item';
						$rootScope.tabitem.tab4 = 'tab-item';
						if($rootScope.mode == '수정'){
							$rootScope.mode='등록';
							if(ERPiaAPI.toast == 'Y') $cordovaToast.show('상태가 매입등록으로 변경되었습니다.', 'short', 'center');
							else console.log('상태가 매입등록으로 변경되었습니다.');
						}
					}
				}else if($rootScope.distinction == 'meachul'){
					if(gubun != 2){
						$rootScope.distinction = 'meaip';
						$ionicHistory.goBack();
						$timeout(function(){
							$ionicHistory.clearCache();
							$state.go('app.meaip_IU', {}, {location:'replace'});
						}, 500);

						$rootScope.tabitem.tab1 = 'tab-item';
						$rootScope.tabitem.tab2 = 'tab-item active';
						$rootScope.tabitem.tab3 = 'tab-item';
						$rootScope.tabitem.tab4 = 'tab-item';
						if(ERPiaAPI.toast == 'Y') $cordovaToast.show('상태가 매입등록으로 변경되었습니다.', 'short', 'center');
						else console.log('상태가 매입등록으로 변경되었습니다.');
					}else{
						$rootScope.distinction = 'meachul';
						$ionicHistory.goBack();
						$timeout(function(){
							$ionicHistory.clearCache();
							$state.go('app.meachul_IU', {}, {location:'replace'});
						}, 500);
						$rootScope.tabitem.tab1 = 'tab-item';
						$rootScope.tabitem.tab2 = 'tab-item';
						$rootScope.tabitem.tab3 = 'tab-item active';
						$rootScope.tabitem.tab4 = 'tab-item';
						if($rootScope.mode == '수정'){
							$rootScope.mode='등록';
							if(ERPiaAPI.toast == 'Y') $cordovaToast.show('상태가 매출등록으로 변경되었습니다.', 'short', 'center');
							else console.log('상태가 매출등록으로 변경되었습니다.');
						}
					}
				}else{		// 매입매출 컨트롤러 안돌았을 경우
					if(gubun == 1){ 
						$rootScope.distinction = 'meaip';
						$ionicHistory.goBack();
						$timeout(function(){
							$ionicHistory.clearCache();
							$state.go('app.meaip_IU', {}, {location:'replace'});
						}, 500);
						
						$rootScope.tabitem.tab1 = 'tab-item';
						$rootScope.tabitem.tab2 = 'tab-item active';
						$rootScope.tabitem.tab3 = 'tab-item';
						$rootScope.tabitem.tab4 = 'tab-item';
					}else{
						$rootScope.distinction = 'meachul';
						$ionicHistory.goBack();
						$timeout(function(){
							$ionicHistory.clearCache();
							$state.go('app.meachul_IU', {}, {location:'replace'});
						}, 500);
						$rootScope.tabitem.tab1 = 'tab-item';
						$rootScope.tabitem.tab2 = 'tab-item';
						$rootScope.tabitem.tab3 = 'tab-item active';
						$rootScope.tabitem.tab4 = 'tab-item';
					}
				}
				if(ok == 'Y'){
					$timeout(function(){
						$rootScope.Jego_Pro();
					}, 1000);
				}	
			}else{
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회결과가 없습니다.', 'short', 'center');
				else console.log('조회결과가 없습니다.');
			}
		});
		$scope.jego_detail_List = [];
		$scope.jego_result[i].trfa = false;
		$scope.jegosele_Modal.hide();
	}

	/* 현조회조건 저장 기능 - 빠른검색 */
	$scope.search_Save = function(){
		if($rootScope.jegoMode == 'hap'){
			if(ERPiaAPI.toast == 'Y') $cordovaToast.show('통합검색은 빠른검색 조건이 등록되지 않습니다. (상세검색만 가능)', 'short', 'center');
			else console.log('통합검색은 빠른검색 조건이 <br>등록되지 않습니다. (상세검색만 가능)');
		}else{

			$scope.data = {};
			$rootScope.ActsLog("jego", "jego_quick_save");  // 행적로그 저장
			var myPopup = $ionicPopup.show({
				template: '<input type="text" ng-model="data.text">',
				title: '빠른검색명을 지정해주세요.',
				subTitle: '미입력시 조회조건만 저장됩니다.<br>("`", "<>", "작은따옴표"는 모바일에서 지원되지않습니다.)',
				scope: $scope,
				buttons: [
					{ text: '취소' },
					{
						text: '<b>저장</b>',
						type: 'button-positive',
						onTap: function(e) {
							if($scope.data.text == undefined) $scope.data.text = '';
							else $rootScope.ActsLog("jego", "jego_quick_saveYN"); 

							jego_Service.search_Save($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, $rootScope.changgo_keyword, $rootScope.jegoColum, 'Util_Reg_Select_OptSet_Rapid', $scope.data.text)
							.then(function(data){
								if(data != '<!--Parameter Check-->'){
									if(data.list[0].rslt == 'Y'){
										if(ERPiaAPI.toast == 'Y') $cordovaToast.show('빠른검색 조건이 등록되었습니다. 상세검색 화면에서 확인할 수 있습니다.', 'short', 'center');
										else console.log('빠른검색 조건이 등록되었습니다. <br>상세검색 화면에서 확인할 수 있습니다.');
									}else{
										if(ERPiaAPI.toast == 'Y') $cordovaToast.show('빠른검색 조건이 등록되지않았습니다. 잠시후 다시 시도해주세요.', 'short', 'center');
										else console.log('빠른검색 조건이 등록되지않았습니다. <br>잠시후 다시 시도해주세요.');
									}
								}else{
									if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회결과가 없습니다.', 'short', 'center');
									else console.log('조회결과가 없습니다.');
								}
							});
						}
					}
				]
			});
		}
	}

	/* 최근 & 빠른 슬라이드 */
	$scope.lqSlide = function(index){
		switch(index) {
			case 0: $scope.loadingani(); break;
			case 1: $scope.OptSet('L'); $rootScope.ActsLog("jego", "jego_lately"); $scope.loadingani(); break;
			case 2: $scope.OptSet('R'); $rootScope.ActsLog("jego", "jego_quick"); $scope.loadingani(); break;
		}
	}

	/* 최근 & 빠른 검색 조회 */
	$scope.OptSet = function(gubun){
		if(gubun == 'L'){
			jego_Service.Opset_search($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, 'L')
			.then(function(data){
				if(data != '<!--Parameter Check-->'){
					$scope.Opset_L = data.list;
					$scope.l_YN = 'Y';
					for(var i = 0; i < $scope.Opset_L.length; i++){
						if($scope.Opset_L[i].sel_ChangGoCode == 'ALL'){
							$scope.Opset_L[i].sel_ChangGoName = '전체창고';
						}else{
							var changgotext = [];
							changgotext = $scope.Opset_L[i].sel_ChangGoCode.split(',');
							var num = changgotext.length -1;
							for(var j = 0; j < $rootScope.Ch_List.length; j++){
								if($rootScope.Ch_List[j].Code == changgotext[0]){
									$scope.Opset_L[i].sel_ChangGoName = $rootScope.Ch_List[j].Name + ' 외 ' + parseInt(changgotext.length -1);
									break;
								}
							}
						}
					}
				}else{
					$scope.l_YN = 'N';
				}
			});
		}else{
			jego_Service.Opset_search($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, 'R')
			.then(function(data){
				if(data != '<!--Parameter Check-->'){
					$scope.Opset_R = data.list;
					for(var i = 0; i < data.list.length; i++){
						if($scope.Opset_R[i].sel_Name.length == 0 || $scope.Opset_R[i].sel_Name == undefined){
							$scope.Opset_R[i].nameYN = 'N';
						}else{
							$scope.Opset_R[i].nameYN = 'Y';
						}

						if($scope.Opset_R[i].sel_ChangGoCode.length == 0 || $scope.Opset_R[i].sel_ChangGoCode == undefined){
							$scope.Opset_R[i].sel_ChangGoName = '';
						}else{
							if($scope.Opset_R[i].sel_ChangGoCode == 'ALL'){
								$scope.Opset_R[i].sel_ChangGoName = '전체창고';
							}else{
								var changgotext = [];
								changgotext = $scope.Opset_R[i].sel_ChangGoCode.split(',');
								var num = changgotext.length -1;
								for(var j = 0; j < $rootScope.Ch_List.length; j++){
									if($rootScope.Ch_List[j].Code == changgotext[0]){
										$scope.Opset_R[i].sel_ChangGoName = $rootScope.Ch_List[j].Name + ' 외 ' + parseInt(changgotext.length -1);
										break;
									}
								}
							}
						}
					}
					$scope.r_YN = 'Y';
				}else{
					$scope.r_YN = 'N';
				}
			});
		}
	}

	/* 조회셋 선택 상세페이지로 이동 - 이경민 */
	$scope.insert_LR = function(index, gubun){
		$ionicSlideBoxDelegate.slide(0, 500);
		$scope.jegoSearch = 'detail';
		if(gubun == 'L'){
			var info = $scope.Opset_L[index];
		}else{
			var info = $scope.Opset_R[index];
		}
		$scope.jego_detail_colum.pro_name = info.sel_GoodsName;		// 상품명
		$scope.jego_detail_colum.pro_stand = info.sel_GoodsStand; 		// 규격
		$scope.jego_detail_colum.pro_OnCode = info.sel_GoodsOnCode;	// 자체코드
		$scope.jego_detail_colum.pro_barCode = info.sel_GoodsBarCode;	// 바코드

		$scope.jego_detail_colum.pro_ChangGo = []; // 초기화
		if(info.sel_ChangGoCode == 'ALL'){
			$scope.jego_detail_colum.pro_ChangGo.push(info.sel_ChangGoCode);
		}else{
			var changgo = info.sel_ChangGoCode.split(',');
			for(var i = 0; i < changgo.length; i++){
				$scope.jego_detail_colum.pro_ChangGo.push(changgo[i]);
			}
		}

		$scope.jego_detail_colum.detail_location = info.sel_GoodsWich;
		$scope.jego_detail_colum.detail_brand = info.sel_GoodsBrand;
		$scope.jego_detail_colum.detail_Jejo = info.sel_GoodsJeaJoChe;

		$scope.jego_detail_colum.attent_Kshim_code = '';
		$scope.jego_detail_colum.attent_Kshim_name = '';
		$scope.jego_detail_colum.attent_Mylist_code = '';
		$scope.jego_detail_colum.attent_Mylist_name = '';

		if(info.sel_GoodsMyListCode != 0 || info.sel_GoodsKshimListCode != 0){
			if(info.sel_GoodsMyListCode.length != 0){
				$scope.listname = "My LIST";
				var mode = 'Util_Select_MyList_M';

			}else if(info.sel_GoodsKshimListCode.length != 0){
				$scope.listname = "관심항목";
				var mode = 'Util_Select_KShim_M';
			}

			jego_Service.Attention_list($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, mode)
			.then(function(data){
				if(data != '<!--Parameter Check-->'){
					if(mode == 'Util_Select_MyList_M'){
						for(var m=0; m < data.list.length; m++){
							if(data.list[m].MyCode == info.sel_GoodsMyListCode){
								$scope.jego_detail_colum.attent_Mylist_code = data.list[m].MyCode;
								$scope.jego_detail_colum.attent_Mylist_name = data.list[m].Name;
								break;
							}
						}
					}else{
						for(var m=0; m < data.list.length; m++){
							if(data.list[m].K_Code == info.sel_GoodsKshimListCode){
								$scope.jego_detail_colum.attent_Kshim_code = data.list[m].K_Code;
								$scope.jego_detail_colum.attent_Kshim_name = data.list[m].K_Name;
								break;
							}
						}
					}
				}else{
					if(ERPiaAPI.toast == 'Y') $cordovaToast.show($scope.listname + '의 조회결과가 없습니다. ERPIA에서 ' + $scope.listname + '을 지정해주세요.', 'short', 'center');
					else console.log($scope.listname , '의 조회결과가 없습니다. ERPIA에서 ' ,$scope.listname, '을 지정해주세요.', 'short', 'center');
				}
			});
		}

		$scope.jego_detail_colum.MeachulMonth = info.sel_MeachulMonth;
		$scope.jego_detail_colum.MeachulListYN = info.sel_MeachulListYN;
		$scope.jego_detail_colum.MeachulListCtlYN = info.sel_MeachulListCtlYN;
		$scope.jego_detail_colum.JegoQtyCtl = info.sel_JegoQtyCtl;
		$scope.jego_detail_colum.JegoQtyCtlYN = info.sel_JegoQtyCtlYN;
	}

	/* 조회셋 빠른검색 삭제 - 이경민 */
	$scope.opSetDe = function(index){
		jego_Service.Opset_de($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, $scope.Opset_R[index].idx)
		.then(function(data){
			if(data != '<!--Parameter Check-->'){
				$scope.Opset_R.splice(index,1);
			}else{
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('잠시후 다시 시도해주세요.', 'short', 'center');
				else console.log('잠시후 다시 시도해주세요.');
			}
		});
	}
	/* 창고 컨트롤 - 이경민 */
	$scope.changgoCtl = function(){
		for(var i = 0 ; i < $scope.jego_detail_colum.pro_ChangGo.length ; i++){
			if($scope.jego_detail_colum.pro_ChangGo[i] == 'ALL'){
				$scope.jego_detail_colum.pro_ChangGo = [];
				$scope.jego_detail_colum.pro_ChangGo = ['ALL'];
				break;
			}
		}
	}

	if($rootScope.GCode != undefined && $rootScope.GCode.length > 0 ){
		if($rootScope.distinction == 'meaip' || $rootScope.distinction == 'meachul'){
			jego_Service.meaipchul_GoodsSearch($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, $rootScope.GCode)
			.then(function(data){
				if(data != '<!--Parameter Check-->'){
					$rootScope.jego_result = data.list;
				}else{
					if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회결과가 없습니다.', 'short', 'center');
					else console.log('조회결과가 없습니다.');
				}
			});

			$rootScope.jegoMode = 'hap';
			$scope.morebutton = false;
			$timeout(function(){
				$ionicLoading.hide();
			}, 500);
		}
	}

	$scope.deletejego_m = function(){
		$scope.jegosele_Modal.hide();
	}

	/* 권한이 없습니다. - [이경민 2016-09-22] */
	$scope.privNo = function(){
		if(ERPiaAPI.toast == 'Y') $cordovaToast.show('권한이 없습니다.', 'short', 'center');
		else console.log('권한이 없습니다.');
	}

	$scope.jego_back = function(){
		$rootScope.jego_result = []; // 초기화
		$scope.pageCnt = 1; 		 // 초기화
		$ionicHistory.goBack();
	}

	/* 키보드 엔터이슈 - 이경민[2016-11-28] */
	$scope.checkIfEnterKeyWasPressed = function($event){
		var keyCode = $event.which || $event.keyCode;
		if (keyCode === 13) {
			$ionicLoading.show({template:'<ion-spinner icon="spiral"></ion-spinner>'});
			$scope.jego_search();
			$rootScope.ActsLog("jego", "jego_search")
		}
	}
});