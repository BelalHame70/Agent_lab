import pandas as pd
import numpy as np

from sklearn.model_selection import (
    train_test_split,
    cross_val_score
)


from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

from sklearn.preprocessing import (
    OneHotEncoder,
    StandardScaler,
    RobustScaler
)

from sklearn.impute import SimpleImputer

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    r2_score,
    mean_absolute_error,
    mean_squared_error
)


from sklearn.linear_model import (
    LogisticRegression,
    LinearRegression
)


from sklearn.ensemble import (
    RandomForestClassifier,
    RandomForestRegressor,
    GradientBoostingClassifier,
    GradientBoostingRegressor
)


from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier

import warnings
warnings.filterwarnings("ignore")



# models 


def build_models(problem_type):

    if problem_type == "classification":

        return {
            "LogisticRegression":
                LogisticRegression(max_iter=2000),

            "RandomForest":
                RandomForestClassifier(
                    n_estimators=200,
                    random_state=42
                ),

            "GradientBoosting":
                GradientBoostingClassifier(),

            "DecisionTree":
                DecisionTreeClassifier(random_state=42),

            "KNN":
                KNeighborsClassifier()
        }

    else:

        return {
            "LinearRegression":
                LinearRegression(),


            "RandomForest":
                RandomForestRegressor(
                    n_estimators=200,
                    random_state=42
                ),


            "GradientBoosting":
                GradientBoostingRegressor()
        }





def build_preprocessor(X, decisions):

    numeric_cols = X.select_dtypes(
        include=["int64", "float64"]
    ).columns.tolist()


    categorical_cols = X.select_dtypes(
        include=["object"]
    ).columns.tolist()


    # scaling strategy
    if decisions.get("outlier_strategy") == "cap":
        scaler = RobustScaler()
    else:
        scaler = StandardScaler()


    # if numerical 
    numeric_transformer = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", scaler)
    ])


    #  if categorical 
    categorical_transformer = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),

        (
            "encoder",
            OneHotEncoder(handle_unknown="ignore")
        )
    ])


    # final preprocessor
    preprocessor = ColumnTransformer([
        ("num", numeric_transformer, numeric_cols),
        ("cat", categorical_transformer, categorical_cols)
    ])

    return preprocessor





# classification evaluation 
def evaluate_classification(y_test, preds):

    return {

        "accuracy":
            accuracy_score(y_test, preds),

        "precision":
            precision_score(
                y_test,
                preds,
                average="weighted",
                zero_division=0
            ),

        "recall":
            recall_score(
                y_test,
                preds,
                average="weighted"
            ),


        "f1":
            f1_score(
                y_test,
                preds,
                average="weighted"
            )
    }




# regression evaluation 

def evaluate_regression(y_test, preds):

    rmse = np.sqrt(
        mean_squared_error(y_test, preds)
    )

    return {

        "r2":
            r2_score(y_test, preds),

        "mae":
            mean_absolute_error(y_test, preds),

        "rmse":
            rmse
    }





# extract feature , feature importance 
def extract_feature_importance(model, feature_names):

    try:

        final_model = model.named_steps["model"]

        if hasattr(final_model, "feature_importances_"):

            importance = pd.Series(
                final_model.feature_importances_,
                index=feature_names
            )

            return (
                importance
                .sort_values(ascending=False)
                .head(10)
            )

        return None

    except:
        return None




# main 
# train models 
def train_models(df, target, decisions):

    print("\n--- MODELING ENGINE ---")

    # split features & target
    X = df.drop(columns=[target])
    y = df[target]

    # detect problem type
    problem_type = decisions.get(
        "problem_type",
        "classification"
    )

    ############ 
    # for classification
    stratify = None


    if (
        problem_type == "classification"
        and y.nunique() < 20
    ):
        stratify = y


    # train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=stratify
    )


    # preprocessing 
    preprocessor = build_preprocessor(
        X,
        decisions
    )


    # get candidate models
    models = build_models(problem_type)


    # storage
    results = {}
    leaderboard = []

    best_model = None
    best_model_name = None
    best_score = -999999


    

    ## training loop 
    for name, model in models.items():

        print(f"\nTraining {name}...")

        # full pipeline
        pipeline = Pipeline([
            ("preprocessor", preprocessor),
            ("model", model)
        ])

        # fit
        pipeline.fit(X_train, y_train)

        # predict
        preds = pipeline.predict(X_test)


        
        # evalution 

        if problem_type == "classification":

            metrics = evaluate_classification(
                y_test,
                preds
            )

            score = metrics["f1"]

        else:

            metrics = evaluate_regression(
                y_test,
                preds
            )

            score = metrics["r2"]

        
        
        # cross validation 

        try:

            cv_scores = cross_val_score(
                pipeline,
                X,
                y,
                cv=3,
                scoring=(
                    "f1_weighted"
                    if problem_type == "classification"
                    else "r2"
                )
            )

            metrics["cv_mean"] = cv_scores.mean()

        except:

            metrics["cv_mean"] = None

        
        
        # check overfitting 

        try:

            train_score = pipeline.score(
                X_train,
                y_train
            )

            test_score = pipeline.score(
                X_test,
                y_test
            )

            gap = abs(train_score - test_score)

            metrics["overfitting_warning"] = gap > 0.15

        except:

            metrics["overfitting_warning"] = None

        
        #feature importance 
        

        try:

            transformed_names = (
                pipeline.named_steps[
                    "preprocessor"
                ]
                .get_feature_names_out()
            )

            importance = extract_feature_importance(
                pipeline,
                transformed_names
            )

        except:

            importance = None

        
        
        # save it 

        result = {

            "model": name,
            "metrics": metrics,
            "importance": importance
        }

        results[name] = result

        # leaderboard row
        leaderboard.append({

            "model": name,
            "score": score,
            "cv_score": metrics["cv_mean"]
        })

        
        
        # best model select

        if score > best_score:

            best_score = score
            best_model = pipeline
            best_model_name = name

    
    
    

    leaderboard = sorted(
        leaderboard,
        key=lambda x: x["score"],
        reverse=True
    )

    
    
    # model results 
    print("\n--- MODEL RESULTS ---")

    for name, r in results.items():

        print(f"\nModel: {r['model']}")

        for k, v in r["metrics"].items():

            print(f"- {k}: {v}")

    
    
    
    
    # models 
    print("\n--- MODEL LEADERBOARD ---")

    for i, row in enumerate(leaderboard, start=1):

        print(
            f"{i}. "
            f"{row['model']} "
            f"| score={row['score']:.4f} "
            f"| cv={row['cv_score']:.4f}"
        )

    

    # best model 
    

    print("\n--- BEST MODEL ---")
    print(best_model_name)
    print(f"Best Score: {best_score:.4f}")

    
    # return object 
    

    return {

        "problem_type": problem_type,

        "results": results,

        "leaderboard": leaderboard,

        "best_model_name": best_model_name,

        "best_model": best_model
    }