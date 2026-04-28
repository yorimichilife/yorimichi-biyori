export const siteMapSections = [
  {
    title: "メインページ",
    description: "サービスの入口と公開導線です。",
    links: [
      { label: "トップページ", href: "/", status: "available" },
      { label: "公開ブログ一覧", href: "/blog", status: "available" },
      { label: "使い方", href: "/how-it-works", status: "available" },
      { label: "サイトマップ", href: "/site-map", status: "available" }
    ]
  },
  {
    title: "旅ノート管理",
    description: "ノートの作成、一覧、詳細、共有設定を扱います。",
    links: [
      { label: "旅ノート作成", href: "/notes/new", status: "available" },
      { label: "マイ旅ノート一覧", href: "/notes", status: "available" },
      { label: "旅ノート詳細", href: "/notes/kyoto-nara", status: "available" },
      { label: "共有設定", href: "/notes/kyoto-nara/share", status: "available" }
    ]
  },
  {
    title: "共有・公開",
    description: "共有リンクからの閲覧やコメント受付です。",
    links: [
      {
        label: "共有公開ページ",
        href: "/share/note/kyoto-nara?password=harutabi",
        status: "available"
      },
      { label: "共有パスワード保護", href: "/share/note/kyoto-nara", status: "available" }
    ]
  }
];

export const featureInventory = [
  {
    category: "旅ノート",
    items: [
      ["旅ノートの新規作成", "available", "SQLite に保存され、作成後すぐ詳細ページへ遷移します。"],
      ["下書き保存", "available", "下書きステータスで保存され、一覧に反映されます。"],
      ["マイ旅ノート一覧表示", "available", "保存済みノートを実データで表示します。"],
      ["旅ノート詳細表示", "available", "日別記録、タグ、公開状態まで表示できます。"],
      ["旅ノート編集", "available", "編集画面から既存ノートを更新できます。"]
    ]
  },
  {
    category: "共有・公開",
    items: [
      ["共有設定更新", "available", "公開範囲、パスワード、コメント可否、有効期限を保存できます。"],
      ["共有URLコピー", "available", "共有設定画面からクリップボードへコピーできます。"],
      ["共有ページの公開閲覧", "available", "URL限定公開・全体公開ノートを共有ページで閲覧できます。"],
      ["期限切れ・非公開ブロック", "available", "共有ページでアクセス不可を判定します。"],
      ["LINE / メール / WhatsApp送信", "available", "共有設定から各サービスの送信リンクを開けます。"]
    ]
  },
  {
    category: "コメント・反応",
    items: [
      ["コメント投稿", "available", "詳細ページと共有ページからコメントを保存できます。"],
      ["コメント一覧表示", "available", "保存済みコメントをページに再表示します。"],
      ["コメント無効化", "available", "共有設定でコメント不可にすると API 側でも拒否します。"],
      ["いいね・保存の増減", "available", "詳細ページから押下すると実データの数値が更新されます。"]
    ]
  },
  {
    category: "探索・導線",
    items: [
      ["公開ブログ一覧", "available", "公開中ノートだけを実データで表示します。"],
      ["トップのおすすめ表示", "available", "公開可能なノートをピックアップ表示します。"],
      ["キーワード検索", "available", "旅ノート一覧と公開ブログ一覧で検索できます。"],
      ["並び替え", "available", "新着順・人気順・保存数順などに切り替えられます。"],
      ["グリッド / リスト切替", "available", "一覧の表示切替が可能です。"]
    ]
  },
  {
    category: "アカウント・周辺機能",
    items: [
      ["ログイン", "available", "ローカル保存の簡易ログインとして利用できます。"],
      ["新規登録", "available", "ローカル保存の簡易アカウント登録として利用できます。"],
      ["PDF保存", "available", "詳細画面から印刷ダイアログを開いて PDF 保存できます。"],
      ["画像アップロード", "available", "作成・編集画面でローカル画像を読み込んで表紙に設定できます。"]
    ]
  }
];
