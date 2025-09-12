self.addEventListener('message', (e) => {
  const { timeTicks, timeGap, priceTicks, priceGap, initPrice: price, initTime: time, volatility } = e.data;

  const result = [];

  try {
    timeTicks.forEach((txMin) => {
      priceTicks.forEach((tyMin) => {
        const phit = calPHit(price, time, tyMin, tyMin + priceGap, txMin, txMin + timeGap, volatility);
        const data = {
          price: tyMin,
          time: txMin,
          hit: phit,
        };

        result.push(data);
      });
    });

    self.postMessage(result);
  } catch (error) {
    self.postMessage([]);
  }
});

// 方案3：优化版的动态规划（平衡准确性和速度）
function calculatePriceProbabilityDPOptimized(
  initialPrice,
  currentTime,
  gridPriceMin,
  gridPriceMax,
  gridStartTime,
  gridEndTime,
  volatility
) {
  let stepStart = Math.floor((gridStartTime - currentTime) / 500);
  stepStart = Math.max(1, stepStart);
  const stepEnd = Math.floor((gridEndTime - currentTime) / 500);

  const y0 = Math.log(initialPrice);
  const a = Math.log(gridPriceMin);
  const b = Math.log(gridPriceMax);

  // 使用更少的网格点但更智能的范围选择
  const nPoints = 100;
  const yMin = Math.min(y0 - 4 * volatility * Math.sqrt(stepEnd), a - 2 * volatility);
  const yMax = Math.max(y0 + 4 * volatility * Math.sqrt(stepEnd), b + 2 * volatility);
  const dy = (yMax - yMin) / (nPoints - 1);

  let p = new Array(nPoints).fill(0);
  const idx0 = Math.floor((y0 - yMin) / dy);
  p[idx0] = 1.0;

  // 预计算转移矩阵
  const transition = precomputeTransitionMatrix(nPoints, yMin, dy, volatility);

  for (let t = 1; t <= stepEnd; t++) {
    const pNew = new Array(nPoints).fill(0);
    for (let i = 0; i < nPoints; i++) {
      if (p[i] === 0) continue;
      for (let j = 0; j < nPoints; j++) {
        pNew[j] += p[i] * transition[i][j];
      }
    }

    if (t >= stepStart) {
      for (let j = 0; j < nPoints; j++) {
        const y_j = yMin + j * dy;
        if (y_j >= a && y_j <= b) {
          pNew[j] = 0;
        }
      }
    }
    p = pNew;
  }

  const probNeverHit = p.reduce((sum, val) => sum + val, 0);
  return 1 - probNeverHit;
}

function precomputeTransitionMatrix(n, yMin, dy, volatility) {
  const matrix = Array.from({ length: n }, () => new Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    const mean = yMin + i * dy;
    let sum = 0;
    for (let j = 0; j < n; j++) {
      const y = yMin + j * dy;
      // 使用标准正态分布密度函数
      const z = (y - mean) / volatility;
      const density = (Math.exp(-0.5 * z * z) / (Math.sqrt(2 * Math.PI) * volatility)) * dy;
      matrix[i][j] = density;
      sum += density;
    }
    // 归一化
    for (let j = 0; j < n; j++) {
      matrix[i][j] /= sum;
    }
  }
  return matrix;
}

function calPHit(initialPrice, currentTime, gridPriceMin, gridPriceMax, gridStartTime, gridEndTime, volatility) {
  const result = calculatePriceProbabilityDPOptimized(
    initialPrice,
    currentTime,
    gridPriceMin,
    gridPriceMax,
    gridStartTime,
    gridEndTime,
    volatility
  );
  const pHit = Math.max(0.001, Math.min(0.999, result)); // 最低0.01%,最高99.9%

  const odds = (1.0 / pHit) * (1 - 0.03);
  return Math.max(1.02, odds);
}
