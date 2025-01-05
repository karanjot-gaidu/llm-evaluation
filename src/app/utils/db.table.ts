import { Client } from '@vercel/postgres';

const neonClient = new Client({
  connectionString: process.env.DATABASE_URL, 
});

async function createTables() {
  try {
    await neonClient.query({
      text: `
        -- Create the experiments table
        CREATE TABLE experiments (
            experiment_id SERIAL PRIMARY KEY,
            experiment_name VARCHAR(255) NOT NULL,
            system_prompt TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Create the test_cases table
        CREATE TABLE test_cases (
            test_id SERIAL PRIMARY KEY,
            experiment_id INTEGER REFERENCES experiments(experiment_id) ON DELETE CASCADE,
            test_case TEXT NOT NULL
        );

        -- Create the evaluation_results table
        CREATE TABLE evaluation_results (
            eval_id SERIAL PRIMARY KEY,
            test_id INTEGER REFERENCES test_cases(test_id) ON DELETE CASCADE,
            model_name VARCHAR(255) NOT NULL, 
            accuracy FLOAT,
            clarity FLOAT,
            relevancy FLOAT
        );

        -- Create an index on experiment_id in test_cases for faster lookups
        CREATE INDEX idx_test_cases_experiment_id ON test_cases (experiment_id);

        -- Create an index on test_id in evaluation_results for faster lookups
        CREATE INDEX idx_evaluation_results_test_id ON evaluation_results (test_id);
      `,
    });
    console.log('Tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

createTables();