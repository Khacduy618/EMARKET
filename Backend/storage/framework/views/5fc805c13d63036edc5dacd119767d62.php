<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            background-color: #f3f4f6;
            font-family: system-ui, -apple-system, sans-serif;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 42rem;
            margin: 0 auto;
            padding: 2rem;
        }
        .card {
            background-color: white;
            padding: 2rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 1.5rem;
        }
        .text {
            color: #4b5563;
            margin-bottom: 1.5rem;
        }
        .button-container {
            text-align: center;
            margin-bottom: 2rem;
        }
        .button {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background-color: #2563eb;
            color: white;
            font-weight: 600;
            text-decoration: none;
            border-radius: 0.375rem;
            transition: background-color 0.3s;
        }
        .button:hover {
            background-color: #1d4ed8;
        }
        .small-text {
            color: #6b7280;
            font-size: 0.875rem;
            margin-bottom: 1.5rem;
        }
        .footer {
            color: #4b5563;
            font-size: 0.875rem;
            border-top: 1px solid #e5e7eb;
            padding-top: 1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1 class="title">Xác minh Email</h1>

            <p class="text">
                Cảm ơn bạn đã đăng ký tài khoản trên hệ thống của chúng tôi.
            </p>

            <p class="text">
                Vui lòng bấm nút bên dưới để xác minh email:
            </p>

            <div class="button-container">
                <a href="<?php echo e($url); ?>" class="button">
                    Xác minh Email
                </a>
            </div>

            <p class="small-text">
                Nếu bạn không đăng ký tài khoản, hãy bỏ qua email này.
            </p>

            <div class="footer">
                Thanks,<br>
                <?php echo e(config('app.name')); ?>

            </div>
        </div>
    </div>
</body>
</html>
<?php /**PATH /var/www/html/resources/views/emails/verify-email.blade.php ENDPATH**/ ?>