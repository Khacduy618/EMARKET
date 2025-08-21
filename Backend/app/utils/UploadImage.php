<?php

namespace App\utils;

use Illuminate\Http\Request;

class UploadImage
{
  public static function uploadImage(Request $req, $fieldName = 'image')
  {
    if ($req->hasFile($fieldName)) {
      $file = $req->file($fieldName);

      if (!$file->isValid()) {
        throw new \Exception('File không hợp lệ');
      }

      $allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!in_array($file->getMimeType(), $allowedTypes)) {
        throw new \Exception('Chỉ chấp nhận file ảnh jpg, jpeg, png');
      }

      $maxSize = 5 * 1024 * 1024; // 5MB
      if ($file->getSize() > $maxSize) {
        throw new \Exception('Dung lượng file phải nhỏ hơn 5MB');
      }

      $fileName = time() . '_' . uniqid() . '.' . $file->extension();

      $file->move(public_path('uploads/'), $fileName);

      return url('uploads/' . $fileName);
    }

    return null; 
  }
}
