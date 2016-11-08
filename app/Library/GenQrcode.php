<?php

namespace App\Library;

use MongoDB\BSON\ObjectID;
use App\Services\Qiniu;
use BaconQrCode\Common\ErrorCorrectionLevel;
use BaconQrCode\Encoder\Encoder;

class GenQrcode
{
    public static function gen($con, $width=500, $height=500, $margin=1)
    {
        $renderer = new \BaconQrCode\Renderer\Image\Png();
        $renderer->setHeight($width);
        $renderer->setWidth($height);
        $renderer->setMargin($margin);
        $writer = new \BaconQrCode\Writer($renderer);
        $path = storage_path(new ObjectID() . '.png');
        $writer->writeFile($con, $path, Encoder::DEFAULT_BYTE_MODE_ECODING, ErrorCorrectionLevel::Q);
        $qrcode = Qiniu::upload(file_get_contents($path));
        @unlink($path);

        return $qrcode;
    }
}
