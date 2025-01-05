import { sql } from "@vercel/postgres"

export async function insertExperiment(system_prompt: string) {
    try {
        const result = await sql `WITH upsert AS (
                INSERT INTO experiments (experiment_name, system_prompt, created_at)
                SELECT 
                    CONCAT('Experiment ', (SELECT COUNT(*) + 1 FROM experiments)), 
                    ${system_prompt}, 
                    NOW()
                WHERE NOT EXISTS (
                    SELECT 1 
                    FROM experiments 
                    WHERE system_prompt = ${system_prompt}
                )
                RETURNING experiment_id
            )
            -- If no row was inserted (because the system_prompt exists), return the existing experiment_id
            SELECT experiment_id FROM upsert
            UNION
            SELECT experiment_id FROM experiments WHERE system_prompt = ${system_prompt} LIMIT 1
        `
        const experiment_id = result.rows[0].experiment_id;
        return experiment_id;
    }
    catch (error) {
        console.error("Failed to insert experiment: ", error);
        throw error;
    }
}

export async function insertTestCase(experiment_id: number, test_case: string, reference_answer: string, model1_answer: string, model2_answer: string) {
    try {
        const result = await sql`
            WITH upsert AS (
                INSERT INTO test_cases (experiment_id, test_case, reference_answer, created_at, model1_answer, model2_answer)
                SELECT 
                    ${experiment_id}, 
                    ${test_case}, 
                    ${reference_answer},
                    NOW(),
                    ${model1_answer},
                    ${model2_answer}
                WHERE NOT EXISTS (
                    SELECT 1 
                    FROM test_cases
                    WHERE experiment_id = ${experiment_id} AND test_case = ${test_case}
                )
                RETURNING test_id
            )
            -- If no row was inserted (because experiment_id and test_case already exist), return the existing test_id
            SELECT test_id 
            FROM upsert
            UNION
            SELECT test_id 
            FROM test_cases 
            WHERE experiment_id = ${experiment_id} AND test_case = ${test_case} 
            LIMIT 1;
        `;

        const test_id = result.rows[0].test_id;
        return test_id;

    } catch (error) {
        console.error('Error inserting test case:', error);
        throw error;
    }
}

export async function insertEvaluationResults(test_id: number, model_name: string, accuracy: number, clarity: number, relevancy: number) {
    try {
        await sql`
        INSERT INTO evaluation_results
        (test_id, model_name, accuracy, clarity, relevancy, created_at)
        VALUES
        (${test_id}, ${model_name}, ${accuracy}, ${clarity}, ${relevancy}, NOW())
        ON CONFLICT (test_id, model_name) 
        DO UPDATE SET
            accuracy = EXCLUDED.accuracy,
            clarity = EXCLUDED.clarity,
            relevancy = EXCLUDED.relevancy,
            created_at = NOW();
        `;
    } catch (error) {
        console.log("Error entering Evaluation Results: ", error);
        throw error;
    }
}

