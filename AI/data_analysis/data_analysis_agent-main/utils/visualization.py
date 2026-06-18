
######3 no visualize ####
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
#import utils.decision  


def visualize(df, target, feature_scores, eda_report, decisions):

    print("\n--- SMART VISUALIZATION ENGINE ---")

    
    # select top features
    top_numeric = []
    top_categorical = []


    # num features
    if 'numerical_correlation' in feature_scores:
        top_numeric = feature_scores['numerical_correlation'].head(3).index.tolist()


    elif 'numerical_anova' in feature_scores:
        top_numeric = feature_scores['numerical_anova'].head(3).index.tolist()


    # categorical features
    if 'categorical_anova' in feature_scores:
        cat_cols = feature_scores['categorical_anova'].head(5).index.tolist()
        top_categorical = list(set([col.split('_')[0] for col in cat_cols]))



    elif 'categorical_chi2' in feature_scores:
        cat_cols = feature_scores['categorical_chi2'].head(5).index.tolist()
        top_categorical = list(set([col.split('_')[0] for col in cat_cols]))


    print(f"Top numerical features: {top_numeric}")
    print(f"Top categorical features: {top_categorical}")


    # check

    if not top_numeric and not top_categorical:
        print(" No important features detected. Skipping visualization.")
        return





    print("\n[0] Target Distribution")

    # categorical target
    if df[target].dtype == 'object':

        counts = df[target].value_counts()
        n_classes = len(counts)

        # pie chart ( for small number od categories)
        if n_classes <= 5:
            plt.figure()
            counts.plot(kind='pie', autopct='%1.1f%%')
            plt.title(f"{target} Distribution (Pie Chart)")
            plt.ylabel('')
            plt.show()

        # bar chart 
        plt.figure()
        counts.plot(kind='bar')
        plt.title(f"{target} Distribution (Bar Chart)")
        plt.xlabel(target)
        plt.ylabel("Count")
        plt.xticks(rotation=45)
        plt.show()


    # numerical target
    else:
        plt.figure()
        df[target].hist()
        plt.title(f"{target} Distribution (Histogram)")
        plt.xlabel(target)
        plt.ylabel("Frequency")
        plt.show()




    
    # Single Variable Analysis
    
    print("\n[1] Single Variable Analysis")

    for col in top_numeric:
        if col in df.columns:
            plt.figure()
            df[col].hist()
            plt.title(f"Histogram of {col}")
            plt.xlabel(col)
            plt.ylabel("Frequency")
            plt.show()


    for col in top_categorical:
        if col in df.columns:
            plt.figure()
            df[col].value_counts().head(10).plot(kind='bar')
            plt.title(f"Top Categories of {col}")
            plt.xticks(rotation=45)
            plt.show()


    # relationship with target
    
    print("\n[2] Relationship with Target")

    # case 1 --> target is numerical
    if df[target].dtype in ['int64', 'float64']:

        # numerical vs target --> scatter
        for col in top_numeric:
            if col in df.columns:
                plt.figure()
                plt.scatter(df[col], df[target])
                plt.title(f"{col} vs {target}")
                plt.xlabel(col)
                plt.ylabel(target)
                plt.show()

        # categorical vs target --> boxplot
        for col in top_categorical:
            if col in df.columns:
                plt.figure()
                sns.boxplot(x=df[col], y=df[target])
                plt.title(f"{col} vs {target}")
                plt.xticks(rotation=45)
                plt.show()

    # Case 2--> target is categorical
    else:
        # numerical vs categorical target --> boxplot
        for col in top_numeric:
            if col in df.columns:
                plt.figure()
                sns.boxplot(x=df[target], y=df[col])
                plt.title(f"{col} vs {target}")
                plt.xticks(rotation=45)
                plt.show()


        # categorical vs categorical -> grouped bar
        for col in top_categorical:
            if col in df.columns:
                plt.figure()
                pd.crosstab(df[col], df[target]).plot(kind='bar', stacked=True)
                plt.title(f"{col} vs {target}")
                plt.xticks(rotation=45)
                plt.show()

    
    # correlation heatmap
    
    print("\n[3] Correlation Heatmap")

    #heatmap_cols = top_numeric.copy()

    #if target not in heatmap_cols and target in df.columns:
    #    heatmap_cols.append(target)

    #if len(heatmap_cols) > 1:
    #    plt.figure(figsize=(8, 6))
    #    corr = df[heatmap_cols].corr()
    #    sns.heatmap(corr, annot=True, cmap='coolwarm')
    #    plt.title("Correlation Heatmap (Top Features)")
    #    plt.show()

    # keep only numeric columns
    heatmap_cols = [
        col for col in top_numeric
        if pd.api.types.is_numeric_dtype(df[col])
]

    # add only numeric target
    if pd.api.types.is_numeric_dtype(df[target]):
        if target not in heatmap_cols:
            heatmap_cols.append(target)

    # build heatmap 
    if len(heatmap_cols) > 1:
        plt.figure(figsize=(8, 6))
        corr = df[heatmap_cols].corr(numeric_only=True)
        sns.heatmap(corr, annot=True, cmap='coolwarm')
        plt.title("Correlation Heatmap (Top Features)")
        plt.show()
    else:
        print(" Not enough numeric features for heatmap")


    

    # outlier visualization (for only included )
    
    print("\n[4] Outlier Detection ")

    outliers = eda_report.get('outliers', {})

    for col, count in outliers.items():
        if col in top_numeric and count > 0:
            plt.figure()
            sns.boxplot(x=df[col])
            plt.title(f"Outliers in {col}")
            plt.show()
