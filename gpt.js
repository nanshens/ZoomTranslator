const axios = require('axios');


async function getGPT(content) {
        var config = {
            method: 'post',
            url: 'https://api.chatanywhere.com.cn/v1/chat/completions',
            headers: {
                'Authorization': 'Bearer sk-go5sWFjy1fuBEzvmn1xNCuybCZOkDIWxgkObwKYKHS5Hcrvn',
                'User-Agent': 'zoomchat',
                'Content-Type': 'application/json'
            },
            data : JSON.stringify({
                "model": "gpt-3.5-turbo",
                "messages": [
                    {
                        "role": "user",
                        "content": content
                    }
                ]
            })
        };
        return axios(config)
}

module.exports = {
    getGPT
};