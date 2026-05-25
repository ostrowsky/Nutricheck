/**
 * NutriCheck — Модуль парсинга импортируемого CSV
 * 
 * Читает CSV-файлы экспорта дневника питания из Google Таблицы (Задача 3),
 * парсит строки, извлекает продукты и их вес порций,
 * а затем находит их в Open Food Facts API для пополнения дашборда.
 */

// eslint-disable-next-line no-unused-vars
const CSVParser = {
  /**
   * Разбирает содержимое CSV-файла
   * 
   * @param {string} text — сырой текст CSV-файла
   * @returns {Array} — массив объектов { name, amount }
   */
  parse(text) {
    if (!text || text.trim() === '') return [];

    const lines = text.split('\n');
    if (lines.length <= 1) return [];

    // Определяем разделитель (запятая или точка с запятой)
    const header = lines[0];
    const delimiter = header.includes(';') ? ';' : ',';

    const headers = header.split(delimiter).map(h => h.trim().toLowerCase());
    
    // Ищем индексы колонок с названием и весом порции
    // Поддерживаем разные варианты названий (рус/англ)
    const productIdx = headers.findIndex(h => h.includes('продукт') || h.includes('product') || h.includes('название'));
    const amountIdx = headers.findIndex(h => h.includes('кол-во') || h.includes('вес') || h.includes('amount') || h.includes('weight') || h.includes('грамм'));

    if (productIdx === -1) {
      throw new Error('Не найдена колонка с названием продукта в CSV (заголовок должен содержать "Продукт")');
    }

    const items = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '') continue;

      const cells = line.split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, '')); // убираем кавычки
      
      if (cells.length <= productIdx) continue;

      const productName = cells[productIdx];
      let amount = 100; // по умолчанию 100г

      if (amountIdx !== -1 && cells[amountIdx]) {
        const parsedAmount = parseInt(cells[amountIdx]);
        if (!isNaN(parsedAmount) && parsedAmount > 0) {
          amount = parsedAmount;
        }
      }

      if (productName && productName.trim() !== '') {
        items.push({
          name: productName,
          amount
        });
      }
    }

    return items;
  }
};
