import pandas as pd
import numpy as np
#from decision import decide_pipeline


def generate_full_report(df, target, feature_scores, eda_report,decisions , prep_report=None  ):

    
    print(" DATA ANALYSIS REPORT :--")
    

    # dataset overview 

    print("\n DATASET OVERVIEW")

    rows, cols = df.shape
    print(f"- Rows: {rows}")
    print(f"- Columns: {cols}")

    total_nulls = df.isnull().sum().sum()
    duplicate_rows = df.duplicated().sum()

    print(f"- Missing values: {int(total_nulls)}")
    print(f"- Duplicate rows: {int(duplicate_rows)}")

    mem = df.memory_usage(deep=True).sum() / (1024 ** 2)
    print(f"- Memory usage: {mem:.2f} MB")

    
    # detect target type 

    y = df[target]

    if y.dtype == "object":
        target_type = "categorical"

    elif pd.api.types.is_numeric_dtype(y):

        if y.nunique() <= 10:
            target_type = "categorical"
        else:
            target_type = "numerical"

    else:
        target_type = "categorical"

    # target analysis 
    print("\n TARGET ANALYSIS")

    if target_type == "categorical":

        counts = y.value_counts()
        n_classes = len(counts)

        print(f"- Target column: {target}")
        print(f"- Problem Type: Classification")
        print(f"- Number of classes: {n_classes}")

        ratio = counts.max() / counts.min()

        # balace detection 

        if ratio < 1.5:
            print("- Class distribution: Balanced")

        elif ratio < 3:
            print("- Class distribution: Mild imbalance")

        else:
            print("- Class distribution: Strong imbalance")

        for cls, val in counts.items():
            pct = (val / len(y)) * 100
            print(f"   • {cls}: {val} ({pct:.1f}%)")


    else:


        desc = y.describe()

        print(f"- Target column: {target}")
        print(f"- Problem Type: Regression")
        print(f"- Mean: {desc['mean']:.3f}")
        print(f"- Std: {desc['std']:.3f}")
        print(f"- Min: {desc['min']:.3f}")
        print(f"- Max: {desc['max']:.3f}")

    # key relationship 

    print("\n KEY RELATIONSHIPS")

    found = False

    # numerical correlation
    if "numerical_correlation" in feature_scores:

        corr = feature_scores["numerical_correlation"]

        for col, val in corr.head(5).items():

            if pd.isna(val):
                continue

            found = True

            if val > 0.7:
                strength = "strong"
            elif val > 0.4:
                strength = "moderate"
            else:
                strength = "weak"

            print(f"- {col} has {strength} relationship with {target} (score={val:.2f})")

            if col.lower() in ["duration", "outcome", "result"]:
                print(f" '{col}' may cause data leakage")

    # numerical anova
    if "numerical_anova" in feature_scores:

        anova = feature_scores["numerical_anova"]

        for col, val in anova.head(5).items():

            if pd.isna(val) or np.isinf(val):
                continue

            found = True
            print(f"- {col} strongly separates target classes (ANOVA={val:.2f})")

    # categorical scores
    for key in ["categorical_anova", "categorical_chi2"]:

        if key in feature_scores:

            cat_scores = feature_scores[key]
            seen = set()

            for col, val in cat_scores.head(10).items():

                base_col = col.split("_")[0]

                if base_col in seen:
                    continue

                seen.add(base_col)
                found = True

                print(f"- {base_col} has significant impact on {target}")

    if not found:
        print("- No strong relationships detected")



    # quality

    print("\n data quality")

    issues = False

    # missing columns
    null_pct = df.isnull().mean() * 100

    missing_cols = [col for col, val in null_pct.items() if val > 0]

    if missing_cols:
        issues = True
        print(f"- Columns with missing values: {missing_cols}")

    # outliers
    numeric_cols = df.select_dtypes(include=["int64", "float64"]).columns.tolist()

    outlier_cols = []

    for col in numeric_cols:

        if col == target:
            continue

        if df[col].nunique() <= 10:
            continue


        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1


        if IQR == 0:
            continue


        lower = Q1 - 1.5 * IQR
        upper = Q3 + 1.5 * IQR

        count = ((df[col] < lower) | (df[col] > upper)).sum()

        if count > 0:
            outlier_cols.append(col)

    if outlier_cols:
        issues = True
        print(f"- Columns containing outliers: {outlier_cols}")


    # high cardinality
    cat_cols = df.select_dtypes(include="object").columns.tolist()

    high_card = [
        col for col in cat_cols
        if df[col].nunique() > 50
    ]

    if high_card:
        issues = True
        print(f"- High-cardinality categorical columns: {high_card}")

    if not issues:
        print("- No major data quality issues detected")



    #  suggest recommendation

    print("\n RECOMMENDATIONS")

    if target_type == "categorical":
        print("- Suggested models: Logistic Regression, Random Forest, XGBoost")
        print("- Use Stratified Train/Test Split")


    else:
        print("- Suggested models: Linear Regression, Random Forest Regressor, XGBoost Regressor")
        print("- Consider target scaling if highly skewed")


    if high_card:
        print("- Apply encoding to high-cardinality columns")


    if outlier_cols:
        print("- Consider RobustScaler or outlier capping")


    if duplicate_rows > 0:
        print("- Remove duplicate rows before training")


    # final summary 
    print("\n FINAL SUMMARY")


    if not issues and duplicate_rows == 0:
        print("- Dataset is clean and ready for modeling")


    else:
        print("- Dataset needs preprocessing before final modeling")


    print("- Feature selection identified the most useful predictors")
    print("- Visualization results can support deeper interpretation")



