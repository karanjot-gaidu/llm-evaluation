# 🚀 LLM Evaluation App

An innovative application leveraging Large Language Models (LLMs) to evaluate the responses of other LLMs. Built with **Next.js** and **TypeScript**, this app provides a streamlined platform to benchmark and compare LLM outputs across various domains.

## ⚙️ Features

- **System Role Definition:** Define roles (e.g., customer support, medical assistant, tutor) to set context for evaluations.
- **Test Cases & Reference Answers:** Create test scenarios with ideal responses.
- **Dual-Layer LLM Workflow:** One LLM generates answers while another evaluates them based on predefined criteria.
- **Data Persistence:** Store experiments securely in a **Neon Postgres Database**.
- **Scalability:** Flexible architecture to support multiple LLM integrations.

## 🛠️ Tech Stack

- **Frontend:** Next.js, TypeScript, React
- **Backend:** API Routes in Next.js
- **Database:** Neon Postgres
- **LLM Integration:** Groq SDK

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/karanjot-gaidu/llm-evaluation.git
   ```
2. Navigate to the project folder:
   ```bash
   cd llm-evaluation
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env.local` file and add your API keys:
   ```env
   GROQ_API_KEY=your_api_key
   DATABASE_URL=your_neon_database_url
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧠 How It Works

1. **Define System Role:** Set the behavior of the LLM (e.g., medical assistant, tutor).
2. **Add Test Cases:** Provide scenarios and reference answers.
3. **Generate & Evaluate:** One LLM generates answers, and another evaluates based on criteria.
4. **View Results:** Results are stored in the Neon Postgres database and displayed in the UI.

## 📲 Connect

- **GitHub:** [Repository Link](https://github.com/karanjot-gaidu/llm-evaluation)
- **Demo Video:** [YouTube Link](https://youtu.be/fIPjw-HLQcg)

If you found this project useful, give it a ⭐ on GitHub!
