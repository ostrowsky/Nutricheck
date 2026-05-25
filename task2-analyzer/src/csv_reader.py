# -*- coding: utf-8 -*-
"""
NutriCheck — Модуль парсинга CSV-дневников питания на Python
"""
import csv
import os

class CSVFoodReader:
    @staticmethod
    def read(file_path):
        """
        Читает CSV-файл питания, возвращает список продуктов и веса порций
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Файл лога питания не найден по пути: {file_path}")

        items = []

        # Сначала считываем сырой контент, чтобы определить разделитель
        with open(file_path, 'r', encoding='utf-8') as f:
            sample = f.read(2048)
            f.seek(0)
            
            # Определяем разделитель
            delimiter = ';' if ';' in sample.split('\n')[0] else ','

        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.reader(f, delimiter=delimiter)
            
            # Читаем заголовки
            try:
                headers = [h.strip().lower() for h in next(reader)]
            except StopIteration:
                raise ValueError("Файл CSV пуст")

            # Ищем нужные индексы
            product_idx = -1
            amount_idx = -1

            for idx, h in enumerate(headers):
                if 'продукт' in h or 'product' in h or 'название' in h:
                    product_idx = idx
                elif 'вес' in h or 'кол-во' in h or 'amount' in h or 'weight' in h or 'грамм' in h:
                    amount_idx = idx

            if product_idx == -1:
                raise ValueError("В файле CSV не найдена колонка с названием продукта (заголовок должен содержать 'Продукт')")

            # Читаем строки данных
            for line_num, row in enumerate(reader, start=2):
                if not row or len(row) <= product_idx:
                    continue

                product_name = row[product_idx].strip()
                if not product_name:
                    continue

                amount = 100.0  # дефолтный вес порции
                if amount_idx != -1 and len(row) > amount_idx:
                    try:
                        parsed_amount = float(row[amount_idx].replace(',', '.').strip())
                        if parsed_amount > 0:
                            amount = parsed_amount
                    except ValueError:
                        print(f"[CSV WARN] Строка {line_num}: некорректный вес '{row[amount_idx]}', использовано значение по умолчанию 100г")

                items.append({
                    'name': product_name,
                    'amount_g': amount
                })

        return items
