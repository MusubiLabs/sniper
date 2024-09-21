import { functions, systemPrompts, userPrompts } from '../prompts/aiHelpers';

const apiKey = 'sk-svcacct-Bsn1lYtDsvqPadRey7i8T3BlbkFJHMlw1aRwPp9WCEaADycf';
const proxyUrl = 'https://funni.cn/v1';

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

  // const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`

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
      model: 'gpt-4o',
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
