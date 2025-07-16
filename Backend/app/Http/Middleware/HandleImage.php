<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleImage
{
  /**
   * Handle an incoming request.
   *
   * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
   */
  public function handle(Request $req, Closure $next)
  {
    if ($req->hasFile('image')) {
      try {
        $file = $req->file('image');
        // Validate file
        if (!$file->isValid()) {
          return redirect()->back()
            ->with(['type' => 'danger', 'message' => 'File không hợp lệ'])
            ->withInput();
        }

        // Kiểm tra mime type
        $allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!in_array($file->getMimeType(), $allowedTypes)) {
          return redirect()->back()
            ->with(['type' => 'danger', 'message' => 'Chỉ chấp nhận file ảnh jpg, jpeg, png'])
            ->withInput();
        }

        // Tạo tên file
        $fileName = time() . '_' . uniqid() . '.' . $file->extension();

        // Upload file
        $file->move(public_path('uploads/'), $fileName);

        // Thêm tên file vào request để controller sử dụng
        $imageUrl = url('uploads/' . $fileName);
        $req->merge(['image_name' => $imageUrl]);

      } catch (\Exception $e) {
        return redirect()->back()
          ->with('success', 'Lỗi upload ảnh: ' . $e->getMessage())
          ->withInput();
      }
    }
    return $next($req);
  }
}
