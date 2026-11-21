import pandas as pd

url = "https://raw.githubusercontent.com/flyaflya/persuasive/main/starwars.csv"
sw = pd.read_csv(url, usecols=["name", "height", "mass", "homeworld", "species"])
print(sw.shape)
print(sw.head())
print(sw.assign(inches=lambda df: df["height"] / 2.54).head())