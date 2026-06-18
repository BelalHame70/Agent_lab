import ollama
from config import MODEL_NAME

class QueryExpander:
    def expand_arabic_query(self, query):
        
        #generate differ format of the same question using qwen

        prompt = f"""
أعد صياغة السؤال التالي بـ 3 طرق مختلفة مع الحفاظ على نفس المعنى:

السؤال: {query}

أعط فقط الصياغات الثلاث، كل واحدة في سطر منفصل.
"""
        


        response = ollama.generate(model=MODEL_NAME, prompt=prompt, options={"temperature": 0.3})
        


        variations = [line.strip() for line in response["response"].split('\n') if line.strip()]
        
        
        return [query] + variations[:3]  # original + 3 