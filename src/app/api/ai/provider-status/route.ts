/**
 * AI Provider Status API Route
 * Returns verified connection status for all configured providers
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerAnonClient } from '@/lib/supabase/server';
import { aiProviderFactory } from '@/lib/ai';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerAnonClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const checkConnections = searchParams.get('check') === 'true';

    const statuses = aiProviderFactory.getAllProviderStatuses();

    if (checkConnections) {
      // Verify connections for all configured providers
      const providers = aiProviderFactory.getAvailableProviders();
      await Promise.all(
        providers.map(p => aiProviderFactory.verifyConnection(p))
      );
    }

    const updatedStatuses = aiProviderFactory.getAllProviderStatuses();
    const defaultProvider = aiProviderFactory.getDefaultProvider();

    return NextResponse.json({
      providers: updatedStatuses,
      defaultProvider,
      demoMode: defaultProvider === 'mock',
    });
  } catch (error) {
    console.error('Provider status error:', error);
    return NextResponse.json(
      { error: 'Failed to get provider status' },
      { status: 500 }
    );
  }
}