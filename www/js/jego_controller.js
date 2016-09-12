// 재고현황 컨트롤러
angular.module('starter.controllers').controller('jegoCtrl', function($scope, $rootScope, $ionicPopup, $ionicHistory, $cordovaToast, jego_Service, $state, $location, $ionicPlatform, $ionicModal, ERPiaAPI, app) {
	console.log('jegoCtrl(재고현황 조회 컨트롤러)');

	// $rootScope.keyheight = window.innerHeight; // 키보드 높이 ..... 

	$scope.jegoSearch = 'hap';

	$scope.upAnddown = 'ion-arrow-down-b';
	$scope.upAnddown2 = 'ion-arrow-up-b';
	$scope.upAnddown3 = 'ion-arrow-up-b';

	$scope.basictype=true;
	$scope.basic2type=false;
	$scope.basic3type=false;

	$scope.test = [
		{ id : '1111', name : 'test', content : 'test1111111111111111111', trfa: false },
		{ id : '2222', name : 'test', content : 'test2222222222222222222', trfa: false },
		{ id : '3333', name : 'test', content : 'test3333333333333333333', trfa: false },
		{ id : '4444', name : 'test', content : 'test4444444444444444444', trfa: false },
		{ id : '5555', name : 'test', content : 'test5555555555555555555', trfa: false }
	]

	// 통합검색어 
	$scope.jego_searchModule = {
		all_Search : ''
	}

	$scope.select_jegoindex = -1;

	/* 통합/상세 검색 모드변경 [이경민 - 2016-08-29] */
	$scope.jegoSear_change = function(){
		if($scope.jegoSearch == 'hap'){
			$scope.jegoSearch = 'detail';
		}else if($scope.jegoSearch == 'detail'){
			$scope.jegoSearch = 'hap';
		}
	}

	/* 통합검색 바코드 검색 [이경민 - 2016-08-29] */
	$scope.jego_barc = function(){
		console.log('통합검색 바코드 검색 ');
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
		scope : $scope
	}).then(function(modal){
		$scope.mylist_Modal = modal;
	});

	/* 상품정보관련 세부버튼 클릭시 뜨는 모달창(크기 작음) - 이경민[2016-09-01] */
	$ionicModal.fromTemplateUrl('jego_manage/jegosele_modal.html',{
		scope : $scope
	}).then(function(modal){
		$scope.jegosele_Modal = modal;
	});

	$scope.mylist = function(num){
		if(num == 2){
			$scope.listname = "My LIST";
		}else{
			$scope.listname = "관심항목";
		}
		$scope.mylist_Modal.show();
	}

	$scope.mylist_cloes = function(){
		$scope.mylist_Modal.hide();
	}

	/* 재고조회 - 이경민[2016-08] */
	$scope.jego_search = function(){
		console.log('재고조회 할꺼야.', $scope.jego_searchModule);
		if($scope.jego_searchModule.all_Search.length == 0){
			if(ERPiaAPI.toast == 'Y') $cordovaToast.show('검색어를 입력해주세요.', 'short', 'center');
			else alert('검색어를 입력해주세요.');
		}else{
			jego_Service.main_search($rootScope.loginData.Admin_Code, $rootScope.loginData.UserId, '', $scope.jego_searchModule.all_Search, 'N', '')
			.then(function(data){
				$state.go("app.jego_search");
			});
		}
	}

	/* 재고 상세조회 - 이경민[2016-09-01] */
	$scope.jego_detail = function(index){
		console.log('재고 상세조회', $scope.test.length);

		if( $scope.test[index].trfa == false ){
			$scope.test[index].trfa = true;
			for(var i = 0; i < $scope.test.length; i++){
				if( i != index && $scope.test[index].trfa == true ){
					$scope.test[i].trfa = false;
				}
			}
			$scope.select_jegoindex = index;
		}else {
			$scope.test[index].trfa = false;
		}
	}

	$scope.deletejego_m = function(){
		$scope.jegosele_Modal.hide();
	}

	$scope.jego_detailModal = function(){
		if($scope.select_jegoindex == -1){
			if(ERPiaAPI.toast == 'Y') $cordovaToast.show('상품을 선택해주세요.', 'short', 'center');
			else alert('상품을 선택해주세요.');
		}else{
			$scope.jegosele_Modal.show();
		}
		
	}

	$scope.jego_back = function(){
		console.log('back');
		$ionicHistory.goBack();
	}

// })
// /* 매입&매출 전표조회 컨트롤러 - 이경민[2015-12]*/
// .controller('MLookupCtrl', function($scope, $rootScope, $ionicLoading, $ionicModal, $ionicHistory, $timeout, $state, $ionicScrollDelegate, $ionicPopup, $cordovaToast, $ionicSlideBoxDelegate, ERPiaAPI, MLookupService, MiuService, MconfigService, app) {

});