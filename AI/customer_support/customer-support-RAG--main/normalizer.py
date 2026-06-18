


#######3 not ued 
import re
from pyarabic import araby

def normalize_text(text):
    
    text = text.strip()
    
    # Detect if Arabic
    if re.search(r'[\u0600-\u06FF]', text):
        #  normalization
        text = araby.strip_diacritics(text)
        text = re.sub('[إأآا]', 'ا', text)
        text = text.replace('ة', 'ه')
        text = text.replace('ى', 'ي')
        text = re.sub('ـ', '', text)
    
    # Common normalization
    text = text.lower()
    text = re.sub(r"(.)\1{2,}", r"\1\1", text)  
    text = re.sub(r'\s+', ' ', text)
    
    return text

