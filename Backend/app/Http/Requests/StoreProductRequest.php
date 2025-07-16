<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{

     
     public function authorize(): bool
    {
        return auth()->check();
    }



      protected function prepareForValidation()
    {
        // Cũ
        if ($this->has('Variants') && is_string($this->Variants)) {
            $this->merge([
                'Variants' => json_decode($this->Variants, true)
            ]);
        }
    
        if ($this->has('ImageData') && is_string($this->ImageData)) {
            $this->merge([
                'ImageData' => json_decode($this->ImageData, true)
            ]);
        }
    
        // MỚI: Nếu 'Images' không là mảng, ép nó thành mảng
        if ($this->hasFile('Images') && !is_array($this->file('Images'))) {
            $this->merge([
                'Images' => [$this->file('Images')] // ép thành mảng 1 phần tử
            ]);
        }
    }
    

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'CategoryID' => 'required|exists:platformcategories,CategoryID',
            'Name' => 'required|string|max:255',
            'Description' => 'nullable|string',
            'Discount' => 'required|integer|min:0|max:100',
            
            // Validation cho file ảnh
            'Images' => 'nullable|array|max:9',
            'Images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048', 
            
            // Validation cho metadata ảnh (đã được chuyển thành mảng)
            'ImageData' => 'required|array',
            'ImageData.*.IsPrimary' => 'required|boolean',
            'ImageData.*.SortOrder' => 'required|integer',

            // Validation cho sản phẩm có phân loại (đã được chuyển thành mảng)
            'Variants' => 'nullable|array', 
            'Variants.*.AttributeValues' => 'present|array',
            'Variants.*.AttributeValues.*.AttributeID' => 'required|exists:attributes,AttributeID',
            'Variants.*.AttributeValues.*.Value' => 'required|string|max:255',
            'Variants.*.SKU' => 'nullable|string|max:100',
            'Variants.*.Price' => 'required|integer|min:0',
            'Variants.*.StockQuantity' => 'required|integer|min:0',
            'Variants.*.Discount' => 'required|integer|min:0|max:100',

            // Validation cho sản phẩm không có phân loại
            'SKU' => 'required_without:Variants|nullable|string|max:100',
            'Price' => 'required_without:Variants|integer|min:0',
            'StockQuantity' => 'required_without:Variants|integer|min:0',
        ];
    }
}