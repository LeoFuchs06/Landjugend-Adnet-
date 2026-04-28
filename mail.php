<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

// Honeypot check
if (!empty($_POST['hp_website'])) {
    // Silent success so bots don't retry
    echo json_encode(['ok' => true]);
    exit;
}

// Collect + sanitise inputs
$name    = trim(strip_tags($_POST['name']    ?? ''));
$email   = trim(strip_tags($_POST['email']   ?? ''));
$subject = trim(strip_tags($_POST['subject'] ?? 'allgemein'));
$message = trim(strip_tags($_POST['message'] ?? ''));
$dsgvo   = !empty($_POST['dsgvo']);

// Validate
$errors = [];
if ($name === '')                              $errors[] = 'Name fehlt.';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Ungültige E-Mail.';
if (strlen($message) < 10)                    $errors[] = 'Nachricht zu kurz.';
if (!$dsgvo)                                  $errors[] = 'Datenschutz nicht akzeptiert.';

if ($errors) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'errors' => $errors]);
    exit;
}

// Subject map
$subjectMap = [
    'allgemein'    => 'Allgemeine Anfrage',
    'mitgliedschaft' => 'Mitgliedschaft',
    'veranstaltung'  => 'Veranstaltung',
    'presse'         => 'Presse',
    'sonstiges'      => 'Sonstiges',
];
$subjectLabel = $subjectMap[$subject] ?? 'Anfrage';

$to      = 'info@landjugend-adnet.at';
$headers = implode("\r\n", [
    'From: Kontaktformular LJ Adnet <noreply@landjugend-adnet.at>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: LJ-Adnet-Kontaktformular/1.0',
]);

$body = <<<TXT
Neue Kontaktanfrage über die Website:

Name:    {$name}
E-Mail:  {$email}
Betreff: {$subjectLabel}

Nachricht:
{$message}

---
Diese Nachricht wurde über das Kontaktformular auf landjugend-adnet.at gesendet.
TXT;

$mailSubject = '=?UTF-8?B?' . base64_encode('[LJ Adnet] ' . $subjectLabel . ' von ' . $name) . '?=';
$sent = mail($to, $mailSubject, $body, $headers);

if ($sent) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'E-Mail konnte nicht gesendet werden.']);
}
