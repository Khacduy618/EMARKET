<?php
namespace App\Http\Controllers\Seller;


use App\Http\Controllers\Controller;
use App\Models\PlatformCategory;
use App\Models\ShopCategory;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;


class ShopCategoryController extends Controller
{
   
    public function getPlatformCategories()
    {
        $categories = PlatformCategory::where('IsActive', 1)
            ->select('CategoryID', 'Name', 'ParentCategoryID')
            ->with('parent')
            ->get()
            ->map(function ($category) {
                $parentName = $category->parent ? $category->parent->Name : null;
                return [
                    'CategoryID' => $category->CategoryID,
                    'Name' => $category->Name,
                    'ParentName' => $parentName,
                ];
            });


        return response()->json(['data' => $categories], 200);
    }


    public function getShopCategories()
    {
        $user = Auth::user();
        $shop = Shop::where('UserID', $user->UserID)->first();


        if (!$shop) {
            return response()->json(['message' => 'Shop not found'], 404);
        }
        $categories = PlatformCategory::where('IsActive', 1)
            ->select('CategoryID', 'Name', 'ParentCategoryID')
            ->with('parent')
            ->get()
            ->map(function ($category) {
                $parentName = $category->parent ? $category->parent->Name : null;
                return [
                    'ShopCategoryID' => $category->CategoryI,
                    'CategoryID' => $category->CategoryID,
                    'CategoryName' => $category->Name,
                ];
            });
       
        return response()->json(['data' => $categories], 200);
    }


    public function registerCategory(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'CategoryID' => 'required|exists:PlatformCategories,CategoryID',
        ]);


        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }


        $user = Auth::user();
        $shop = Shop::where('UserID', $user->UserID)->first();


        if (!$shop) {
            return response()->json(['message' => 'Shop not found'], 404);
        }


        $existingRequest = ShopCategory::where('ShopID', $shop->ShopID)
            ->where('CategoryID', $request->CategoryID)
            ->first();


        if ($existingRequest) {
            return response()->json(['message' => 'Category already requested'], 422);
        }


        $shopCategory = ShopCategory::create([
            'ShopID' => $shop->ShopID,
            'CategoryID' => $request->CategoryID,
            'Status' => 'PendingApproval',
            'RequestedAt' => now(),
        ]);


        return response()->json(['message' => 'Category registration requested', 'data' => $shopCategory], 201);
    }


    public function deleteCategory($shopCategoryID)
    {
        $user = Auth::user();
        $shop = Shop::where('UserID', $user->UserID)->first();


        if (!$shop) {
            return response()->json(['message' => 'Shop not found'], 404);
        }


        $shopCategory = ShopCategory::where('ShopCategoryID', $shopCategoryID)
            ->where('ShopID', $shop->ShopID)
            ->where('Status', 'PendingApproval')
            ->first();


        if (!$shopCategory) {
            return response()->json(['message' => 'Category request not found or cannot be deleted'], 404);
        }


        $shopCategory->delete();


        return response()->json(['message' => 'Category request deleted'], 200);
    }
}

