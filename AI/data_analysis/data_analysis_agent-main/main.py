import pandas as pd 
import time 
from utils.eda import run_eda 
from utils.preprocessing import preprocess 
from utils.feature_selection import feature_selection
from utils.visualization import visualize 
from utils.report import generate_full_report 
from utils.agent_decision import decide_pipeline
from utils.modeling import train_models

from utils.llm_agent import ask_llm
from utils.context_builder import build_context

from utils.query_engine import answer_data_question
from utils.query_executer import execute_query

from utils.dataset_snapshot import build_dataset_snapshot
from utils.memory import add_memory
from utils.memory import get_memory_text

from utils.question_classifier import (
    requires_python_analysis
)



def main():

    start = time.time()

    # load data
    path = input("Enter CSV file path: ")

    try:
        df = pd.read_csv(path)

    except Exception as e:
        print(f"Error loading file: {e}")
        return

    # clean columns
    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace(" ", "_")
    )

    print("\n--- HEAD ---")
    print(df.head())

    # initial EDA
    print("\n--- EDA ---")
    eda_report = run_eda(df)

    # target selection
    print("\nColumns:")
    print(df.columns.tolist())

    print("\nSuggested target columns:")

    for col in df.columns:

        if df[col].nunique() < 20:
            print(f"- {col} (categorical candidate)")

        elif df[col].dtype in ['int64', 'float64']:
            print(f"- {col} (numerical candidate)")

    while True:

        target = input("\nEnter target column: ")

        if target in df.columns:
            break

        print("Invalid column! Try again.")

    # preprocessing
    print("\n--- PREPROCESSING ---")
    df = preprocess(df, target)

    # make sure target still exsist 
    if target not in df.columns:
        print(f"Target column '{target}' was dropped!")
        return

    # updated EDA
    print("\n--- UPDATED EDA ---")
    eda_report = run_eda(df)

    # decision engine
    #decisions = decide_pipeline(df, target, eda_report)

    decisions = decide_pipeline(df, target)

    # feature selection
    print("\n--- FEATURE SELECTION ---")
    selected = feature_selection(df, target, decisions)

    if not selected:
        print("No important features detected!")

    # visualization
    #print("\n--- VISUALIZATION ---")
    #visualize(df, target, selected, eda_report, decisions)



    # train on moddels
    print("\n--- MODEL TRAINING ---")
    model_results = train_models(df,target,decisions
)

    context = build_context(
    df,
    target,
    eda_report,
    decisions,
    model_results
    )

    # report
    generate_full_report(
        df,
        target,
        selected,
        eda_report,
        decisions
    )


    

    #while True:

        #  question = input("\nAsk about #your data (or type exit): ")

        #if question.lower() == "exit":
        #   break

        #answer = ask_llm(question)

        #print("\nAI Analyst:")
        #print(answer)

    

    # dataset snapshot
    snapshot = build_dataset_snapshot(df)

    print("\n--- AI DATA ANALYST CHAT ---")

    while True:

        question = input(
    "\nAsk about your dataset (type exit): "
)

        if question.lower() == "exit":
            break

        # some computation 
        result = execute_query(
        df,
        question
)

        # using memory 
        memory_text = get_memory_text()

        # llm response 
        answer = ask_llm(
        question=question,
        analysis_result=result,
        dataset_snapshot=snapshot,
        context=context,
        memory=memory_text
)

        print("\nAI Analyst:")
        print(answer)

        # save memory 
        add_memory(question, answer)



    end = time.time()

    print(f"\nTotal execution time: {end - start:.2f} seconds")


if __name__ == "__main__":
    main()

    