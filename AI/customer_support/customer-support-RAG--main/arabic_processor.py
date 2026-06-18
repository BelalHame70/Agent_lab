import re
from pyarabic import araby


class ArabicProcessor:
    def __init__(self):
        
       
        pass



    # clean , normalization 
    def normalize_arabic(self, text: str) -> str:
        

        if not text:
            return ""

        #  remove diacritics (تشكيل)
        text = araby.strip_diacritics(text)

        #  unify forms (إ أ آ -> ا)
        text = re.sub(r'[إأآا]', 'ا', text)

        #  normalize 
        text = text.replace('ى', 'ي')

        # normalize 
        text = text.replace('ة', 'ه')

        #  remove  (ـ)
        text = text.replace('ـ', '')

        #  remove punctuation 
        text = re.sub(r'[^\w\s]', ' ', text)

        #  normalize whitespace
        text = re.sub(r'\s+', ' ', text)

        return text.strip().lower()

   



    # query expansion
    def expand_query_arabic(self, query: str):
        

        ##### rely on embedding

        if not query:
            return []

        query = self.normalize_arabic(query)

        expanded = set()
        expanded.add(query)

        words = query.split()

        



        ### sub query generation
        if len(words) > 1:
            for i in range(len(words)):
                sub_query = " ".join(words[:i] + words[i+1:])
                if len(sub_query.split()) >= 1:
                    expanded.add(sub_query)



        
        #Prefix / suffix variations 
        
        expanded.add("مشكلة " + query)
        expanded.add("حل " + query)
        expanded.add("عن " + query)
        expanded.add("كيفية " + query)
        expanded.add("طريقة " + query)
        expanded.add("خطوات " + query)
        expanded.add("اريد معرفة" + query)


        


        # keep expanded
        
        return list(expanded)