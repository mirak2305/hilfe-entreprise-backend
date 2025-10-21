import { Request, Response } from 'express';
import { OpenAIService } from '../services/openai.service';
import { SupabaseService } from '../services/supabase.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class ChatController {
  static async sendMessage(req: AuthRequest, res: Response) {
    try {
      const { conversationId, message, category } = req.body;
      const userId = req.user.id;
      const companyId = req.user.company_id;

      if (!message) {
        return res.status(400).json({ error: 'Message requis' });
      }

      // Créer une nouvelle conversation si aucune n'est spécifiée
      let currentConversationId = conversationId;
      if (!currentConversationId) {
        const conversation = await SupabaseService.createConversation({
          user_id: userId,
          company_id: companyId,
          title: message.substring(0, 50) + '...'
        });
        currentConversationId = conversation.id;
      }

      // Sauvegarder le message utilisateur
      const userMessage = await SupabaseService.createMessage({
        conversation_id: currentConversationId,
        user_id: userId,
        content: message,
        role: 'user',
        category: category || 'technical_support',
        tokens_used: 0,
        uses_documents: false
      });

      // Préparer le contexte pour l'IA
      const messages = [
        {
          role: 'system',
          content: `Vous êtes un assistant IA spécialisé dans le domaine des assurances.
          Vous aidez les utilisateurs de la compagnie ${companyId} avec bienveillance et professionnalisme.
          Répondez toujours en français sauf demande contraire.`
        },
        {
          role: 'user',
          content: message
        }
      ];

      // Obtenir la réponse de l'IA
      const aiResponse = await OpenAIService.chatCompletion(messages);
      
      if (!aiResponse.choices || aiResponse.choices.length === 0) {
        throw new Error('Aucune réponse de l\\'IA');
      }

      const aiMessageContent = aiResponse.choices[0].message?.content || 'Désolé, je n\\'ai pas pu générer de réponse.';

      // Vérifier si une redirection est nécessaire
      let redirectUrl = null;
      if (await OpenAIService.shouldRedirectToExternalTool(aiMessageContent)) {
        redirectUrl = await OpenAIService.getExternalToolUrl();
      }

      // Sauvegarder la réponse de l'IA
      const assistantMessage = await SupabaseService.createMessage({
        conversation_id: currentConversationId,
        user_id: userId,
        content: aiMessageContent,
        role: 'assistant',
        category: category || 'technical_support',
        tokens_used: aiResponse.usage?.total_tokens || 0,
        uses_documents: false,
        redirect_url: redirectUrl
      });

      res.json({
        conversationId: currentConversationId,
        userMessage: {
          id: userMessage.id,
          content: userMessage.content,
          role: userMessage.role,
          createdAt: userMessage.created_at
        },
        aiMessage: {
          id: assistantMessage.id,
          content: assistantMessage.content,
          role: assistantMessage.role,
          tokensUsed: assistantMessage.tokens_used,
          redirectUrl: assistantMessage.redirect_url,
          createdAt: assistantMessage.created_at
        }
      });

    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: 'Erreur lors du traitement du message' });
    }
  }

  static async getConversations(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const conversations = await SupabaseService.getUserConversations(userId);
      
      res.json(conversations);
    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des conversations' });
    }
  }

  static async getConversationMessages(req: AuthRequest, res: Response) {
    try {
      const { conversationId } = req.params;
      const messages = await SupabaseService.getConversationMessages(conversationId);
      
      res.json(messages);
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
    }
  }
}
