<?php
session_start();
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);
$usuario = $data["usuario"];
$contrasena = $data["contrasena"];

if ($usuario === "daw" && $contrasena === "daw2025") {
    $token = bin2hex(random_bytes(16));
    $_SESSION["token"] = $token;
    $expiracion = date("Y-m-d H:i:s", strtotime("+5 minutes"));
    echo json_encode(["success" => true, "token" => $token, "expiracion" => $expiracion]);
} else {
    echo json_encode(["success" => false, "message" => "Usuario o contraseña incorrectos"]);
}
?>
