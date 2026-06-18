import pandas as pd
import numpy as np


def run_eda(df):


    report = {}

    # view 
    report["shape"] = df.shape
    report["columns"] = df.columns.tolist()
    report["dtypes"] = df.dtypes.astype(str).to_dict()

    report["memory_mb"] = round(
        df.memory_usage(deep=True).sum() / (1024 ** 2), 2
    )

    report["duplicate_rows"] = int(df.duplicated().sum())

    # nulls 
    report["null_count"] = df.isnull().sum().to_dict()

    report["null_percent"] = (
        (df.isnull().mean() * 100).round(2).to_dict()
    )

    
    # unique values 
    report["unique"] = df.nunique(dropna=False).to_dict()

    # constant column 
    report["constant_columns"] = [
        col for col in df.columns
        if df[col].nunique(dropna=False) <= 1
    ]

    # high cardinality -> cate
    cat_cols = df.select_dtypes(include="object").columns.tolist()

    report["high_cardinality"] = [
        col for col in cat_cols
        if df[col].nunique() > 50
    ]

    # numeric columns summary 
    num_cols = df.select_dtypes(include=np.number).columns.tolist()

    numeric_summary = {}

    for col in num_cols:

        series = df[col].dropna()

        if len(series) == 0:
            continue

        numeric_summary[col] = {
            "mean": round(series.mean(), 4),
            "median": round(series.median(), 4),
            "std": round(series.std(), 4),
            "min": round(series.min(), 4),
            "max": round(series.max(), 4),
            "skewness": round(series.skew(), 4)
        }

    report["numeric_summary"] = numeric_summary

    # outlier 
    outliers = {}

    for col in num_cols:

        # skip binary / low unique
        if df[col].nunique() <= 10:
            continue

        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1

        if IQR == 0:
            continue

        lower = Q1 - 1.5 * IQR
        upper = Q3 + 1.5 * IQR

        count = int(((df[col] < lower) | (df[col] > upper)).sum())

        outliers[col] = count

    report["outliers"] = outliers



    # correlation analysis 
    if len(num_cols) >= 2:

        corr_matrix = df[num_cols].corr().round(3)

        report["correlation_matrix"] = corr_matrix.to_dict()

        strong_pairs = []

        cols = corr_matrix.columns.tolist()

        for i in range(len(cols)):
            for j in range(i + 1, len(cols)):

                c1 = cols[i]
                c2 = cols[j]

                val = corr_matrix.loc[c1, c2]

                if abs(val) >= 0.75:
                    strong_pairs.append(
                        {
                            "feature_1": c1,
                            "feature_2": c2,
                            "correlation": float(val)
                        }
                    )

        report["strong_correlations"] = strong_pairs

    else:
        report["correlation_matrix"] = {}
        report["strong_correlations"] = []

    
    # datetime 
    date_candidates = []

    for col in df.select_dtypes(include="object").columns:

        sample = df[col].dropna().astype(str).head(20)

        keywords = [
            "-", "/", ":",
            "jan", "feb", "mar", "apr", "may",
            "jun", "jul", "aug", "sep",
            "oct", "nov", "dec"
        ]

        found = any(
            any(k in val.lower() for k in keywords)
            for val in sample
        )

        if found:
            date_candidates.append(col)

    report["datetime_candidates"] = date_candidates

    
    #  zero variance 
    nzv = []

    for col in num_cols:

        if df[col].nunique() <= 2:
            continue

        top_freq = df[col].value_counts(normalize=True).iloc[0]

        if top_freq > 0.95:
            nzv.append(col)

    report["near_zero_variance"] = nzv

    

    # recommenation 
    recommendations = []

    if report["duplicate_rows"] > 0:
        recommendations.append("Remove duplicate rows.")

    if len(report["constant_columns"]) > 0:
        recommendations.append("Drop constant columns.")

    if len(report["high_cardinality"]) > 0:
        recommendations.append("Encode/group high-cardinality columns.")

    if len(report["outliers"]) > 0:
        recommendations.append("Consider handling outliers.")

    skewed_cols = [
        col for col, vals in numeric_summary.items()
        if abs(vals["skewness"]) > 1
    ]


    if len(skewed_cols) > 0:
        recommendations.append("Some columns are highly skewed. Consider transformation.")

    if len(report["strong_correlations"]) > 0:
        recommendations.append("Possible multicollinearity detected.")

    report["recommendations"] = recommendations

    return report
