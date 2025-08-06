<!-- resources/views/login.blade.php hoặc file view login.php -->
<form id="login-form">
     <?php echo csrf_field(); ?>
    <input type="email" name="email" id="email" required placeholder="Email">
    <input type="password" name="password" id="password" required placeholder="Mật khẩu">
    <button type="submit">Đăng nhập</button>
</form>

<script>
document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://localhost:8001/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok && data.token) {
        // ✅ Lưu token vào localStorage
        localStorage.setItem('auth_token', data.token);

        alert('Đăng nhập thành công!');
        // Chuyển hướng hoặc thực hiện logic tiếp theo
        window.location.href = '/dashboard'; // hoặc trang bạn muốn
    } else {
        alert(data.message || 'Đăng nhập thất bại!');
    }
});
</script>
<?php /**PATH /var/www/html/resources/views/auth/login.blade.php ENDPATH**/ ?>