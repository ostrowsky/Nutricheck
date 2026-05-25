# -*- coding: utf-8 -*-
"""
NutriCheck — Модуль расчета нутриентов на Python
"""
from src.rda_norms import get_rda, RDA_NORMS

class NutrientCalculator:
    @staticmethod
    def calculate(food_items, gender, age, activity):
        """
        Пересчитывает нутриенты на съеденный вес,
        суммирует и сопоставляет с суточными нормами RDA.
        """
        # Накапливаем съеденные нутриенты
        consumed = {key: 0.0 for key in RDA_NORMS.keys()}

        for item in food_items:
            nutrients = item.get('nutrients')
            if not nutrients:
                continue

            amount_factor = item['amount_g'] / 100.0

            for key in RDA_NORMS.keys():
                if key in nutrients:
                    consumed[key] += (nutrients[key] * amount_factor)

        # Сопоставляем с нормами
        report = {}
        total_score_sum = 0
        micronutrients_count = 0

        for key, info in RDA_NORMS.items():
            rda = get_rda(key, gender, age, activity)
            total = round(consumed[key], 1)
            
            percent = int((total / rda) * 100) if rda > 0 else 0
            percent = min(percent, 500)  # верхняя планка в 500%

            status = 'bad'
            if percent >= 80:
                status = 'good'
            elif percent >= 50:
                status = 'moderate'

            report[key] = {
                'name': info['name'],
                'unit': info['unit'],
                'consumed': total,
                'norm': rda,
                'percent': percent,
                'status': status
            }

            # Расчёт диет-балла только по микронутриентам (без макро КБЖУ и натрия)
            is_macro = key in ['calories', 'protein', 'fat', 'carbs', 'fiber', 'sodium']
            if not is_macro and rda > 0:
                total_score_sum += min(percent, 100)
                micronutrients_count += 1

        diet_score = int(total_score_sum / micronutrients_count) if micronutrients_count > 0 else 0

        return {
            'nutrients': report,
            'diet_score': diet_score
        }
