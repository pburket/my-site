import pandas as pd

df = pd.DataFrame({
    "team":     ["Support", "Support", "Engineering", "Engineering"],
    "group":    ["remote staff", "office staff", "remote staff", "office staff"],
    "applied":  [20, 180, 180, 40],
    "promoted": [14, 117, 63, 12],
    "rate":     [0.70, 0.65, 0.35, 0.30],
})

print(df)

print("\nWithin-team (like-with-like) — answers the question:")
for team, g in df.groupby("team"):
    remote = g.loc[g["group"] == "remote staff", "rate"].item()
    office = g.loc[g["group"] == "office staff", "rate"].item()
    print(f"  {team}: remote {remote:.0%} vs office {office:.0%}  (diff {remote - office:+.0%})")

remote = df[df["group"] == "remote staff"]
office = df[df["group"] == "office staff"]
remote_rate = remote["promoted"].sum() / remote["applied"].sum()
office_rate = office["promoted"].sum() / office["applied"].sum()
print(f"\nNaive overall (does NOT answer it): remote {remote_rate:.0%} vs office {office_rate:.0%}")

