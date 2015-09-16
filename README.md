# tomk79/node-px2dt-localdata-access

## インストール - Install

```bash
$ npm install px2dt-localdata-access --save
```


## 使い方 - Usage

```js
var px2dtLDA = require('px2dt-localdata-access').create('/path/to/data_directory/');

// プロジェクト情報を追加
px2dtLDA.addProject(
	{
		"name":"Your Project Name",
		"path":"/path/to/your/project/",
		"entry_script":".px_execute.php"
	} ,
	function(pjCd){
		console.log(pjCd);
	}
);

// プロジェクト情報を取得
px2dtLDA.getProject(
	0,
	function(pjInfo){
		console.log(pjInfo);
	}
);

// 全プロジェクト情報を取得
px2dtLDA.getProjectAll(
	function(pjList){
		console.log(pjList);
	}
);

// プロジェクト情報を削除
px2dtLDA.removeProject(
	0,
	function(result){
		console.log(result);
	}
);

// プロジェクトの変更を保存する
px2dtLDA.save(
	function(result){
		console.log(result);
	}
);

// データを取得する
px2dtLDA.getData(
	function(db){
		console.log(db);
	}
);

// ログ情報を追記する
px2dtLDA.log('test log message.');

```

## オプション - Options

```js
var px2dtLDA = require('px2dt-localdata-access')
	.create(
		'/path/to/data_directory/',
		{
			"path_php": "/path/to/php" // PHPコマンドのパス
			"path_php_ini": "/path/to/php.ini" // php.iniのパス
			"path_extension_dir": "/path/to/ext" // extension_dirのパス
		}
	)
;
```
