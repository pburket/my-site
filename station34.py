import numpy as np
rng = np.random.default_rng(seed=0)
flips = rng.binomial(1, 0.5, size=(100_000, 40))
factors = np.where(flips == 1, 1 + 0.51*0.75, 1 - 0.39*0.75)
final = 30000 * factors.prod(axis=1)
print((final < 30000).mean())