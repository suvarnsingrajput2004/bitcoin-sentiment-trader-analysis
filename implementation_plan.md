# Implementation Plan: Bitcoin Sentiment & Hyperliquid Trader Performance Analysis

This plan outlines the steps to build an end-to-end Data Science project analyzing the relationship between trader performance (Hyperliquid historical data) and Bitcoin market sentiment (Fear & Greed Index).

## User Review Required

> [!IMPORTANT]
> Since this is a comprehensive hiring assignment for **Primetrade.ai**, we will structure the project into a professional GitHub-ready repository in your workspace.
> The key components of the solution will include:
> 1. Data Cleaning and Merging pipeline.
> 2. Exploratory Data Analysis (EDA) on the relationships between sentiment, trading volume, leverage, and profitability (PnL).
> 3. Machine Learning Modeling:
>    - **Task**: Predicting trade profitability (binary classification: `profitable` vs `not_profitable` or regression on `closedPnL`).
>    - **Alternative Task**: Predicting market sentiment shifts using aggregated trading indicators (e.g., net longs/shorts, average leverage). We will implement a classification model predicting whether a trade will be profitable, and a regression model predicting the closed PnL.
> 4. Interactive **Streamlit Dashboard** allowing users to select historical timeframes, view key metrics, and get real-time model predictions.
> 5. A well-documented **Jupyter Notebook** (`analysis.ipynb`) and **README.md**.

## Open Questions

> [!NOTE]
> 1. **Python Dependencies**: We need to install `pandas`, `numpy`, `scikit-learn`, `matplotlib`, `seaborn`, and `streamlit`. Do you approve running the package installation command on your machine?
> 2. **Target Variable for Modeling**: Our proposed primary model will predict whether a trade is profitable (binary classification: `closedPnL > 0` vs `closedPnL <= 0`) using features like execution price, size, leverage, side, and the Fear & Greed index value on that day. Does this sound good, or would you prefer predicting the Fear/Greed sentiment using trading volumes?

## Proposed Changes

We will create a structured project inside `c:\Users\HP\Downloads\GraVITY\`:

### [Project Repository Structure]

#### [NEW] [analysis.ipynb](file:///c:/Users/HP/Downloads/GraVITY/analysis.ipynb)
Jupyter notebook containing the data ingestion, merging, exploratory data analysis, data visualization, feature engineering, and model training/evaluation.

#### [NEW] [dashboard.py](file:///c:/Users/HP/Downloads/GraVITY/dashboard.py)
Streamlit dashboard file. It will contain tabs for:
- **Historical Analysis**: Charts showing how Fear/Greed Index correlates with trader volume, average leverage, and cumulative PnL.
- **Model Inference**: Interactive form where a user inputs trade details (size, leverage, side, current Fear/Greed value) and gets a prediction of whether the trade is likely to be profitable.
- **Key Metrics**: Dynamic metrics (e.g., total trade volume, average leverage in extreme fear vs extreme greed).

#### [NEW] [README.md](file:///c:/Users/HP/Downloads/GraVITY/README.md)
Comprehensive markdown file detailing:
- Project overview, goals, and results.
- Instructions to run the Jupyter Notebook and Streamlit dashboard.
- Key business insights derived from the data.

#### [NEW] [requirements.txt](file:///c:/Users/HP/Downloads/GraVITY/requirements.txt)
Python dependency list.

## Verification Plan

### Automated Verification
- We will run the python scripts and notebook cells to verify that data processes correctly without memory limits (since the trader dataset is ~139MB with 1M+ rows).
- We will evaluate the ML model using Precision, Recall, F1-Score, and ROC-AUC.

### Manual Verification
- We will run the Streamlit dashboard locally (`streamlit run dashboard.py`) and use the browser subagent to verify the user interface, interactive inputs, and charts.
