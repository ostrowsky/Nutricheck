# -*- coding: utf-8 -*-
"""
NutriCheck — Суточные нормы (RDA) витаминов и минералов на Python
Содержит нормы по полу, возрасту и активности.
"""

# Глобальные суточные нормы (базовые для 19-50 лет)
RDA_NORMS = {
    # Макронутриенты
    'calories': {'male': 2500, 'female': 2000, 'unit': 'ккал', 'name': 'Калории'},
    'protein': {'male': 65, 'female': 55, 'unit': 'г', 'name': 'Белок'},
    'fat': {'male': 80, 'female': 65, 'unit': 'г', 'name': 'Жиры'},
    'carbs': {'male': 350, 'female': 280, 'unit': 'г', 'name': 'Углеводы'},
    'fiber': {'male': 35, 'female': 28, 'unit': 'г', 'name': 'Клетчатка'},

    # Витамины
    'vitamin_a': {'male': 900, 'female': 700, 'unit': 'мкг', 'name': 'Витамин A'},
    'vitamin_c': {'male': 90, 'female': 75, 'unit': 'мг', 'name': 'Витамин C'},
    'vitamin_d': {'male': 15, 'female': 15, 'unit': 'мкг', 'name': 'Витамин D'},
    'vitamin_e': {'male': 15, 'female': 15, 'unit': 'мг', 'name': 'Витамин E'},
    'vitamin_k': {'male': 120, 'female': 90, 'unit': 'мкг', 'name': 'Витамин K'},
    'vitamin_b1': {'male': 1.2, 'female': 1.1, 'unit': 'мг', 'name': 'Витамин B1'},
    'vitamin_b2': {'male': 1.3, 'female': 1.1, 'unit': 'мг', 'name': 'Витамин B2'},
    'vitamin_b6': {'male': 1.3, 'female': 1.3, 'unit': 'мг', 'name': 'Витамин B6'},
    'vitamin_b12': {'male': 2.4, 'female': 2.4, 'unit': 'мкг', 'name': 'Витамин B12'},
    'folate': {'male': 400, 'female': 400, 'unit': 'мкг', 'name': 'Фолат (B9)'},

    # Минералы
    'calcium': {'male': 1000, 'female': 1000, 'unit': 'мг', 'name': 'Кальций'},
    'iron': {'male': 8, 'female': 18, 'unit': 'мг', 'name': 'Железо'},
    'magnesium': {'male': 400, 'female': 310, 'unit': 'мг', 'name': 'Магний'},
    'zinc': {'male': 11, 'female': 8, 'unit': 'мг', 'name': 'Цинк'},
    'potassium': {'male': 3400, 'female': 2600, 'unit': 'мг', 'name': 'Калий'},
    'sodium': {'male': 2300, 'female': 2300, 'unit': 'мг', 'name': 'Натрий'},
}

# Корректировки
AGE_COEFFICIENTS = {
    '14-18': 0.85,
    '19-30': 1.0,
    '31-50': 1.0,
    '51-70': 0.95,
    '71+': 0.9,
}

ACTIVITY_COEFFICIENTS = {
    'sedentary': 0.85,
    'moderate': 1.0,
    'active': 1.2
}

def get_rda(nutrient_key, gender, age, activity):
    """
    Рассчитывает персонализированную норму RDA
    """
    norm = RDA_NORMS.get(nutrient_key)
    if not norm:
        return 0

    value = norm.get(gender, norm['male'])

    # Корректировка по возрасту
    age_coeff = 1.0
    if 14 <= age <= 18:
        age_coeff = AGE_COEFFICIENTS['14-18']
    elif 19 <= age <= 30:
        age_coeff = AGE_COEFFICIENTS['19-30']
    elif 31 <= age <= 50:
        age_coeff = AGE_COEFFICIENTS['31-50']
    elif 51 <= age <= 70:
        age_coeff = AGE_COEFFICIENTS['51-70']
    elif age > 70:
        age_coeff = AGE_COEFFICIENTS['71+']

    value *= age_coeff

    # Корректировка по активности для макросов
    if nutrient_key in ['calories', 'protein', 'fat', 'carbs']:
        value *= ACTIVITY_COEFFICIENTS.get(activity, 1.0)

    # Витамин D для пожилых людей
    if nutrient_key == 'vitamin_d' and age > 50:
        value = 20

    return round(value, 1)
