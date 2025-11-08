import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const verifyAuth = async (req, res, next) => {
    try {
        const token = req.cookies.userToken;
        const refreshToken = req.cookies.refreshToken;

        // Try access token first
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findOne({ _id: decoded.id }).select('-password');

                if (!user) {
                    return res.status(401).json({ message: "User not found" });
                }

                req.user = user;
                return next();
            } catch (err) {
                // If token expired, fall through to refreshToken flow
                if (err.name !== 'TokenExpiredError') {
                    console.error("Access token verify error:", err);
                    return res.status(401).json({ message: "Invalid access token" });
                }
            }
        }

        // If access token missing/expired, try refresh token
        if (refreshToken) {
            try {
                const decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
                const user = await User.findOne({ _id: decodedRefresh.id }).select('-password');

                if (!user) {
                    return res.status(401).json({ message: "User not found" });
                }

                const accessToken = jwt.sign(
                    { id: user._id, email: user.email },
                    process.env.JWT_SECRET,
                    { expiresIn: '2h' }
                );

                res.cookie("userToken", accessToken, {
                    maxAge: 2 * 60 * 60 * 1000, // 2 hours
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
                    path: '/',
                });

                req.user = user;
                return next();
            } catch (err) {
                console.error("Refresh token verify error:", err);
                return res.status(401).json({ message: "Invalid or expired refresh token" });
            }
        }

        return res.status(401).json({ message: "Authentication required. Please login." });
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(401).json({ message: "Authentication failed" });
    }
};


// import jwt from 'jsonwebtoken';
// import User from '../models/user.model.js';

// export const verifyAuth = async (req, res, next) => {
//     try {
//         const token = req.cookies.userToken;
//         const refreshToken = req.cookies.refreshToken;

//         if (token) {
//             const decoded = jwt.verify(token, process.env.JWT_SECRET);

//             const user = await User.findOne({ _id: decoded.id }).select('-password');

//             if (!user) {
//                 return res.status(401).json({ message: "User not found" });
//             }

//             req.user = user;
//             return next();
//         } 
        
//         else if (refreshToken) {
//             const decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

//             const user = await User.findOne({ _id: decodedRefresh.id }).select('-password');

//             if (!user) {
//                 return res.status(401).json({ message: "User not found" });
//             }

//             const accessToken = jwt.sign(
//                 { id: user._id, email: user.email },
//                 process.env.JWT_SECRET,
//                 { expiresIn: '2h' }
//             );

//             res.cookie("userToken", accessToken, {
//                 maxAge: 2 * 60 * 60 * 1000, // 2 hours
//                 httpOnly: true,
//                 secure: process.env.NODE_ENV === 'production',
//                 sameSite: 'Strict',
//             });

//             req.user = user;
//             return next();
//         } 
        
//         else {
//             return res.status(401).json({ message: "Authentication required. Please login." });
//         }

//     } catch (error) {
//         console.error("Auth middleware error:", error);
//         return res.status(401).json({ message: "Invalid or expired token" });
//     }
// };





