<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Product; // Giả sử bạn có Eloquent Model cho Product
use App\Models\ProductVariant; // Model cho ProductVariant
use App\Models\Attribute; // Model cho Attribute
use App\Models\AttributeValue; // Model cho AttributeValue

class ProductController extends Controller
{
   /**
     * Lấy danh sách các biến thể sản phẩm và các tùy chọn thuộc tính khả dụng dựa trên các lựa chọn hiện tại.
     *
     * @param Request $request
     * @param int $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function filterVariants(Request $request, $productId)
    {
        $selectedAttributeValueIds = explode(',', $request->query('attribute_values', ''));
        // Loại bỏ các giá trị rỗng và chuyển sang kiểu int
        $selectedAttributeValueIds = array_filter(array_map('intval', $selectedAttributeValueIds));
        $numSelectedAttributes = count($selectedAttributeValueIds);

        // 1. Lấy tất cả các VariantID hợp lệ (active, in_stock) cho sản phẩm này
        // Đây là base set để tìm kiếm
        $baseValidVariantIds = ProductVariant::where('ProductID', $productId)
            ->where('IsActive', 1)
            ->where('StockQuantity', '>', 0)
            ->pluck('VariantID')
            ->toArray();

        if (empty($baseValidVariantIds)) {
            return response()->json([
                'success' => true,
                'message' => 'No active or in-stock variants found for this product.',
                'data' => [
                    'selected_product_id' => $productId,
                    'current_selected_attribute_value_ids' => $selectedAttributeValueIds,
                    'matching_variants_count' => 0,
                    'exact_matched_variant' => null,
                    'available_attributes_options' => []
                ]
            ]);
        }

        // 2. Tìm các VariantID khớp với TẤT CẢ các AttributeValueID đã chọn
        $query = DB::table('ProductVariants AS PV')
            ->select('PV.VariantID')
            ->join('ProductVariantAttribute AS PVA', 'PV.VariantID', '=', 'PVA.VariantID')
            ->where('PV.ProductID', $productId)
            ->where('PV.IsActive', 1)
            ->where('PV.StockQuantity', '>', 0);

        if ($numSelectedAttributes > 0) {
            $query->whereIn('PVA.AttributeValueID', $selectedAttributeValueIds)
                ->groupBy('PV.VariantID')
                ->havingRaw('COUNT(DISTINCT PVA.AttributeValueID) = ?', [$numSelectedAttributes]);
        } else {
            // Nếu không có thuộc tính nào được chọn, tất cả baseValidVariantIds đều là "matching_variants"
            $query->whereIn('PV.VariantID', $baseValidVariantIds);
        }

        $matchingVariantIds = $query->pluck('VariantID')->toArray();

        // Chuẩn bị dữ liệu trả về
        $exactMatchedVariant = null;

        if (empty($matchingVariantIds)) {
            // Không tìm thấy biến thể nào khớp với các lựa chọn hiện tại
            $matchingVariantsCount = 0;
            $availableAttributesOptions = $this->getAvailableAttributeOptions(
                $productId,
                $baseValidVariantIds, // Vẫn dựa vào các variant ban đầu để hiển thị các tùy chọn cơ bản
                $selectedAttributeValueIds
            );
        } else {
            // Lấy thông tin chi tiết của các biến thể khớp
            $matchingVariants = ProductVariant::with(['attributeValues.attribute'])
                ->whereIn('VariantID', $matchingVariantIds)
                ->get();

            $matchingVariantsCount = $matchingVariants->count();

            // Nếu chỉ có một biến thể khớp duy nhất và tất cả thuộc tính của nó đã được chọn
            if ($matchingVariantsCount === 1) {
                $variant = $matchingVariants->first();
                $variantAttributeValueIds = $variant->attributeValues->pluck('AttributeValueID')->toArray();

                // Kiểm tra xem tất cả các thuộc tính của variant đó có nằm trong selectedAttributeValueIds không
                // Điều này có nghĩa là người dùng đã chọn đầy đủ các thuộc tính để xác định một variant duy nhất
                if (count($selectedAttributeValueIds) === count($variantAttributeValueIds) &&
                    empty(array_diff($selectedAttributeValueIds, $variantAttributeValueIds)) &&
                    empty(array_diff($variantAttributeValueIds, $selectedAttributeValueIds))) {
                    $exactMatchedVariant = [
                        'variant_id' => $variant->VariantID,
                        'product_id' => $variant->ProductID,
                        'sku' => $variant->SKU,
                        'price' => $variant->Price,
                        'compare_at_price' => $variant->CompareAtPrice,
                        'stock_quantity' => $variant->StockQuantity,
                        'image_url' => $variant->ImageURL,
                        'attributes_display' => $variant->attributeValues->map(function($av) {
                            return [
                                'attribute_id' => $av->AttributeID,
                                'name' => $av->attribute->Name,
                                'value_id' => $av->AttributeValueID,
                                'value' => $av->Value
                            ];
                        })
                    ];
                }
            }

            // Lấy các tùy chọn thuộc tính khả dụng dựa trên CÁC BIẾN THỂ CÒN LẠI SAU KHI LỌC
            $availableAttributesOptions = $this->getAvailableAttributeOptions(
                $productId,
                $matchingVariantIds, // Giờ đây chỉ dựa vào các variant đã khớp
                $selectedAttributeValueIds
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Product variants and available options retrieved successfully.',
            'data' => [
                'selected_product_id' => $productId,
                'current_selected_attribute_value_ids' => $selectedAttributeValueIds,
                'matching_variants_count' => $matchingVariantsCount,
                'exact_matched_variant' => $exactMatchedVariant,
                'available_attributes_options' => $availableAttributesOptions
            ]
        ]);
    }

    /**
     * Hàm helper để lấy các tùy chọn thuộc tính khả dụng.
     *
     * @param int $productId
     * @param array $currentValidVariantIds Các VariantID còn khả năng được chọn (đã lọc theo các lựa chọn trước đó và tồn kho)
     * @param array $selectedAttributeValueIds Các AttributeValueID đã được chọn
     * @return array
     */
    private function getAvailableAttributeOptions($productId, array $currentValidVariantIds, array $selectedAttributeValueIds)
    {
        // 1. Lấy tất cả các Attribute (và AttributeValue) mà sản phẩm này có thể có
        $allProductAttributes = DB::table('Attributes AS A')
            ->select('A.AttributeID', 'A.Name AS AttributeName', 'AV.AttributeValueID', 'AV.Value AS AttributeValue')
            ->join('AttributeValues AS AV', 'A.AttributeID', '=', 'AV.AttributeID')
            ->join('ProductVariantAttribute AS PVA', 'AV.AttributeValueID', '=', 'PVA.AttributeValueID')
            ->join('ProductVariants AS PV', 'PVA.VariantID', '=', 'PV.VariantID')
            ->where('PV.ProductID', $productId)
            ->groupBy('A.AttributeID', 'A.Name', 'AV.AttributeValueID', 'AV.Value') // Group by all selected columns
            ->orderBy('A.AttributeID')
            ->get()
            ->groupBy('AttributeName'); // Nhóm theo tên thuộc tính để dễ xử lý

        $availableOptions = [];

        foreach ($allProductAttributes as $attributeName => $attributeValues) {
            $attributeId = $attributeValues->first()->AttributeID;
            $values = [];

            foreach ($attributeValues as $av) {
                $isAvailable = false;
                $reason = null;

                // Kiểm tra xem AttributeValue này có nằm trong bất kỳ currentValidVariantIds nào không
                $checkAvailability = DB::table('ProductVariantAttribute')
                    ->where('AttributeValueID', $av->AttributeValueID)
                    ->whereIn('VariantID', $currentValidVariantIds)
                    ->exists();

                if ($checkAvailability) {
                    $isAvailable = true;
                } else {
                    $reason = 'Không có biến thể nào còn hàng với lựa chọn hiện tại và giá trị này.';
                }

                $values[] = [
                    'attribute_value_id' => $av->AttributeValueID,
                    'value' => $av->AttributeValue,
                    'is_selected' => in_array($av->AttributeValueID, $selectedAttributeValueIds),
                    'is_available' => $isAvailable,
                    'reason' => $reason // Lý do không khả dụng (chỉ khi !is_available)
                ];
            }
            $availableOptions[] = [
                'attribute_id' => $attributeId,
                'attribute_name' => $attributeName,
                'values' => $values
            ];
        }

        return $availableOptions;
    }
}
