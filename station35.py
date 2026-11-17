import numpy as np
rng = np.random.default_rng(seed=0)
n = 100_000
total_a = rng.poisson(22, n) + rng.poisson(32, n)
total_b = rng.poisson(16, n) + rng.poisson(46, n)

diff = total_a - total_b
print(diff.mean())   # average daily difference A − B
