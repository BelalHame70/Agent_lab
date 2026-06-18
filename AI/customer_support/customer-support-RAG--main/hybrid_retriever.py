from rank_bm25 import BM25Okapi
import numpy as np 

import faiss



class HybridRetriever:


    def __init__(self, embedding_model):
        self.embedding_model = embedding_model
        self.bm25 = None
        self.texts = []
        self.faiss_index = None




    def build_index(self, texts):
        self.texts = texts
        


        # BM25  --->keyword based
        tokenized = [text.split() for text in texts]
        self.bm25 = BM25Okapi(tokenized)
        


        # FAISS ----? semantic 
        vectors = self.embedding_model.encode(texts, convert_to_numpy=True).astype('float32')


        dim = vectors.shape[1]
        self.faiss_index = faiss.IndexFlatL2(dim)
        self.faiss_index.add(vectors)
    



    def retrieve_multi_query(self, query, top_k=10, alpha=0.5):


        
        #hybrid retrieval with weight
        #alpha weight for semantic search 
        



        # BM25 
        bm25_scores = self.bm25.get_scores(query.split())
        bm25_scores = (bm25_scores - bm25_scores.min()) / (bm25_scores.max() - bm25_scores.min() + 1e-9)
        
        # semantic scores
        query_vec = self.embedding_model.encode([query], convert_to_numpy=True).astype('float32')


        distances, indices = self.faiss_index.search(query_vec, len(self.texts))

        semantic_scores = 1 / (1 + distances[0])  # convert distance to similarity

        semantic_scores = (semantic_scores - semantic_scores.min()) / (semantic_scores.max() - semantic_scores.min() + 1e-9)
        



        # combine scores
        combined_scores = alpha * semantic_scores + (1 - alpha) * bm25_scores
        


        
        # appear top kk
        top_indices = np.argsort(combined_scores)[-top_k:][::-1]
        return [self.texts[i] for i in top_indices]
    


