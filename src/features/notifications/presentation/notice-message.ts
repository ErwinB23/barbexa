// Presentation only: stored notices retain their original message.
export const noticeMessage = (message: string) =>
  message.replace(/\s*·\s*hora de Lima\.?\s*$/i, '');
