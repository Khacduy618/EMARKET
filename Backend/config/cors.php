<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'register'], // Giữ nguyên hoặc thêm '*' nếu cần

    'allowed_methods' => ['*'],
<<<<<<< HEAD
=======
    'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', '')),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
>>>>>>> 08bfe4a9 (test)

    // --- SỬA DÒNG NÀY ---  
         'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', '')),
    
             'allowed_origins_patterns' => [],
    
                 'allowed_headers' => ['*'],
    
                     'exposed_headers' => [],
    
                         'max_age' => 0,
    
                             'supports_credentials' => true,
                             ];





































