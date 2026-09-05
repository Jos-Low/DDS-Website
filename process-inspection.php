<?php
/**
 * Handles the Free Inspection form submission.
 * Validates input server-side (never trust client-side JS alone),
 * emails the lead, then redirects to the thank-you page.
 */

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /free-inspection/');
    exit;
}

function clean($value) {
    return trim(filter_var($value, FILTER_SANITIZE_FULL_SPECIAL_CHARS));
}

$name     = clean($_POST['name'] ?? '');
$phone    = clean($_POST['phone'] ?? '');
$business = clean($_POST['business'] ?? '');
$email    = clean($_POST['email'] ?? '');
$city     = clean($_POST['city'] ?? '');
$hoods    = clean($_POST['hoods_locations'] ?? '');
$message  = clean($_POST['message'] ?? '');
$honeypot = $_POST['_honey'] ?? '';

// Honeypot: real users never fill this in. If it's filled, silently
// pretend success so bots don't learn anything, but send nothing.
if ($honeypot !== '') {
    header('Location: https://dirtydeedsservices.com/thank-you/');
    exit;
}

// Server-side validation (mirrors the client-side checks, but this is
// the copy that actually matters, since JS can be bypassed)
$errors = [];

if (mb_strlen($name) < 2) {
    $errors[] = 'name';
}

$phoneDigits = preg_replace('/\D/', '', $phone);
if (strlen($phoneDigits) !== 10) {
    $errors[] = 'phone';
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'email';
}

if (mb_strlen($business) < 1) {
    $errors[] = 'business';
}

if (!empty($errors)) {
    $query = http_build_query(['error' => implode(',', $errors)]);
    header('Location: /free-inspection/?' . $query);
    exit;
}

// Format the phone number back to (555) 123-4567 for readability
$formattedPhone = '(' . substr($phoneDigits, 0, 3) . ') ' . substr($phoneDigits, 3, 3) . '-' . substr($phoneDigits, 6);

// Build the email
$to      = 'lowdenj1@msu.edu';
$subject = 'Free Inspection Request — ' . $business;

$body  = "New free inspection request from the website:\n\n";
$body .= "Name:          $name\n";
$body .= "Phone:         $formattedPhone\n";
$body .= "Business:      $business\n";
$body .= "Email:         $email\n";
$body .= "City/Location: $city\n";
$body .= "Hoods/Locations: " . ($hoods !== '' ? $hoods : '—') . "\n";
$body .= "Message:       " . ($message !== '' ? $message : '—') . "\n";

// From address should be on your own domain so it doesn't get flagged
// as spoofed; Reply-To is the customer's email so you can hit "reply"
// directly to respond to them.
$headers   = [];
$headers[] = 'From: Dirty Deeds Website <no-reply@dirtydeedsservices.com>';
$headers[] = 'Reply-To: ' . $name . ' <' . $email . '>';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';

$sent = mail($to, $subject, $body, implode("\r\n", $headers));

if ($sent) {
    header('Location: https://dirtydeedsservices.com/thank-you/');
} else {
    // Delivery failed at the server level — send them back with a flag
    // rather than pretending it worked.
    header('Location: /free-inspection/?error=send_failed');
}
exit;