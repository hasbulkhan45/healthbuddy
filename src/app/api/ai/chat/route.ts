/**
 * AI Chat API Route - With proper error handling and connection verification
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
      // Provider configured but not reachable - return specific error
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

    const result = await aiChatService.sendMessage(user.id, message, conversationId);

    return NextResponse.json({
      ...result,
      provider: status.name,
      isMockProvider: status.name === 'mock',
    });
  } catch (error) {
    console.error('AI chat error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (message.includes('timeout') || message.includes('timed out')) {
        return NextResponse.json(
          {
            error: 'The AI service request timed out. Please try again.',
            code: 'TIMEOUT',
            retryable: true,
          },
          { status: 504 }
        );
      }
      if (message.includes('rate limit') || message.includes('429')) {
        return NextResponse.json(
          {
            error: 'AI service rate limit exceeded. Please wait a moment and try again.',
            code: 'RATE_LIMIT',
            retryable: true,
          },
          { status: 429 }
        );
      }
      if (message.includes('unauthorized') || message.includes('401') || message.includes('invalid api key')) {
        return NextResponse.json(
          {
            error: 'AI service authentication failed. Please check your API key configuration.',
            code: 'AUTH_FAILED',
            retryable: false,
          },
          { status: 401 }
        );
      }
      if (message.includes('network') || message.includes('fetch failed') || message.includes('econnrefused')) {
        return NextResponse.json(
          {
            error: 'Unable to connect to the AI service right now. Please check your connection and try again.',
            code: 'NETWORK_ERROR',
            retryable: true,
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to process chat message', code: 'UNKNOWN_ERROR', retryable: true },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (conversationId) {
      const history = await aiChatService.getConversationHistory(conversationId);
      return NextResponse.json({ messages: history });
    } else {
      const conversations = await aiChatService.getUserConversations(user.id);
      return NextResponse.json({ conversations });
    }
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json(
      { error: 'Failed to get conversations', code: 'UNKNOWN_ERROR', retryable: true },
      { status: 500 }
    );
  }
}