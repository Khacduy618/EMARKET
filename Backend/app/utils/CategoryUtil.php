<?php
namespace App\utils;

class CategoryUtil {
  public static function createTree(array $arr, $parentId = null) {
    $tree = [];

    foreach ($arr as $item) {
      if ($item['ParentCategoryID'] === $parentId) {
        $newItem = $item;

        $children = self::createTree($arr, $item['CategoryID']);

        if (count($children) > 0) {
          $newItem['children'] = $children;
        }

        $tree[] = $newItem; 
      }
    }

    return $tree;
  }

  public static function pagination($req, &$pagination, $totalRecords){
    if ($req->has('page')) {
      $pagination['currentPage'] = (int)$req->query('page');
      $pagination['skipRecords'] = ($pagination['currentPage'] - 1) * $pagination['limitItem'];
    }
    
    $pagination['totalPage'] = ceil($totalRecords / $pagination['limitItem']);
    
    }
}
