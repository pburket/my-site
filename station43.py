import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

rng = np.random.default_rng(42)
n = 1000
Z = rng.binomial(n=1, p=0.5, size=n)
X = rng.binomial(n=1, p=0.1 + 0.8 * Z)
Y = rng.binomial(n=1, p=0.1 + 0.8 * Z)
sim = pd.DataFrame({"Z": Z, "X": X, "Y": Y})

print(pd.crosstab(sim["X"], sim["Y"]))
print("r =", round(sim["X"].corr(sim["Y"]), 2))
rng = np.random.default_rng(7)
n = 300
Z = rng.binomial(n=1, p=0.5, size=n)
X = rng.normal(loc=2 * Z - 1, scale=1)
Y = rng.normal(loc=2 * Z - 1, scale=1)

fig, ax = plt.subplots(figsize=[6, 4.5], layout="constrained")
for z, color in [(0, "#4E79A7"), (1, "#E15759")]:
    inZ = Z == z
    ax.scatter(X[inZ], Y[inZ], color=color, alpha=0.6, label=f"Z = {z}")
    slope, intercept = np.polyfit(X[inZ], Y[inZ], 1)
    print(f"slope within Z = {z}:", round(slope, 2))
    xs = np.linspace(X[inZ].min(), X[inZ].max(), 50)
    ax.plot(xs, intercept + slope * xs, color=color, linewidth=2.5)
slope, intercept = np.polyfit(X, Y, 1)
print("slope, all data:", round(slope, 2))
xs = np.linspace(X.min(), X.max(), 50)
ax.plot(xs, intercept + slope * xs, color="black", linewidth=2.5, label="all data")
ax.set_xlabel("X")
ax.set_ylabel("Y")
ax.set_title("Within Each Value of Z, X Tells You Nothing About Y")
ax.legend()
plt.show()
url = "https://flyaflya.github.io/confounderChallenge/"
patients = pd.read_csv(url + "patients_data.csv")
print(patients.shape)
print(patients.head(3))