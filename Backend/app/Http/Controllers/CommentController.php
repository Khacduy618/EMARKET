<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\Product;

class CommentController extends Controller
{
    /**
     * Lấy danh sách bình luận đã được sắp xếp theo dạng cha-con.
     */
    public function index($productId)
    {
        // Kiểm tra sản phẩm có tồn tại không
        if (!Product::where('ProductID', $productId)->exists()) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        // Lấy tất cả bình luận của sản phẩm, join với user để lấy thông tin người đăng
        $comments = DB::table('productcomment as c')
            ->join('users as u', 'c.UserID', '=', 'u.UserID')
            ->where('c.ProductID', $productId)
            ->where('c.IsApproved', 1) // Chỉ lấy các bình luận đã được duyệt
            ->select(
                'c.CommentID as id',
                'c.ParentCommentID as parentId',
                'c.Comment as content',
                'c.CreatedAt as createdAt',
                'u.UserID as userId',
                'u.FullName as name',
                'u.Avatar as avatar'
            )
            ->orderBy('c.CreatedAt', 'desc') // Sắp xếp để bình luận mới nhất lên đầu
            ->get();

        // Xử lý để tạo cấu trúc lồng nhau (nested)
        $nestedComments = $this->buildTree($comments->toArray());

        return response()->json($nestedComments);
    }

    /**
     * Lưu một bình luận mới.
     */
    public function store(Request $request, $productId)
    {
        $request->validate([
            'content' => 'required|string|max:1000',
            'parentId' => 'nullable|integer|exists:productcomment,CommentID',
        ]);

        $user = Auth::user();

        $commentId = DB::table('productcomment')->insertGetId([
            'ProductID' => $productId,
            'UserID' => $user->UserID,
            'ParentCommentID' => $request->input('parentId'),
            'Comment' => $request->input('content'),
            'IsApproved' => 1, // Mặc định là đã duyệt, hoặc 0 nếu bạn muốn có hệ thống duyệt
            'CreatedAt' => now(),
            'UpdatedAt' => now(),
        ]);

        // Lấy lại bình luận vừa tạo để trả về cho client (bao gồm cả thông tin user)
        $newComment = DB::table('productcomment as c')
            ->join('users as u', 'c.UserID', '=', 'u.UserID')
            ->where('c.CommentID', $commentId)
            ->select(
                'c.CommentID as id',
                'c.ParentCommentID as parentId',
                'c.Comment as content',
                'c.CreatedAt as createdAt',
                'u.UserID as userId',
                'u.FullName as name',
                'u.Avatar as avatar'
            )
            ->first();

        return response()->json($newComment, 201);
    }

    /**
     * Hàm helper để xây dựng cây bình luận từ danh sách phẳng.
     */
    private function buildTree(array $elements, $parentId = null) {
        $branch = [];

        foreach ($elements as $element) {
            // Chuyển đổi object từ DB sang mảng để dễ xử lý
            $elementArray = (array)$element;
            if ($elementArray['parentId'] == $parentId) {
                $children = $this->buildTree($elements, $elementArray['id']);
                if ($children) {
                    // Sắp xếp các con theo thời gian cũ nhất trước
                    usort($children, function($a, $b) {
                        return strtotime($a['createdAt']) - strtotime($b['createdAt']);
                    });
                    $elementArray['replies'] = $children;
                } else {
                    $elementArray['replies'] = [];
                }
                $branch[] = $elementArray;
            }
        }
        return $branch;
    }
}