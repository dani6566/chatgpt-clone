import {
    createConversationService,
    getRecentConversationsRows,
} from '../service/chat.service.js'

export async function createConversationsController(req,res,next){
    try {
        const { question } = req.body ?? {};
        const result = await createConversationService(question, req.user.id);
        return res.status(200).json({
            success: true,
            message: 'Conversation created successfully',
            data: result
        });
    }catch (error) {
        next(error);
    }
}

export async function getConversationsController(req,res,next){
    try {
        const result = await getRecentConversationsRows(5, req.user.id);
        return res.status(200).json({
            success: true,
            message: 'Conversations fetched successfully',
            data: result
        });
    } catch (error) {
        return next(error);
    }
}
