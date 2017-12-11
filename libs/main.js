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
	this.options.updated = this.options.updated || function(updateEvents){};

	var Watcher = require('./class/Watcher.js'),
		watcher = new Watcher(this);
	watcher.start();

	/**
	 * データディレクトリの初期化
	 */
	this.initDataDir = function(callback){
		callback = callback || function(){};
		var _this = this;

		(function(){ return new Promise(function(rlv, rjt){rlv();return;}); })()
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
			.then(function(){ return new Promise(function(rlv, rjt){
				// ファイルの書き込み監視を開始
				watcher.start();
				rlv(); return;
			}); })
			.then(function(){
				callback(true);
			})
		;

		return;
	}

	/**
	 * ファイルからデータを読み込む
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
		_this.db = db;
		callback(db);
		return;
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
		this.db = db;
		return db;
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
	this.getData = function(){
		return this.db;
	}

	/**
	 * db.json 内の全てのデータをそのまま受け取って置き換える
	 */
	this.setData = function(db){
		_this.db = db;
		return true;
	}

	/**
	 * プロジェクト情報を追加する
	 *
	 * @param object pjInfo 追加するプロジェクト情報
	 * @param function callback コールバック
	 * 第1引数に追加したプロジェクトのコードナンバーが、第2引数に生成されたプロジェクトインスタンスが渡されます。
	 * プロジェクトを追加すると、nameによって並べ替えられます。
	 * コードナンバーはプロジェクトに対して固有ではなく、並べ替えによって変更される可能性があることに注意してください。
	 */
	this.addProject = function(pjInfo){
		this.db = this.db || {};
		this.db.projects = this.db.projects || [];

		if(typeof(pjInfo) !== typeof({})){ return false; }
		if(typeof(pjInfo.name) !== typeof('')){ return false; }
		if(typeof(pjInfo.path) !== typeof('')){ return false; }
		// if(typeof(pjInfo.entry_script) !== typeof('')){ return false; } // px2package に記述される可能性を考慮して、必須項目から除外
		// if(typeof(pjInfo.home_dir) !== typeof('')){ return false; }

		pjInfo.id = this.generateNewProjectId(); // IDを自動発行
		pjInfo.path = require('path').resolve(pjInfo.path); // path を整形
		// console.log(pjInfo);

		// 未定義のキーを削除
		for( var key in pjInfo ){
			switch( key ){
				case 'id':
				case 'path':
				case 'name':
				case 'entry_script':
				case 'home_dir':
					break;
				default:
					pjInfo[key] = undefined;
					delete(pjInfo[key]);
					break;
			}
		}

		this.db.projects.push(pjInfo);

		this.db.projects.sort(function(a,b){
			var aStr = a.name.toLowerCase();
			var bStr = b.name.toLowerCase();
			if(aStr > bStr)  return 1;
			if(aStr < bStr)  return -1;
			return 0;
		});

		for( var i in this.db.projects ){
			var pjCd = i-0;
			if( this.db.projects[pjCd].name == pjInfo.name && this.db.projects[pjCd].path == pjInfo.path && this.db.projects[pjCd].entry_script == pjInfo.entry_script ){
				return pjCd;
			}
		}
		return false;
	}

	/**
	 * プロジェクトインスタンスの一覧を取得する
	 */
	this.getProjectAll = function(){
		var rtn = [];
		for(var i in this.db.projects){
			rtn[i] = new Project(this, i);
		}
		return rtn;
	}

	/**
	 * プロジェクト情報を取得する
	 */
	this.getProject = function(pjCd, callback){
		callback = callback || function(){};
		pjCd = this.findProjectIdxById(pjCd);
		try {
			var rtn = this.db.projects[pjCd];
			return rtn;
		} catch (e) {
		}
		return false;
	}

	/**
	 * プロジェクトIDからインデックス番号を取得する
	 */
	this.findProjectIdxById = function(pjId){
		if( this.db.projects[pjId] ){
			return pjId;
		}
		for( var i = 0; this.db.projects.length > i; i ++ ){
			if(this.db.projects[i].id == pjId){
				return i;
			}
		}
		return false;
	}

	/**
	 * 新しいプロジェクトIDを生成する
	 */
	this.generateNewProjectId = function(){
		var newId = false;
		for( var i = 0; i < 100; i++ ){
			newId = 'PJ-'+utils79.md5((new Date().getTime())+'-'+Math.floor( Math.random() * 1000000 ));
			if( this.findProjectIdxById(newId) === false ){
				// 重複がなければ成功
				return newId;
			}
		}
		return false;
	}

	/**
	 * プロジェクト情報を削除する
	 */
	this.removeProject = function(pjCd){
		pjCd = this.findProjectIdxById(pjCd);
		if(typeof(pjCd) != typeof(0)){
			return false;
		}

		var beforeLen = this.db.projects.length;
		this.db.projects.splice( pjCd, 1 );
		var afterLen = this.db.projects.length;

		return (beforeLen === (afterLen+1));
	}

	/**
	 * プロジェクトインスタンスを取得する
	 */
	this.project = function(pjCd, callback){
		callback = callback || function(){};
		pjCd = this.findProjectIdxById(pjCd);
		var pj = new Project(this, pjCd);
		return pj;
	}




	/**
	 * コマンドのパスを取得する
	 */
	this.getCommandPath = function(cmdName){
		var cmdPath = false;
		try {
			cmdPath = this.db.commands[cmdName];
		} catch (e) {
		}
		if( cmdPath === undefined ){
			return false;
		}
		return cmdPath;
	}

	/**
	 * コマンドのパスをセットする
	 */
	this.setCommandPath = function(cmdName, cmdPath){
		if( typeof(this.db.commands) !== typeof({}) ){
			this.db.commands = {};
		}
		try {
			if( cmdPath === null || cmdPath === undefined ){
				// 削除する場合
				this.db.commands[cmdName] = undefined;
				delete(this.db.commands[cmdName]);
				return true;
			}
			this.db.commands[cmdName] = require('path').resolve(cmdPath);
			return true;
		} catch (e) {
		}
		return false;
	}

	/**
	 * 外部アプリケーションのパスを取得する
	 */
	this.getAppPath = function(appName){
		var appPath = false;
		try {
			appPath = this.db.apps[appName];
		} catch (e) {
		}
		if( appPath === undefined ){
			return false;
		}
		return appPath;
	}

	/**
	 * 外部アプリケーションのパスをセットする
	 */
	this.setAppPath = function(appName, appPath){
		if( typeof(this.db.apps) !== typeof({}) ){
			this.db.apps = {};
		}
		try {
			if( appPath === null || appPath === undefined ){
				// 削除する場合
				this.db.apps[appName] = undefined;
				delete(this.db.apps[appName]);
				return true;
			}
			this.db.apps[appName] = utils79.trim(appPath);
			return true;
		} catch (e) {
		}
		return false;
	}

	/**
	 * ネットワーク設定を取得する
	 */
	this.getNetworkSetting = function(networkSettingName){
		var appPath = false;
		try {
			appPath = this.db.network[networkSettingName];
		} catch (e) {
		}
		if( appPath === undefined ){
			return false;
		}
		return appPath;
	}

	/**
	 * ネットワーク設定をセットする
	 */
	this.setNetworkSetting = function(networkSettingName, networkSetting){
		if( typeof(this.db.network) !== typeof({}) ){
			this.db.network = {};
		}
		try {
			if( networkSetting === null || networkSetting === undefined ){
				// 削除する場合
				this.db.network[networkSettingName] = undefined;
				delete(this.db.network[networkSettingName]);
				return true;
			}
			if( typeof(networkSetting) != typeof({}) ){
				networkSetting = {};
			}
			this.db.network[networkSettingName] = networkSetting;
		} catch (e) {
			return false;
		}
		return true;
	}

	/**
	 * 自然言語設定を取得する
	 */
	this.getLanguage = function(){
		if( !this.db.language ){
			return 'en';//デフォルト
		}
		return this.db.language;
	}

	/**
	 * 自然言語設定をセットする
	 */
	this.setLanguage = function(language){
		if( typeof(language) != typeof('') ){
			return false;
		}
		if( !language.length ){
			return false;
		}
		this.db.language = utils79.trim(language);
		return true;
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
