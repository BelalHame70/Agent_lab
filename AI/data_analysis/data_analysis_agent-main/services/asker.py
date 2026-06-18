import json
import pandas as pd
from services.clean import ( clean_code )

from services.code_generator import (
    generate_code
)

from services.code_executer import (
    execute_generated_code
)

from services.memory_manager import (
    load_memory,
    add_message
)

from services.answer_generator import (
    generate_final_answer
)


from services.intent_classify import classify_intent

from services.chat_generator import generate_chat_response


def ask_agent(data):

    agent_id = data["agent_id"]
    question = data["message"]

    ## add intent 
    intent = classify_intent(question)

    




########3
    folder = f"agents/{agent_id}"

    ### load memory
    memory = load_memory(agent_id)

    # load dataset

    df = pd.read_csv(
        f"{folder}/dataset.csv"
    )

    # load metadata

    with open(
        f"{folder}/metadata.json",
        "r",
        encoding="utf-8"
    ) as f:

        metadata = json.load(f)

    ###### pass metadata to llm 
    llm_metadata = {
    "rows": metadata["dataset_info"]["rows"],
    "columns": metadata["columns"],
    "numeric_columns": metadata["numeric_columns"],
    "categorical_columns": metadata["categorical_columns"],
    "sample_rows": metadata["sample_rows"]
}
        

    ###########
    if intent == "chat":

        answer = generate_chat_response(
            question, 
            memory
        )

        ### addd 
        add_message(
            agent_id,             #folder,
            "user",               #question,
            question
        )
        add_message(
            agent_id,
            "assistant",
            answer
        )


        return {
            "answer": answer,
            "type": "chat"
        }


################

    # generate code

    generated_code = generate_code(
        question ,
        llm_metadata ,
        memory=memory
    )

    generated_code = clean_code(
    generated_code
    )

    
    # execute code

    execution = execute_generated_code(
        generated_code,
        df
    )

    if not execution["success"]:

        return {
            "answer": "Execution failed",
            "error": execution["error"],
            "generated_code": generated_code
        }

    
    result = execution["result"]

    ### make llm conversational
    final_answer = generate_final_answer(
    question,
    result,
    metadata = llm_metadata
)

    #add_message(
    #agent_id,   ## folder 
    #question,
    ##str(result)
    #)



    add_message(
        agent_id,
        "user",
        question
    )

    add_message(
        agent_id,
        "assistant",
        final_answer
    )

    return {
    "answer": final_answer,
    "raw_result": str(result),
    "generated_code": generated_code
}

   
   # return {
        #"answer": str(result),
        #"generated_code": generated_code
    #}