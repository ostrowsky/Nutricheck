# -*- coding: utf-8 -*-
"""
NutriCheck — Консольный анализатор витаминов и нутриентов питания
Главная точка входа.
"""
import argparse
import sys
import os
import io

# Переопределяем кодировку терминала на UTF-8, чтобы избежать UnicodeEncodeError на Windows
if sys.platform.startswith('win'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Добавляем текущую директорию в пути импорта Python
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.csv_reader import CSVFoodReader
from src.api_client import FoodSearchAPI
from src.nutrient_calculator import NutrientCalculator
from src.deficit_analyzer import DeficitAnalyzer
from src.formatters.console import ConsoleFormatter
from src.formatters.csv_export import CSVExporter
from src.formatters.json_export import JSONExporter

def main():
    parser = argparse.ArgumentParser(
        description="NutriCheck — Анализатор витаминов и нутриентов рациона питания на основе Open Food Facts API."
    )
    
    parser.add_argument(
        '-i', '--input', 
        type=str, 
        default='data/sample_food_log.csv',
        help="Путь к файлу CSV с дневником питания (по умолчанию: data/sample_food_log.csv)"
    )
    
    parser.add_argument(
        '-g', '--gender', 
        type=str, 
        choices=['male', 'female'], 
        default='male',
        help="Пол пользователя: male или female (по умолчанию: male)"
    )
    
    parser.add_argument(
        '-a', '--age', 
        type=int, 
        default=30,
        help="Возраст пользователя в годах (по умолчанию: 30)"
    )
    
    parser.add_argument(
        '-act', '--activity', 
        type=str, 
        choices=['sedentary', 'moderate', 'active'], 
        default='moderate',
        help="Уровень физической активности: sedentary, moderate, active (по умолчанию: moderate)"
    )

    parser.add_argument(
        '--csv-output',
        type=str,
        default='output/report.csv',
        help="Путь для сохранения CSV-отчёта (по умолчанию: output/report.csv)"
    )

    parser.add_argument(
        '--json-output',
        type=str,
        default='output/report.json',
        help="Путь для сохранения JSON-отчёта (по умолчанию: output/report.json)"
    )

    args = parser.parse_args()

    print("\n" + "=" * 60)
    print("🥗 Инициализация NutriCheck Analyzer...")
    print("=" * 60)

    # 1. Читаем CSV файл питания
    try:
        print(f"📖 Чтение CSV-файла: {args.input}...")
        food_items = CSVFoodReader.read(args.input)
        print(f"✅ Найдено позиций продуктов в CSV: {len(food_items)}")
    except Exception as e:
        print(f"❌ Ошибка при чтении CSV: {e}")
        sys.exit(1)

    # 2. Обогащаем данные через API Open Food Facts
    api_client = FoodSearchAPI()
    enriched_items = []
    
    print("\n🔍 Поиск пищевой ценности продуктов в базе Open Food Facts...")
    print("Это может занять немного времени при первом запуске (кэшируем результаты)...")
    
    total = len(food_items)
    for idx, item in enumerate(food_items, 1):
        name = item['name']
        # Простой текстовый прогресс-бар в консоли
        sys.stdout.write(f"\r[{idx}/{total}] Обогащение: {name[:30]:<30} ... ")
        sys.stdout.flush()

        try:
            product_data = api_client.search(name)
            if product_data:
                enriched_items.append({
                    'name': name,
                    'brand': product_data['brand'],
                    'amount_g': item['amount_g'],
                    'nutrients': product_data['nutrients']
                })
                sys.stdout.write("✅ OK")
            else:
                sys.stdout.write("⚠️ Не найден в API")
        except Exception as e:
            sys.stdout.write(f"❌ Ошибка: {e}")
        sys.stdout.write("\n")

    sys.stdout.flush()

    if not enriched_items:
        print("\n❌ Ни один продукт из списка не был найден в базе API или произошла сетевая ошибка.")
        sys.exit(1)

    print(f"\n📊 Успешно обогащено продуктов: {len(enriched_items)} из {len(food_items)}")

    # 3. Рассчитываем баланс питания и дефициты
    user_profile = {
        'gender': args.gender,
        'age': args.age,
        'activity': args.activity
    }
    
    calculated_data = NutrientCalculator.calculate(enriched_items, args.gender, args.age, args.activity)
    recommendations = DeficitAnalyzer.analyze(calculated_data)

    # 4. Выводим результаты в консоль
    ConsoleFormatter.format(calculated_data, recommendations, user_profile, enriched_items)

    # 5. Экспортируем результаты в файлы (CSV и JSON)
    # Создаем папку output, если она не существует
    os.makedirs(os.path.dirname(args.csv_output), exist_ok=True)
    os.makedirs(os.path.dirname(args.json_output), exist_ok=True)

    CSVExporter.export(calculated_data, args.csv_output)
    JSONExporter.export(calculated_data, recommendations, user_profile, enriched_items, args.json_output)

    print("\n🎉 Анализ успешно завершен!")

if __name__ == '__main__':
    main()
