<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SellerRegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'shop_name' => 'required|string|max:255|unique:shops,ShopName',
            'description' => 'nullable|string',
            'shop_address' => 'required|string',
            'shop_phone' => 'required|string|max:20',
            'logo_url' => 'nullable|url|max:512',
            'cover_image_url' => 'nullable|url|max:512',
        ];
    }
}