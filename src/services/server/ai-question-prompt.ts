export const generatePrdPrompt = (projectDescription: string, amount: number): string =>  
`
<project_description>
${projectDescription}
</project_description>

Analyze the provided information, focusing on aspects relevant to creating a PRD. Consider the following points:
<prd_analysis>

* Identify the main problem the product aims to solve.
* Define the key functionalities of the MVP.
* Consider potential user stories and usage paths.
* Think about success criteria and how they can be measured.
* Assess project constraints and their impact on product development.
</prd_analysis>

Based on your analysis, generate a list of questions and recommendations. These should address any ambiguities, potential issues, or areas where more information is needed to create an effective PRD. Consider questions regarding:

* Details of the user problem
* Prioritization of functionalities
* Expected user experience
* Measurable success indicators
* Potential risks and challenges
* Timeline and resources

Generate exactly ${amount} of questions, no more and no less.
Format your response as a JSON object with a 'questions' array, where each question has a 'question' field. Example: { "questions": ["Question 1", "Question 2"] }.`