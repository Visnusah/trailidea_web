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

/* ── Validation Schemas ── */
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

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const getInitials = (u: UserRecord) =>
    `${u.firstName[0] ?? ""}${u.lastName[0] ?? ""}`.toUpperCase();

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    useEffect(() => { fetchUsers(page, search); }, [page, fetchUsers]);

    const handleSearchChange = (val: string) => {
        setSearch(val);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => { setPage(1); fetchUsers(1, val); }, 400);
    };

    const createForm = useForm<CreateUserForm>({ resolver: zodResolver(CreateUserSchema), defaultValues: { role: "user" } });
    const editForm = useForm<EditUserForm>({ resolver: zodResolver(EditUserSchema), defaultValues: { role: "user" } });

    const openCreate = () => {
        createForm.reset({ role: "user", firstName: "", lastName: "", email: "", username: "", password: "" });
        setFormError(null);
        setModalMode("create");
    };

    const openEdit = (user: UserRecord) => {
        setSelectedUser(user);
        editForm.reset({ firstName: user.firstName, lastName: user.lastName, email: user.email, username: user.username, password: "", role: user.role });
        setFormError(null);
        setModalMode("edit");
    };

    const onCreateSubmit = async (data: CreateUserForm) => {
        setSubmitting(true); setFormError(null);
        try { await createAdminUser(data); setModalMode(null); fetchUsers(page, search); }
        catch (err: any) { setFormError(err.message); }
        finally { setSubmitting(false); }
    };

    const onEditSubmit = async (data: EditUserForm) => {
        if (!selectedUser) return;
        setSubmitting(true); setFormError(null);
        const payload: Record<string, any> = {};
        (Object.keys(data) as Array<keyof EditUserForm>).forEach((k) => {
            const val = data[k];
            if (val !== "" && val !== undefined) payload[k] = val;
        });
        try { await updateAdminUser(selectedUser._id, payload); setModalMode(null); fetchUsers(page, search); }
        catch (err: any) { setFormError(err.message); }
        finally { setSubmitting(false); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setSubmitting(true);
        try {
            await deleteAdminUser(deleteTarget._id);
            setDeleteTarget(null);
            if (users.length === 1 && page > 1) setPage((p) => p - 1);
            else fetchUsers(page, search);
        } catch (err: any) { setError(err.message); setDeleteTarget(null); }
        finally { setSubmitting(false); }
    };

    const getPageNumbers = () => {
        const total = meta.totalPages;
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1) as (number | "...")[];
        const pages: (number | "...")[] = [1];
        if (page > 3) pages.push("...");
        for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) pages.push(i);
        if (page < total - 2) pages.push("...");
        pages.push(total);
        return pages;
    };

    return (
        <div className="admin-panel">
            {/* Page Header */}
            <div className="admin-panel__header">
                <div className="admin-panel__title-wrap">
                    <span className="material-symbols-outlined admin-panel__icon">people_outline</span>
                    <div>
                        <h1 className="admin-panel__title">User Directory</h1>
                        <p className="admin-panel__subtitle">Manage credentials and roles for registered trail seekers</p>
                    </div>
                </div>
                <button id="admin-add-user-btn" className="admin-btn admin-btn--primary" onClick={openCreate}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>how_to_reg</span>
                    Add New User
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="admin-error-banner">
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>error_outline</span>
                    {error}
                    <button className="admin-error-banner__retry" onClick={() => fetchUsers(page, search)}>Retry</button>
                </div>
            )}

            <div className="admin-bento">
                {/* Toolbar Bento Card */}
                <div className="bento-card bc-6">
                    <div className="admin-toolbar">
                        <div className="admin-search" style={{ flex: 1 }}>
                            <span className="material-symbols-outlined admin-search__icon">search</span>
                            <input
                                id="admin-user-search" type="text" className="admin-search__input"
                                placeholder="Search by name, email, or username..."
                                value={search} onChange={(e) => handleSearchChange(e.target.value)}
                            />
                            {search && (
                                <button className="admin-search__clear" onClick={() => handleSearchChange("")} aria-label="Clear search">
                                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                                </button>
                            )}
                        </div>
                        {!loading && <span className="admin-toolbar__count">Showing {users.length} of {meta.total} user profiles</span>}
                    </div>
                </div>

                {/* Table Bento Card */}
                <div className="bento-card bc-6">
                    <div className="admin-table-wrap" style={{ border: "none", boxShadow: "none" }}>
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
                                {loading && Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={`skel-${i}`}>
                                        <td colSpan={6} style={{ textAlign: "center", padding: "16px" }}>
                                            <span className="material-symbols-outlined" style={{ animation: "spin 1.5s linear infinite", color: "var(--color-primary)" }}>sync</span>
                                        </td>
                                    </tr>
                                ))}
                                {!loading && !error && users.length === 0 && (
                                    <tr>
                                        <td colSpan={6}>
                                            <div className="admin-empty-state">
                                                <span className="material-symbols-outlined admin-empty-state__icon">person_search</span>
                                                <p>No matching users found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {!loading && users.map((user) => (
                                    <tr key={user._id} className="admin-table__row" id={`user-row-${user._id}`}>
                                        <td>
                                            <div className="admin-user-cell">
                                                <div className="admin-user-avatar admin-user-avatar--sm">
                                                    {user.imageUrl ? (
                                                        <img src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${user.imageUrl}`} alt={user.firstName} />
                                                    ) : (
                                                        getInitials(user)
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="admin-user-name">{user.firstName} {user.lastName}</div>
                                                    <div className="admin-user-username">@{user.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>@{user.username}</td>
                                        <td>
                                            <span className={`admin-role-badge admin-role-badge--${user.role}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="admin-date-cell">{formatDate(user.createdAt)}</span>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", gap: 6 }}>
                                                <button id={`edit-user-${user._id}`} className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => openEdit(user)} title="Edit user">
                                                    <span className="material-symbols-outlined" style={{ fontSize: 15 }}>edit_note</span>
                                                    Edit
                                                </button>
                                                <button id={`delete-user-${user._id}`} className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => setDeleteTarget(user)} title="Delete user">
                                                    <span className="material-symbols-outlined" style={{ fontSize: 15 }}>delete_outline</span>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {!loading && meta.totalPages > 1 && (
                    <div className="bc-6" style={{ display: "flex", justifyContent: "center" }}>
                        <div className="admin-pagination">
                            <button className="admin-btn admin-btn--ghost admin-btn--sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Previous page">
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_left</span>
                                Prev
                            </button>
                            <span className="admin-pagination__info">Page {meta.page} of {meta.totalPages}</span>
                            <button className="admin-btn admin-btn--ghost admin-btn--sm" disabled={page === meta.totalPages} onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} aria-label="Next page">
                                Next
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Create Modal ── */}
            {modalMode === "create" && (
                <div className="admin-modal-overlay" id="admin-create-modal" onClick={(e) => { if (e.target === e.currentTarget) setModalMode(null); }}>
                    <div className="admin-modal">
                        <div className="admin-modal__icon" style={{ background: "var(--color-primary-fixed)", color: "var(--color-primary)" }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 32 }}>how_to_reg</span>
                        </div>
                        <h2 className="admin-modal__title">Create New User</h2>
                        <form className="admin-modal__form" style={{ width: "100%", marginTop: 12 }} onSubmit={createForm.handleSubmit(onCreateSubmit)} noValidate>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                                    <label htmlFor="create-firstName" style={{ fontSize: 11, fontWeight: 700 }}>First Name</label>
                                    <input id="create-firstName" className="admin-search__input" style={{ padding: "8px 12px" }} placeholder="John" {...createForm.register("firstName")} />
                                    {createForm.formState.errors.firstName && <span style={{ fontSize: 11, color: "var(--color-error)" }}>{createForm.formState.errors.firstName.message}</span>}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                                    <label htmlFor="create-lastName" style={{ fontSize: 11, fontWeight: 700 }}>Last Name</label>
                                    <input id="create-lastName" className="admin-search__input" style={{ padding: "8px 12px" }} placeholder="Doe" {...createForm.register("lastName")} />
                                    {createForm.formState.errors.lastName && <span style={{ fontSize: 11, color: "var(--color-error)" }}>{createForm.formState.errors.lastName.message}</span>}
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left", marginTop: 10 }}>
                                <label htmlFor="create-email" style={{ fontSize: 11, fontWeight: 700 }}>Email</label>
                                <input id="create-email" type="email" className="admin-search__input" style={{ padding: "8px 12px" }} placeholder="john@example.com" {...createForm.register("email")} />
                                {createForm.formState.errors.email && <span style={{ fontSize: 11, color: "var(--color-error)" }}>{createForm.formState.errors.email.message}</span>}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left", marginTop: 10 }}>
                                <label htmlFor="create-username" style={{ fontSize: 11, fontWeight: 700 }}>Username</label>
                                <input id="create-username" className="admin-search__input" style={{ padding: "8px 12px" }} placeholder="johndoe" {...createForm.register("username")} />
                                {createForm.formState.errors.username && <span style={{ fontSize: 11, color: "var(--color-error)" }}>{createForm.formState.errors.username.message}</span>}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left", marginTop: 10 }}>
                                <label htmlFor="create-password" style={{ fontSize: 11, fontWeight: 700 }}>Password</label>
                                <input id="create-password" type="password" className="admin-search__input" style={{ padding: "8px 12px" }} placeholder="Min. 6 characters" {...createForm.register("password")} />
                                {createForm.formState.errors.password && <span style={{ fontSize: 11, color: "var(--color-error)" }}>{createForm.formState.errors.password.message}</span>}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left", marginTop: 10 }}>
                                <label htmlFor="create-role" style={{ fontSize: 11, fontWeight: 700 }}>Role</label>
                                <select id="create-role" className="admin-search__input" style={{ padding: "8px 12px", background: "none" }} {...createForm.register("role")}>
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            {formError && <div style={{ fontSize: 12, color: "var(--color-error)", marginTop: 10 }}>{formError}</div>}
                            <div className="admin-modal__actions" style={{ marginTop: 16 }}>
                                <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setModalMode(null)}>Cancel</button>
                                <button id="admin-create-submit" type="submit" className="admin-btn admin-btn--primary" disabled={submitting}>
                                    {submitting ? "Creating..." : "Create User"}
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
                        <div className="admin-modal__icon" style={{ background: "var(--color-primary-fixed)", color: "var(--color-primary)" }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 32 }}>edit_note</span>
                        </div>
                        <h2 className="admin-modal__title">Edit User Details</h2>
                        <form className="admin-modal__form" style={{ width: "100%", marginTop: 12 }} onSubmit={editForm.handleSubmit(onEditSubmit)} noValidate>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                                    <label htmlFor="edit-firstName" style={{ fontSize: 11, fontWeight: 700 }}>First Name</label>
                                    <input id="edit-firstName" className="admin-search__input" style={{ padding: "8px 12px" }} {...editForm.register("firstName")} />
                                    {editForm.formState.errors.firstName && <span style={{ fontSize: 11, color: "var(--color-error)" }}>{editForm.formState.errors.firstName.message}</span>}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                                    <label htmlFor="edit-lastName" style={{ fontSize: 11, fontWeight: 700 }}>Last Name</label>
                                    <input id="edit-lastName" className="admin-search__input" style={{ padding: "8px 12px" }} {...editForm.register("lastName")} />
                                    {editForm.formState.errors.lastName && <span style={{ fontSize: 11, color: "var(--color-error)" }}>{editForm.formState.errors.lastName.message}</span>}
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left", marginTop: 10 }}>
                                <label htmlFor="edit-email" style={{ fontSize: 11, fontWeight: 700 }}>Email</label>
                                <input id="edit-email" type="email" className="admin-search__input" style={{ padding: "8px 12px" }} {...editForm.register("email")} />
                                {editForm.formState.errors.email && <span style={{ fontSize: 11, color: "var(--color-error)" }}>{editForm.formState.errors.email.message}</span>}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left", marginTop: 10 }}>
                                <label htmlFor="edit-username" style={{ fontSize: 11, fontWeight: 700 }}>Username</label>
                                <input id="edit-username" className="admin-search__input" style={{ padding: "8px 12px" }} {...editForm.register("username")} />
                                {editForm.formState.errors.username && <span style={{ fontSize: 11, color: "var(--color-error)" }}>{editForm.formState.errors.username.message}</span>}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left", marginTop: 10 }}>
                                <label htmlFor="edit-password" style={{ fontSize: 11, fontWeight: 700 }}>New Password (blank to keep)</label>
                                <input id="edit-password" type="password" className="admin-search__input" style={{ padding: "8px 12px" }} placeholder="Leave blank to keep" {...editForm.register("password")} />
                                {editForm.formState.errors.password && <span style={{ fontSize: 11, color: "var(--color-error)" }}>{editForm.formState.errors.password.message}</span>}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left", marginTop: 10 }}>
                                <label htmlFor="edit-role" style={{ fontSize: 11, fontWeight: 700 }}>Role</label>
                                <select id="edit-role" className="admin-search__input" style={{ padding: "8px 12px", background: "none" }} {...editForm.register("role")}>
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            {formError && <div style={{ fontSize: 12, color: "var(--color-error)", marginTop: 10 }}>{formError}</div>}
                            <div className="admin-modal__actions" style={{ marginTop: 16 }}>
                                <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setModalMode(null)}>Cancel</button>
                                <button id="admin-edit-submit" type="submit" className="admin-btn admin-btn--primary" disabled={submitting}>
                                    {submitting ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Delete Confirmation Modal ── */}
            {deleteTarget && (
                <div className="admin-modal-overlay" id="admin-delete-modal" onClick={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
                    <div className="admin-modal">
                        <div className="admin-modal__icon admin-modal__icon--danger">
                            <span className="material-symbols-outlined" style={{ fontSize: 32 }}>delete_forever</span>
                        </div>
                        <h2 className="admin-modal__title">Delete User Account?</h2>
                        <p className="admin-modal__body">
                            Are you sure you want to permanently delete the profile of <strong>{deleteTarget.firstName} {deleteTarget.lastName}</strong>? This action is irreversible.
                        </p>
                        <div className="admin-modal__actions" style={{ marginTop: 16 }}>
                            <button className="admin-btn admin-btn--ghost" onClick={() => setDeleteTarget(null)} disabled={submitting}>Cancel</button>
                            <button id="admin-delete-confirm" className="admin-btn admin-btn--danger" onClick={handleDelete} disabled={submitting}>
                                {submitting ? "Deleting..." : "Delete Profile"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
