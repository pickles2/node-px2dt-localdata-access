/**
 * px2dt-localdata-access
 */
module.exports = new (function(){
	var fs = require('fs');
	var path = require('path');
	var mkdirp = require('mkdirp');

	function px2dtLocalDataAccess(pathDataDir, options){
		var _this = this;
		this.pathDataDir = pathDataDir;
		this.options = options;
		this.db = {};
		this.load(function(db){
			_this.db = db;
		});
	}

	/**
	 * データディレクトリの初期化
	 */
	px2dtLocalDataAccess.prototype.initDataDir = function(cb){
		cb = cb || function(){};

		mkdirp(this.pathDataDir, function (err) {
			if (err){ console.error(err); }
			else{ cb(true); }
		});

		return this;
	}

	/**
	 * データを読み込む
	 */
	px2dtLocalDataAccess.prototype.load = function(cb){
		cb = cb || function(){};

		var db = {};
		if( fs.existsSync(this.pathDataDir+'/db.json') ){
			db = require( this.pathDataDir+'/db.json' );
		}
		cb(db);
		return this;
	}

	/**
	 * データを保存する
	 */
	px2dtLocalDataAccess.prototype.save = function(cb){
		cb = cb || function(){};
		fs.writeFile(this.pathDataDir+'/db.json', JSON.stringify(this.db,null,1), function(err){
			var result = true;
			if(err){result = false;}
			cb(result);
		});
		return this;
	}

	/**
	 * プロジェクトを作成する
	 */
	this.create = function(pathDataDir, options){
		var px2dtLDA = new px2dtLocalDataAccess(pathDataDir, options);
		return px2dtLDA;
	}

})();