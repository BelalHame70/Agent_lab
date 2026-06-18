import pandas as pd
import numpy as np
import traceback
import ast


#####validate generated code 
def validate_code(code):

    tree = ast.parse(code)

    forbidden_calls = {
        "eval",
        "exec",
        "open",
        "__import__",
        "compile",
        "input"
    }

    forbidden_modules = {
        "os",
        "sys",
        "subprocess",
        "shutil",
        "socket",
        "pathlib"
    }

    for node in ast.walk(tree):

        # import x
        if isinstance(node, ast.Import):

            for alias in node.names:

                if alias.name not in ["pandas", "numpy"]:

                    raise ValueError(
                        f"Import not allowed: {alias.name}"
                    )

        # from x import y
        if isinstance(node, ast.ImportFrom):

            if node.module not in ["pandas", "numpy"]:

                raise ValueError(
                    f"Import not allowed: {node.module}"
                )

        # function call
        if isinstance(node, ast.Call):

            if isinstance(node.func, ast.Name):

                if node.func.id in forbidden_calls:

                    raise ValueError(
                        f"Forbidden function: {node.func.id}"
                    )

        # attribute access
        if isinstance(node, ast.Attribute):

            if node.attr.startswith("__"):

                raise ValueError(
                    "Dunder access forbidden"
                )

        ####3
        if isinstance(node, ast.Name):

            if node.id in forbidden_modules:

                raise ValueError(
                    f"Forbidden module: {node.id}"
                )

    return True



def execute_generated_code(code, df):

    try:

        validate_code(code)

        local_vars = {
            "df": df,
            "pd": pd,
            "np": np
        }

        #exec(code, {}, local_vars)
        safe_globals = {
        "__builtins__": {}
        }

        exec(
        code,
        safe_globals,
        local_vars
        )

        return {
            "success": True,
            "result": local_vars.get("result")
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }