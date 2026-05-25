/**
 * NutriCheck — Модуль рендеринга рекомендаций
 * 
 * Отображает структурированные карточки дефицитных нутриентов,
 * приоритизируя их по степени нехватки (критический vs умеренный).
 */

// eslint-disable-next-line no-unused-vars
const RecommendationsUI = {
  /**
   * Отрисовывает карточки рекомендаций
   * 
   * @param {Array} recommendations — отсортированный список рекомендаций от RecommendationEngine
   * @param {HTMLElement} container — DOM-узел контейнера
   * @param {HTMLElement} section — вся секция рекомендаций (чтобы скрыть/показать)
   */
  render(recommendations, container, section) {
    container.innerHTML = '';

    if (recommendations.length === 0) {
      section.style.display = 'none';
      return;
    }

    // Показываем всю секцию
    section.style.display = 'block';

    recommendations.forEach(rec => {
      const card = document.createElement('div');
      
      // Стилизация по степени критичности
      const isCritical = rec.severity === 'critical';
      card.className = `recommendation-card ${isCritical ? 'critical' : 'moderate'}`;
      
      if (!isCritical) {
        card.style.borderLeftColor = 'var(--color-moderate)';
      }

      // Генерация тегов продуктов
      const tagsHtml = rec.foods.map(food => `
        <span class="recommendation-food-tag">${food}</span>
      `).join('');

      card.innerHTML = `
        <div class="recommendation-nutrient">
          <span>${rec.icon}</span>
          <span>${rec.name}</span>
          <span class="badge ${isCritical ? 'badge-bad' : 'badge-moderate'}" style="margin-left: auto;">
            ${rec.percent}% нормы
          </span>
        </div>
        <p class="recommendation-text">${rec.desc}</p>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: var(--space-sm); font-weight: 500;">
          💡 Рекомендуемые продукты:
        </div>
        <div class="recommendations-foods">
          ${tagsHtml}
        </div>
      `;

      container.appendChild(card);
    });
  }
};
