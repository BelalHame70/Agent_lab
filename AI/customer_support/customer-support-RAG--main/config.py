# MODEL_NAME = "mistral7b"
#MODEL_NAME = "llama2" 
#MODEL_NAME="jais:1.3b" 
#MODEL_NAME = "qwen2.5:1.5b"
#MODEL_NAME = "gemma3:4b"
MODEL_NAME = "qwen2:7b"
#MODEL_NAME = "qwen2.5:3b"  # llam3 | mistral | qwen2:7b # more effecient but heavy 
#EMBEDDING_MODEL = "sentence-transformers/paraphrase-multilingual-mpnet-base-v2"

#EMBEDDING_MODEL = "all-MiniLM-L6-v2"  #  not good in arabic 



#EMBEDDING_MODEL = "CAMeL-Lab/bert-base-arabic-camelbert-msa"


# EMBEDDING_MODEL = "aubmindlab/araelectra-base"


#EMBEDDING_MODEL = "sentence-transformers/paraphrase-multilingual-mpnet-base-v2"



#EMBEDDING_MODEL = "intfloat/multilingual-e5-base"
#EMBEDDING_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
EMBEDDING_MODEL = "intfloat/multilingual-e5-large"

#CHUNK_SIZE = 600
#CHUNK_SIZE = 700
CHUNK_SIZE = 350
CHUNK_OVERLAP = 80

TOP_K = 4
#TEMPERATURE = 0.6
TEMPERATURE = 0.2


## basic fallback + llm generation 
FALLBACK_ANSWER = {
    "en": "This information is not available, maybe you have to call real customer support.",
    "ar": " هذه المعلومة غير متوفرة. ربما عليك الاتصال باحد مقدمى خدمة العملاء او زيارة موقع المؤسسة "
    }
