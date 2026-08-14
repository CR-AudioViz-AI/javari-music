import { supabase } from './supabase';

export type WebhookEvent =
  | 'track.created'
  | 'track.updated'
  | 'track.ready'
  | 'purchase.completed';

export interface WebhookSubscription {
  id: string;
  url: string;
  event_types: WebhookEvent[];
  secret: string;
  active: boolean;
  created_at: string;
}

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: any;
}

export async function subscribeWebhook(
  url: string,
  eventTypes: WebhookEvent[],
  secret: string
): Promise<WebhookSubscription> {
  const { data, error } = await supabase
    .from('webhook_subscriptions')
    .insert({
      url,
      event_types: eventTypes,
      secret,
      active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function unsubscribeWebhook(id: string): Promise<void> {
  const { error } = await supabase
    .from('webhook_subscriptions')
    .update({ active: false })
    .eq('id', id);

  if (error) throw error;
}

export async function listWebhooks(): Promise<WebhookSubscription[]> {
  const { data, error } = await supabase
    .from('webhook_subscriptions')
    .select('*')
    .eq('active', true);

  if (error) throw error;
  return data || [];
}

export async function emitWebhook(event: WebhookEvent, data: any): Promise<void> {
  const subscriptions = await listWebhooks();

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  const relevantSubs = subscriptions.filter((sub) => sub.event_types.includes(event));

  await Promise.all(
    relevantSubs.map(async (sub) => {
      try {
        const signature = await generateSignature(payload, sub.secret);

        await fetch(sub.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-javari-Signature': `sha256=${signature}`,
            'X-javari-Event': event,
          },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error(`Failed to send webhook to ${sub.url}:`, err);
      }
    })
  );
}

async function generateSignature(payload: WebhookPayload, secret: string): Promise<string> {
  const data = JSON.stringify(payload);
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, messageData);
    return Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  return 'signature-generation-unavailable';
}

export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const expectedSignature = await generateSignature(JSON.parse(payload), secret);
  return signature === `sha256=${expectedSignature}`;
}
