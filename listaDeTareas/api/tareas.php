<?php
session_start();
header("Content-Type: application/json");

$method = $_SERVER["REQUEST_METHOD"];
$headers = getallheaders();
$token = $headers["Authorization"] ?? "";

if ($token !== "Bearer " . $_SESSION["token"]) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "No autorizado"]);
    exit;
}

$tareasFilePath = "../data/tareas.json";

try {
    switch ($method) {
        case "GET":
            $tareas = json_decode(file_get_contents($tareasFilePath), true);
            echo json_encode(["success" => true, "tareas" => $tareas]);
            break;
        case "POST":
            $data = json_decode(file_get_contents("php://input"), true);
            $tareas = json_decode(file_get_contents($tareasFilePath), true);
            $tarea = [
                "id" => uniqid(),
                "titulo" => $data["titulo"],
                "descripcion" => $data["descripcion"],
                "fechaVencimiento" => $data["fechaVencimiento"],
                "estado" => "pendiente"
            ];
            $tareas[] = $tarea;
            file_put_contents($tareasFilePath, json_encode($tareas));
            echo json_encode(["success" => true, "tarea" => $tarea]);
            break;
        case "PUT":
            $id = $_GET["id"];
            $data = json_decode(file_get_contents("php://input"), true);
            $tareas = json_decode(file_get_contents($tareasFilePath), true);
            foreach ($tareas as &$tarea) {
                if ($tarea["id"] === $id) {
                    $tarea["titulo"] = $data["titulo"];
                    $tarea["descripcion"] = $data["descripcion"];
                    $tarea["fechaVencimiento"] = $data["fechaVencimiento"];
                    break;
                }
            }
            file_put_contents($tareasFilePath, json_encode($tareas));
            echo json_encode(["success" => true]);
            break;
        case "DELETE":
            $id = $_GET["id"];
            $tareas = json_decode(file_get_contents($tareasFilePath), true);
            $tareas = array_filter($tareas, function($tarea) use ($id) {
                return $tarea["id"] !== $id;
            });
            file_put_contents($tareasFilePath, json_encode($tareas));
            echo json_encode(["success" => true]);
            break;
        default:
            http_response_code(405);
            echo json_encode(["success" => false, "message" => "Método no permitido"]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error del servidor"]);
}
?>
