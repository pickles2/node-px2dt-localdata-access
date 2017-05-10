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
	 * プロジェクト名を取得する
	 */
	this.getName = function(){
		return this.get().name;
	}
	/**
	 * プロジェクト名を更新する
	 */
	this.setName = function(name){
		px2dtLDA.db.projects[this.index].name = name;
		return true;
	}

	/**
	 * プロジェクトパスを取得する
	 */
	this.getPath = function(){
		return this.get().path;
	}
	/**
	 * プロジェクトパスを更新する
	 */
	this.setPath = function(path){
		px2dtLDA.db.projects[this.index].path = path;
		return true;
	}

	/**
	 * Entry Script のパスを生成する
	 */
	this.getEntryScript = function(){
		return this.get().entry_script;
	}
	/**
	 * プロジェクトパスを更新する
	 */
	this.setEntryScript = function(entry_script){
		px2dtLDA.db.projects[this.index].entry_script = entry_script;
		return true;
	}


	/**
	 * Entry Script の絶対パスを生成する
	 */
	this.getRealpathEntryScript = function(){
		var path = this.getPath() + '/' + this.getEntryScript();
		path = require('path').resolve(path);
		return path;
	}

	/**
	 * プロジェクト情報を取得する
	 */
	this.get = function(){
		var rtn = false;

		try {
			rtn = px2dtLDA.db.projects[this.index];
		} catch (e) {
		}
		if( rtn === undefined ){
			return false;
		}

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
