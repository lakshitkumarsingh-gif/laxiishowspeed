import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import logger from '../utils/logger';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: any;
}

// Initialize AI clients
let claudeClient: Anthropic | null = null;
let openaiClient: OpenAI | null = null;

try {
  if (process.env.ANTHROPIC_API_KEY) {
    claudeClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    logger.info('✅ Anthropic Claude client initialized');
  } else {
    logger.warn('⚠️  ANTHROPIC_API_KEY not set');
  }

  if (process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    logger.info('✅ OpenAI client initialized');
  } else {
    logger.warn('⚠️  OPENAI_API_KEY not set');
  }
} catch (error: any) {
  logger.error('Error initializing AI clients:', error.message);
}

// Get conversations
export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    res.json(conversations);
  } catch (error: any) {
    logger.error('Get conversations error:', error.message);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
};

// Create conversation
export const createConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { title, subject } = req.body;

    const conversation = await prisma.conversation.create({
      data: {
        userId: req.user.userId,
        title: title || 'New Conversation',
        subject: subject || null
      }
    });

    res.status(201).json(conversation);
  } catch (error: any) {
    logger.error('Create conversation error:', error.message);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
};

// Get conversation with messages
export const getConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!conversation || conversation.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error: any) {
    logger.error('Get conversation error:', error.message);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
};

// Send message and get AI response
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Verify conversation ownership
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        user: { include: { settings: true } }
      }
    });

    if (!conversation || conversation.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        conversationId: id,
        role: 'user',
        content
      }
    });

    // Get user memories for context
    const memories = await prisma.memory.findMany({
      where: { userId: req.user.userId },
      orderBy: { importance: 'desc' },
      take: 10 // Limit to top 10 memories
    });

    // Build system prompt with memories
    const memoryContext = memories.length > 0 
      ? `\n\n📚 **What I know about the student (ranked by importance):**\n${memories.map((m, i) => `${i + 1}. [${m.type}] ${m.content} (Importance: ${m.importance}/10)`).join('\n')}`
      : '';

    const systemPrompt = `You are **Lumen**, a world-class AI tutor with an exceptional ability to explain concepts. Your core mission:

🎯 **Your Teaching Philosophy:**
- Adapt every explanation to how THIS SPECIFIC STUDENT learns best
- Use structured explanations with tables, breakdowns, and organization
- Provide step-by-step guidance that builds understanding progressively  
- Create analogies and examples that make concepts "click"
- Ask Socratic questions to guide discovery when appropriate
- Go deeper into topics when curiosity is sparked
- Remember what works for this student and use it again

💡 **Your Approach:**
- Structured explanations with tables and organized breakdowns
- Step-by-step guidance through complex ideas
- Analogies and examples that make concepts click
- Going deeper when something sparks curiosity
- Using Socratic questioning to help discovery
- Being encouraging and celebrating progress

📌 **IMPORTANT**: You learn about the student over time and personalize everything to their style.${memoryContext}

⚡ **Respond with clarity and engagement. Make learning fun and effective.**`;

    // Build conversation history
    const messageHistory = conversation.messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }));

    // Determine which model to use
    const preferredModel = conversation.user.settings?.preferredModel || 'claude';
    let aiMessage = '';
    let tokensUsed = 0;
    let modelUsed = 'claude';

    try {
      if (preferredModel === 'gpt' || preferredModel === 'openai') {
        // Use OpenAI GPT
        if (!openaiClient) {
          throw new Error('OpenAI API key not configured');
        }

        logger.info(`Calling OpenAI GPT for user ${req.user.userId}`);

        const response = await openaiClient.chat.completions.create({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messageHistory,
            { role: 'user', content }
          ],
          max_tokens: 2000,
          temperature: 0.7,
          top_p: 0.95
        });

        aiMessage = response.choices[0].message.content || '';
        tokensUsed = response.usage?.total_tokens || 0;
        modelUsed = 'gpt-4';

        logger.info(`✅ OpenAI response generated (${tokensUsed} tokens)`);
      } else {
        // Use Claude (default)
        if (!claudeClient) {
          throw new Error('Anthropic API key not configured');
        }

        logger.info(`Calling Claude Sonnet for user ${req.user.userId}`);

        const response = await claudeClient.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2000,
          system: systemPrompt,
          messages: [
            ...messageHistory,
            { role: 'user', content }
          ]
        });

        aiMessage = response.content[0].type === 'text' ? response.content[0].text : '';
        tokensUsed = response.usage?.output_tokens || 0;
        modelUsed = 'claude-3.5-sonnet';

        logger.info(`✅ Claude response generated (${tokensUsed} tokens)`);
      }
    } catch (aiError: any) {
      logger.error('AI API error:', aiError.message);
      aiMessage = `I encountered an issue: ${aiError.message}. Please check your API keys and try again.`;
    }

    // Save AI response
    const assistantMessage = await prisma.message.create({
      data: {
        conversationId: id,
        role: 'assistant',
        content: aiMessage,
        aiModel: modelUsed,
        tokensUsed
      }
    });

    res.json({
      userMessage,
      assistantMessage,
      model: modelUsed
    });
  } catch (error: any) {
    logger.error('Send message error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to send message' });
  }
};

// Delete conversation
export const deleteConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const conversation = await prisma.conversation.findUnique({ where: { id } });
    if (!conversation || conversation.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.conversation.delete({ where: { id } });

    res.json({ success: true, message: 'Conversation deleted' });
  } catch (error: any) {
    logger.error('Delete conversation error:', error.message);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
};
