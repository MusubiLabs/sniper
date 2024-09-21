import { functions, systemPrompts, userPrompts } from '../prompts/aiHelpers';

export default async function judgeAttention({
  goal,
  description,
  screens,
}: {
  goal: string;
  description: string;
  screens: string[];
}) {
  if (!goal) return false;
  if (!description) return false;
  if (screens.length === 0) return false;

  const apiKey = process.env.OPENAI_API_KEY;
  const proxyUrl = process.env.OPENAI_API_PROXY;

  const images = screens.map((screen) => {
    return {
      type: 'image_url',
      image_url: {
        url: `data:image/png;base64,${screen}`,
      },
    };
  });

  const messages = [
    {
      role: 'system',
      content: systemPrompts,
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: userPrompts(goal, description),
        },
        ...images,
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
      model: 'gpt-4o-mini',
      messages,
      functions: functions,
      function_call: { name: 'evaluate_productivity' },
      temperature: 0.4,
    }),
  });

  const data = (await response.json()) as any;

  const functionCallResult = JSON.parse(
    data.choices[0].message.function_call.arguments,
  );

  return {
    observations: functionCallResult?.observations || [],
    distracted: functionCallResult?.productivity_score > 6,
    productivity_score: functionCallResult?.productivity_score,
    assessment: functionCallResult?.assessment,
    feedback: functionCallResult?.feedback,
  };
}
