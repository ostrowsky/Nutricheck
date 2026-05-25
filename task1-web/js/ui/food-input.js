/**
 * NutriCheck — Модуль ввода продуктов питания
 * 
 * Управляет полем ввода, реализует debounce поисковых запросов,
 * отображает выпадающий список результатов API и список добавленной еды.
 */

// eslint-disable-next-line no-unused-vars
const FoodInputUI = {
  // Локальное хранилище добавленных продуктов
  selectedFoods: [],
  // Таймер для дебаунса
  searchTimeout: null,

  /**
   * Инициализация событий ввода
   * 
   * @param {Object} elements — словарь DOM-элементов
   * @param {Function} onUpdate — коллбек при любом изменении списка продуктов
   */
  init(elements, onUpdate) {
    const { searchInput, dropdown, foodList, emptyState, foodCountBtn } = elements;

    // 1. Поиск с дебаунсом (задержка 350мс, чтобы не спамить API при наборе букв)
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();

      clearTimeout(this.searchTimeout);

      if (query.length < 2) {
        dropdown.classList.remove('active');
        return;
      }

      this.searchTimeout = setTimeout(async () => {
        // Показываем индикатор загрузки в инпуте
        searchInput.style.backgroundImage = "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 50 50\"%3E%3Cpath fill=\"%236366f1\" d=\"M25,5A20,20,0,1,0,45,25\"%3E%3CanimateTransform attributeName=\"transform\" type=\"rotate\" from=\"0 25 25\" to=\"360 25 25\" dur=\"0.8s\" repeatCount=\"indefinite\"/%3E%3C/path%3E%3C/svg%3E')";
        searchInput.style.backgroundRepeat = 'no-repeat';
        searchInput.style.backgroundPosition = 'right 12px center';

        try {
          const results = await FoodSearchAPI.search(query);
          this.renderDropdown(results, dropdown, searchInput, foodList, emptyState, foodCountBtn, onUpdate);
        } catch (error) {
          showToast('Не удалось связаться с базой продуктов', 'error');
        } finally {
          // Убираем спиннер загрузки
          searchInput.style.backgroundImage = 'none';
        }
      }, 350);
    });

    // Закрытие выпадающего списка при клике мимо
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });
  },

  /**
   * Рендерит выпадающий список результатов поиска
   */
  renderDropdown(results, dropdown, searchInput, foodList, emptyState, foodCountBtn, onUpdate) {
    dropdown.innerHTML = '';

    if (results.length === 0) {
      dropdown.classList.remove('active');
      return;
    }

    results.forEach(product => {
      const item = document.createElement('div');
      item.className = 'search-item';

      // Ограничиваем длину названия
      const name = product.name.length > 35 ? product.name.substr(0, 35) + '...' : product.name;
      const brand = product.brand.length > 20 ? product.brand.substr(0, 20) + '...' : product.brand;
      const calories = Math.round(product.nutrients.calories);

      item.innerHTML = `
        <div>
          <div class="search-item-name">${name}</div>
          <div class="search-item-brand">${brand}</div>
        </div>
        <div class="search-item-calories">${calories} ккал / 100г</div>
      `;

      // При клике на элемент добавляем его в список
      item.addEventListener('click', () => {
        this.addFood(product, foodList, emptyState, foodCountBtn, onUpdate);
        searchInput.value = '';
        dropdown.classList.remove('active');
      });

      dropdown.appendChild(item);
    });

    dropdown.classList.add('active');
  },

  /**
   * Добавляет продукт в список выбранных
   */
  addFood(product, foodList, emptyState, foodCountBtn, onUpdate) {
    // Дефолтный вес порции — 100 грамм
    const foodItem = {
      ...product,
      amount: 100
    };

    this.selectedFoods.push(foodItem);
    this.renderFoodList(foodList, emptyState, foodCountBtn, onUpdate);
    showToast(`Добавлено: ${product.name}`, 'success');
  },

  /**
   * Рендерит список добавленных продуктов
   */
  renderFoodList(foodList, emptyState, foodCountBtn, onUpdate) {
    foodList.innerHTML = '';

    if (this.selectedFoods.length === 0) {
      emptyState.style.display = 'block';
      foodCountBtn.style.display = 'none';
      onUpdate();
      return;
    }

    emptyState.style.display = 'none';
    foodCountBtn.style.display = 'inline-flex';
    foodCountBtn.textContent = `${this.selectedFoods.length} шт.`;

    this.selectedFoods.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'food-item';

      const shortName = item.name.length > 30 ? item.name.substr(0, 30) + '...' : item.name;

      li.innerHTML = `
        <div class="food-item-info">
          <div class="food-item-name">${shortName}</div>
          <div class="food-item-meta">${item.brand}</div>
        </div>
        <div class="food-item-amount">
          <input type="number" value="${item.amount}" min="1" max="2000" data-index="${index}">
          <span>г</span>
        </div>
        <button class="food-item-remove" data-index="${index}">×</button>
      `;

      // Слушатель изменения веса порции
      const amountInput = li.querySelector('input');
      amountInput.addEventListener('change', (e) => {
        let val = parseInt(e.target.value);
        if (isNaN(val) || val <= 0) val = 100;
        this.selectedFoods[index].amount = val;
        onUpdate();
      });

      // Слушатель удаления продукта
      const removeBtn = li.querySelector('.food-item-remove');
      removeBtn.addEventListener('click', () => {
        this.selectedFoods.splice(index, 1);
        this.renderFoodList(foodList, emptyState, foodCountBtn, onUpdate);
        showToast('Продукт удалён', 'success');
      });

      foodList.appendChild(li);
    });

    onUpdate();
  }
};
