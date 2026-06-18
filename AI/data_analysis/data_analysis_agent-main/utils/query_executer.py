import pandas as pd
import numpy as np


# column matching 


def find_column(question, columns):

    q = question.lower()

    best = None
    score = 0

    for col in columns:

        c = col.lower().replace("_", " ")

        s = 0

        if c in q:
            s += 10


        for word in q.split():
            if word in c:
                s += 1

        if s > score:
            score = s
            best = col

    return best    

## query executer 
def execute_query(df, question):

    q = question.lower()

    numeric_cols = df.select_dtypes(
        include=np.number
    ).columns.tolist()

    categorical_cols = df.select_dtypes(
        include=["object", "category"]
    ).columns.tolist()

    ## gighest 

    if any(w in q for w in [
        "highest",
        "max",
        "most",
        "top",
        "best"
    ]):
        value_col = find_column(
            q,
            numeric_cols
        )

        group_col = find_column(
            q,
            categorical_cols
        )

        if value_col is None:
            if len(numeric_cols) > 0:
                value_col = numeric_cols[0]

        if group_col is None:
            if len(categorical_cols) > 0:
                group_col = categorical_cols[0]

        if not value_col or not group_col:
            return {
                "success": False,
                "message": "Could not identify columns"
            }
        
        grouped = (
            df.groupby(group_col)[value_col]
            .mean()
            .sort_values(ascending=False)
        )

        top_name = grouped.index[0]
        top_value = grouped.iloc[0]

        return {
            "success": True,
            "type": "highest",
            "group_column": group_col,
            "value_column": value_col,
            "name": str(top_name),
            "value": float(top_value)
        }
    

    ## lowest 
    if any(w in q for w in [
        "lowest",
        "minimum",
        "least",
        "worst"
    ]):

        value_col = find_column(
            q,
            numeric_cols
        )

        group_col = find_column(
            q,
            categorical_cols
        )

        if value_col is None:
            if len(numeric_cols) > 0:
                value_col = numeric_cols[0]

        if group_col is None:
            if len(categorical_cols) > 0:
                group_col = categorical_cols[0]

        grouped = (
            df.groupby(group_col)[value_col]
            .mean()
            .sort_values(ascending=True)
        )

        top_name = grouped.index[0]
        top_value = grouped.iloc[0]

        return {
            "success": True,
            "type": "lowest",
            "group_column": group_col,
            "value_column": value_col,
            "name": str(top_name),
            "value": float(top_value)
        }
    

    ## avg 
    if any(w in q for w in [
        "average",
        "mean",
        "avg"
    ]):

        col = find_column(q, numeric_cols)

        if col is None:
            col = numeric_cols[0]

        value = df[col].mean()

        return {
            "success": True,
            "type": "average",
            "column": col,
            "value": float(value)
        }
    

    ## correlation 
    if any(w in q for w in [
        "correlation",
        "relationship",
        "impact",
        "efffect",
        "affected"
    ]):

        if len(numeric_cols) < 2:
            return {
                "success": False,
                "message": "Need 2 numeric columns"
            }

        best_corr = 0
        best_pair = None

        for i in range(len(numeric_cols)):
            for j in range(i + 1, len(numeric_cols)):

                c1 = numeric_cols[i]
                c2 = numeric_cols[j]

                corr = df[c1].corr(df[c2])

                if abs(corr) > abs(best_corr):
                    best_corr = corr
                    best_pair = (c1, c2)

        return {
            "success": True,
            "type": "correlation",
            "col1": best_pair[0],
            "col2": best_pair[1],
            "correlation": float(best_corr)
        }

    return {
        "success": False,
        "message": "Could not understand question"
    }