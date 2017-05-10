/**
 * classProject.js
 */
module.exports = function(px2dtLDA, pjCd){
	var Promise = require("es6-promise").Promise;
	var utils79 = require('utils79');
	// console.log(utils79);

	try {
		this.index = pjCd;
		this.id = px2dtLDA.db.projects[pjCd].id;
	} catch (e) {
	}

	/**
	 * プロジェクト情報を取得する
	 */
	this.get = function(){
		var rtn = px2dtLDA.db.projects[this.index];

		if( typeof(rtn.id) === typeof('') ){
			// IDがセットされている場合はそのまま答える。
			return rtn;
		}

		// プロジェクトがID文字列を持つ仕様は後から追加されたものなので、
		// 古い環境に考慮して、存在しない場合には発行処理を行う。
		px2dtLDA.db.projects[this.index].id = px2dtLDA.generateNewProjectId();

		return px2dtLDA.db.projects[this.index];
	}

	/**
	 * プロジェクト情報を更新する
	 */
	this.set = function(pjData, callback){
		callback = callback || function(){};
		px2dtLDA.db.projects[this.index] = pjData;
		this.get();
		return true;
	}

};
