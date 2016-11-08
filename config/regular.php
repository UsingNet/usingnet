<?php

return [
    'email' => '/[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]+/i',
    'image' => '/((http|https)\:\/\/)?[a-zA-Z0-9\.\/\?\:@\-_=#]+\.([a-zA-Z0-9\.\/\?\:@\-_=#])*.(jpg|jpeg|gif|png|bmp)/i',
    'link' => '/(https?\:\/\/)?(www\.[\w]+\.[a-zA-Z]+|([\w]+\.)?[\w-]+\.(cn|com|net|org|gov|edu|cc|co|im|io|me))([^\s]+)?/',
    'ip' => '/((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))/',
    'phone' => '/^1[3|4|5|7|8]\d{9}$/',
    'tel' => '/^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/'
];