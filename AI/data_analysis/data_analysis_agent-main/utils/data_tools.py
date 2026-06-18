import pandas as pd



# info 


def get_shape(df):

    return {
        "rows": df.shape[0],
        "columns": df.shape[1]
    }


def get_columns(df):

    return df.columns.tolist()


def get_dtypes(df):

    return df.dtypes.astype(str).to_dict()



# count unique value 


def count_unique(df, column):

    if column not in df.columns:
        return f"Column '{column}' not found."

    return int(df[column].nunique())



# count


def get_value_counts(df, column, top_n=10):

    if column not in df.columns:
        return f"Column '{column}' not found."

    counts = (
        df[column]
        .value_counts()
        .head(top_n)
        .to_dict()
    )

    return counts


# column mean 

def get_mean(df, column):

    if column not in df.columns:
        return f"Column '{column}' not found."

    if not pd.api.types.is_numeric_dtype(df[column]):
        return f"Column '{column}' is not numeric."

    return float(df[column].mean())


# groubby mean

def groupby_mean(
    df,
    group_col,
    value_col,
    ascending=False
):

    if group_col not in df.columns:
        return f"Column '{group_col}' not found."

    if value_col not in df.columns:
        return f"Column '{value_col}' not found."

    if not pd.api.types.is_numeric_dtype(df[value_col]):
        return f"Column '{value_col}' is not numeric."

    result = (
        df.groupby(group_col)[value_col]
        .mean()
        .sort_values(ascending=ascending)
    )

    return result.head(10).to_dict()


# correlation 

def calculate_correlation(
    df,
    col1,
    col2
):

    if col1 not in df.columns:
        return f"Column '{col1}' not found."

    if col2 not in df.columns:
        return f"Column '{col2}' not found."

    if not pd.api.types.is_numeric_dtype(df[col1]):
        return f"Column '{col1}' is not numeric."

    if not pd.api.types.is_numeric_dtype(df[col2]):
        return f"Column '{col2}' is not numeric."

    corr = df[col1].corr(df[col2])

    return float(corr)


# max value row 

def get_max_row(df, column):

    if column not in df.columns:
        return f"Column '{column}' not found."

    if not pd.api.types.is_numeric_dtype(df[column]):
        return f"Column '{column}' is not numeric."

    idx = df[column].idxmax()

    return df.loc[idx].to_dict()


# min value row 

def get_min_row(df, column):

    if column not in df.columns:
        return f"Column '{column}' not found."

    if not pd.api.types.is_numeric_dtype(df[column]):
        return f"Column '{column}' is not numeric."

    idx = df[column].idxmin()

    return df.loc[idx].to_dict()