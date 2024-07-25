import mongoose from 'mongoose';

//message schema에는 send와 reciver의 ID와 메세지 내용이 저장
const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        message: {
            type: String,
            required: true
        }
    },
    // createdAt, updatedAt
    {timestamps: true}
);

const Message = mongoose.model("Message", messageSchema);

export default Message;