/**
 * NutriCheck — Модуль генерации рекомендаций по дефицитам
 * 
 * Анализирует рассчитанный баланс питания, находит критические (<50%)
 * и умеренные (50-80%) дефициты нутриентов,
 * приоритизирует их и предлагает конкретные продукты для обогащения рациона.
 */

// eslint-disable-next-line no-unused-vars
const RecommendationEngine = {
  /**
   * Генерирует массив рекомендаций по дефицитам питания
   * 
   * @param {Object} calculatedData — результат расчёта от NutrientCalculator
   * @returns {Array} — отсортированный массив карточек рекомендаций
   */
  generate(calculatedData) {
    const { nutrients } = calculatedData;
    const recommendations = [];

    // Мы фокусируемся только на микронутриентах (витамины + минералы)
    // Калории, белки, жиры и угли в дефицитах не выводим в качестве БАД/витаминных рекомендаций
    const excludeKeys = ['calories', 'protein', 'fat', 'carbs', 'fiber', 'sodium'];

    Object.keys(nutrients).forEach(key => {
      if (excludeKeys.includes(key)) return;

      const nutData = nutrients[key];
      const meta = NUTRIENT_META[key];

      // Если метаданных нет или норма покрыта более чем на 80% — пропускаем
      if (!meta || nutData.percent >= 80) return;

      recommendations.push({
        key,
        name: meta.name,
        icon: meta.icon,
        percent: nutData.percent,
        status: nutData.status, // 'bad' (<50%) или 'moderate' (50-80%)
        desc: meta.desc,
        foods: meta.foods,
        severity: nutData.percent < 50 ? 'critical' : 'warning'
      });
    });

    // Сортируем: сначала критические дефициты (severity === 'critical'), 
    // внутри них — по возрастанию процента покрытия (сначала самый сильный дефицит)
    return recommendations.sort((a, b) => {
      if (a.severity !== b.severity) {
        return a.severity === 'critical' ? -1 : 1;
      }
      return a.percent - b.percent;
    });
  }
};
