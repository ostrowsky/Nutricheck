/**
 * NutriCheck — Радарная диаграмма на чистом Canvas 2D
 * 
 * Рисует многоугольную паутину (радар) покрытия витаминов.
 * Показывает баланс микронутриентов без использования внешних библиотек.
 */

// eslint-disable-next-line no-unused-vars
const RadarChartUI = {
  /**
   * Рисует радарную диаграмму
   * 
   * @param {HTMLCanvasElement} canvas — элемент canvas
   * @param {Object} calculatedData — результат расчёта нутриентов
   */
  draw(canvas, calculatedData) {
    const ctx = canvas.getContext('2d');
    const { nutrients } = calculatedData;

    // Выбираем витамины и минералы для осей радара (8 ключевых элементов)
    const axesKeys = [
      'vitamin_a', 'vitamin_c', 'vitamin_d', 'vitamin_e',
      'vitamin_b6', 'vitamin_b12', 'calcium', 'iron'
    ];

    const data = axesKeys.map(key => {
      const nut = nutrients[key];
      const meta = NUTRIENT_META[key];
      return {
        label: meta ? `${meta.icon} ${meta.name}` : key,
        percent: nut ? Math.min(nut.percent, 120) : 0 // ограничиваем визуально 120%
      };
    });

    // Настройки размеров и центра
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) * 0.35;
    const totalAxes = data.length;

    // Очистка холста
    ctx.clearRect(0, 0, width, height);

    // Включаем сглаживание
    ctx.imageSmoothingEnabled = true;

    // 1. Отрисовка фоновой сетки (концентрические многоугольники)
    const levels = 4; // 25%, 50%, 75%, 100%
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;

    for (let j = 1; j <= levels; j++) {
      const radius = (maxRadius / levels) * j;
      ctx.beginPath();
      
      for (let i = 0; i < totalAxes; i++) {
        const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();

      // Подписи процентов на сетке (по вертикальной оси)
      ctx.fillStyle = 'var(--text-muted)';
      ctx.font = '9px var(--font-family)';
      ctx.textAlign = 'center';
      ctx.fillText(`${j * 25}%`, centerX, centerY - radius + 12);
    }

    // 2. Рисуем оси
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    for (let i = 0; i < totalAxes; i++) {
      const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
      const x = centerX + Math.cos(angle) * maxRadius;
      const y = centerY + Math.sin(angle) * maxRadius;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();

      // 3. Подписи осей с иконками
      const labelRadius = maxRadius + 22;
      const lx = centerX + Math.cos(angle) * labelRadius;
      const ly = centerY + Math.sin(angle) * labelRadius;

      ctx.fillStyle = 'var(--text-primary)';
      ctx.font = '500 11px var(--font-family)';
      
      // Выравнивание текста в зависимости от угла осей
      if (Math.abs(Math.cos(angle)) < 0.1) {
        ctx.textAlign = 'center';
      } else if (Math.cos(angle) > 0) {
        ctx.textAlign = 'left';
      } else {
        ctx.textAlign = 'right';
      }
      
      ctx.fillText(data[i].label, lx, ly + 4);
    }

    // 4. Отрисовка полигона покрытия здоровья (съеденного) с анимацией
    // Запускаем плавную анимацию отрисовки полигона от центра к значениям
    let animationProgress = 0;
    const duration = 30; // 30 кадров (~500мс)
    
    function animatePolygon() {
      if (animationProgress > 1) return;
      
      // Очищаем область полигона перед каждым кадром (для простоты перерисовываем всё быстро)
      // В реальном приложении это можно оптимизировать, но для 8 точек Canvas работает мгновенно.
      ctx.clearRect(0, 0, width, height);
      
      // Повторяем отрисовку сетки и осей (чтобы анимация шла поверх)
      // Отрисовка сетки
      for (let j = 1; j <= levels; j++) {
        const radius = (maxRadius / levels) * j;
        ctx.beginPath();
        for (let i = 0; i < totalAxes; i++) {
          const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.stroke();
      }
      // Отрисовка осей и подписей
      for (let i = 0; i < totalAxes; i++) {
        const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
        const x = centerX + Math.cos(angle) * maxRadius;
        const y = centerY + Math.sin(angle) * maxRadius;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.stroke();

        const labelRadius = maxRadius + 22;
        const lx = centerX + Math.cos(angle) * labelRadius;
        const ly = centerY + Math.sin(angle) * labelRadius;
        ctx.fillStyle = 'var(--text-primary)';
        ctx.font = '500 11px var(--font-family)';
        if (Math.abs(Math.cos(angle)) < 0.1) ctx.textAlign = 'center';
        else if (Math.cos(angle) > 0) ctx.textAlign = 'left';
        else ctx.textAlign = 'right';
        ctx.fillText(data[i].label, lx, ly + 4);
      }

      // Отрисовка самого полигона
      ctx.beginPath();
      for (let i = 0; i < totalAxes; i++) {
        const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
        // Текущее значение радиуса с учётом прогресса анимации
        const currentRadius = (data[i].percent / 100) * maxRadius * animationProgress;
        const x = centerX + Math.cos(angle) * currentRadius;
        const y = centerY + Math.sin(angle) * currentRadius;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();

      // Полупрозрачный градиентный фон для полигона здоровья
      const polyGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, maxRadius);
      polyGrad.addColorStop(0, 'rgba(99, 102, 241, 0.15)'); // Индиго в центре
      polyGrad.addColorStop(1, 'rgba(34, 197, 94, 0.45)');   // Зеленый на краях (цель)
      ctx.fillStyle = polyGrad;
      ctx.fill();

      // Яркий контур полигона
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Рисуем маленькие круги на углах полигона
      for (let i = 0; i < totalAxes; i++) {
        const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
        const currentRadius = (data[i].percent / 100) * maxRadius * animationProgress;
        const x = centerX + Math.cos(angle) * currentRadius;
        const y = centerY + Math.sin(angle) * currentRadius;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = 'var(--color-good)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      animationProgress += 1 / duration;
      requestAnimationFrame(animatePolygon);
    }

    // Запускаем анимацию
    animatePolygon();
  }
};
