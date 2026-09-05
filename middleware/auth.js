

module.exports = function auth(req, res, next) {

    try {

        const authHeader =
            req.headers.authorization;


        if (!authHeader) {

            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });

        }


        const parts =
            authHeader.split(" ");


        if (
            parts.length !== 2 ||
            parts[0] !== "Bearer"
        ) {

            return res.status(401).json({
                success: false,
                message: "Invalid authorization format."
            });

        }


        const token = parts[1];


        if (!process.env.JWT_SECRET) {

            console.error(
                "JWT_SECRET is not configured."
            );

            return res.status(500).json({
                success: false,
                message: "Server configuration error."
            });

        }


        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        req.user = decoded;


        next();

    } catch (error) {

        console.error(
            "Authentication error:",
            error.message
        );


        return res.status(401).json({
            success: false,
            message: "Invalid or expired login session."
        });

    }

};
