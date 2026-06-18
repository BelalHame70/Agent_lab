import pandas as pd


def decide_pipeline(df, target, eda_report):
    print("\n--- DECISION ---")

    decisions = {
        "problem_type": None,
        "use_sampling": False,
        "handle_imbalance": False,
        "drop_high_cardinality": False,
        "encoding_strategy": "onehot",
        "scaling_needed": False,
        "outlier_strategy": None,
        "feature_selection_method": None,
        "notes": []
    }

    # detect problem type
    
    if df[target].nunique() <= 10:
        decisions["problem_type"] = "classification"
    else:
        decisions["problem_type"] = "regression"

    print(f"Detected problem type: {decisions['problem_type']}")

    
    # data size
    
    rows = df.shape[0]

    if rows > 300000:
        decisions["use_sampling"] = True
        decisions["notes"].append("Large dataset → sampling recommended")


    # Class imbalance (classification only)
    
    if decisions["problem_type"] == "classification":
        counts = df[target].value_counts(normalize=True)

        if counts.max() > 0.75:
            decisions["handle_imbalance"] = True
            decisions["notes"].append("Target is imbalanced")


    # high cardinality detection

    high_card_cols = [
        col for col in df.select_dtypes(include="object")
        if df[col].nunique() > 50
    ]

    if high_card_cols:
        decisions["drop_high_cardinality"] = False
        decisions["encoding_strategy"] = "target_encoding"
        decisions["notes"].append(f"High cardinality detected: {high_card_cols}")


    # scaling decision

    num_cols = df.select_dtypes(include=["int64", "float64"]).columns

    if len(num_cols) > 0:
        stds = df[num_cols].std()

        if stds.max() > stds.min() * 20:
            decisions["scaling_needed"] = True
            decisions["notes"].append("Feature scaling recommended")


    # outlier strategy

    outliers = eda_report.get("outliers", {})

    if any(v > 0 for v in outliers.values()):
        decisions["outlier_strategy"] = "cap"
        decisions["notes"].append("Outliers detected → capping recommended")


    # feature selection method

    if decisions["problem_type"] == "regression":
        decisions["feature_selection_method"] = "correlation + mutual_info"
    else:
        decisions["feature_selection_method"] = "anova + chi2"

    
    # final summary
    
    print("\n Decisions:- ")
    for k, v in decisions.items():
        if k != "notes":
            print(f"- {k}: {v}")

    if decisions["notes"]:
        print("\n Notes:- ")
        for n in decisions["notes"]:
            print(f"  • {n}")

    return decisions