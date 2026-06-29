"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    getAdminUsers,
    createAdminUser,
    updateAdminUser,
    deleteAdminUser,
    UserRecord,
    PaginationMeta,
} from "@/lib/api/admin-users";

/* ── Zod Validation Schemas ── */
const CreateUserSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Valid email required"),
    username: z.string().min(3, "Username must be ≥ 3 chars"),
    password: z.string().min(6, "Password must be ≥ 6 chars"),
    role: z.enum(["admin", "user"]),
});
type CreateUserForm = z.infer<typeof CreateUserSchema>;

const EditUserSchema = z.object({
    firstName: z.string().min(1, "First name is required").optional().or(z.literal("")),
    lastName: z.string().min(1, "Last name is required").optional().or(z.literal("")),
    email: z.string().email("Valid email required").optional().or(z.literal("")),
    username: z.string().min(3, "Username must be ≥ 3 chars").optional().or(z.literal("")),
    password: z.string().min(6, "Must be ≥ 6 chars").optional().or(z.literal("")),
    role: z.enum(["admin", "user"]),
});
type EditUserForm = z.infer<typeof EditUserSchema>;

/* ── Helpers ── */
const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

const getInitials = (u: UserRecord) =>
    `${u.firstName[0] ?? ""}${u.lastName[0] ?? ""}`.toUpperCase();

/* ── Main Component ── */
export default function AdminUsersPage() {
    /* State */
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    /* Modal state */
    const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    /* Debounce search */
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    /* ── Fetch Users ── */
    const fetchUsers = useCallback(async (p: number, s: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAdminUsers({ page: p, limit: 10, search: s });
            setUsers(res.data);
            setMeta(res.meta);
        } catch (err: any) {
            setError(err.message || "Failed to load users");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers(page, search);
    }, [page, fetchUsers]); // search is handled via debounce below

    const handleSearchChange = (val: string) => {
        setSearch(val);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setPage(1);
            fetchUsers(1, val);
        }, 400);
    };

    /* ── Create Form ── */
    const createForm = useForm<CreateUserForm>({
        resolver: zodResolver(CreateUserSchema),
        defaultValues: { role: "user" },
    });

    /* ── Edit Form ── */
    const editForm = useForm<EditUserForm>({
        resolver: zodResolver(EditUserSchema),
        defaultValues: { role: "user" },
    });

    /* ── Open Create Modal ── */
    const openCreate = () => {
        createForm.reset({ role: "user", firstName: "", lastName: "", email: "", username: "", password: "" });
        setFormError(null);
        setModalMode("create");
    };

    /* ── Open Edit Modal ── */
    const openEdit = (user: UserRecord) => {
        setSelectedUser(user);
        editForm.reset({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username,
            password: "",
            role: user.role,
        });
        setFormError(null);
        setModalMode("edit");
    };

    /* ── Submit Create ── */
    const onCreateSubmit = async (data: CreateUserForm) => {
        setSubmitting(true);
        setFormError(null);
        try {
            await createAdminUser(data);
            setModalMode(null);
            fetchUsers(page, search);
        } catch (err: any) {
            setFormError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    /* ── Submit Edit ── */
    const onEditSubmit = async (data: EditUserForm) => {
        if (!selectedUser) return;
        setSubmitting(true);
        setFormError(null);
        // Remove empty optional fields
        const payload: Record<string, any> = {};
        (Object.keys(data) as Array<keyof EditUserForm>).forEach((k) => {
            const val = data[k];
            if (val !== "" && val !== undefined) payload[k] = val;
        });
        try {
            await updateAdminUser(selectedUser._id, payload);
            setModalMode(null);
            fetchUsers(page, search);
        } catch (err: any) {
            setFormError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    /* ── Delete ── */
    const handleDelete = async () => {
        if (!deleteTarget) return;
        setSubmitting(true);
        try {
            await deleteAdminUser(deleteTarget._id);
            setDeleteTarget(null);
            // If we deleted the last item on a page > 1, go back
            if (users.length === 1 && page > 1) {
                setPage((p) => p - 1);
            } else {
                fetchUsers(page, search);
            }
        } catch (err: any) {
            setError(err.message);
            setDeleteTarget(null);
        } finally {
            setSubmitting(false);
        }
    };

    /* ── Pagination pages array ── */
    const getPageNumbers = () => {
        const pages: (number | "...")[] = [];
        const total = meta.totalPages;
        if (total <= 7) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }
        pages.push(1);
        if (page > 3) pages.push("...");
        for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) {
            pages.push(i);
        }
        if (page < total - 2) pages.push("...");
        pages.push(total);
        return pages;
    };

    /* ── Render ── */
    return (
        <div className="admin-panel">
            {/* Header */}
            <div className="admin-panel__header">
                <div className="admin-panel__title-wrap">
                    <span className="material-symbols-outlined admin-panel__icon">manage_accounts</span>
                    <div>
                        <h1 className="admin-panel__title">User Management</h1>
                        <p className="admin-panel__subtitle">
                            {meta.total} total users registered
                        </p>
                    </div>
                </div>
                <button
                    id="admin-add-user-btn"
                    className="admin-btn admin-btn--primary"
                    onClick={openCreate}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                        person_add
                    </span>
                    Add User
                </button>
            </div>

            {/* Search Bar */}
            <div className="admin-toolbar">
                <div className="admin-search">
                    <span className="material-symbols-outlined admin-search__icon">search</span>
                    <input
                        id="admin-user-search"
                        type="text"
                        className="admin-search__input"
                        placeholder="Search by name, email, or username..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                    {search && (
                        <button
                            className="admin-search__clear"
                            onClick={() => handleSearchChange("")}
                            aria-label="Clear search"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                                close
                            </span>
                        </button>
                    )}
                </div>
                <div className="admin-toolbar__meta">
                    {!loading && (
                        <span className="admin-toolbar__count">
                            Showing {users.length} of {meta.total} users
                        </span>
                    )}
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="admin-error-banner">
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                        error
                    </span>
                    {error}
                    <button className="admin-error-banner__retry" onClick={() => fetchUsers(page, search)}>
                        Retry
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Username</th>
                            <th>Role</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Loading skeleton */}
                        {loading &&
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={`skel-${i}`} className="admin-table__skeleton-row">
                                    <td><div className="admin-skeleton admin-skeleton--user" /></td>
                                    <td><div className="admin-skeleton admin-skeleton--text" /></td>
                                    <td><div className="admin-skeleton admin-skeleton--text-sm" /></td>
                                    <td><div className="admin-skeleton admin-skeleton--badge" /></td>
                                    <td><div className="admin-skeleton admin-skeleton--text-sm" /></td>
                                    <td><div className="admin-skeleton admin-skeleton--actions" /></td>
                                </tr>
                            ))}

                        {/* Empty state */}
                        {!loading && !error && users.length === 0 && (
                            <tr>
                                <td colSpan={6}>
                                    <div className="admin-empty">
                                        <span className="material-symbols-outlined admin-empty__icon">
                                            person_search
                                        </span>
                                        <p className="admin-empty__title">No users found</p>
                                        <p className="admin-empty__subtitle">
                                            {search
                                                ? `No results for "${search}". Try a different search term.`
                                                : "There are no users yet. Create the first one!"}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Data rows */}
                        {!loading &&
                            users.map((user) => (
                                <tr key={user._id} className="admin-table__row">
                                    <td>
                                        <div className="admin-user-cell">
                                            <div
                                                className="admin-user-avatar"
                                                style={{
                                                    background: user.role === "admin"
                                                        ? "var(--color-primary)"
                                                        : "var(--color-secondary)",
                                                }}
                                            >
                                                {user.imageUrl ? (
                                                    <img
                                                        src={user.imageUrl}
                                                        alt={user.firstName}
                                                        className="admin-user-avatar__img"
                                                    />
                                                ) : (
                                                    getInitials(user)
                                                )}
                                            </div>
                                            <div className="admin-user-info">
                                                <span className="admin-user-info__name">
                                                    {user.firstName} {user.lastName}
                                                </span>
                                                <span className="admin-user-info__id">
                                                    #{user._id.slice(-6)}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="admin-table__email">{user.email}</td>
                                    <td className="admin-table__username">@{user.username}</td>
                                    <td>
                                        <span
                                            className={`admin-role-badge ${user.role === "admin"
                                                ? "admin-role-badge--admin"
                                                : "admin-role-badge--user"
                                                }`}
                                        >
                                            {user.role === "admin" && (
                                                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
                                                    shield
                                                </span>
                                            )}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="admin-table__date">{formatDate(user.createdAt)}</td>
                                    <td>
                                        <div className="admin-table__actions">
                                            <button
                                                id={`edit-user-${user._id}`}
                                                className="admin-action-btn admin-action-btn--edit"
                                                onClick={() => openEdit(user)}
                                                title="Edit user"
                                            >
                                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                                                    edit
                                                </span>
                                            </button>
                                            <button
                                                id={`delete-user-${user._id}`}
                                                className="admin-action-btn admin-action-btn--delete"
                                                onClick={() => setDeleteTarget(user)}
                                                title="Delete user"
                                            >
                                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                                                    delete
                                                </span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {!loading && meta.totalPages > 1 && (
                <div className="admin-pagination">
                    <button
                        id="pagination-prev"
                        className="admin-pagination__btn"
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        aria-label="Previous page"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                            chevron_left
                        </span>
                    </button>

                    <div className="admin-pagination__pages">
                        {getPageNumbers().map((p, i) =>
                            p === "..." ? (
                                <span key={`ellipsis-${i}`} className="admin-pagination__ellipsis">
                                    ···
                                </span>
                            ) : (
                                <button
                                    key={p}
                                    id={`pagination-page-${p}`}
                                    className={`admin-pagination__page ${page === p ? "admin-pagination__page--active" : ""}`}
                                    onClick={() => setPage(p as number)}
                                >
                                    {p}
                                </button>
                            )
                        )}
                    </div>

                    <button
                        id="pagination-next"
                        className="admin-pagination__btn"
                        disabled={page === meta.totalPages}
                        onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                        aria-label="Next page"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                            chevron_right
                        </span>
                    </button>

                    <span className="admin-pagination__info">
                        Page {meta.page} of {meta.totalPages}
                    </span>
                </div>
            )}

            {/* ── Create Modal ── */}
            {modalMode === "create" && (
                <div className="admin-modal-overlay" id="admin-create-modal" onClick={(e) => { if (e.target === e.currentTarget) setModalMode(null); }}>
                    <div className="admin-modal">
                        <div className="admin-modal__header">
                            <h2 className="admin-modal__title">
                                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>person_add</span>
                                Create New User
                            </h2>
                            <button className="admin-modal__close" onClick={() => setModalMode(null)} aria-label="Close">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form
                            className="admin-modal__form"
                            onSubmit={createForm.handleSubmit(onCreateSubmit)}
                            noValidate
                        >
                            <div className="admin-form-grid">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="create-firstName">First Name</label>
                                    <input
                                        id="create-firstName"
                                        className={`form-input ${createForm.formState.errors.firstName ? "form-input--error" : ""}`}
                                        placeholder="John"
                                        {...createForm.register("firstName")}
                                    />
                                    {createForm.formState.errors.firstName && (
                                        <span className="form-field-error">
                                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>
                                            {createForm.formState.errors.firstName.message}
                                        </span>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="create-lastName">Last Name</label>
                                    <input
                                        id="create-lastName"
                                        className={`form-input ${createForm.formState.errors.lastName ? "form-input--error" : ""}`}
                                        placeholder="Doe"
                                        {...createForm.register("lastName")}
                                    />
                                    {createForm.formState.errors.lastName && (
                                        <span className="form-field-error">
                                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>
                                            {createForm.formState.errors.lastName.message}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="create-email">Email</label>
                                <input
                                    id="create-email"
                                    type="email"
                                    className={`form-input ${createForm.formState.errors.email ? "form-input--error" : ""}`}
                                    placeholder="john@example.com"
                                    {...createForm.register("email")}
                                />
                                {createForm.formState.errors.email && (
                                    <span className="form-field-error">
                                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>
                                        {createForm.formState.errors.email.message}
                                    </span>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="create-username">Username</label>
                                <input
                                    id="create-username"
                                    className={`form-input ${createForm.formState.errors.username ? "form-input--error" : ""}`}
                                    placeholder="johndoe"
                                    {...createForm.register("username")}
                                />
                                {createForm.formState.errors.username && (
                                    <span className="form-field-error">
                                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>
                                        {createForm.formState.errors.username.message}
                                    </span>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="create-password">Password</label>
                                <input
                                    id="create-password"
                                    type="password"
                                    className={`form-input ${createForm.formState.errors.password ? "form-input--error" : ""}`}
                                    placeholder="Min. 6 characters"
                                    {...createForm.register("password")}
                                />
                                {createForm.formState.errors.password && (
                                    <span className="form-field-error">
                                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>
                                        {createForm.formState.errors.password.message}
                                    </span>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="create-role">Role</label>
                                <select
                                    id="create-role"
                                    className="form-input admin-select"
                                    {...createForm.register("role")}
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            {formError && (
                                <div className="admin-form-error">
                                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
                                    {formError}
                                </div>
                            )}

                            <div className="admin-modal__footer">
                                <button
                                    type="button"
                                    className="admin-btn admin-btn--ghost"
                                    onClick={() => setModalMode(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    id="admin-create-submit"
                                    type="submit"
                                    className="admin-btn admin-btn--primary"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <span className="material-symbols-outlined" style={{ fontSize: 16, animation: "spin 1s linear infinite" }}>progress_activity</span>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
                                            Create User
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Edit Modal ── */}
            {modalMode === "edit" && selectedUser && (
                <div className="admin-modal-overlay" id="admin-edit-modal" onClick={(e) => { if (e.target === e.currentTarget) setModalMode(null); }}>
                    <div className="admin-modal">
                        <div className="admin-modal__header">
                            <h2 className="admin-modal__title">
                                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>edit</span>
                                Edit User
                            </h2>
                            <button className="admin-modal__close" onClick={() => setModalMode(null)} aria-label="Close">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="admin-modal__user-preview">
                            <div
                                className="admin-user-avatar"
                                style={{
                                    width: 44, height: 44,
                                    background: selectedUser.role === "admin" ? "var(--color-primary)" : "var(--color-secondary)",
                                }}
                            >
                                {getInitials(selectedUser)}
                            </div>
                            <div>
                                <p className="admin-modal__user-name">
                                    {selectedUser.firstName} {selectedUser.lastName}
                                </p>
                                <p className="admin-modal__user-email">{selectedUser.email}</p>
                            </div>
                        </div>

                        <form
                            className="admin-modal__form"
                            onSubmit={editForm.handleSubmit(onEditSubmit)}
                            noValidate
                        >
                            <div className="admin-form-grid">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="edit-firstName">First Name</label>
                                    <input
                                        id="edit-firstName"
                                        className={`form-input ${editForm.formState.errors.firstName ? "form-input--error" : ""}`}
                                        {...editForm.register("firstName")}
                                    />
                                    {editForm.formState.errors.firstName && (
                                        <span className="form-field-error">
                                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>
                                            {editForm.formState.errors.firstName.message}
                                        </span>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="edit-lastName">Last Name</label>
                                    <input
                                        id="edit-lastName"
                                        className={`form-input ${editForm.formState.errors.lastName ? "form-input--error" : ""}`}
                                        {...editForm.register("lastName")}
                                    />
                                    {editForm.formState.errors.lastName && (
                                        <span className="form-field-error">
                                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>
                                            {editForm.formState.errors.lastName.message}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="edit-email">Email</label>
                                <input
                                    id="edit-email"
                                    type="email"
                                    className={`form-input ${editForm.formState.errors.email ? "form-input--error" : ""}`}
                                    {...editForm.register("email")}
                                />
                                {editForm.formState.errors.email && (
                                    <span className="form-field-error">
                                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>
                                        {editForm.formState.errors.email.message}
                                    </span>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="edit-username">Username</label>
                                <input
                                    id="edit-username"
                                    className={`form-input ${editForm.formState.errors.username ? "form-input--error" : ""}`}
                                    {...editForm.register("username")}
                                />
                                {editForm.formState.errors.username && (
                                    <span className="form-field-error">
                                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>
                                        {editForm.formState.errors.username.message}
                                    </span>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="edit-password">
                                    New Password{" "}
                                    <span style={{ fontWeight: 400, opacity: 0.6 }}>(leave blank to keep current)</span>
                                </label>
                                <input
                                    id="edit-password"
                                    type="password"
                                    className={`form-input ${editForm.formState.errors.password ? "form-input--error" : ""}`}
                                    placeholder="Leave blank to keep current"
                                    {...editForm.register("password")}
                                />
                                {editForm.formState.errors.password && (
                                    <span className="form-field-error">
                                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>
                                        {editForm.formState.errors.password.message}
                                    </span>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="edit-role">Role</label>
                                <select
                                    id="edit-role"
                                    className="form-input admin-select"
                                    {...editForm.register("role")}
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            {formError && (
                                <div className="admin-form-error">
                                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
                                    {formError}
                                </div>
                            )}

                            <div className="admin-modal__footer">
                                <button
                                    type="button"
                                    className="admin-btn admin-btn--ghost"
                                    onClick={() => setModalMode(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    id="admin-edit-submit"
                                    type="submit"
                                    className="admin-btn admin-btn--primary"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <span className="material-symbols-outlined" style={{ fontSize: 16, animation: "spin 1s linear infinite" }}>progress_activity</span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>save</span>
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Delete Confirmation Modal ── */}
            {deleteTarget && (
                <div className="admin-modal-overlay" id="admin-delete-modal" onClick={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
                    <div className="admin-modal admin-modal--danger">
                        <div className="admin-modal__header">
                            <h2 className="admin-modal__title admin-modal__title--danger">
                                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>warning</span>
                                Delete User
                            </h2>
                            <button className="admin-modal__close" onClick={() => setDeleteTarget(null)} aria-label="Close">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="admin-delete-body">
                            <div className="admin-delete-user-preview">
                                <div
                                    className="admin-user-avatar"
                                    style={{
                                        width: 52, height: 52, fontSize: 18,
                                        background: deleteTarget.role === "admin" ? "var(--color-primary)" : "var(--color-secondary)",
                                    }}
                                >
                                    {getInitials(deleteTarget)}
                                </div>
                                <div>
                                    <p className="admin-modal__user-name">
                                        {deleteTarget.firstName} {deleteTarget.lastName}
                                    </p>
                                    <p className="admin-modal__user-email">{deleteTarget.email}</p>
                                </div>
                            </div>

                            <p className="admin-delete-warning">
                                This action is <strong>irreversible</strong>. The user and all associated data will be permanently removed from the system.
                            </p>
                        </div>

                        <div className="admin-modal__footer">
                            <button
                                id="admin-delete-cancel"
                                className="admin-btn admin-btn--ghost"
                                onClick={() => setDeleteTarget(null)}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                id="admin-delete-confirm"
                                className="admin-btn admin-btn--danger"
                                onClick={handleDelete}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <span className="material-symbols-outlined" style={{ fontSize: 16, animation: "spin 1s linear infinite" }}>progress_activity</span>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete_forever</span>
                                        Delete User
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
