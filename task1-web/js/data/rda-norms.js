/**
 * NutriCheck — Суточные нормы (RDA) витаминов и минералов
 * 
 * Источники: WHO, Роспотребнадзор (МР 2.3.1.0253-21)
 * Нормы зависят от пола, возраста и уровня активности.
 * 
 * Формат: { nutrientKey: { male: value, female: value } }
 * Значения для возраста 19-50 лет (основная аудитория).
 * Для других возрастов применяются коэффициенты.
 */

// eslint-disable-next-line no-unused-vars
const RDA_NORMS = {
  // ── Макронутриенты ──
  calories: { male: 2500, female: 2000, unit: 'kcal', name: 'Калории' },
  protein: { male: 65, female: 55, unit: 'g', name: 'Белок' },
  fat: { male: 80, female: 65, unit: 'g', name: 'Жиры' },
  carbs: { male: 350, female: 280, unit: 'g', name: 'Углеводы' },
  fiber: { male: 35, female: 28, unit: 'g', name: 'Клетчатка' },

  // ── Витамины ──
  vitamin_a: { male: 900, female: 700, unit: 'μg', name: 'Витамин A' },
  vitamin_c: { male: 90, female: 75, unit: 'mg', name: 'Витамин C' },
  vitamin_d: { male: 15, female: 15, unit: 'μg', name: 'Витамин D' },
  vitamin_e: { male: 15, female: 15, unit: 'mg', name: 'Витамин E' },
  vitamin_k: { male: 120, female: 90, unit: 'μg', name: 'Витамин K' },
  vitamin_b1: { male: 1.2, female: 1.1, unit: 'mg', name: 'Витамин B1' },
  vitamin_b2: { male: 1.3, female: 1.1, unit: 'mg', name: 'Витамин B2' },
  vitamin_b6: { male: 1.3, female: 1.3, unit: 'mg', name: 'Витамин B6' },
  vitamin_b12: { male: 2.4, female: 2.4, unit: 'μg', name: 'Витамин B12' },
  folate: { male: 400, female: 400, unit: 'μg', name: 'Фолат (B9)' },

  // ── Минералы ──
  calcium: { male: 1000, female: 1000, unit: 'mg', name: 'Кальций' },
  iron: { male: 8, female: 18, unit: 'mg', name: 'Железо' },
  magnesium: { male: 400, female: 310, unit: 'mg', name: 'Магний' },
  zinc: { male: 11, female: 8, unit: 'mg', name: 'Цинк' },
  potassium: { male: 3400, female: 2600, unit: 'mg', name: 'Калий' },
  sodium: { male: 2300, female: 2300, unit: 'mg', name: 'Натрий' },
};

/**
 * Коэффициенты корректировки RDA по возрасту
 * Базовые значения — для 19-50 лет (коэффициент 1.0)
 */
const AGE_COEFFICIENTS = {
  '14-18': 0.85,  // Подростки — чуть меньше по большинству
  '19-30': 1.0,   // Базовый уровень
  '31-50': 1.0,   // Тот же уровень
  '51-70': 0.95,  // Чуть меньше калорий, но больше D и B12
  '71+': 0.9,     // Меньше калорий, больше D, B12, кальций
};

/**
 * Коэффициенты корректировки по уровню активности (для калорий)
 */
const ACTIVITY_COEFFICIENTS = {
  sedentary: 0.85,  // Малоподвижный
  moderate: 1.0,    // Умеренная активность (базовый)
  active: 1.2,      // Высокая активность
};

/**
 * Получить суточную норму для конкретного нутриента
 * с учётом пола, возраста и активности
 * 
 * @param {string} nutrientKey — ключ нутриента (например, 'vitamin_c')
 * @param {string} gender — 'male' или 'female'
 * @param {number} age — возраст
 * @param {string} activity — 'sedentary', 'moderate', 'active'
 * @returns {number} — суточная норма
 */
// eslint-disable-next-line no-unused-vars
function getRDA(nutrientKey, gender, age, activity) {
  const norm = RDA_NORMS[nutrientKey];
  if (!norm) return 0;

  // Базовое значение по полу
  let value = norm[gender] || norm.male;

  // Корректировка по возрасту
  let ageCoeff = 1.0;
  if (age >= 14 && age <= 18) ageCoeff = AGE_COEFFICIENTS['14-18'];
  else if (age >= 19 && age <= 30) ageCoeff = AGE_COEFFICIENTS['19-30'];
  else if (age >= 31 && age <= 50) ageCoeff = AGE_COEFFICIENTS['31-50'];
  else if (age >= 51 && age <= 70) ageCoeff = AGE_COEFFICIENTS['51-70'];
  else if (age > 70) ageCoeff = AGE_COEFFICIENTS['71+'];

  value *= ageCoeff;

  // Для калорий, белка, жиров, углеводов — корректировка по активности
  const macros = ['calories', 'protein', 'fat', 'carbs'];
  if (macros.includes(nutrientKey)) {
    value *= (ACTIVITY_COEFFICIENTS[activity] || 1.0);
  }

  // Витамин D повышен для 51+
  if (nutrientKey === 'vitamin_d' && age > 50) {
    value = 20; // 20 μg вместо 15
  }

  return Math.round(value * 10) / 10;
}
