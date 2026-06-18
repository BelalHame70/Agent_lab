import pandas as pd
import numpy as np


def detect_problem_type(df, target):

    y = df[target]

    if y.dtype == "object":
        return "classification"

    if y.nunique() <= 15:
        return "classification"

    return "regression"


def detect_dataset_size(df):

    rows = len(df)

    if rows < 1000:
        return "small"

    elif rows < 100000:
        return "medium"

    return "large"


def detect_imbalance(y):

    if y.dtype not in ["object", "int64"]:
        return False

    counts = y.value_counts(normalize=True)

    if len(counts) <= 1:
        return False

    imbalance_ratio = counts.max()

    return imbalance_ratio > 0.80


def detect_high_cardinality(df):

    high_card = []

    for col in df.select_dtypes(include="object"):

        if df[col].nunique() > 50:
            high_card.append(col)

    return high_card


def detect_missing_severity(df):

    missing = df.isnull().mean() * 100

    severe = missing[missing > 30].index.tolist()

    moderate = missing[
        (missing >= 10) & (missing <= 30)
    ].index.tolist()

    return severe, moderate


def detect_outlier_severity(df):

    severe_cols = []

    for col in df.select_dtypes(include=np.number):

        if df[col].nunique() <= 10:
            continue

        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)

        IQR = Q3 - Q1

        if IQR == 0:
            continue

        lower = Q1 - 1.5 * IQR
        upper = Q3 + 1.5 * IQR

        outliers = (
            (df[col] < lower) |
            (df[col] > upper)
        ).mean()

        if outliers > 0.10:
            severe_cols.append(col)

    return severe_cols


def decide_pipeline(df, target):

    print("\n--- AGENT DECISION ENGINE ---")

    decisions = {}

    # problem type
    problem_type = detect_problem_type(df, target)
    decisions["problem_type"] = problem_type

    # dataset size
    dataset_size = detect_dataset_size(df)
    decisions["dataset_size"] = dataset_size

    # imbalance
    imbalance = detect_imbalance(df[target])
    decisions["handle_imbalance"] = imbalance

    # high cardinality
    high_card = detect_high_cardinality(df)
    decisions["high_cardinality"] = high_card

    # missing values
    severe_missing, moderate_missing = detect_missing_severity(df)

    decisions["severe_missing"] = severe_missing
    decisions["moderate_missing"] = moderate_missing

    # outliers
    severe_outliers = detect_outlier_severity(df)

    decisions["severe_outliers"] = severe_outliers

    # encoding strategy
    if len(high_card) > 0:
        decisions["encoding"] = "target/frequency"

    else:
        decisions["encoding"] = "onehot"

    # scaling
    decisions["scaling"] = True

    # feature selection
    if problem_type == "classification":
        decisions["feature_selection"] = "anova + chi2"

    else:
        decisions["feature_selection"] = "correlation + mutual_info"

    # model recommendation
    if problem_type == "classification":

        decisions["recommended_models"] = [
            "LogisticRegression",
            "RandomForestClassifier",
            "XGBoostClassifier"
        ]

    else:

        decisions["recommended_models"] = [
            "LinearRegression",
            "RandomForestRegressor",
            "XGBoostRegressor"
        ]

    # print summary
    for key, value in decisions.items():
        print(f"- {key}: {value}")

    return decisions