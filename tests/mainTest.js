var assert = require('assert');
var path = require('path');
var fs = require('fs');
var phpjs = require('phpjs');
var utils79 = require('utils79');
var rmdir = require('rmdir');
var _baseDir = __dirname+'/stub_datadir/px2dt/';
var Promise = require("es6-promise").Promise;
var DIRECTORY_SEPARATOR = (process.platform=='win32'?'\\':'/');
var Px2DtLDA = require('../libs/main.js'),
	px2dtLDA;

function dataClean( callback ){
	callback = callback || function(){};
	// callback(true);return;

	if( fs.existsSync(_baseDir) ){
		rmdir( _baseDir, function(){
			callback(!fs.existsSync(_baseDir));
		} );
	}else{
		callback(!fs.existsSync(_baseDir));
	}
	return;
}

describe('データディレクトリを一旦削除するテスト', function() {
	it("テストデータを初期化", function(done) {
		this.timeout(10000);
		dataClean(function(result){
			assert.ok( result );

			// px2dtLDAをリロード
			px2dtLDA = new Px2DtLDA(_baseDir, {
				"updated": function(updatedEvents){
					console.log('Data dir update watcher:', updatedEvents);
				}
			});

			setTimeout(done, 500);
		});
	});
});

describe('データディレクトリを初期化するテスト', function() {

	it("ディレクトリを初期化", function(done) {
		this.timeout(90000);

		px2dtLDA.initDataDir(function(result){
			assert.ok( result );
			assert.ok( utils79.is_dir(_baseDir) );
			assert.ok( utils79.is_file(_baseDir+'/db.json') );
			assert.ok( utils79.is_file(_baseDir+'/commands/composer/composer.phar') );
			assert.ok( utils79.is_dir(_baseDir+'/appdata/') );
			done();
		});
	});

});

describe('ファイルとディレクトリの存在確認テスト', function() {

	it("ファイル", function(done) {
		this.timeout(3000);

		assert.strictEqual( utils79.is_file(__dirname+'/stub_datadir/'), false );
		assert.strictEqual( utils79.is_file(__dirname+'/stub_datadir/.gitkeep'), true );
		assert.strictEqual( utils79.is_file(__dirname+'/stub_datadir/notExists.txt'), false );
		done();
	});

	it("ディレクトリ", function(done) {
		this.timeout(3000);

		assert.strictEqual( utils79.is_dir(__dirname+'/stub_datadir/'), true );
		assert.strictEqual( utils79.is_dir(__dirname+'/stub_datadir/.gitkeep'), false );
		assert.strictEqual( utils79.is_dir(__dirname+'/stub_datadir/notExists.txt'), false );
		done();
	});

});

describe('アプリケーションデータディレクトリの取得', function() {

	it("取得", function(done) {
		this.timeout(3000);

		var appdir = px2dtLDA.getAppDataDir('testApp');
		// console.log(appdir);
		assert.strictEqual( utils79.is_dir(appdir), true );

		var appdir = px2dtLDA.getAppDataDir('testSlashed/マルチバイト文字列');
		// console.log(appdir);
		assert.strictEqual( utils79.is_dir(appdir), true );
		done();
	});

});

describe('コマンドパスの入出力', function() {

	it("コマンドパスの入出力", function(done) {

		var result = px2dtLDA.getCommandPath('composer');
		// console.log(result);
		assert.ok( utils79.is_file(result) );
		done();

	});

	it("設定のないコマンドパス", function(done) {

		var result = px2dtLDA.getCommandPath('undefined');
		// console.log(result);
		assert.strictEqual( result, false );
		done();

	});

});

describe('外部アプリケーションのパスの入出力', function() {

	it("外部アプリケーションのパスの入出力", function(done) {

		var result = px2dtLDA.getAppPath('texteditor');
		// console.log(result);
		assert.strictEqual( typeof(result), typeof('') );

		var result = px2dtLDA.setAppPath('texteditor', '/path/to/Editor.app');
		assert.strictEqual( result, true );

		var result = px2dtLDA.getAppPath('texteditor');
		// console.log(result);
		assert.strictEqual( result, '/path/to/Editor.app' );

		done();

	});

});

describe('自然言語設定の入出力', function() {

	it("自然言語設定の入出力", function(done) {

		var result = px2dtLDA.getLanguage();
		// console.log(result);
		assert.strictEqual( result, 'en' );

		var result = px2dtLDA.setLanguage('en-US');
		assert.strictEqual( result, true );

		var result = px2dtLDA.getLanguage();
		// console.log(result);
		assert.strictEqual( result, 'en-US' );

		px2dtLDA.setLanguage('en');
		var result = px2dtLDA.getLanguage();
		// console.log(result);
		assert.strictEqual( result, 'en' );

		done();

	});

});

describe('プロジェクト情報の入出力', function() {

	it("プロジェクト情報を追加するテスト", function(done) {

		var pjCd = px2dtLDA.addProject({
			"name":"TestProject2",
			"path":__dirname+'/stub_datadir/htdocs2/',
			'entry_script':'.px_execute.php'
		});
		assert.strictEqual( pjCd, 0 );

		var pjCd = px2dtLDA.addProject(
			{
				"name":"TestProject1",
				"path":__dirname+'/stub_datadir/htdocs1/',
				'entry_script':'.px_execute.php'
			}
		);
		assert.strictEqual( pjCd, 0 );

		var pjCd = px2dtLDA.addProject(
			{
				"name":"TestProject3",
				"path":__dirname+'/stub_datadir/htdocs3/',
				'entry_script':'.px_execute.php',
				'undefined_key_1': 'value_1',
				'undefined_key_2': 'value_2',
				'undefined_key_3': 'value_3'
			}
		);
		assert.strictEqual( pjCd, 2 );

		var pj = px2dtLDA.project(pjCd);
		assert.strictEqual( pj.get().undefined_key_1, undefined );
		assert.strictEqual( pj.get().undefined_key_2, undefined );
		assert.strictEqual( pj.get().undefined_key_3, undefined );
		assert.strictEqual( pj.get().undefined_key_4, undefined );

		// --------------------------------------
		// 必要な情報が入力されていないことによる失敗例
		var pjCd = px2dtLDA.addProject(
			{
				"name":"TestProject3",
				'entry_script':'.px_execute.php'
			}
		);
		assert.strictEqual( pjCd, false );

		done();

	});

	it("プロジェクト情報の一覧を取得するテスト", function(done) {

		var result = px2dtLDA.getProjectAll();

		assert.equal( result[0].get().name, "TestProject1" );
		assert.equal( result[0].get().entry_script, ".px_execute.php" );
		assert.equal( result[1].get().name, "TestProject2" );
		assert.equal( result[1].get().entry_script, ".px_execute.php" );
		done();

	});

	it("プロジェクト情報を取得するテスト", function(done) {

		var pjInfo = px2dtLDA.getProject(0);
		// console.log(pj);
		// console.log(pjInfo);
		assert.equal( pjInfo.name, "TestProject1" );
		assert.equal( pjInfo.entry_script, ".px_execute.php" );
		done();

	});

	it("プロジェクト情報をIDで取得するテスト", function(done) {

		var pjInfo1 = px2dtLDA.getProject(0);
		var pjInfo2 = px2dtLDA.getProject(pjInfo1.id);
		assert.equal( typeof(pjInfo1.id), typeof('') );
		assert.equal( pjInfo1.id, pjInfo2.id );
		done();

	});

	it("プロジェクトインスタンスを取得するテスト", function(done) {

		var pj = px2dtLDA.project(0);
		assert.equal( pj.get().name, "TestProject1" );
		assert.equal( pj.get().entry_script, ".px_execute.php" );
		done();

	});

	it("プロジェクトインスタンスをIDで取得するテスト", function(done) {

		var pj1 = px2dtLDA.project(0);
		var pj2 = px2dtLDA.project(pj1.get().id);
		assert.equal( typeof(pj1.get().id), typeof('') );
		assert.equal( pj1.get().id, pj2.get().id );
		done();

	});

	it("px2packageインスタンスを取得するテスト (未定義の場合)", function(done) {

		var px2package = px2dtLDA.project(0).px2package();
		assert.equal( typeof(px2package), typeof({}) );
		assert.strictEqual( px2package.get(), false );
		done();

	});

	it("プロジェクトインスタンスからプロジェクト情報を更新するテスト", function(done) {

		var pj = px2dtLDA.project(0);

		// プロジェクト名
		assert.equal( pj.get().name, "TestProject1" );
		assert.equal( pj.getName(), pj.get().name );
		assert.equal( pj.setName("TestProject1-change1"), true );
		assert.equal( pj.getName(), "TestProject1-change1" );

		// パス
		assert.equal( pj.get().path, require('path').resolve(__dirname+'/stub_datadir/htdocs1/') );
		assert.equal( pj.getPath(), pj.get().path );

		// Entry Script
		assert.equal( pj.get().entry_script, ".px_execute.php" );
		assert.equal( pj.getEntryScript(), pj.get().entry_script );

		// Entry Script (realpath)
		var realpathEntryScript = pj.getRealpathEntryScript();
		// console.log(realpathEntryScript);
		assert.equal( realpathEntryScript, require('path').resolve(pj.getPath() + '/' + pj.getEntryScript()) );

		done();

	});

	it("プロジェクトインスタンスからプロジェクト拡張情報を更新するテスト", function(done) {

		var pj = px2dtLDA.project(1);

		assert.strictEqual( pj.getExtendedData('test4'), undefined );

		assert.ok( pj.setExtendedData('test1', 'testVal1') );
		assert.equal( pj.getExtendedData('test1'), 'testVal1' );

		assert.ok( pj.setExtendedData('test2', {'val2': 'testVal2'}) );
		assert.equal( pj.getExtendedData('test2').val2, 'testVal2' );

		assert.ok( pj.setExtendedData('test3', {'val2': 'testVal2'}) );
		assert.ok( pj.setExtendedData('test3', undefined) );
		assert.strictEqual( pj.getExtendedData('test3'), undefined );


		// console.log(px2dtLDA.getData());

		done();

	});

	it("データを取得するテスト", function(done) {

		var db = px2dtLDA.getData();
		assert.equal( typeof(db), typeof({}) );
		assert.equal( typeof(db.commands), typeof({}) );
		assert.equal( typeof(db.projects), typeof({}) );
		assert.equal( typeof(db.apps), typeof({}) );
		done();
	});

	it("データディレクトリのパスを取得するテスト", function(done) {

		var pathDataDir = px2dtLDA.getPathDataDir();
		// console.log( pathDataDir );
		assert.equal( path.resolve(__dirname, 'stub_datadir/px2dt')+DIRECTORY_SEPARATOR, pathDataDir );
		done();
	});

	it("プロジェクト情報を削除するテスト", function(done) {

		var result = px2dtLDA.removeProject(0);
		assert.ok( result );

		var pjInfo = px2dtLDA.getProject(0);
		assert.equal( pjInfo.name, "TestProject2" );
		assert.equal( pjInfo.entry_script, ".px_execute.php" );
		done();

	});

});

describe('px2packageインスタンスを取得するテスト', function() {
	it("px2packageインスタンスを取得するテスト", function(done) {

		var pjCd = px2dtLDA.addProject({
			"name":"px2package Test",
			"path":__dirname+'/px2/standard/'
		});
		assert.strictEqual( pjCd, 0 );

		var px2package = px2dtLDA.project(0).px2package();
		assert.equal( typeof(px2package), typeof({}) );
		assert.strictEqual( px2package.get()[0].name, "px2dt-localdata-access test site" );
		assert.strictEqual( px2package.get()[0].type, "project" );
		assert.strictEqual( px2package.get()[0].path, ".px_execute.php" );
		assert.strictEqual( px2package.get()[0].path_homedir, "px-files/" );
		done();

	});

	it("プライマリのプロジェクトを取得するテスト", function(done) {

		var px2package = px2dtLDA.project(0).px2package();
		assert.strictEqual( px2package.getPrimaryProject().name, "px2dt-localdata-access test site" );
		assert.strictEqual( px2package.getPrimaryProject().type, "project" );
		assert.strictEqual( px2package.getPrimaryProject().path, ".px_execute.php" );
		assert.strictEqual( px2package.getPrimaryProject().path_homedir, "px-files/" );
		done();

	});

});


describe('データを保存するテスト', function() {
	it("db.json を保存", function(done) {

		px2dtLDA.save(function(result){
			assert.ok( result );
			assert.ok( utils79.is_file(_baseDir+'db.json') );
			assert.ok( !utils79.is_file(_baseDir+'db.json.tmp') );
			var db = JSON.parse(fs.readFileSync(_baseDir+'db.json').toString());
			assert.ok( typeof(db) === typeof({}) );
			setTimeout(function(){
				done();
			}, 500);
		});
	});
});


describe('ログ情報', function() {

	it("ログ情報を追記する", function(done) {

		px2dtLDA.log('test log 1');
		px2dtLDA.log('test log 2');
		px2dtLDA.log('test log 3');
		px2dtLDA.log('test log 4');

		// var logText = fs.readFileSync(_baseDir+'common_log.log').toString();
		// console.log(logText);

		assert.ok( utils79.is_file(_baseDir+'common_log.log') );
		setTimeout(function(){
			done();
		}, 500);
	});

});

describe('外部でデータが更新されたときに自動リロードするテスト', function() {
	it("自動リロード", function(done) {

		var pj = px2dtLDA.project(0);

		// プロジェクト名
		assert.equal( pj.get().name, "px2package Test" );
		assert.equal( pj.getName(), pj.get().name );
		assert.equal( pj.setName("TestProject1-change1"), true );
		assert.equal( pj.getName(), "TestProject1-change1" );

        // 外部プロセスが情報を書き換える
		var db = JSON.parse(fs.readFileSync(_baseDir+'db.json').toString());
		db.changedByOuterProcess = 'Changed by outer process';
		db.projects[0].name = 'Changed by outer process';
		fs.writeFileSync(_baseDir+'db.json', JSON.stringify(db, null, 2))

		setTimeout(function(){
			assert.equal( px2dtLDA.db.changedByOuterProcess, "Changed by outer process" );
			assert.equal( pj.get().name, "Changed by outer process" );
			assert.equal( pj.getName(), pj.get().name );
			done();
		}, 500);
	});
});

describe('データに問題がある場合のテスト', function() {
	it("composer.json の extra が存在するが空白の場合のテスト", function(done) {

		var pjCd = px2dtLDA.addProject({
			"name":"px2package empty extra Test",
			"path":__dirname+'/px2/empty_extra/'
		});
		assert.strictEqual( pjCd, 1 );

		var px2package = px2dtLDA.project(1).px2package();
		assert.equal( typeof(px2package), typeof({}) );
		assert.strictEqual( px2package.get(), false );
		done();

	});
});


describe('テスト後にデータディレクトリを削除する', function() {

	it("テスト後の後始末", function(done) {
		px2dtLDA.watcher.stop();
		dataClean(function(result){
			assert.ok( result );
			assert.ok( !utils79.is_file(_baseDir+'db.json') );
			assert.ok( !utils79.is_dir(_baseDir) );
			setTimeout(function(){
				done();
			}, 900);
		});

	});

});
