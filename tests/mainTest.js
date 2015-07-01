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

	it("テスト後の後始末", function(done) {
		dataClean(function(result){
			assert.ok( result );
			assert.ok( !fs.existsSync(_baseDir+'db.json') );
			assert.ok( !fs.existsSync(_baseDir) );
			done();
		});

	});

});

