import numpy as np
rng = np.random.default_rng(seed=42)
n = 100_000

rate = rng.uniform(20, 60, size=n)     # parent first: patients per week
time = rng.gamma(400, 1/rate)          # child: weeks until patient #400

print(time.mean())                      # ~11.0 weeks
print(np.quantile(time, [0.05, 0.95])) # ~[6.8, 18.2] weeks