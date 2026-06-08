import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Anthropic } from '@anthropic-ai/sdk';
import { OpenAI } from 'openai';
import logger from '../utils/logger';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: any;
}

const claudeClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
  } catch (error) {
    logger.error('Get conversations error:', error);
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
  } catch (error) {
    logger.error('Create conversation error:', error);
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
  } catch (error) {
    logger.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
};

// Send message
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
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
      orderBy: { importance: 'desc' }
    });

    // Build system prompt with memories
    const memoryContext = memories.length > 0 
      ? `\n\nAbout the user (importance ranked):\n${memories.map((m, i) => `${i + 1}. [${m.type}] ${m.content} (Importance: ${m.importance}/10)`).join('\n')}`
      : '';

    const systemPrompt = `You are Lumen, a personal AI tutor. You remember everything about how the user learns and adapt your explanations accordingly.

Your teaching approach:
- Provide structured explanations with tables and organized breakdowns
- Use step-by-step guidance through complex ideas
- Include analogies and examples that make concepts click
- Go deeper when something sparks curiosity
- Use Socratic questioning to help discovery

Remember: You learn about the user over time and personalize everything to their style.${memoryContext}`;

    // Build conversation history for context
    const messageHistory = conversation.messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }));

    // Determine which model to use
    const preferredModel = conversation.user.settings?.preferredModel || 'claude';
    let aiMessage = '';
    let tokensUsed = 0;

    try {
      if (preferredModel === 'gpt' || preferredModel === 'openai') {
        // Use OpenAI
        const response = await openaiClient.chat.completions.create({
          model: 'gpt-4-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messageHistory,
            { role: 'user', content }
          ],
          max_tokens: 2000,
          temperature: 0.7
        });

        aiMessage = response.choices[0].message.content || '';
        tokensUsed = response.usage?.total_tokens || 0;
      } else {
        // Use Claude (default)
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
      }
    } catch (error) {
      logger.error('AI API error:', error);
      aiMessage = 'I encountered an issue processing your request. Please try again.';
    }

    // Save AI response
    const assistantMessage = await prisma.message.create({
      data: {
        conversationId: id,
        role: 'assistant',
        content: aiMessage,
        aiModel: preferredModel,
        tokensUsed
      }
    });

    res.json({
      userMessage,
      assistantMessage
    });
  } catch (error) {
    logger.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
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
  } catch (error) {
    logger.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
};
