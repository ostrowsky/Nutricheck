# -*- coding: utf-8 -*-
"""
NutriCheck — Модуль запросов к API Open Food Facts на Python
Включает кеширование, обработку таймаутов и логику повторных попыток (retries).
"""
import requests
import time

class FoodSearchAPI:
    BASE_URL = 'https://world.openfoodfacts.org/cgi/search.pl'
    
    def __init__(self):
        # Кеш продуктов в памяти, чтобы не делать повторные сетевые запросы
        self.cache = {}
        self.headers = {
            'User-Agent': 'NutriCheck - Python Task - Version 1.0',
            'Accept': 'application/json'
        }

    def search(self, query, max_retries=3, delay=1.0):
        """
        Ищет продукт по названию в базе Open Food Facts с ретраями
        """
        query = query.strip()
        if not query or len(query) < 2:
            return None

        # Проверяем в кеше
        if query.lower() in self.cache:
            return self.cache[query.lower()]

        params = {
            'search_terms': query,
            'search_simple': '1',
            'action': 'process',
            'json': '1',
            'page_size': '1', # Нам нужен только первый самый подходящий результат
            'fields': 'product_name,brands,nutriments,code'
        }

        for attempt in range(max_retries):
            try:
                response = requests.get(
                    self.BASE_URL,
                    params=params,
                    headers=self.headers,
                    timeout=6.0 # таймаут 6 секунд
                )

                if response.status_code == 200:
                    data = response.json()
                    
                    if not data.get('products'):
                        self.cache[query.lower()] = None
                        return None

                    raw_product = data['products'][0]
                    nutriments = raw_product.get('nutriments', {})

                    # Собираем и конвертируем данные (г -> мг/мкг)
                    product = {
                        'id': raw_product.get('code', 'unknown'),
                        'name': raw_product.get('product_name', 'Неизвестный продукт'),
                        'brand': raw_product.get('brands', 'Собственное производство / Бренд не указан'),
                        'nutrients': {
                            'calories': float(nutriments.get('energy-kcal_100g', 0)) or float(nutriments.get('energy_100g', 0) / 4.184) or 0.0,
                            'protein': float(nutriments.get('proteins_100g', 0.0)),
                            'fat': float(nutriments.get('fat_100g', 0.0)),
                            'carbs': float(nutriments.get('carbohydrates_100g', 0.0)),
                            'fiber': float(nutriments.get('fiber_100g', 0.0)),

                            # Витамины (г -> мкг/мг)
                            'vitamin_a': float(nutriments.get('vitamin-a_100g', 0.0)) * 1000000,
                            'vitamin_c': float(nutriments.get('vitamin-c_100g', 0.0)) * 1000,
                            'vitamin_d': float(nutriments.get('vitamin-d_100g', 0.0)) * 1000000,
                            'vitamin_e': float(nutriments.get('vitamin-e_100g', 0.0)) * 1000,
                            'vitamin_k': float(nutriments.get('vitamin-k_100g', 0.0)) * 1000000,
                            'vitamin_b1': float(nutriments.get('vitamin-b1_100g', 0.0)) * 1000,
                            'vitamin_b2': float(nutriments.get('vitamin-b2_100g', 0.0)) * 1000,
                            'vitamin_b6': float(nutriments.get('vitamin-b6_100g', 0.0)) * 1000,
                            'vitamin_b12': float(nutriments.get('vitamin-b12_100g', 0.0)) * 1000000,
                            'folate': float(nutriments.get('vitamin-b9_100g', 0.0)) * 1000000,

                            # Минералы
                            'calcium': float(nutriments.get('calcium_100g', 0.0)) * 1000,
                            'iron': float(nutriments.get('iron_100g', 0.0)) * 1000,
                            'magnesium': float(nutriments.get('magnesium_100g', 0.0)) * 1000,
                            'zinc': float(nutriments.get('zinc_100g', 0.0)) * 1000,
                            'potassium': float(nutriments.get('potassium_100g', 0.0)) * 1000,
                            'sodium': float(nutriments.get('sodium_100g', 0.0)) * 1000,
                        }
                    }

                    # Сохраняем в кеш
                    self.cache[query.lower()] = product
                    return product
                
                # Если статус-код не 200, кидаем ошибку для срабатывания ретрая
                response.raise_for_status()

            except (requests.RequestException, ValueError) as e:
                print(f"[API WARN] Попытка {attempt + 1}/{max_retries} не удалась при поиске '{query}': {e}")
                if attempt < max_retries - 1:
                    time.sleep(delay * (attempt + 1)) # Экспоненциальное увеличение задержки ретраев
                else:
                    print(f"[API ERROR] Не удалось получить данные для '{query}' после {max_retries} попыток.")
        
        self.cache[query.lower()] = None
        return None
