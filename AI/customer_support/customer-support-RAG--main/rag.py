import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from config import TOP_K , MODEL_NAME , EMBEDDING_MODEL


from hybrid_retriever import HybridRetriever

import pickle
import faiss
import os



class RAGEngine:
    def __init__(self):
        # embedding model 
        self.model = SentenceTransformer(EMBEDDING_MODEL)

        self.index = None
        self.texts = []

        #### add reteriver
        self.hybrid = HybridRetriever(self.model)




    # embed text

    def embed(self, texts):
        if isinstance(texts, str):
            texts = [texts]

        vectors = self.model.encode(texts, convert_to_numpy=True)
        return vectors.astype("float32")


    # build FAISS index
    def build_index(self, chunks):
        if not chunks:
            return



        self.texts = chunks
        vectors = self.embed(chunks)



        dim = vectors.shape[1]
        #self.index = faiss.IndexFlatL2(dim)
        self.index = faiss.IndexFlatIP(dim)
        self.index.add(vectors)

        #### reteriver 
        self.hybrid.build_index(chunks)



    def retrieve(self, query):
        
        #basic retrieval 

        if self.index is None:
            return []

        query_vec = self.embed(query)
        scores, ids = self.index.search(query_vec, TOP_K)



        results = []
        for idx in ids[0]:
            if idx < len(self.texts):
                results.append(self.texts[idx])



        return results



    # retrieve top k     k=4 
    ## update retreival
    

    def retrieve_multi_query(self, query, use_expansion=True):
        
        #retrieve using multiple query 
        
        if self.index is None:
            return []
    
        queries = [query]
    



        if use_expansion:
            # add normalize
            from normalizer import normalize_text
            normalized = normalize_text(query)
            if normalized != query:
                queries.append(normalized)
        



            # add arabic expansions
            from arabic_processor import ArabicProcessor
            processor = ArabicProcessor()
            expanded = processor.expand_query_arabic(query)
            queries.extend(expanded[:2])  # add top 2 expansions
    
        # retrieve for each query 
        #all_results = {}  # use dict to track scores
    

        """
        for q in queries:
            query_vec = self.embed(q)
            scores, ids = self.index.search(query_vec, TOP_K * 2)  # get more candidates
        

            for score, idx in zip(scores[0], ids[0]):
                if idx < len(self.texts):
                    if idx in all_results:
                        all_results[idx] = min(all_results[idx], score)  # keep best score
                    else:
                        all_results[idx] = score
    


        # sort by score and get top-k
        sorted_results = sorted(all_results.items(), key=lambda x: x[1])


        top_indices = [idx for idx, _ in sorted_results[:TOP_K]]
    

        return [self.texts[idx] for idx in top_indices]

    """
        

        all_results = []

        for q in queries:

            results = self.hybrid.retrieve_multi_query(
            q,
            top_k=TOP_K,
            alpha=0.7   ### 0.8 
    )

            all_results.extend(results)

        # remove duplicates
        unique_results = []

        for item in all_results:

            if item not in unique_results:
                unique_results.append(item)

        return unique_results[:TOP_K]



    def retrieve_with_confidence(self, query, confidence_threshold=0.10): # 0.7 





        if self.index is None:
            return [], 0.0
    
        query_vec = self.embed(query)
        scores, ids = self.index.search(query_vec, TOP_K)
    


    ### error 
    ###############################3
        # cnvert distance to confidence (0-1)
        # lower distance = --> higher confidence
        max_distance = scores[0].max() if len(scores[0]) > 0 else 1.0
        confidences = 1 - (scores[0] / (max_distance + 1e-9))
    
        # filter by confidence
        results = []
        avg_confidence = 0.0
    


        for idx, conf in zip(ids[0], confidences):
            if idx < len(self.texts) and conf >=  confidence_threshold:
                results.append(self.texts[idx])
                avg_confidence += conf
    


        if results:
            avg_confidence /= len(results)
    

    
        return results, avg_confidence
    

##################################################

    #### for connect 


    ### save
    def save(self, folder):

        os.makedirs(folder, exist_ok=True)

        faiss.write_index(
        self.index,
        f"{folder}/index.faiss"
    )

        with open(
        f"{folder}/texts.pkl",
        "wb"
        ) as f:

            pickle.dump(
                self.texts,
            f
        )


    ### load 

    def load(self, folder):

        self.index = faiss.read_index(
            f"{folder}/index.faiss"
    )

        with open(
            f"{folder}/texts.pkl",
            "rb"
        ) as f:

            self.texts = pickle.load(f)
        
        # rebuild hybrid retriever
        self.hybrid.build_index(self.texts)