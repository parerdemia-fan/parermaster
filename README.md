# パレ学マスター

## 必要なソフトウェア

- node 25以上
- husky
- pnpm

## ローカルでの起動方法

```shell
$ pnpm i
$ pnpm dev
```


## sw.js の自動更新フック

- **準備**: 依存をインストールし、husky を有効化します。

```shell
$ pnpm i
$ pnpm prepare
```

- **仕組み**: コミット前に `.husky/pre-commit` が `node scripts/update-sw-cache-name.js` を実行し、`public/sw.js` の `CACHE_NAME` を `game-vYYYYMMDDHHMM` 形式のタイムスタンプに更新して自動で `git add` します。

- **テスト**: 変更を作って `git commit -m "test"` を実行すると、pre-commit で `sw.js` が更新されコミットに含まれま