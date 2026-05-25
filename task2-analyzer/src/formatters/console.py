# -*- coding: utf-8 -*-
"""
NutriCheck — Модуль форматирования вывода в консоль на Python
Использует tabulate для таблиц и colorama для цветов.
"""
from tabulate import tabulate
from colorama import init, Fore, Style

# Инициализируем colorama с автосбросом стилей после каждого принта
init(autoreset=True)

class ConsoleFormatter:
    @staticmethod
    def format(calculated_data, recommendations, user_profile, food_items):
        """
        Печатает красивый, структурированный отчет в консоль
        """
        gender_ru = 'Мужской' if user_profile['gender'] == 'male' else 'Женский'
        activity_ru = {
            'sedentary': 'Низкая',
            'moderate': 'Средняя',
            'active': 'Высокая'
        }.get(user_profile['activity'], 'Средняя')

        print("\n" + "=" * 60)
        print(f"{Fore.GREEN}{Style.BRIGHT}         NutriCheck — Аналитический отчет питания")
        print("=" * 60)
        print(f" Профиль: Пол: {Fore.CYAN}{gender_ru}{Style.RESET_ALL} | Возраст: {Fore.CYAN}{user_profile['age']}{Style.RESET_ALL} | Активность: {Fore.CYAN}{activity_ru}")
        print(f" Проанализировано продуктов: {Fore.YELLOW}{len(food_items)} шт.{Style.RESET_ALL}")
        
        # Общий диет-балл
        score = calculated_data['diet_score']
        score_color = Fore.RED if score < 50 else (Fore.YELLOW if score < 80 else Fore.GREEN)
        print(f" Итоговая оценка диеты: {score_color}{Style.BRIGHT}{score}/100")
        print("-" * 60)

        # 1. Таблица макронутриентов
        print(f"\n{Fore.GREEN}{Style.BRIGHT}📊 Энергия и КБЖУ:")
        macro_keys = ['calories', 'protein', 'fat', 'carbs', 'fiber']
        macro_table = []

        for key in macro_keys:
            nut = calculated_data['nutrients'][key]
            pct = nut['percent']
            
            # Цветовой статус прогресс-бара
            bar_color = Fore.RED if pct < 50 else (Fore.YELLOW if pct < 80 else Fore.GREEN)
            
            # Строим текстовый мини-прогрессбар
            filled_blocks = int(min(pct, 100) / 10)
            bar = f"[{bar_color}{'█' * filled_blocks}{Style.RESET_ALL}{'.' * (10 - filled_blocks)}]"
            
            macro_table.append([
                nut['name'],
                f"{nut['consumed']} {nut['unit']}",
                f"{nut['norm']} {nut['unit']}",
                bar,
                f"{bar_color}{pct}%"
            ])

        print(tabulate(
            macro_table, 
            headers=['Нутриент', 'Потреблено', 'Норма RDA', 'Шкала', '% Покрытия'],
            tablefmt='simple'
        ))

        # 2. Таблица микронутриентов (витамины и минералы)
        print(f"\n{Fore.GREEN}{Style.BRIGHT}💊 Микронутриенты (Витамины и Минералы):")
        micro_keys = [
            'vitamin_a', 'vitamin_c', 'vitamin_d', 'vitamin_e', 'vitamin_k',
            'vitamin_b1', 'vitamin_b2', 'vitamin_b6', 'vitamin_b12', 'folate',
            'calcium', 'iron', 'magnesium', 'zinc', 'potassium'
        ]
        micro_table = []

        for key in micro_keys:
            nut = calculated_data['nutrients'][key]
            pct = nut['percent']
            bar_color = Fore.RED if pct < 50 else (Fore.YELLOW if pct < 80 else Fore.GREEN)
            
            filled_blocks = int(min(pct, 100) / 10)
            bar = f"[{bar_color}{'█' * filled_blocks}{Style.RESET_ALL}{'.' * (10 - filled_blocks)}]"

            micro_table.append([
                nut['name'],
                f"{nut['consumed']} {nut['unit']}",
                f"{nut['norm']} {nut['unit']}",
                bar,
                f"{bar_color}{pct}%"
            ])

        print(tabulate(
            micro_table, 
            headers=['Нутриент', 'Потреблено', 'Норма RDA', 'Шкала', '% Покрытия'],
            tablefmt='simple'
        ))

        # 3. Блок рекомендаций по дефицитам
        if recommendations:
            print(f"\n{Fore.RED}{Style.BRIGHT}⚠️ Выявленные дефициты и рекомендации:")
            print("-" * 60)
            
            for idx, rec in enumerate(recommendations, 1):
                severity_label = f"{Fore.RED}[КРИТИЧЕСКИЙ]" if rec['severity'] == 'critical' else f"{Fore.YELLOW}[УМЕРЕННЫЙ]"
                
                print(f" {idx}. {rec['icon']} {Style.BRIGHT}{rec['name']}{Style.RESET_ALL} — {severity_label} {Fore.WHITE}{rec['percent']}% от нормы.")
                print(f"    ℹ️ {Fore.LIGHTBLACK_EX}{rec['desc']}")
                print(f"    💡 {Fore.GREEN}Рекомендуемые продукты: {', '.join(rec['foods'])}")
                print()
        else:
            print(f"\n{Fore.GREEN}{Style.BRIGHT}🎉 Отлично! У вас не выявлено выраженных витаминных дефицитов.")
        
        print("=" * 60)
