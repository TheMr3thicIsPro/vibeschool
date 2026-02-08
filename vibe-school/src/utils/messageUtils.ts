/**
 * Utility functions for message handling
 */

/**
 * Deduplicates messages by ID and client_generated_id, then sorts by created_at
 */
export function dedupeAndSortMessages(messages: any[]): any[] {
  const seenIds = new Set();
  const seenClientIds = new Set();
  const uniqueMessages = [];

  for (const message of messages) {
    const hasId = message.id && !seenIds.has(message.id);
    const hasClientId = message.client_generated_id && !seenClientIds.has(message.client_generated_id);
    
    if ((message.id && hasId) || (message.client_generated_id && hasClientId)) {
      if (message.id) seenIds.add(message.id);
      if (message.client_generated_id) seenClientIds.add(message.client_generated_id);
      uniqueMessages.push(message);
    }
  }

  // Sort by created_at timestamp
  return uniqueMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

/**
 * Replaces an optimistic message with the server message
 */
export function replaceOptimisticMessage(messages: any[], clientGeneratedId: string, serverRow: any): any[] {
  return messages.map(message => {
    if (message.client_generated_id === clientGeneratedId) {
      return { ...serverRow, pending: false };
    }
    return message;
  });
}