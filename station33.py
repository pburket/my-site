# chain: demand -> sold -> shows (top-down!)
import numpy as np
rng = np.random.default_rng(seed=0)
demand = rng.poisson(42, size=100_000)
sold = np.minimum(demand, 36)
shows = rng.binomial(sold, 0.87)
print((shows >= 30).mean())