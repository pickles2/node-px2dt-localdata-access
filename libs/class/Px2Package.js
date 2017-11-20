/**
 * class/Px2Package.js
 */
module.exports = function(px2dtLDA, pj){
	var Promise = require("es6-promise").Promise;
	var utils79 = require('utils79');
	var fs = require('fs');

	var realpathEntryScript = pj.getRealpathEntryScript();
	var realpathComposerJson,
		composerJson;

	(function(){
		var tmpPath = realpathEntryScript;
		while(1){
			tmpPath = utils79.dirname(tmpPath);
			if(utils79.is_file(tmpPath+'/composer.json')){
				realpathComposerJson = tmpPath+'/composer.json';
				try {
					var json = fs.readFileSync(realpathComposerJson).toString();
					composerJson = JSON.parse(json);
				} catch (e) {
				}
				break;
			}
			if(utils79.dirname(tmpPath) == tmpPath){
				realpathComposerJson = false;
				composerJson = false;
				break;
			}
		}
		return;
	})();
	// console.log(realpathEntryScript, realpathComposerJson, composerJson);


	/**
	 * px2package info を取得する
	 */
	this.get = function(){
		var rtn = false;
		try {
			if( typeof(composerJson.extra.px2package) == typeof([]) && composerJson.extra.px2package[0] ){
				rtn = composerJson.extra.px2package;
			}else{
				rtn = [composerJson.extra.px2package];
			}
		} catch (e) {
		}
		return rtn;
	}

	/**
	 * 筆頭のプロジェクト情報を取得する
	 */
	this.getPrimaryProject = function(){
		var px2pkg = this.get();
		if( px2pkg === false ){
			return false;
		}
		for( var idx in px2pkg ){
			if(px2pkg[idx].type == 'project'){
				rtn = px2pkg[idx];
				break;
			}
		}
		return rtn;
	}

};
