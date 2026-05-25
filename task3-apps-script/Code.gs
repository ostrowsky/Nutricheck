/**
 * ============================================================
 * NutriCheck — Apps Script для Google Таблицы
 * 
 * Обогащает дневник питания данными о витаминах и минералах
 * из базы данных Open Food Facts API.
 * ============================================================
 */

// Глобальные константы структуры таблицы
const SHEET_NAME = 'Дневник';
const START_ROW = 2; // Строка начала данных (пропуская заголовок)

// Карта колонок в таблице (1-indexed)
const COL = {
  DATE: 1,      // A: Дата
  PRODUCT: 2,   // B: Продукт
  WEIGHT: 3,    // C: Вес (г)
  CALORIES: 4,  // D: Калории
  PROTEIN: 5,   // E: Белок
  FAT: 6,       // F: Жиры
  CARBS: 7,     // G: Углеводы
  VIT_A: 8,     // H: Витамин A
  VIT_C: 9,     // I: Витамин C
  VIT_D: 10,    // J: Витамин D
  CALCIUM: 11,  // K: Кальций
  IRON: 12,     // L: Железо
  STATUS: 13    // M: Статус
};

/**
 * Триггер: Запускается при открытии Google Таблицы.
 * Добавляет кастомное меню "NutriCheck" с кнопками управления.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🥗 NutriCheck')
    .addItem('🔄 Обогатить продукты', 'enrichAllRows')
    .addSeparator()
    .addItem('🧹 Очистить КБЖУ и витамины', 'clearAllNutrients')
    .addToUi();
}

/**
 * Главная функция: сканирует таблицу, ищет продукты со статусом "⏳" (или пустые),
 * опрашивает API Open Food Facts и записывает нутриенты.
 */
function enrichAllRows() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    SpreadsheetApp.getUi().alert('Ошибка: Лист "' + SHEET_NAME + '" не найден!');
    return;
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < START_ROW) {
    SpreadsheetApp.getActiveSpreadsheet().toast('Таблица пуста!', 'NutriCheck');
    return;
  }

  // Считываем всю таблицу в память за один запрос (Middle+ практика оптимизации)
  const range = sheet.getRange(START_ROW, 1, lastRow - START_ROW + 1, COL.STATUS);
  const data = range.getValues();

  let processedCount = 0;
  let successCount = 0;
  let notFoundCount = 0;

  SpreadsheetApp.getActiveSpreadsheet().toast('Начинаем обогащение продуктов...', 'NutriCheck');

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const productName = row[COL.PRODUCT - 1].toString().trim();
    const weight = parseFloat(row[COL.WEIGHT - 1]);
    const status = row[COL.STATUS - 1].toString().trim();

    // Обрабатываем только если есть название продукта и статус равен "⏳" (или пустой)
    if (productName && (status === '⏳' || status === '' || !status)) {
      processedCount++;
      
      // Задаем статус "В процессе" в ячейке, чтобы пользователь видел прогресс
      const currentRow = START_ROW + i;
      sheet.getRange(currentRow, COL.STATUS).setValue('⏳ Поиск...');
      SpreadsheetApp.flush();

      try {
        const productData = fetchProductFromAPI(productName);
        
        if (productData) {
          // Обогащаем КБЖУ и витамины с пересчетом на фактический вес порции
          const factor = weight / 100.0;
          const nut = productData.nutrients;

          // Записываем значения в строку
          sheet.getRange(currentRow, COL.CALORIES).setValue(Math.round(nut.calories * factor));
          sheet.getRange(currentRow, COL.PROTEIN).setValue(Math.round(nut.protein * factor * 10) / 10);
          sheet.getRange(currentRow, COL.FAT).setValue(Math.round(nut.fat * factor * 10) / 10);
          sheet.getRange(currentRow, COL.CARBS).setValue(Math.round(nut.carbs * factor * 10) / 10);
          
          sheet.getRange(currentRow, COL.VIT_A).setValue(Math.round(nut.vitamin_a * factor));
          sheet.getRange(currentRow, COL.VIT_C).setValue(Math.round(nut.vitamin_c * factor * 10) / 10);
          sheet.getRange(currentRow, COL.VIT_D).setValue(Math.round(nut.vitamin_d * factor * 10) / 10);
          
          sheet.getRange(currentRow, COL.CALCIUM).setValue(Math.round(nut.calcium * factor));
          sheet.getRange(currentRow, COL.IRON).setValue(Math.round(nut.iron * factor * 10) / 10);

          sheet.getRange(currentRow, COL.STATUS).setValue('✅ Обогащено');
          successCount++;
        } else {
          sheet.getRange(currentRow, COL.STATUS).setValue('⚠️ Не найден в API');
          notFoundCount++;
        }
      } catch (error) {
        Logger.log('Ошибка при обработке "' + productName + '": ' + error.message);
        sheet.getRange(currentRow, COL.STATUS).setValue('❌ Ошибка сети');
        logErrorToSheet(productName, error.message);
      }
      
      // Небольшая пауза, чтобы не превысить лимиты запросов API
      Utilities.sleep(200);
      SpreadsheetApp.flush();
    }
  }

  // Выводим финальное уведомление
  const msg = 'Обработка завершена!\nУспешно: ' + successCount + '\nНе найдено: ' + notFoundCount;
  SpreadsheetApp.getUi().alert(msg);
}

/**
 * Запрашивает API Open Food Facts и извлекает нутриенты продукта
 */
function fetchProductFromAPI(productName) {
  const url = 'https://world.openfoodfacts.org/cgi/search.pl?search_terms=' + 
              encodeURIComponent(productName) + 
              '&search_simple=1&action=process&json=1&page_size=1' +
              '&fields=product_name,brands,nutriments,code';

  const options = {
    method: 'get',
    muteHttpExceptions: true, // Исключает падение скрипта при ошибках сервера API
    headers: {
      'User-Agent': 'NutriCheck - Google Sheets Apps Script - v1.0'
    }
  };

  // Ретраи с нарастающей задержкой: Open Food Facts часто отвечает 503/429 при троттлинге
  const MAX_RETRIES = 3;
  let response = null;
  let lastCode = 0;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    response = UrlFetchApp.fetch(url, options);
    lastCode = response.getResponseCode();

    if (lastCode === 200) {
      break;
    }
    // Повторяем только при перегрузке/троттлинге сервера (5xx, 429)
    if (lastCode === 503 || lastCode === 429 || lastCode >= 500) {
      if (attempt < MAX_RETRIES) {
        Utilities.sleep(1000 * attempt); // 1с, 2с — экспоненциальная задержка
        continue;
      }
    }
    // Прочие коды (4xx и т.п.) — не повторяем
    break;
  }

  if (lastCode !== 200) {
    throw new Error('API вернул код ответа ' + lastCode + ' (после ' + MAX_RETRIES + ' попыток)');
  }

  const json = JSON.parse(response.getContentText());
  if (!json.products || json.products.length === 0) {
    return null;
  }

  const product = json.products[0];
  const nut = product.nutriments || {};

  // Форматируем структуру и конвертируем граммы в мг/мкг
  return {
    name: product.product_name || 'Неизвестный продукт',
    brand: product.brands || 'Не указан',
    nutrients: {
      calories: parseFloat(nut['energy-kcal_100g']) || parseFloat(nut['energy_100g'] / 4.184) || 0.0,
      protein: parseFloat(nut['proteins_100g']) || 0.0,
      fat: parseFloat(nut['fat_100g']) || 0.0,
      carbs: parseFloat(nut['carbohydrates_100g']) || 0.0,

      vitamin_a: (parseFloat(nut['vitamin-a_100g']) || 0.0) * 1000000,
      vitamin_c: (parseFloat(nut['vitamin-c_100g']) || 0.0) * 1000,
      vitamin_d: (parseFloat(nut['vitamin-d_100g']) || 0.0) * 1000000,
      
      calcium: (parseFloat(nut['calcium_100g']) || 0.0) * 1000,
      iron: (parseFloat(nut['iron_100g']) || 0.0) * 1000
    }
  };
}

/**
 * Логирует ошибки на отдельный лист "Лог" в таблице
 */
function logErrorToSheet(product, errorMsg) {
  let activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let logSheet = activeSpreadsheet.getSheetByName('Лог');
  
  if (!logSheet) {
    logSheet = activeSpreadsheet.insertSheet('Лог');
    logSheet.appendRow(['Дата/Время', 'Продукт', 'Сообщение об ошибке']);
  }
  
  logSheet.appendRow([new Date(), product, errorMsg]);
}

/**
 * Вспомогательная функция: очищает все расчетные колонки в таблице
 */
function clearAllNutrients() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('Очистка', 'Вы действительно хотите удалить все рассчитанные нутриенты КБЖУ и витамины?', ui.ButtonSet.YES_NO);
  
  if (response === ui.Button.YES) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) return;

    const lastRow = sheet.getLastRow();
    if (lastRow < START_ROW) return;

    // Очищаем диапазон с колонки D по M
    sheet.getRange(START_ROW, COL.CALORIES, lastRow - START_ROW + 1, COL.STATUS - COL.CALORIES + 1).clearContent();
    SpreadsheetApp.getActiveSpreadsheet().toast('Данные очищены!', 'NutriCheck');
  }
}
