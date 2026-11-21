import matplotlib.pyplot as plt

decisionArray = ["A", "B", "C", "D", "E"]
satisfactionArray = [3, 5, 4, 3, 1]

bestUtility = max(satisfactionArray)
colorArray = ["darkorchid" if utilityVal == bestUtility else "lightgrey"
              for utilityVal in satisfactionArray]
print(colorArray)

fig, ax = plt.subplots(figsize=[5, 3.5], layout="constrained")
ax.bar(x=decisionArray, height=satisfactionArray, color=colorArray)
ax.set_xlabel("Decision Alternative")
ax.set_ylabel("Utility")
ax.set_title("Decision B is the Best Alternative")
plt.show()
import pandas as pd

regionArray = ["East", "East", "West", "West", "West"]
plotDF = pd.DataFrame({"decision": decisionArray,
                       "satisfaction": satisfactionArray,
                       "region": regionArray})

fig, axs = plt.subplots(ncols=2, figsize=[8, 3.5], layout="constrained", sharey=True)
for idx, (region, groupDF) in enumerate(plotDF.groupby("region")):
    best = groupDF["satisfaction"].max()
    colors = ["darkorchid" if u == best else "lightgrey" for u in groupDF["satisfaction"]]
    bestLabel = groupDF.loc[groupDF["satisfaction"].idxmax(), "decision"]
    axs[idx].bar(x=groupDF["decision"], height=groupDF["satisfaction"], color=colors)
    axs[idx].set_xlabel("Decision Alternative")
    axs[idx].set_ylabel("Utility")
    axs[idx].set_title(f"{region}: Decision {bestLabel} is Best")
fig.suptitle("The Best Decision Differs by Region")
plt.show()
fig, ax = plt.subplots(figsize=[5, 3.5], layout="constrained")
ax.set_title("Decision B is the Best Alternative")
ax.set_xlabel("Decision Alternative")
ax.set_ylabel("Utility")
for decision, satisfaction in zip(decisionArray, satisfactionArray):
    if satisfaction == bestUtility:
        reco = ax.bar(decision, satisfaction, color="darkorchid", label="Recommended")
    else:
        unwise = ax.bar(decision, satisfaction, color="lightgrey", label="Not recommended")
ax.legend(handles=[reco, unwise])
ax.annotate(text="Consider Decision C if sustainability\nmatters. Utility does not include it.",
            xy=("C", 4.05), xytext=("D", 2.2),
            horizontalalignment="center",
            arrowprops={"arrowstyle": "->"})
plt.show()