import React from "react";
export default function Progress({ total, completed }) {
    const progressPercent = Math.min((completed / total) * 100, 100);
    return (
        <div className="progress-bar">
            <div
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
            ></div>
        </div>
    );
}