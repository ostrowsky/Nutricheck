# NutriCheck — тестовое задание для РЕДАНТ

**Репозиторий:** https://github.com/ostrowsky/Nutricheck  
**Google Таблица для проверки задачи 3:** https://docs.google.com/spreadsheets/d/1QASAQQY7Jhy2rEpzxLtznm8Dr1LAavk_X6plF2HZo6g/edit?usp=sharing

**NutriCheck** — единое связанное приложение для анализа питания, витаминов и нутриентов. Проект показывает полный рабочий сценарий: данные можно внести в Google Таблицу, обогатить через внешний API, проанализировать Python-скриптом и визуализировать в веб-интерфейсе.

Проект закрывает все 3 обязательные задачи тестового задания:

1. **Веб-утилита:** `task1-web/` — интерактивный dashboard на HTML/CSS/JavaScript.
2. **Python + внешний API + Docker:** `task2-analyzer/` — CLI-анализатор питания с Open Food Facts API.
3. **Apps Script + внешний API в Google Таблице:** `task3-apps-script/` — автоматизация Google Sheets через `UrlFetchApp`.

---

## 1. Быстрые ссылки для проверки

| Что проверить | Ссылка / путь |
|---|---|
| Репозиторий | https://github.com/ostrowsky/Nutricheck |
| Google Таблица | https://docs.google.com/spreadsheets/d/1QASAQQY7Jhy2rEpzxLtznm8Dr1LAavk_X6plF2HZo6g/edit?usp=sharing |
| Задача 1: Web | `task1-web/` |
| Задача 2: Python/Docker | `task2-analyzer/` |
| Задача 3: Apps Script | `task3-apps-script/Code.gs` |
| Демонстрационный сценарий | `DEMO_GUIDE.md` |
| Документ сдачи | `SUBMISSION.md` |

---

## 2. Единый сценарий работы приложения

```text
Google Sheets / Apps Script
        ↓ экспорт или импорт CSV
Python Analyzer / Docker
        ↓ report.json + report.csv
Web Dashboard / Browser UI
```

Сценарий демонстрации:

1. В Google Таблице заполняется дневник питания: дата, продукт, вес.
2. Apps Script обогащает строки через Open Food Facts API: калории, белки, жиры, углеводы, витамины, минералы и статус обработки.
3. Python-анализатор повторяемо считает покрытие норм RDA и сохраняет `report.csv` / `report.json`.
4. Web Dashboard импортирует CSV/JSON и показывает покрытие нутриентов, дефициты и визуализацию.

---

## 3. Скриншоты результата

### 3.1 Web Dashboard

На веб-странице доступны:

- импорт CSV/JSON;
- добавление продуктов;
- расчёт покрытия витаминов и нутриентов;
- radar chart;
- детализация нутриентов.

Открытие после запуска:

```text
http://localhost:3000
```
<img width="1503" height="980" alt="image" src="https://github.com/user-attachments/assets/463b8566-5007-49ea-ae00-3849864a90b3" />

### 3.2 Google Sheets + Apps Script

Google Таблица открыта для просмотра:

```text
https://docs.google.com/spreadsheets/d/1QASAQQY7Jhy2rEpzxLtznm8Dr1LAavk_X6plF2HZo6g/edit?usp=sharing
```

В таблице демонстрируются:

- лист `Дневник`;
- строки с продуктами и весом;
- автоматическое обогащение через Open Food Facts;
- заполнение калорий, БЖУ, витаминов и минералов;
- статус `✅ Обогащено` или ошибка в отдельном столбце.

<img width="1412" height="278" alt="image" src="https://github.com/user-attachments/assets/0bb2995e-cd0a-49fc-8737-2d0e623db0f5" />


### 3.3 Python CLI report

![Python CLI Report](docs/screenshots/01-python-cli-report.png)

Скриншот показывает:

- обращение к Open Food Facts API;
- успешное обогащение продуктов;
- итоговую оценку рациона;
- таблицы КБЖУ, витаминов и минералов.

<img width="820" height="963" alt="image" src="https://github.com/user-attachments/assets/1248d9bb-da77-4496-b33b-0761ed3d7927" />


## 4. Структура проекта

```text
Nutricheck/
├── task1-web/                  # Задача 1: веб-утилита
│   ├── index.html
│   ├── server.js
│   ├── test-runner.html
│   ├── css/
│   └── js/
├── task2-analyzer/             # Задача 2: Python + API + Docker
│   ├── main.py
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── data/
│   ├── output/
│   ├── src/
│   └── tests/
├── task3-apps-script/          # Задача 3: Google Apps Script
│   ├── Code.gs
│   └── README.md
├── docs/
│   ├── screenshots/
│   └── specs/
├── DEMO_GUIDE.md
├── SUBMISSION.md
├── AGENTS.md
└── README.md
```

---

## 5. Задача 1 — веб-утилита

### Назначение

`task1-web` — интерактивная веб-страница для анализа рациона: добавление продуктов, импорт данных, расчёт покрытия нутриентов и визуализация дефицитов.

### Запуск

```bash
cd task1-web
node server.js
```

Открыть:

```text
http://localhost:3000
```

Автотесты фронтенда:

```text
http://localhost:3000/test-runner.html
```

### Что демонстрирует задача

- полноценную веб-страницу HTML/CSS/JS;
- нетривиальную клиентскую логику;
- импорт CSV/JSON;
- расчёт нутриентов по весу продукта;
- расчёт процента покрытия норм;
- визуализацию на Canvas;
- обработку ошибок и пустых состояний;
- структурированный код вместо одной «портянки».

### Процесс работы с Claude Code

При разработке использовался Claude Code как помощник для быстрого прототипирования. Основные промпты были про архитектуру файлов, разбиение логики на модули, реализацию импорта CSV/JSON и расчёт покрытия нутриентов. AI быстро собрал каркас интерфейса и базовую логику, но часть поведения была доработана вручную: нормализация данных, обработка пустых API-полей, читаемые статусы и демонстрационный сценарий. Также вручную проверялась корректность расчётов покрытия RDA и удобство запуска локально.

Примеры ключевых промптов:

```text
Собери небольшую веб-утилиту для анализа рациона: HTML/CSS/JS, импорт CSV/JSON, расчёт покрытия витаминов и radar chart.
```

```text
Раздели фронтенд на модули: данные продуктов, расчёты нутриентов, импорт CSV/JSON, отрисовка графика и UI-состояния.
```

```text
Добавь обработку ошибок: пустой список продуктов, некорректный CSV, отсутствующие нутриенты, невозможность найти продукт в API.
```

Claude Code использовался не как «сгенерировать и сдать», а как ускоритель разработки с последующей проверкой, рефакторингом и ручной доработкой результата.

---

## 6. Задача 2 — Python-скрипт + внешний API + Docker

### Назначение

`task2-analyzer` — Python CLI-анализатор, который берёт дневник питания из CSV, обращается к Open Food Facts API, обрабатывает нутриенты и выводит структурированный отчёт.

### Локальный запуск

```bash
cd task2-analyzer
python -m pip install -r requirements.txt
python main.py --input data/sample_food_log.csv --gender male --age 32 --activity moderate
```

### Запуск тестов

```bash
python -m unittest tests/test_analyzer.py
```

### Docker

Сборка:

```bash
docker build -t nutricheck-analyzer .
```

Запуск на демо-данных:

```bash
docker run --rm nutricheck-analyzer --gender male --age 32 --activity moderate
```

Запуск со своим CSV:

```bash
docker run --rm -v $(pwd)/data:/app/data nutricheck-analyzer --input data/my_diary.csv --gender male --age 32 --activity moderate
```

### Выходные файлы

После запуска создаются:

```text
output/report.csv
output/report.json
output/example_run.txt
```

`report.json` можно импортировать в веб-дашборд через кнопку **Импорт JSON**.

### Что демонстрирует задача

- HTTP-запросы к публичному API;
- обработку JSON-ответа;
- фильтрацию и нормализацию данных;
- агрегацию нутриентов;
- расчёт покрытия норм RDA;
- обработку сетевых ошибок и отсутствующих данных;
- Dockerfile и воспроизводимый запуск;
- читаемый консольный вывод и экспорт результата.

---

## 7. Задача 3 — Apps Script + внешний API в Google Таблице

### Ссылка на таблицу

Google Таблица открыта для просмотра:

```text
https://docs.google.com/spreadsheets/d/1QASAQQY7Jhy2rEpzxLtznm8Dr1LAavk_X6plF2HZo6g/edit?usp=sharing
```

### Назначение

`task3-apps-script` — скрипт для Google Таблицы, который обогащает строки дневника питания через Open Food Facts API и записывает обработанные данные в структурированном виде.

### Развёртывание

1. Создать Google Таблицу или открыть готовую таблицу выше.
2. Переименовать первый лист в `Дневник`.
3. Создать шапку:

```text
Дата | Продукт | Вес (г) | Калории | Белок | Жиры | Углеводы | Витамин A | Витамин C | Витамин D | Кальций | Железо | Статус
```

4. Открыть `Расширения → Apps Script`.
5. Вставить код из `task3-apps-script/Code.gs`.
6. Сохранить проект.
7. Обновить таблицу.
8. В меню появится пункт `NutriCheck`.
9. Запустить `NutriCheck → Обогатить продукты`.

### Что демонстрирует задача

- кастомное меню через `onOpen()`;
- запуск обработки по кнопке/меню;
- `UrlFetchApp` для внешнего API;
- парсинг JSON;
- пакетную обработку строк через `getValues()` / `setValues()`;
- запись результата в столбцы D–M;
- статус `✅ Обогащено` или ошибку в отдельном столбце.

---

## 8. Единый сценарий демонстрации

### Шаг 1. Google Sheets

Открыть таблицу:

```text
https://docs.google.com/spreadsheets/d/1QASAQQY7Jhy2rEpzxLtznm8Dr1LAavk_X6plF2HZo6g/edit?usp=sharing
```

Добавить строки:

```text
25.05.2026 | Chocapic           | 50
25.05.2026 | Frosties Kellogg's | 40
25.05.2026 | Crunch Nestle      | 50
```

Запустить:

```text
NutriCheck → Обогатить продукты
```

Ожидаемый результат: таблица заполняет калории, белки, жиры, углеводы, витамин D, кальций, железо и статус.

### Шаг 2. Python CLI

```bash
cd task2-analyzer
python main.py --input data/sample_food_log.csv --gender male --age 32 --activity moderate
```

Ожидаемый результат: консольный отчёт и файлы:

```text
output/report.csv
output/report.json
```

### Шаг 3. Web Dashboard

```bash
cd task1-web
node server.js
```

Открыть:

```text
http://localhost:3000
```

Далее импортировать:

```text
task2-analyzer/output/report.json
```

через кнопку **Импорт JSON**.

---

## 9. Соответствие тестовому заданию

| Требование | Где выполнено | Статус |
|---|---|---:|
| Веб-страница HTML/CSS/JS | `task1-web/` | ✅ |
| Нетривиальная логика | расчёт RDA, импорт CSV/JSON, Canvas-график | ✅ |
| Описание Claude Code процесса | этот README, `SUBMISSION.md` | ✅ |
| Python-скрипт с внешним API | `task2-analyzer/main.py`, `src/` | ✅ |
| JSON parsing и обработка данных | Open Food Facts → нутриенты → RDA | ✅ |
| Обработка ошибок API | timeout/status/fallback handling | ✅ |
| Dockerfile | `task2-analyzer/Dockerfile` | ✅ |
| requirements.txt | `task2-analyzer/requirements.txt` | ✅ |
| Apps Script + UrlFetchApp | `task3-apps-script/Code.gs` | ✅ |
| Триггер / меню | `onOpen()` + меню `NutriCheck` | ✅ |
| Запись данных в таблицу | лист `Дневник`, столбцы D–M | ✅ |
| Ссылка на Google Таблицу | указана в этом README | ✅ |
| Инструкция и структура сдачи | README, `SUBMISSION.md`, `DEMO_GUIDE.md` | ✅ |
| Исходные коды | папки `task1-web`, `task2-analyzer`, `task3-apps-script` | ✅ |
| Пример результата | скриншоты, Google Таблица, `output/` | ✅ |

---

## 10. Соответствие вакансии РЕДАНТ

| Требование вакансии | Как проект это показывает |
|---|---|
| Python | CLI-анализатор, парсинг CSV, API-клиент, отчёты |
| JavaScript | Web Dashboard на Vanilla JS, Apps Script |
| Работа с API | Open Food Facts в Python, JS и Apps Script |
| Docker | Dockerfile и запуск CLI в контейнере |
| Google Таблицы | Apps Script, меню, обработка строк, статусы |
| Apps Script | `Code.gs`, `UrlFetchApp`, триггер `onOpen()` |
| Читаемый код | отдельные папки по задачам, `src/`, `tests/`, docs |
| AI-инструменты | описан процесс работы с Claude Code |
| Проактивность | три задачи объединены в один продуктовый сценарий |
| Разный стек | HTML/CSS/JS + Python + Docker + Apps Script |
| Прикладная бизнес-задача | анализ питания, витаминов и дефицитов |
| Быстрое освоение нового | связка API, таблиц, Docker и фронтенда в одном решении |

---

## 11. Что особенно важно показать на собеседовании

1. Проект не состоит из трёх разрозненных решений: это единый поток данных.
2. API используется осмысленно: продукт ищется, нутриенты нормализуются под вес порции, результат агрегируется.
3. Есть обработка ошибок: API может не найти продукт, сеть может упасть, таблица может содержать пустые строки.
4. Есть Docker, тесты, документация и демонстрационный сценарий.
5. Проект близок к задачам РЕДАНТ: витамины, нутриенты, Google Sheets, автоматизация, прикладная аналитика, возможная основа для ботов и AI-агентов.

---

## 12. Ограничения и возможные улучшения

Текущая версия — тестовое задание, не production-система. Для рабочего использования можно добавить:

- авторизацию пользователей;
- серверную БД вместо локальных файлов;
- кэширование Open Food Facts между запусками;
- CI/CD-пайплайн;
- мониторинг ошибок API;
- Telegram/WhatsApp-бота для ввода дневника;
- AI-агента, который по отчёту формирует уточняющие вопросы и рекомендации для специалиста;
- более строгую валидацию продуктовых данных;
- настройку индивидуальных норм витаминов под медицинские ограничения.

---

## 13. Время выполнения

| Этап | Время |
|---|---:|
| Проектирование общей идеи | 15–20 мин |
| Задача 1: Web Dashboard | 2–2.5 ч |
| Задача 2: Python + Docker | 1.5–2 ч |
| Задача 3: Apps Script | 1 ч |
| Документация, тесты, сборка | 1 ч |
| Итого | 5.5–6.5 ч |

---

## 14. Команды для быстрой проверки

```bash
# Web
cd task1-web
node server.js
```

```bash
# Python local
cd task2-analyzer
python -m pip install -r requirements.txt
python -m unittest tests/test_analyzer.py
python main.py --input data/sample_food_log.csv --gender male --age 32 --activity moderate
```

```bash
# Docker
cd task2-analyzer
docker build -t nutricheck-analyzer .
docker run --rm nutricheck-analyzer --gender male --age 32 --activity moderate
```

---

## 15. Формат сдачи

Для проверки можно отправить:

```text
Репозиторий: https://github.com/ostrowsky/Nutricheck
Google Таблица: https://docs.google.com/spreadsheets/d/1QASAQQY7Jhy2rEpzxLtznm8Dr1LAavk_X6plF2HZo6g/edit?usp=sharing
```

В репозитории находятся:

- исходный код веб-утилиты;
- исходный код Python-анализатора;
- Dockerfile и `requirements.txt`;
- код Apps Script;
- документация по запуску;
- демонстрационный сценарий;
- скриншоты результата.

---

## 16. Финальное резюме

NutriCheck демонстрирует выполнение всех трёх задач как единого приложения: сбор данных в Google Sheets, аналитика в Python/Docker и визуализация в веб-интерфейсе. Для вакансии РЕДАНТ проект показывает способность быстро собрать рабочий бизнес-инструмент на разном стеке, интегрировать внешние API, автоматизировать Google Таблицы и оформить решение так, чтобы его можно было проверить внешне.
