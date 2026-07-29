<?php
require 'config.php';

$_SESSION = [];
session_destroy();

responder(['ok' => true]);
