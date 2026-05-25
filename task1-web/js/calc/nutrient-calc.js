/**
 * NutriCheck — Движок расчета нутриентов
 * 
 * Пересчитывает нутриенты с базы 100г продуктов на фактический вес порции,
 * суммирует по всем продуктам и сравнивает с суточной нормой.
 */

// eslint-disable-next-line no-unused-vars
const NutrientCalculator = {
  /**
   * Рассчитывает баланс питания по всем добавленным продуктам
   * 
   * @param {Array} foodItems — массив продуктов [{ nutrients: {...}, amount: 150 }]
   * @param {Object} userProfile — профиль пользователя { gender, age, activity }
   * @returns {Object} — детальный отчёт о покрытии норм
   */
  calculate(foodItems, userProfile) {
    const { gender, age, activity } = userProfile;
    
    // Инициализируем пустую структуру для накопления съеденного
    const totalConsumed = {};
    Object.keys(RDA_NORMS).forEach(key => {
      totalConsumed[key] = 0;
    });

    // 1. Суммируем нутриенты с учётом веса продуктов
    foodItems.forEach(item => {
      const amountFactor = parseFloat(item.amount) / 100; // перевод граммов в множитель на 100г
      
      Object.keys(RDA_NORMS).forEach(key => {
        if (item.nutrients && item.nutrients[key] !== undefined) {
          totalConsumed[key] += (item.nutrients[key] * amountFactor);
        }
      });
    });

    // 2. Сравниваем суммарно съеденное с нормами
    const reports = {};
    let totalScoreSum = 0;
    let countedNutrients = 0;

    Object.keys(RDA_NORMS).forEach(key => {
      const consumed = Math.round(totalConsumed[key] * 10) / 10;
      const rda = getRDA(key, gender, parseInt(age), activity);
      const coveragePercent = rda > 0 ? Math.min(Math.round((consumed / rda) * 100), 500) : 0; // Ограничиваем сверху в 500%

      // Категория статуса покрытия
      let status = 'bad';
      if (coveragePercent >= 80) {
        status = 'good';
      } else if (coveragePercent >= 50) {
        status = 'moderate';
      }

      reports[key] = {
        name: RDA_NORMS[key].name,
        unit: RDA_NORMS[key].unit,
        consumed,
        norm: rda,
        percent: coveragePercent,
        status
      };

      // Расчёт общего балла покрытия здоровья (только по витаминам и минералам, исключая макросы КБЖУ)
      const isMacro = ['calories', 'protein', 'fat', 'carbs', 'fiber', 'sodium'].includes(key);
      if (!isMacro && rda > 0) {
        totalScoreSum += Math.min(coveragePercent, 100); // берем максимум 100% за один элемент, чтобы не искажать общую картину
        countedNutrients++;
      }
    });

    // Средний балл качества диеты (0 - 100)
    const dietQualityScore = countedNutrients > 0 ? Math.round(totalScoreSum / countedNutrients) : 0;

    return {
      nutrients: reports,
      score: dietQualityScore
    };
  }
};
