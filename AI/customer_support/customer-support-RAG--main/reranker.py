import ollama

class Reranker:
    def rerank(self, query, candidates, top_k=4):
        
        ### use llm for rerank 
        scores = []
        
        for candidate in candidates:
            prompt = f"""
Question: {query}
Context: {candidate}

On a scale of 0-10, how relevant is this context to answering the question?
Answer with ONLY a number.
"""
            response = ollama.generate(model="qwen2:7b", prompt=prompt, options={"temperature": 0})
            try:
                score = float(response["response"].strip())
            except:
                score = 0.0
            scores.append(score)
        
        # sort by score
        ranked = sorted(zip(candidates, scores), key=lambda x: x[1], reverse=True)
        return [cand for cand, _ in ranked[:top_k]]