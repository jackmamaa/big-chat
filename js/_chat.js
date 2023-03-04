//Global
layer.config({
   offset: '400px'
});
//Check history
if (getCookie("id") == "") {
    uuid = uuidv4()
    document.cookie = "id=" + uuid;
    var ids = uuid;
} else {
    var ids = getCookie("id");
}
const idSession = ids;
const USER_ID = ids;
const Home_tips = get(".prompt_tips");
idSession.textContent = USER_ID;
$.ajax({
    url:getHistory(),
    success:function(){
        setTimeout(function() {
            Home_tips_show();
        },1000);
    }
})
// The example on long
var modal = document.getElementById("example_modal");
var btn = document.getElementById("example_btn");
var span = document.getElementsByClassName("close_box")[0];
btn.onclick = function() {
    modal.style.display = "block";
}
span.onclick = function() {
    modal.style.display = "none";
}
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
// Copy and edit data
var _copy = new ClipboardJS('.copy_btn');
_copy.on('success', function(e) {
    layer.msg('复制成功',{time:600});
    e.clearSelection();
});
_copy.on('error', function(e) {
    layer.msg('复制成功',{time:1000});
});

$(document).on('click','#edit_data', function(e) {
    var myClass = $(this).attr("class");
    let text = $("#"+myClass).text();
    layer.open({
        id: 1,
        type: 1,
        title: '编辑问题',
        btn: ['提交','取消'],
        content: `
        <div style='display:flex;justify-content:center;'>
            <textarea id='edit_box' oninput='auto_grow(this)'>${text}</textarea>
        </div>`,
        yes:function (index,layero) {
            layer.closeAll();
            var edit_enter = $("#edit_box").val() || top.$("#edit_box").val();
            if (!edit_enter) return;

            appendMessage(PERSON_NAME, PERSON_IMG, "right", edit_enter, formatDate(new Date()));
            msgerInput.value = "";

            sendMsg(edit_enter);
        }
    });
});

$(document).on('click','#edit_data', function(e) {
    setTimeout(function(){
        var areas = document.getElementById('edit_box');
        areas.focus();
        areas.setSelectionRange(areas.value.length,areas.value.length);
    },50);
});

// Style table switch
$(document).on('click','#switch_btn', function(e) {
    var theme = document.getElementsByTagName('link')[1];
    var theme1 = document.getElementsByTagName('link')[2];
    // Change the value of href attribute 
    // to change the css sheet.
    if (theme.getAttribute('href') == 'css/day/common.css?v1.1') {
        theme.setAttribute('href', 'css/moon/common.css?v1.1');
    } else {
        theme.setAttribute('href', 'css/day/common.css?v1.1');
    }
    if (theme1.getAttribute('href') == 'css/day/style.css?v1.1') {
        theme1.setAttribute('href', 'css/moon/style.css?v1.1');
    } else {
        theme1.setAttribute('href', 'css/day/style.css?v1.1');
    }
});
//////////////////////////////////////////////////
const msgerInput = get("#transcript");
const msgerChat = get("#article-wrapper");
const msgerSendBtn = get(".send-btn");
const restart_chat = get("#restart_chat");
const BOT_IMG = "static/big_clever.svg";
const PERSON_IMG = "static/human.svg";
const BOT_NAME = "大聪明";
const PERSON_NAME = "你";
// Function to delete chat history records for a user ID using the API
function deleteChatHistory(userId) {
    layer.confirm('这将清除历史聊天记录,你确定？', {
        btn: ['确认','点错了'],
        title: '启动新会话'
    }, function(){
        layer.closeAll();
        layer.load(1, 0);
        fetch('/api.php?user=' + USER_ID, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'}
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error deleting chat history: ' + response.statusText);
            }
            deleteAllCookies()
            location.reload(); // Reload the page to update the chat history table
        })
        .catch(error => console.error(error));
    }, function(){
        layer.close();
    });
}

// Default send evnet
$("#transcript").on('keydown', function (event) {
    if (event.keyCode == 13) {
        const msgText = msgerInput.value;
        if (!msgText) return;
        
        appendMessage(PERSON_NAME, PERSON_IMG, "right", msgText, formatDate(new Date()));
        msgerInput.value = "";

        sendMsg(msgText)
    }
});

$(".list_block").click(function () {
    elementID = event.srcElement.id;
    tip_prompt = $("#"+elementID).text();
    
    if (!tip_prompt) return;

    appendMessage(PERSON_NAME, PERSON_IMG, "right", tip_prompt, formatDate(new Date()));
    msgerInput.value = "";

    sendMsg(tip_prompt)
});

$(".example_line").click(function () {
    elementID = event.srcElement.id;
    example_prompt = $("#"+elementID).text();
    
    if (!example_prompt) return;
    modal.style.display = "none";

    appendMessage(PERSON_NAME, PERSON_IMG, "right", example_prompt, formatDate(new Date()));
    msgerInput.value = "";

    sendMsg(example_prompt)
});

msgerSendBtn.addEventListener('click', event => {
    event.preventDefault();

    const msgText = msgerInput.value;
    if (!msgText) return;
    
    appendMessage(PERSON_NAME, PERSON_IMG, "right", msgText, formatDate(new Date()));
    
    msgerInput.value = "";
    sendMsg(msgText)
});

// The restart button click
restart_chat.addEventListener('click', event => {
    event.preventDefault();
    deleteChatHistory(USER_ID);
});

function auto_grow(element) {
    element.style.height = "5px";
    element.style.height = (element.scrollHeight)+"px";
}

function go2top() {
    window.scrollTo({
        top:0,
        left:0,
        behavior:"smooth"
    });
}
function go2down() {
    window.scrollTo({
        top:document.documentElement.scrollHeight,
        left:0,
        behavior:"smooth"
    });
}
function todown_now() {
    window.scrollTo(0, document.documentElement.scrollHeight);
}

function getHistory() {
    var formData = new FormData();
    formData.append('user_id', USER_ID);
    fetch('/api.php', {method: 'POST', body: formData})
        .then(response => response.json())
        .then(chatHistory => {
            for (const row of chatHistory) {
                appendMessage(PERSON_NAME, PERSON_IMG, "right", row.human, row.date);
                appendMessage(BOT_NAME, BOT_IMG, "left", row.ai, row.date, "");
                functionIsLoad = false;
            }
        })
        .catch(error => console.error(error));
}

function Home_tips_show(){
    if (document.getElementsByClassName('msg').length == 0) {
        Home_tips.style.display = "block";
    }
}

function appendMessage(name, img, side, text, date, id) {
    text = text.replace(/[&<>"']/g, function(match) {
        return "&#" + match.charCodeAt(0) + ";";
    });
    //   Simple solution for small apps
    if (id == "" || id == undefined) {
        id = randomString(16);
    }
    var holder = randomString(18);
    const msgHTML = `
    <div class="msg ${side}-msg">
        <div class="msg-img" style="background-image: url(${img})" title=${name}></div>
        <div class="msg-bubble">
            <div class="msg-info">
                <div class="msg-info-name">${name}</div>
                <div class="msg-info-time">${date}</div>
            </div>
            <div class="msg-text"><pre class="content" style="margin:auto;" id=a${id}>${text}</pre></div>
        </div>
        <div class=${holder}></div>
    </div>
    `;
    msgerChat.insertAdjacentHTML("beforeend", msgHTML);
    if (side == "left") {
        $("."+holder).append(`<div title="点击复制" style="width:35px;margin:0 5 0 5;"><svg t="1676979873149" class="copy_btn" id="copy_data" data-clipboard-target=#a${id} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6847" width="25" height="25"><path d="M576 384a64 64 0 0 1 64 64v341.333333a64 64 0 0 1-64 64H234.666667a64 64 0 0 1-64-64V448a64 64 0 0 1 64-64h341.333333z m0 64H234.666667v341.333333h341.333333V448z m-64 192v64H298.666667v-64h213.333333zM789.333333 170.666667a64 64 0 0 1 64 64v341.333333a64 64 0 0 1-64 64h-106.666666v-64h106.666666V234.666667H448v106.666666h-64v-106.666666a64 64 0 0 1 64-64h341.333333zM512 533.333333v64H298.666667v-64h213.333333z" fill="#707070" p-id="6848"></path></svg></div>`);
    } else {
        $("."+holder).append(`<div title="编辑提问" style="width:35px;margin:0 5 0 5;"><svg t="1677572686028" class=a${id} id="edit_data" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2880" width="20" height="20"><path d="M862.709333 116.042667a32 32 0 1 1 45.248 45.248L455.445333 613.813333a32 32 0 1 1-45.258666-45.258666L862.709333 116.053333zM853.333333 448a32 32 0 0 1 64 0v352c0 64.8-52.533333 117.333333-117.333333 117.333333H224c-64.8 0-117.333333-52.533333-117.333333-117.333333V224c0-64.8 52.533333-117.333333 117.333333-117.333333h341.333333a32 32 0 0 1 0 64H224a53.333333 53.333333 0 0 0-53.333333 53.333333v576a53.333333 53.333333 0 0 0 53.333333 53.333333h576a53.333333 53.333333 0 0 0 53.333333-53.333333V448z" fill="#707070" p-id="2881"></path></svg></div>`);
    }
    todown_now();
}

function sendMsg(msg) {
    Home_tips.style.display = "none";
    msgerSendBtn.disabled = true
    var formData = new FormData();
    var dates = formatDate(new Date());
    formData.append('date', dates);
    formData.append('msg', msg);
    formData.append('user_id', USER_ID);
    fetch('/send-message.php', {method: 'POST', body: formData})
    .then(response => response.json())
    .then(data => {
        let uuid = uuidv4();
        var Model = $("#model").val();
        var KEY = $("#key").val();
        const eventSource = new EventSource(`/event-stream.php?chat_history_id=${data.id}&id=${encodeURIComponent(USER_ID)}&model=${Model}&key=${KEY}`);
        appendMessage(BOT_NAME, BOT_IMG, "left", "", dates, uuid);
        const div = document.getElementById('a'+uuid);

        eventSource.onmessage = function (e) {
            if (e.data == "[DONE]") {
                msgerSendBtn.disabled = false
                eventSource.close();
            } else {
                var txt = JSON.parse(e.data).choices[0].delta.content;
                if (txt != undefined) {
                    div.innerHTML += txt;
                    todown_now();
                }
            }
        };
        eventSource.onerror = function (e) {
            msgerSendBtn.disabled = false
            console.log(e);
            eventSource.close();
        };
    })
    .catch(error => console.error(error));
}

// Utils
function get(selector, root = document) {
    return root.querySelector(selector);
}

function formatDate(date) {
    
    const ymd = date.toLocaleDateString();
    const hours = "0" + date.getHours();
    const minute = "0" + date.getMinutes();

    return `${ymd} ${hours.slice(-2)}:${minute.slice(-2)}`;
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function randomString(len) {
    len = len || 32;
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    var maxPos = $chars.length;
    var pwd = '';
    for (i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}

function deleteAllCookies() {
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}
