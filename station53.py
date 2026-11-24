import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

url = ("https://raw.githubusercontent.com/flyaflya/"
       "decAdvocacyChallenge/main/carsFixed.csv")
cars = pd.read_csv(url)
print(cars.head())
print(cars.shape)

summary = (cars.groupby(["shopID", "boss"])["carsFixed"]
           .agg(days="count", average="mean")
           .round(2))
print(summary)

rng = np.random.default_rng(42)
fig, ax = plt.subplots(figsize=[9, 4.5], layout="constrained")
for boss, color, offset, label in [(0, "lightgrey", -0.18, "Patrick away"),
                                   (1, "darkorchid", 0.18, "Patrick there")]:
    days = cars[cars["boss"] == boss]
    x = days["shopID"] + offset + rng.uniform(-0.12, 0.12, len(days))
    ax.scatter(x, days["carsFixed"], s=22, color=color, label=label)
ax.set_xticks(range(1, 6), [f"Shop {i}" for i in range(1, 6)])
ax.set_ylabel("Cars fixed that day")
ax.legend(loc="lower right")
ax.set_title("Your days add the most cars at Shops 4 and 2; Shop 3 gains the least",
             loc="left")
plt.savefig("patrick.png")

def draw_lifts(rng):
    """One plausible set of lifts: redraw each shop's days with replacement."""
    lifts = {}
    for shop, shop_days in cars.groupby("shopID"):
        there = shop_days.loc[shop_days["boss"] == 1, "carsFixed"].to_numpy()
        away = shop_days.loc[shop_days["boss"] == 0, "carsFixed"].to_numpy()
        lifts[shop] = (rng.choice(there, there.size).mean()
                       - rng.choice(away, away.size).mean())
    return lifts

def extra_cars(schedule, lifts):
    return sum(days * lifts[shop] for shop, days in schedule.items())

past = {1: 12, 2: 6, 3: 18, 4: 6, 5: 18}
plan = {2: 30, 4: 30}
rng = np.random.default_rng(7)
past_sims, plan_sims = [], []
for _ in range(4000):
    lifts = draw_lifts(rng)
    past_sims.append(extra_cars(past, lifts))
    plan_sims.append(extra_cars(plan, lifts))
past_sims, plan_sims = np.array(past_sims), np.array(plan_sims)
gain = plan_sims - past_sims
print("past schedule:", np.percentile(past_sims, [5, 50, 95]).round())
print("new plan:     ", np.percentile(plan_sims, [5, 50, 95]).round())
print("gain:         ", np.percentile(gain, [5, 50, 95]).round())
print("plan wins in", round(100 * (gain > 0).mean()), "% of quarters")