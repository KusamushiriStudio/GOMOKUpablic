# TRIAD Battle段階実装報告

Phase：Battle 3

対象：6スキルの選択UIと盤面対象選択

## 実装内容

- 火花、守護、疾風、凍結、引寄、変換の6ボタンを追加。
- 必要気力と使用回数を`SkillCatalog`から取得し、使用可能状態を自動更新。
- 選択中スキルを金枠と暖色背景で表示。
- 火花・守護・凍結・変換は対象交点を1回選択。
- 疾風・引寄は移動元と移動先を2段階で選択。
- スキルを`RuleEngine.Apply`へ渡し、失敗理由を日本語で表示。
- 成功後は盤上の碁石をCore状態から再構築し、手番・気力・使用回数を更新。

## Unityへ反映

YES

- Home Scene：`Assets/TRIAD/UI/Scenes/HomePhase36.unity`
- Battle Scene：`Assets/TRIAD/Battle/Scenes/BattlePhase3.unity`
- Skill UI：`Assets/TRIAD/Battle/Runtime/TriadBattleSkillBar.cs`
- Windows Player：`Artifacts/Battle/Player/TRIADBattlePhase3.exe`

## 次工程

Battle Phase 4：守護・凍結などの盤面状態とスキル発動結果を視覚化する。
