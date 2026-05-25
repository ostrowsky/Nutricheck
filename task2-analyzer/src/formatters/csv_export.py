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

        with open(file_path, 'w', encoding='utf-8', newline='') as f:
            writer = csv.writer(f, delimiter=';')
            
            # Заголовки
            writer.writerow(['Ключ Нутриента', 'Название нутриента', 'Потреблено', 'Норма RDA', 'Единица измерения', '% Покрытия', 'Статус'])

            for key, val in nutrients.items():
                writer.writerow([
                    key,
                    val['name'],
                    val['consumed'],
                    val['norm'],
                    val['unit'],
                    val['percent'],
                    val['status']
                ])
        
        print(f"[EXPORT] CSV отчёт сохранен: {file_path}")
