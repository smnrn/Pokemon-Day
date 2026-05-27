# Pokémon Battle Predictor – Project Documentation

This document serves as the comprehensive guide to the architecture, machine learning models, and validation systems powering the Pokémon Battle Predictor platform.

---

## 1. System Overview

The Pokémon Battle Predictor is a full-stack React application backed by a Supabase PostgreSQL database. It is designed to act as an advanced telemetry and drafting dashboard for competitive Pokémon players. 

The system is divided into three primary "Engines", each handling a distinct computational task, and a centralized Analytics layer that evaluates the system's performance over time.

### System Architecture
- **Frontend Framework:** React with Vite, styled with custom CSS and Framer Motion for animations.
- **Data Source:** Real-time data fetching from the public `PokeAPI`.
- **Backend & Database:** Supabase (PostgreSQL). The backend logs every single action across the application, saving generated teams, predicted outcomes, and ground truth battle logs into specialized tables (`engine_outputs`, `predictions`, `ground_truth`, `audit_logs`).

---

## 2. The Three Computational Engines

### Engine 1: Gym Team Generator (Clustering & Drafting)
**Purpose:** Autonomously generate highly synergistic, competitive Pokémon teams based on a chosen strategy, gym type, and ML model.

**How it works:**
1. **Filtering & Sampling:** It queries PokeAPI to gather a pool of valid Pokémon based on the selected region (e.g., National Dex, Gen 1) and Type. It explicitly filters out universally banned Pokémon (like box-art Legendaries and Paradox Pokémon).
2. **Stat Evaluation:** It calculates the Base Stat Total (BST) and cross-references it with a Resistance Score (calculating how many types the Pokémon resists vs. how many it is weak to).
3. **Role Assignment:** Based on the selected ML model (e.g., K-Means), the engine assigns a strategic role (`Sweeper`, `Tank`, `Support`, or `Pivot`). For example, a Pokémon with a high Offensive Score and Speed > 80 is classified as a `Sweeper`.
4. **Moveset & Build Generation:** The engine builds a complete Pokémon Showdown export profile. It automatically assigns the optimal Nature, Held Item, EV spread, and computationally selects 4 moves (STAB and coverage moves).

### Engine 2: Counter-Pick Analytics (Minimax & Heuristics)
**Purpose:** Analyze an opponent's team and calculate the absolute optimal counter-picks to defeat them.

**How it works:**
1. **Opponent Profiling:** It imports the opponent's team (via plain text or Showdown format) and extracts their typing and base stats.
2. **Deep Counter Analysis:** It iterates through the entire Pokédex (or a specific region) and calculates a dynamic **Counter Score (10-100)** for every single Pokémon.
3. **Scoring Weight & Relative Scaling:** 
   - *Offensive Score (40%):* Can the candidate hit the opponent for Super Effective damage using STAB (Same Type Attack Bonus)?
   - *Defensive Score (40%):* Does the candidate resist or possess an immunity to the opponent's primary types?
   - *Stat Bonus (20%):* A raw Base Stat Total modifier.
   - *Relative Scaling Algorithm:* Rather than assigning raw scores that cap out at 99, the engine finds the absolute highest possible raw score in the current data pool. It assigns that optimal Pokémon a strict 99, and then grades every other Pokémon on a curve *relative* to that absolute max. This guarantees an authentic and mathematically sound spread of data.
4. It outputs the top 6 highest-scoring Pokémon, assigning them custom moves specifically designed to hit the opponent's weaknesses.

### Engine 3: Battle Predictor & Ground Truth Logging
**Purpose:** Predict the outcome of a hypothetical battle between two teams, and log the actual real-world result to validate the AI.

**How it works:**
1. It compares `Battler A` against `Battler B`. 
2. It calculates a Team Score based on raw stat totals, EV bonuses, and move-pool synergy.
3. It generates a **Confidence Percentage** indicating how likely the predicted winner is to win.
4. When the user clicks "LOG RESULT", the prediction, the *actual* winner, and the confidence score are saved to the Supabase `ground_truth` table for analytics.

---

## 3. Machine Learning Models Discussed

In Engine 1, the user can select from various models to guide the team generation. Here is how they conceptually apply to Pokémon drafting:

| Model | Primary Metric | Discussion |
| :--- | :--- | :--- |
| **K-Means Clustering** | Silhouette Score | Clusters Pokémon into distinct strategic roles (Sweepers, Tanks, etc.) based on the spatial proximity of their 6 base stats. It ensures a team has diverse, well-rounded roles. |
| **K-Nearest Neighbors (KNN)** | Accuracy | Classifies a Pokémon's role by looking at the *k* closest Pokémon in the training set. If a new Pokémon has stats similar to known Tanks, it becomes a Tank. |
| **Cosine Similarity** | Similarity Score | Treats a Pokémon's stats as a vector and measures the angle between them. Useful for finding Pokémon that have the exact same *stat distribution shape* (e.g., highly polarized offense), regardless of raw total. |
| **Decision Tree** | Accuracy | Uses hard thresholds (e.g., `If Speed > 100 AND Attack > 90`) to split the Pokédex into branches, definitively categorizing them into combat roles. |
| **Random Forest** | Accuracy | An ensemble of many Decision Trees. It prevents the overfitting common in single trees, resulting in the most robust and accurate role classifications. |

---

## 4. Validation Metrics & Telemetry

The application continuously grades its own intelligence using the data logged in Engine 3. The Analytics dashboard provides deep telemetry on the AI's performance.

### The Confusion Matrix (TP, TN, FP, FN)
The system validates its predictions using a standard binary classification Confusion Matrix. In this context, **Battler A** is the "Positive" class, and **Battler B** is the "Negative" class.

> [!NOTE]
> **What is the basis for TP/TN/FP/FN?**
> *   **True Positive (TP):** The AI predicted **Battler A** would win, and Battler A **actually won**. (Prediction = Correct).
> *   **True Negative (TN):** The AI predicted **Battler B** would win, and Battler B **actually won**. (Prediction = Correct).
> *   **False Positive (FP):** The AI predicted **Battler A** would win, but **Battler B** actually won. (The AI *falsely* over-predicted Battler A).
> *   **False Negative (FN):** The AI predicted **Battler B** would win, but **Battler A** actually won. (The AI *falsely* over-predicted Battler B).

By tracking these, the developer can see if the algorithm is inherently biased toward always picking Team A.

### Advanced Statistical Validation
Beyond simple accuracy, the system uses complex mathematical loss functions to validate how *confident* the AI was when it was right or wrong:

1. **Brier Score:** 
   Measures the mean squared difference between the predicted probability (Confidence %) and the actual outcome (1 for Correct, 0 for Incorrect). 
   *Goal:* A score as close to `0.0` as possible. If the AI is 99% confident and loses, the Brier Score is heavily penalized.
2. **Log Loss (Cross-Entropy Loss):**
   Heavily penalizes the model for being confidently wrong. If the model says a team has a 10% chance to win, but they actually win, Log Loss increases significantly.
   *Goal:* Lower is better.

### Global Audit Log
Every single generated team, counter-pick analysis, and logged battle triggers a `db_updated` event. This writes to the `audit_logs` table, ensuring a permanent, tamper-proof history of every action taken by the user and the AI engines.
