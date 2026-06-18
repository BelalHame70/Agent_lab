import pandas as pd
import numpy as np
import traceback


def execute_python_query(df, query_type, params=None):

    try:

        if query_type == "unique_count":

            column = params["column"]

            return {
                "success": True,
                "result": int(df[column].nunique())
            }

        elif query_type == "missing_values":

            result = (
                df.isnull()
                .mean()
                .mul(100)
                .round(2)
                .to_dict()
            )

            return {
                "success": True,
                "result": result
            }

        elif query_type == "top_values":

            column = params["column"]

            top_n = params.get("top_n", 10)

            result = (
                df[column]
                .value_counts()
                .head(top_n)
                .to_dict()
            )

            return {
                "success": True,
                "result": result
            }

        else:

            return {
                "success": False,
                "message": "Unknown query type"
            }

    except Exception:

        return {
            "success": False,
            "error": traceback.format_exc()
        }