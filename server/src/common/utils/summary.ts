import { Attention } from 'src/modules/attentions/attention.entity';
import { functions, summaryPrompts } from '../prompts/aiHelpers';

export default async function summarizeGoal(attentions: Attention[]) {
  const apiKey = process.env.OPENAI_API_KEY;
  const proxyUrl = process.env.OPENAI_API_PROXY;

  const messages = [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: summaryPrompts(attentions),
        },
      ],
    },
  ];

  const response = await fetch(proxyUrl + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      functions: functions,
      function_call: { name: 'sumarry_productivity' },
      temperature: 0.4,
    }),
  });

  const data = (await response.json()) as any;

  const functionCallResult = JSON.parse(
    data.choices[0].message.function_call.arguments,
  );

  return {
    summarizeResult: functionCallResult?.summarize_msg || '',
  };
}
