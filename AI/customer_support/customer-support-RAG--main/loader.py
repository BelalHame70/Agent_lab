import pandas as pd
from pypdf import PdfReader
from chunker import chunk_with_metadata
from augmenter import augment_question_smart
from langdetect import detect





import pandas as pd


def load_csv_flexible(path):
    
    # detect CSV  and load it
    
    df = pd.read_csv(path)
    
    # normalize column names
    df.columns = [str(c).strip().lower().replace(" ", "_") for c in df.columns]
    



    # try to find question and answer columns
    question_col = find_column(df, [
    "question",
    "q", 
    "query",
    "user_query",
    "questions", 
    "cistomer_query" ,
    "customer query",
    "Customer_query",
    "Qustomer_Query",
    "Qustomer Query",
    "CUSTOMER_QUERY",
    "QUERY",
    "Query",
    "User_query",
    "USER QUERY",
    "User_Query",
    "faq",
    "FAQ",
    "faq_question",
    "FAQ_question",
    "faq_questions",
    "FAQ question",
    "faq questions",
    "FAQ_Questions",
    "FAQ_Question",
    "FAQs",
    "FAQS",
    "faqs",
    "prompt",
    "Prompt",
    "PROMPT",
    "user_prompt",
    "User_Prompt",
    "customer_prompt",
    "Customer_prompt",
    "user_prompts",
    "input",
    "user_input",
    "user input",
    "User_input",
    "User_Input",
    "USER_INPUT",
    "request",
    "user_request",
    "customer_request",
    "Request",
    "issue",
    "Issue",
    "issues",
    "Issues",
    "ISUUE",
    "ISSUES",
    "user_issue",
    "User_issue",
    "customer_issue",
    "problem",
    "Problem",
    "PROBLEM",
    "problems",
    "customer_problem",
    "user_problem",
    "user_question",
    "user_questions",
    "customer_question",
    "customer_questions",
    "subject",
    "tiltle",
    "instruction",
    "insructions",
    "Question" , 
    "QUESTION" , 
    "QUESTIONS" , 
    "Questions" , 
    "ask" , 
    "ASK" ,
    "سؤال",
    "السؤال",
    "الاسئلة" ,
    " الاسئلة الشائعة" , 
    " استفسار" , 
    "الاستفسار",
    "السؤال",
    "الاسئلة",
    "الأسئلة",
    "استفسار",
    "استفسارات",
    "استعلام",
    "المشكلة",
    "مشكله",
    "الطلب",
    "عنوان السؤال",
    "السؤال الشائع",
    "الاستفسار",
    "استفسار العميل"
    ])



    answer_col = find_column(df, [
    "answer", 
    "a", 
    "response", 
    "reply",
    "Answer",
    "answers",
    "Response",
    "Reply",
    "solution",
    "resolution",
    "output",
    "result",
    "faq_answer",
    "customer_answer",
    "support_response",
    "assistant_response",
    "user_answer",
    "completion",
    "response_text",
    "الجواب",
    "الإجابة",
    "الاجابة",
    "الإجابات",
    "الرد",
    "الحل",
    "الحلول",
    "النتيجة",
    "التوضيح",
    "رد الدعم",
    "الإجابة المقترحة",
    "الرد الرسمي",
    "الإجابة", 
    "اجابة", 
    "رد"])
    




    if not question_col or not answer_col:
        raise ValueError(
            f"Could not find question/answer columns. "
            f"Available columns: {list(df.columns)}\n"
            f"Please ensure CSV has columns containing 'question' and 'answer'"
        )
    



    print(f" Detected question column: '{question_col}'")
    print(f" Detected answer column: '{answer_col}'")
    



    chunks = []
    


    for idx, row in df.iterrows():
        q = str(row[question_col]).strip()
        a = str(row[answer_col]).strip()
        
        # skip empty rows
        if not q or not a or q == "nan" or a == "nan":
            continue
        


        # add original 1
        chunks.append(f"Question: {q}\nAnswer: {a}")
        


        # add augment
        try:
            lang = detect(q)
            augmented = augment_question_smart(q, lang, n=3)
            for aug_q in augmented:
                chunks.append(f"Question: {aug_q}\nAnswer: {a}")
        #except:
            #pass  # skip augmentation if it fails
        except Exception as e:
            print(e)


    print(f"✓ Loaded {len(chunks)} chunks (original + augmented)")
    return chunks




def find_column(df, candidates):
    
    #find a column that matches any of names

    ## lower 
    
    df_cols_lower = [c.lower() for c in df.columns]
    


    for candidate in candidates:
        candidate_lower = candidate.lower()
        #  match
        if candidate_lower in df_cols_lower:
            return df.columns[df_cols_lower.index(candidate_lower)]
        


        #  match lower()
        for col in df.columns:
            if candidate_lower in col.lower():
                return col
    
    return None


def smart_load(path):
    

    #detect file type and load it 
    
    if path.endswith(".csv"):
        return load_csv_flexible(path)
    

    elif path.endswith(".pdf"):
        return load_pdf(path)
    

    #elif path.endswith((".xlsx", ".xls")):
       # return load_excel(path)
    #elif path.endswith(".json"):
       # return load_json(path)



    else:
        raise ValueError(f"Unsupported file type: {path}")


#def load(path):
#    
#    df = pd.read_excel(path)
#    df.to_csv(temp_csv, index=False)
#    import os
#    os.remove(temp_csv)
#    return chunks




#def load_json(path):
#   
#    
#    with open(path, 'r', encoding='utf-8') as f:

    
#    chunks = []
    

#    if isinstance(data, list):       
#                q = item["question"]
#                a = item["answer"]
#                chunks.append(f"Question: {q}\nAnswer: {a}")
#    elif isinstance(data, dict):
#        i
#                    chunks.append(f"Question: {q}\nAnswer: {a}")
    
#    return chunks







# PDF 

def load_pdf(path):
    reader = PdfReader(path)
    text = ""


    for page in reader.pages:
        if page.extract_text():
            text += page.extract_text() + "\n"

    chunks = chunk_with_metadata(text)

    
    
    return chunks



