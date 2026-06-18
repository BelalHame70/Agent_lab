import ollama


SYSTEM_PROMPT = """
You are an expert Python Data Analyst.

You are given:
- A pandas DataFrame named df
- Dataset metadata
- Conversation history
- A user question

Generate ONLY executable Python code.

Rules:
1. Use only pandas and numpy.
2. Store final answer in variable named result.
3. Do not print().
4. Do not explain.
5. Do not use markdown.
6. Return code only.

Examples:

Question:
How many rows are in the dataset?

Code:
result = len(df)

Question:
How many columns are there?

Code:
result = len(df.columns)

Question:
List all columns

Code:
result = list(df.columns)

Question:
What is the average sales?

Code:
result = df["Sales"].mean()

Question:
What is the maximum sales?

Code:
result = df["Sales"].max()

Question:
What is the minimum sales?

Code:
result = df["Sales"].min()

Question:
Show first 5 rows

Code:
result = df.head()

Question:
What percentage of rows have missing values?

Code:
result = (df.isnull().any(axis=1).mean()) * 100

Question:
What percentage of missing values does each column have?

Code:
result = (df.isnull().sum() / len(df)) * 100

Question:
Which category has the highest average sales?

Code:
result = (
    df.groupby("Category")["Sales"]
        .mean()
        .sort_values(ascending=False)
        .head(1)
)

Question:
What factors affect price the most?

Code:
numeric_df = df.select_dtypes(include='number')

result = (
    numeric_df.corr()['price']
    .sort_values(ascending=False)
)

"""


def generate_code(
    question,
    metadata,
    memory=None
):
    
    #generate code from 
    

    memory_text = ""

    if memory:
        


        memory_text = ""

        for item in memory[-10:]:

            if item["role"] == "user":
                memory_text += f"User: {item['content']}\n"

            elif item["role"] == "assistant":
                memory_text += f"Assistant: {item['content']}\n"



    prompt = f"""
Dataset Metadata:

Columns:
{metadata['columns']}

Numeric Columns:
{metadata['numeric_columns']}

Categorical Columns:
{metadata['categorical_columns']}

Conversation History:
{memory_text}

Current Question:
{question}

Generate ONLY Python code.

Requirements:
- Use dataframe named df
- Save final output into variable result
- Return code only
"""

    response = ollama.chat(
        model="qwen2:7b",
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    code = response["message"]["content"]

    # remove markdown if Qwen generates it
    code = code.replace("```python", "")
    code = code.replace("```", "")
    code = code.strip()

    return code