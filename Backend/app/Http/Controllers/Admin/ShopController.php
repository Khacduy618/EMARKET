<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShopController extends Controller
{
  public function index(Request $req): JsonResponse
  {
    $query = Shop::with(['user:UserID,FullName']);

    // Tìm kiếm theo keyword
    if ($req->keyword) {
      $query->where('ShopName', 'like', '%' . $req->keyword . '%');
    }

    // Sắp xếp
    $sortColumn = $req->sort_column ?? 'ShopID';
    $sortType = $req->sort_type === 'desc' ? 'desc' : 'asc';

    $allowedSortColumns = ['ShopID', 'ShopName', 'Level', 'Status'];
    if (!in_array($sortColumn, $allowedSortColumns)) {
      $sortColumn = 'ShopID';
    }

    $query->orderBy($sortColumn, $sortType);

    // Phân trang
    $quantityDisplay = $req->display_quantity ?? 10;
    $currentPage = $req->current_page ?? 1;

    $totalRecords = $query->count();
    $totalPage = ceil($totalRecords / $quantityDisplay);
    $skipRecords = ($currentPage - 1) * $quantityDisplay;

    $shops = $query->skip($skipRecords)->take($quantityDisplay)->get();

    // Định dạng lại kết quả
    $result = $shops->map(function ($shop) {
      return [
        'ShopID' => $shop->ShopID,
        'UserID' => $shop->UserID,
        'ShopName' => $shop->ShopName,
        'Description' => $shop->Description,
        'LogoURL' => $shop->LogoURL,
        'CoverImageURL' => $shop->CoverImageURL,
        'AddressStreet' => $shop->AddressStreet,
        'AddressWard' => $shop->AddressWard,
        'AddressDistrict' => $shop->AddressDistrict,
        'AddressCity' => $shop->AddressCity,
        'ShopPhone' => $shop->ShopPhone,
        'Level' => $shop->Level,
        'Status' => $shop->Status,
        'CreatedAt' => $shop->CreatedAt,
        'RepresentativeName' => $shop->user->FullName ?? null,
      ];
    });

    return response()->json([
      'status' => true,
      'message' => 'Danh sách shop kèm người đại diện',
      'data' => $result,
      'pagination' => [
        'totalRecords' => $totalRecords,
        'currentPage' => (int) $currentPage,
        'totalPage' => (int) $totalPage,
        'limitItem' => (int) $quantityDisplay,
      ],
      'keyword' => $req->keyword,
      'sort_column' => $sortColumn,
      'sort_type' => $sortType,
    ]);
  }

  public function changeStatus(Request $req, $shopId): JsonResponse
  {
    // Validate input
    $validated = $req->validate([
      'status' => 'required|string|max:50',
    ]);

    // Tìm shop
    $shop = Shop::find($shopId);

    if (!$shop) {
      return response()->json([
        'status' => false,
        'message' => 'Không tìm thấy shop'
      ], 404);
    }

    // Cập nhật status
    $shop->Status = $validated['status'];
    $userId = $shop->UserID;

    if ($shop->Status == "Approved") {
      $user = User::find($userId);
      if ($user) {
        $user->Role = 'Seller';
        $user->save();
      }
    }

    $shop->save();

    return response()->json([
      'status' => true,
      'message' => 'Cập nhật trạng thái thành công',
    ]);
  }

  public function shopDetail($id): JsonResponse
  {
    $shop = Shop::with(['user:UserID,FullName'])
      ->find($id);

    if (!$shop) {
      return response()->json([
        'status' => false,
        'message' => 'Không tìm thấy shop'
      ], 404);
    }

    return response()->json([
      'status' => true,
      'message' => 'Chi tiết shop',
      'data' => [
        'ShopID' => $shop->ShopID,
        'UserID' => $shop->UserID,
        'ShopName' => $shop->ShopName,
        'Description' => $shop->Description,
        'LogoURL' => $shop->LogoURL,
        'CoverImageURL' => $shop->CoverImageURL,
        'AddressStreet' => $shop->AddressStreet,
        'AddressWard' => $shop->AddressWard,
        'AddressDistrict' => $shop->AddressDistrict,
        'AddressCity' => $shop->AddressCity,
        'ShopPhone' => $shop->ShopPhone,
        'Level' => $shop->Level,
        'Status' => $shop->Status,
        'CreatedAt' => $shop->CreatedAt,
        'RepresentativeName' => $shop->user->FullName ?? null,
      ]
    ]);
  }

}
