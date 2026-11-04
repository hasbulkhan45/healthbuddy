/**
 * AI Streaming Chat API Route - With proper error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerAnonClient } from '@/lib/supabase/server';
import { aiChatService } from '@/services/ai';
import { aiProviderFactory } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerAnonClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message, conversationId, provider } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    // Verify provider connection before attempting
    const providerToUse = provider || aiProviderFactory.getDefaultProvider();
    const status = await aiProviderFactory.verifyConnection(providerToUse);

    if (!status.isReachable && providerToUse !== 'mock') {
      return NextResponse.json(
        {
          error: 'Unable to connect to the AI service right now. Please check your connection and try again.',
          code: 'PROVIDER_UNREACHABLE',
          provider: providerToUse,
          providerError: status.error,
          retryable: true,
        },
        { status: 503 }
      );
    }

    // Create a ReadableStream for Server-Sent Events
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let hasError = false;
          for await (const chunk of aiChatService.streamMessage(user.id, message, conversationId)) {
            const data = JSON.stringify({
              chunk: chunk.chunk,
              conversationId: chunk.conversationId,
              done: chunk.done,
              provider: status.name,
              isMockProvider: status.name === 'mock',
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Stream failed';
          let code = 'STREAM_ERROR';
          let retryable = true;

          if (errorMessage.toLowerCase().includes('timeout')) {
            code = 'TIMEOUT';
          } else if (errorMessage.toLowerCase().includes('rate limit') || errorMessage.includes('429')) {
            code = 'RATE_LIMIT';
          } else if (errorMessage.toLowerCase().includes('unauthorized') || errorMessage.toLowerCase().includes('invalid api key')) {
            code = 'AUTH_FAILED';
            retryable = false;
          } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch failed')) {
            code = 'NETWORK_ERROR';
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            error: 'Unable to connect to the AI service right now. Please check your connection and try again.',
            code,
            retryable,
            providerError: errorMessage,
          })}\n\n`));
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('AI streaming chat error:', error);
    return NextResponse.json(
      { error: 'Failed to start streaming chat', code: 'UNKNOWN_ERROR', retryable: true },
      { status: 500 }
    );
  }
}