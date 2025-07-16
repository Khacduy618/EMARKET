<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Address;
use Illuminate\Support\Facades\Log;
class AddressController extends Controller
{
    /**
     * Display a listing of the user's addresses.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Sử dụng Query Builder để truy vấn bảng 'Addresses'
        $addresses = DB::table('Addresses')
            ->where('UserID', $user->UserID) // Lọc theo UserID của người dùng hiện tại
            ->whereNull('DeletedAt') // Chỉ lấy những địa chỉ chưa bị xóa mềm
            ->orderBy('IsDefault', 'desc') // Sắp xếp địa chỉ mặc định (IsDefault = 1) lên đầu
            ->get(); // Lấy tất cả các kết quả phù hợp

        // Kiểm tra xem collection kết quả có rỗng không
        if ($addresses->isEmpty()) {
            return response()->json([
                'message' => 'Bạn chưa có địa chỉ nào.',
                'addresses' => [],
                'default_address' => null
            ], 200);
        }

        // Tìm địa chỉ mặc định từ collection đã lấy được
        // Sử dụng `firstWhere` để hiệu quả hơn là lặp lại `where`
        $default_address = $addresses->firstWhere('IsDefault', 1);

        // Trả về dữ liệu dưới dạng JSON
        return response()->json([
            'addresses' => $addresses,
            'default_address' => $default_address // Có thể là null nếu không có địa chỉ mặc định nào được thiết lập
        ]);
    }

    public function show($addressId)
    {
        $address = DB::table('Addresses')
            ->where('AddressID', $addressId)
            ->whereNull('DeletedAt')
            ->first(); // Lấy một bản ghi duy nhất

        if (!$address) {
            return response()->json(['message' => 'Địa chỉ không tồn tại.'], 404);
        }
        
        // Policy: Đảm bảo người dùng chỉ có thể xem địa chỉ của chính họ
        if ($address->UserID !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($address);
    }

    /**
     * Update the specified address in storage using Query Builder.
     */
    public function update(Request $request, $addressId)
    {
        $user = Auth::user();
        
        // Kiểm tra xem địa chỉ có tồn tại và thuộc về user không
        $existingAddress = DB::table('Addresses')
            ->where('AddressID', $addressId)
            ->where('UserID', $user->UserID)
            ->first();

        if (!$existingAddress) {
            return response()->json(['message' => 'Địa chỉ không hợp lệ hoặc không tồn tại.'], 404);
        }

        $validated = $request->validate([
            'FullName' => 'required|string|max:100',
            'PhoneNumber' => 'required|string|max:12',
            'City' => 'required|string|max:100',
            'District' => 'required|string|max:100',
            'Ward' => 'nullable|string|max:100',
            'Street' => 'required|string|max:100',
            'IsDefault' => 'required|boolean',
        ]);
        
        // Bắt đầu một transaction để đảm bảo tính toàn vẹn dữ liệu
        DB::beginTransaction();
        try {
            // Nếu địa chỉ này được đặt làm mặc định, hãy bỏ mặc định các địa chỉ khác
            if ($validated['IsDefault']) {
                DB::table('Addresses')
                   ->where('UserID', $user->UserID)
                   ->where('AddressID', '!=', $addressId)
                   ->update(['IsDefault' => 0]);
            }

            // Cập nhật địa chỉ được chỉ định
            DB::table('Addresses')
              ->where('AddressID', $addressId)
              ->update([
                  'FullName' => $validated['FullName'],
                  'PhoneNumber' => $validated['PhoneNumber'],
                  'City' => $validated['City'],
                  'District' => $validated['District'],
                  'Ward' => $validated['Ward'],
                  'Street' => $validated['Street'],
                  'IsDefault' => $validated['IsDefault'],
                  'UpdatedAt' => now(), // Cập nhật tay trường UpdatedAt
              ]);

            DB::commit();

            // Lấy lại thông tin địa chỉ đã được cập nhật để trả về
            $updatedAddress = DB::table('Addresses')->where('AddressID', $addressId);

            return response()->json([
                'message' => 'Cập nhật địa chỉ thành công.',
                'address' => $updatedAddress
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update address: ' . $e->getMessage());
            return response()->json(['message' => 'Có lỗi xảy ra, không thể cập nhật địa chỉ.'], 500);
        }
    }
    
    /**
     * Set a specific address as the default for the user using Query Builder.
     */
    public function setDefault(Request $request, $addressId)
    {
        $user = Auth::user();

        // Kiểm tra xem địa chỉ có tồn tại và thuộc về user không
        $addressToSetDefault = DB::table('Addresses')->where('AddressID', $addressId)->where('UserID', $user->UserID)->first();
        if (!$addressToSetDefault) {
            return response()->json(['message' => 'Địa chỉ không hợp lệ hoặc không tồn tại.'], 404);
        }

        DB::beginTransaction();
        try {
            // 1. Bỏ tất cả các địa chỉ khác khỏi trạng thái mặc định
            DB::table('Addresses')
               ->where('UserID', $user->UserID)
               ->where('AddressID', '!=', $addressId)
               ->update(['IsDefault' => 0, 'UpdatedAt' => now()]);

            // 2. Đặt địa chỉ được chọn làm mặc định
            DB::table('Addresses')
              ->where('AddressID', $addressId)
              ->update(['IsDefault' => 1, 'UpdatedAt' => now()]);

            DB::commit();

            // Lấy lại thông tin địa chỉ mới để trả về
            $newDefaultAddress = DB::table('Addresses')->where('AddressID', $addressId);

            return response()->json([
                'message' => 'Đã cập nhật địa chỉ mặc định thành công.',
                'new_default_address' => $newDefaultAddress
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to set default address: ' . $e->getMessage());
            return response()->json(['message' => 'Có lỗi xảy ra, không thể cập nhật địa chỉ.'], 500);
        }
    }

    /**
     * Xóa một địa chỉ.
     */
    public function destroy(Request $request, Address $address)
    {
        if ($request->user()->UserID !== $address->UserID) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        /** @var \App\Models\User $user */
        $user = $request->user();

        if ($address->IsDefault && $user->addresses()->count() <= 1) {
            return response()->json(['message' => 'Không thể xóa địa chỉ mặc định duy nhất.'], 400);
        }

        $wasDefault = $address->IsDefault;
        $address->delete();

        if ($wasDefault) {
            $newDefault = $user->addresses()->first();
            if ($newDefault) {
                $newDefault->update(['IsDefault' => true]);
            }
        }

        return response()->noContent();
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'FullName' => 'required|string|max:100',
            'PhoneNumber' => 'required|string|max:12',
            'City' => 'required|string|max:100',
            'District' => 'required|string|max:100',
            'Ward' => 'nullable|string|max:100',
            'Street' => 'required|string|max:100',
            'IsDefault' => 'required|boolean',
        ]);

        DB::beginTransaction();
        try {
            // Nếu địa chỉ mới được đặt làm mặc định, bỏ mặc định các địa chỉ khác
            if ($validated['IsDefault']) {
                DB::table('Addresses')
                   ->where('UserID', $user->UserID)
                   ->update(['IsDefault' => 0, 'UpdatedAt' => now()]);
            }

            // Thêm UserID và timestamps vào mảng dữ liệu để chèn
            $dataToInsert = $validated;
            $dataToInsert['UserID'] = $user->UserID;
            $dataToInsert['CreatedAt'] = now();
            $dataToInsert['UpdatedAt'] = now();
            
            // --- SỬA LỖI Ở ĐÂY: Dùng `insertGetId` thay cho `create` ---
            // `insertGetId` sẽ chèn bản ghi và trả về ID của nó.
            $newAddressId = DB::table('Addresses')->insertGetId($dataToInsert);

            // Lấy lại toàn bộ thông tin của địa chỉ vừa tạo để trả về cho frontend
            $newAddress = DB::table('Addresses')->where('AddressID', $newAddressId);
            
            DB::commit();

            return response()->json([
                'message' => 'Thêm địa chỉ mới thành công.',
                'address' => $newAddress
            ], 201); // Trả về status 201 Created

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create address: ' . $e->getMessage());
            return response()->json(['message' => 'Có lỗi xảy ra, không thể tạo địa chỉ mới.'], 500);
        }
    }
}
