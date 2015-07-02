var assert = require('assert');
var path = require('path');
var fs = require('fs');
var phpjs = require('phpjs');
var rmdir = require('rmdir');
var _baseDir = __dirname+'/stub_datadir/px2dt/';

function dataClean( cb ){
	cb = cb || function(){};
	if( fs.existsSync(_baseDir) ){
		rmdir( _baseDir, function(){
			cb(!fs.existsSync(_baseDir));
		} );
	}else{
		cb(!fs.existsSync(_baseDir));
	}
	return;
}

describe('データディレクトリを初期化するテスト', function() {
	var px2dtLDA = require('../libs/main.js').create(_baseDir, {});

	it("テストデータを初期化", function(done) {
		dataClean(function(result){
			assert.ok( result );
			done();
		});
	});


	it("ディレクトリを初期化", function(done) {
		px2dtLDA.initDataDir(function(result){
			assert.ok( result );
			assert.ok( fs.existsSync(_baseDir) );
			done();
		});
	});

	it("db.json を保存", function(done) {
		px2dtLDA.save(function(result){
			assert.ok( result );
			assert.ok( fs.existsSync(_baseDir+'db.json') );
			var db = require(_baseDir+'db.json');
			assert.ok( typeof(db) === typeof({}) );
			done();
		});
	});
});

describe('プロジェクト情報の入出力', function() {
	var px2dtLDA = require('../libs/main.js').create(_baseDir, {});

	it("プロジェクト情報を追加するテスト", function(done) {
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
		px2dtLDA.getProject(
			0,
			function(result){
				assert.equal( result.name, "TestProject1" );
				assert.equal( result.entry_script, ".px_execute.php" );
				done();
			}
		);
	});

	it("プロジェクト情報を削除するテスト", function(done) {
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

describe('テスト後にデータディレクトリを削除する', function() {
	var px2dtLDA = require('../libs/main.js').create(_baseDir, {});

	it("テスト後の後始末", function(done) {
		dataClean(function(result){
			assert.ok( result );
			assert.ok( !fs.existsSync(_baseDir+'db.json') );
			assert.ok( !fs.existsSync(_baseDir) );
			done();
		});

	});

});

