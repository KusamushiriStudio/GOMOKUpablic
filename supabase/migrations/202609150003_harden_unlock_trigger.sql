-- triad_profiles のトリガー関数を固める。
--
-- triad_unlock_all_characters は保存のたびに走るトリガーで、search_path を
-- 指定していなかった。呼び出し側の search_path で動く関数は、同名の型や関数を
-- 先に見つけてしまう余地が残る。実行権限も既定の public のままだったので、
-- 必要な範囲（トリガーとして呼ばれる分）だけに絞る。
--
-- 中身（全キャラを所持済みにする移行）は変えない。

alter function public.triad_unlock_all_characters() set search_path = public, pg_temp;

revoke all on function public.triad_unlock_all_characters() from public, anon, authenticated;
