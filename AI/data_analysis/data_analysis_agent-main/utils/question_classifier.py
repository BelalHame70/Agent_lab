####3 ignored #####3
######### not used ############
COMPUTATION_KEYWORDS = [

    # aggregations
    "average",
    "mean",
    "sum",
    "total",
    "count",
    "maximum",
    "minimum",
    "highest",
    "lowest",
    "top",
    "best",
    "worst",

    # comparisons
    "compare",
    "difference",
    "greater",
    "less",

    # statistics
    "correlation",
    "distribution",
    "median",
    "std",
    "variance",

    # filtering
    "how many",
    "which",
    "what category",
    "group by",

    # trends
    "trend",
    "growth",

    # percentages
    "percentage",
    "ratio",
    "proportion"
]


def requires_python_analysis(question):

    q = question.lower()

    for keyword in COMPUTATION_KEYWORDS:

        if keyword in q:
            return True

    return False