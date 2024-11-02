## 12.24Q4.1
 - BREAKING: 外部MediaProxyのサポートを削除
    * プロキシ済みURLがDBに格納される、セキュリティ上の問題があるなど、複数の不具合を引き起こしていたため削除
 - SECURITY FIX: 内臓のMediaProxyを使う際はtokenを必須にする
    * これにより複数のセキュリティ上の問題と脆弱性が緩和されます。速やかなアップデートをお勧めします。
 - Feat: 非ログイン状態ではリモートユーザーの情報を閲覧できないように
 - Privacy: フォロー関係の閲覧にクレデンシャルを必須にする
 - Feat: Support Node22
    * DockerイメージでもNode22を使用するようになりました
 - Chart: Fix query error
 - Update deps

## 12.24Q3.2
 - Fix: サーバーメトリクスのメモリ使用量が不正確に表示される問題を修正
 - Update deps

## 12.24Q3.1
 - BREAKING: クラスタリングしないようにする
   * `clusterLimit`を設定で指定しても効かなくなりました。デフォルトで運用している場合の影響はほぼありません。
   * ロードバランシングしたい場合はK8Sを使うなどしてください
   * メモリ使用量がかなり削減されました
 - BREAKING: syslogのサポートを削除
 - Security: /api/server-infoをクレデンシャル必須に変更
 - Docker使用時のメモリ使用量を削減
   * npmが呼び出したnpmが本体のプロセスを呼び出していたのを修正
   * `npm run`を[npmrun](https://github.com/nexryai/npmrun)に置き換え
 - Dockerコンテナのイメージサイズを削減
 - サーバーメトリクスで見れる情報を減らしてsysteminformationを削除
   * CPUとメモリ情報以外見れないようにする
   * systeminformationがexecSyncなどのパフォーマンスに悪影響を及ぼす関数を使っているため・必要以上に詳細な情報が見れるのはセキュリティ的によくないため
   * 現在使用しているメモリ量は`/proc/meminfo`から取得するようになりました。このファイルが存在しないLinux以外のOS使用時は、メモリ使用量として現在のNodeプロセスが使用しているメモリの量をサーバーメトリクスに表示します。
 - Fix: コントロールパネルがモバイル端末で正常に表示されない問題を修正
 - Fix: インスタンス情報の壊れていたチャートを削除
 - Client: /admin/overviewの表示を改善
 - Update deps

## 12.24Q2.6
 - コントロールパネルが開けない問題を修正
 - Update deps
   * **複数の脆弱な依存関係の更新を含む**

## 12.24Q2.5
 - BREAKING: Remove AiScript related components and pages
   * 昨年12月リリースのバージョン以来壊れていたので影響は少ないと思います
 - Revert "Client: カスタム絵文字のフォールバックを改善"
   * 画像にフォールバックするのがよろしくないシーンがあるため
 - Update deps

## 12.24Q2.4
 - Security: `/assets`などの静的ファイルをサーブするパスに存在しないファイルへの要求を出した時に、要求されたファイルの（バックエンド本体のインストールパス下の）絶対パスが漏洩する問題を修正
   * 直接的な被害はありませんが、潜在的に攻撃に利用される可能性があるため漏洩しない方がいい情報であることは確実です。
   * `/home`下に設置しているなどの場合には、本体を動かしているユーザー名まで推測される可能性があります。
 - `/assets`下でハンドルされる拡張子を制限するように
 - Client: カスタム絵文字のフォールバックを改善

## 12.24Q2.3
 - Client: ジョブキュー管理画面の多言語化
 - Feat: bull-boardやめる
   * 12.24Q2.1で行った変更と表面上の差はありませんが、内部的にbull-boardを使わないように変更されています
 - Fix: Federation: ActivityPubのcontextに別フォーク由来の項目が含まれているのを修正
 - Update deps

## 12.24Q2.2
 - URGENT SECURITY FIX: Hotfix of GHSA-2vxv-pv3m-3wvj
 - backend: Add ignoreApForwarded option

## 12.24Q2.1
 - SECURITY FIX: Bullダッシュボードを基本的には使用できないようにする
    * Bullダッシュボードのヘッダーの問題を修正
    * 脆弱性の元となるので基本的にはアクセスできないようにする
    * ジョブの再試行はコントロールパネルのボタンから行えます
    * 今後もし必要となる機能があったとかになれば順次実装します

## 12.24Q1.4
 - URGENT SECURITY FIX: AP取得のチェックの修正
 - Update deps

## 12.24Q1.3
 - Fix: apply word mutes in notifications
 - Refactor: Remove unused imports
 - Update vulnerable dependencies

## 12.24Q1.2
 - SECURITY FIX: Fix and Validate AP Content-Type (GHSA-qqrm-9grj-6v32)
 - Update deps

## 12.24Q1.1
 - Client: エントランスUIの改修
   * 背景未設定でもいい感じのデザインになるようにした
 - Fix: 弱すぎるパスワードは登録できないようにする
 - Fix: ブロックされてるドメインのメールアドレスでも登録できるように見えてしまう問題を修正
 - Backend: 補助的なPermissions-PolicyとCSPを設定
   * CSPはそのうちまともにしたい
 - sw: オフラインの警告はService Workerからは出さないようにする
   * ブラウザの警告の方がローカライズされていて詳細も出るので分かりやすいため
 - Fix: 標準でテーマ名が虚無になる問題を修正
 - 依存関係のアップデート
   * Vueを3.4にアップデート
 - v12-LTSの一部更新の取り込み
   * ノート編集の受信に対応しました

## 12.23Q4.8
 - セキュリティの観点からadmin streamingを廃止
 - Fix: Botチャレンジを有効にしてもインジケーターが赤いままになる問題を修正

## 12.23Q4.7
 - Security: Update multer to 1.4.5-lts.1 and fix CVE-2022-24434 ("Crash in HeaderParser in dicer") alert
 - Fix: エラー発生時にバックエンドの情報が漏洩する問題を修正
 - Client: ダイアログのUIを調整
 - Client: 各種ページのアイコンの調整
 - Client: refactor and improve mute-block setting ui
 - Client: セキュリティキーのサポートを一旦廃止
   * 新たな登録ができなくなります
 - Client: admin/security で設定状況を視覚的にわかりやすく
 - 依存関係の更新

### Note
個人的な事情により、恐らくこのバージョンかこの次のバージョンをリリースしたあと2月中旬〜下旬頃まで脆弱性の修正やPRのマージを除きしばらくリリースはできません。
AiScriptのバグもしばらく修正できる見込みがありません。ご迷惑をおかけしますがよろしくお願いします。

## 12.23Q4.6
 - 12.23Q4.5でのHotfixの修正漏れ箇所の修正
 - Fix (Client): ti-question-circle >> ti-help

## 12.23Q4.5
 - Security Hotfix: 管理者用APIのアクセス権限が適切に設定されていない問題を修正
   * Appは管理者/モデレータ権限を使えないように
 - fix: Filter featured collection
 - 依存関係の更新

## 12.23Q4.4
 - Backend: deep-email-validatorをdevmehq/email-validator-jsで置き換えより高精度で捨てアド判定ができるように
 - Feat: arm64のDockerコンテナを利用可能に
 - Fix: 画像のクロップが永遠に終わらない問題を修正
 - Fix (Client): ActiveEmailValidationの設定がコントロールパネルに表示されない問題を修正

### 既知の問題
 - page等でAiScriptが動作しない問題 (#531) がありますが、原因が分からずこのバージョンでの修正は実現しませんでした。

## 12.23Q4.3
 - 依存関係の更新
 - gulpやめる
 - docker-compose.ymlの修正

## 12.23Q4.2
 - 独自のPull-To-Refreshをやめる
   * ブラウザのやつのほうが確実なので
 - リモートユーザーのページで不正確なチャートやステータスを表示しないようにする
 - アンテナのページの右上のアイコンがおかしいのを修正
 - gulp-cssnanoやめる
 - photoswipeの背景のぼかしがおかしいのを修正

## 12.23Q4.1
 - BREAKING: nodeinfoでのソフトウェア名をnexkeyに変更
 - BREAKING: Node16のサポートを終了
   * Node16を切る依存関係が増えてきたためバージョニングが変わるこのタイミングで切りたい
 - バージョニング方式の変更（[メジャーバージョン].[リリース時期（西暦下2桁+四半期Q1~Q4）].[マイナーバージョン]）
 - Pull-to-refreshの実装
 - inboxの署名検証を強化
 - inboxへのPOSTのサイズ制限を64kbに設定
 - nexryaid使用時にタイムラインのソートがぶっ壊れる問題を修正
 - エントランスUIの改修
 - UIの軽微な修正
 - 依存関係のアップデート
 - 新MFMのrubyとunixtimeに受信のみ対応 
   * 現状の実装では連合先に正しく送信できないので受信専用の扱い 

## 12.122.2
- ⚠ SECURITY FIX: アップストリームの脆弱性(GHSA-3f39-6537-3cgc)の臨時修正

## 12.122.1
 - 12.119.2-fix.6.0のマージ
 - MFMで使う検索エンジンを選べるようにする by @scil-t
 - 斬新で革新的なID生成ロジックであるnexryaidを実装 by @scil-t
 - 一部のv13 MFMへの対応
 - UIの改善
 - 依存関係のアップデート

## 12.122.0
 - BREAKING: アカウント連携とグループの廃止
 - node20のサポート
 - v12-ltsのアップデートの取り込み
 - 問題があった変更のrevert
 - 各種不具合修正とUIの調整
 - 依存関係のアップデート

## 12.121.9
 - SECURITY FIX: bullのダッシュボードの認証が回避できる問題の修正

## 12.121.8
 - Backend: Add onlyQueueProcessor mode and disableQueueProcessor mode
 - Tweak UI

## 12.121.7
 - 攻撃されやすそうなエンドポイントはログインしないと叩けないように
 - リードレプリカのサポート
 - unzipperやめる by @y-c-a

## 12.121.6
 - 配信モード中は機密情報を含むページを開けないように
 - ミュート関係の設定のUIの統合
 - カスタム絵文字な画像をドライブから消せない仕様の復活
 - オンラインユーザー数をナビゲーションバーに表示するか選べるように
 - ソフトミュートされたときにメッセージを表示するか選べるように
 - ブロックしているインスタンスを外部に公開しないように

## 12.121.5
 - 配信モード実装
 - リアクションミュートを実装
 - ダイアログのUIをnexryaiの好みな感じに
 - ドライブからファイルを消せないバグを修正

## 12.121.4
 - ベースの v12 LTS の更新

## 12.121.3
 - 依存関係の更新
 - DockerイメージをAlpineベースに

## 12.121.2
 - パスワードハッシュをargon2に
 - Turnstile対応
 - ナビゲーションバー周りの調整

## 12.121.1
 - UIの修正

## 12.121.0
 - リノートのミュート機能を実装
 - インスタンスミュートの仕様を改善
 - フォローリクエストのUIをv13仕様に
 - サーバーから切断されたときの表示を改善
 - インスタンスティッカーの不具合を修正
 - コントロールパネルと設定画面の不具合修正と微調整
 - 検索を見つけるに統合
 - ナビゲーションバーにオンラインユーザーを表示する
 - タイムライン表示のパフォーマンス改善

## 12.120.0
 - NSFWの自動検出を削除
 - 脆弱性のある依存関係の更新
 - エントランスUI改修
 - Sonic検索のサポート
 - 過去投稿をインデックスする機能
