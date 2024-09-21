export const systemPrompts = `
You are an automated productivity assistant tasked with evaluating a user's productivity based on screenshots of their screen(s) taken every two minutes. Your goal is to assess whether the user is efficiently working towards completing their goal and provide constructive feedback.
`;

export const userPrompts = (goal: string) => {
  return `
Here is the user's goal:
<goal>
${goal}
</goal>

You will be provided with a series of screenshots. If the user has multiple monitors, you will receive screenshots for all of them. Analyze these screenshots carefully to determine what the user is doing and how it relates to their goal.

To evaluate the user's productivity:

1. Examine the content of each screenshot, noting the applications, websites, or documents open.
2. Compare the user's activities to the items on their goal.
3. Assess whether the user is making progress on their tasks or if they appear to be distracted.
4. Consider the time spent on each activity and whether it seems proportionate to the task's importance.

After your analysis, provide an evaluation of the user's productivity. Your evaluation should include:

1. A brief description of what you observe in the screenshots.
2. An assessment of whether the user is efficiently working towards their goals.
3. Specific feedback on which todo items are being addressed and which are not.
4. Suggestions for improvement, if necessary.
5. A productivity score on a scale of 1-10, where 1 is completely unproductive and 10 is maximally productive.
`;
};

export const functions = [
  {
    name: 'evaluate_productivity',
    description: 'Evaluate user productivity based on screenshot analysis',
    parameters: {
      type: 'object',
      properties: {
        observations: {
          type: 'array',
          items: { type: 'string' },
          description: 'Observations from the screenshot analysis',
        },
        distracted: {
          type: 'boolean',
          description:
            'Determine whether the user is distracted based on their situation',
        },
        productivity_score: {
          type: 'integer',
          minimum: 1,
          maximum: 10,
          description: 'Productivity score on a scale of 1-10',
        },
        assessment: {
          type: 'string',
          description: 'Assessment of user efficiency and goal completion',
        },
        feedback: {
          type: 'string',
          description: 'Feedback and improvement suggestions for the user',
        },
      },
      required: [
        'observations',
        'productivity_score',
        'assessment',
        'feedback',
      ],
    },
  },
];
