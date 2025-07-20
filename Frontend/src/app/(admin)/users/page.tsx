"use client";

import { useState, useMemo, useCallback } from 'react';
import useSWR from 'swr';
import { useDebounce } from 'use-debounce';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';

// Components
// Services và Types
import { getUsers, updateUserStatus, deleteUser } from '@/services/admin';
import { User, PaginatedResponse } from '@/types';

// Icons
import { Search, ChevronLeft, ChevronRight, PlusCircle, Edit, UserX, ToggleLeft, ToggleRight } from 'lucide-react';
import RoleGuard from '@/app/components/auth/RoleGuard';
import ConfirmModal from './components/ConfirmModal';
import UserFormModal from './components/UserFormModal';

// ===================================================================
// =                  Component: Một hàng trong bảng                  =
// ===================================================================
const UserRow = ({
    user,
    onEdit,
    onConfirmStatusChange,
    onConfirmRemove, // Đổi tên cho đúng chức năng "Xóa/Vô hiệu hóa"
    isCurrentUser,
}: {
    user: User;
    onEdit: () => void;
    onConfirmStatusChange: () => void;
    onConfirmRemove: () => void;
    isCurrentUser: boolean;
}) => (
    <tr key={user.UserID} className={`border-b text-sm transition-colors ${isCurrentUser ? 'bg-indigo-50 font-semibold' : 'hover:bg-gray-50'}`}>
        <td className="p-3 text-gray-500">{user.UserID}</td>
        <td className="p-3 font-medium text-gray-800">{user.FullName}</td>
        <td className="p-3 text-gray-600">{user.Email}</td>
        <td className="p-3 text-gray-600">{user.Role}</td>
        <td className="p-3">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {user.IsActive ? 'Hoạt động' : 'Vô hiệu hóa'}
            </span>
        </td>
        <td className="p-3">
            <div className="flex items-center gap-3">
                <button onClick={onConfirmStatusChange} title={user.IsActive ? "Vô hiệu hóa" : "Kích hoạt"} disabled={isCurrentUser} className="text-gray-500 hover:text-green-600 disabled:text-gray-300 disabled:cursor-not-allowed">
                    {user.IsActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                </button>
                <button onClick={onEdit} title="Chỉnh sửa" disabled={isCurrentUser} className="text-gray-500 hover:text-indigo-600 disabled:text-gray-300 disabled:cursor-not-allowed">
                    <Edit size={16} />
                </button>
                <button onClick={onConfirmRemove} title="Xóa / Vô hiệu hóa tài khoản" disabled={isCurrentUser} className="text-gray-500 hover:text-red-600 disabled:text-gray-300 disabled:cursor-not-allowed">
                    <UserX size={16} />
                </button>
            </div>
        </td>
    </tr>
);

// ===================================================================
// =                   Component: Nội dung chính của trang             =
// ===================================================================
function AdminUsersContent() {
    const { user: currentUser } = useAuth();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [debouncedSearch] = useDebounce(search, 500);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ action: () => Promise<void>; title: string; message: string; variant: 'danger' | 'info' } | null>(null);

    const swrKey = useMemo(() => {
        const params = new URLSearchParams({ page: page.toString() });
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (roleFilter) params.set('role', roleFilter);
        if (statusFilter) params.set('status', statusFilter);
        return `/admin/users?${params.toString()}`;
    }, [page, debouncedSearch, roleFilter, statusFilter]);

    const { data: response, error, isLoading, mutate } = useSWR(swrKey, getUsers);

    const handleAddUser = () => { setEditingUser(null); setIsUserModalOpen(true); };
    const handleEditUser = (user: User) => {
        if (currentUser && currentUser.UserID === user.UserID) {
            toast.warn("Bạn không thể chỉnh sửa tài khoản của chính mình từ giao diện này.");
            return;
        }
        setEditingUser(user);
        setIsUserModalOpen(true);
    };

    const openStatusChangeConfirm = (user: User) => {
        const newStatus = !user.IsActive;
        const actionText = newStatus ? "kích hoạt" : "vô hiệu hóa";
        setConfirmAction({
            action: async () => {
                await updateUserStatus(user.UserID, newStatus);
                toast.success(`Đã ${actionText} tài khoản.`);
                mutate();
            },
            title: `Xác nhận ${actionText}`,
            message: `Bạn có chắc muốn ${actionText} tài khoản "${user.FullName}"?`,
            variant: newStatus ? 'info' : 'danger'
        });
    };

    // --- HÀM XÁC NHẬN "XÓA THÔNG MINH" ĐÃ SỬA LẠI ---
    const openRemoveConfirm = (userToRemove: User) => {
        setConfirmAction({
            action: async () => {
                const response: any = await deleteUser(userToRemove.UserID);
                // Backend trả về message khi vô hiệu hóa, hoặc không có gì khi xóa hẳn
                if (response && response.action === 'deactivated') {
                    toast.info(`Tài khoản "${userToRemove.FullName}" đã được vô hiệu hóa.`);
                } else {
                    toast.success(`Đã xóa vĩnh viễn tài khoản "${userToRemove.FullName}".`);
                }
                mutate();
            },
            title: 'Xác nhận Xóa / Vô hiệu hóa',
            message: `Bạn sắp xóa tài khoản "${userToRemove.FullName}". Nếu tài khoản này có dữ liệu liên quan (đơn hàng, shop), nó sẽ được vô hiệu hóa. Nếu không, nó sẽ bị xóa vĩnh viễn. Bạn có chắc chắn muốn tiếp tục?`,
            variant: 'danger'
        });
    }

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Người dùng</h1>
                <button onClick={handleAddUser} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm">
                    <PlusCircle size={18} /> <span className="text-sm font-semibold">Thêm Mới</span>
                </button>
            </div>

            <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative md:col-span-2">
                    <input type="text" placeholder="Tìm theo tên, email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full p-2 pl-10 border rounded-md" />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full p-2 border rounded-md bg-white">
                    <option value="">Tất cả vai trò</option>
                    <option value="Admin">Admin</option>
                    <option value="Seller">Seller</option>
                    <option value="Buyer">Buyer</option>
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full p-2 border rounded-md bg-white">
                    <option value="">Tất cả trạng thái</option>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Vô hiệu</option>
                </select>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50"><tr className="border-b"><th className="text-left p-3 font-semibold text-gray-600 text-sm">ID</th><th className="text-left p-3 font-semibold text-gray-600 text-sm">Người dùng</th><th className="text-left p-3 font-semibold text-gray-600 text-sm">Email</th><th className="text-left p-3 font-semibold text-gray-600 text-sm">Vai trò</th><th className="text-left p-3 font-semibold text-gray-600 text-sm">Trạng thái</th><th className="text-left p-3 font-semibold text-gray-600 text-sm">Hành động</th></tr></thead>
                    <tbody>
                        {isLoading && <tr><td colSpan={6} className="p-8 text-center text-gray-500">Đang tải...</td></tr>}
                        {error && <tr><td colSpan={6} className="p-8 text-center text-red-500">Lỗi khi tải dữ liệu. Vui lòng thử lại.</td></tr>}
                        {response && response.data.map(user => <UserRow key={user.UserID} user={user} isCurrentUser={currentUser?.UserID === user.UserID} onEdit={() => handleEditUser(user)} onConfirmStatusChange={() => openStatusChangeConfirm(user)} onConfirmRemove={() => openRemoveConfirm(user)} />)}
                        {!isLoading && response && response.data.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-500">Không tìm thấy người dùng nào khớp với tiêu chí.</td></tr>}
                    </tbody>
                </table>
                {response && response.total > response.per_page && (
                    <div className="p-4 flex justify-between items-center border-t text-sm text-gray-600">
                        <p>Hiển thị <strong>{response.from}</strong> đến <strong>{response.to}</strong> trong <strong>{response.total}</strong> kết quả</p>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!response.prev_page_url} className="p-2 border rounded-md disabled:opacity-50"><ChevronLeft size={16} /></button>
                            <button onClick={() => setPage(p => p + 1)} disabled={!response.next_page_url} className="p-2 border rounded-md disabled:opacity-50"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                )}
            </div>

            <UserFormModal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                userToEdit={editingUser}
                onSaveSuccess={() => mutate()}
            />
            {confirmAction && (
                <ConfirmModal
                    isOpen={true}
                    onClose={() => setConfirmAction(null)}
                    onConfirm={async () => {
                        try {
                            await confirmAction.action();
                        } finally {
                            setConfirmAction(null);
                        }
                    }}
                    title={confirmAction.title}
                    message={confirmAction.message}
                    variant={confirmAction.variant}
                />
            )}
        </div>
    )
}

export default function AdminUsersPage() {
    return (
        <RoleGuard allowedRoles={['Admin']}>
            <AdminUsersContent />
        </RoleGuard>
    );
}
