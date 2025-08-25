"use client";

import { useState, useMemo, useCallback, useEffect, Fragment } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { useDebounce } from 'use-debounce';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import ConfirmModal from './components/ConfirmModal';
import UserFormModal from './components/UserFormModal';
import {
    getUsers,
    updateUserStatus,
    deleteUser as apiDeleteUser,
    bulkUpdateUserStatus,
    bulkDeleteUsers,
    bulkDisable2FA,
    adminDisableTwoFactor,
    bulkUpdateUserRole
} from '@/services/admin';
import { User, PaginatedResponse } from '@/types';
import {
    Search, ChevronLeft, ChevronRight, PlusCircle,
    Edit, UserX, ToggleRight, ShieldOff, X,
    ChevronDown, ChevronUp
} from 'lucide-react';
import RoleGuard from '@/app/components/auth/RoleGuard';

const UserDetailRow = ({ user }: { user: User }) => (
    <tr className="bg-gray-50">
        <td colSpan={10} className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="font-semibold text-gray-500">Ngày tạo:</span> {new Date(user.CreatedAt).toLocaleDateString('vi-VN')}</div>
                <div><span className="font-semibold text-gray-500">Cập nhật:</span> {new Date(user.UpdatedAt).toLocaleDateString('vi-VN')}</div>
                <div><span className="font-semibold text-gray-500">SĐT:</span> {user.Phone || 'Chưa cập nhật'}</div>
                <div><span className="font-semibold text-gray-500">Cấp độ:</span> {user.Level}</div>
            </div>
        </td>
    </tr>
);

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
            <td className="p-3 text-center"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.IsActive ? 'Hoạt động' : 'Vô hiệu'}</span></td>
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

const BulkActionBar = ({ selectedCount, canActivate, canDeactivate, onClear, onActivate, onDeactivate, onUpdateRole, onDisable2FA, onDelete }: { selectedCount: number; canActivate: boolean; canDeactivate: boolean; onClear: () => void; onActivate: () => void; onDeactivate: () => void; onUpdateRole: (role: string) => void; onDisable2FA: () => void; onDelete: () => void; }) => {
    const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
    return (
        <div className="flex items-center justify-between p-3 bg-indigo-600 text-white rounded-md mb-4 shadow-lg animate-fade-in-up">
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                <span className="font-semibold">{selectedCount} đã chọn</span>
                {canActivate && <button onClick={onActivate} className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 rounded">Kích hoạt</button>}
                {canDeactivate && <button onClick={onDeactivate} className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 rounded">Vô hiệu hóa</button>}
                <div className="relative">
                    <button onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)} onBlur={() => setTimeout(() => setIsRoleMenuOpen(false), 200)} className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 rounded">Đổi vai trò <ChevronDown size={16} /></button>
                    {isRoleMenuOpen && (<div className="absolute top-full left-0 mt-1 bg-white text-gray-800 rounded-md shadow-lg z-10 w-32"><button onClick={() => { onUpdateRole('Buyer'); setIsRoleMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Thành Buyer</button><button onClick={() => { onUpdateRole('Seller'); setIsRoleMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Thành Seller</button><button onClick={() => { onUpdateRole('Admin'); setIsRoleMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Thành Admin</button></div>)}
                </div>
                <button onClick={onDisable2FA} className="px-3 py-1 text-sm bg-orange-500 hover:bg-orange-600 rounded">Tắt 2FA</button>
                <button onClick={onDelete} className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 rounded">Xóa</button>
            </div>
            <button onClick={onClear} title="Bỏ chọn" className="p-1 hover:bg-white/20 rounded-full"><X size={20} /></button>
        </div>
    );
};

function AdminUsersContent() {
    const { user: currentUser } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const page = Number(searchParams.get('page')) || 1;
    const searchInput = searchParams.get('search') || '';
    const roleFilter = searchParams.get('role') || '';
    const statusFilter = searchParams.get('status') || '';

    const [localSearch, setLocalSearch] = useState(searchInput);
    const [debouncedSearch] = useDebounce(localSearch, 500);
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [expandedUserIds, setExpandedUserIds] = useState<number[]>([]);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ action: () => Promise<void>; title: string; message: string; variant: 'danger' | 'info' } | null>(null);

    const updateUrlParams = useCallback((params: Record<string, string | number | null>) => {
        const current = new URLSearchParams(searchParams.toString());
        Object.entries(params).forEach(([key, value]) => {
            if (value) { current.set(key, String(value)); } else { current.delete(key); }
        });
        if (Object.keys(params).some(key => key !== 'page')) { current.set('page', '1'); }
        router.push(`${pathname}?${current.toString()}`);
    }, [searchParams, pathname, router]);

    useEffect(() => {
        if (debouncedSearch !== searchInput) { updateUrlParams({ search: debouncedSearch }); }
    }, [debouncedSearch, searchInput, updateUrlParams]);

    const swrKey = `/admin/users?${searchParams.toString()}`;
    const { data: response, error, isLoading, mutate } = useSWR(swrKey, getUsers);

    const handleSelectUser = (userId: number) => setSelectedUserIds(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
    const handleToggleDetail = (userId: number) => setExpandedUserIds(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
    const handleAddUser = () => { setEditingUser(null); setIsUserModalOpen(true); };
    const handleEditUser = (user: User) => {
        if (currentUser?.UserID === user.UserID) { toast.warn("Không thể tự chỉnh sửa tài khoản."); return; }
        setEditingUser(user); setIsUserModalOpen(true);
    };

    const availableUserIdsOnPage = useMemo(() => response?.data.filter(u => u.UserID !== currentUser?.UserID).map(u => u.UserID) || [], [response, currentUser]);
    const isAllOnPageSelected = useMemo(() => availableUserIdsOnPage.length > 0 && availableUserIdsOnPage.every(id => selectedUserIds.includes(id)), [availableUserIdsOnPage, selectedUserIds]);
    const handleSelectAllOnPage = () => {
        if (isAllOnPageSelected) { setSelectedUserIds(prev => prev.filter(id => !availableUserIdsOnPage.includes(id))); }
        else { setSelectedUserIds(prev => [...new Set([...prev, ...availableUserIdsOnPage])]); }
    };

    const selectedUsers = useMemo(() => response?.data.filter(user => selectedUserIds.includes(user.UserID)) || [], [selectedUserIds, response]);
    const canActivateSelected = useMemo(() => selectedUsers.length > 0 && selectedUsers.some(user => !user.IsActive), [selectedUsers]);
    const canDeactivateSelected = useMemo(() => selectedUsers.length > 0 && selectedUsers.some(user => user.IsActive), [selectedUsers]);

    const openStatusChangeConfirm = (user: User) => setConfirmAction({ action: async () => { await updateUserStatus(user.UserID, !user.IsActive); toast.success(`Đã ${!user.IsActive ? "kích hoạt" : "vô hiệu hóa"} tài khoản.`); mutate(); }, title: `Xác nhận ${!user.IsActive ? "Kích hoạt" : "Vô hiệu hóa"}`, message: `Bạn có chắc muốn ${!user.IsActive ? "kích hoạt" : "vô hiệu hóa"} tài khoản "${user.FullName}"?`, variant: !user.IsActive ? 'info' : 'danger' });
    const openRemoveConfirm = (user: User) => setConfirmAction({ action: async () => { const res: any = await apiDeleteUser(user.UserID); toast.info(res.message || "Hành động thành công."); mutate(); }, title: 'Xác nhận Xóa / Vô hiệu hóa', message: `Hành động này trên tài khoản "${user.FullName}" không thể hoàn tác. Tiếp tục?`, variant: 'danger' });
    const openDisable2FAConfirm = (user: User) => setConfirmAction({ action: async () => { await adminDisableTwoFactor(user.UserID); toast.success(`Đã tắt 2FA cho "${user.FullName}".`); mutate(); }, title: 'Xác nhận Tắt 2FA', message: `Bạn có chắc muốn tắt 2FA cho người dùng "${user.FullName}"?`, variant: 'danger' });

    const createBulkAction = (action: 'activate' | 'deactivate' | 'delete' | 'disable2fa' | 'updateRole', role?: string) => {
        const handlers = {
            activate: { getIds: () => selectedUsers.filter(u => !u.IsActive).map(u => u.UserID), apiCall: (ids: number[]) => bulkUpdateUserStatus(ids, true), title: "Kích hoạt", msg: "kích hoạt", variant: 'info' },
            deactivate: { getIds: () => selectedUsers.filter(u => u.IsActive).map(u => u.UserID), apiCall: (ids: number[]) => bulkUpdateUserStatus(ids, false), title: "Vô hiệu hóa", msg: "vô hiệu hóa", variant: 'danger' },
            disable2fa: { getIds: () => selectedUserIds, apiCall: bulkDisable2FA, title: "Tắt 2FA", msg: "tắt 2FA", variant: 'danger' },
            delete: { getIds: () => selectedUserIds, apiCall: bulkDeleteUsers, title: "Xóa / Vô hiệu hóa", msg: "xóa/vô hiệu hóa", variant: 'danger' },
            updateRole: { getIds: () => selectedUserIds, apiCall: (ids: number[]) => bulkUpdateUserRole(ids, role!), title: `Đổi vai trò thành ${role}`, msg: `đổi vai trò`, variant: 'info' }
        };
        const handler = handlers[action];
        const ids = handler.getIds();
        if (ids.length === 0) { toast.info(`Không có tài khoản nào phù hợp để ${handler.msg}.`); return; }
        setConfirmAction({
            action: async () => { const res: any = await handler.apiCall(ids); toast.success(res.message || `Đã ${handler.msg} ${ids.length} tài khoản.`); setSelectedUserIds([]); mutate(); },
            title: `${handler.title} hàng loạt`, message: `Bạn có chắc muốn ${handler.msg} ${ids.length} tài khoản đã chọn không?`, variant: handler.variant as 'danger' | 'info'
        });
    };

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Người dùng</h1>
                <button onClick={handleAddUser} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm"><PlusCircle size={18} /> <span className="text-sm font-semibold">Thêm Mới</span></button>
            </div>

            {selectedUserIds.length > 0 && <BulkActionBar selectedCount={selectedUserIds.length} canActivate={canActivateSelected} canDeactivate={canDeactivateSelected} onClear={() => setSelectedUserIds([])} onActivate={() => createBulkAction('activate')} onDeactivate={() => createBulkAction('deactivate')} onUpdateRole={(role) => createBulkAction('updateRole', role)} onDelete={() => createBulkAction('delete')} onDisable2FA={() => createBulkAction('disable2fa')} />}

            <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative md:col-span-2"><input type="text" placeholder="Tìm theo tên, email..." value={localSearch} onChange={e => setLocalSearch(e.target.value)} className="w-full p-2 pl-10 border rounded-md" /><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /></div>
                <select value={roleFilter} onChange={e => updateUrlParams({ role: e.target.value })} className="w-full p-2 border rounded-md bg-white"><option value="">Tất cả vai trò</option><option value="Admin">Admin</option><option value="Seller">Seller</option><option value="Buyer">Buyer</option></select>
                <select value={statusFilter} onChange={e => updateUrlParams({ status: e.target.value })} className="w-full p-2 border rounded-md bg-white"><option value="">Tất cả trạng thái</option><option value="active">Hoạt động</option><option value="inactive">Vô hiệu</option></select>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="w-full min-w-[1200px]">
                    <thead className="bg-gray-50"><tr className="border-b"><th className="p-3 w-12"></th><th className="p-3 w-12"><input type="checkbox" onChange={handleSelectAllOnPage} checked={isAllOnPageSelected} disabled={availableUserIdsOnPage.length === 0} /></th><th className="text-left p-3 font-semibold text-gray-600 text-sm w-16">ID</th><th className="text-left p-3 font-semibold text-gray-600 text-sm">Người dùng</th><th className="text-left p-3 font-semibold text-gray-600 text-sm">Email</th><th className="text-left p-3 font-semibold text-gray-600 text-sm w-24">Vai trò</th><th className="text-center p-3 font-semibold text-gray-600 text-sm w-16">2FA</th><th className="text-center p-3 font-semibold text-gray-600 text-sm w-32">Trạng thái</th><th className="text-left p-3 font-semibold text-gray-600 text-sm w-48">Hành động</th></tr></thead>
                    <tbody>
                        {isLoading && <tr><td colSpan={9} className="p-8 text-center text-gray-500">Đang tải...</td></tr>}
                        {error && <tr><td colSpan={9} className="p-8 text-center text-red-500">Lỗi khi tải dữ liệu. Vui lòng thử lại.</td></tr>}
                        {response && response.data.map(user => <UserRow key={user.UserID} user={user} isCurrentUser={currentUser?.UserID === user.UserID} isSelected={selectedUserIds.includes(user.UserID)} isExpanded={expandedUserIds.includes(user.UserID)} onSelect={handleSelectUser} onToggleDetail={() => handleToggleDetail(user.UserID)} onEdit={() => handleEditUser(user)} onConfirmStatusChange={() => openStatusChangeConfirm(user)} onConfirmRemove={() => openRemoveConfirm(user)} onConfirmDisable2FA={() => openDisable2FAConfirm(user)} />)}
                        {!isLoading && response && response.data.length === 0 && <tr><td colSpan={9} className="p-8 text-center text-gray-500">Không tìm thấy người dùng nào.</td></tr>}
                    </tbody>
                </table>
                {response && response.total > response.per_page && (
                    <div className="p-4 flex justify-between items-center border-t text-sm text-gray-600">
                        <p>Hiển thị <strong>{response.from}</strong> đến <strong>{response.to}</strong> trong <strong>{response.total}</strong> kết quả</p>
                        <div className="flex gap-2">
                            <button onClick={() => updateUrlParams({ page: page - 1 })} disabled={!response.prev_page_url} className="p-2 border rounded-md disabled:opacity-50"><ChevronLeft size={16} /></button>
                            <button onClick={() => updateUrlParams({ page: page + 1 })} disabled={!response.next_page_url} className="p-2 border rounded-md disabled:opacity-50"><ChevronRight size={16} /></button>
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

