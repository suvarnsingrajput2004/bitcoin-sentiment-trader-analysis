# Bitcoin Sentiment & Hyperliquid Trader Performance Analysis

This project explores the relationship between trader performance (historical perpetuals trading data on Hyperliquid) and Bitcoin market sentiment (Fear & Greed Index). It includes data merging pipelines, exploratory data analysis, machine learning models, and an interactive Streamlit dashboard.

## 📊 Project Overview

In this project, we analyzed **211,224 trades** spanning two years (2023-2025) and mapped them to the **Bitcoin Fear & Greed Index** to discover how market sentiment influences trader performance.

### Key Business Insights

1. **Contrarian Sentiment Trading**: 
   - During **Extreme Greed**, traders behave as net-sellers (the Buy Ratio drops to **44.86%**). This is their most profitable state, delivering the highest win rate of **89.17%** and an average closed profit of **$130.21** per trade.
   - During **Extreme Fear**, traders buy the dip (the Buy Ratio rises to **51.10%**). Although this strategy is profitable, it has a lower win rate of **76.22%** and average profit of **$71.03**, representing the risk of catching a falling knife.
2. **Activity & Liquidity**: 
   - Trading volume and trade frequency peak during **Fear** (61.8k trades, $483M volume) and **Greed** (50.3k trades, $288M volume) regimes, indicating that these high-momentum phases attract the highest liquidity.

---

## 🛠️ Installation & Setup

We recommend setting up a virtual environment `.venv` to run the project.

### 1. Clone & Initialize Environment
```bash
# Create a virtual environment
python -m venv .venv

# Activate the virtual environment
# On Windows PowerShell:
.venv\Scripts\Activate.ps1
# On Windows CMD:
.venv\Scripts\activate.bat
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

## 🚀 Execution Guide

### 1. Run the Analysis Notebook
Open and run all cells in [analysis.ipynb](analysis.ipynb) to inspect the data cleaning, exploratory data analysis, feature engineering, and machine learning models.
```bash
jupyter notebook analysis.ipynb
```
*(This will also train the classification model and save the `trading_model_pipeline.joblib` binary file required for the dashboard).*

### 2. Launch the Streamlit Dashboard
To run the interactive analytics dashboard and get real-time trade profitability predictions:
```bash
streamlit run dashboard.py
```

---

## 🤖 Predictive Modeling Performance

We trained a **HistGradientBoostingClassifier** to predict whether a closed trade will be profitable (`Closed PnL > 0`) using features like trade size, side, direction, execution price, fees, and the Fear & Greed index.

* **Accuracy**: **92.38%**
* **Precision**: **93.29%**
* **Recall**: **97.86%**
* **F1-Score**: **95.52%**
* **ROC-AUC**: **0.8659**

The most significant predictors of profitability are the **Direction** (Open Long vs Close Short, etc.) and **Start Position**, closely followed by the **Fear & Greed Index** value.

---

## 📂 Repository Structure
```
├── historical_trader_data.csv    # Hyperliquid trader data
├── fear_greed_index.csv          # Bitcoin Fear & Greed Index
├── merged_trader_sentiment.csv   # Merged/cleaned dataset
├── trading_model_pipeline.joblib  # Trained model binary
├── analysis.ipynb                # Jupyter Notebook with EDA & ML
├── dashboard.py                  # Streamlit application code
├── requirements.txt              # Dependency file
└── README.md                     # Documentation
```
