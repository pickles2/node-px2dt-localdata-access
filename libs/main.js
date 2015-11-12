/**
 * px2dt-localdata-access
 */
module.exports = new (function(){
	var fs = require('fs');
	var path = require('path');
	var mkdirp = require('mkdirp');
	var php = require('phpjs');
	var Promise = require("es6-promise").Promise;

	function px2dtLocalDataAccess(pathDataDir, options){
		var _this = this;
		this.pathDataDir = pathDataDir;
		this.options = options || {};
		this.options.path_php = this.options.path_php||'php';
		this.options.path_php_ini = this.options.path_php_ini||null;
		this.options.path_extension_dir = this.options.path_extension_dir||null;
		this.db = {};
		this.db = this.loadSync();
	}

	/**
	 * データディレクトリの初期化
	 */
	px2dtLocalDataAccess.prototype.initDataDir = function(cb){
		cb = cb || function(){};
		var _this = this;

		(function(){ return new Promise(function(rlv, rjt){
			if( _this.is_dir(_this.pathDataDir) ){
				rlv(); return;
			}
			if( _this.is_file(_this.pathDataDir) ){
				rjt(); return;
			}
			mkdirp(_this.pathDataDir, function (err) {
				if (err){
					rjt();
				}else{
					rlv();
				}
			});
			return;
		}); })()
		.catch(function(reason){
			// console.log(reason);
			cb(false);
		})
		.then(function(){ return new Promise(function(rlv, rjt){
			// データJSON初期化
			_this.db = _this.db||{};
			_this.db.commands = _this.db.commands||{};
			_this.db.projects = _this.db.projects||[];
			_this.db.network = _this.db.network||{};
			_this.db.network.preview = _this.db.network.preview||{};
			_this.db.network.preview.port = _this.db.network.preview.port||'';
			_this.db.network.appserver = _this.db.network.appserver||{};
			_this.db.network.appserver.port = _this.db.network.appserver.port||'';
			_this.db.apps = _this.db.apps||{};
			_this.db.apps.texteditor = _this.db.apps.texteditor||'';
			_this.db.apps.texteditorForDir = _this.db.apps.texteditorForDir||'';
			rlv();
		}); })
		.then(function(){ return new Promise(function(rlv, rjt){
			// composer.phar をインストール
			if( _this.is_dir(_this.pathDataDir+'/commands/composer/') ){
				rlv(); return;
			}
			mkdirp(_this.pathDataDir+'/commands/composer/', function (err) {
				if (err){
					rjt();
				}else{
					rlv();
				}
			});
			return;
		}); })
		.catch(function(reason){
			// console.log(reason);
			cb(false);
		})
		.then(function(){ return new Promise(function(rlv, rjt){
			// composer.phar をインストール
			if( _this.is_file( _this.pathDataDir+'/commands/composer/composer.phar' ) ){
				rlv(); return;
			}

			var _pathCurrentDir = process.cwd();
			process.chdir( _this.pathDataDir+'/commands/composer/' );

			var cmd = _this.options.path_php + ' -r "readfile(\'https://getcomposer.org/installer\');" | ' + _this.options.path_php;
			// console.log(cmd);
			var proc = require('child_process').exec(cmd, function(){
				// console.log('installing composer.phar done!');
				rlv();return;
			});

			// console.log(_pathCurrentDir);
			process.chdir( _pathCurrentDir );

			return;
		}); })
		.then(function(){ return new Promise(function(rlv, rjt){
			// データを保存
			_this.save(function(){
				// console.log('saving data is done.');
				rlv(); return;
			});
			return;
		}); })
		.then(function(){
			cb(true);
		})
		;

		return this;
	}

	/**
	 * データを読み込む(同期)
	 */
	px2dtLocalDataAccess.prototype.loadSync = function(){
		var db = {};
		if( fs.existsSync(this.pathDataDir+'/db.json') ){
			db = require( this.pathDataDir+'/db.json' );
		}
		return db;
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
	 * データを取得する
	 */
	px2dtLocalDataAccess.prototype.getData = function(cb){
		cb = cb || function(){};
		var _this = this;
		setTimeout(
			function(){
				cb( _this.db );
			}, 0
		);
		return this;
	}

	/**
	 * プロジェクト情報を追加する
	 *
	 * @param object pjInfo 追加するプロジェクト情報
	 * @param function cb コールバック
	 * 追加したプロジェクトのコードナンバーが渡されます。
	 * プロジェクトを追加すると、nameによって並べ替えられます。
	 * コードナンバーはプロジェクトに対して固有ではなく、並べ替えによって変更される可能性があることに注意してください。
	 */
	px2dtLocalDataAccess.prototype.addProject = function(pjInfo, cb){
		cb = cb || function(){};
		this.db = this.db || {};
		this.db.projects = this.db.projects || [];

		if(typeof(pjInfo) !== typeof({})){ cb(false);return this; }
		if(typeof(pjInfo.name) !== typeof('')){ cb(false);return this; }
		if(typeof(pjInfo.path) !== typeof('')){ cb(false);return this; }
		if(typeof(pjInfo.entry_script) !== typeof('')){ cb(false);return this; }

		this.db.projects.push(pjInfo);

		this.db.projects.sort(function(a,b){
			var aStr = a.name.toLowerCase();
			var bStr = b.name.toLowerCase();
			if(aStr > bStr)  return 1;
			if(aStr < bStr)  return -1;
			return 0;
		});

		for( var pjCd in this.db.projects ){
			pjCd = pjCd-0;
			if( this.db.projects[pjCd].name == pjInfo.name && this.db.projects[pjCd].path == pjInfo.path && this.db.projects[pjCd].entry_script == pjInfo.entry_script ){
				cb(pjCd);
				return;
			}
		}

		cb(false);
		return this;
	}

	/**
	 * プロジェクト情報の一覧を取得する
	 */
	px2dtLocalDataAccess.prototype.getProjectAll = function(cb){
		cb = cb || function(){};
		cb(this.db.projects);
		return this;
	}

	/**
	 * プロジェクト情報を取得する
	 */
	px2dtLocalDataAccess.prototype.getProject = function(pjCd, cb){
		cb = cb || function(){};
		cb(this.db.projects[pjCd]);
		return this;
	}

	/**
	 * プロジェクト情報を削除する
	 */
	px2dtLocalDataAccess.prototype.removeProject = function(pjCd, cb){
		cb = cb || function(){};
		if(typeof(pjCd) != typeof(0)){
			cb(false);
			return this;
		}

		var beforeLen = this.db.projects.length;
		this.db.projects.splice( pjCd, 1 );
		var afterLen = this.db.projects.length;

		cb( beforeLen === (afterLen+1) );
		return this;
	}

	/**
	 * ログ情報を保存する
	 */
	px2dtLocalDataAccess.prototype.log = function(msg){
		var path = this.pathDataDir + 'common_log.log';
		var time = ( (function(){
			var d = new Date();
			function pad(n){return n<10 ? '0'+n : n}
			var rtn = '';
			rtn +=
				d.getUTCFullYear()+'-'
				+ pad(d.getUTCMonth()+1)+'-'
				+ pad(d.getUTCDate())+'T'
				+ pad(d.getUTCHours())+':'
				+ pad(d.getUTCMinutes())+':'
				+ pad(d.getUTCSeconds())+'Z'
			;
			return rtn;
		})() );
		var row = [
			time ,
			process.pid ,
			msg
		].join('	');
		// console.log(row);
		fs.appendFileSync( path, row+"\n", {} );
		return true;
	}

	/**
	 * データディレクトリのパスを取得する
	 */
	px2dtLocalDataAccess.prototype.getPathDataDir = function(){
		return this.pathDataDir;
	}

	/**
	 * ファイルが存在するか調べる
	 */
	px2dtLocalDataAccess.prototype.is_file = function(path){
		if( !fs.existsSync(path) ){
			return false;
		}
		if( !fs.statSync(path).isFile() ){
			return false;
		}
		return true;
	}

	/**
	 * ディレクトリが存在するか調べる
	 */
	px2dtLocalDataAccess.prototype.is_dir = function(path){
		if( !fs.existsSync(path) ){
			return false;
		}
		if( !fs.statSync(path).isDirectory() ){
			return false;
		}
		return true;
	}

	/**
	 * Px2DTLDAオブジェクトを作成する
	 */
	this.create = function(pathDataDir, options){
		var px2dtLDA = new px2dtLocalDataAccess(pathDataDir, options);
		return px2dtLDA;
	}

})();
