<?php

// namespace App\Http\Controllers;

// use App\Http\Controllers\Controller;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\DB;
// use Illuminate\Support\Facades\Auth;
// use App\Models\Product;

// class CommentController extends Controller
// {
//     /**
//      * Lấy danh sách bình luận đã được sắp xếp theo dạng cha-con.
//      */
//     public function index($productId)
//     {
//         // Kiểm tra sản phẩm có tồn tại không
//         if (!Product::where('ProductID', $productId)->exists()) {
//             return response()->json(['message' => 'Product not found'], 404);
//         }

//         // Lấy tất cả bình luận của sản phẩm, join với user để lấy thông tin người đăng
//         $comments = DB::table('productcomment as c')
//             ->join('users as u', 'c.UserID', '=', 'u.UserID')
//             ->where('c.ProductID', $productId)
//             ->where('c.IsApproved', 1) // Chỉ lấy các bình luận đã được duyệt
//             ->select(
//                 'c.CommentID as id',
//                 'c.ParentCommentID as parentId',
//                 'c.Comment as content',
//                 'c.CreatedAt as createdAt',
//                 'u.UserID as userId',
//                 'u.FullName as name',
//                 'u.Avatar as avatar'
//             )
//             ->orderBy('c.CreatedAt', 'desc') // Sắp xếp để bình luận mới nhất lên đầu
//             ->get();

//         // Xử lý để tạo cấu trúc lồng nhau (nested)
//         $nestedComments = $this->buildTree($comments->toArray());

//         return response()->json($nestedComments);
//     }

//     /**
//      * Lưu một bình luận mới.
//      */
//     public function store(Request $request, $productId)
//     {
//         $request->validate([
//             'content' => 'required|string|max:1000',
//             'parentId' => 'nullable|integer|exists:productcomment,CommentID',
//         ]);

//         $user = Auth::user();

//         $commentId = DB::table('productcomment')->insertGetId([
//             'ProductID' => $productId,
//             'UserID' => $user->UserID,
//             'ParentCommentID' => $request->input('parentId'),
//             'Comment' => $request->input('content'),
//             'IsApproved' => 1, // Mặc định là đã duyệt, hoặc 0 nếu bạn muốn có hệ thống duyệt
//             'CreatedAt' => now(),
//             'UpdatedAt' => now(),
//         ]);

//         // Lấy lại bình luận vừa tạo để trả về cho client (bao gồm cả thông tin user)
//         $newComment = DB::table('productcomment as c')
//             ->join('users as u', 'c.UserID', '=', 'u.UserID')
//             ->where('c.CommentID', $commentId)
//             ->select(
//                 'c.CommentID as id',
//                 'c.ParentCommentID as parentId',
//                 'c.Comment as content',
//                 'c.CreatedAt as createdAt',
//                 'u.UserID as userId',
//                 'u.FullName as name',
//                 'u.Avatar as avatar'
//             )
//             ->first();

//         return response()->json($newComment, 201);
//     }

//     /**
//      * Hàm helper để xây dựng cây bình luận từ danh sách phẳng.
//      */
//     private function buildTree(array $elements, $parentId = null) {
//         $branch = [];

//         foreach ($elements as $element) {
//             // Chuyển đổi object từ DB sang mảng để dễ xử lý
//             $elementArray = (array)$element;
//             if ($elementArray['parentId'] == $parentId) {
//                 $children = $this->buildTree($elements, $elementArray['id']);
//                 if ($children) {
//                     // Sắp xếp các con theo thời gian cũ nhất trước
//                     usort($children, function($a, $b) {
//                         return strtotime($a['createdAt']) - strtotime($b['createdAt']);
//                     });
//                     $elementArray['replies'] = $children;
//                 } else {
//                     $elementArray['replies'] = [];
//                 }
//                 $branch[] = $elementArray;
//             }
//         }
//         return $branch;
//     }
// }

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\Product;
use App\Models\ProductComment;
//
class CommentController extends Controller
{
    /**
     * Lấy danh sách bình luận đã được sắp xếp.
     */
    public function index($productId)
    {
        if (!Product::where('ProductID', $productId)->exists()) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $userId = Auth::id() ?? 0;

        $comments = DB::table('productcomment as c')
            ->join('users as u', 'c.UserID', '=', 'u.UserID')
            ->where('c.ProductID', $productId)
            ->where('c.IsApproved', 1)
            ->select(
                'c.CommentID as id',
                'c.ParentCommentID as parentId',
                'c.Comment as content',
                'c.CreatedAt as createdAt',
                'u.UserID as userId',
                'u.FullName as name',
                'u.Avatar as avatar',
                DB::raw('JSON_LENGTH(COALESCE(likes, "[]")) as likesCount'),
                DB::raw('JSON_LENGTH(COALESCE(dislikes, "[]")) as dislikesCount'),
                DB::raw("CASE WHEN JSON_CONTAINS(likes, '$userId', '$') THEN 'like' WHEN JSON_CONTAINS(dislikes, '$userId', '$') THEN 'dislike' ELSE NULL END as currentUserInteraction")
            )
            ->orderBy('c.CreatedAt', 'desc')
            ->get();

        return response()->json($this->buildTree($comments->toArray()));
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

        $comment = ProductComment::create([
            'ProductID' => $productId,
            'UserID' => Auth::id(),
            'ParentCommentID' => $request->input('parentId'),
            'Comment' => $request->input('content'),
            'IsApproved' => 1,
        ]);

        $newCommentData = $this->getCommentData($comment->CommentID);
        return response()->json($newCommentData, 201);
    }

    /**
     * Cập nhật một bình luận.
     */
    public function update(Request $request, ProductComment $comment)
    {
        if ($request->user()->UserID !== $comment->UserID) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $request->validate(['content' => 'required|string|max:1000']);
        $comment->Comment = $request->input('content');
        $comment->save();

        $updatedCommentData = $this->getCommentData($comment->CommentID);
        return response()->json($updatedCommentData);
    }

    /**
     * (ĐÃ CẬP NHẬT) Xóa một bình luận (xóa vĩnh viễn - hard delete).
     * Sẽ xóa cả bình luận cha và tất cả các bình luận con của nó.
     */
    public function destroy(Request $request, ProductComment $comment)
    {
        if ($request->user()->UserID !== $comment->UserID) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Dùng một hàm đệ quy để xóa tất cả các bình luận con cháu
        $this->deleteCommentAndReplies($comment);

        return response()->json(null, 204); // 204 No Content - Xóa thành công
    }

    /**
     * Xử lý like/dislike.
     */
    public function handleInteraction(Request $request, ProductComment $comment)
    {
        $request->validate(['type' => 'required|in:like,dislike']);
        $userId = $request->user()->UserID;
        $type = $request->input('type');

        $likes = $comment->likes ?? [];
        $dislikes = $comment->dislikes ?? [];

        $removeId = fn($arr, $id) => array_values(array_filter($arr, fn($v) => $v != $id));

        if ($type === 'like') {
            $dislikes = $removeId($dislikes, $userId);
            if (in_array($userId, $likes)) {
                $likes = $removeId($likes, $userId);
            } else {
                $likes[] = $userId;
            }
        } else {
            $likes = $removeId($likes, $userId);
            if (in_array($userId, $dislikes)) {
                $dislikes = $removeId($dislikes, $userId);
            } else {
                $dislikes[] = $userId;
            }
        }
        $comment->likes = $likes;
        $comment->dislikes = $dislikes;
        $comment->save();
        return response()->json(['status' => 'success']);
    }

    /**
     * Hàm helper để xây dựng cây bình luận từ danh sách phẳng.
     */
    private function buildTree(array $elements, $parentId = null) {
        $branch = [];
        foreach ($elements as $element) {
            $elementArray = (array)$element;
            if ($elementArray['parentId'] == $parentId) {
                $children = $this->buildTree($elements, $elementArray['id']);
                if ($children) {
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

    /**
     * Hàm helper để lấy dữ liệu chi tiết của một bình luận.
     */
    private function getCommentData($commentId) {
        $userId = Auth::id() ?? 0;
        return DB::table('productcomment as c')
            ->join('users as u', 'c.UserID', '=', 'u.UserID')
            ->where('c.CommentID', $commentId)
            ->select(
                'c.CommentID as id', 'c.ParentCommentID as parentId', 'c.Comment as content',
                'c.CreatedAt as createdAt', 'u.UserID as userId', 'u.FullName as name', 'u.Avatar as avatar',
                DB::raw('JSON_LENGTH(COALESCE(likes, "[]")) as likesCount'),
                DB::raw('JSON_LENGTH(COALESCE(dislikes, "[]")) as dislikesCount'),
                DB::raw("CASE WHEN JSON_CONTAINS(likes, '$userId', '$') THEN 'like' WHEN JSON_CONTAINS(dislikes, '$userId', '$') THEN 'dislike' ELSE NULL END as currentUserInteraction")
            )->first();
    }

    /**
     * (HÀM MỚI) Hàm helper đệ quy để xóa một bình luận và tất cả các câu trả lời của nó.
     */
    private function deleteCommentAndReplies(ProductComment $comment)
    {
        // Lấy tất cả các câu trả lời trực tiếp của bình luận hiện tại
        $replies = $comment->replies()->get();

        // Với mỗi câu trả lời, gọi lại chính hàm này để xóa các con của nó trước
        foreach ($replies as $reply) {
            $this->deleteCommentAndReplies($reply);
        }

        // Sau khi tất cả các con cháu đã được xóa, xóa chính bình luận này
        $comment->delete();
    }
}