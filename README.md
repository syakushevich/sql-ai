# SQL-AI

[SQL-AI](https://github.com/syakushevich/sql-ai) is a chat-based application designed to interact with PostgreSQL databases using natural language queries, powered by OpenAI's Large Language Model (LLM). This project is based on the [assistant-ui](https://github.com/Yonom/assistant-ui) chat app, customized to provide a seamless interface for querying PostgreSQL.

---

## Getting Started

### Step 1: Add Your OpenAI API Key
Add your OpenAI API key to the `.env.local` file:

```bash
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Step 2: Configure PostgreSQL Connection
Add your PostgreSQL connection details to the .env.local file:

```bash
DATABASE_USER=your_postgres_username
DATABASE_HOST=localhost
DATABASE_NAME=your_database_name
DATABASE_PASSWORD=your_password
DATABASE_PORT=5432
```
Ensure PostgreSQL is running locally on your system, and the database is correctly configured.

Step 3: Define Tables for LLM Queries
In db.js, specify the tables you want the LLM to query by setting the TABLES_TO_CHECK array. For example:

```javascript
const TABLES_TO_CHECK = ['users', 'orders'];
````
This ensures the application only includes the specified tables in the metadata provided to the LLM.

Step 4: Run the Development Server
Once configured, start the development server:

```bash
Copy code
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
Open http://localhost:3000 in your browser to see the application.

