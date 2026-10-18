import db from '../../../../db/db.config.js';
import { GoogleGenAI } from "@google/genai";

const GEMINI_MODEL = process.env.GEMINI_MODEL;

const geminiClient = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

export const getRecentConversationsRows = async (limit = 5, userId) => {
    const normalizedLimit = Number.parseInt(limit, 10);
    const safeLimit = Number.isNaN(normalizedLimit) ? 5 : Math.max(1, Math.min(normalizedLimit, 100));
    const [rows] = await db.execute(
        `SELECT id, content, role, created_at FROM conversation
        WHERE owner_user_id = ?
        ORDER BY id DESC
        LIMIT ?`,
        [userId, safeLimit],
    );
    return rows.reverse();
};

const getMessageById = async (id, userId) => {
    const [rows] = await db.execute(
        'SELECT id, content, role, token_count, created_at FROM conversation WHERE id = ? AND owner_user_id = ?',
        [id, userId],
    );
    return rows[0];
};

const generateAssistanceAnswer = async ({question, historyRows}) => {

    const formatHistory = historyRows.map(row => ({
        role: row.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: row.content }]
    }));

    const chat = geminiClient.chats.create({
        model: GEMINI_MODEL,
        // config: {
    
        // },
        history: formatHistory,
    })

    const result = await chat.sendMessage({message: question});
    return {
        text: result.text,
        totalTokens: result.usageMetadata?.totalTokenCount ?? 0,
    }
};

export async function createConversationService(question, userId){
    if (typeof question !== 'string' || !question.trim()) {
        const error = new Error('Question cannot be empty');
        error.status = 400;
        throw error;
    }

    const normalizedQuestion = question.trim();

    const historyRows = await getRecentConversationsRows(5, userId);

    const [result] = await db.execute(
        'INSERT INTO conversation (owner_user_id, content, role) VALUES (?, ?, "user")',
        [userId, normalizedQuestion]
    );

    const { text, totalTokens } = await generateAssistanceAnswer({ question: normalizedQuestion, historyRows });

    const [createAssistantMessageResult] = await db.execute(
        'INSERT INTO conversation (owner_user_id, role, content, token_count) VALUES (?, ?, ?, ?)',
        [userId, 'assistant', text, totalTokens]
    );
    const userConversationId = await getMessageById(result.insertId, userId);
    const assistantConversation = await getMessageById(createAssistantMessageResult.insertId, userId);

    return {
    userConversation: userConversationId,
    assistantConversation: assistantConversation
};
};