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
	px2dtLDA = new Px2DtLDA(_baseDir, {});

function dataClean( cb ){
	cb = cb || function(){};
	// cb(true);return;

	if( fs.existsSync(_baseDir) ){
		rmdir( _baseDir, function(){
			cb(!fs.existsSync(_baseDir));
		} );
	}else{
		cb(!fs.existsSync(_baseDir));
	}
	return;
}

describe('データディレクトリを一旦削除するテスト', function() {
	it("テストデータを初期化", function(done) {
		this.timeout(10000);
		dataClean(function(result){
			assert.ok( result );
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

	it("プロジェクトインスタンスを取得するテスト", function(done) {

		var pj = px2dtLDA.project(0);
		assert.equal( pj.get().name, "TestProject1" );
		assert.equal( pj.get().entry_script, ".px_execute.php" );
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

describe('データを保存するテスト', function() {
	it("db.json を保存", function(done) {

		px2dtLDA.save(function(result){
			assert.ok( result );
			assert.ok( utils79.is_file(_baseDir+'db.json') );
			assert.ok( !utils79.is_file(_baseDir+'db.json.tmp') );
			var db = JSON.parse(fs.readFileSync(_baseDir+'db.json').toString());
			assert.ok( typeof(db) === typeof({}) );
			done();
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
		done();
	});

});

describe('テスト後にデータディレクトリを削除する', function() {

	it("テスト後の後始末", function(done) {
		dataClean(function(result){
			assert.ok( result );
			assert.ok( !utils79.is_file(_baseDir+'db.json') );
			assert.ok( !utils79.is_dir(_baseDir) );
			done();
		});

	});

});
