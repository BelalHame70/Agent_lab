
#### not used #####3
import pandas as pd


def build_dataset_snapshot(df):

    lines = []

    lines.append("DATASET SAMPLE")
    lines.append(df.head(5).to_string())

    lines.append("\nCOLUMNS")
    lines.append(str(df.columns.tolist()))

    lines.append("\nDATA TYPES")
    lines.append(df.dtypes.to_string())

    lines.append("\nNUMERICAL SUMMARY")

    try:
        lines.append(
            df.describe().to_string()
        )
    except:
        pass

    return "\n".join(lines)