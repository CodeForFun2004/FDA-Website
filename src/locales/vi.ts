export const vi = {
  common: {
    save: 'Lưu',
    saveChanges: 'Lưu thay đổi',
    cancel: 'Hủy',
    close: 'Đóng',
    delete: 'Xóa',
    update: 'Cập nhật',
    create: 'Tạo mới',
    edit: 'Chỉnh sửa',
    refresh: 'Làm mới',
    loading: 'Đang tải',
    error: 'Lỗi',
    search: 'Tìm kiếm'
  },
  map: {
    layers: 'Lớp bản đồ'
  },
  station: {
    status: 'Trạng thái trạm',
    realtime: 'Thời gian thực'
  },
  validation: {
    codeMin2: 'Mã phải có ít nhất 2 ký tự.',
    nameMin2: 'Tên phải có ít nhất 2 ký tự.',
    required: 'Trường này là bắt buộc.'
  },
  errors: {
    authRequired: 'Cần đăng nhập. Vui lòng đăng nhập lại.',
    loadFailed: 'Không thể tải dữ liệu. Vui lòng thử lại.'
  }
} as const;
