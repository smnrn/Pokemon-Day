# Pokémon Battle Predictor ⚡

An advanced, AI-powered telemetry and drafting dashboard for competitive Pokémon players. Built with **React**, **Vite**, and **Supabase**, this platform uses machine learning concepts and heuristic algorithms to autonomously generate highly synergistic teams, analyze opponent weaknesses for optimal counter-picks, and predict battle outcomes.

![Pokemon Battle Predictor](https://img.shields.io/badge/Status-Active-brightgreen.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green.svg)

---

## 🌟 Key Features

The application is divided into three primary computational engines, along with a powerful analytics dashboard:

*   **Engine 1: Gym Team Generator**
    Automatically drafts a synergistic Pokémon team based on your chosen Machine Learning model (e.g., K-Means, Random Forest). It evaluates Base Stat Totals (BST), assigns competitive roles (Sweeper, Tank, etc.), and generates full Pokémon Showdown export profiles including optimal items, natures, and EVs.
*   **Engine 2: Counter-Pick Analytics**
    Paste your opponent's team to instantly run a deep Minimax/Heuristic analysis across the Pokédex. It calculates a dynamic 10-100 "Counter Score" based on STAB multipliers and defensive resistances, providing the absolute optimal 6 Pokémon to defeat them.
*   **Engine 3: Battle Predictor & Ground Truth Logging**
    Predicts the winner between two teams with a calculated Confidence %. Log the real-world outcome of the battle directly to the database to train the telemetry dashboard.
*   **Live Animated Pokédex**
    Features fully animated Generation 5 (Black/White) 2D pixel art sprites for a nostalgic, dynamic feel, complete with shiny toggles and live stat readouts.
*   **Professor Oak's Analytics & Telemetry Dashboard**
    A cyberpunk-themed, dark-mode research lab interface where Professor Oak provides AI-driven justifications for model selection. Tracks the AI's accuracy over time via a live Supabase database. Features include:
    *   **Dynamic Pokeball Donut Charts:** Visually track Correct vs Incorrect Predictions inside a custom Pokeball UI.
    *   **Confusion Matrix:** Tracks True Positives (TP), True Negatives (TN), False Positives (FP), and False Negatives (FN).
    *   **Advanced Loss Metrics:** Evaluates the AI's prediction confidence using Brier Score and Log Loss.
    *   **Audit Logging:** An immutable ledger of every action, team generation, and battle logged on the platform.

---

## 📖 Deep Dive Documentation

For a highly detailed technical breakdown of how the ML models work, the mathematical basis for the Counter Scores, and exactly how the Confusion Matrix (TP, TN, FP, FN) is computed, please read the full documentation file:

👉 **[Read the Full Documentation: pokemon_day_documentation.md](./pokemon_day_documentation.md)**

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+ recommended)
*   A [Supabase](https://supabase.com/) account and project.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/pokemonday.git
   cd PokemonDay
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Initialize the Database:**
   Run the included database script to automatically create the required `ground_truth`, `predictions`, `engine_outputs`, and `audit_logs` tables in Supabase:
   ```bash
   node create-tables.cjs
   ```

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```

Enjoy dominating the competitive ladder! 🏆
