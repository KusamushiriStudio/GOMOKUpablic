/**
 * 名札（表示名）の決まりを1か所にまとめる。
 *
 * なぜ要るのか
 *   プレイヤー名は2か所に保存されている。
 *     triad_profiles.data.name  … 資産側。自分の画面（ホーム・設定）が読む。
 *     profiles.display_name     … 交友側。フレンド一覧・検索・ルームの席が読む。
 *
 *   /name は資産側しか書き換えていなかった。そのため
 *     ・自分の画面では名前が変わる
 *     ・フレンドからは前の名前のまま
 *     ・ルームに入ると前の名前で座る
 *   となり、利用者からは「名前が変えられない」ように見えていた。
 *   本番のデータでも、資産側が「テスト太郎」、交友側が「あなた」という
 *   食い違いが実際に残っていた。
 *
 *   名札の作り方が2か所（cleanName と ensureIdentity の slice）に分かれて
 *   いたのも、ずれる原因になる。ここに1つだけ置く。
 */

/** 名札の最大長。入力欄の maxlength と合わせてある。 */
export const NAME_MAX = 16;

/** 名札が無いときの既定。 */
export const NAME_FALLBACK = '旅人';

/**
 * 名札に入れない文字か。
 *
 * 正規表現に書かず符号位置で判定するのは、対象が「目に見えない文字」だから。
 * 正規表現の中に実物を書くと、編集のたびに壊れるうえ、読んでも何が入って
 * いるのか分からない（実際に一度それで壊した）。
 *
 *   0x00-0x1f, 0x7f  制御文字
 *   0x200b-0x200f    幅の無い空白と、書字方向の指定
 *   0x2028, 0x2029   行送り・段落送り
 *   0x202a-0x202e    書字方向の埋め込みと上書き
 *   0x2060, 0xfeff   幅の無い連結子と、順序印
 *
 * 見た目が同じ別名を作られると、一覧でも検索でも見分けが付かなくなる。
 */
function invisible(cp) {
  return cp <= 0x1f
    || cp === 0x7f
    || (cp >= 0x200b && cp <= 0x200f)
    || cp === 0x2028
    || cp === 0x2029
    || (cp >= 0x202a && cp <= 0x202e)
    || cp === 0x2060
    || cp === 0xfeff;
}

/**
 * 入力を名札として使える形にする。使えなければ空文字。
 *
 * 記号を落とすのは、名前がそのまま一覧や検索に出るため。
 * HTML として解釈させない作りにはしてあるが、紛らわしい字は最初から入れない。
 */
export function sanitizeName(value) {
  const raw = String(value ?? '').replace(/[<>&"'`\\]/g, '');
  let out = '';
  for (const ch of raw) {
    if (!invisible(ch.codePointAt(0))) out += ch;
  }
  return out.trim().slice(0, NAME_MAX);
}

/** 交友側に出す名札。空なら既定へ落とす。 */
export function displayNameOf(value) {
  return sanitizeName(value) || NAME_FALLBACK;
}

/** 書き直しが要るか。同じなら書かない（毎回の取得で更新を飛ばさないため）。 */
export function needsNameSync(current, wanted) {
  return displayNameOf(wanted) !== String(current ?? '');
}
