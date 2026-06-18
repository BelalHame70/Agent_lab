import ollama
import re
from config import MODEL_NAME
from langdetect import detect

import pandas as pd 


#client = ollama.Client(timeout=60)

#def augment_question(question: str, lang: str, n: int = 3):
#    

#    system_prompt = (
#        "You generate alternative user questions.\n"
#        "Rules:\n"
#        "- Keep the SAME meaning\n"
#        "- Do NOT answer\n"
#        "- Output ONLY a list\n"
#        "- Each line is ONE question\n"
#        f"- Generate exactly {n} variations\n"
#    )

#    if lang == "ar":
#        system_prompt += "- Use Arabic conversational style\n"

#    prompt = f"{system_prompt}\nOriginal question:\n{question}"

#    response = client.generate(
#        model=MODEL_NAME,
#        prompt=prompt,
#        options={"temperature": 0.3}
#    )

#    text = response["response"]

#    # Clean output 
#    questions = []
#    for line in text.split("\n"):
#        line = re.sub(r"^[\-\*\d\.\)]\s*", "", line).strip()
#        if line and line.lower() != question.lower():
#            questions.append(line)

#    return questions[:n]












def augment_question_smart(question: str, lang: str, n: int = 5):
    
    system_prompt = (
        "Generate alternative ways to ask the same question.\n"
        "Rules:\n"
        "- Keep EXACT same meaning\n"
        "- Use different wordings and structures\n"
        "- Include formal and informal versions\n"
        "- Include questions with typos/mistakes users might make\n"
        f"- Generate exactly {n} variations\n"
        "- Output ONLY the questions, one per line\n"
    )




    if lang == "ar":
        system_prompt += """
- استخدم اللهجة المصرية والفصحى
- أضف أخطاء إملائية شائعة
- استخدم صيغ مختلفة (ماذا، كيف، هل، ممكن، عايز)
"""

    prompt = f"{system_prompt}\n\nالسؤال الأصلي:\n{question}"



    response = ollama.generate(
        model=MODEL_NAME,
        prompt=prompt,
        options={"temperature": 0.5}  # higher temp for diversity
    )



    text = response["response"]
    questions = []
    
    for line in text.split("\n"):
        line = re.sub(r"^[\-\*\d\.\)]\s*", "", line).strip()
        if line and line.lower() != question.lower():
            questions.append(line)



    return questions[:n]




# update loader 
def load_csv_with_augmentation(path):
    # load csv and augment 
    df = pd.read_csv(path)
    df.columns = [c.strip().lower() for c in df.columns]
    
    chunks = []
    


    for _, row in df.iterrows():
        q = str(row["question"]).strip()
        a = str(row["answer"]).strip()
        
        if not q or not a:
            continue
        
        # 0riginal 
        chunks.append(f"Question: {q}\nAnswer: {a}")
        


        # detect language
        lang = detect(q)
        


        # add augmented one
        augmented = augment_question_smart(q, lang, n=5)   ## 6 
        for aug_q in augmented:
            chunks.append(f"Question: {aug_q}\nAnswer: {a}")
    
    return chunks

