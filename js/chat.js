
/*
//定时器*/
const contextarray = [];
$(document).ready(function () {

    $("#kw-target").on('keydown', function (event) {
        if (event.keyCode == 13) {
            send_post();
            return false;
        }
    });
    $("#ai-btn").click(function () {
        send_post();
        return false;
    });
    $("#clean").click(function () {
        $("#article-wrapper").html("");
        layer.msg("清理完毕！");
        return false;
    });
    function articlewrapper(answer,str){
        $("#article-wrapper").append('<li class="article-content" id="'+answer+'"><pre></pre></li>');
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
        },50)
    }
    function send_post() {

        var prompt = $("#kw-target").val();
        if (prompt == "") {
            layer.msg("请输入你的 问题", { icon: 5 });
            return;
        }
		$("#article-wrapper").append('<li class="article-title">我：'+prompt+'</li>');
        // loading =  layer.msg("正在获取请稍后", { icon: 16 });
        loading = layer.load(2, {
            shade: [0.2, '#000']
        });
        $.ajax({
            cache: true,
            type: "POST",
            url: "message.php",
            data: {
                message: prompt,
                context:$("#keep").prop("checked")?JSON.stringify(contextarray):[],
                key:$("#key").val(),
                id:$("#id").val(),
            },
            dataType: "json",
            success: function (results) {
                layer.close(loading);
                layer.msg("获取成功！");
                contextarray.push([prompt, results.raw_message]);
                articlewrapper(randomString(16),results.raw_message);
            }
        });
		$("#kw-target").val('');
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