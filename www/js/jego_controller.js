// 재고현황 컨트롤러
angular.module('starter.controllers').controller('jegoCtrl', function($scope, $rootScope, $ionicPopup, $ionicHistory, $cordovaToast, $state, $location, $ionicPlatform, $ionicModal, ERPiaAPI, app) {
	console.log('jegoCtrl(재고현황 조회 컨트롤러)');
	$scope.jegoSearch = 'hap';

	$scope.upAnddown = 'ion-arrow-down-b';
	$scope.upAnddown2 = 'ion-arrow-up-b';
	$scope.upAnddown3 = 'ion-arrow-up-b';

	$scope.basictype=true;
	$scope.basic2type=false;
	$scope.basic3type=false;

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

	$scope.jego_search = function(){
		console.log('재고조회 할꺼야.');
		$state.go("app.jego_search");
	}

	$scope.jego_back = function(){
		console.log('back');
		$ionicHistory.goBack();
	}

// })
// /* 매입&매출 전표조회 컨트롤러 - 이경민[2015-12]*/
// .controller('MLookupCtrl', function($scope, $rootScope, $ionicLoading, $ionicModal, $ionicHistory, $timeout, $state, $ionicScrollDelegate, $ionicPopup, $cordovaToast, $ionicSlideBoxDelegate, ERPiaAPI, MLookupService, MiuService, MconfigService, app) {

});