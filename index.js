//Main File.
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const app = express()
const axios = require('axios');
const port = process.env.PORT || 4000
const { getChatbotToken } = require('./chatbotToken');
const { zoomOAuth } = require("./zoomOAuth");
const { generateChatBody, sendChat } = require("./generateChatBody");
const e = require('express');
const { getTranslationResult } = require("./translation");

/*  Middleware */
const headers = {
    frameguard: {
        action: 'sameorigin',
    },
    hsts: {
        maxAge: 31536000,
    },
    referrerPolicy: 'same-origin',
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            'default-src': 'self',
            styleSrc: ["'self'"],
            imgSrc: ["'self'", `*`],
            'connect-src': 'self',
            'base-uri': 'self',
            'form-action': 'self',
        },
    },
};

var appContextCache = {}
var accountId = "";
exports.accountId = accountId;

app.use(helmet(headers));

app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('Welcome to this demo bot')
})

app.get('/authorize', zoomOAuth);

// app.post('/sign', (req, res) => {
//     const { message } = req.body;
//     const timestamp = Date.now().toString();
//     const dataToSign = `v0:${timestamp}:${message}`;
//     const signature = crypto.createHmac('sha256', process.env.zoom_client_secret)
//         .update(dataToSign)
//         .digest('hex');
//
//     res.json({ signature, timestamp });
// });
//
//
// app.post('/chat', async (req, res) => {
//     const chatbotToken = await getChatbotToken();
//
//     // Extract id and share_url from the request body
//     const { id, share_url } = req.body;
//
//     const reqBody = {
//         robot_jid: process.env.zoom_bot_jid,
//         to_jid: `${appContextCache.uid}@xmpp.zoom.us/${appContextCache.sid}`,
//         account_id: accountId,
//         user_jid: `${appContextCache.uid}@xmpp.zoom.us`,
//         is_markdown_support: true,
//         content: {
//             settings: {
//                 default_sidebar_color: "#357B2A"
//             },
//             body: [
//                 {
//                     type: 'message',
//                     text: "Meeting ID: " + id
//                 },
//                 {
//                     type: 'message',
//                     text: 'Recording URL: '+ share_url
//                 }
//             ]
//         }
//     };
//
//     try {
//         const response = await axios({
//             method: 'POST',
//             url: 'https://api.zoom.us/v2/im/chat/messages',
//             headers: {
//                 'Content-Type': 'application/json',
//                 Authorization: `Bearer ${chatbotToken}`
//             },
//             data: reqBody
//         });
//         console.log(reqBody)
//         console.log("response for zoom api call", response.data);
//         res.status(200).send(response.data);
//     } catch (error) {
//         console.log('Error sending chat.', error);
//         res.status(500).send(error.message);
//     }
// });

app.post('/:command', async (req, res) => {
    const command = req.body.payload.cmd; // Extract the command from the route parameter
    if(!command) {
        res.status(200).send();
        return;
    }

    const [from, to] = command.split(',').map(date => date.trim()); // Extract from and to dates from the command

    if (req.headers.authorization === process.env.zoom_verification_token) {
        try {
            const chatbotToken = await getChatbotToken();
            var gptText = ""
            if (chatbotToken === undefined || chatbotToken.length === 0) {
                gptText = "没有token"
            } else {
                gptText = await getTranslationResult(command).then(function (response) {
                    console.log(JSON.stringify(response.data));
                    return response.data;
                }).catch(function (error) {
                    console.log(error);
                    return "请求错误"
                });
            }

            const chatBody = generateChatBody(gptText, req.body.payload);
            await sendChat(chatBody, chatbotToken);

            res.status(200).send();
        } catch (error) {
            console.log('Error occurred:', error);
            res.status(500).send(`/${command} api -- Internal Server Error`);
        }
    } else {
        res.status(401).send(`/${command} api -- Unauthorized request to Zoom Chatbot.`);
    }
});


app.listen(port, () => console.log(`The zoom chat bot is listnening on ${port}!`))