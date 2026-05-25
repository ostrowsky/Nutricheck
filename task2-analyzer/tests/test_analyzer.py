# -*- coding: utf-8 -*-
"""
Юнит-тесты для NutriCheck Analyzer (Task 2)
Покрывает парсинг CSV, расчет RDA, логику калькулятора и генератора рекомендаций.
"""
import unittest
import os
import sys

# Добавляем родительскую папку в пути импорта
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.rda_norms import get_rda, RDA_NORMS
from src.csv_reader import CSVFoodReader
from src.nutrient_calculator import NutrientCalculator
from src.deficit_analyzer import DeficitAnalyzer

class TestNutriCheckAnalyzer(unittest.TestCase):
    
    def setUp(self):
        # Временный CSV-файл для тестов
        self.test_csv_path = 'tests/temp_test_log.csv'
        os.makedirs('tests', exist_ok=True)
        
        with open(self.test_csv_path, 'w', encoding='utf-8') as f:
            f.write("Продукт;Вес (г)\n")
            f.write("Морковь;150\n")
            f.write("Шпинат;50\n")

    def tearDown(self):
        # Удаляем временный файл после тестов
        if os.path.exists(self.test_csv_path):
            os.remove(self.test_csv_path)
            
    def test_rda_calculations(self):
        """
        Проверяет правильность расчета суточных норм RDA с учетом возраста и пола
        """
        # Мужчина, 30 лет (базовый)
        vit_c_male_30 = get_rda('vitamin_c', 'male', 30, 'moderate')
        self.assertEqual(vit_c_male_30, 90.0)

        # Женщина, 30 лет
        vit_c_female_30 = get_rda('vitamin_c', 'female', 30, 'moderate')
        self.assertEqual(vit_c_female_30, 75.0)

        # Возрастной коэффициент для 14-18 лет (0.85)
        vit_c_teenager = get_rda('vitamin_c', 'male', 16, 'moderate')
        self.assertEqual(vit_c_teenager, round(90.0 * 0.85, 1))

        # Увеличенная норма витамина D для возраста > 50 лет (20.0 вместо 15.0)
        vit_d_elderly = get_rda('vitamin_d', 'male', 65, 'moderate')
        self.assertEqual(vit_d_elderly, 20.0)

    def test_csv_parser(self):
        """
        Проверяет корректность разбора CSV файлов
        """
        items = CSVFoodReader.read(self.test_csv_path)
        self.assertEqual(len(items), 2)
        
        self.assertEqual(items[0]['name'], 'Морковь')
        self.assertEqual(items[0]['amount_g'], 150.0)
        
        self.assertEqual(items[1]['name'], 'Шпинат')
        self.assertEqual(items[1]['amount_g'], 50.0)

    def test_nutrient_calculator(self):
        """
        Проверяет расчет потребления, КБЖУ и диет-балла
        """
        # Имитируем продукты с известными нутриентами
        food_items = [
            {
                'name': 'Тестовый Продукт 1',
                'amount_g': 200.0, # х2 от нутриентов на 100г
                'nutrients': {
                    'calories': 100.0,
                    'protein': 5.0,
                    'vitamin_c': 10.0, # 10 * 2 = 20мг съедено
                    'vitamin_d': 2.0,  # 2 * 2 = 4мкг съедено
                    'calcium': 50.0    # 50 * 2 = 100мг съедено
                }
            }
        ]

        result = NutrientCalculator.calculate(
            food_items, 
            gender='male', 
            age=30, 
            activity='moderate'
        )

        nutrients = result['nutrients']
        
        # Проверяем пересчет порции (200 грамм)
        self.assertEqual(nutrients['calories']['consumed'], 200.0)
        self.assertEqual(nutrients['protein']['consumed'], 10.0)
        self.assertEqual(nutrients['vitamin_c']['consumed'], 20.0)
        self.assertEqual(nutrients['vitamin_d']['consumed'], 4.0)

        # Проверяем процент покрытия нормы RDA (съедено 20мг при норме 90мг = 22%)
        expected_c_percent = int((20.0 / 90.0) * 100)
        self.assertEqual(nutrients['vitamin_c']['percent'], expected_c_percent)

    def test_deficit_analyzer(self):
        """
        Проверяет выявление критических и умеренных дефицитов
        """
        # Задаем искусственные расчеты, где Витамин C в дефиците (10% покрытия), а Кальций в норме (95%)
        calculated_data = {
            'nutrients': {
                'vitamin_c': {
                    'name': 'Витамин C',
                    'percent': 10,
                    'status': 'bad'
                },
                'calcium': {
                    'name': 'Кальций',
                    'percent': 95,
                    'status': 'good'
                }
            }
        }

        recommendations = DeficitAnalyzer.analyze(calculated_data)
        
        # Витамин C должен попасть в рекомендации
        self.assertEqual(len(recommendations), 1)
        self.assertEqual(recommendations[0]['key'], 'vitamin_c')
        self.assertEqual(recommendations[0]['severity'], 'critical') # <50% это critical
        self.assertIn('🍋', recommendations[0]['icon'])

if __name__ == '__main__':
    unittest.main()
