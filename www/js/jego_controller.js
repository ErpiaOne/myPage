// 재고현황 컨트롤러
angular.module('starter.controllers').controller('jegoCtrl', function($scope, $rootScope, $ionicPopup, $ionicHistory, $timeout, $cordovaToast, jego_Service, $state, $location, $cordovaBarcodeScanner, $ionicPlatform, $ionicModal, ERPiaAPI, app, $ionicScrollDelegate, $ionicSlideBoxDelegate, $ionicSideMenuDelegate) {
	console.log('jegoCtrl(재고현황 조회 컨트롤러)');

	// $rootScope.keyheight = window.innerHeight; // 키보드 높이 ..... 

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
	$scope.jego_searchModule = { all_Search : 'z' };

	$scope.select_jegoindex = -1;	// 상세보기는 하나씩만 할수있도록...
	$scope.pageCnt = 1;			// 조회결과 페이징 
	$scope.select_CList = '';		// 선택된창고 - multiple
	$scope.morebutton = true;		// 더보기 버튼 활성화 유무

	/* 상세조회 리스트 */
	$scope.jego_detail_colum = {
		pro_name 			: '',		// 상품명
		pro_stand 			: '', 		// 규격
		pro_OnCode 		: '',		// 자체코드
		pro_barCode 		: '',		// 바코드
		pro_ChangGo 		: '',		// 창고

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

	/*개월수*/
	$scope.month = [
		{ id : 1 },
		{ id : 2 },
		{ id : 3 },
		{ id : 4 },
		{ id : 5 },
		{ id : 6 },
		{ id : 7 },
		{ id : 8 },
		{ id : 9 },
		{ id : 10 },
		{ id : 11 },
		{ id : 12 }
	]
		
	/* 재고조회시 창고 리스트 조회 [이경민 - 2016-09-19] */
	$scope.jego_Changgh = function() {
		$timeout(function(){
			jego_Service.jego_changgoSearch($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId)
			.then(function(data){
				$rootScope.Ch_List = data.list;
			});

			$scope.loadingani();
		}, 1000);
	}

	/* 통합/상세 검색 모드변경 [이경민 - 2016-08-29] */
	$scope.jegoSear_change = function(){
		if($scope.jegoSearch == 'hap'){
			$scope.jego_Changgh();
			$scope.jegoSearch = 'detail';
		}else if($scope.jegoSearch == 'detail'){
			$scope.jegoSearch = 'hap';
		}
	}

	/* 통합검색 바코드 검색 [이경민 - 2016-08-29] */
	$scope.jego_barc = function(){
		$cordovaBarcodeScanner.scan().then(function(imageData) {
			if ($ionicHistory.backView()&&imageData.text=='') {
				if(ERPiaAPI.toast == 'Y') $cordovaToast.show('바코드를 정확히 찍어주세요.', 'short', 'center');
				else console.log('바코드를 정확히 찍어주세요.');
			}else{
				$scope.pageCnt = 1;
				console.log('pageCnt=>', $scope.pageCnt)
				$rootScope.keyword = imageData.text;
				$timeout(function(){
					$scope.loadingani();
					jego_Service.main_search($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, '', imageData.text, 'Y', '', $scope.pageCnt)
					.then(function(data){
						if(data != '<!--Parameter Check-->'){
							$rootScope.jego_result = data.list;
							$scope.jego_Changgh();
							$state.go("app.jego_search");
						}else{
							if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회결과가 없습니다.', 'short', 'center');
							else console.log('조회결과가 없습니다.');
						}
					});
				$scope.loadingani();
			}, 1000);
			}
		}, function(error) {
		console.log("An error happened -> " + error);
		});
	}

	/* 재고 상세관리 화면 창 컨트롤 [이경민 - 2016-08-29] */
	$scope.jego_Next = function(num){
		if(num == 1){ // 상품선택
			if($scope.basictype == true){
				$scope.basictype = false;
				$scope.upAnddown = 'ion-arrow-up-b';
			}else{
				$scope.basictype = true;
				$scope.upAnddown = 'ion-arrow-down-b';
			}
		}else if(num == 2){ // 상세선택
			if($scope.basic2type == true){
				$scope.basic2type = false;
				$scope.upAnddown2 = 'ion-arrow-up-b';
			}else{
				$scope.basic2type = true;
				$scope.upAnddown2 = 'ion-arrow-down-b';
			}
		}else{ // 관심항목
			if($scope.basic3type == true){
				$scope.basic3type = false;
				$scope.upAnddown3 = 'ion-arrow-up-b';
			}else{
				$scope.basic3type = true;
				$scope.upAnddown3 = 'ion-arrow-down-b';
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
			console.log('data', data);
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
			$scope.jego_detail_colum.attent_Kshim_name = $scope.AttentionList[index].K_Name;
			$scope.jego_detail_colum.attent_Kshim_code = $scope.AttentionList[index].K_Code;
			$scope.jego_detail_colum.attent_Mylist_name = '';
			$scope.jego_detail_colum.attent_Mylist_code = '';
		}else{
			$scope.jego_detail_colum.attent_Mylist_name = $scope.AttentionList[index].Name;
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
		console.log('??????');
		if(val == 1){ // 매출월 조회옵션 사용유무
			if($scope.jego_detail_colum.MeachulMonth == '0'){
				$scope.jego_detail_colum.MeachulListCtlYN = 'N';
			}else{
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

	/* 재고조회 - 이경민[2016-08] */
	$scope.jego_search = function(){

		if($scope.jegoSearch == 'hap'){ 	// 통합검색 
			console.log('통합검색');
			$rootScope.keyword = $scope.jego_searchModule.all_Search;
			$timeout(function(){
				if($scope.jego_searchModule.all_Search.length == 0){
					if(ERPiaAPI.toast == 'Y') $cordovaToast.show('검색어를 입력해주세요.', 'short', 'center');
					else console.log('검색어를 입력해주세요.');
				}else{
					$scope.pageCnt = 1;
					$rootScope.keyword = $scope.jego_searchModule.all_Search;
					jego_Service.main_search($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, '', $scope.jego_searchModule.all_Search, 'N', '', $scope.pageCnt)
					.then(function(data){
						if(data != '<!--Parameter Check-->'){
							$rootScope.jego_result = data.list;
							$scope.jego_Changgh();
							$state.go("app.jego_search");
						}else{
							if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회결과가 없습니다.', 'short', 'center');
							else console.log('조회결과가 없습니다.');
						}
					});
				}
				$scope.loadingani();
			}, 1000);
		}else{ 	// 상세검색
			console.log('상세검색입니다 =>', $scope.jego_detail_colum);
			console.log("뭐야 =>", $scope.jego_detail_colum.pro_ChangGo.length);
			console.log("1111111111=>", $scope.jego_detail_colum.pro_ChangGo(0));

			if($scope.jego_detail_colum.pro_ChangGo.pro_ChangGo[0] == 'ALL'){
				var mode = "Select_Detail_All";
				var changgo_keyword = "ALL"
			}else{
				var mode = "Select_Detail_ChangGobyul";
				var changgo_keyword = "";
				for(var i = 0; i < $scope.jego_detail_colum.pro_ChangGo.length; i++){
					changgo_keyword = changgo_keyword + $scope.jego_detail_colum.pro_ChangGo[i];
				}
			}
			console.log('모드도 잘나와야함!=>',  mode);
			console.log('창고가 잘나와야함!=>', changgo_keyword);

			jego_Service.detail_search($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, mode, jego_detail_colum)
			.then(function(data){
				if(data != '<!--Parameter Check-->'){
					console.log("data=>", data);
				}else{
					if(ERPiaAPI.toast == 'Y') $cordovaToast.show('조회결과가 없습니다.', 'short', 'center');
					else console.log('조회결과가 없습니다.');
				}
			});
		}	
	}

	$scope.check = function(){
		console.log('멀티플 확인 =>', $scope.jego_detail_colum);
	}

	/* 재고조회 - 더보기 - 이경민[2016-09-20] */
	$scope.jego_more = function(){
		$timeout(function(){
			$scope.pageCnt = $scope.pageCnt + 1;
			jego_Service.main_search($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, '', $rootScope.keyword, 'N', '', $scope.pageCnt)
			.then(function(data){
				if(data != '<!--Parameter Check-->'){
					for(var m = 0; m < data.list.length; m++){
						$rootScope.jego_result.push(data.list[m]);
					}
				}else{
					$scope.morebutton = false;
					if(ERPiaAPI.toast == 'Y') $cordovaToast.show('더이상 조회결과가 존재하지 않습니다.', 'short', 'center');
					else console.log('더이상 조회결과가 존재하지 않습니다.');
				}
			});
		$scope.loadingani();
		}, 1000);
	}

	/* 재고 상세조회 - 이경민[2016-09-01] */
	$scope.jego_detail = function(index){
		$timeout(function(){
			jego_Service.detail_search($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, 'ALL', $rootScope.jego_result[index].G_Code)
			.then(function(data){
				$scope.jego_detail_List = data.list;
			});

			if( $rootScope.jego_result[index].trfa == false ){
				$rootScope.jego_result[index].trfa = true;
				for(var i = 0; i < $rootScope.jego_result.length; i++){
					if( i != index && $rootScope.jego_result[index].trfa == true ){
						$rootScope.jego_result[i].trfa = false;
					}
				}
				$scope.select_jegoindex = index;
			}else {
				$rootScope.jego_result[index].trfa = false;
			}

			$scope.loadingani();
		}, 1000);
	}

	$scope.deletejego_m = function(){
		$scope.jegosele_Modal.hide();
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

// })
// /* 매입&매출 전표조회 컨트롤러 - 이경민[2015-12]*/
// .controller('MLookupCtrl', function($scope, $rootScope, $ionicLoading, $ionicModal, $ionicHistory, $timeout, $state, $ionicScrollDelegate, $ionicPopup, $cordovaToast, $ionicSlideBoxDelegate, ERPiaAPI, MLookupService, MiuService, MconfigService, app) {

});