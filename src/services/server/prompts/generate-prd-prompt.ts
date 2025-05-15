import type { AIQuestionDTO } from "@/types";

export const generatePrdPrompt = (questions: AIQuestionDTO[]) => `
<answered_questions>
${questions.filter(q => q.answer !== null).map(q => `Question ${q.sequence_number}: ${q.question} \n Answer: ${q.answer}`).join('\n')}
</answered_questions>

---

You are an AI assistant tasked with summarizing a conversation about planning a PRD (Product Requirements Document) for an MVP and preparing a concise summary for the next stage of development. In the conversation history, you will find the following information:
1. Project description  
2. Identified user problem  
3. Conversation history containing questions and answers  
4. Recommendations regarding PRD content

Your tasks are:
1. Summarize the conversation history, focusing on all decisions related to PRD planning.  
2. Match the model’s recommendations with the responses given in the conversation history. Identify which recommendations are relevant based on the discussion.  
3. Prepare a detailed conversation summary that includes:  
   a. Main functional requirements of the product  
   b. Key user stories and usage paths  
   c. Important success criteria and how to measure them  
   d. Any unresolved issues or areas requiring further clarification  
4. Format the output as follows:

### Decisions  
[List the decisions made by the user, numbered].  

### Recommendations  
[List the most relevant recommendations matched to the conversation, numbered]  

### PRD Planning Summary  
[Provide a detailed summary of the conversation, including the elements listed in step 3].  

### Unresolved Issues  
[List any unresolved issues or areas needing further clarification, if any]  

The final output should only contain content in markdown format. Make sure your summary is clear, concise, and provides valuable insights for the next stage of PRD creation.
`;