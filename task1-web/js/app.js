/**
 * NutriCheck — Главный оркестратор веб-приложения
 * 
 * Точка входа. Связывает интерфейс ввода, логику расчетов,
 * парсинг файлов импорта и отрисовку графиков.
 */

// Глобальная утилита отображения всплывающих тостов (уведомлений)
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show toast-${type}`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Инициализация DOM-элементов
  const elements = {
    searchInput: document.getElementById('foodSearch'),
    dropdown: document.getElementById('searchDropdown'),
    foodList: document.getElementById('foodList'),
    emptyState: document.getElementById('emptyState'),
    foodCountBtn: document.getElementById('foodCount'),
    
    // Профиль пользователя
    genderSelect: document.getElementById('gender'),
    ageInput: document.getElementById('age'),
    activitySelect: document.getElementById('activity'),
    
    // Секции результатов
    radarChartCanvas: document.getElementById('radarChart'),
    overallBadge: document.getElementById('overallBadge'),
    nutrientsList: document.getElementById('nutrientsList'),
    
    // Рекомендации
    recommendationsSection: document.getElementById('recommendationsSection'),
    recommendationsGrid: document.getElementById('recommendationsGrid'),
    
    // Импорт файлов
    importCsvBtn: document.getElementById('importCsvBtn'),
    importJsonBtn: document.getElementById('importJsonBtn'),
    fileInput: document.getElementById('fileInput'),
    calculateBtn: document.getElementById('calculateBtn')
  };

  let activeImportType = null; // 'csv' или 'json'

  // Получить текущие данные профиля пользователя
  function getUserProfile() {
    return {
      gender: elements.genderSelect.value,
      age: elements.ageInput.value,
      activity: elements.activitySelect.value
    };
  }

  // 2. Функция главного обновления интерфейса результатов
  function updateAnalysis() {
    const foods = FoodInputUI.selectedFoods;
    const profile = getUserProfile();

    if (foods.length === 0) {
      // Сбрасываем результаты в дефолтное состояние
      elements.overallBadge.textContent = '—';
      elements.overallBadge.className = 'badge';
      elements.nutrientsList.innerHTML = '<p style="color: var(--text-muted); text-align:center; padding: 20px;">Добавьте продукты питания в список слева</p>';
      elements.recommendationsSection.style.display = 'none';
      
      // Очищаем Canvas
      const ctx = elements.radarChartCanvas.getContext('2d');
      ctx.clearRect(0, 0, elements.radarChartCanvas.width, elements.radarChartCanvas.height);
      return;
    }

    try {
      // Выполняем расчёт баланса питания
      const calculatedData = NutrientCalculator.calculate(foods, profile);

      // Красивый статус общего балла качества диеты
      let scoreBadgeClass = 'badge-bad';
      if (calculatedData.score >= 80) scoreBadgeClass = 'badge-good';
      else if (calculatedData.score >= 50) scoreBadgeClass = 'badge-moderate';

      elements.overallBadge.textContent = `Диета: ${calculatedData.score}/100`;
      elements.overallBadge.className = `badge ${scoreBadgeClass}`;

      // Рендерим радарную диаграмму
      RadarChartUI.draw(elements.radarChartCanvas, calculatedData);

      // Рендерим прогресс-бары детализации
      ProgressBarsUI.render(calculatedData, elements.nutrientsList);

      // Генерируем и выводим рекомендации по дефицитам
      const recommendations = RecommendationEngine.generate(calculatedData);
      RecommendationsUI.render(recommendations, elements.recommendationsGrid, elements.recommendationsSection);

    } catch (error) {
      console.error('Ошибка при обновлении анализа:', error);
      showToast('Ошибка при расчёте нутриентов', 'error');
    }
  }

  // 3. Инициализируем контроллер ввода
  FoodInputUI.init(elements, () => {
    // Этот коллбек вызывается при добавлении, изменении граммовки или удалении продукта
    updateAnalysis();
  });

  // Пересчитываем нормы при изменении профиля
  [elements.genderSelect, elements.ageInput, elements.activitySelect].forEach(input => {
    input.addEventListener('change', () => {
      updateAnalysis();
      showToast('Нормы обновлены под ваш профиль', 'success');
    });
  });

  // Дополнительный пересчёт по кнопке «Рассчитать»
  elements.calculateBtn.addEventListener('click', () => {
    updateAnalysis();
    showToast('Анализ обновлён', 'success');
  });

  // 4. Обработка импорта CSV
  elements.importCsvBtn.addEventListener('click', () => {
    activeImportType = 'csv';
    elements.fileInput.click();
  });

  // Обработка импорта JSON
  elements.importJsonBtn.addEventListener('click', () => {
    activeImportType = 'json';
    elements.fileInput.click();
  });

  // Обработчик выбора файла импорта
  elements.fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (event) => {
      const content = event.target.result;

      try {
        if (activeImportType === 'csv') {
          // Парсим CSV строки
          const parsedItems = CSVParser.parse(content);
          if (parsedItems.length === 0) {
            showToast('В CSV нет данных или неверный формат', 'error');
            return;
          }

          showToast(`Импортируем ${parsedItems.length} продуктов, ищем в API...`, 'success');
          
          // Отключаем интерфейс на время поиска в сети
          elements.importCsvBtn.disabled = true;
          elements.importCsvBtn.textContent = '⏳ Поиск...';

          let successCount = 0;

          // Ищем каждый импортированный продукт в API
          for (const item of parsedItems) {
            try {
              const results = await FoodSearchAPI.search(item.name);
              if (results.length > 0) {
                // Берем первый результат из поиска
                const product = results[0];
                FoodInputUI.selectedFoods.push({
                  ...product,
                  amount: item.amount
                });
                successCount++;
              }
            } catch (err) {
              console.warn(`Не удалось найти в API: ${item.name}`);
            }
          }

          elements.importCsvBtn.disabled = false;
          elements.importCsvBtn.innerHTML = '📄 Импорт CSV';

          if (successCount > 0) {
            FoodInputUI.renderFoodList(elements.foodList, elements.emptyState, elements.foodCountBtn, () => {
              updateAnalysis();
            });
            showToast(`Успешно импортировано продуктов: ${successCount}`, 'success');
          } else {
            showToast('Ни один продукт не найден в базе API', 'error');
          }

        } else if (activeImportType === 'json') {
          // Импортируем JSON отчёт
          const result = JSONImporter.import(content);
          
          if (result.type === 'full_report') {
            // Восстанавливаем сохраненный отчёт напрямую (без запросов в API)
            FoodInputUI.selectedFoods = result.selectedFoods;
            FoodInputUI.renderFoodList(elements.foodList, elements.emptyState, elements.foodCountBtn, () => {});
            
            // Напрямую рисуем импортированные графики и бары
            let scoreBadgeClass = 'badge-bad';
            if (result.calculatedData.score >= 80) scoreBadgeClass = 'badge-good';
            else if (result.calculatedData.score >= 50) scoreBadgeClass = 'badge-moderate';

            elements.overallBadge.textContent = `Диета: ${result.calculatedData.score}/100`;
            elements.overallBadge.className = `badge ${scoreBadgeClass}`;

            RadarChartUI.draw(elements.radarChartCanvas, result.calculatedData);
            ProgressBarsUI.render(result.calculatedData, elements.nutrientsList);

            // Карточки дефицитов
            const recommendations = RecommendationEngine.generate(result.calculatedData);
            RecommendationsUI.render(recommendations, elements.recommendationsGrid, elements.recommendationsSection);

            showToast('JSON отчёт от Python-анализатора загружен!', 'success');
          } else if (result.type === 'food_list') {
            FoodInputUI.selectedFoods = result.selectedFoods;
            FoodInputUI.renderFoodList(elements.foodList, elements.emptyState, elements.foodCountBtn, () => {
              updateAnalysis();
            });
            showToast('Список продуктов успешно импортирован!', 'success');
          }
        }
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        elements.fileInput.value = ''; // сброс поля выбора файла
      }
    };

    reader.readAsText(file);
  });
});
