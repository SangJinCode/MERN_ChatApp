import mongoose from "mongoose";

//conversation schema에는 메세지 sender(0)와 reciever(1)의 ID가 저장된다.
const conversationSchema = new mongoose.Schema(
    {
        participants:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },

        ],
        messages: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Message",
                default: [],
            },

        ],
    },
    { timestamps: true}

);

const Conversation  = mongoose.model("Conversation", conversationSchema);

export default Conversation;