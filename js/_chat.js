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
/*
//定时器*/
const contextarray = [];
$(document).ready(function () {
    
    $("#transcript").on('keydown', function (event) {
        if (event.keyCode == 13) {
            send_post();
            return false;
        }
    });
    $(document).on('click','#re_question', function(e) {
        var myClass = $(this).attr("class");
        let class_name = $("#"+myClass).text();
        $("#transcript").val(class_name);
        send_post();
        return false;
    });
    $(".example_line").click(function () {
        elementID = event.srcElement.id;
        example_prompt = $("#"+elementID).text();
        $("#transcript").val(example_prompt);
        modal.style.display = "none";
        send_post();
        return false;
    });
    /*$(document).on('click','#copy_data', function(e) {
        var myClass = $(this).attr("class");
        //let class_name = $("#"+myClass).text();
        new ClipboardJS('.'+myClass);
        
        return false;
    });*/
    $(".send-btn").click(function () {
        send_post();
        return false;
    });
    $("#clean").click(function () {
        $("#article-wrapper").html("");
        layer.msg("清理完毕！",{time:1000});
        return false;
    });
    
    function articlewrapper(answer,str){
        let answer_div = randomString(16);
        var clipboard = new ClipboardJS('.'+answer);
        clipboard.on('success', function(e) {
            layer.msg("复制成功！",{time:500});
            e.clearSelection();
        });
        clipboard.on('error', function(e) {
            alert("复制失败",{time:1000});
        });
        
        $("#article-wrapper").append('<div id="'+answer_div+'" data-flex="cross:start" style="margin:5"><div class="answer" title="大聪明"><img class="icon" src="static/big_clever.svg"></div></div>')
        $("#"+answer_div).append('<div class="as-context"><li class="article-content"><pre id="'+answer+'" style="margin:0"></pre></li></div><div class="answer" title="复制回答"><svg t="1676979873149" class="'+answer+'" id="copy_data" data-clipboard-target="#'+answer+'" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6847" width="30" height="25" style="position:relative;right:14;"><path d="M576 384a64 64 0 0 1 64 64v341.333333a64 64 0 0 1-64 64H234.666667a64 64 0 0 1-64-64V448a64 64 0 0 1 64-64h341.333333z m0 64H234.666667v341.333333h341.333333V448z m-64 192v64H298.666667v-64h213.333333zM789.333333 170.666667a64 64 0 0 1 64 64v341.333333a64 64 0 0 1-64 64h-106.666666v-64h106.666666V234.666667H448v106.666666h-64v-106.666666a64 64 0 0 1 64-64h341.333333zM512 533.333333v64H298.666667v-64h213.333333z" fill="#707070" p-id="6848"></path></svg>');
        let str_ = ''
        let i = 0
        let timer = setInterval(()=>{
            if(str_.length<str.length){
                str_ += str[i++]
                $("#"+answer).text(str_+'_')//打印时加光标
            }else{
                clearInterval(timer)
                $("#"+answer).text(str_)//打印时加光标
            }
            todown_now();
        },50)
    }
	
    function send_post() {
        
        var prompt = $("#transcript").val();
        if (prompt == "") {
            layer.msg("请输入你的问题", { icon: 5 });
            return;
        }
        let question_div = randomString(16);
        let re_question = randomString(14);
        $("#article-wrapper").append('<div id="'+question_div+'" data-flex="main:right" style="margin:5"><div class="question" title="重复问题"><svg t="1676959845549" class="'+re_question+'" id="re_question" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3238" width="30" height="25" style="position: relative;left:14;"><path d="M816.512 368.192l-55.36 32A285.632 285.632 0 0 1 800 544c0 158.816-129.184 288-288 288-106.368 0-199.264-58.144-249.12-144.16A285.856 285.856 0 0 1 224 544c0-158.816 129.216-288 288-288v96l192-128-192-128v96C317.92 192 160 349.888 160 544c0 64.064 17.504 124 47.52 175.808C268.48 824.96 381.984 896 512 896c194.112 0 352-157.92 352-352 0-64.064-17.472-124-47.488-175.808" fill="#707070" p-id="3239"></path></svg></div><div class="qs-content"><li class="article-title" id="'+re_question+'">'+prompt+'</li></div></div>');
        $("#"+question_div).append('<div class="question" title="你"><img class="icon" src="static/human.svg"></div>');
        todown_now();
        loading = layer.load(2, {
            shade: [0.2, '#000']
        });
        $.ajax({
            cache: true,
            type: "POST",
            url: "_post.php",
            data: {
                message: prompt,
                content:$("#keep").prop("checked")?JSON.stringify(contextarray):[],
                key:$("#key").val(),
                id:$("#id").val(),
            },
            dataType: "json",
            success: function (results) {
                layer.close(loading);
                contextarray.push([prompt, results.raw_message]);
                articlewrapper(randomString(16),results.raw_message);
            }
        });
        $("#transcript").val('');
    }
    function randomString(len) {
        len = len || 32;
        var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        var maxPos = $chars.length;
        var pwd = '';
        for (i = 0; i < len; i++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    }
});