import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export class OpenAIService {
  static async chatCompletion(messages: any[], maxTokens: number = 1000) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: messages,
        max_tokens: maxTokens,
        stream: false,
      });

      return completion;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Erreur lors de la génération de la réponse IA');
    }
  }

  static async shouldRedirectToExternalTool(message: string): Promise<boolean> {
    const redirectKeywords = [
      'je ne sais pas', 'je ne peux pas', 'désolé', 'sorry',
      'je ne suis pas capable', 'je ne suis pas sûr', 'incapable'
    ];

    const lowerMessage = message.toLowerCase();
    return redirectKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  static async getExternalToolUrl(): Promise<string> {
    return 'https://chat.openai.com';
  }

  static async categorizeQuery(query: string): Promise<string> {
    const categories = [
      'technical_support',
      'weather_confirmation',
      'quote_analysis',
      'email_generation',
      'other'
    ];

    // Pour l'instant, retourne une catégorie par défaut
    // Plus tard, on utilisera l'IA pour catégoriser automatiquement
    return 'technical_support';
  }
}
