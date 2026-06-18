# services/trainer.py

import os
import json
import shutil
import requests
import pandas as pd


def train_agent(data):

    agent_id = data["agent_id"]
    file_url = data["file_url"]

    
    ## create agent folder 
    agent_folder = f"agents/{agent_id}"

    os.makedirs(
        agent_folder,
        exist_ok=True
    )

    dataset_path = f"{agent_folder}/dataset.csv"

    
    # download dataset
    if os.path.exists(file_url):

        shutil.copy(
            file_url,
            dataset_path
        )

    else:

        response = requests.get(file_url)

        response.raise_for_status()

        with open(dataset_path, "wb") as f:
            f.write(response.content)

    # load dataset

    df = pd.read_csv(dataset_path)

    ###############
    sample_rows = (
    df.head(5)
    .fillna("")
    .to_dict(orient="records")
)

    
    # detect column type
    numeric_columns = df.select_dtypes(
        include=["int64", "float64"]
    ).columns.tolist()

    categorical_columns = df.select_dtypes(
        include=["object", "category"]
    ).columns.tolist()

    
    # build meta data
    columns_metadata = {}

    for col in df.columns:

        columns_metadata[col] = {

            "dtype": str(df[col].dtype),

            "missing_values": int(
                df[col].isna().sum()
            ),

            "missing_percentage": round(
                (df[col].isna().sum() / len(df)) * 100,
                2
            ),

            "unique_values": int(
                df[col].nunique()
            )
        }

        # numeric statics 

        if col in numeric_columns:

            columns_metadata[col]["mean"] = float(
                df[col].mean()
            ) if not df[col].isna().all() else None

            columns_metadata[col]["min"] = float(
                df[col].min()
            ) if not df[col].isna().all() else None

            columns_metadata[col]["max"] = float(
                df[col].max()
            ) if not df[col].isna().all() else None

            columns_metadata[col]["std"] = float(
                df[col].std()
            ) if not df[col].isna().all() else None

    ## final metedata

    metadata = {

        "agent_id": agent_id,

        "dataset_info": {

            "rows": int(len(df)),

            "columns_count": int(
                len(df.columns)
            )
        },

        "numeric_columns": numeric_columns,

        "categorical_columns": categorical_columns,

        "columns": columns_metadata,

        ########
        "sample_rows": sample_rows
    }


    ###3 llm meta data 
    # save metadata

    metadata_path = f"{agent_folder}/metadata.json"

    with open(
        metadata_path,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            metadata,
            f,
            indent=4
        )

  
    ## response 
    return {

        "success": True,

        "metadata": metadata
    }