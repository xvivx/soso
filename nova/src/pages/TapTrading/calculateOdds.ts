// 此文件用于计算价格区间命中概率，目前处于停用状态，保留以备后续可能使用

// 标准正态密度函数
function normalPdf(x: number, sd: number) {
  return Math.exp((-0.5 * (x * x)) / (sd * sd)) / (Math.sqrt(2 * Math.PI) * sd);
}

// 价格区间命中概率计算函数
export function probHitIntervalAtLeastOnce_DP(
  S0: number,
  currentTime: number,
  gridPriceMin: number,
  gridPriceMax: number,
  gridStartTime: number,
  gridEndTime: number,
  sigma: number
) {
  // 计算开始和结束步数
  let stepStart = Math.floor((gridStartTime - currentTime) / 500);
  stepStart = Math.max(1, stepStart);
  const stepEnd = Math.floor((gridEndTime - currentTime) / 500);

  // 处理sigma为0的情况（确定性情况）
  if (sigma === 0.0) {
    for (let t = stepStart; t <= stepEnd; t++) {
      const xt = Math.log(S0);
      const St = Math.exp(xt);
      if (St >= gridPriceMin && St <= gridPriceMax) return 1.0;
    }
    return 0.0;
  }

  // 参数与网格设置
  const LOGS0 = Math.log(S0);
  const a = Math.log(gridPriceMin);
  const b = Math.log(gridPriceMax);
  const m = stepEnd - stepStart; // 剩余步数要检查的个数

  const meanAtStart = LOGS0;
  const varStart = sigma * sigma * stepStart;
  const varEnd = sigma * sigma * stepEnd;
  const totalStd = Math.sqrt(varEnd);

  // 网格范围设置
  const RANGE_MULT = 8.0;
  let low = meanAtStart - RANGE_MULT * totalStd;
  let high = meanAtStart + RANGE_MULT * totalStd;
  const margin = Math.max(5.0 * sigma, 1e-6);
  low = Math.min(low, a - margin);
  high = Math.max(high, b + margin);

  // 网格步长和点数
  const DESIRED_DX = sigma / 10.0;
  const MAX_GRID_POINTS = 71;
  let N = Math.ceil((high - low) / DESIRED_DX) + 1;
  if (N < 200) N = 200;
  if (N > MAX_GRID_POINTS) N = MAX_GRID_POINTS;
  const dx = (high - low) / (N - 1);

  // 创建网格坐标
  const xs = new Array(N);
  for (let i = 0; i < N; i++) {
    xs[i] = low + i * dx;
  }

  // 初始时刻的密度函数
  const sdStart = Math.sqrt(Math.max(1e-16, varStart));
  const normCoef = 1.0 / (Math.sqrt(2 * Math.PI) * sdStart);
  const g0 = new Array(N);
  for (let i = 0; i < N; i++) {
    const z = (xs[i] - meanAtStart) / sdStart;
    g0[i] = normCoef * Math.exp(-0.5 * z * z);
  }

  // 卷积核
  const K = 2 * N - 1;
  const kernel = new Array(K);
  for (let l = 0; l < K; l++) {
    const lag = (l - (N - 1)) * dx;
    kernel[l] = normalPdf(lag, sigma);
  }

  // 初始Rprev：在区间内为0（吸收），区间外为1（存活）
  let Rprev = new Array(N);
  const inside = new Array(N);
  for (let i = 0; i < N; i++) {
    if (xs[i] >= a && xs[i] <= b) {
      Rprev[i] = 0.0;
      inside[i] = true;
    } else {
      Rprev[i] = 1.0;
      inside[i] = false;
    }
  }

  // 迭代m步
  for (let step = 1; step <= m; step++) {
    const Rnew = new Array(N).fill(0);

    // 加速：只遍历非零Rprev项
    for (let j = 0; j < N; j++) {
      const rj = Rprev[j];
      if (rj === 0.0) continue;

      const base = N - 1 - j;
      for (let i = 0; i < N; i++) {
        Rnew[i] += rj * kernel[i + base];
      }
    }

    // 乘dx，并把区间内设为0（吸收）
    for (let i = 0; i < N; i++) {
      Rnew[i] *= dx;
      if (inside[i]) Rnew[i] = 0.0;
    }

    Rprev = Rnew;
  }

  // 计算生存概率
  let survival = 0.0;
  for (let i = 0; i < N; i++) {
    if (!inside[i]) {
      survival += g0[i] * Rprev[i];
    }
  }
  survival *= dx;

  let hitProb = 1.0 - survival;

  // 修正数值边界
  if (hitProb < 0) hitProb = 0.0;
  if (hitProb > 1) hitProb = 1.0;

  return hitProb;
}

export function calPHit(
  initialPrice: number,
  currentTime: number,
  gridPriceMin: number,
  gridPriceMax: number,
  gridStartTime: number,
  gridEndTime: number,
  volatility: number
) {
  const result = probHitIntervalAtLeastOnce_DP(
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
