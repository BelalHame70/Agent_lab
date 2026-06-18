def detect_route(question):

    q = question.lower()

    if "missing" in q:
        return "python"

    if "unique" in q:
        return "python"

    if "top" in q and "product" in q:
        return "python"

    return "query_engine"