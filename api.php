<?php
session_start();

// Check authentication
if (!isset($_SESSION['authenticated']) || !$_SESSION['authenticated']) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(array('error' => 'Unauthorized', 'redirect' => 'login.php'));
    exit;
}

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$DATA_FILE = __DIR__ . '/data.json';

function initializeDataFile() {
    global $DATA_FILE;
    if (!file_exists($DATA_FILE)) {
        $defaultData = array('websites' => array(), 'lastChecked' => null, 'lastUpdated' => date('c'));
        file_put_contents($DATA_FILE, json_encode($defaultData, JSON_PRETTY_PRINT));
    }
}

function readData() {
    global $DATA_FILE;
    if (!file_exists($DATA_FILE)) {
        initializeDataFile();
    }
    $json = @file_get_contents($DATA_FILE);
    return $json ? json_decode($json, true) : array('websites' => array(), 'lastChecked' => null);
}

function writeData($data) {
    global $DATA_FILE;
    @file_put_contents($DATA_FILE, json_encode($data, JSON_PRETTY_PRINT));
}

function getSSLExpiryDate($domain) {
    $domain = str_replace(array('https://', 'http://'), '', $domain);
    $domain = explode('/', $domain)[0];
    $domain = trim($domain);

    try {
        $context = stream_context_create(array('ssl' => array('capture_peer_cert' => true, 'verify_peer' => false, 'verify_peer_name' => false)));
        @$stream = stream_socket_client("ssl://" . $domain . ":443", $errno, $errstr, 10, STREAM_CLIENT_CONNECT, $context);

        if (!$stream) {
            return array('domain' => $domain, 'expiryDate' => null, 'daysUntilExpiry' => null, 'status' => 'Error: Connection failed', 'lastChecked' => date('c'));
        }

        $params = stream_context_get_params($stream);
        $cert = $params['options']['ssl']['peer_certificate'];
        @fclose($stream);

        if (!$cert) {
            return array('domain' => $domain, 'expiryDate' => null, 'daysUntilExpiry' => null, 'status' => 'Error: No certificate', 'lastChecked' => date('c'));
        }

        $certInfo = openssl_x509_parse($cert);
        $expiryTimestamp = $certInfo['validTo_time_t'];
        $expiryDate = date('Y-m-d', $expiryTimestamp);
        $daysUntilExpiry = floor(($expiryTimestamp - time()) / 86400);

        $status = 'Valid';
        if ($daysUntilExpiry < 0) $status = 'Expired';
        elseif ($daysUntilExpiry < 7) $status = 'Critical';
        elseif ($daysUntilExpiry < 30) $status = 'Warning';

        return array('domain' => $domain, 'expiryDate' => $expiryDate, 'daysUntilExpiry' => (int)$daysUntilExpiry, 'status' => $status, 'lastChecked' => date('c'));
    } catch (Exception $e) {
        return array('domain' => $domain, 'expiryDate' => null, 'daysUntilExpiry' => null, 'status' => 'Error: Connection', 'lastChecked' => date('c'));
    }
}

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = str_replace('/ssl-dashboard/api.php', '', $uri);
$uri = str_replace('/ssl-dashboard/', '', $uri);

if ($uri === '/websites' || $uri === '' || $uri === '/') {
    if ($method === 'GET') {
        echo json_encode(readData());
    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $url = isset($input['url']) ? $input['url'] : null;

        if (!$url) {
            http_response_code(400);
            echo json_encode(array('error' => 'URL required'));
            exit;
        }

        $data = readData();
        foreach ($data['websites'] as $w) {
            if (strtolower($w['url']) === strtolower($url)) {
                http_response_code(400);
                echo json_encode(array('error' => 'Website exists'));
                exit;
            }
        }

        $result = getSSLExpiryDate($url);
        $data['websites'][] = array_merge(array('url' => $url), $result);
        $data['lastUpdated'] = date('c');
        writeData($data);
        echo json_encode(array('success' => true));
    }
} elseif (preg_match('/^\/websites\/(\d+)$/', $uri, $m)) {
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $data = readData();
        $idx = (int)$m[1];
        if ($idx >= 0 && $idx < count($data['websites'])) {
            array_splice($data['websites'], $idx, 1);
            $data['lastUpdated'] = date('c');
            writeData($data);
            echo json_encode(array('success' => true));
        }
    }
} elseif (preg_match('/^\/check\/(\d+)$/', $uri, $m)) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = readData();
        $idx = (int)$m[1];
        if ($idx >= 0 && $idx < count($data['websites'])) {
            $result = getSSLExpiryDate($data['websites'][$idx]['url']);
            $data['websites'][$idx] = array_merge(array('url' => $data['websites'][$idx]['url']), $result);
            $data['lastUpdated'] = date('c');
            writeData($data);
            echo json_encode($result);
        }
    }
} elseif ($uri === '/check-all') {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = readData();
        foreach ($data['websites'] as $i => $w) {
            $result = getSSLExpiryDate($w['url']);
            $data['websites'][$i] = array_merge(array('url' => $w['url']), $result);
        }
        $data['lastChecked'] = date('c');
        $data['lastUpdated'] = date('c');
        writeData($data);
        echo json_encode(array('success' => true, 'data' => $data));
    }
} else {
    http_response_code(404);
    echo json_encode(array('error' => 'Not found'));
}
?>