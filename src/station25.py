import numpy as np

rng = np.random.default_rng(seed=7)
for n in [10, 100, 1_000, 10_000, 100_000]:
    est = rng.binomial(1, 0.7, size=n).mean()
    print(f"n = {n:>7,}   estimate = {est:.4f}")rng = np.random.default_rng(seed=42)

