import pandas as pd
import numpy as np
import re


# extract numbers 

def extract_number(x):

    try:

        x = str(x).strip()

        # invalid values
        if x in ["", "|", "nan", "None"]:
            return np.nan

        # remove common symbols
        x = (
            x.replace(",", "")
            .replace("₹", "")
            .replace("$", "")
            .replace("%", "")
        )

        # range values
        if "-" in x:

            nums = x.split("-")

            if len(nums) == 2:

                try:
                    return (
                        float(nums[0]) +
                        float(nums[1])
                    ) / 2

                except:
                    pass

        # first numeric pattern
        num = re.findall(
            r"\d+\.?\d*",
            x
        )

        if num:
            return float(num[0])

        return np.nan

    except:
        return np.nan


# numeric detection 

def is_numeric_like(series, threshold=0.70):

    try:

        converted = (
            series.dropna()
            .astype(str)
            .apply(extract_number)
        )

        success_rate = (
            converted.notnull().mean()
        )

        return success_rate >= threshold

    except:
        return False


# data detection

def looks_like_date(series):

    try:

        sample = (
            series.dropna()
            .astype(str)
            .head(20)
        )

        keywords = [
            "-", "/", ":",
            "jan", "feb", "mar",
            "apr", "may", "jun",
            "jul", "aug", "sep",
            "oct", "nov", "dec",
            "202", "201", "200"
        ]

        return any(
            any(
                k in val.lower()
                for k in keywords
            )
            for val in sample
        )

    except:
        return False


# date check 

def is_datetime_like(series, threshold=0.80):

    try:

        parsed = pd.to_datetime(
            series,
            errors="coerce"
        )

        success_rate = (
            parsed.notnull().mean()
        )

        return success_rate >= threshold

    except:
        return False


### main function 

def preprocess(df, target):

    print("\n--- SMART PREPROCESSING ---")

    df = df.copy()

    report = {
        "converted_numeric": [],
        "converted_datetime": [],
        "dropped_columns": [],
        "warnings": [],
        "high_cardinality": [],
        "outliers": {},
        "recommendations": []
    }

    
    
    # remove duplicate 
    dup_count = df.duplicated().sum()

    if dup_count > 0:

        print(
            f"Removing duplicate rows: "
            f"{dup_count}"
        )

        df = df.drop_duplicates()

    
    # comvert date time 
    for col in list(df.columns):

        if df[col].dtype == "object":

            if (
                df[col].nunique() < 50
                and looks_like_date(df[col])
                and is_datetime_like(df[col])
            ):

                print(
                    f"Converting '{col}' "
                    f"to datetime"
                )

                df[col] = pd.to_datetime(
                    df[col],
                    errors="coerce"
                )

                report[
                    "converted_datetime"
                ].append(col)



    # numeric conversion 

    for col in list(df.columns):

        if df[col].dtype == "object":

            if is_numeric_like(df[col]):

                print(
                    f"Converting '{col}' "
                    f"to numeric"
                )

                df[col] = (
                    df[col]
                    .astype(str)
                    .apply(extract_number)
                )

                report[
                    "converted_numeric"
                ].append(col)

    
    # remove invalid target rows 
    if target in df.columns:

        before = len(df)

        df = df.dropna(subset=[target])

        removed = before - len(df)

        if removed > 0:

            print(
                f"Removed {removed} rows "
                f"with invalid target values"
            )

    
    # drop id columns 
    keywords = [
        "id",
        "index",
        "code",
        "serial",
        "number"
    ]

    id_cols = [

        col for col in df.columns

        if (
            df[col].nunique(dropna=False)
            == len(df)
        )

        and any(
            k in col.lower()
            for k in keywords
        )

        and col != target
    ]

    if id_cols:

        print(
            "Dropping ID-like columns:",
            id_cols
        )

        df = df.drop(columns=id_cols)

        report[
            "dropped_columns"
        ].extend(id_cols)

    
    # drop constant column 
    const_cols = [

        col for col in df.columns

        if (
            df[col]
            .nunique(dropna=False)
            <= 1
        )
    ]

    if const_cols:

        print(
            "Dropping constant columns:",
            const_cols
        )

        df = df.drop(columns=const_cols)

        report[
            "dropped_columns"
        ].extend(const_cols)

    
    # handle nulls 
    for col in list(df.columns):

        if col == target:
            continue

        null_pct = (
            df[col]
            .isnull()
            .mean() * 100
        )

        # too many nulls
        if null_pct > 40:

            print(
                f"Dropping '{col}' "
                f"(too many nulls: "
                f"{null_pct:.2f}%)"
            )

            df = df.drop(columns=[col])

            report[
                "dropped_columns"
            ].append(col)

            continue

        # numerical
        if pd.api.types.is_numeric_dtype(df[col]):

            if null_pct > 0:

                if abs(df[col].skew()) > 1:

                    df[col] = (
                        df[col]
                        .fillna(
                            df[col].median()
                        )
                    )

                else:

                    df[col] = (
                        df[col]
                        .fillna(
                            df[col].mean()
                        )
                    )

        # categorical
        else:

            if null_pct > 0:

                if not df[col].mode().empty:

                    df[col] = (
                        df[col]
                        .fillna(
                            df[col].mode()[0]
                        )
                    )

    

    # high card 
    for col in df.select_dtypes(
        include="object"
    ):

        unique_vals = df[col].nunique()

        if unique_vals > 50:

            print(
                f"High cardinality "
                f"column: '{col}' "
                f"({unique_vals} unique)"
            )

            report[
                "high_cardinality"
            ].append(col)

    
    


    # outlier detection 
    print("\nOutlier Detections:")

    for col in df.select_dtypes(
        include=["int64", "float64"]
    ):

        if df[col].nunique() <= 10:
            continue

        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)

        IQR = Q3 - Q1

        if IQR == 0:
            continue

        lower = Q1 - 1.5 * IQR
        upper = Q3 + 1.5 * IQR

        count = (
            (
                (df[col] < lower)
                |
                (df[col] > upper)
            )
        ).sum()

        ratio = count / len(df)

        if ratio > 0.05:

            print(
                f"- {col}: "
                f"{count} outliers "
                f"({ratio:.1%}) "
                f"--> high"
            )

        elif ratio > 0:

            print(
                f"- {col}: "
                f"{count} outliers "
                f"({ratio:.1%})"
            )

        report["outliers"][col] = int(count)

    
    #### final summary 
    num_cols = df.select_dtypes(
        include=["int64", "float64"]
    ).columns

    cat_cols = df.select_dtypes(
        include="object"
    ).columns

    date_cols = df.select_dtypes(
        include="datetime64[ns]"
    ).columns

    print("\nFinal Data Summary:")

    print(f"- Rows: {df.shape[0]}")
    print(f"- Columns: {df.shape[1]}")
    print(f"- Numerical columns: {len(num_cols)}")
    print(f"- Categorical columns: {len(cat_cols)}")
    print(f"- Datetime columns: {len(date_cols)}")

    return df

