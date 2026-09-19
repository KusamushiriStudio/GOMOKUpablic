# TRIAD iOS: WindowsからMac miniへの引き継ぎ

## 完了条件

- Mac miniでUnity `6000.3.24f1`を使用する。
- iOS Build SupportとXcodeを導入する。
- Windowsと同じGitコミットからUnityテストを再実行する。
- iOS事前検査が`Ready=True`になる。
- `Build/iOS`へXcodeプロジェクトを書き出す。
- Xcodeで署名し、実機で起動確認する。

## Windows側

1. 変更をコミットしてGitHubへpushする。
2. `Library`、`Temp`、`Logs`、`UserSettings`、`Build`は引き継がない。
3. 使用したブランチ名とコミットSHAをMac担当へ伝える。

## Mac mini側の初回準備

1. Unity HubでUnity `6000.3.24f1`と`iOS Build Support`を導入する。
2. Xcodeを導入して一度起動し、追加コンポーネントとライセンスを処理する。
3. リポジトリをcloneし、Windowsから指定されたブランチをcheckoutする。
4. Unityでプロジェクトを開き、パッケージの復元とコンパイルを完了させる。
5. EditMode、PlayMode、`TRIAD/Asset Test/Print Readiness`を実行する。

## iOS事前検査とXcode書き出し

次の値はリポジトリへ固定せず、Macのシェル環境から渡す。

```bash
export TRIAD_IOS_BUNDLE_ID="com.example.triad"
export TRIAD_IOS_PRODUCT_NAME="TRIAD"
export TRIAD_IOS_COMPANY_NAME="YourCompany"
export TRIAD_IOS_BUILD_NUMBER="1"
```

上記の例は仮値である。Apple Developerの登録内容と正式名称が決まってから置き換える。

事前検査のみ実行する。

```bash
./tools/unity/macos-ios-gate.sh --validate-only
```

検査に合格したらXcodeプロジェクトを書き出す。

```bash
./tools/unity/macos-ios-gate.sh
```

Unityの場所が標準と異なる場合は、`UNITY_EDITOR`で実行ファイルを指定する。出力先を変更する場合は`TRIAD_IOS_OUTPUT`を使う。

## Xcode側

1. `Build/iOS/Unity-iPhone.xcodeproj`を開く。
2. Signing & CapabilitiesでApple TeamとProvisioning Profileを設定する。
3. 接続したiPhoneを選択してBuild and Runを実行する。
4. 起動、盤面表示、入力、主要ルール、端末回転、復帰動作を確認する。
5. App Store提出時は正式なBundle ID、バージョン、Build番号、アイコン、Privacy Manifestを再確認する。

## 引き継ぎ後の確認

- Unityを開いただけで追跡ファイルが変更されていないことを`git status --short`で確認する。
- Xcode生成物や署名ファイルをGitへ追加しない。
- 証明書、秘密鍵、Provisioning Profile、Apple認証情報をチャットやGitへ貼らない。
