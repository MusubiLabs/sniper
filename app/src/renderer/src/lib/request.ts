interface RequestOptions extends Omit<RequestInit, 'method'> {
  data?: object;
}

interface ResponseData<T = any> {
  code: number;
  data: T;
  message: string;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { headers = {}, data, ...restOptions } = options;

  const url = new URL(endpoint, window.location.origin);

  // 设置默认headers
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // 处理请求体
  const body = data ? JSON.stringify(data) : undefined;

  try {
    const response = await fetch(url.toString(), {
      method: 'POST', // 所有请求都设置为POST
      headers: defaultHeaders,
      body,
      ...restOptions,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ResponseData<T> = await response.json();

    console.log(result);

    // 你可以根据你的API响应结构来调整这里的逻辑
    if (result.code !== 0) {
      throw new Error(result.message || 'Request failed');
    }

    return result.data;
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}

export default request;
