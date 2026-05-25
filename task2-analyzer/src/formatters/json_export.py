# -*- coding: utf-8 -*-
"""
NutriCheck — Модуль экспорта отчета в JSON на Python
Генерирует файлы, полностью совместимые с веб-дашбордом Задачи 1.
"""
import json

class JSONExporter:
    @staticmethod
    def export(calculated_data, recommendations, user_profile, food_items, file_path):
        """
        Сохраняет отчёт в JSON-формате для импорта в веб-интерфейс
        """
        # Превращаем расчеты нутриентов в плоскую структуру для экспорта
        coverage_data = {}
        for key, val in calculated_data['nutrients'].items():
            coverage_data[key] = {
                'consumed': val['consumed'],
                'norm': val['norm'],
                'percent': val['percent']
            }

        # Список добавленных продуктов в правильном формате
        items_data = []
        for item in food_items:
            items_data.append({
                'name': item['name'],
                'brand': item.get('brand', 'Импортировано'),
                'amount_g': item['amount_g'],
                'nutrients': item.get('nutrients', {})
            })

        # Итоговая структура
        export_data = {
            'user': {
                'gender': user_profile['gender'],
                'age': user_profile['age'],
                'activity': user_profile['activity']
            },
            'daily_log': [
                {
                    'date': 'Сегодня',
                    'items': items_data
                }
            ],
            'analysis': {
                'diet_score': calculated_data['diet_score'],
                'coverage': coverage_data,
                'deficits': [rec['key'] for rec in recommendations],
                'recommendations': [
                    {
                        'nutrient': rec['key'],
                        'foods': rec['foods']
                    } for rec in recommendations
                ]
            }
        }

        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, ensure_ascii=False, indent=2)

        print(f"[EXPORT] JSON отчёт сохранен: {file_path}")
