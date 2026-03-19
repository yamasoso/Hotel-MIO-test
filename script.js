// script.js - 料金表（price-table）のモバイルラベル安定化 + shop トグル
document.addEventListener('DOMContentLoaded', function () {
  // 料金表ラベル付与（rowspan/colspan 対応）
  (function normalizeTableLabelsAndPlans(){
    const tables = document.querySelectorAll('.price-table table');
    if (!tables.length) return;

    tables.forEach(table => {
      const headers = Array.from(table.querySelectorAll('thead th')).map(h => h.textContent.trim());
      const tbodyRows = Array.from(table.querySelectorAll('tbody tr'));
      const occupied = new Array(headers.length).fill(null);

      tbodyRows.forEach(row => {
        const cells = Array.from(row.children).filter(n => n.tagName.toLowerCase() === 'td' || n.tagName.toLowerCase() === 'th');
        let cellIdx = 0;
        let colIndex = 0;
        let planValueForRow = null;
        let hasPlanInRow = false;

        while (colIndex < headers.length) {
          while (colIndex < headers.length && occupied[colIndex]) {
            if (occupied[colIndex].value != null && planValueForRow == null) {
              planValueForRow = occupied[colIndex].value;
            }
            occupied[colIndex].remaining--;
            if (occupied[colIndex].remaining <= 0) occupied[colIndex] = null;
            colIndex++;
          }
          if (colIndex >= headers.length) break;

          const cell = cells[cellIdx++];
          if (!cell) break;

          const colspan = parseInt(cell.getAttribute('colspan') || 1, 10);
          const rowspan = parseInt(cell.getAttribute('rowspan') || 1, 10);
          const label = headers.slice(colIndex, colIndex + colspan).join(' / ');
          cell.setAttribute('data-label', label + ':');

          const mapsToPlan = headers[0] && label.split(' / ')[0].indexOf('プラン') !== -1;
          if (mapsToPlan) {
            const val = cell.textContent.trim();
            planValueForRow = val;
            hasPlanInRow = true;
            if (rowspan > 1) {
              for (let k = 0; k < colspan; k++) occupied[colIndex + k] = { remaining: rowspan - 1, value: val };
            }
          } else {
            if (rowspan > 1) {
              const val = cell.textContent.trim();
              for (let k = 0; k < colspan; k++) occupied[colIndex + k] = { remaining: rowspan - 1, value: val };
            }
          }

          colIndex += colspan;
        }

        if (!planValueForRow) {
          for (let i = 0; i < headers.length; i++) {
            if (occupied[i] && occupied[i].value) { planValueForRow = occupied[i].value; break; }
          }
        }

        row.setAttribute('data-plan', planValueForRow ? planValueForRow : '');
        row.setAttribute('data-has-plan', hasPlanInRow ? 'true' : 'false');
      });
    });
  })();

  // shop のトグル
  (function setupShopToggles(){
    const toggles = document.querySelectorAll('.category-toggle');
    toggles.forEach(btn => {
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        const targetId = btn.getAttribute('aria-controls');
        const target = targetId ? document.getElementById(targetId) : null;
        if (target) {
          if (expanded) { target.setAttribute('hidden',''); btn.setAttribute('aria-expanded','false'); }
          else { target.removeAttribute('hidden'); btn.setAttribute('aria-expanded','true'); }
        } else { btn.setAttribute('aria-expanded', expanded ? 'false' : 'true'); }
      });
    });
  })();
});