<?php
// app/Http/Controllers/Api/AddressController.php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Address;
use Illuminate\Support\Facades\DB;

class AddressController extends Controller
{
    /**
     * Lấy danh sách địa chỉ của người dùng.
     */
    public function index(Request $request) // Thêm $request
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        return response()->json(
            $user->addresses()->orderByDesc('IsDefault')->get()
        );
    }

    /**
     * Lưu địa chỉ mới.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'FullName'    => 'required|string|max:100',
            'PhoneNumber' => 'required|string|max:12',
            'Street'      => 'required|string|max:100',
            'Ward'        => 'nullable|string|max:100',
            'District'    => 'required|string|max:100',
            'City'        => 'required|string|max:100',
            'IsDefault'   => 'nullable|boolean',
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();

        // Dùng transaction để đảm bảo toàn vẹn dữ liệu
        $address = DB::transaction(function () use ($user, $validatedData) {
            $isDefault = $validatedData['IsDefault'] ?? false;

            // Nếu đây là địa chỉ đầu tiên, bắt buộc nó là mặc định
            if ($user->addresses()->count() === 0) {
                $isDefault = true;
            }

            // Nếu người dùng chọn địa chỉ mới này làm mặc định
            if ($isDefault) {
                $user->addresses()->update(['IsDefault' => false]);
            }

            $validatedData['IsDefault'] = $isDefault;

            return $user->addresses()->create($validatedData);
        });

        return response()->json($address, 201);
    }

    /**
     * Lấy thông tin chi tiết một địa chỉ.
     */
    public function show(Request $request, Address $address) // Thêm $request
    {
        if ($request->user()->UserID !== $address->UserID) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }
        return response()->json($address);
    }

    /**
     * Cập nhật một địa chỉ.
     */
    public function update(Request $request, Address $address)
    {
        if ($request->user()->UserID !== $address->UserID) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validatedData = $request->validate([
            'FullName'    => 'sometimes|required|string|max:100',
            'PhoneNumber' => 'sometimes|required|string|max:12',
            'Street'      => 'sometimes|required|string|max:100',
            'Ward'        => 'nullable|string|max:100',
            'District'    => 'sometimes|required|string|max:100',
            'City'        => 'sometimes|required|string|max:100',
        ]);

        $address->update($validatedData);
        return response()->json($address);
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

    /**
     * Đặt một địa chỉ làm mặc định.
     */
    public function setDefault(Request $request, Address $address)
    {
        if ($request->user()->UserID !== $address->UserID) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        /** @var \App\Models\User $user */
        $user = $request->user();

        DB::transaction(function () use ($user, $address) {
            $user->addresses()->update(['IsDefault' => false]);
            $address->update(['IsDefault' => true]);
        });

        return response()->json(['message' => 'Đã cập nhật địa chỉ mặc định.']);
    }
}
