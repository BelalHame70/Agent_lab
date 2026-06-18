import re


def clean_code(code):

    code = re.sub(r"```python", "", code)
    code = re.sub(r"```", "", code)

    return code.strip()