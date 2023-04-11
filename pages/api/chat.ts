import { DEFAULT_SYSTEM_PROMPT } from '@/utils/app/const';
import { OpenAIError, OpenAIStream } from '@/utils/server';
import tiktokenModel from '@dqbd/tiktoken/encoders/cl100k_base.json';
import { Tiktoken, init } from '@dqbd/tiktoken/lite/init';
import { createRequest, updateRequest } from '@/utils/database';
import { Session } from '@supabase/auth-helpers-nextjs'
import { decodeBase64URL } from '@/utils/data';

import { ChatBody, Message } from '@/types/chat';

// @ts-expect-error
import wasm from '../../node_modules/@dqbd/tiktoken/lite/tiktoken_bg.wasm?module';

import tiktokenModel from '@dqbd/tiktoken/encoders/cl100k_base.json';
import { Tiktoken, init } from '@dqbd/tiktoken/lite/init';

export const config = {
  runtime: 'edge',
};

const handler = async (req: Request, res: Response): Promise<Response> => {
  // Custom code for validating Supabase auth cookie
  // Standard supabase.auth.getSession() not working in edge functions
  let session: Session | undefined = undefined
  try {
      // @ts-expect-error
      const encodedSession = JSON.parse(req.cookies.get('supabase-auth-token')['value'])
      if (!encodedSession) {
        throw Error
      }
      const [_header, payloadStr, _signature] = encodedSession[0].split('.');
      const payload = decodeBase64URL(payloadStr);
      const { exp, sub, ...user } = JSON.parse(payload);
      session = {
        expires_at: exp,
        expires_in: exp - Math.round(Date.now() / 1000),
        token_type: 'bearer',
        access_token: encodedSession[0],
        refresh_token: encodedSession[1],
        provider_token: encodedSession[2],
        provider_refresh_token: encodedSession[3],
        user: {
          id: sub,
          factors: encodedSession[4],
          ...user,
        }
      }
      if (session.expires_in <= 0) {
        throw Error
      }
  }
  catch (error) {
    return new Response('Error', { status: 401, statusText: "Please log in to use this functionality" });
  }
  try {
    const { model, messages, key, prompt } = (await req.json()) as ChatBody;
    await init((imports) => WebAssembly.instantiate(wasm, imports));
    const encoding = new Tiktoken(
      tiktokenModel.bpe_ranks,
      tiktokenModel.special_tokens,
      tiktokenModel.pat_str,
    );

    let promptToSend = prompt;
    if (!promptToSend) {
      promptToSend = DEFAULT_SYSTEM_PROMPT;
    }

    const prompt_tokens = encoding.encode(promptToSend);

    let tokenCount = prompt_tokens.length;
    let messagesToSend: Message[] = [];

    const request =  await createRequest({user_id: session.user.id, 
                                          prompt_tokens: prompt_tokens.length,
                                          model: model.id})

    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      const tokens = encoding.encode(message.content);

      if (tokenCount + tokens.length + 1000 > model.tokenLimit) {
        break;
      }
      tokenCount += tokens.length;
      messagesToSend = [message, ...messagesToSend];
    }

    encoding.free();

    const stream = await OpenAIStream(model, promptToSend, key, messagesToSend);

    updateRequest(request.id, { completion_tokens: tokenCount, status: 'succeeded' })

    return new Response(stream);
  } catch (error) {
    console.error(error);
    if (error instanceof OpenAIError) {
      return new Response('Error', { status: 500, statusText: error.message });
    } else {
      return new Response('Error', { status: 500 });
    }
  }
};

export default handler;
