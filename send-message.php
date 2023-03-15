<?php

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $date = $_POST['date'];
    $user_id = $_POST['user_id'];
    $msg = $_POST['msg'];
    $session_id = $_POST['session_id'];

    // Create a new SQLite database connection
    $db = new SQLite3('db.sqlite');
    // Prepare the INSERT statement
    $stmt = $db->prepare('INSERT INTO main.chat_history (date, user_id, human, session_id) VALUES (:date, :user_id, :human, :session_id)');

    // Bind the parameters and execute the statement for each row of data
    $row = ['date' => $date, 'user_id' => $user_id, 'human' => $msg, 'session_id' => $session_id];

    $stmt->bindValue(':date', $row['date']);
    $stmt->bindValue(':user_id', $row['user_id']);
    $stmt->bindValue(':human', $row['human']);
    $stmt->bindValue(':session_id', $row['session_id']);
    $stmt->execute();

    // Close the database connection
    // Set the HTTP response header to indicate that the response is JSON
    header('Content-Type: application/json');
    
    // data
    $data = [
        "id" => $db->lastInsertRowID()
    ];

    // Convert the chat history array to JSON and send it as the HTTP response body
    echo json_encode($data);

    $db->close();
}