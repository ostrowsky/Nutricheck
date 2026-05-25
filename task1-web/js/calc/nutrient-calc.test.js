/**
 * NutriCheck — Набор автотестов для фронтенда (Task 1)
 * Проверяет правильность расчета норм, покрытия нутриентов и рекомендаций дефицитов.
 */

// Простейший JS тест-раннер
const JSUnitTests = {
  tests: [],
  failures: 0,

  add(name, fn) {
    this.tests.push({ name, fn });
  },

  async run(outputEl) {
    outputEl.innerHTML = '<h2>🧪 Запуск автотестов NutriCheck Web...</h2>';
    this.failures = 0;

    for (const test of this.tests) {
      const testRow = document.createElement('div');
      testRow.style.padding = '8px';
      testRow.style.marginBottom = '6px';
      testRow.style.borderRadius = '4px';
      testRow.style.fontSize = '14px';
      testRow.style.fontFamily = 'monospace';

      try {
        await test.fn();
        testRow.style.backgroundColor = 'rgba(34, 197, 94, 0.15)';
        testRow.style.color = '#22c55e';
        testRow.textContent = `✅ PASSED: ${test.name}`;
      } catch (err) {
        this.failures++;
        testRow.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
        testRow.style.color = '#ef4444';
        testRow.textContent = `❌ FAILED: ${test.name}\n   Ошибка: ${err.message}`;
        console.error(err);
      }
      outputEl.appendChild(testRow);
    }

    const summary = document.createElement('div');
    summary.style.marginTop = '16px';
    summary.style.padding = '12px';
    summary.style.fontWeight = 'bold';
    summary.style.borderRadius = '6px';

    if (this.failures === 0) {
      summary.style.backgroundColor = '#22c55e';
      summary.style.color = '#ffffff';
      summary.textContent = `🎉 Все тесты пройдены успешно! Всего тестов: ${this.tests.length}`;
    } else {
      summary.style.backgroundColor = '#ef4444';
      summary.style.color = '#ffffff';
      summary.textContent = `🚨 Есть упавшие тесты! Ошибок: ${this.failures} из ${this.tests.length}`;
    }
    outputEl.appendChild(summary);
  },

  // Утилита для ассертов
  assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
      throw new Error(`${message || 'Ассерт провален'}: Ожидалось [${expected}], получено [${actual}]`);
    }
  }
};

// ── ОПРЕДЕЛЕНИЕ ТЕСТОВ ──

// Тест 1: Проверка RDA формул
JSUnitTests.add('Расчет RDA для мужчин и женщин', () => {
  // Мужчина, 30 лет, норма витамина C = 90
  const cMale = getRDA('vitamin_c', 'male', 30, 'moderate');
  JSUnitTests.assertEqual(cMale, 90.0, 'Норма Витамина C для мужчин 30 лет неверна');

  // Женщина, 30 лет, норма витамина C = 75
  const cFemale = getRDA('vitamin_c', 'female', 30, 'moderate');
  JSUnitTests.assertEqual(cFemale, 75.0, 'Норма Витамина C для женщин 30 лет неверна');

  // Витамин D для 65 лет = 20мкг
  const dElderly = getRDA('vitamin_d', 'male', 65, 'moderate');
  JSUnitTests.assertEqual(dElderly, 20.0, 'Норма Витамина D для пожилых людей неверна');
});

// Тест 2: Проверка пересчета порции еды
JSUnitTests.add('Пересчет порции еды в калькуляторе', () => {
  const mockFood = [
    {
      name: 'Морковь тестовая',
      amount: 150, // 1.5x от нутриентов на 100г
      nutrients: {
        calories: 40,
        protein: 1,
        vitamin_a: 800
      }
    }
  ];

  const profile = { gender: 'male', age: 30, activity: 'moderate' };
  const result = NutrientCalculator.calculate(mockFood, profile);

  // Проверяем калории: 40 * 1.5 = 60
  JSUnitTests.assertEqual(result.nutrients.calories.consumed, 60.0, 'Калории порции пересчитаны неверно');
  
  // Проверяем витамин A: 800 * 1.5 = 1200
  JSUnitTests.assertEqual(result.nutrients.vitamin_a.consumed, 1200.0, 'Витамин А порции пересчитан неверно');
});

// Тест 3: Проверка выявления дефицитов
JSUnitTests.add('Генерация рекомендаций при дефиците', () => {
  // Имитируем отчет, где Витамин C покрыт на 20%
  const mockReport = {
    nutrients: {
      vitamin_c: {
        percent: 20,
        status: 'bad'
      },
      calcium: {
        percent: 90,
        status: 'good'
      }
    }
  };

  const recs = RecommendationEngine.generate(mockReport);

  // Кальций (>80%) отсекается, Витамин C (<80%) должен быть в рекомендациях
  JSUnitTests.assertEqual(recs.length, 1, 'Количество рекомендаций неверно');
  JSUnitTests.assertEqual(recs[0].key, 'vitamin_c', 'Дефицитный нутриент определен неверно');
  JSUnitTests.assertEqual(recs[0].severity, 'critical', 'Критичность дефицита определена неверно');
});
