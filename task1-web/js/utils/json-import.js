/**
 * NutriCheck — Модуль импорта JSON-отчётов
 * 
 * Позволяет загружать готовые JSON-отчёты, рассчитанные Python-анализатором (Задача 2),
 * и сразу отображать графики и рекомендации, минуя повторные запросы к API.
 */

// eslint-disable-next-line no-unused-vars
const JSONImporter = {
  /**
   * Разбирает и импортирует JSON-отчёт
   * 
   * @param {string} jsonString — сырая строка JSON-файла
   * @returns {Object} — отформатированный объект { selectedFoods, calculatedData }
   */
  import(jsonString) {
    try {
      const data = JSON.parse(jsonString);

      // Проверка структуры: должен быть либо полный отчет, либо массив продуктов
      if (!data) throw new Error('Файл пуст');

      // Сценарий 1: Загружен готовый отчёт от нашего Python-скрипта
      if (data.analysis && data.analysis.coverage) {
        // Восстанавливаем структуру для калькулятора и визуализации
        const reports = {};
        
        // Маппим данные обратно в структуру RDA
        Object.keys(data.analysis.coverage).forEach(key => {
          const item = data.analysis.coverage[key];
          
          // Определяем статус
          let status = 'bad';
          if (item.percent >= 80) status = 'good';
          else if (item.percent >= 50) status = 'moderate';

          reports[key] = {
            name: RDA_NORMS[key] ? RDA_NORMS[key].name : key,
            unit: RDA_NORMS[key] ? RDA_NORMS[key].unit : '',
            consumed: item.consumed,
            norm: item.norm,
            percent: item.percent,
            status
          };
        });

        // Пытаемся достать список продуктов
        const foods = [];
        if (data.daily_log && data.daily_log.length > 0) {
          data.daily_log.forEach(day => {
            if (day.items) {
              day.items.forEach(item => {
                foods.push({
                  id: item.id || Math.random().toString(36).substr(2, 9),
                  name: item.name,
                  brand: item.brand || 'Импортировано из JSON',
                  amount: item.amount_g || 100,
                  nutrients: item.nutrients
                });
              });
            }
          });
        }

        // Общий балл качества питания
        const score = data.analysis.diet_score || 0;

        return {
          type: 'full_report',
          selectedFoods: foods,
          calculatedData: {
            nutrients: reports,
            score
          }
        };
      }

      // Сценарий 2: Загружен просто список продуктов в JSON
      if (Array.isArray(data)) {
        const validatedFoods = data.map(item => {
          if (!item.name || !item.nutrients) {
            throw new Error('Некорректная структура продукта в массиве JSON');
          }
          return {
            id: item.id || Math.random().toString(36).substr(2, 9),
            name: item.name,
            brand: item.brand || 'Импортировано',
            amount: item.amount || 100,
            nutrients: item.nutrients
          };
        });

        return {
          type: 'food_list',
          selectedFoods: validatedFoods
        };
      }

      throw new Error('Неизвестный формат JSON-отчёта. Загрузите отчёт, созданный Python-анализатором NutriCheck.');

    } catch (error) {
      console.error('Ошибка разбора JSON-отчёта:', error);
      throw error;
    }
  }
};
