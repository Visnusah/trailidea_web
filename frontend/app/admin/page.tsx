export default function AdminOverviewPage() {
    return (
        <div className="admin-panel">
            <div className="admin-panel__header">
                <div className="admin-panel__title-wrap">
                    <div>
                        <h1 className="admin-panel__title">Overview</h1>
                        <p className="admin-panel__subtitle">Admin dashboard coming soon</p>
                    </div>
                </div>
            </div>
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 320,
                color: "var(--color-on-surface-variant)",
                fontFamily: "var(--font-family)",
                fontSize: 15,
                gap: 10,
            }}>
                <span className="material-symbols-outlined" style={{ fontSize: 28 }}>construction</span>
                Overview stats coming in a future sprint
            </div>
        </div>
    );
}
