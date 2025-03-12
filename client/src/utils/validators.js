export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Email không hợp lệ. Vui lòng nhập đúng định dạng (ví dụ: example@mail.com).";
    return null; // null nghĩa là không có lỗi
}

export function validatePhone(phone) {
    const phoneRegex = /^(0[1-9][0-9]{8})$/; // Số điện thoại Việt Nam dạng 0xxxxxxxxx
    if (!phoneRegex.test(phone)) return "Số điện thoại không hợp lệ. Vui lòng nhập số 10 chữ số và bắt đầu bằng 0.";
    return null;
}

export function validateBirthdate(birthdate) {
    const birthdateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!birthdateRegex.test(birthdate)) {
        return "Ngày sinh không hợp lệ";
    }
    // Chuyển đổi chuỗi ngày sinh sang đối tượng Date
    const birthDateObj = new Date(birthdate);
    const currentDate = new Date();
    // Kiểm tra xem ngày sinh có lớn hơn ngày hiện tại không
    if (birthDateObj > currentDate) {
        return "Ngày sinh không hợp lệ. Ngày sinh phải nhỏ hơn hoặc bằng ngày hiện tại.";
    }
    return null;
}