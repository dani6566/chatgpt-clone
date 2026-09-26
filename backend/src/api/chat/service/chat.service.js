import db from '../../../../db/db.config.js';
import { GoogleGenAI } from "@google/genai";

const GEMINI_MODEL = process.env.GEMINI_MODEL;

const geminiClient = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});


export const getRecentConversationsRows = async (limit=5) => {
    const normalizedLimit = Number.parseInt(limit, 10);
    const safeLimit = Number.isNaN(normalizedLimit) ? 5 : normalizedLimit;
    const [rows] = await db.execute(
        `SELECT id, content ,role ,created_at FROM conversation
        ORDER BY id DESC 
        LIMIT ${safeLimit}`,
    );
    return rows.reverse();
};

const getMessageById = async (id) => {
    const [rows] = await db.execute(
        'SELECT id, content, role, token_count, created_at FROM conversation WHERE id = ?',
        [id],
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
    //     config: {
    //         systemInstruction: `
    //         You are a helpful assistant. 
    //         Provide concise and accurate answers to user questions.
    // `,
    //     },
        history: formatHistory,
    })

    const result = await chat.sendMessage({message: question});
    return {
        text: result.text,
        totalTokens: result.usageMetadata?.totalTokenCount ?? 0,
    }
};

export async function createConversationService(question){
    if (typeof question !== 'string' || !question.trim()) {
        const error = new Error('Question cannot be empty');
        error.status = 400;
        throw error;
    }

    const normalizedQuestion = question.trim();

    //get the last 5 history conversations from the database
    const historyRows = await getRecentConversationsRows(5);
    // console.log("historyRows:", historyRows);

    const [result] = await db.execute(
        'INSERT INTO conversation (content,role) VALUES (?, "user")',
        [normalizedQuestion]
    );

    const { text, totalTokens } = await generateAssistanceAnswer({ question: normalizedQuestion, historyRows });

    const [createAssistantMessageResult] = await db.execute(
        'INSERT INTO conversation (role,content,token_count) VALUES (?, ?, ?)',
        ['assistant', text, totalTokens]
    );
    const userConversationId = await getMessageById(result.insertId);
    const assistantConversation = await getMessageById(createAssistantMessageResult.insertId);

    return {
    userConversation: userConversationId,
    assistantConversation: assistantConversation
};
};