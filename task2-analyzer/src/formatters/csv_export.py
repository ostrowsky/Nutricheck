# -*- coding: utf-8 -*-
"""
NutriCheck — Модуль экспорта отчета в CSV на Python
"""
import csv

class CSVExporter:
    @staticmethod
    def export(calculated_data, file_path):
        """
        Сохраняет детализированный отчет о покрытии нутриентов в CSV-файл
        """
        nutrients = calculated_data['nutrients']

        # Десятичная запятая, чтобы Excel в русской локали не принимал числа за даты (25.8 -> 25 авг)
        def ru_num(value):
            return str(value).replace('.', ',')

        # utf-8-sig добавляет BOM — иначе русский Excel открывает CSV в Windows-1251 (кракозябры)
        with open(file_path, 'w', encoding='utf-8-sig', newline='') as f:
            writer = csv.writer(f, delimiter=';')

            # Заголовки
            writer.writerow(['Ключ Нутриента', 'Название нутриента', 'Потреблено', 'Норма RDA', 'Единица измерения', '% Покрытия', 'Статус'])

            for key, val in nutrients.items():
                writer.writerow([
                    key,
                    val['name'],
                    ru_num(val['consumed']),
                    ru_num(val['norm']),
                    val['unit'],
                    val['percent'],
                    val['status']
                ])
        
        print(f"[EXPORT] CSV отчёт сохранен: {file_path}")
