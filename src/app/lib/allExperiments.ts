export async function groupExperimentData(data: any[]) {
    const grouped = data.reduce((acc, row) => {
        const { experiment_id, experiment_name, system_prompt, experiment_created_at, ...rest } = row;

        if (!acc[experiment_id]) {
            acc[experiment_id] = {
                experiment_id,
                experiment_name,
                system_prompt,
                created_at: experiment_created_at,
                test_cases: {}
            };
        }

        if (rest.test_id) {
            if (!acc[experiment_id].test_cases[rest.test_id]) {
                acc[experiment_id].test_cases[rest.test_id] = {
                    test_id: rest.test_id,
                    test_case: rest.test_case,
                    reference_answer: rest.reference_answer,
                    evaluations: []
                };
            }

            if (rest.model_name) {
                acc[experiment_id].test_cases[rest.test_id].evaluations.push({
                    model_name: rest.model_name,
                    accuracy: rest.accuracy,
                    clarity: rest.clarity,
                    relevancy: rest.relevancy,
                    created_at: rest.evaluation_created_at
                });
            }
        }

        return acc;
    }, {});

    return grouped;
}
