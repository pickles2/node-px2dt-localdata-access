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

describe('データディレクトリを初期化するテスト', function() {

	it("ディレクトリを初期化", function(done) {
		this.timeout(90000);

		// px2dtLDAをリロード
		px2dtLDA = new Px2DtLDA(_baseDir, {
			"updated": function(updatedEvents){
				console.log('Data dir update watcher:', updatedEvents);
			}
		});
		px2dtLDA.initDataDir(function(result){
			assert.ok( result );
			assert.ok( utils79.is_dir(_baseDir) );
			assert.ok( utils79.is_file(_baseDir+'/db.json') );
			assert.ok( utils79.is_file(_baseDir+'/commands/composer/composer.phar') );
			done();
		});
	});

});

describe('外部アプリケーションの実行', function() {

	it("外部アプリケーションの実行", function(done) {
		this.timeout(90000);

		px2dtLDA.setAppPath('texteditorForDir', '/Applications/Atom.app');
		var childproc = px2dtLDA.startApp('texteditorForDir', {'PATH': __dirname});
		assert.strictEqual( typeof(childproc), typeof({}) );
		assert.strictEqual( typeof(childproc.pid), typeof(0) );

		px2dtLDA.setAppPath('texteditorForDir', 'echo $PATH; echo test3');
		var childproc = px2dtLDA.startApp('texteditorForDir', {'PATH': 'test2'});
		assert.strictEqual( typeof(childproc), typeof({}) );
		assert.strictEqual( typeof(childproc.pid), typeof(0) );
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
