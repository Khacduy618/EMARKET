"use client";

import { useState, useMemo, useCallback, useEffect, Fragment } from 'react';
import useSWR from 'swr';
import { useDebounce } from 'use-debounce';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';

// Components
import ConfirmModal from './components/ConfirmModal';
import UserFormModal from './components/UserFormModal';

// Services và Types
import {
    getUsers,
    updateUserStatus,
    deleteUser as apiDeleteUser,
    bulkUpdateUserStatus,
    bulkDeleteUsers,
    adminDisableTwoFactor,
    bulkDisable2FA
} from '@/services/admin';
import { User, PaginatedResponse } from '@/types';

// Icons
import {
    Search, ChevronLeft, ChevronRight, PlusCircle,
    Edit, UserX, ToggleRight, ShieldOff, X,
    ChevronDown, ChevronUp
} from 'lucide-react';
import RoleGuard from '@/app/components/auth/RoleGuard';

// ===================================================================
// =                  Component: Hàng Chi tiết                         =
// ===================================================================
const UserDetailRow = ({ user }: { user: User }) => (
    <tr className="bg-gray-50">
        <td colSpan={9} className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="font-semibold text-gray-500">Ngày tạo:</span> {new Date(user.CreatedAt).toLocaleDateString('vi-VN')}</div>
                <div><span className="font-semibold text-gray-500">Cập nhật:</span> {new Date(user.UpdatedAt).toLocaleDateString('vi-VN')}</div>
                <div><span className="font-semibold text-gray-500">SĐT:</span> {user.Phone || 'Chưa cập nhật'}</div>
                <div><span className="font-semibold text-gray-500">Cấp độ:</span> {user.Level}</div>
            </div>
        </td>
    </tr>
);

// ===================================================================
// =                  Component: Một hàng trong bảng                  =
// ===================================================================
const UserRow = ({
    user, isCurrentUser, isSelected, isExpanded,
    onSelect, onToggleDetail, onEdit, onConfirmStatusChange, onConfirmRemove, onConfirmDisable2FA
}: {
    user: User; isCurrentUser: boolean; isSelected: boolean; isExpanded: boolean;
    onSelect: (userId: number) => void; onToggleDetail: () => void;
    onEdit: () => void; onConfirmStatusChange: () => void;
    onConfirmRemove: () => void; onConfirmDisable2FA: () => void;
}) => (
    <Fragment>
        <tr className={`border-b text-sm transition-colors ${isCurrentUser ? 'bg-indigo-50 font-semibold' : 'hover:bg-gray-50'} ${isSelected ? 'bg-blue-50' : ''}`}>
            <td className="p-3 text-center w-12"><button onClick={onToggleDetail} className="p-1 rounded-full hover:bg-gray-200">{isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button></td>
            <td className="p-3 text-center w-12">{!isCurrentUser && <input type="checkbox" checked={isSelected} onChange={() => onSelect(user.UserID)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />}</td>
            <td className="p-3 text-gray-500">{user.UserID}</td>
            <td className="p-3 font-medium text-gray-800">{user.FullName}</td>
            <td className="p-3 text-gray-600">{user.Email}</td>
            <td className="p-3 text-gray-600">{user.Role}</td>
            <td className="p-3 text-center">{user.two_factor_enabled ? <span title="Đã bật 2FA" className="text-green-500 font-bold">✓</span> : <span title="Chưa bật 2FA" className="text-gray-400">-</span>}</td>
            <td className="p-3 text-center">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.IsActive ? 'Hoạt động' : 'Vô hiệu'}</span>
            </td>
            <td className="p-3">
                <div className="flex items-center gap-3">
                    <button onClick={onConfirmStatusChange} title={user.IsActive ? "Vô hiệu hóa" : "Kích hoạt"} disabled={isCurrentUser} className="text-gray-500 hover:text-yellow-600 disabled:text-gray-300 disabled:cursor-not-allowed"><ToggleRight size={20} /></button>
                    <button onClick={onEdit} title="Chỉnh sửa" disabled={isCurrentUser} className="text-gray-500 hover:text-indigo-600 disabled:text-gray-300 disabled:cursor-not-allowed"><Edit size={16} /></button>
                    {user.two_factor_enabled && (<button onClick={onConfirmDisable2FA} title="Tắt 2FA" disabled={isCurrentUser} className="text-gray-500 hover:text-orange-600 disabled:text-gray-300 disabled:cursor-not-allowed"><ShieldOff size={16} /></button>)}
                    <button onClick={onConfirmRemove} title="Xóa / Vô hiệu hóa" disabled={isCurrentUser} className="text-gray-500 hover:text-red-600 disabled:text-gray-300 disabled:cursor-not-allowed"><UserX size={16} /></button>
                </div>
            </td>
        </tr>
        {isExpanded && <UserDetailRow user={user} />}
    </Fragment>
);

// ===================================================================
// =               Component: Thanh hành động hàng loạt                =
// ===================================================================
const BulkActionBar = ({ selectedCount, canActivate, canDeactivate, onClear, onActivate, onDeactivate, onDisable2FA, onDelete }: { selectedCount: number; canActivate: boolean; canDeactivate: boolean; onClear: () => void; onActivate: () => void; onDeactivate: () => void; onDisable2FA: () => void; onDelete: () => void; }) => (
    <div className="flex items-center justify-between p-3 bg-indigo-600 text-white rounded-md mb-4 shadow-lg animate-fade-in-up">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <span className="font-semibold">{selectedCount} đã chọn</span>
            {canActivate && <button onClick={onActivate} className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 rounded">Kích hoạt</button>}
            {canDeactivate && <button onClick={onDeactivate} className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 rounded">Vô hiệu hóa</button>}
            <button onClick={onDisable2FA} className="px-3 py-1 text-sm bg-orange-500 hover:bg-orange-600 rounded">Tắt 2FA</button>
            <button onClick={onDelete} className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 rounded">Xóa / Vô hiệu hóa</button>
        </div>
        <button onClick={onClear} title="Bỏ chọn" className="p-1 hover:bg-white/20 rounded-full"><X size={20} /></button>
    </div>
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
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [expandedUserIds, setExpandedUserIds] = useState<number[]>([]);

    const swrKey = useMemo(() => {
        const params = new URLSearchParams({ page: page.toString() });
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (roleFilter) params.set('role', roleFilter);
        if (statusFilter) params.set('status', statusFilter);
        return `/admin/users?${params.toString()}`;
    }, [page, debouncedSearch, roleFilter, statusFilter]);

    const { data: response, error, isLoading, mutate } = useSWR(swrKey, getUsers);

    useEffect(() => { setSelectedUserIds([]); }, [response]);

    const handleSelectUser = (userId: number) => setSelectedUserIds(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => setSelectedUserIds(e.target.checked ? response?.data.filter(u => u.UserID !== currentUser?.UserID).map(u => u.UserID) || [] : []);
    const handleToggleDetail = (userId: number) => setExpandedUserIds(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);

    const handleAddUser = () => { setEditingUser(null); setIsUserModalOpen(true); };
    const handleEditUser = (user: User) => {
        if (currentUser?.UserID === user.UserID) { toast.warn("Không thể tự chỉnh sửa tài khoản."); return; }
        setEditingUser(user); setIsUserModalOpen(true);
    };

    const selectedUsers = useMemo(() => response?.data.filter(user => selectedUserIds.includes(user.UserID)) || [], [selectedUserIds, response]);
    const canActivateSelected = useMemo(() => selectedUsers.length > 0 && selectedUsers.some(user => !user.IsActive), [selectedUsers]);
    const canDeactivateSelected = useMemo(() => selectedUsers.length > 0 && selectedUsers.some(user => user.IsActive), [selectedUsers]);

    const openStatusChangeConfirm = (user: User) => {
        const newStatus = !user.IsActive;
        const actionText = newStatus ? "kích hoạt" : "vô hiệu hóa";
        setConfirmAction({
            action: async () => { await updateUserStatus(user.UserID, newStatus); toast.success(`Đã ${actionText} tài khoản.`); mutate(); },
            title: `Xác nhận ${actionText}`, message: `Bạn có chắc muốn ${actionText} tài khoản "${user.FullName}"?`, variant: newStatus ? 'info' : 'danger'
        });
    };

    const openRemoveConfirm = (userToRemove: User) => {
        setConfirmAction({
            action: async () => {
                const res: any = await apiDeleteUser(userToRemove.UserID);
                toast.info(res.message || "Hành động thành công.");
                mutate();
            },
            title: 'Xác nhận Xóa / Vô hiệu hóa', message: `Bạn sắp thực hiện hành động trên tài khoản "${userToRemove.FullName}". Hành động này không thể hoàn tác. Tiếp tục?`, variant: 'danger'
        });
    }

    const openDisable2FAConfirm = (userToUpdate: User) => {
        setConfirmAction({
            action: async () => {
                await adminDisableTwoFactor(userToUpdate.UserID);
                toast.success(`Đã tắt 2FA cho tài khoản "${userToUpdate.FullName}".`);
                mutate();
            },
            title: 'Xác nhận Tắt 2FA', message: `Bạn có chắc muốn tắt 2FA cho người dùng "${userToUpdate.FullName}"?`, variant: 'danger'
        });
    }

    const handleBulkActivate = () => {
        const ids = selectedUsers.filter(u => !u.IsActive).map(u => u.UserID);
        if (ids.length === 0) { toast.info("Không có tài khoản nào cần kích hoạt."); return; }
        setConfirmAction({
            action: async () => { await bulkUpdateUserStatus(ids, true); toast.success(`Đã kích hoạt ${ids.length} tài khoản.`); setSelectedUserIds([]); mutate(); },
            title: `Kích hoạt hàng loạt`, message: `Bạn có chắc muốn kích hoạt ${ids.length} tài khoản đã chọn?`, variant: 'info'
        });
    }

    const handleBulkDeactivate = () => {
        const ids = selectedUsers.filter(u => u.IsActive).map(u => u.UserID);
        if (ids.length === 0) { toast.info("Không có tài khoản nào cần vô hiệu hóa."); return; }
        setConfirmAction({
            action: async () => { await bulkUpdateUserStatus(ids, false); toast.success(`Đã vô hiệu hóa ${ids.length} tài khoản.`); setSelectedUserIds([]); mutate(); },
            title: `Vô hiệu hóa hàng loạt`, message: `Bạn có chắc muốn vô hiệu hóa ${ids.length} tài khoản đã chọn?`, variant: 'danger'
        });
    }

    const handleBulkDisable2FA = () => {
        setConfirmAction({
            action: async () => { await bulkDisable2FA(selectedUserIds); toast.success(`Đã tắt 2FA cho ${selectedUserIds.length} tài khoản.`); setSelectedUserIds([]); mutate(); },
            title: `Tắt 2FA hàng loạt`, message: `Bạn có chắc muốn tắt 2FA cho ${selectedUserIds.length} tài khoản đã chọn?`, variant: 'danger'
        });
    };

    const handleBulkDelete = () => {
        setConfirmAction({
            action: async () => { const res = await bulkDeleteUsers(selectedUserIds); toast.info(res.message); setSelectedUserIds([]); mutate(); },
            title: `Xóa / Vô hiệu hóa hàng loạt`, message: `Hành động này sẽ áp dụng trên ${selectedUserIds.length} tài khoản. Tài khoản có dữ liệu sẽ bị vô hiệu hóa, tài khoản "sạch" sẽ bị xóa vĩnh viễn. Tiếp tục?`, variant: 'danger'
        });
    };

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Người dùng</h1>
                <button onClick={handleAddUser} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm">
                    <PlusCircle size={18} /> <span className="text-sm font-semibold">Thêm Mới</span>
                </button>
            </div>

            {selectedUserIds.length > 0 && <BulkActionBar selectedCount={selectedUserIds.length} canActivate={canActivateSelected} canDeactivate={canDeactivateSelected} onClear={() => setSelectedUserIds([])} onActivate={handleBulkActivate} onDeactivate={handleBulkDeactivate} onDelete={handleBulkDelete} onDisable2FA={handleBulkDisable2FA} />}

            <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative md:col-span-2"><input type="text" placeholder="Tìm theo tên, email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full p-2 pl-10 border rounded-md" /><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /></div>
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full p-2 border rounded-md bg-white"><option value="">Tất cả vai trò</option><option value="Admin">Admin</option><option value="Seller">Seller</option><option value="Buyer">Buyer</option></select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full p-2 border rounded-md bg-white"><option value="">Tất cả trạng thái</option><option value="active">Hoạt động</option><option value="inactive">Vô hiệu</option></select>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                    <thead className="bg-gray-50">
                        <tr className="border-b">
                            <th className="p-3 w-12"></th>
                            <th className="p-3 w-12"><input type="checkbox" onChange={handleSelectAll} checked={response ? selectedUserIds.length === response.data.filter(u => u.UserID !== currentUser?.UserID).length && response.data.length > 0 : false} disabled={!response || response.data.filter(u => u.UserID !== currentUser?.UserID).length === 0} /></th>
                            <th className="text-left p-3 font-semibold text-gray-600 text-sm">ID</th>
                            <th className="text-left p-3 font-semibold text-gray-600 text-sm">Người dùng</th>
                            <th className="text-left p-3 font-semibold text-gray-600 text-sm">Email</th>
                            <th className="text-left p-3 font-semibold text-gray-600 text-sm">Vai trò</th>
                            <th className="text-center p-3 font-semibold text-gray-600 text-sm">2FA</th>
                            <th className="text-center p-3 font-semibold text-gray-600 text-sm">Trạng thái</th>
                            <th className="text-left p-3 font-semibold text-gray-600 text-sm">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && <tr><td colSpan={9} className="p-8 text-center text-gray-500">Đang tải...</td></tr>}
                        {error && <tr><td colSpan={9} className="p-8 text-center text-red-500">Lỗi khi tải dữ liệu. Vui lòng thử lại.</td></tr>}
                        {response && response.data.map(user => <UserRow key={user.UserID} user={user} isCurrentUser={currentUser?.UserID === user.UserID} isSelected={selectedUserIds.includes(user.UserID)} isExpanded={expandedUserIds.includes(user.UserID)} onSelect={handleSelectUser} onToggleDetail={() => handleToggleDetail(user.UserID)} onEdit={() => handleEditUser(user)} onConfirmStatusChange={() => openStatusChangeConfirm(user)} onConfirmRemove={() => openRemoveConfirm(user)} onConfirmDisable2FA={() => openDisable2FAConfirm(user)} />)}
                        {!isLoading && response && response.data.length === 0 && <tr><td colSpan={9} className="p-8 text-center text-gray-500">Không tìm thấy người dùng nào khớp với tiêu chí.</td></tr>}
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
            <UserFormModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} userToEdit={editingUser} onSaveSuccess={() => mutate()} />
            {confirmAction && (<ConfirmModal isOpen={true} onClose={() => setConfirmAction(null)} onConfirm={async () => { try { await confirmAction.action(); } finally { setConfirmAction(null); } }} title={confirmAction.title} message={confirmAction.message} variant={confirmAction.variant} />)}
        </div>
    );
}

export default function AdminUsersPage() {
    return (<RoleGuard allowedRoles={['Admin']}><AdminUsersContent /></RoleGuard>);
}
