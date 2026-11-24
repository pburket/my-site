import pandas as pd
import statsmodels.formula.api as smf

five = pd.DataFrame({
    "person": ["Alice", "Bob", "Charlie", "Diana", "Eve"],
    "stress": [2, 4, 6, 8, 10],
    "time": [1, 3, 2, 5, 4],
    "anxiety": [3, 7, 8, 12, 11],
})
fit_time = smf.ols("anxiety ~ time", data=five).fit()
print(fit_time.params.round(3))
print("R-squared:", round(fit_time.rsquared, 3))

five = five.assign(predicted=fit_time.fittedvalues,
                   error=lambda df: df["anxiety"] - df["predicted"])
print(five.round(2))
print("SSE:", round((five["error"] ** 2).sum(), 2))
fit_both = smf.ols("anxiety ~ stress + time", data=five).fit()
print(fit_both.params.round(3))
print("R-squared:", round(fit_both.rsquared, 3))

ss = pd.DataFrame({
    "Stress":       [0, 0, 0, 1, 1, 1, 2, 2, 2, 8, 8, 8, 12, 12, 12],
    "StressSurvey": [0, 0, 0, 3, 3, 3, 6, 6, 6, 9, 9, 9, 12, 12, 12],
    "Time":         [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2.1, 2.2, 2.2, 2.2],
})
ss["Anxiety"] = ss["Stress"] + 0.1 * ss["Time"]

model_b = smf.ols("Anxiety ~ Stress + Time", data=ss).fit()
print(model_b.params.round(3))

model_a = smf.ols("Anxiety ~ StressSurvey + Time", data=ss).fit()
print(model_a.summary().tables[1])
print("R-squared:", round(model_a.rsquared, 3))
print(ss.groupby("StressSurvey")[["Time", "Anxiety"]].mean().round(2))