/**
 * NutriCheck — Модуль взаимодействия с Open Food Facts API
 * 
 * Открытая база продуктов питания. Не требует токенов авторизации.
 * Позволяет искать продукты по названию на русском/английском языках.
 */

// eslint-disable-next-line no-unused-vars
const FoodSearchAPI = {
  // Базовый URL API
  BASE_URL: 'https://world.openfoodfacts.org/cgi/search.pl',

  /**
   * Ищет продукты по названию в базе Open Food Facts
   * 
   * @param {string} query — поисковый запрос (например, "Гречка")
   * @returns {Promise<Array>} — массив отформатированных продуктов
   */
  async search(query) {
    if (!query || query.trim().length < 2) return [];

    try {
      // Формируем URL с параметрами поиска
      const url = new URL(this.BASE_URL);
      url.searchParams.append('search_terms', query.trim());
      url.searchParams.append('search_simple', '1');
      url.searchParams.append('action', 'process');
      url.searchParams.append('json', '1');
      url.searchParams.append('page_size', '15'); // Ограничиваем выдачу для скорости
      url.searchParams.append('fields', 'product_name,brands,nutriments,code'); // Запрашиваем только нужные поля

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NutriCheck - Web Task - Version 1.0' // Уважительно представляемся серверу API
        }
      });

      if (!response.ok) {
        throw new Error(`Ошибка сети: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.products || data.products.length === 0) {
        return [];
      }

      // Маппим сырой ответ API к нашей удобной внутренней структуре
      return data.products.map(product => {
        const nutriments = product.nutriments || {};

        return {
          id: product.code || Math.random().toString(36).substr(2, 9),
          name: product.product_name || 'Неизвестный продукт',
          brand: product.brands || 'Собственное производство / Бренд не указан',
          
          // Нутриенты на 100 грамм продукта
          nutrients: {
            calories: parseFloat(nutriments['energy-kcal_100g']) || parseFloat(nutriments['energy_100g'] / 4.184) || 0,
            protein: parseFloat(nutriments['proteins_100g']) || 0,
            fat: parseFloat(nutriments['fat_100g']) || 0,
            carbs: parseFloat(nutriments['carbohydrates_100g']) || 0,
            fiber: parseFloat(nutriments['fiber_100g']) || 0,

            // Витамины (из базы приходят в граммах, переводим в мг или мкг)
            vitamin_a: (parseFloat(nutriments['vitamin-a_100g']) || 0) * 1000000, // г -> мкг
            vitamin_c: (parseFloat(nutriments['vitamin-c_100g']) || 0) * 1000,    // г -> мг
            vitamin_d: (parseFloat(nutriments['vitamin-d_100g']) || 0) * 1000000, // г -> мкг
            vitamin_e: (parseFloat(nutriments['vitamin-e_100g']) || 0) * 1000,    // г -> мг
            vitamin_k: (parseFloat(nutriments['vitamin-k_100g']) || 0) * 1000000, // г -> мкг
            vitamin_b1: (parseFloat(nutriments['vitamin-b1_100g']) || 0) * 1000,  // г -> мг
            vitamin_b2: (parseFloat(nutriments['vitamin-b2_100g']) || 0) * 1000,  // г -> мг
            vitamin_b6: (parseFloat(nutriments['vitamin-b6_100g']) || 0) * 1000,  // г -> мг
            vitamin_b12: (parseFloat(nutriments['vitamin-b12_100g']) || 0) * 1000000, // г -> мкг
            folate: (parseFloat(nutriments['vitamin-b9_100g']) || 0) * 1000000,   // г -> мкг

            // Минералы
            calcium: (parseFloat(nutriments['calcium_100g']) || 0) * 1000,        // г -> мг
            iron: (parseFloat(nutriments['iron_100g']) || 0) * 1000,              // г -> мг
            magnesium: (parseFloat(nutriments['magnesium_100g']) || 0) * 1000,    // г -> мг
            zinc: (parseFloat(nutriments['zinc_100g']) || 0) * 1000,              // г -> мг
            potassium: (parseFloat(nutriments['potassium_100g']) || 0) * 1000,    // г -> мг
            sodium: (parseFloat(nutriments['sodium_100g']) || 0) * 1000,          // г -> мг
          }
        };
      });

    } catch (error) {
      console.error('Ошибка при поиске в Open Food Facts API:', error);
      throw error;
    }
  }
};
