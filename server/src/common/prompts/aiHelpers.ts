import { Attention } from 'src/modules/attentions/attention.entity';

export const systemPrompts = `
You are an automated productivity assistant tasked with evaluating a user's productivity based on screenshots of their screen(s). Your goal is to assess whether the user is efficiently working towards completing their goal and provide constructive feedback.
`;

export const userPrompts = (goal: string, description: string) => {
  return `Here is the user's goal:
<goal>
${goal}
</goal>

Here is the user's description:
<description>
${description}
</description>

You will be provided with a series of screenshots. If the user has multiple monitors, you will receive screenshots for all of them. Analyze these screenshots carefully to determine what the user is doing and how it relates to their goal.

To evaluate the user's productivity:

1. Examine the content of each screenshot, noting the applications, websites, or documents open.
2. Compare the user's activities to the items on their goal.
3. Assess whether the user is making progress on their tasks or if they appear to be distracted.
4. Consider the time spent on each activity and whether it seems proportionate to the task's importance.

After your analysis, provide an evaluation of the user's productivity. Your evaluation should include:

1. A brief description of what you observe in the screenshots.
2. An assessment of whether the user is efficiently working towards their goals.
3. Based on the user's goal and their current screenshot, provide some suggestions and feedback to the user using the second person perspective. Keep it as short as possible, no more than 100 words.
4. Suggestions for improvement, if necessary.
5. A productivity score on a scale of 1-10, where 1 is completely unproductive and 10 is maximally productive.
6. Determine whether the user has completed their goals seriously based on their goals and current screenshots. If the productivity score is less than 6, you should assume that the task user is not seriously committed to their goals, and your judgment logic needs to be very strict. Your judgment will help the user improve their quality of life.
7. Based on the user's current screenshot, if the user is distracted, determine the reason for the user's current distraction. The currently available reasons for distraction include scrolling through Twitter, YouTube, shopping. If the reason is not within the scope of the content, return to others
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
        reason: {
          type: 'string',
          enum: ['twitter', 'youtube', 'shopping', 'others'],
          description: 'Reason for the user being distracted',
        },
      },
      required: [
        'observations',
        'productivity_score',
        'assessment',
        'feedback',
        'reason',
      ],
    },
  },
  {
    name: 'sumarry_productivity',
    description: 'Summarize user productivity based on screenshot analysis',
    parameters: {
      type: 'object',
      properties: {
        summarize_msg: {
          type: 'string',
          description:
            'Summarize user productivity based on screenshot analysis',
        },
      },
      required: ['summarize_msg'],
    },
  },
];

export const summaryPrompts = (attentions: Attention[]) => {
  const descriptions = attentions?.map((attention) => {
    return attention?.assessment || '';
  });

  return `
You are assisting in summarizing a user's progress on a todo task. The user has been working on a task, and screenshots have been taken periodically to monitor their progress. Each screenshot has been described by an AI. Your job is to summarize these descriptions into a cohesive and encouraging summary for the user.

Here are the descriptions of the screenshots taken during the user's task:

<descriptions>
${descriptions?.join('\n\n')}
</descriptions>

Analyze these descriptions carefully. Look for patterns, progress, and any notable changes in the user's activity over time. Pay attention to signs of focus, productivity, or potential distractions.

Create a summary that encapsulates the user's overall progress and engagement with the task. The summary should be structured as follows:
1. A general overview of the user's engagement with the task
2. Highlights of productive periods or achievements
3. Gentle observations about any periods of distraction or reduced focus
4. Encouragement for future work on similar tasks
5. The summary should not exceed 200 words

Remember, this summary will be shown directly to the user. Use a friendly, supportive, and motivational tone. Address the user in the second person ("you", "your") to make the summary more personal and direct.

Provide your summary within <summary> tags. Here's an example of how your response should be structured:

<summary>
You've been making steady progress on your task! Over the past [time period], you've shown great focus, especially when [specific productive activity]. While there were a few moments where [brief mention of distraction], you quickly got back on track. Keep up the great work - your dedication is clearly showing in your results!
</summary>

Now, based on the provided descriptions, create your encouraging and insightful summary for the user.`;
};