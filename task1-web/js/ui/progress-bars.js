/**
 * NutriCheck — Рендеринг детальной таблицы прогресс-баров
 * 
 * Отображает список нутриентов с анимированными шкалами заполнения,
 * цветовой кодировкой (зелёный/жёлтый/красный) и тултипами.
 */

// eslint-disable-next-line no-unused-vars
const ProgressBarsUI = {
  /**
   * Отрисовывает прогресс-бары в контейнере
   * 
   * @param {Object} calculatedData — результат расчёта от NutrientCalculator
   * @param {HTMLElement} container — DOM-узел, куда рендерить
   */
  render(calculatedData, container) {
    container.innerHTML = '';
    const { nutrients } = calculatedData;

    // Группируем для красоты: Макронутриенты (БЖУ), Витамины, Минералы
    const groups = {
      macros: { name: 'Энергия и КБЖУ', keys: ['calories', 'protein', 'fat', 'carbs', 'fiber'] },
      vitamins: { name: 'Витамины', keys: ['vitamin_a', 'vitamin_c', 'vitamin_d', 'vitamin_e', 'vitamin_k', 'vitamin_b1', 'vitamin_b2', 'vitamin_b6', 'vitamin_b12', 'folate'] },
      minerals: { name: 'Минералы', keys: ['calcium', 'iron', 'magnesium', 'zinc', 'potassium', 'sodium'] }
    };

    Object.keys(groups).forEach(groupId => {
      const group = groups[groupId];
      
      // Заголовок группы
      const groupHeader = document.createElement('h3');
      groupHeader.style.margin = 'var(--space-md) 0 var(--space-sm) 0';
      groupHeader.style.fontSize = 'var(--font-size-base)';
      groupHeader.style.color = 'var(--text-secondary)';
      groupHeader.textContent = group.name;
      container.appendChild(groupHeader);

      // Сетка элементов в группе
      const groupGrid = document.createElement('div');
      groupGrid.className = 'nutrients-list';
      
      group.keys.forEach(key => {
        const nut = nutrients[key];
        if (!nut) return;

        // Определяем иконку
        const meta = NUTRIENT_META[key];
        const icon = meta ? meta.icon : '🟢';

        const row = document.createElement('div');
        row.className = 'nutrient-row';

        // Шапка строки: Название + Значение (Съедено / Норма)
        row.innerHTML = `
          <div class="nutrient-header">
            <span class="nutrient-name tooltip" data-tooltip="${meta ? meta.desc : 'Элемент питания'}">
              <span>${icon}</span> ${nut.name}
            </span>
            <span class="nutrient-value">
              ${nut.consumed} / ${nut.norm} ${nut.unit}
              <span class="nutrient-percent ${nut.status}">${nut.percent}%</span>
            </span>
          </div>
          <div class="progress-bar">
            <div class="progress-bar-fill ${nut.status}" style="width: 0%;"></div>
          </div>
        `;

        groupGrid.appendChild(row);
        container.appendChild(groupGrid);

        // Анимация заполнения прогресс-бара с задержкой (выглядит премиально)
        setTimeout(() => {
          const fillElement = row.querySelector('.progress-bar-fill');
          if (fillElement) {
            // Ограничиваем графическую ширину 100%, но текст может показывать больше
            const visualPercent = Math.min(nut.percent, 100);
            fillElement.style.width = `${visualPercent}%`;
          }
        }, 100);
      });
    });
  }
};
