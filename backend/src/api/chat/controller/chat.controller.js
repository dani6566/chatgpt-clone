import { createConversationService,getRecentConversationsRows } from '../service/chat.service.js'


export async function createConversationsController(req,res,next){
    try {
        const {question} = req.body;
        const result = await createConversationService(question);
        res.status(200).json({ 
            success: true, 
            message: 'Conversation created successfully',
            data: result 
        });
    }catch (error) {
        next(error);
    }
}

export async function getConversationsController(req,res){

    try {
        const result = await getRecentConversationsRows();
        res.status(200).json({
            success: true,
            message: 'Conversations fetched successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
}

