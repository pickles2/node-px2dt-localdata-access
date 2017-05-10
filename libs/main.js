/**
 * px2dt-localdata-access
 */
module.exports = function(pathDataDir, options){
	var fs = require('fs');
	var fsX = require('fs-extra');
	var path = require('path');
	var mkdirp = require('mkdirp');
	var php = require('phpjs');
	var utils79 = require('utils79');
	var Promise = require("es6-promise").Promise;
	var DIRECTORY_SEPARATOR = (process.platform=='win32'?'\\':'/');
	var Project = require('./class/Project.js');

	var _this = this;
	this.db = {}; // db.json
	this.pathDataDir = path.resolve(pathDataDir)+DIRECTORY_SEPARATOR;
	this.options = options || {};
	this.options.path_php = this.options.path_php||'php';
	this.options.path_php_ini = this.options.path_php_ini||null;
	this.options.path_extension_dir = this.options.path_extension_dir||null;

	/**
	 * データディレクトリの初期化
	 */
	this.initDataDir = function(callback){
		callback = callback || function(){};
		var _this = this;

		(function(){ return new Promise(function(rlv, rjt){
			rlv();return;
		}); })()
		.then(function(){ return new Promise(function(rlv, rjt){
			if( utils79.is_dir(_this.pathDataDir) ){
				rlv(); return;
			}
			if( utils79.is_file(_this.pathDataDir) ){
				console.error('FAILED to initialize data directory; A file is Already exists; - '+_this.pathDataDir);
				callback(false);
				return;
			}
			mkdirp(_this.pathDataDir, function (err) {
				if (err){
					console.error('FAILED to initialize data directory; Could NOT make directory; - '+_this.pathDataDir);
					callback(false);
					return;
				}
				rlv();
			});
			return;
		}); })
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
			// composer.phar のインストール先ディレクトリ作成
			if( utils79.is_dir(_this.pathDataDir+'/commands/composer/') ){
				rlv(); return;
			}
			mkdirp(_this.pathDataDir+'/commands/composer/', function (err) {
				if (err){
					console.error('FAILED to initialize data directory; Could NOT make directory; - '+_this.pathDataDir+'/commands/composer/');
					callback(false);
					return;
				}
				rlv();
			});
			return;
		}); })
		.then(function(){ return new Promise(function(rlv, rjt){
			// composer.phar をインストール
			var pathComposerPhar = {
				'from': require('path').resolve(__dirname+'/../files/composer.phar') ,
				'to': require('path').resolve(_this.pathDataDir+'/commands/composer/composer.phar')
			};
			_this.db.commands.composer = pathComposerPhar.to;

			// 既にインストール済みならスキップ
			if( utils79.is_file( _this.pathDataDir+'/commands/composer/composer.phar' ) ){
				rlv(); return;
			}

			fsX.copy(pathComposerPhar.from, pathComposerPhar.to, function(err){
				if( err ){
					console.error('FAILED to copy composer.phar.');
					console.error(err);
				}
				rlv(); return;
				return;
			});

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
			callback(true);
		})
		;

		return this;
	}

	/**
	 * データを読み込む(同期)
	 */
	this.loadSync = function(){
		var db = {};
		if( utils79.is_file(this.pathDataDir+'/db.json') ){
			var json = fs.readFileSync( this.pathDataDir+'/db.json' );
			try {
				db = JSON.parse(json.toString());
			} catch (e) {
				console.error('FAILED to parse db.json');
			}
		}
		return db;
	}

	/**
	 * データを読み込む
	 */
	this.load = function(callback){
		callback = callback || function(){};

		var db = {};
		if( utils79.is_file(this.pathDataDir+'/db.json') ){
			var json = fs.readFileSync( this.pathDataDir+'/db.json' );
			try {
				db = JSON.parse(json.toString());
			} catch (e) {
				console.error('FAILED to parse db.json');
			}
		}
		callback(db);
		return this;
	}

	/**
	 * データを保存する
	 */
	this.save = function(callback){
		callback = callback || function(){};
		var _path_db = this.pathDataDir+'/db.json';
		try {
			fs.writeFile(_path_db+'.tmp', JSON.stringify(this.db,null,1), function(err){
				var result = true;
				if(err){
					result = false;
					_this.log('ERROR on saving db.json; FAILED to save db.json.tmp; ' + err);
					callback(result);
					return;
				}

				err = fs.renameSync(_path_db+'.tmp', _path_db);
				if( err ){
					_this.log('ERROR on saving db.json; FAILED to rename db.json.tmp to db.json; ' + err);
				}
				// _this.log('Success to save db.json;');
				callback( (err === undefined ? true : false) );
				return;
			});
			return;
		} catch (e) {
			_this.log('ERROR on saving db.json; FAILED to save db.json with unknown error.');
			callback(false);
		}
		return;
	}

	/**
	 * db.json 内の全てのデータをそのまま取得する
	 */
	this.getData = function(callback){
		callback = callback || function(){};
		var _this = this;
		setTimeout(
			function(){
				callback( _this.db );
			}, 0
		);
		return this;
	}

	/**
	 * db.json 内の全てのデータをそのまま受け取って置き換える
	 */
	this.setData = function(db, callback){
		callback = callback || function(){};
		var _this = this;
		_this.db = db;
		setTimeout(
			function(){
				callback( true );
			}, 0
		);
		return this;
	}

	/**
	 * プロジェクト情報を追加する
	 *
	 * @param object pjInfo 追加するプロジェクト情報
	 * @param function callback コールバック
	 * 追加したプロジェクトのコードナンバーが渡されます。
	 * プロジェクトを追加すると、nameによって並べ替えられます。
	 * コードナンバーはプロジェクトに対して固有ではなく、並べ替えによって変更される可能性があることに注意してください。
	 */
	this.addProject = function(pjInfo, callback){
		callback = callback || function(){};
		this.db = this.db || {};
		this.db.projects = this.db.projects || [];

		if(typeof(pjInfo) !== typeof({})){ callback(false);return this; }
		if(typeof(pjInfo.name) !== typeof('')){ callback(false);return this; }
		if(typeof(pjInfo.path) !== typeof('')){ callback(false);return this; }
		if(typeof(pjInfo.entry_script) !== typeof('')){ callback(false);return this; }

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
				callback(pjCd);
				return;
			}
		}

		callback(false);
		return this;
	}

	/**
	 * プロジェクトインスタンスの一覧を取得する
	 */
	this.getProjectAll = function(callback){
		callback = callback || function(){};
		var rtn = [];
		for(var i in this.db.projects){
			rtn[i] = new Project(this, i);
		}
		callback(rtn);
		return;
	}

	/**
	 * プロジェクトインスタンスを取得する
	 */
	this.project = function(pjCd, callback){
		callback = callback || function(){};
		var pj = new Project(this, pjCd);
		callback(pj);
		return;
	}

	/**
	 * プロジェクト情報を取得する
	 */
	this.getProject = function(pjCd, callback){
		callback = callback || function(){};
		this.project(pjCd, function(pj){
			pj.get(function(pjData){
				callback(pjData);
			});
		});
		return;
	}

	/**
	 * プロジェクト情報を削除する
	 */
	this.removeProject = function(pjCd, callback){
		callback = callback || function(){};
		if(typeof(pjCd) != typeof(0)){
			callback(false);
			return;
		}

		var beforeLen = this.db.projects.length;
		this.db.projects.splice( pjCd, 1 );
		var afterLen = this.db.projects.length;

		callback( beforeLen === (afterLen+1) );
		return;
	}

	/**
	 * ログ情報を保存する
	 */
	this.log = function(msg){
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
	this.getPathDataDir = function(){
		return this.pathDataDir;
	}


	// データオブジェクトをロード
	this.db = this.loadSync();
};
