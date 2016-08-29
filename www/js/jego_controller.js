// 재고현황 컨트롤러
angular.module('starter.controllers')

.controller('jegoCtrl', function($scope, $rootScope, $ionicPopup, $ionicHistory, $cordovaToast, $state, $location, $ionicPlatform, ERPiaAPI,  app) {
	
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

	$scope.ion-page.modal {
	    padding: 30px;
	    background: rgba(0,0,0,0.5);
	}

	/* 거래명세표 조회시 뜨는 모달창 - 이경민[2016-01] */
	// $ionicModal.fromTemplateUrl('side/check_Sano.html',{
	// 	scope : $scope;
	// 	padding: 30px;
	// 	background: rgba(0,0,0,0.5);
	// }).then(function(modal){
	// 	$scope.check_sano_Modal = modal;
	// });

	$scope.mylist = function(){

	}


// })
// /* 매입&매출 전표조회 컨트롤러 - 이경민[2015-12]*/
// .controller('MLookupCtrl', function($scope, $rootScope, $ionicLoading, $ionicModal, $ionicHistory, $timeout, $state, $ionicScrollDelegate, $ionicPopup, $cordovaToast, $ionicSlideBoxDelegate, ERPiaAPI, MLookupService, MiuService, MconfigService, app) {

});