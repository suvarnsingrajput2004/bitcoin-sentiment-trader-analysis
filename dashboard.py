import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import joblib
import os

# Set page config for a premium look
st.set_page_config(
    page_title="Primetrade.ai - Trader Sentiment Analytics",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for custom styling (vibrant dark theme, premium font styling, glassmorphism card styling)
st.markdown("""
<style>
    /* Main body background and fonts */
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Outfit', sans-serif;
    }
    
    .main {
        background-color: #0f111a;
        color: #f1f1f1;
    }
    
    /* Header styling */
    .title-text {
        font-weight: 800;
        background: linear-gradient(90deg, #00f2fe 0%, #4facfe 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0px;
    }
    
    /* Premium card containers */
    .metric-card {
        background: rgba(26, 29, 46, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
    }
    
    .metric-card:hover {
        border-color: rgba(0, 242, 254, 0.3);
        transform: translateY(-2px);
    }
    
    /* Accent text */
    .accent-green {
        color: #00e676;
        font-weight: bold;
    }
    
    .accent-red {
        color: #ff1744;
        font-weight: bold;
    }
</style>
""", unsafe_allowed_html=True)

# Helper function to load data
@st.cache_data
def load_data():
    if os.path.exists("merged_trader_sentiment.csv"):
        df = pd.read_csv("merged_trader_sentiment.csv")
    else:
        # Fallback to load and merge on the fly
        df_trader = pd.read_csv("historical_trader_data.csv")
        df_fg = pd.read_csv("fear_greed_index.csv")
        df_trader['dateTime_IST'] = pd.to_datetime(df_trader['Timestamp IST'], format='%d-%m-%Y %H:%M')
        df_trader['date'] = df_trader['dateTime_IST'].dt.strftime('%Y-%m-%d')
        df_fg['date'] = pd.to_datetime(df_fg['date']).dt.strftime('%Y-%m-%d')
        df = pd.merge(df_trader, df_fg, on='date', how='inner')
        df = df.rename(columns={'value': 'sentiment_value', 'classification': 'sentiment'})
    return df

# Helper to load model
@st.cache_resource
def load_model():
    if os.path.exists("trading_model_pipeline.joblib"):
        return joblib.load("trading_model_pipeline.joblib")
    return None

df = load_data()
model_data = load_model()

# Header Section
col1, col2 = st.columns([4, 1])
with col1:
    st.markdown('<h1 class="title-text">PRIMETRADE.AI</h1>', unsafe_allowed_html=True)
    st.markdown("### Bitcoin Sentiment & Hyperliquid Trader Performance Analytics Dashboard")
with col2:
    st.image("https://cryptologos.cc/logos/bitcoin-btc-logo.png", width=70)

st.markdown("---")

# Sidebar
st.sidebar.markdown("## Configuration & Filters")
sentiment_filter = st.sidebar.multiselect(
    "Select Market Sentiment Levels",
    options=['Extreme Fear', 'Fear', 'Neutral', 'Greed', 'Extreme Greed'],
    default=['Extreme Fear', 'Fear', 'Neutral', 'Greed', 'Extreme Greed']
)

coin_filter = st.sidebar.multiselect(
    "Select Coins",
    options=df['Coin'].unique().tolist(),
    default=df['Coin'].value_counts().head(5).index.tolist()
)

# Apply filters
df_filtered = df[(df['sentiment'].isin(sentiment_filter)) & (df['Coin'].isin(coin_filter))]

# Dynamic Overview Metrics
st.markdown("### 📊 Market Overview")
total_volume = df_filtered['Size USD'].sum()
total_trades = len(df_filtered)
avg_pnl = df_filtered['Closed PnL'].mean()
win_rate = (df_filtered['Closed PnL'] > 0.0).sum() / (df_filtered['Closed PnL'] != 0.0).sum()

m1, m2, m3, m4 = st.columns(4)
with m1:
    st.markdown(f"""
    <div class="metric-card">
        <p style="font-size:14px; margin:0; color:#888;">Total Volume</p>
        <h2 style="margin:5px 0 0 0; font-weight:800; color:#00f2fe;">${total_volume:,.2f}</h2>
    </div>
    """, unsafe_allowed_html=True)
with m2:
    st.markdown(f"""
    <div class="metric-card">
        <p style="font-size:14px; margin:0; color:#888;">Total Trades</p>
        <h2 style="margin:5px 0 0 0; font-weight:800; color:#4facfe;">{total_trades:,}</h2>
    </div>
    """, unsafe_allowed_html=True)
with m3:
    st.markdown(f"""
    <div class="metric-card">
        <p style="font-size:14px; margin:0; color:#888;">Average Trade PnL</p>
        <h2 style="margin:5px 0 0 0; font-weight:800; color:{'#00e676' if avg_pnl >= 0 else '#ff1744'};">${avg_pnl:,.2f}</h2>
    </div>
    """, unsafe_allowed_html=True)
with m4:
    st.markdown(f"""
    <div class="metric-card">
        <p style="font-size:14px; margin:0; color:#888;">Trader Win Rate</p>
        <h2 style="margin:5px 0 0 0; font-weight:800; color:#e040fb;">{win_rate*100:.2f}%</h2>
    </div>
    """, unsafe_allowed_html=True)

# Tabs
tab1, tab2, tab3 = st.tabs(["📉 Historical Analysis", "🏆 Leaderboard", "🤖 Trade Predictor"])

with tab1:
    st.markdown("### Historical Sentiment vs Trader Behavior")
    
    # 1. Trading Profitability & Volume by Sentiment Chart
    df_closed = df_filtered[df_filtered['Closed PnL'] != 0.0].copy()
    df_closed['is_profit'] = df_closed['Closed PnL'] > 0.0
    
    closed_stats = df_closed.groupby('sentiment').agg(
        closed_trades=('Trade ID', 'count'),
        profitable_trades=('is_profit', 'sum'),
        total_closed_pnl=('Closed PnL', 'sum'),
        avg_closed_pnl=('Closed PnL', 'mean')
    ).reindex(['Extreme Fear', 'Fear', 'Neutral', 'Greed', 'Extreme Greed']).dropna()
    closed_stats['win_rate'] = (closed_stats['profitable_trades'] / closed_stats['closed_trades']) * 100
    
    col_a, col_b = st.columns(2)
    
    with col_a:
        # Plotly chart for Win Rate and Avg PnL
        fig_pnl = go.Figure()
        fig_pnl.add_trace(go.Bar(
            x=closed_stats.index,
            y=closed_stats['win_rate'],
            name="Win Rate (%)",
            marker_color='rgba(79, 172, 254, 0.7)',
            yaxis="y"
        ))
        fig_pnl.add_trace(go.Scatter(
            x=closed_stats.index,
            y=closed_stats['avg_closed_pnl'],
            name="Avg Closed PnL ($)",
            mode='lines+markers',
            line=dict(color='#ff1744', width=3),
            yaxis="y2"
        ))
        
        fig_pnl.update_layout(
            title="Win Rate & Avg Profit/Loss per Sentiment Category",
            yaxis=dict(title="Win Rate (%)", range=[70, 95]),
            yaxis2=dict(title="Avg PnL ($)", overlaying="y", side="right"),
            template="plotly_dark",
            legend=dict(x=0.01, y=0.99)
        )
        st.plotly_chart(fig_pnl, use_container_width=True)
        
    with col_b:
        # Plotly chart for Volume distribution
        fig_vol = px.bar(
            closed_stats.reset_index(),
            x='sentiment',
            y='closed_trades',
            title="Closed Trades Count by Market Sentiment",
            labels={'sentiment': 'Market Sentiment', 'closed_trades': 'Closed Trades'},
            color='sentiment',
            color_discrete_sequence=px.colors.sequential.Agsunset,
            template="plotly_dark"
        )
        st.plotly_chart(fig_vol, use_container_width=True)

    # 2. Buy/Sell Ratio Line Chart
    buy_sell = df_filtered.groupby(['sentiment', 'Side']).size().unstack(fill_value=0)
    if 'BUY' in buy_sell.columns and 'SELL' in buy_sell.columns:
        buy_sell['Buy_Ratio'] = (buy_sell['BUY'] / (buy_sell['BUY'] + buy_sell['SELL'])) * 100
        buy_sell = buy_sell.reindex(['Extreme Fear', 'Fear', 'Neutral', 'Greed', 'Extreme Greed']).dropna()
        
        fig_ratio = go.Figure()
        fig_ratio.add_trace(go.Scatter(
            x=buy_sell.index,
            y=buy_sell['Buy_Ratio'],
            mode='lines+markers',
            line=dict(color='#00e676', width=3),
            name="Buy Ratio"
        ))
        fig_ratio.add_shape(type="line", x0=0, y0=50, x1=4, y1=50, line=dict(color="gray", dash="dash"))
        fig_ratio.update_layout(
            title="Buy Ratio (%) across Market Sentiment Levels (Bullishness Indicator)",
            yaxis=dict(title="Buy Ratio (%)", range=[35, 65]),
            template="plotly_dark"
        )
        st.plotly_chart(fig_ratio, use_container_width=True)

with tab2:
    st.markdown("### Top Performing Trader Accounts")
    
    # Leaderboard calculation
    leaderboard = df.groupby('Account').agg(
        total_pnl=('Closed PnL', 'sum'),
        total_volume=('Size USD', 'sum'),
        total_trades=('Trade ID', 'count'),
        profitable_trades=('Closed PnL', lambda x: (x > 0.0).sum()),
        closed_trades=('Closed PnL', lambda x: (x != 0.0).sum())
    ).reset_index()
    
    # Win rate calc
    leaderboard['win_rate'] = (leaderboard['profitable_trades'] / leaderboard['closed_trades']).fillna(0) * 100
    leaderboard = leaderboard.sort_values(by='total_pnl', ascending=False).head(10)
    
    # Display Leaderboard Table
    leaderboard_display = leaderboard.rename(columns={
        'Account': 'Account Address',
        'total_pnl': 'Net PnL ($)',
        'total_volume': 'Total Volume ($)',
        'total_trades': 'Trades',
        'win_rate': 'Win Rate (%)'
    })[['Account Address', 'Net PnL ($)', 'Total Volume ($)', 'Trades', 'Win Rate (%)']]
    
    st.dataframe(
        leaderboard_display.style.format({
            'Net PnL ($)': '${:,.2f}',
            'Total Volume ($)': '${:,.2f}',
            'Win Rate (%)': '{:.2f}%'
        }),
        use_container_width=True,
        hide_index=True
    )
    
    # Bar Chart for Top 10 PnL
    fig_lead = px.bar(
        leaderboard,
        x='Account',
        y='total_pnl',
        title="Top 10 Accounts by Net Profitability (Closed PnL)",
        labels={'Account': 'Account Address', 'total_pnl': 'Net Closed PnL ($)'},
        template="plotly_dark",
        color='total_pnl',
        color_continuous_scale=px.colors.sequential.Viridis
    )
    st.plotly_chart(fig_lead, use_container_width=True)

with tab3:
    st.markdown("### Machine Learning Profitability Predictor")
    
    if model_data is None:
        st.warning("Model binary `trading_model_pipeline.joblib` not found. Please run the model training notebook first.")
    else:
        st.markdown("Input trade details below to predict the probability of this trade being profitable.")
        
        # User input columns
        col_x, col_y, col_z = st.columns(3)
        
        with col_x:
            side = st.selectbox("Side", options=["BUY", "SELL"])
            direction = st.selectbox("Direction", options=["Open Long", "Close Long", "Open Short", "Close Short", "Buy", "Sell"])
            crossed = st.selectbox("Crossed (Market vs Limit Order)", options=["True", "False"])
            crossed_bool = True if crossed == "True" else False
            
        with col_y:
            coin = st.selectbox("Coin Symbol", options=model_data['top_coins'] + ['Other'])
            execution_price = st.number_input("Execution Price ($)", min_value=0.0001, value=1.0, format="%.6f")
            size_usd = st.number_input("Trade Size (USD)", min_value=1.0, value=100.0)
            
        with col_z:
            start_position = st.number_input("Start Position Size (Tokens)", value=0.0)
            fee = st.number_input("Transaction Fee (USD)", min_value=0.0, value=0.05)
            sentiment_value = st.slider("Fear & Greed Index Value (0-100)", min_value=0, max_value=100, value=50)

        # Derived value
        size_tokens = size_usd / execution_price
        
        # Prediction
        if st.button("Predict Trade Profitability", type="primary"):
            # Create feature dict matching the classifier's features
            input_df = pd.DataFrame([{
                'Side': side,
                'Direction': direction,
                'Crossed': crossed_bool,
                'Coin_Grouped': coin,
                'Execution Price': execution_price,
                'Size Tokens': size_tokens,
                'Size USD': size_usd,
                'Start Position': start_position,
                'Fee': fee,
                'sentiment_value': sentiment_value
            }])
            
            # Predict
            prob = model_data['pipeline'].predict_proba(input_df)[0, 1]
            pred = model_data['pipeline'].predict(input_df)[0]
            
            # Show output
            st.markdown("---")
            st.markdown("### Predictor Result")
            
            p_col1, p_col2 = st.columns(2)
            with p_col1:
                if pred == 1:
                    st.success(f"### Predicted: PROFITABLE (Confidence: {prob*100:.2f}%)")
                    st.markdown("This trade fits the profile of historically winning trades under current market conditions.")
                else:
                    st.error(f"### Predicted: NOT PROFITABLE (Confidence: {(1-prob)*100:.2f}%)")
                    st.markdown("This trade is predicted to result in a flat/negative PnL. Reconsider entry details.")
            
            with p_col2:
                # Progress bar or gauge
                st.metric("Win Probability", f"{prob*100:.2f}%")
                st.progress(prob)
