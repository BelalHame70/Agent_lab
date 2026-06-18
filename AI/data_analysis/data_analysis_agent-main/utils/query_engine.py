
##### not used #####33
import pandas as pd
import numpy as np
import re



# question understand 

def detect_question_type(question: str):

    q = question.lower()

    patterns = {
        "highest": ["highest", "maximum", "max", "most", "top", "best", "largest"],
        "lowest": ["lowest", "minimum", "min", "least", "worst", "cheapest", "smallest"],
        "average": ["average", "mean", "avg"],
        "sum": ["sum", "total", "overall"],
        "count": ["count", "how many", "number of", "frequency"],
        "correlation": ["correlation", "relationship", "relation", "dependency"],
        "distribution": ["distribution", "spread", "breakdown"]
    }

    for key, words in patterns.items():
        if any(w in q for w in words):
            return key

    return "unknown"


# column match 

#def find_matching_columns(question, df):

#   q = question.lower()
    #  matched = []

    # for col in df.columns:

        # clean_col = col.lower().replace("_", " ")

        # direct match
        #if clean_col in q:
        #   matched.append(col)
        #  continue

        # partial token match
        #col_tokens = set(clean_col.split())
        #q_tokens = set(q.split())

        #if len(col_tokens.intersection(q_tokens)) > 0:
        #   matched.append(col)

        # fuzzy keyword match (weak heuristic)
        #elif any(token in clean_col for token in q_tokens):
        #   matched.append(col)

    #return list(set(matched))



def find_matching_columns(question, df):

    q = question.lower()

    scored = []

    for col in df.columns:

        score = 0

        clean = col.lower().replace("_", " ")

        # exact
        if clean in q:
            score += 10

        # token overlap
        q_words = set(q.split())
        c_words = set(clean.split())

        overlap = len(q_words.intersection(c_words))

        score += overlap * 3

        # partial
        for w in q_words:
            if w in clean:
                score += 1

        scored.append((col, score))

    scored.sort(key=lambda x: x[1], reverse=True)

    matched = [
        c for c, s in scored
        if s > 0
    ]

    return matched[:5]    


#########

def get_numeric_columns(df):
    return df.select_dtypes(include=["int64", "float64"]).columns.tolist()


def get_categorical_columns(df):
    return df.select_dtypes(include=["object", "category"]).columns.tolist()


def pick_best_group_and_value(df, matched_cols):

    numeric = [c for c in matched_cols if c in get_numeric_columns(df)]
    cat = [c for c in matched_cols if c in get_categorical_columns(df)]

    if not numeric:
        numeric = get_numeric_columns(df)

    if not cat:
        cat = get_categorical_columns(df)

    if not numeric or not cat:
        return None, None

    return cat[0], numeric[0]


# high & low 

def handle_groupby_question(df, matched_cols, qtype):

    group_col, value_col = pick_best_group_and_value(df, matched_cols)

    if not group_col or not value_col:
        return "Not enough data to compute group analysis."

    try:

        grouped = (
            df.groupby(group_col)[value_col]
            .mean()
            .sort_values(ascending=(qtype == "lowest"))
        )

        top = grouped.head(1)

        name = top.index[0]
        value = top.values[0]

        label = "highest" if qtype == "highest" else "lowest"

        return (
            f"'{name}' has the {label} average {value_col}: "
            f"{value:.2f}."
        )

    except Exception as e:
        return f"Group analysis failed: {e}"


# avg , mean , sum , median 

def handle_numeric_stats(df, matched_cols, mode="average"):

    numeric_cols = [c for c in matched_cols if c in get_numeric_columns(df)]

    if not numeric_cols:
        numeric_cols = get_numeric_columns(df)

    if not numeric_cols:
        return "No numeric columns found."

    col = numeric_cols[0]

    try:

        if mode == "average":
            val = df[col].mean()

        elif mode == "sum":
            val = df[col].sum()

        elif mode == "median":
            val = df[col].median()

        else:
            val = df[col].mean()

        return f"{mode.title()} of '{col}' is {val:.2f}"

    except Exception as e:
        return f"Error calculating {mode}: {e}"


# count , number of 

def handle_count_question(df, matched_cols):

    if not matched_cols:
        return f"Dataset contains {len(df)} rows."

    col = matched_cols[0]

    try:

        counts = df[col].value_counts().head(10)

        result = f"Top values in '{col}':\n"

        for k, v in counts.items():
            result += f"- {k}: {v}\n"

        return result

    except Exception as e:
        return f"Count error: {e}"


# correlation , relationship 

def handle_correlation_question(df, matched_cols):

    numeric_cols = [c for c in matched_cols if c in get_numeric_columns(df)]

    if len(numeric_cols) < 2:
        numeric_cols = get_numeric_columns(df)

    if len(numeric_cols) < 2:
        return "Need at least 2 numeric columns for correlation."

    best_pairs = []

    # compute best correlation 
    for i in range(len(numeric_cols)):
        for j in range(i + 1, len(numeric_cols)):

            c1, c2 = numeric_cols[i], numeric_cols[j]

            corr = df[c1].corr(df[c2])

            if pd.notna(corr):
                best_pairs.append((abs(corr), c1, c2, corr))

    if not best_pairs:
        return "No correlation found."

    best_pairs.sort(reverse=True)

    _, c1, c2, corr = best_pairs[0]

    strength = "weak"
    if abs(corr) > 0.7:
        strength = "strong"
    elif abs(corr) > 0.4:
        strength = "moderate"

    direction = "positive" if corr > 0 else "negative"

    return (
        f"Strongest correlation is between '{c1}' and '{c2}': "
        f"{corr:.3f} ({strength} {direction})."
    )


##### main 

def answer_data_question(df, question):

    if not question or not question.strip():
        return "Please enter a valid question."

    qtype = detect_question_type(question)
    matched_cols = find_matching_columns(question, df)

    # high , low 
    if qtype in ["highest", "lowest"]:
        return handle_groupby_question(df, matched_cols, qtype)

    # avg 
    elif qtype == "average":
        return handle_numeric_stats(df, matched_cols, "average")

    # sum
    elif qtype == "sum":
        return handle_numeric_stats(df, matched_cols, "sum")

    # count
    elif qtype == "count":
        return handle_count_question(df, matched_cols)

    # correlation 
    elif qtype == "correlation":
        return handle_correlation_question(df, matched_cols)

    #  fallback 
    else:
        return (
            "I couldn't fully understand the question. "
            "Try asking about averages, highest/lowest values, counts, or relationships."
        )