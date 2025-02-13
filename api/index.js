const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require('nodemailer');
const mongoose = require("mongoose");
const passport = require("passport");
const cors = require("cors");

const app = express();
const port = 8000;


app.use(cors());
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());

const jwt = require("jsonwebtoken");

mongoose.connect(
    "mongodb+srv://aadigunale2002:admin@cluster0.rin0d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log("Connected to Mongo DB");
    }).catch((err) => {
        console.log("Error connected to Mongo DB", err);
    });


app.listen(port, () => {
    console.log("Server running on port 8000");
});

const User = require("./models/user");

// NodeMailer Configuration

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: "adityagunale16@gmail.com",
        pass: "oiax ywbx wwgt jnby",
    },
});



// endpoint for registration of the user
app.post("/register", (req, res) => {
    const { name, email, tele, password } = req.body;

    //create a new User object
    const newUser = new User({ name, email, tele, password });

    //save the user to the database
    newUser.save().then(() => {
        res.status(200).json({ massege: "User registered successfully" })
    }).catch((err) => {
        console.log("Error registering user", err);
        res.status(500).json({ massege: "Error registering user!" })
    });
});


//function to create a token for the user
const createToken = (userId) => {
    // Set the token payload
    const payload = {
        userId: userId,
    };

    // Generate the token with a secret key and expiration time
    const token = jwt.sign(payload, "Q$r2K6W8n!jCW%Zk");

    return token;
};


//endpoint for loging in of user
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    //check email and password are provided
    if (!email || !password) {
        return res.status(404).json({ massege: "Email and Password are required" })
    }

    //check for user in the database
    User.findOne({ email }).then((user) => {
        if (!user) {
            //user not found
            return res.status(404).json({ massege: "USer not Found" })
        }

        //Compare password into database password
        if (user.password != password) {
            return res.status(404).json({ message: "Invalid Password!" })
        }
        const token = createToken(user._id);
        res.status(200).json({ token })
    }).catch((error) => {
        console.log("error in finding the user", error);
        res.status(500).json({ massege: "Internal server Error!" });
    })
})



// Endpoint to request a password reset
app.post('/request-reset-password', async (req, res) => {
    const { email } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Save reset code to user document
        user.resetCode = resetCode;
        user.resetCodeExpiry = new Date(Date.now() + 30 * 60000); // 30 minutes expiry
        await user.save();

        // Send email
        const mailOptions = {
            from: 'adityagunale16@gmail.com',
            to: email,
            subject: 'Password Reset Code',
            text: `Your password reset code is: ${resetCode}\nThis code will expire in 30 minutes.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Email error:', error);
                return res.status(500).json({ message: 'Error sending email' });
            }
            res.status(200).json({ message: 'Reset code sent to email' });
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Endpoint to reset the password

function updatePasswordInDatabase(email, newPassword) {
    // This is a placeholder for actual database logic
    if (User[email]) {
        User[email].password = newPassword;
        return true;
    }
    return false;
}


app.post('/reset-password', async (req, res) => {
    const { email, resetCode, newPassword } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if reset code exists and matches
        if (!user.resetCode || user.resetCode !== resetCode) {
            return res.status(400).json({ message: 'Invalid reset code' });
        }

        // Check if reset code has expired
        if (user.resetCodeExpiry && user.resetCodeExpiry < new Date()) {
            return res.status(400).json({ message: 'Reset code has expired' });
        }

        // Update password
        user.password = newPassword; // Consider hashing the password here
        user.resetCode = null;
        user.resetCodeExpiry = null;

        await user.save();

        res.status(200).json({ message: 'Password reset successful' });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Error updating password' });
    }
});













