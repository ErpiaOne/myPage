<!-- #include file = "setColGroup_Balju.asp" -->
<script type="text/javascript">
//컬럼에디터 숨김/표시
var stts = $('#stts').val();
var colType = new Object();
if (stts=="1") colType.Type = {"T_name":"select", "M_no":"text","T_Cost":"text","cnfrm_Qty":"text"};
else if (stts=="b") colType.Type = {"T_name":"readonly", "M_no":"readonly","T_Cost":"text","cnfrm_Qty":"readonly"};
else colType.Type = {"T_name":"readonly", "M_no":"readonly","T_Cost":"readonly"};
//브라우저 사이즈
var hBrowser = $(window).height() - 490;   // returns height of browser viewport
if (hBrowser < 300) hBrowser = 300;
var hDocument = $(document).height(); // returns height of HTML document
var wBrowser = $(window).width();   // returns width of browser viewport
var wDocumet =$(document).width(); // returns width of HTML document

var params, url, obj, selectedTxt, tagValue;
url = "https://www.erpia.net/include/JSon_Proc_Multi_LHK.asp";
params = {"kind": "TagCom", "Admin_Code":Admin_Code};
	$.post(
		url
		, params
		, function(data, textStatus){
			if (textStatus == "success")
			{
				// 읽어온 Json 파일을 object로 변환
				setTimeout(function(){
					obj = JSON.parse(data);
					var strHtml;
					for (var i=0; i<obj.list.length; i++)
					{
						strHtml += "<tr><td>" + obj.list[i].optionText + "</td><td>" + obj.list[i].value + "</td></tr>"
					}
					$('#tbodyTagInfo').html(strHtml.replace(/undefined/gi,""));
				}, 1000);
				console.log("타임아웃벗어났음");

			} else {
				alert("오류가 있습니다.");
			}
		}
	)
var myGrid = new AXGrid(); // instance
var fnObj = {
    pageStart: function(){
		
        myGrid.setConfig({
            targetID : "AXGridTarget",
            theme : "AXGrid",
			fitToWidth:true,
			//sort:false,
			passiveMode : false,
			passiveRemoveHide:true,
            autoChangeGridView: { // autoChangeGridView by browser width
                mobile:[0,600], grid:[350]
            },
			height:hBrowser,
			//컬럼정의
            colGroup : colGroup,
			colHeadAlign: "center",
			body : {
				addClass: function(){
					if(this.item._CUD == "C"){
						return "blue";
					}else if(this.item._CUD == "D"){
						return "red";
					}else if(this.item._CUD == "U"){
						return "green";
					}else{
						return "";
					}
				},
				onclick: function(){
					if(this.c == "0"){
						myGrid.checkedColSeq(0, null, this.index); // 바디를 클릭했을때 0번째 체크박스 토글체크처리
					}
				},
                ondblclick: function(){
                    //toast.push(Object.toJSON({index:this.index, item:this.item}));				//해당글클릭시 정보내용보여주기(별로필요없음)
					myGrid.setEditor(this.item, this.index);
                }
            },
			//페이징구현
			page:{
				paging : true
				, pageNo : 1
				, pageSize : pageSize
				, status : {formatter : null}
			},
			editor : {
				rows : [
						[
							{colSeq:eNum.col.chkIdx, align:"center", valign:"middle"},
							{colSeq:eNum.col.JsStts, align:"center", valign:"middle"},
							{colSeq:eNum.col.status, align:"center", valign:"middle"},
							{colSeq:eNum.col.idx, align:"center", valign:"middle"},
							{colSeq:eNum.col.stts, align:"center", valign:"middle"},
							{colSeq:eNum.col.Gumea_No, align:"center", valign:"middle"},
							{colSeq:eNum.col.seq, align:"center", valign:"middle"},
							{colSeq:eNum.col.Gumea_Date, align:"center", valign:"middle"},
							{colSeq:eNum.col.printYN, align:"center", valign:"middle"},
							{colSeq:eNum.col.update_Balju, align:"center", valign:"middle"},
							{colSeq:eNum.col.chulgoSchDate, align:"center", valign:"middle"},
							{colSeq:eNum.col.goodsCode, align:"left", valign:"middle"},
							{colSeq:eNum.col.goodsName, align:"left", valign:"middle"},
							{colSeq:eNum.col.goodsStand, align:"left", valign:"middle"},
							{colSeq:eNum.col.Qty, align:"right", valign:"middle"},
							{colSeq:eNum.col.cnfrm_Qty, align:"right", valign:"middle", form:{type:colType.Type.cnfrm_Qty, value:"itemValue"}, AXBind:{type:"number"}},
							{colSeq:eNum.col.iG_Qty, align:"right", valign:"middle"},
							{colSeq:eNum.col.price, align:"right", valign:"middle"},
							{colSeq:eNum.col.totAmt, align:"right", valign:"middle"},
							{colSeq:eNum.col.totExpAmt, align:"right", valign:"middle"},
							{
								colSeq : eNum.col.T_name, 
								align : "left", 
								valign : "top",
								form : {
									type : colType.Type.T_name,
									value : "itemText",
									isspace : true,
									isspaceTitle : "전체",
									options : obj.list
									, onChange: function(){
										trace(this);
										for (var row=0; row<obj.list.length; row++)
										{
											if (obj.list[row].optionText == this.text)
											{
												selectedTxt = this.text; 
												tagValue = this.value;
												break;
											}
										}
									}
								}
								
							},
							{colSeq:eNum.col.T_Code, align:"left", valign:"middle"},
							{colSeq:eNum.col.M_no, align:"left", valign:"middle", form:{type:colType.Type.M_no, value:"itemValue"}},
							{colSeq:eNum.col.T_Cost, align:"right", valign:"middle", form:{type:colType.Type.T_Cost, value:"itemValue"}, AXBind:{type:"number"}},
							{colSeq:eNum.col.AdminRemk, align:"left", valign:"middle"},
							{colSeq:eNum.col.ChangGo_In_Name, align:"left", valign:"middle"},
							{colSeq:eNum.col.replyAdmin, align:"center", valign:"middle", form:{type:"text", value:"itemValue"}},
							{colSeq:eNum.col.ptnGCode, align:"left", valign:"middle", form:{type:"text", value:"itemValue"}},
							{colSeq:eNum.col.ptnGoodsName, align:"left", valign:"middle", form:{type:"text", value:"itemValue"}},
							{colSeq:eNum.col.reqChgPrice, align:"center", valign:"middle", form:{type:"text", value:"itemValue"}, AXBind:{type:"number"}}
						]
					],
                    response: function(){ // ajax 응답에 대해 예외 처리 필요시 response 구현
                        if(this.index == null){ // 추가
                            var pushItem = this.res.item;
                            if(this.res.item.title == ""){
                                alert("제목이 비어 추가 할 수 없습니다.");
                                return;
                            }
                            myGrid.pushList(pushItem, this.insertIndex);
                        }else{ // 수정
							for (var row=0; row<obj.list.length; row++)
							{
								if (obj.list[row].optionText == selectedTxt)
								{
									myGrid.updateItem(0, eNum.col.T_Code, myGrid.selectedRow.first(), tagValue);
									break;
								}
							}
							myGrid.checkedColSeq(0, true, this.index);
                            AXUtil.overwriteObject(this.list[this.index], this.res.item, true); // this.list[this.index] object 에 this.res.item 값 덮어쓰기
                            myGrid.updateList(this.index, this.list[this.index]);
							//trace(this.list[this.index].Gumea_No);
							
							var strParam = "<root>";
							strParam += "<row><Gumea_No>"+ this.list[this.index].Gumea_No + "</Gumea_No>";
							strParam += "<seq>"+ this.list[this.index].seq + "</seq>";
							strParam += "<goodsCode>"+ this.list[this.index].goodsCode + "</goodsCode>";
							strParam += "<ptnGCode>" + this.list[this.index].ptnGCode + "</ptnGCode>";
							strParam += "<ptnGoodsName>" + escape(this.list[this.index].ptnGoodsName) + "</ptnGoodsName>";
							strParam += "<T_Cost>" + escape(this.list[this.index].T_Cost) + "</T_Cost>";
							strParam += "<replyAdmin>" + escape(this.list[this.index].replyAdmin) + "</replyAdmin>";
							strParam += "<reqChgPrice>" + escape(this.list[this.index].reqChgPrice) + "</reqChgPrice>";
							strParam += "<cnfrm_Qty>" + this.list[this.index].cnfrm_Qty + "</cnfrm_Qty></row>";
							strParam += "</root>";
							fnObj.getCheckedList('saveGerGoods_' + strParam);
                        }
                    }
				},
			});
		myGrid.setList({
			ajaxUrl:"../include/JSon_Proc_Multi_LHK.asp",
			ajaxPars:"Admin_Code=" + Admin_Code + "&Kind=SCMSelect_Web&Value_Kind=&baljuMode=" + baljuMode + "&stts=" + stts + "&FDate=" + FDate + "&TDate=" + TDate + "&GerCode=" + GerCode + "&SearchMode=" + searchMode + "&SearchKey=" + escape(searchKey) + "&SearchDtType=" + SearchDtType,
			onLoad:function(){
			},
			onError:function(){ 
				//location.reload();
			}
		});
	},
	removeList : function(){
		var checkedList = myGrid.getCheckedList(0);
		if (checkedList.length == 0)
		{
			alert("선택된 목록이 없습니다. 삭제하시려는 목록을 체크하세요");
			return;
		}
		if (!confirm("정말 삭제 하시겠습니까?")) return;

		//데이터서버쪽 삭제처리 소스넣을것

		//삭제처리후 성공되었으면 처리
		var removeList = [];
		$.each(checkedList, function(){					//특정값확인
			//trace(this.key_id);						//콘솔창값확인할때
			removeList.push({key_id : this.key_id});
		});
		myGrid.removeList(removeList);
	},
	getExcel: function(type){
		var obj = myGrid.getExcelFormat(type);
		//trace(obj);
		$("#printout").html(Object.toJSON(obj));
	},
	getSelectedExcel: function(type){
		var obj = myGrid.getExcelFormat(type);
		//trace(obj);
		//var checkedList = myGrid.getCheckedList(0);
		if (checkedList.length > 0)
		{
			//trace(Object.toJSON(checkedList));		
			$("#printout").html(Object.toJSON(obj));
			//dialog.push({body:'<b>확인</b>\n 선택한 주문건을 엑셀로 다운 받습니다.', buttons:[{buttonValue:'확인', buttonClass:'Blue W40', onClick:fnObjDialog.btnClose}]});
			
		}else dialog.push({body:'<b>주의</b>\n 엑셀 다운로드 할 주문건을 체크해주세요.', type:'Caution', buttons:[{buttonValue:'확인', buttonClass:'Red W40', onClick:fnObjDialog.btnClose}]});
	},
	getCheckedList : function(type){
		var checkedList = myGrid.getCheckedList(0);
		//trace(checkedList);
		var cntCheck = checkedList.length;
		var strParam = "<root>";
		// 발주처리
		if (type=="GumeaNo")
		{
			for (var i=0; i<cntCheck; i++)
			{
				strParam += "<row><Gumea_No>" + Object.toJSON(checkedList[i].Gumea_No) + "</Gumea_No><Seq>" + Object.toJSON(checkedList[i].seq) + "</Seq></row>";
			}
			strParam += "</root>";
			strParam = strParam.replace(/undefined/gi,"").replace(/\"/gi, "");
			$('#txtStore').val(strParam);
		// 출고예정일 입력
		}else if (type=="chulgoSchedule")
		{
			strGoodsName = ""
			for (var i=0; i<cntCheck; i++)
			{
				strParam += "<row><Gumea_No>" + Object.toJSON(checkedList[i].Gumea_No) + "</Gumea_No><seq>" + Object.toJSON(checkedList[i].seq) + "</seq></row>";
				strGoodsName += Object.toJSON(checkedList[i].goodsName) + "<br/>";
			}
			strParam += "</root>";
			strParam = strParam.replace(/undefined/gi,"").replace(/\"/gi, "");
			strGoodsName = strGoodsName.replace(/undefined/gi,"").replace(/\"/gi, "");
			$('#txtStore').val(strParam + "^" + strGoodsName);
		// 취소요청
		}else if (type=="cancel")
		{
			var strGoods = "";
			for (var i=0; i<cntCheck; i++)
			{
				strParam += "<row><Gumea_No>" + Object.toJSON(checkedList[i].Gumea_No) + "</Gumea_No><Seq>" + Object.toJSON(checkedList[i].seq) + "</Seq></row>";
				strGoods += Object.toJSON(checkedList[i].goodsName) + "<br/>";
			}
			strParam += "</root>";
			strParam = strParam.replace(/undefined/gi,"").replace(/\"/gi, "");
			strGoods = strGoods.replace(/undefined/gi,"").replace(/\"/gi, "");
			$('#txtStore').val(strParam + "^" + strGoods);
		// 출고처리
		}else if (type=="chulgoBalju")
		{
			var xml = "<root>";
			for (var i=0; i<cntCheck; i++)
			{
				if (Object.toJSON(checkedList[i].M_no) != "undefined" && Object.toJSON(checkedList[i].T_Code) != "undefined")
				{
					xml += "<row><Gumea_No>" + Object.toJSON(checkedList[i].Gumea_No) + "</Gumea_No><Seq>" + Object.toJSON(checkedList[i].seq) + "</Seq><M_No>" + Object.toJSON(checkedList[i].M_no) + "</M_No><TagCode>" + Object.toJSON(checkedList[i].T_Code) + "</TagCode></row>";
				}
			}
			xml += "</root>";
			if (xml == "<root></root>")
			{
				dialog.push({body:'<b>주의</b>\n 출고처리할 전표를 체크해 주세요', type:'Caution', buttons:[{buttonValue:'확인', buttonClass:'Red W40'}]});
				return false;
			}
			xml = xml.replace(/"/gi, '');
			if (xml.indexOf("<M_No></M_No>") > 0 || xml.indexOf("<TagCode></TagCode>") > 0)
			{
				dialog.push({body:'<b>배송정보 입력</b>\n 배송정보가 입력되지 않았습니다. \n 이대로 출고처리 하시겠습니까?'
							, buttons:[{buttonValue:'확인', buttonClass:'Blue W40', onClick:fnObjDialog.btnOnConfirm, data:"chulgoBalju_" + xml}, {buttonValue:'취소', buttonClass:'Red W40'}]});
			}else{
				dialog.push({body:'<b>확인</b>\n 출고처리 하시겠습니까?'
							, buttons:[{buttonValue:'확인', buttonClass:'Blue W40', onClick:fnObjDialog.btnOnConfirm, data:"chulgoBalju_" + xml}, {buttonValue:'취소', buttonClass:'Red W40'}]});
			}
		// 발송정보 일괄등록
		}else if (type=="updateAll")
		{
			var innerHtml = "";
			for (var i=0; i<cntCheck; i++)
			{
				innerHtml += "<tr>";
				innerHtml += "<td><input type='checkbox' name='chkUpdateAll' id='chk_" + (i+1) + "'/></td>";
				innerHtml += "<td name='GumeaNo_" + (i+1) + "'>" + Object.toJSON(checkedList[i].Gumea_No).replace(/\"/gi,"") + "</td>";
				innerHtml += "<td name='seq_" + (i+1) + "'>" + Object.toJSON(checkedList[i].seq) + "</td>";
				if(Object.toJSON(checkedList[i].ptnGoodsName).replace(/\"/gi,"") == "") 
					innerHtml += "<td>" + Object.toJSON(checkedList[i].goodsName).replace(/\"/gi,"") + "</td>";
				else 
					innerHtml += "<td>" + Object.toJSON(checkedList[i].ptnGoodsName).replace(/\"/gi,"") + "</td>";
				innerHtml += "<td>" + Object.toJSON(checkedList[i].goodsStand).replace(/\"/gi,"") + "</td>";
				innerHtml += "<td name='tagName_" + (i+1) + "'></td>";
				innerHtml += "<td style='display:none;' name='tagCode_" + (i+1) + "'></td>";
				innerHtml += "<td name='M_No_" + (i+1) + "'></td>";
				innerHtml += "</tr>";
			}
			$('#txtStore').val(innerHtml + "^" + cntCheck + "^Balju");
			//trace(gumea_No);
		// 매입확정요청
		}else if (type == "reqBuy")
		{
			var strXml = "<root>";
			for (var i=0; i<cntCheck; i++ )
			{
				strXml += "<row><Gumea_No>" + Object.toJSON(checkedList[i].Gumea_No) + "</Gumea_No><Seq>" + Object.toJSON(checkedList[i].seq) + "</Seq></row>";
			}
			strXml += "</root>";
			strXml = strXml.replace(/\"/gi, "");
			$('#txtStore').val(strXml);
		// 수령자별 일괄배송비 입력
		}else if (type == "inputDeliveryCost"){
			for(var i=0; i< cntCheck; i++){
				strParam += "<row><Gumea_No>"+ Object.toJSON(checkedList[i].Gumea_No) + "</Gumea_No>";
				strParam += "<Seq>"+ Object.toJSON(checkedList[i].seq) + "</Seq>";
				strParam += "<T_Code>"+ Object.toJSON(checkedList[i].T_Code) + "</T_Code>";
				strParam += "<Qty>"+ Object.toJSON(checkedList[i].Qty) + "</Qty>";
				strParam += "<Price>" + Object.toJSON(checkedList[i].price) + "</Price></row>";
			}
			strParam += "</root>";
			strParam = strParam.replace(/\"/gi,"").replace(/,/gi,"");
			
			if (strParam == "<root></root>")
			{
				toast.push({body:'<b>주의</b>\n 배송비를 적용할 전표를 체크해주세요.', type:'Warning'});
				return false;
			}else{
				params = {"Kind":"inputDeliveryCost","Value_Kind":"list","Admin_Code":Admin_Code,"GerCode":GerCode,"xml":strParam};
				$.ajax({
					type:'POST',
					url : url, 
					data : params,
					contentType: "application/x-www-form-urlencoded; charset=euc-kr", 
					timeout: 10000, 
					datatype: 'json', 
					success: function (result) {
						var obj = JSON.parse(result);
						if (obj.list.length == 0)
						{
							dialog.push({body:'<b>주의</b>\n 적용 가능한 전표가 없습니다. 배송비 이벤트는 \n 내정보>배송비 부가정보 변경에서 변경 가능합니다.', type:'Caution'
							, buttons:[{buttonValue:'확인', buttonClass:'Blue W40'}]});
						}else{
							strParam = "<root>";
							for (var i=0; i<obj.list.length; i++)
							{
								for (var j=0; j<cntCheck; j++)
								{
									if (Object.toJSON(checkedList[j].seq).replace(/\"/gi,"") == obj.list[i].Seq && Object.toJSON(checkedList[j].Gumea_No).replace(/\"/gi,"") == obj.list[i].Gumea_No){
										myGrid.updateItem(eNum.col.chkIdx, eNum.col.T_Cost, checkedList[j].idx - 1, obj.list[i].applyDeliveryCost);
										strParam += "<row><Gumea_No>"+ Object.toJSON(checkedList[j].Gumea_No) + "</Gumea_No>";
										strParam += "<Seq>"+ Object.toJSON(checkedList[j].seq) + "</Seq>";
										strParam += "<T_Cost>" + Object.toJSON(checkedList[j].T_Cost) + "</T_Cost></row>";
										break;
									}
								}
							}
							strParam += "</root>";
							strParam = strParam.replace(/\"/gi,"").replace(/,/gi,"");
						dialog.push({body:'<b>배송비 입력 확인</b>\n 배송비가 입력되었습니다. \n 확인을 클릭하시면 서버에 저장됩니다.'
							, buttons:[{buttonValue:'확인', buttonClass:'Blue W40', onClick:fnObjDialog.btnOnConfirm, data:"updateDeliveryCost_" + strParam}, {buttonValue:'취소', buttonClass:'Red W40'}]});
						}								
					},
					error:function(){
						toast.push({body:'<b>실패</b>\n 입력 실패. 관리자에게 문의바랍니다.', type:'Warning'});
					}
				});
			}
		// 업체상품명, 발주요청회신, 공급가변경요청 수정 / 저장
		}else if (type.substring(0,12)=="saveGerGoods")
		{
			strParam = type.substring(type.indexOf('_')+1);
			strParam = strParam.replace(/undefined/gi,"").replace(/\%20/g," ").replace(/\"/gi, "");
			trace(strParam);
			params = {"Kind": "savePtnGoods", "Admin_Code":Admin_Code, "Value_Kind":"list", "GerCode" : GerCode, "xml":strParam};
			$.ajax({
				type:'POST',
				url : url, 
				data : params,
				contentType: "application/x-www-form-urlencoded; charset=euc-kr", 
				timeout: 10000, 
				datatype: 'json', 
				success: function (result) {
					toast.push('<b>성공</b>\n 저장되었습니다. \n 운송장 번호는 출고처리해야 저장 됩니다.');
				},
				error:function(){
					toast.push({body:'<b>실패</b>\n 저장 실패. 관리자에게 문의바랍니다.', type:'Warning'});
				}
			});
//			for(var i=0; i< cntCheck; i++){
//				strParam += "<row><Gumea_No>"+ Object.toJSON(checkedList[i].Gumea_No) + "</Gumea_No>";
//				strParam += "<seq>"+ Object.toJSON(checkedList[i].seq) + "</seq>";
//				strParam += "<goodsCode>"+ Object.toJSON(checkedList[i].goodsCode) + "</goodsCode>";
//				strParam += "<ptnGCode>" + Object.toJSON(checkedList[i].ptnGCode) + "</ptnGCode>";
//				strParam += "<ptnGoodsName>" + Object.toJSON(escape(checkedList[i].ptnGoodsName)) + "</ptnGoodsName>";
//				strParam += "<T_Cost>" + Object.toJSON(checkedList[i].T_Cost) + "</T_Cost>";
//				strParam += "<replyAdmin>" + Object.toJSON(escape(checkedList[i].replyAdmin)) + "</replyAdmin>";
//				strParam += "<reqChgPrice>" + Object.toJSON(escape(checkedList[i].reqChgPrice)) + "</reqChgPrice></row>";
//				strParam += "<cnfrm_Qty>" + Object.toJSON(escape(checkedList[i].cnfrm_Qty)) + "</cnfrm_Qty></row>";
//			}
//			strParam += "</root>";
//			strParam = strParam.replace(/undefined/gi,"").replace(/\%20/g," ").replace(/\"/gi, "");
//			trace(strParam);
//			params = {"Kind": "savePtnGoods", "Admin_Code":Admin_Code, "Value_Kind":"list", "GerCode" : GerCode, "xml":strParam};
//			if (strParam == "<root></root>")
//			{
//				dialog.push({body:'<b>주의</b>\n 저장할 상품을 체크해주세요.', type:'Caution', buttons:[{buttonValue:'확인', buttonClass:'Red W40', onClick:fnObjDialog.btnClose}]});
//			}else{
//				$.ajax({
//					type:'POST',
//					url : url, 
//					data : params,
//					contentType: "application/x-www-form-urlencoded; charset=euc-kr", 
//					timeout: 10000, 
//					datatype: 'json', 
//					success: function (result) {
//						toast.push('<b>성공</b>\n 저장되었습니다. \n 운송장 번호는 출고처리해야 저장 됩니다.');
//					},
//					error:function(){
//						toast.push({body:'<b>실패</b>\n 저장 실패. 관리자에게 문의바랍니다.', type:'Warning'});
//					}
//				});
//			}
		//발주처리 with Table
		}else if (type == "baljuWithTable"){
			var innerHtml = "";
			var i;
			for (i=0; i<cntCheck; i++)
			{
				var stts = parseInt(Object.toJSON(checkedList[i].stts).replace(/\"/gi,""));
				trace("stts : " + stts);
				if (stts > 1);
				{
					trace(Object.toJSON(checkedList[i].stts));
				}
				innerHtml += "<tr>";
				innerHtml += "<td id='balju_GumeaNo_" + (i+1) + "'>" + Object.toJSON(checkedList[i].Gumea_No).replace(/\"/gi,"") + "</td>";
				innerHtml += "<td id='balju_seq_" + (i+1) + "'>" + Object.toJSON(checkedList[i].seq) + "</td>";
				if(Object.toJSON(checkedList[i].ptnGoodsName).replace(/\"/gi,"") == "") 
					innerHtml += "<td style='width:300px;'>" + Object.toJSON(checkedList[i].goodsName).replace(/\"/gi,"") + "</td>";
				else 
					innerHtml += "<td style='width:300px;'>" + Object.toJSON(checkedList[i].ptnGoodsName).replace(/\"/gi,"") + "</td>";
				innerHtml += "<td style='width:130px;'>" + Object.toJSON(checkedList[i].goodsStand).replace(/\"/gi,"") + "</td>";
				innerHtml += "<td>" + Object.toJSON(checkedList[i].Qty).replace(/\"/gi,"") + "</td>";
				innerHtml += "<td><input name='txtGoodsQty_" + (i+1) + "' type='text' style='width:50px; text-align:center;' onblur='fnChangeVal(this);' value='" + Object.toJSON(checkedList[i].Qty).replace(/\"/gi,"") + "' ></td>";
				innerHtml += "<td id='balju_goodsPrice_" + (i+1) + "'>" + Object.toJSON(checkedList[i].price).replace(/\"/gi,"") + "</td>";
				innerHtml += "</tr>";
			}
			$('#txtStore').val(innerHtml + "^" + i);
		//발주서출력
		}else if (type=="printBalju"){
			var strJSON = "";
			var checked = myGrid.getCheckedList(0);
			checked = "\"list\":" + JSON.stringify(checked);
			url = "https://www.erpia.net/include/JSon_Proc_Multi_LHK.asp";
			params = {"Kind":"selectScmInfo", "Value_Kind":"list", "Admin_Code": Admin_Code, "GerCode" : GerCode};
			$.ajax({
				type:'POST',
				url : url, 
				data : params,
				contentType: "application/x-www-form-urlencoded; charset=euc-kr", 
				timeout: 1000, 
				datatype: 'json', 
				success: function (result) {
					var objResult = JSON.parse(result);
					var result = objResult.list[0];
					strJSON += "{\"comInfo\":{";
					strJSON += "\"name\":\"" + result.name + "\",\"addr\":\"" + result.addr + "\",\"tel\":\"" + result.tel + "\",\"fax\":\"" + result.fax + "\"";
					strJSON += ",\"ERPia_Tax_Email\":\"" + result.ERPia_Tax_Email + "\",\"G_sano\":\"" + result.G_sano + "\",\"G_ceo\":\"" + result.G_ceo + "\"";
					strJSON += ",\"G_name\":\"" + result.G_name + "\",\"G_juso1\":\"" + result.G_Juso1 + "\",\"G_juso2\":\"" + result.G_juso2 + "\",\"G_tel\":\"" + result.G_tel + "\"";
					strJSON += ",\"G_Fax\":\"" + result.G_Fax + "\",\"Addr\":\"" + result.addr + "\",\"Post\":\"" + result.Post + "\",\"gCodeKey\":\"" + gCodeKey + "\"}," + checked + "}";
					$('input[name=printBalju_Param]').val(escape(strJSON));
					var myForm = document.printBalju;
					var url = "https://www.erpia.net/ERPiaSCM/include/print/printBalju.asp";
					window.open("" ,"printBalju", "scrollbars=yes,toolbar=no,menubar=no,width=1120,height=800,top=50,left=100,"); 
					myForm.action =url; 
					myForm.method="post";
					myForm.target="printBalju";
					myForm.submit();
				}
			});
			//출력여부 저장
			var jsonGumea_No = JSON.parse("{" + checked + "}");
			var xmlData = '<root>';
			for (var i=0; i<jsonGumea_No.list.length; i++)
			{
				xmlData += '<row>';
				xmlData += '<Gumea_No>' + Object.toJSON(jsonGumea_No.list[i].Gumea_No).replace(/"/g,'') + '</Gumea_No>';
				xmlData += '<Seq>' + Object.toJSON(jsonGumea_No.list[i].seq).replace(/"/g,'') + '</Seq>';
				xmlData += '</row>';
			}
			xmlData += '</root>';
			url = "https://www.erpia.net/include/JSon_Proc_Multi_LHK.asp";
			params = {"Kind":"savePrintYN", "Value_Kind":"list", "Admin_Code": Admin_Code, "xml" : xmlData};
			$.ajax({
				type:'POST',
				url : url, 
				data : params,
				contentType: "application/x-www-form-urlencoded; charset=euc-kr", 
				timeout: 1000, 
				datatype: 'json'
			});
		//발주서출력Test
		}else if (type=="printBaljuTest"){
			var strJSON = "";
			var checked = myGrid.getCheckedList(0);
			checked = "\"list\":" + JSON.stringify(checked);
			url = "https://www.erpia.net/include/JSon_Proc_Multi_LHK.asp";
			params = {"Kind":"selectScmInfo", "Value_Kind":"list", "Admin_Code": Admin_Code, "GerCode" : GerCode};
			$.ajax({
				type:'POST',
				url : url, 
				data : params,
				contentType: "application/x-www-form-urlencoded; charset=euc-kr", 
				timeout: 1000, 
				datatype: 'json', 
				success: function (result) {
					var objResult = JSON.parse(result);
					var result = objResult.list[0];
					strJSON += "{\"comInfodc\":{";
					strJSON += "\"name\":\"" + result.name + "\",\"addr\":\"" + result.addr + "\",\"tel\":\"" + result.tel + "\",\"fax\":\"" + result.fax + "\"";
					strJSON += ",\"ERPia_Tax_Email\":\"" + result.ERPia_Tax_Email + "\",\"G_sano\":\"" + result.G_sano + "\",\"G_ceo\":\"" + result.G_ceo + "\"";
					strJSON += ",\"G_name\":\"" + result.G_name + "\",\"G_juso1\":\"" + result.G_Juso1 + "\",\"G_juso2\":\"" + result.G_juso2 + "\",\"G_tel\":\"" + result.G_tel + "\"";
					strJSON += ",\"G_Fax\":\"" + result.G_Fax + "\",\"Addr\":\"" + result.addr + "\",\"Post\":\"" + result.Post + "\"}," + checked + "}";
					$('input[name=printBalju_Param]').val(strJSON);

					var myForm = document.printBalju;
					var url = "https://www.erpia.net/ERPiaSCM/include/print/printBaljuTest.asp";
					window.open("" ,"printBalju", "scrollbars=yes,toolbar=no,menubar=no,width=1120,height=800,top=50,left=100,"); 
					myForm.action =url; 
					myForm.method="post";
					myForm.target="printBalju";
					myForm.submit();
				}
			});
		//바코드 출력 test
		}else if (type=="printBarcode"){
			var strJSON = "";
			var checked = myGrid.getCheckedList(0);
			checked = "\"list\":" + JSON.stringify(checked);
			url = "https://www.erpia.net/include/JSon_Proc_Multi_LHK.asp";
			params = {"Kind":"selectScmInfo", "Value_Kind":"list", "Admin_Code": Admin_Code, "GerCode" : GerCode};
			$.ajax({
				type:'POST',
				url : url, 
				data : params,
				contentType: "application/x-www-form-urlencoded; charset=euc-kr", 
				timeout: 1000, 
				datatype: 'json', 
				success: function (result) {
					var objResult = JSON.parse(result);
					var result = objResult.list[0];
					strJSON += "{\"comInfo\":{";
					strJSON += "\"G_name\":\"" + result.G_name + "\",\"G_code\":\"" + result.G_code  + "\",\"gCodeKey\":\"" + gCodeKey + "\"}," + checked + "}";
					$('input[name=barcodeParam]').val(strJSON);
					var barcodeForm = document.frmPrintBarcode;
					window.open("" ,"printBarcode", "scrollbars=yes,toolbar=no,menubar=no,width=1120,height=800,top=50,left=100,"); 
					barcodeForm.action = "https://www.erpia.net/ERPiaSCM/include/print/printBarcode_Balju.asp";
					barcodeForm.method="post";
					barcodeForm.target="printBarcode";
					barcodeForm.submit();
				}
			});	
		}
	},
	getColHead: function(){
		var obj = myGrid.getExcelFormat('json');
		var colKey = ""
		var colValue = "";
		var colWidth = "";
		for (var i = 0; i<obj.colGroup.length; i++)
		{
			if (obj.colGroup[i].display) {
				colKey += obj.colGroup[i].key + ",";
				colValue += "T,"
			}else{
				colKey += obj.colGroup[i].key + ",";
				colValue += "F,"					
			}
			colWidth += obj.colGroup[i].width + ",";
		}
		colKey = colKey.substring(0,colKey.length - 1);
		colValue = colValue.substring(0,colValue.length - 1);
		colWidth = colWidth.substring(0,colWidth.length - 1);
		//trace(colWidth);
		params = {"Kind":"setColHead","Value_Kind":"list","Admin_Code":Admin_Code,"GerCode":GerCode,"menu":menu,"stts":stts,"colKey":colKey,"colValue":colValue, "colWidth":colWidth};
		$.ajax({
			type:'POST',
			url : url, 
			data : params,
			contentType: "application/x-www-form-urlencoded; charset=euc-kr", 
			timeout: 1000, 
			datatype: 'json', 
			success: function (result) {
				toast.push('<b>성공</b>\n 저장되었습니다.');
			},
			error:function(){
				toast.push({body:'<b>실패</b>\n 저장 실패. 관리자에게 문의바랍니다.', type:'Warning'});
			}
		});
	}
};
jQuery(document.body).ready(fnObj.pageStart.delay(2));
</script>