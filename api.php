<?php

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Create a new SQLite database connection
    $db = new SQLite3('db.sqlite');

    // Set the HTTP response header to indicate that the response is JSON
    header('Content-Type: application/json');

    $action = $_POST['action'];
    switch ($action) {
        case 'GET_HISTORY':

            $session_id = $_POST['session_id'];

            // Prepare and execute a SELECT statement to retrieve the chat history data
            $stmt = $db->prepare('SELECT id, human, ai, date FROM chat_history WHERE session_id = :session_id ORDER BY id ASC');
            $stmt->bindValue(':session_id', $session_id, SQLITE3_TEXT);
            $result = $stmt->execute();

            // Fetch the results and store them in an array
            $chat_history = array();
            while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
                $chat_history[] = $row;
            }

            // Convert the chat history array to JSON and send it as the HTTP response body
            echo json_encode($chat_history);

            break;

        case 'QUERY_SESSION':

            $cache_session = $_POST['cache_session'];

            // Prepare and execute a SELECT statement to retrieve the user info data
            $stmt = $db->prepare('SELECT user_name,max_token,user_id FROM main.user_info WHERE cache_session = :cache_session');
            $stmt->bindValue(':cache_session', $cache_session, SQLITE3_TEXT);
            $basic = $stmt->execute();

            // Fetch the results and store them in an array
            $user_info = array();
            while ($row = $basic->fetchArray(SQLITE3_ASSOC)) {
                $user_info[] = $row;
            }

            // Convert the chat history array to JSON and send it as the HTTP response body
            echo json_encode($user_info);

            break;

        case 'GET_SESSION':

            $user_id = $_POST['user_id'];

            // With session_id as the only item, query in ascending order by id
            $result = $db->query("SELECT session_id,human, MIN(id) AS min_id FROM chat_history WHERE user_id = '{$user_id}'GROUP BY session_id ORDER BY min_id ASC");

            // Fetch the results and store them in an array
            $session_id = array();
            while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
                $session_id[] = $row;
            }

            echo json_encode($session_id);

            break;

        case 'DEL_SESSION':

            $session_id = $_POST['session_id'];

            // Prepare and execute a DELETE statement to delete chat history records for the specified user ID
            $stmt = $db->prepare('DELETE FROM chat_history WHERE session_id = :session_id');
            $stmt->bindValue(':session_id', $session_id, SQLITE3_TEXT);
            $result = $stmt->execute();

            // Set the HTTP response status code to indicate success
            http_response_code(204); // No Content

            break;

        case 'DEL_MSG':

            $user_id = $_POST['user_id'];
            $msg_id = $_POST['msg_id'];

            // Prepare to execute update statement, update message to null
            $stmt = $db->prepare('DELETE FROM main.chat_history WHERE id = :id AND user_id = :user_id');
            $stmt->bindValue(':user_id', $user_id, SQLITE3_TEXT);
            $stmt->bindValue(':id', $msg_id, SQLITE3_INTEGER);
            $stmt->execute();

            // Set the HTTP response status code to indicate success
            http_response_code(204); // No Content

            break;

        case 'LOG_IN':

            $user_name = $_POST['user_name'];
            $user_pwds = $_POST['user_pwds'];
            $cache_session = $_POST['cache_session'];

            // Query whether the user key matches, and write the persistent user_id
            $result = $db->query("SELECT user_id FROM main.user_info WHERE user_name = '{$user_name}' AND user_pwds = '{$user_pwds}'");
            if ($result->fetchArray() !== false) {
                $stmt = $db->prepare('UPDATE main.user_info SET cache_session = :cache_session WHERE user_name = :user_name');
                $stmt->bindValue(':cache_session', $cache_session, SQLITE3_TEXT);
                $stmt->bindValue(':user_name', $user_name, SQLITE3_TEXT);
                $stmt->execute();
                http_response_code(200);
            } else {
                http_response_code(204); // Verification failed
            }

            break;

        case 'LOG_OUT':

            $user_name = $_POST['user_name'];
            $user_id = $_POST['user_id'];

            // Prepare update statement, set persistent user_id to null
            $stmt = $db->prepare('UPDATE main.user_info SET cache_session = NULL WHERE user_name = :user_name AND user_id = :user_id');
            $stmt->bindValue(':user_name', $user_name, SQLITE3_TEXT);
            $stmt->bindValue(':user_id', $user_id, SQLITE3_TEXT);
            $result = $stmt->execute();

            // Set the HTTP response status code to indicate success
            http_response_code(200);

            break;

        case 'REGISTER':

            $user_name = $_POST['user_name'];
            $user_pwds = $_POST['user_pwds'];

            // Query whether the username already exists, and insert the register info
            $result = $db->query("SELECT * FROM main.user_info WHERE user_name = '{$user_name}'");
            if ($result->fetchArray() === false) {
                $stmt = $db->prepare('INSERT INTO main.user_info (user_name, user_pwds, max_token) VALUES (:user_name, :user_pwds, :max_token)');
                $stmt->bindValue(':user_name', $user_name);
                $stmt->bindValue(':user_pwds', $user_pwds);
                $stmt->bindValue(':max_token', 300);
                $stmt->execute();
                http_response_code(200);
            } else {
                http_response_code(204); // Username already exists
            }

            break;

        default:
            http_response_code(204); // Return 204;
            break;
    }

    // Close the database connection
    $db->close();
}
