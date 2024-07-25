import Conversation from "../models/converation.model.js";
import Message from "../models/message.model.js";

export const sendMessage = async(req, res) => {
    try {
        const {message} = req.body;
        const {id: receiverId} = req.params; //:id 값을 가져온다.req.params.id로 속성사용
        const senderId = req.user._id;

        //$all은 배열의 모든 엘리먼트를 가졌는지 비교
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId]},
        })
        if(!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            })
        }
        
        const newMessage = new Message({
            senderId,
            receiverId,
            message,
        })
        if(newMessage) {
            conversation.messages.push(newMessage._id); //push는 값이 이미 배열에 존해하여도 추가한다.addToSet은 반대
        }

        // SOCKET IO FUNCTIONALITY WILL GO HERE


        // await conversation.save() 순서1
        // await newMessage.save() 순서2
        //비동기 처리시 처리 순서를 컨트롤 할 수 있음
        await Promise.all([conversation.save(), newMessage.save()]);

        res.status(201).json(newMessage);

    } catch (error) {
        console.log("Error in sendMessage controller:", error.message);
        res.status(500).json({error: "Internal server error" });
    }
};

export const getMessages = async(req, res) => {
    try {
        const {id:userToChatId} = req.params;
        console.log(userToChatId)
        const senderId = req.user._id;
        console.log(senderId)

        //populate은JOIN과 같은 기능, Coversation에서 검색된 data + messages data  
        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId] },
        }).populate('messages'); //NOT REFERENCE BUT ACTUAL MESSAGES
        
        console.log(conversation)
        if(!conversation) return res.status(200).json([]);

        const messages = conversation.messages;

        res.status(200).json(messages)

    } catch (error) {
        console.log("Error in getMessages controller:", error.message);
        res.status(500).json({error: "Internal server error" });
    }
};
