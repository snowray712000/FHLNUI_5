//開發原始來源是 tech_01.html
// sephp.R.txtSn
// sephp.R.txt ... 給props給的是 sn:["5123","1214","摩西"] ... 關鍵字, txt: 要傳入api回傳的原始資訊

/// http://localhost:9125/search.css
/// http://localhost:9125/sephp_c_param.css
var sephp = sephp || {};
// define class
var sephp = sephp || {};
sephp.R = sephp.R || {
	txtSn: React.createClass({
		handle_onclick: function () {
			var pfn = this.props.pfn_search_sn;
			if (pfn == null)
				return;
			pfn(this.props.sn);
		},
		getDefaultProps: function () {
			return {
				sn: "",
				txt: "",
				isKey: false,
				pfn_search_sn: null
			};
		},
		render: function () {
			if (this.props.sn == null || this.props.sn.length == 0)
				return null;

			if (this.props.isKey) {
				return React.createElement("span", { className: "seKey sebutton", onClick: this.handle_onclick }, this.props.txt);
			}
			else {
				return React.createElement("span", { className: "seSN sebutton", onClick: this.handle_onclick }, this.props.txt);
			}
		}
	}),
	txt: React.createClass({
		/// <summary> 取fhl的json資料, 但是確是取得最原始資料, 原因是 json 有時候不正確, 還是回傳純文字好了 </summary>
		getDefaultProps: function () {
			return {
				//ex:1 舊約 8804 要變中括號 (8804) ... 因為是 WTH ... (8764) 也是 ... WH WTH ... H指的是 Herbrew 希伯來文的 H 
				//txt: "地<WH0776>是<WH01961><WTH8804>空虛<WH08414>混沌<WH0922>，淵<WH08415>面{<WAH05921>}<WH06440>黑暗<WH02822>；　神<WH0430>的靈<WH07307>運行<WH07363><WTH8764>在<WH05921>水<WH04325>面<WH06440>上。",
				//txt: "地是空虛混沌，淵面黑暗；　神的靈運行在水面上。",

				//ex:2 新約 (5656) WTG
				txt: "亞伯拉罕<WG11>生<WG1080><WTG5656>以撒<WG2464>；{<WG1161>}以撒<WG2464>生<WG1080><WTG5656>雅各<WG2384>；{<WG1161>}雅各<WG2384>生<WG1080><WTG5656>猶大<WG2455>和<WG2532>他的<WG846>弟兄<WG80>；",
				sn: ['2464', '1161', "5656", "罕生", "弟兄", "是空", "淵面黑暗"] // ex: 1800-1833 , 0-9999
				//sn: ["空虛","面黑"] // ex: 1800-1833 , 0-9999
			};
		},
		render: function () {
			if (this.props.txt == null || this.props.txt.length == 0)
				return React.createElement("div");

			var reg1 = new RegExp("<WT[GH][0-9]+>"); //(5656)
			var reg2 = new RegExp("<W[A]{0,1}[GH][0-9]+>");
			var reg3 = new RegExp("[0-9]+");
			var reg4 = new RegExp("[{}]+");
			var reg5 = new RegExp("^[0-9]+$"); // keyword 用

			var key_sn = Enumerable.from(this.props.sn).
			where(function (a1) { if (reg5.exec(a1) == null) return false; return true; })
			.toArray();
			var key_txt = Enumerable.from(this.props.sn)
			.where(function (a1) { if (reg5.exec(a1) != null) return false; return true; })
			.toArray();
			// var key_txt = ["空虛", "面黑", "行在水"];

			// 去掉 sn 後的純文字. 也會去掉 {<1611>} 的 {}
			var txt_prue = this.props.txt.replace(new RegExp("<WT[GH][0-9]+>", "g"), "").replace(new RegExp("<W[A]{0,1}[GH][0-9]+>", "g"), "").replace(new RegExp("[{}]+", "g"), "");

			var max_length = 0;
			if (key_txt.length != 0) {
				max_length = Enumerable.from(key_txt).select(function (a1) { return a1.length; }).max();
			}

			var txt = this.props.txt;
			var re1 = reg1.exec(txt);
			var re2 = reg2.exec(txt);

			var children = [];

			var pretxt = "";

			var case3 = function () {
				/// <summary> 為了使下面的 while 迴圈清晰, 寫成次函式 </summary>
				var subtxt = "";
				if (re2 == null && re1 == null) {
					// 最後一個字串了
					subtxt = txt.substr(0, txt.length);
					txt = "";
				}
				else if (re1 == null) {
					// 到 re2.index != -1 
					var idx2 = re2.index;
					var subtxt = txt.substr(0, idx2);
					txt = txt.substr(idx2, txt.length - idx2);
				}
				else if (re2 == null) {
					// 到 re1.index
					var idx2 = re1.index;
					subtxt = txt.substr(0, idx2);
					txt = txt.substr(idx2, txt.length - idx2);
				}
				else {
					var idx2 = (re1.index < re2.index) ? re1.index : re2.index;
					subtxt = txt.substr(0, idx2);
					txt = txt.substr(idx2, txt.length - idx2);
				}
				return subtxt;
			};// case3 

			while (true) {
				//console.log(txt);
				re1 = reg1.exec(txt);
				re2 = reg2.exec(txt);

				if (re1 != null && re1.index == 0) {
					// 動詞型態 <WTH5656> 顯示為 (5656) 
					var idx2 = re1[0].length;
					var subtxt = re1[0];
					txt = txt.substr(idx2, txt.length - idx2);
					var sn = reg3.exec(subtxt);
					if (key_sn.indexOf(sn[0]) == -1)
						children.push(React.createElement(sephp.R.txtSn, { sn: sn[0], txt: "(" + sn[0] + ")", pfn_search_sn: this.props.pfn_search_sn, isKey: false }));
						//children.push(React.createElement("span", { className: "seSN sebutton" }, "(" + sn[0] + ")"));
					else
						children.push(React.createElement(sephp.R.txtSn, { sn: sn[0], txt: "(" + sn[0] + ")", pfn_search_sn: this.props.pfn_search_sn, isKey: true }));
					//children.push(React.createElement("span", { className: "seKey sebutton" }, "(" + sn[0] + ")"));
				}
				else if (re2 != null && re2.index == 0) {
					var idx2 = re2[0].length;
					var subtxt = re2[0];
					txt = txt.substr(idx2, txt.length - idx2);
					var sn = reg3.exec(subtxt);
					if (key_sn.indexOf(sn[0]) == -1)
						children.push(React.createElement(sephp.R.txtSn, { sn: sn[0], txt: "<" + sn[0] + ">", pfn_search_sn: this.props.pfn_search_sn, isKey: false }));
						//children.push(React.createElement("span", { className: "seSN sebutton" }, "<" + sn[0] + ">"));
					else
						children.push(React.createElement(sephp.R.txtSn, { sn: sn[0], txt: "<" + sn[0] + ">", pfn_search_sn: this.props.pfn_search_sn, isKey: true }));
					//children.push(React.createElement("span", { className: "seKey sebutton" }, "<" + sn[0] +">"));
				}
				else {
					if (txt.length == 0)
						break;

					// 若是一般關鍵字...但若直接用 subtxt 來判斷. 可能會失誤. 
					// 例如 "亞伯拉罕生" 若SN開啟, 就會變成 亞伯拉罕 ... 若使用者查「罕生」就不會被上色到.
					// 所以 subtxt = 亞伯拉罕 .. (假設關鍵字最長是2字元) ... OO亞伯拉罕OO ... 然後用這個字串來查詢
					// 又要另外注意 {} 會讓人算錯 .
					var subtxt = case3();
					if (key_txt.length == 0) {
						children.push(React.createElement("span", {}, subtxt));
						continue;
					}

					// 下面這一大段超複雜.我作了一個晚上. 
					// 超難的. 超感謝主. 沒有主沒盼望. 只想挑簡單的作. 呼~~~~~~~~
					// 榮耀歸給主~~
					var subtxt2 = "";
					while (true) {
						subtxt2 = subtxt;
						var re4 = reg4.exec(subtxt);
						if (re4 != null && re4.index == 0) {
							// }面 ... 變為 }
							children.push(React.createElement("span", {}, re4[0])); // { 或 } 或 {}
							subtxt = subtxt.substr(re4[0].length, subtxt.length - re4[0].length);
							continue;

						}

						if (subtxt == null || subtxt.length == 0)
							break;//break while 

						if (re4 != null /*&& re4.index != 0*/) {
							// 黑{ ... 變為 黑
							subtxt2 = subtxt.substr(0, re4.index);
							subtxt = subtxt.substr(re4.index, subtxt.length - re4.index);
						}
						else
							subtxt = "";

						var len_pre_get = (pretxt.length < max_length) ? pretxt.length : max_length;
						var len_after_get = (subtxt2.length + max_length < txt_prue.length) ? subtxt2.length + max_length : txt_prue.length;
						var txtTry = pretxt.substr(pretxt.length - len_pre_get, len_pre_get) + txt_prue.substr(0, len_after_get);

						var rrr = Enumerable.from(key_txt).select(function (a1, i1) {
							var jo = {};
							var idxof = txtTry.indexOf(a1);
							jo.i = idxof == -1 ? -1000 : idxof - len_pre_get;
							jo.m1 = -a1.length + 1;
							jo.m2 = subtxt2.length - 1;
							return jo;
						});

						var sss = rrr.select(function (a1, i1) {
							var jo = {};
							if (a1.i >= a1.m1 && a1.i <= a1.m2) {
								jo.i = a1.i;
								jo.ik = i1;
								return jo;
							}

							jo.i = 1000;
							return jo;
						}).minBy(a1=>a1.i);

						if (sss.i == 1000) {
							children.push(React.createElement("span", {}, subtxt2)); // { 或 } 或 {}
							pretxt = pretxt + subtxt2;
							var lensub2 = subtxt2.length;
							txt_prue = txt_prue.substr(lensub2, txt_prue.length - lensub2);
						}
						else {
							if (sss.i <= 0) {
								// 關鍵字在前 要把後面的丟回 subtxt
								var length_keyword = key_txt[sss.ik].length + sss.i; //可能是局部的..."面黑"...斷在 黑...就是1了
								subtxt = subtxt2.substr(length_keyword, subtxt2.length - length_keyword) + subtxt;// 加回去subtxt
								subtxt2 = subtxt2.substr(0, length_keyword);
								children.push(React.createElement("span", { className: "seKey" }, subtxt2));
								pretxt = pretxt + subtxt2;
								var lensub2 = subtxt2.length;
								txt_prue = txt_prue.substr(lensub2, txt_prue.length - lensub2);
							}
							else {
								// 非關鍵字在前.
								subtxt = subtxt2.substr(sss.i, subtxt2.length - sss.i) + subtxt;// 加回去
								subtxt2 = subtxt2.substr(0, sss.i);
								children.push(React.createElement("span", {}, subtxt2)); // { 或 } 或 {}
								pretxt = pretxt + subtxt2;
								txt_prue = txt_prue.substr(subtxt2.length, txt_prue.length - subtxt2.length);
							}
						}
					}// while true2

					children.push(React.createElement("span", {}, subtxt));
				}
			}// while ( true )

			return React.createElement("div", {}, children);
		}//render
	})//R.txt
};// define react class