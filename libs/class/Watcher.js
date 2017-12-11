/**
 * class/Watcher.js
 */
module.exports = function(px2dtLDA){
	var watcher;
	var eventBuffer = [];
	var eventFlushTimer;

	/**
	 * ファイルの書き込み監視を開始する
	 */
	this.start = function(){
		this.stop();
		try {
			watcher = require('fs').watch(
				px2dtLDA.pathDataDir,
				{
					"recursive": true
				},
				function(e, filename) {
					clearTimeout(eventFlushTimer);
					eventBuffer.push({
						'event': e,
						'filename': filename
					});
					eventFlushTimer = setTimeout(function(){
						var updateEvents = JSON.parse(JSON.stringify(eventBuffer));
						eventBuffer = [];
						px2dtLDA.load(function(db){
							px2dtLDA.options.updated(updateEvents); // callback
						});
					}, 100);
				}
			);
		} catch (e) {
		}
		return;
	}

	/**
	 * ファイルの書き込み監視を停止する
	 */
	this.stop = function(){
		try {
			watcher.close();
		} catch (e) {
		}
		return;
	}

};
