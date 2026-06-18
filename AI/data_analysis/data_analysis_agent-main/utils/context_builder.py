def build_context(df, target, eda_report, decisions, model_results):
    lines = []

    # dataset overview 
    lines.append("DATASET OVERVIEW")
    lines.append(f"Rows: {df.shape[0]}")
    lines.append(f"Columns: {df.shape[1]}")

    
    ## target , problem type 
    lines.append(f"Target Column: {target}")

    problem_type = decisions.get("problem_type", "Unknown")
    lines.append(f"Problem Type: {problem_type}")


    lines.append("\nDATA SAMPLE")
    lines.append(df.head(5).to_string())

    lines.append("\nCOLUMN TYPES")
    lines.append(df.dtypes.to_string())



    ## add 
    lines.append("\nNUMERICAL SUMMARY")
    lines.append(df.describe().to_string())




    ######## add 
    cat_cols = df.select_dtypes(include="object").columns

    if len(cat_cols) > 0:

        lines.append("\nCATEGORICAL SUMMARY")

        for col in cat_cols[:5]:

            top_vals = df[col].value_counts().head(5)

            lines.append(f"\n{col}:")
            lines.append(top_vals.to_string())




    #### nulls 
    missing = df.isnull().sum().sum()
    lines.append(f"Total Missing Values: {missing}")


    ### outlier 
    outliers = eda_report.get("outliers", {})
    if isinstance(outliers, dict) and outliers:
        lines.append(f"Outlier Columns: {list(outliers.keys())}")

    

    # high cardinality 
    high_card = decisions.get("high_cardinality", [])
    if high_card:
        lines.append(f"High Cardinality Columns: {high_card}")

    
    # best ml model 
    best_model = model_results.get("best_model_name", "Unknown")
    lines.append(f"Best Model: {best_model}")

    
    # result 
    results = model_results.get("results", [])

    # safety: ensure list
    if isinstance(results, dict):
        results = [results]

    if isinstance(results, str):
        results = []

    lines.append("\nMODEL PERFORMANCE")

    for r in results:

        # safety check
        if not isinstance(r, dict):
            continue

        model_name = r.get("model", "Unknown Model")
        metrics = r.get("metrics", {})

        lines.append(f"\nModel: {model_name}")

        if isinstance(metrics, dict) and metrics:
            for k, v in metrics.items():
                lines.append(f"  {k}: {v}")
        else:
            lines.append("  No metrics available")

    return "\n".join(lines)