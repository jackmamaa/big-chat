// Obtain theme style and user session through cookie
if (getCookie("id") == "") {
    const validTime = 60 * 60 * 24 * 7 * 1000;
    const expireDate = new Date(Date.now() + validTime);
    const expireUTC = expireDate.toUTCString();
    const uuid = uuidv4();
    document.cookie = `id=${uuid};expires=${expireUTC}`;
    var ids = uuid;
} else {
    var ids = getCookie("id");
}

if (getCookie("style") == "") {
    document.cookie = "style=day";
} else {
    theme_switch(getCookie("style"));
}

// Global message timeout;
layer.config({
   offset: 400, 
});

const msgerInput = get("#transcript");
const msgerChat = get("#article-wrapper");
const msgerSendBtn = get(".send-btn");
const status_info = get(".status_info");
const BOT_IMG = "static/big_clever.svg";
const PERSON_IMG = "static/human.svg";
const BOT_NAME = "大聪明";
const msg_timeout = 2000;
var update_session_title;
var login_status = false;
var user_session = ids;
var chat_current_session;
var chat_session_mgr;
var USER_NAME = '你';
var USER_ID;
main();

// The example on long
var example_modal = document.getElementById("example_modal");
var example_btn = document.getElementById("example_btn");
var close_modal = document.getElementsByClassName("close_box")[0];

example_btn.onclick = function() {
    example_modal.style.display = "block";
}

close_modal.onclick = function() {
    example_modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == example_modal) {
        example_modal.style.display = "none";
    }
}

// hide and show scroll btn
window.onscroll = function()
{
    var pageOffset = document.documentElement.scrollTop || document.body.scrollTop;
    var g2t = document.getElementById('go2topd');
    var g2d = document.getElementById('go2downd');
    if (pageOffset >= 10)
    {
        g2t.style.visibility="visible";
        g2d.style.visibility="hidden";
    } else {
        g2t.style.visibility="hidden";
        if (pageOffset) g2d.style.visibility="visible";
    }
};

// Message read and write operations, copy, edit, delete
var _copy = new ClipboardJS('.copy_btn');

_copy.on('success', function(e) {
    layer.msg('复制成功', {time: msg_timeout});
    e.clearSelection();
});

_copy.on('error', function() {
    layer.msg('复制失败', {time: msg_timeout});
});

$(document).on('click','#edit_data', function() {
    const myClass = $(this).attr("class");
    let text = $("#"+myClass).text();
    layer.open({
        type: 1,
        offset: layer_height(4),
        title: '编辑问题',
        btn: ['提交','取消'],
        content: `
            <div style='display:flex;justify-content:center;'>
                <textarea id='edit_box' oninput='auto_grow(this)' autofocus>${text}</textarea>
            </div>`,
        yes:function (index,layero) {
            layer.closeAll();
            var edit_enter = $("#edit_box").val() || top.$("#edit_box").val();
            if (!edit_enter) return;

            appendMessage(USER_NAME, PERSON_IMG, "right", edit_enter, formatDate(new Date()));
            msgerInput.value = "";
            sendMsg(edit_enter);
        }
    });
});

$(document).on('click','#edit_data', function() {
    setTimeout(function(){
        var areas = document.getElementById('edit_box');
        areas.focus();
        areas.setSelectionRange(areas.value.length,areas.value.length);
    },50);
});

$(document).on('click','#del_msg', function() {
    const del_id = $(this).attr("class");
    del_msg(del_id,USER_ID);
});

// Style table switch
$(document).on('click','#theme_btn', function() {
    if (getCookie("style") == "day") {
        theme_switch("moon");
        document.cookie = 'style=moon';
    } else {
        theme_switch("day")
        document.cookie = 'style=day';
    }
});

// Listen to update the chat session title
const config = {
    childList: true,
    subtree: true
};

const callback = function(mutationsList, observer) {
    for(const mutation of mutationsList) {
        if (mutation.type == 'childList') {
            for(const node of mutation.addedNodes) {
                if (update_session_title && node.classList && node.classList.contains("left-msg")) {
                    get_session().then(() => {
                        chat_session_mgr.value = chat_current_session;
                    });
                    update_session_title = 0;
                }
            }
        }
    }
};

const observer = new MutationObserver(callback);
observer.observe(msgerChat, config);

// Default event listen
$(document).on('click','.login_btn', function() {
    let lastClickTime = 0;
    layer.open({
        type: 1,
        offset: layer_height(4),
        title: '登录账号',
        btn: ['登录'],
        skin: 'login_box',
        content: `
            <div class="input_msg">
                <span style="font-size:15px">用户名：</span><input class='user_name input_box' placeholder="username" autofocus>
            </div>
            <div class="input_msg">
                <span style="font-size:15px">密&nbsp;&nbsp;&nbsp;&nbsp;码：</span>
                <input type="password" class='user_pwds input_box' placeholder="password">
            </div>`,
        yes:function (index,layero) {
            let now = new Date().getTime();
            if (now - lastClickTime < 5000) {
                layer.msg('操作太频繁！', {time: msg_timeout});
                return;
            } else {
                const user_name = $(".user_name").val() || top.$(".user_name").val();
                const user_pwds = $(".user_pwds").val() || top.$(".user_pwds").val();
                if (!user_name || !user_pwds) {
                    layer.msg('用户名或密码不能为空！', {time:msg_timeout});
                    return;
                } else {
                    user_login(user_name, user_pwds);
                }
                lastClickTime = now;
            }
        }
    });
});

$(document).on('click','.logout_btn', function() {
    user_logout(USER_NAME);
});

$(document).on('click','.register_btn', function() {
    let lastClickTime = 0;
    layer.open({
        type: 1,
        offset: layer_height(4),
        title: '注册账号',
        btn: ['注册'],
        skin: 'login_box',
        content: `
            <div class="input_msg">
                <span style="font-size:15px">用&nbsp;&nbsp;户&nbsp;&nbsp;名：</span>
                <input class='user_name input_box' style='ontline:none' placeholder="username" autofocus>
            </div>
            <div class="input_msg">
                <span style="font-size:15px">密&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;码：</span>
                <input type="password" class='user_pwds input_box' style='ontline:none' placeholder="password">
            </div>
            <div class="input_msg">
                <span style="font-size:15px">确认密码：</span>
                <input type="password" class='confirm_pwds input_box' style='ontline:none' placeholder="password">
            </div>
            <a class="regisger_tip" style="color:#9ca2a8;margin: 2">用户名6~12位(中/英/数字),密码8~16位(&;|\和中文除外).</a>`,
        yes:function (index,layero) {
            let now = new Date().getTime();
            if (now - lastClickTime < 3000) {
                layer.msg('操作太频繁！',{time:msg_timeout});
                return;
            } else {
                const user_name = $(".user_name").val() || top.$(".user_name").val();
                const user_pwds = $(".user_pwds").val() || top.$(".user_pwds").val();
                const confirm_pwds = $(".confirm_pwds").val() || top.$(".confirm_pwds").val();
                const verfiy_name = /^[0-9a-zA-Z\u4e00-\u9fa5]{6,12}$/;
                const verfiy_pwds = /^[^&;|\\\s\u4e00-\u9fa5\uff00-\uffff\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]{8,16}$/;
                if ((verfiy_name.test(user_name) && verfiy_pwds.test(user_pwds))) {
                    if (confirm_pwds === user_pwds ) {
                        user_register(user_name, user_pwds)
                    } else layer.msg('两次密码输入不一致！',{time:msg_timeout});
                } else {
                    layer.msg('用户名或密码不符合要求！',{time:msg_timeout});
                }
                lastClickTime = now;
            }
        }
    });
});

$(document).on('click','.list_block', function() {
    elementID = event.srcElement.id;
    tip_prompt = $("#"+elementID).text();
    
    if (!tip_prompt) return;

    appendMessage(USER_NAME, PERSON_IMG, "right", tip_prompt, formatDate(new Date()));
    msgerInput.value = "";

    sendMsg(tip_prompt)
});

$(document).on('keydown','#transcript', function(e) {
    if (e.ctrlKey && e.keyCode === 13) {
        const msgText = msgerInput.value;
        if (!msgText) return;
        
        appendMessage(USER_NAME, PERSON_IMG, "right", msgText, formatDate(new Date()));
        
        msgerInput.value = "";
        msgerInput.style.height = "15px";
        sendMsg(msgText)
    }
});

$(document).on('keydown','.login_box', function(e) {
    if (e.keyCode === 13) {
        if (!$(this).data('enter_time') || Date.now() - $(this).data('enter_time') >= 3000) {
            $(this).data('enter_time', Date.now());
            $('.layui-layer-btn0').click();
        }
    }
});

$(document).on('click','.example_line', function() {
    elementID = event.srcElement.id;
    example_prompt = $("#"+elementID).text();
    
    if (!example_prompt) return;
    example_modal.style.display = "none";

    appendMessage(USER_NAME, PERSON_IMG, "right", example_prompt, formatDate(new Date()));
    msgerInput.value = "";

    sendMsg(example_prompt)
});

$(document).on('click','.title_btn', function() {
    if ($('.adaptive').css('display') == 'block') adaptive_menu();
});

msgerSendBtn.addEventListener('click', event => {
    event.preventDefault();

    const msgText = msgerInput.value;
    if (!msgText) return;
    
    appendMessage(USER_NAME, PERSON_IMG, "right", msgText, formatDate(new Date()));
    
    msgerInput.value = "";
    msgerInput.style.height = "15px";
    sendMsg(msgText)
});

// Function
function main() {
    check_status().then(() => {
        if (login_status) {
            get_session().then(() => {
                if (!chat_session_mgr.value && !chat_current_session) {
                    chat_current_session = uuidv4();
                    chat_session_mgr.insertAdjacentHTML("afterbegin", `<option value=${chat_current_session}>新的会话</option>`);
                    setTimeout(function(){
                        chat_session_mgr.value = chat_current_session;
                    },100);
                }

                // Record browsing sessions before logout
                if (getCookie("session_id") == "") {
                    document.cookie = "session_id=" + chat_session_mgr.value;
                } else {
                    let options = chat_session_mgr.options;
                    let session_id = getCookie("session_id");
                    for (var i = 0; i < options.length; i++) {
                        if (session_id === options[i].value) {
                            chat_session_mgr.value = getCookie("session_id");
                            break;
                        }
                    }
                }
                get_session_msg();

                // Listen for changes to the chat session
                $(document).on('change','.chat_session_mgr',function() {
                    if ($('.adaptive').css('display') == 'block') adaptive_menu();
                    document.cookie = "session_id=" + chat_session_mgr.value;
                    msgerChat.innerHTML = '';
                    get_session_msg();
                });
            });
        } else {
            get_session_msg();
        }
    });
}

// Media auto-adaptation, navigation bar button click monitoring
function adaptive_menu() {
    var nav_title = document.getElementById("navigation");
    if (nav_title.className === "nav_title") {
        nav_title.className += " responsive";
    } else {
        nav_title.className = "nav_title";
    }
}

// Function to add and delete chat session records for a user ID using the API
function Add_chat() {
    update_session_title = 1;
    msgerChat.innerHTML = '';
    Home_tips_show();
    if (login_status) {
        chat_current_session = uuidv4();
        chat_session_mgr.insertAdjacentHTML("afterbegin", `<option value=${chat_current_session}>新的会话</option>`);
        chat_session_mgr.value = chat_current_session;
        document.cookie = "session_id=" + chat_session_mgr.value;
    }
}

// Delete current chat session history
function Del_chat() {
    layer.confirm('这将删除该会话记录,你确定？', {
        btn: ['确认','点错了'],
        title: '删除当前会话',
    }, function(){
        layer.closeAll();
        loading = layer.load(2, 0);
        fetch('/api.php?session_id=' + chat_current_session, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'}
        })
        .then(response => {
            layer.close(loading);
            if (!response.ok) {
                throw new Error('Error deleting chat history: ' + response.statusText);
            }
            if (login_status) {
                get_session().then(() => {
                    get_session_msg();
                });
            } else Add_chat();
        })
        .catch(error => console.error(error));
    }, function(){
        layer.close();
    });
}

// Delete a message in the current chat session
function del_msg(msg_id, USER_ID) {
    loading = layer.load(2);
    fetch(`/api.php?user_id=${USER_ID}&msg_id=${msg_id}`, {
        method: 'DEL_MSG',
        headers: {'Content-Type': 'application/json'}
    })
    .then(response => {
        if (response.ok) {
            document.querySelector(`#a${msg_id}.left-msg`).remove();
        }
        layer.close(loading);
    })
    .catch(error => console.error(error));
}

// Check login status
function check_status() {
    return new Promise((resolve, reject) => {
        fetch('/api.php?cache_session=' + user_session, {
            method: 'QUERY_SESSION',
            headers: {'Content-Type': 'application/json'}
        })
        .then(response => response.json())
        .then(_status => {
            document.body.insertAdjacentHTML("beforeend",`
                <div id="del_chat" onclick="Del_chat()" title="删除会话">
                    <img class="icon" src="static/del_chat.svg">
                </div>`);
            if (_status == '') {
                const insert_status = `
                    <a class="title_btn user_ctl login_btn">登录</a>
                    <a class="title_btn user_ctl register_btn">注册</a>`;
                status_info.insertAdjacentHTML("afterbegin", insert_status);
            } else {
                for (const row of _status) {
                    const insert_status = `
                        <a class="title_btn user_name">用户名：${row.user_name}&nbsp;</a>
                        <a class="title_btn max_token">默认最大回复：${row.max_token}&nbsp;</a>
                        <a class="session">会话管理：<select class="chat_session_mgr"></select>
                            <img class="title_btn icon add_chat" onclick="Add_chat()" title="添加会话" src="static/add_chat.svg">
                        </a>
                        <a class="title_btn user_ctl logout_btn">注销</a>`;
                    status_info.insertAdjacentHTML("afterbegin", insert_status);
                    USER_NAME = row.user_name;
                    USER_ID = row.user_id;
                }
                login_status = true;
            }
            resolve();
        })
        .catch(error => reject(error));
    })
}

// Get chat session
function get_session() {
    return new Promise((resolve, reject) => {
        chat_session_mgr = get(".chat_session_mgr");
        fetch('/api.php?user_id=' + USER_ID, {
            method: 'GET_SESSION',
            headers: {'Content-Type': 'application/json'}
        })
        .then(response => response.json())
        .then(session => {
            chat_session_mgr.innerHTML = '';
            for (const row of session) {
                const session_title  = row.human.substring(0, Math.min(row.human.length, 24));
                chat_session_mgr.insertAdjacentHTML("afterbegin", `<option value=${row.session_id}>${session_title}</option>`);
            }
            resolve();
        })
        .catch(error => reject(error));
    })
}

// Get history on current chat session
function get_session_msg() {
    if (login_status) {
        chat_current_session = chat_session_mgr.value;
    } else {
        chat_current_session = user_session;
    }
    get_history().then(() => {
        if (!msgerChat.childElementCount) {
            Home_tips_show();
        }
    });
}

function get_history() {
    loading = layer.load(2);
    msgerChat.innerHTML = '';
    return new Promise((resolve, reject) => {
        var formData = new FormData();
        formData.append('session_id', chat_current_session);
        fetch('/api.php', {method: 'POST', body: formData})
        .then(response => response.json())
        .then(chatHistory => {
            for (const row of chatHistory) {
                appendMessage(USER_NAME, PERSON_IMG, "right", row.human, row.date, row.id);
                appendMessage(BOT_NAME, BOT_IMG, "left", row.ai, row.date, row.id, "");
            }
            layer.close(loading);
            resolve();
        })
        .catch(error => console.error(error));
    })
}

// Show tips
function Home_tips_show(){
    const tips = `
        <div class="prompt_tips">
            <div class="index_text" data-flex="main:center dir:top cross:center">
            基于OPENAI的语言模型调用工具。<br>
            内置API仅供测试，中文回复字数限制为300。<br>
            尝试让它作诗，写作，写代码，它几乎知道一切(GPT-3.5——数据集截止2021/09。)<a class="url_link" target="_blank" href="https://github.com/f/awesome-chatgpt-prompts"> 更多有趣用例！</a>
            </div>
            <div class="question" data-flex="main:center">
                <div class="list_first">
                    <div id="tip_1" class="list_block">简单说说通货膨胀和通货紧缩分别会带来哪些好处和问题？</div>
                    <div id="tip_2" class="list_block">给我一个七天的健身减脂计划，内容包括训练时间和饮食计划。</div>
                    <div id="tip_3" class="list_block">什么是CPI？它的值客观的反应出了什么？</div>
                </div>
                <div class="list_second">
                    <div id="tip_4" class="list_block">赞颂我伟大的母亲。</div>
                    <div id="tip_5" class="list_block">用通俗易懂的语言解释什么是黑洞。</div>
                    <div id="tip_6" class="list_block">当前使用的最多的程序开发语言使用率排行。</div>
                    <div id="tip_7" class="list_block">用Python写一个Hello workd。</div>
                </div>
                <div class="list_three">
                    <div id="tip_8" class="list_block">我想让你充当一个花哨的标题生成器。我会用逗号输入关键字，你会用花哨的标题回复。我的第一个关键字是 震惊、女子</div>
                    <div id="tip_9" class="list_block">我有一个10岁的侄女，她喜欢旅游，打游戏，和海，请为她写首诗。</div>
                </div>
            </div>
        </div>`;
    msgerChat.insertAdjacentHTML("beforeend", tips);
    
}

// User operation, login, logout, registration
function user_login(user_name, user_pwds) {
    loading = layer.load(2);
    fetch(`/api.php?user_name=${user_name}&user_pwds=${user_pwds}&cache_session=${user_session}`, {
        method: 'LOG_IN',
        headers: {'Content-Type': 'application/json'}
    })
    .then(response => {
        layer.close(loading);
        if (response.status != 200) {
            layer.msg('用户名或密码错误', {time: msg_timeout});
        } else {
            layer.msg('登入成功', {time: 1000});
            setTimeout(function(){
                location.reload();
            },1000)
        }
    })
    .catch(error => console.error(error));
}

function user_logout(user_name) {
    fetch('/api.php?user_name=' + user_name, {
        method: 'LOG_OUT',
        headers: {'Content-Type': 'application/json'}
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error Log_out: ' + response.statusText);
        }
        deleteCookie('id');
        location.reload(); // Reload the page to update the chat history table
    })
    .catch(error => console.error(error));
}

function user_register(user_name,user_pwds) {
    loading = layer.load(2);
    fetch(`/api.php?user_name=${user_name}&user_pwds=${user_pwds}`, {
        method: 'REGISTER',
        headers: {'Content-Type': 'application/json'}
    })
    .then(response => {
        if (response.status === 200) {
            layer.close(loading);
            layer.msg('注册成功，请登录！', {time: msg_timeout});
            setTimeout(function(){
                layer.closeAll();
            },1000);
        } else {
            layer.msg('用户名已存在！', {time: msg_timeout});
        }
        layer.close(loading);
    })
    .catch(error => console.error(error));
}

// Switch theme
function theme_switch(style) {
    if (style == "day" || style == "moon") {
        var css1 = document.getElementsByTagName('link')[1];
        var css2 = document.getElementsByTagName('link')[2];
        css1.setAttribute('href', `css/${style}/common.css?v1.1`);
        css2.setAttribute('href', `css/${style}/style.css?v1.1`);
        document.getElementById('theme_btn').setAttribute('src',`static/theme-${style}.svg`)
    } else return false;
}

// Add a message to the current session window
function appendMessage(name, img, side, text, date, msg_id, id) {
    text = text.replace(/[&<>"']/g, function(match) {
        return "&#" + match.charCodeAt(0) + ";";
    });
    
    if (id == "" || id == undefined) {
        id = randomString(16);
    }
    
    var holder = randomString(18);
    const msgHTML = `
        <div class="msg ${side}-msg" id=a${msg_id}>
            <div class="msg-img" style="background-image: url(${img})" title=${name}></div>
            <div class="msg-bubble">
                <div class="msg-info">
                    <div class="msg-info-name">${name}</div>
                    <div class="msg-info-time">${date}</div>
                </div>
                <div class="msg-text"><pre class="content" style="margin:auto;" id=a${id}>${text}</pre></div>
            </div>
            <div class=${holder}></div>
        </div>`;
    msgerChat.insertAdjacentHTML("beforeend", msgHTML);
    if (side == "left") {
        $("."+holder).append(`<div title="点击复制" style="width:35px;margin:0 5 0 5;"><svg t="1676979873149" class="copy_btn" id="copy_data" data-clipboard-target=#a${id} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6847" width="25" height="25"><path d="M576 384a64 64 0 0 1 64 64v341.333333a64 64 0 0 1-64 64H234.666667a64 64 0 0 1-64-64V448a64 64 0 0 1 64-64h341.333333z m0 64H234.666667v341.333333h341.333333V448z m-64 192v64H298.666667v-64h213.333333zM789.333333 170.666667a64 64 0 0 1 64 64v341.333333a64 64 0 0 1-64 64h-106.666666v-64h106.666666V234.666667H448v106.666666h-64v-106.666666a64 64 0 0 1 64-64h341.333333zM512 533.333333v64H298.666667v-64h213.333333z" fill="#707070" p-id="6848"></path></svg></div>
        <div id="del_msg" class=${msg_id} style="width: 25px;height: 25px;" title="删除此条信息"><img src="static/del_msg.svg"></div>`);
    } else {
        $("."+holder).append(`<div title="编辑提问" style="width:35px;margin:0 5 0 5;"><svg t="1677572686028" class=a${id} id="edit_data" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2880" width="20" height="20"><path d="M862.709333 116.042667a32 32 0 1 1 45.248 45.248L455.445333 613.813333a32 32 0 1 1-45.258666-45.258666L862.709333 116.053333zM853.333333 448a32 32 0 0 1 64 0v352c0 64.8-52.533333 117.333333-117.333333 117.333333H224c-64.8 0-117.333333-52.533333-117.333333-117.333333V224c0-64.8 52.533333-117.333333 117.333333-117.333333h341.333333a32 32 0 0 1 0 64H224a53.333333 53.333333 0 0 0-53.333333 53.333333v576a53.333333 53.333333 0 0 0 53.333333 53.333333h576a53.333333 53.333333 0 0 0 53.333333-53.333333V448z" fill="#707070" p-id="2881"></path></svg></div>`);
    }
    todown_now();
}

//Send a context message, and get a stream back response
function sendMsg(msg) {
    if (get('.prompt_tips')) get('.prompt_tips').style.display = "none";
    msgerSendBtn.disabled = true
    var formData = new FormData();
    var dates = formatDate(new Date());
    formData.append('date', dates);
    formData.append('user_id', USER_ID);
    formData.append('msg', msg);
    formData.append('session_id', chat_current_session);
    fetch('/send-message.php', {method: 'POST', body: formData})
    .then(response => response.json())
    .then(data => {
        let uuid = uuidv4();
        var Model = $("#model").val();
        var KEY = $("#key").val();
        const eventSource = new EventSource(`/event-stream.php?chat_history_id=${data.id}&user_id=${USER_ID}&session_id=${chat_current_session}&model=${Model}&key=${KEY}`);
        appendMessage(BOT_NAME, BOT_IMG, "left", "", dates, data.id, uuid);
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
            msgerSendBtn.disabled = false;
            console.log(e);
            div.innerHTML += '已达到最大上下文限制，请开启新会话或删除一些消息！';
            eventSource.close();
        };
    })
    .catch(error => console.error(error)); 
}

// Utils
function print_verbatim(str,Element) {
    let str_ = ''
    let i = 0
    let timer = setInterval(()=>{
        if(str_.length<str.length){
            str_ += str[i++]
            $(Element).text(str_+'_');
        }else{
            clearInterval(timer)
            $(Element).text(str_);
        }
        todown_now();
    },25)
}

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

function layer_height(share) {
    return window.innerHeight/share;
}

function get(selector, root = document) {
    return root.querySelector(selector);
}

String.prototype.byteLength = function() {
    var l = this.length;
    var b = 0;
    if(l) {
        for(var i = 0; i < l; i ++) {
            if(this.charCodeAt(i) > 255) {
                b += 2;
            }else {
                b ++;
            }
        }
        return b;
    } else {
        return 0;
    }
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

function deleteCookie(cookieName) {
  document.cookie = cookieName + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
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
