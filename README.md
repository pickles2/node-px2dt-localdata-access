# px2dt-localdata-access

`px2dt-localdata-access` は、 Pickles 2 のデスクトップアプリケーションに共通する機能を提供します。


## インストール - Install

```bash
$ npm install px2dt-localdata-access --save
```


## 使い方 - Usage

```js
var Px2DtLDA = require('px2dt-localdata-access'),
	px2dtLDA = new Px2DtLDA('/path/to/data_directory/');

// データディレクトリを初期化
px2dtLDA.initDataDir(
	function(result){
		console.log(result);
	}
);

// ファイルからデータを読み込む
px2dtLDA.load(function(db){
	console.log(db);
});

// プロジェクト情報を追加
var projectIndexNumber = px2dtLDA.addProject({
	"name":"Your Project Name",
	"path":"/path/to/your/project/",
	"entry_script":".px_execute.php"
});

// プロジェクト情報を取得
var pjInfo = px2dtLDA.getProject(
	0 // <- projectIndexNumber or ProjectID
);

// 全プロジェクトインスタンスを取得
var pjList = px2dtLDA.getProjectAll();

// プロジェクトインスタンスを取得
var pjInstance = px2dtLDA.project(
	0 // <- projectIndexNumber or ProjectID
);

// プロジェクト情報を削除
var result = px2dtLDA.removeProject(
	0 // <- projectIndexNumber or ProjectID
);

// db.json 内の全てのデータをそのまま取得する
var db = px2dtLDA.getData();

// db.json 内の全てのデータをそのまま受け取って置き換える
var result = px2dtLDA.setData(
	{ /* 更新データ全体 */ }
);

// データディレクトリのパスを取得する
var pathDataDir = px2dtLDA.getPathDataDir();

// プロジェクトの変更を保存する
px2dtLDA.save(
	function(result){
		console.log(result);
	}
);

// ログ情報を追記する
px2dtLDA.log('test log message.');

```

## 初期化オプション - Initialize Options

```js
var Px2DtLDA = require('px2dt-localdata-access'),
	px2dtLDA = new Px2DtLDA(
		'/path/to/data_directory/', // データディレクトリのパス (required)
		{
			"path_php": "/path/to/php" // PHPコマンドのパス
			"path_php_ini": "/path/to/php.ini" // php.iniのパス
			"path_extension_dir": "/path/to/ext" // extension_dirのパス
		}
	);
```

## 扱うデータ仕様

### データ格納ディレクトリ

コンストラクタ第1引数に渡されたパスにデータを格納します。

### ファイルとディレクトリ構造

```
├ db.json
├ common_log.log
├ commands
│　└ composer
│　　　└ composer.phar
└ logs
　├ access-{YYYYMMDD}.log
　├ access-{YYYYMMDD}.log
　├ ・・・・
　└ access-{YYYYMMDD}.log
```

- `db.json` が主に設定情報を格納する本体です。
- `commands/` には、ツールが内部で呼び出すためのコマンド類を格納します。
- 汎用的なログ出力先として `common_log.log` があります。
- `logs/` には、プレビューサーバーのアクセスログなどその他特別なログが出力されます。

### `db.json` の構造定義

```json
{
 "commands": {
  "php": "/realpath/to/php",
  "git": "/realpath/to/git",
  "composer": "/realpath/to/composer.phar"
 },
 "apps": {
  "texteditor": "/realpath/to/textEditor.app",
  "texteditorForDir": "/realpath/to/textEditor.app"
 },
 "projects": [
  {
   "name": "Project Name 1",
   "path": "/realpath/to/project1/htdocs",
   "home_dir": "px-files/",
   "entry_script": ".px_execute.php",
   "extended":{
	   "key1":"value",
	   "key2":{
		   "key3":"value"
	   }
   }
  },
  {
   "name": "Project Name 2",
   "path": "/realpath/to/project2/htdocs",
   "home_dir": "px-files/",
   "entry_script": ".px_execute.php"
  },
  {
	  /* ・・・・・・ */
  },
  {
   "name": "Project Name N",
   "path": "/realpath/to/projectN/htdocs",
   "home_dir": "px-files/",
   "entry_script": ".px_execute.php"
  }
 ],
 "network": {
  "preview": {
   "port": "58080",
   "accessRestriction": "loopback"
  },
  "appserver": {
   "port": "58081"
  }
 },
 "language": "ja"
}
```
