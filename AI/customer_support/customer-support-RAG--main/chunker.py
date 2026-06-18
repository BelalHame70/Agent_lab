def smart_chunk_text(text, size=400, overlap=100):
   

   #### chunker
    # split setence 
    import re
    sentences = re.split(r'[.!?؟।]', text)
    

    chunks = []
    current_chunk = ""
    


    for sentence in sentences:
        sentence = sentence.strip()


        if not sentence:
            continue



        # If adding this sentence exceeds size, start new chunk
        if len(current_chunk) + len(sentence) > size and current_chunk:
            chunks.append(current_chunk.strip())



            # keep overlap by including last part
            words = current_chunk.split()
            overlap_text = " ".join(words[-overlap//10:]) if len(words) > overlap//10 else ""
            current_chunk = overlap_text + " " + sentence


        else:
            current_chunk += " " + sentence
    




    if current_chunk.strip():
        chunks.append(current_chunk.strip())
    


    return chunks

def chunk_with_metadata(text, size=400, overlap=100):       ## 80 ## 120


    # add meta data 
    chunks = smart_chunk_text(text, size, overlap)
    enriched_chunks = []
    

    for i, chunk in enumerate(chunks):
        # add context
        metadata = f"[Chunk {i+1}/{len(chunks)}] "
        enriched_chunks.append(metadata + chunk)
    
    return enriched_chunks







