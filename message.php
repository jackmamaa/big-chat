<?php
require_once(__DIR__."/vendor/autoload.php");

use Orhanerday\OpenAi\OpenAi;
use League\CommonMark\CommonMarkConverter;

header( "Content-Type: application/json" );

$context = json_decode( $_POST['context'] ?? "[]" ) ?: [];


$open_ai_key =$_POST['key']?:'填写您的key';
//使用你的API key，从OPENAI官网获取
$open_ai = new OpenAi($open_ai_key);

// 设置默认的请求文本prompt
$prompt = "这是前置内容，每次提交都伴随此，可以改为空\n\n";
$version="text-davinci-003";
// 添加文本到prompt
if( empty( $context ) ) {
    // 如果没有内容，下面是默认内容
    $prompt .= "
    Question:\n'我问你个问题，你告诉我答案OK吗？
    \n\nAnswer:\n好 
    ";
    
    $please_use_above = "";
} else {
    
    // 将上次的问题和答案作为问题进行提交
    $prompt .= "";
    $context = array_slice( $context, -5 );
    foreach( $context as $message ) {
        $prompt .= "Question:\n" . $message[0] . "\n\nAnswer:\n" . $message[1] . "\n\n";
    }
    $please_use_above = ". Please use the questions and answers above as context for the answer.";
}

// add new question to prompt
$prompt = $prompt . "Question:\n" . $_POST['message'] . $please_use_above . "\n\nAnswer:\n\n";

// create a new completion
$complete = json_decode( $open_ai->completion( [
    'model' => $version,
    'prompt' => $prompt,
    'temperature' => 0.9,
    'max_tokens' => 2000, //最大字符数，建议别改大了
    'top_p' => 1,
    'frequency_penalty' => 0,
    'presence_penalty' => 0,
    'stop' => [
        "\nNote:",
        "\nQuestion:"
    ]
] ) );

// get message text
if( isset( $complete->choices[0]->text ) ) {
    $text = str_replace( "\\n", "\n", $complete->choices[0]->text );
} elseif( isset( $complete->error->message ) ) {
    $text = $complete->error->message;
} else {
    $text = "Sorry, but I don't know how to answer that.";
}

$converter = new CommonMarkConverter();
$styled = $converter->convert( $text );

$check = str_split($text,12);
if ( $check[0] != "大聪明：" ) {
	$text = "大聪明：" . $text;
}

// return response
echo json_encode( [
    "message" => (string)$styled,
    "raw_message" => $text,
    "status" => "success",
] );