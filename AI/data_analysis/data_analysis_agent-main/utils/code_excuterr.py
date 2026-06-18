import pandas as pd
import numpy as np
import traceback


def execute_generated_code(code: str, df: pd.DataFrame):
    

    # 
    safe_globals = {
        "__builtins__": {
            "len": len,
            "range": range,
            "min": min,
            "max": max,
            "sum": sum,
            "print": print,
            "list": list,
            "dict": dict,
        },
        "pd": pd,
        "np": np,
        "df": df.copy()
    }

    # store 
    safe_locals = {}

    try:
        # execute 
        exec(code, safe_globals, safe_locals)

        # extract 
        if "result" in safe_locals:
            return safe_locals["result"]

        if "output" in safe_locals:
            return safe_locals["output"]

        # fallback
        if isinstance(df, pd.DataFrame):
            return df.head(5)

        return safe_locals

    except Exception as e:
        return {
            "error": str(e),
            "trace": traceback.format_exc()
        }