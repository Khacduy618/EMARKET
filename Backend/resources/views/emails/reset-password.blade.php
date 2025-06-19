<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            margin: 0;
            padding: 0;
        }
        .container {
            background-color: #f3f4f6;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        }
        .card {
            max-width: 28rem;
            width: 100%;
            background-color: white;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            padding: 2rem;
        }
        .title {
            font-size: 1.5rem;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 1.5rem;
        }
        .message {
            color: #4b5563;
            margin-bottom: 1.5rem;
        }
        .button-container {
            display: flex;
            justify-content: center;
            margin-bottom: 1.5rem;
        }
        .reset-button {
            background-color: #3b82f6;
            color: white;
            font-weight: 600;
            padding: 0.5rem 1.5rem;
            border-radius: 0.5rem;
            text-decoration: none;
            transition: background-color 0.3s;
        }
        .reset-button:hover {
            background-color: #2563eb;
        }
        .note {
            color: #6b7280;
            font-size: 0.875rem;
            margin-bottom: 1.5rem;
        }
        .signature {
            color: #4b5563;
            font-size: 0.875rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1 class="title">Đặt lại mật khẩu</h1>

            <p class="message">
                Bạn đã yêu cầu đặt lại mật khẩu. Bấm vào nút bên dưới để tiếp tục:
            </p>

            <div class="button-container">
                <a href="{{ $url }}" class="reset-button">
                    Đặt lại mật khẩu
                </a>
            </div>

            <p class="note">
                Nếu bạn không yêu cầu, hãy bỏ qua email này.
            </p>

            <div class="signature">
                Thanks,<br>
                {{ config('app.name') }}
            </div>
        </div>
    </div>
</body>
</html>
