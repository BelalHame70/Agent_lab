import pandas as pd
import numpy as np
from sklearn.feature_selection import chi2, f_classif, mutual_info_classif, mutual_info_regression
#from utils.decision import decide_pipeline



def detect_target_type(y):

    # target detection ... categorical (boolean , object , categorical numbers )

    if y.dtype == "object":
        return "categorical"


    if str(y.dtype) == "category":
        return "categorical"


    if str(y.dtype) == "bool":
        return "categorical"


    if pd.api.types.is_numeric_dtype(y):
        unique_vals = y.nunique()


        # binary or  multiclass target
        if unique_vals <= 10:
            return "categorical"

        return "numerical"

    return "categorical"


def clean_numeric_scores(series):
    # remove infinity , nan , 
    # sort descending 
    series = series.replace([np.inf, -np.inf], np.nan).dropna()
    return series.sort_values(ascending=False)



def feature_selection(df, target ,decisions ):
    results = {}

    if target not in df.columns:
        return results


    # separate columns
    
    numeric_cols = df.select_dtypes(include=["int64", "float64"]).columns.tolist()
    categorical_cols = df.select_dtypes(include=["object", "category", "bool"]).columns.tolist()


    # remove target
    if target in numeric_cols:
        numeric_cols.remove(target)


    if target in categorical_cols:
        categorical_cols.remove(target)


    # remove high cardinality categorical columns
    categorical_cols = [
        col for col in categorical_cols
        if df[col].nunique(dropna=True) <= 50
        # cardh

    ]



    y = df[target].copy()
    target_type = detect_target_type(y)

    
    # case 1 -> numerical target (regression)
    
    if target_type == "numerical":

        
        # numerical Features vs target
        
        if len(numeric_cols) > 0:
            X_num = df[numeric_cols]

            corr_scores = X_num.corrwith(y).abs()
            corr_scores = clean_numeric_scores(corr_scores)

            if len(corr_scores) > 0:
                results["numerical_correlation"] = corr_scores

            # mutual information 
            try:
                mi = mutual_info_regression(
                    X_num.fillna(X_num.median()),
                    y
                )

                mi_scores = pd.Series(
                    mi,
                    index=numeric_cols
                )


                mi_scores = clean_numeric_scores(mi_scores)


                if len(mi_scores) > 0:
                    results["numerical_mutual_info"] = mi_scores


            except:
                pass

        
        # categorical features vs target
        
        if len(categorical_cols) > 0:

            X_cat = pd.get_dummies(
                df[categorical_cols],
                drop_first=True
            )

            if X_cat.shape[1] > 0:
                try:
                    f_scores, _ = f_classif(X_cat, y)

                    anova_scores = pd.Series(
                        f_scores,
                        index=X_cat.columns
                    )

                    anova_scores = clean_numeric_scores(anova_scores)

                    if len(anova_scores) > 0:
                        results["categorical_anova"] = anova_scores

                except:
                    pass

    
    #case 2 -? categorical target (classification)
    
    else:

        y_encoded = pd.factorize(y)[0]

        
        # numeric features vs target
        
        if len(numeric_cols) > 0:

            X_num = df[numeric_cols].copy()

            # fill nulls
            for col in X_num.columns:
                X_num[col] = X_num[col].fillna(X_num[col].median())

            try:
                f_scores, _ = f_classif(X_num, y_encoded)


                anova_scores = pd.Series(
                    f_scores,
                    index=numeric_cols
                )

                anova_scores = clean_numeric_scores(anova_scores)

                if len(anova_scores) > 0:
                    results["numerical_anova"] = anova_scores

            except:
                pass

            # mutual information   ?
            try:
                mi = mutual_info_classif(X_num, y_encoded)

                mi_scores = pd.Series(
                    mi,
                    index=numeric_cols
                )


                mi_scores = clean_numeric_scores(mi_scores)

                if len(mi_scores) > 0:
                    results["numerical_mutual_info"] = mi_scores


            except:
                pass

        
        # categorical features vs target
        
        if len(categorical_cols) > 0:

            X_cat = pd.get_dummies(
                df[categorical_cols],
                drop_first=True

            )


            if X_cat.shape[1] > 0:

                try:
                    chi_scores, _ = chi2(X_cat, y_encoded)

                    chi_scores = pd.Series(
                        chi_scores,
                        index=X_cat.columns

                    )


                    chi_scores = clean_numeric_scores(chi_scores)

                    if len(chi_scores) > 0:
                        results["categorical_chi2"] = chi_scores


                except:
                    pass

    return results