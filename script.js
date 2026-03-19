// script.js - 料金表（price-table）のモバイルラベル安定化 + shop トグル（全開）
document.addEventListener('DOMContentLoaded', function () {
  // 1) price-table 用: thead を参照して各 td に data-label を付与、tr ごとに data-plan / data-has-plan を設定（rowspan/colspan 対応）
  (function normalizeTableLabelsAndPlans(){
    const tables = document.querySelectorAll('.price-table table');
    if (!tables.length) return;

    tables.forEach(table => {
      const headers = Array.from(table.querySelectorAll('thead th')).map(h => h.textContent.trim());
      const tbodyRows = Array.from(table.querySelectorAll('tbody tr'));

      // occupied: 各論理列に対して、現在行で"既に上の行からspanされている"セル情報を保持
      // occupied[i] = { remaining: N, value: 'セルのテキスト' } または null
      const occupied = new Array(headers.length).fill(null);

      tbodyRows.forEach(row => {
        const cells = Array.from(row.children).filter(n => n.tagName.toLowerCase() === 'td' || n.tagName.toLowerCase() === 'th');
        let cellIdx = 0;
        let colIndex = 0;
        let planValueForRow = null;
        let hasPlanInRow = false;

        while (colIndex < headers.length) {
          // 前行の rowspan による占有を処理
          while (colIndex < headers.length && occupied[colIndex]) {
            if (occupied[colIndex].value != null && planValueForRow == null) {
              planValueForRow = occupied[colIndex].value;
            }
            occupied[colIndex].remaining--;
            if (occupied[colIndex].remaining <= 0) {
              occupied[colIndex] = null;
            }
            colIndex++;
          }
          if (colIndex >= headers.length) break;

          const cell = cells[cellIdx++];
          if (!cell) break;

          const colspan = parseInt(cell.getAttribute('colspan') || 1, 10);
          const rowspan = parseInt(cell.getAttribute('rowspan') || 1, 10);

          // ヘッダが複数該当する場合は結合ラベルにする
          const label = headers.slice(colIndex, colIndex + colspan).join(' / ');
          cell.setAttribute('data-label', label + ':');

          // このセルが「プラン」列に該当するかをチェック（ヘッダ先頭が「プラン」を想定）
          const mapsToPlan = headers[0] && label.split(' / ')[0].indexOf('プラン') !== -1;

          if (mapsToPlan) {
            const val = cell.textContent.trim();
            planValueForRow = val;
            hasPlanInRow = true;
            // rowspan があれば occupied に登録（以降行でも同じプランを使う）
            if (rowspan > 1) {
              for (let k = 0; k < colspan; k++) {
                occupied[colIndex + k] = { remaining: rowspan - 1, value: val };
              }
            }
          } else {
            // プラン以外のセルの rowspan も occupied に登録しておく（汎用）
            if (rowspan > 1) {
              const val = cell.textContent.trim();
              for (let k = 0; k < colspan; k++) {
                occupied[colIndex + k] = { remaining: rowspan - 1, value: val };
              }
            }
          }

          colIndex += colspan;
        } // end while cols

        // プランが見つからなかった場合は occupied から拾う
        if (!planValueForRow) {
          for (let i = 0; i < headers.length; i++) {
            if (occupied[i] && occupied[i].value) {
              planValueForRow = occupied[i].value;
              break;
            }
          }
        }

        row.setAttribute('data-plan', planValueForRow ? planValueForRow : '');
        row.setAttribute('data-has-plan', hasPlanInRow ? 'true' : 'false');
      }); // rows
    }); // tables
  })();

  // 2) shop のカテゴリ折りたたみトグル（簡易） + 初期状態を「全て開く」に統一
  (function setupShopTogglesAndOpenAll(){
    const toggles = document.querySelectorAll('.category-toggle');
    // 初期で全て開いた状態にする（ユーザー要望）
    document.querySelectorAll('.shop-table-wrap').forEach(wrap => {
      wrap.removeAttribute('hidden');
    });
    toggles.forEach(btn => {
      btn.setAttribute('aria-expanded', 'true');
      // クリック挙動は維持（クリックで閉じられる）
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        const targetId = btn.getAttribute('aria-controls');
        const target = targetId ? document.getElementById(targetId) : null;
        if (target) {
          if (expanded) {
            target.setAttribute('hidden', '');
            btn.setAttribute('aria-expanded', 'false');
          } else {
            target.removeAttribute('hidden');
            btn.setAttribute('aria-expanded', 'true');
          }
        } else {
          btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  })();

  // （オプション）Swiper 初期化等は必要であればここに入れてください。
  // 例: new Swiper('.hero-swiper', { ... });
});