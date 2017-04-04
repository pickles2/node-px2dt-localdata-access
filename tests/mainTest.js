var assert = require('assert');
var path = require('path');
var fs = require('fs');
var phpjs = require('phpjs');
var rmdir = require('rmdir');
var _baseDir = __dirname+'/stub_datadir/px2dt/';
var Promise = require("es6-promise").Promise;
var DIRECTORY_SEPARATOR = (process.platform=='win32'?'\\':'/');
var Px2DtLDA = require('../libs/main.js');

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
		var px2dtLDA = new Px2DtLDA(_baseDir, {});
		px2dtLDA.initDataDir(function(result){
			assert.ok( result );
			assert.ok( fs.existsSync(_baseDir) );
			assert.ok( fs.existsSync(_baseDir+'/db.json') );
			assert.ok( fs.existsSync(_baseDir+'/commands/composer/composer.phar') );
			done();
		});
	});

});

describe('ファイルとディレクトリの存在確認テスト', function() {

	it("ファイル", function(done) {
		this.timeout(3000);
		var px2dtLDA = new Px2DtLDA(_baseDir, {});
		assert.strictEqual( px2dtLDA.is_file(__dirname+'/stub_datadir/'), false );
		assert.strictEqual( px2dtLDA.is_file(__dirname+'/stub_datadir/.gitkeep'), true );
		assert.strictEqual( px2dtLDA.is_file(__dirname+'/stub_datadir/notExists.txt'), false );
		done();
	});

	it("ディレクトリ", function(done) {
		this.timeout(3000);
		var px2dtLDA = new Px2DtLDA(_baseDir, {});
		assert.strictEqual( px2dtLDA.is_dir(__dirname+'/stub_datadir/'), true );
		assert.strictEqual( px2dtLDA.is_dir(__dirname+'/stub_datadir/.gitkeep'), false );
		assert.strictEqual( px2dtLDA.is_dir(__dirname+'/stub_datadir/notExists.txt'), false );
		done();
	});

});

describe('プロジェクト情報の入出力', function() {

	it("プロジェクト情報を追加するテスト", function(done) {
		var px2dtLDA = new Px2DtLDA(_baseDir, {});
		px2dtLDA.addProject(
			{
				"name":"TestProject2",
				"path":__dirname+'/stub_datadir/htdocs2/',
				'entry_script':'.px_execute.php'
			},
			function(pjCd){
				assert.strictEqual( pjCd, 0 );

				px2dtLDA.addProject(
					{
						"name":"TestProject1",
						"path":__dirname+'/stub_datadir/htdocs1/',
						'entry_script':'.px_execute.php'
					},
					function(pjCd){
						assert.strictEqual( pjCd, 0 );
						done();
					}
				);
			}
		);
	});

	it("プロジェクト情報の一覧を取得するテスト", function(done) {
		var px2dtLDA = new Px2DtLDA(_baseDir, {});
		px2dtLDA.getProjectAll(
			function(result){
				assert.equal( result[0].name, "TestProject1" );
				assert.equal( result[0].entry_script, ".px_execute.php" );
				assert.equal( result[1].name, "TestProject2" );
				assert.equal( result[1].entry_script, ".px_execute.php" );
				done();
			}
		);
	});

	it("プロジェクト情報を取得するテスト", function(done) {
		var px2dtLDA = new Px2DtLDA(_baseDir, {});
		px2dtLDA.getProject(
			0,
			function(result){
				assert.equal( result.name, "TestProject1" );
				assert.equal( result.entry_script, ".px_execute.php" );
				done();
			}
		);
	});

	it("データを取得するテスト", function(done) {
		var px2dtLDA = new Px2DtLDA(_baseDir, {});
		px2dtLDA.getData(
			function(db){
				// console.log(db);
				assert.equal( typeof(db), typeof({}) );
				assert.equal( typeof(db.commands), typeof({}) );
				assert.equal( typeof(db.projects), typeof({}) );
				assert.equal( typeof(db.apps), typeof({}) );
				done();
			}
		);
	});

	it("データディレクトリのパスを取得するテスト", function(done) {
		var px2dtLDA = new Px2DtLDA(_baseDir, {});
		var pathDataDir = px2dtLDA.getPathDataDir();
		// console.log( pathDataDir );
		assert.equal( path.resolve(__dirname, 'stub_datadir/px2dt')+DIRECTORY_SEPARATOR, pathDataDir );
		done();
	});

	it("プロジェクト情報を削除するテスト", function(done) {
		var px2dtLDA = new Px2DtLDA(_baseDir, {});
		px2dtLDA.removeProject(
			0,
			function(result){
				assert.ok( result );

				px2dtLDA.getProject(
					0,
					function(result){
						assert.equal( result.name, "TestProject2" );
						assert.equal( result.entry_script, ".px_execute.php" );
						done();
					}
				);
			}
		);
	});

});

describe('データを保存するテスト', function() {
	it("db.json を保存", function(done) {
		var px2dtLDA = new Px2DtLDA(_baseDir, {});
		px2dtLDA.save(function(result){
			assert.ok( result );
			assert.ok( fs.existsSync(_baseDir+'db.json') );
			var db = require(_baseDir+'db.json');
			assert.ok( typeof(db) === typeof({}) );
			done();
		});
	});
});

describe('ログ情報', function() {

	it("ログ情報を追記する", function(done) {
		var px2dtLDA = new Px2DtLDA(_baseDir, {});
		px2dtLDA.log('test log 1');
		px2dtLDA.log('test log 2');
		px2dtLDA.log('test log 3');
		px2dtLDA.log('test log 4');

		assert.ok( fs.existsSync(_baseDir+'common_log.log') );
		done();
	});

});

describe('テスト後にデータディレクトリを削除する', function() {
	var px2dtLDA = new Px2DtLDA(_baseDir, {});

	it("テスト後の後始末", function(done) {
		dataClean(function(result){
			assert.ok( result );
			assert.ok( !fs.existsSync(_baseDir+'db.json') );
			assert.ok( !fs.existsSync(_baseDir) );
			done();
		});

	});

});
