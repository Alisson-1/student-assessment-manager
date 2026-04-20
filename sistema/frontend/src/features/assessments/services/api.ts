export async function parseError(response: Response): Promise<never> {
  let message = `Request failed with status ${response.status}`;
  let fields: Record<string, string> | undefined;
  try {
    const body = (await response.json()) as { message?: string; fields?: Record<string, string> };
    if (body.message) message = body.message;
    if (body.fields) fields = body.fields;
  } catch {
    // ignore non-json bodies
  }
  const err = new Error(message) as Error & {
    status: number;
    fields?: Record<string, string>;
  };
  err.status = response.status;
  err.fields = fields;
  throw err;
}
