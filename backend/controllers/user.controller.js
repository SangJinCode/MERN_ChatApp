import User from "../models/user.model.js"

export const getUsersForSidebar = async (req, res) => {
    try {

        const loggedInUserId = req.user._id
        //$ne not equal !=, 로그인된 유저를 제외한 모든 유저 data(password는 제외)
        const filteredUsers = await User.find({ _id: {$ne: loggedInUserId}}).select("-password");

        res.status(200).json(filteredUsers);

    } catch (error) {
        console.error("Error in getUsersForSidebar controller:", error.message);
        res.status(500).json({error: "Internal server error" });
    }
};