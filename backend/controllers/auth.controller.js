import User from "../models/user.model.js";
import bcrypt from "bcryptjs"
import generateTokenAndSetCookie from "../utils/generateToken.js";

export const signup = async (req, res) => {
    console.log("req:" , req)
    try {
        const {fullName, username, password, confirmPassword, gender} = req.body;
        console.log("req.body:", req.body)

        if(password !== confirmPassword) {
            return res.status(400).json({error: "Passwords don't match"})
        }

        //DB에 이미 존재하는 user인지 확인
        const user = await User.findOne({username});
        if(user) {
            return res.status(400).json({error: "Username already exists"}) 
        }

        //HASH PASSWROD HERE genSalt()로 salt 생성, 인수는 해싱의 정도 
        //보통 10 이보다 크면 더 secure하지만 시간이 더 걸림, 작으면 반대
        //생성된 salt는 bcrypt.hash()로 전달하여 해싱
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //https://avatar-placeholder.iran.liara.run/
        const boyProfilePic= `https://avatar.iran.liara.run/public/boy?username=${username}`
        const girlProfilePic= `https://avatar.iran.liara.run/public/girl?username=${username}`

        //검증 후 DB 저장을 위한 newUser 생성
        const newUser = new User({
            fullName,
            username,
            password : hashedPassword,
            gender,
            profilePic: gender === "male" ? boyProfilePic : girlProfilePic
        })

        //DB에 저장
        if(newUser) {
            // Generate JWT token here
            generateTokenAndSetCookie(newUser._id, res);

            await newUser.save();

            //저장은 res에 상태 및 DB 저장 정보를 담아 전송
            res.status(201).json({
                _id:newUser._id, // "_" 사용시 id는 자동으로 들어감
                fullName: newUser.fullName,
                username: newUser.username,
                profilePic:newUser.profilePic
            })
        } else {
            res.status(400).json({error: "Invalid user data"});
        }
        
    } catch(error) {
        console.log("Error in signup controller", error.message)
        res.status(500).json({error: "Internal Server Error"})
    }
};

export const login = async (req, res) => {
    try {
        const {username, password } = req.body;
        
        //get the data from DB
        const user = await User.findOne({username});
        console.log("user",user)

        // 사용자 password와 DB의 password를 비교
        // "?."은 선택적 연결로 ?. 앞에 있는 속성이 null or undefined 인지 검증 후 true이면 error 대신 undefined를 반환
        // "|| """, 강좌에는 있는 코드지만 없어도 작동됨(모듈 버전 문제인듯)
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");
        console.log("isPasswordCorrect", isPasswordCorrect)

        if(!user || !isPasswordCorrect) {
            return res.status(400).json({error: "Invalid username or password"});
        }

        // Generate JWT token here
        generateTokenAndSetCookie(user._id, res);

        //final res with user data
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            profilePic: user.profilePic,
        });

    } catch (error) {
        console.log("Error in login controller", error.message)
        res.status(500).json({error: "Internal Server Error"})
    }
};

export const logout = async(req, res) => {
    try {
        //토큰을 만료 시켜 logout
        res.cookie("jwt", "", {maxAge:0})
        res.status(200).json({message: "Logged out successfully"})

    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
};

