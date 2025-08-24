
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thông báo hoàn tiền</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #2c3e50;
            background-color: #f8fafc;
            padding: 20px 0;
        }
        
        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
            color: white;
            text-align: center;
            padding: 40px 20px;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
        }
        
        .success-icon {
            font-size: 48px;
            margin-bottom: 15px;
            display: block;
        }
        
        .header-title {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            position: relative;
            z-index: 1;
        }
        
        .header-subtitle {
            font-size: 16px;
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            margin-bottom: 25px;
            color: #2c3e50;
        }
        
        .greeting strong {
            color: #27ae60;
            font-weight: 600;
        }
        
        .message {
            font-size: 16px;
            line-height: 1.7;
            margin-bottom: 30px;
            color: #5a6c7d;
        }
        
        .divider {
            height: 2px;
            background: linear-gradient(90deg, #27ae60, #2ecc71, #27ae60);
            border: none;
            margin: 30px 0;
            border-radius: 1px;
        }
        
        .info-section {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
            border-left: 4px solid #27ae60;
        }
        
        .info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding: 10px 0;
        }
        
        .info-item:last-child {
            margin-bottom: 0;
        }
        
        .info-label {
            font-weight: 600;
            color: #2c3e50;
            flex: 1;
        }
        
        .info-value {
            font-weight: 700;
            color: #e74c3c;
            font-size: 18px;
            text-align: right;
        }
        
        .admin-note {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
        }
        
        .admin-note strong {
            color: #6c5ce7;
        }
        
        .proof-section {
            margin-top: 30px;
        }
        
        .proof-label {
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 15px;
            display: block;
        }
        
        .proof-container {
            text-align: center;
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            border: 2px dashed #ddd;
            transition: all 0.3s ease;
        }
        
        .proof-image {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
        }
        
        .proof-image:hover {
            transform: scale(1.02);
        }
        
        .footer {
            background-color: #2c3e50;
            color: #bdc3c7;
            text-align: center;
            padding: 30px 20px;
            font-size: 14px;
        }
        
        .footer p {
            margin-bottom: 10px;
        }
        
        .footer p:last-child {
            margin-bottom: 0;
            opacity: 0.7;
        }
        
        .brand-name {
            color: #27ae60;
            font-weight: 700;
        }
        
        @media only screen and (max-width: 600px) {
            .email-wrapper {
                margin: 0 10px;
                border-radius: 8px;
            }
            
            .header {
                padding: 30px 15px;
            }
            
            .header-title {
                font-size: 24px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .info-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 5px;
            }
            
            .info-value {
                text-align: left;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="header">
            <span class="success-icon">✅</span>
            <div class="header-title">Hoàn tiền thành công</div>
            <div class="header-subtitle">Giao dịch đã được xử lý hoàn tất</div>
        </div>
        
        <div class="content">
            <div class="greeting">
                Chào <strong><?php echo e($returnRequest->shop->ShopName); ?></strong>,
            </div>
            
            <div class="message">
                Admin đã xử lý và hoàn tất việc chuyển khoản hoàn tiền cho người mua 
                <strong><?php echo e($returnRequest->user->FullName); ?></strong> đối với yêu cầu có mã 
                <strong style="color: #6c5ce7;">#<?php echo e($returnRequest->RequestCode); ?></strong>.
            </div>
            
            <hr class="divider">
            
            <div class="info-section">
                <div class="info-item">
                    <span class="info-label">Số tiền hoàn:</span>
                    <span class="info-value"><?php echo e(number_format($returnRequest->RefundAmount, 0, ',', '.')); ?> đ</span>
                </div>
            </div>
            
            <?php if($returnRequest->AdminNote): ?>
                <div class="admin-note">
                    <strong>Ghi chú từ Admin:</strong><br>
                    <?php echo e($returnRequest->AdminNote); ?>

                </div>
            <?php endif; ?>
            
            <?php if($returnRequest->RefundTransactionProof): ?>
                <div class="proof-section">
                    <span class="proof-label">Bằng chứng chuyển khoản:</span>
                    <div class="proof-container">
                        <a href="<?php echo e(asset('storage/' . $returnRequest->RefundTransactionProof)); ?>" target="_blank" rel="noopener noreferrer">
                            <img src="<?php echo e(asset('storage/' . $returnRequest->RefundTransactionProof)); ?>" alt="Bằng chứng giao dịch" class="proof-image">
                        </a>
                    </div>
                </div>
            <?php endif; ?>
        </div>
        
        <div class="footer">
            <p>Đây là email tự động, vui lòng không trả lời.</p>
            <p>Cảm ơn bạn đã hợp tác với chúng tôi.</p>
            <p>&copy; <?php echo e(date('Y')); ?> <span class="brand-name">Emarket</span>. All rights reserved.</p>
        </div>
    </div>
</body>
</html>




<?php /**PATH /var/www/html/resources/views/emails/seller_refund_confirmation.blade.php ENDPATH**/ ?>