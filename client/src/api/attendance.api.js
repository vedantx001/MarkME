// src/api/attendance.api.js

import { apiFetch } from "./http";

const toUiRecord = (r) => {
    const student = r?.studentId;
    return {
        id: r?._id || r?.id, // recordId (used for updates)
        studentId: student?._id || student?.id,
        rollNo: student?.rollNumber ?? student?.rollNo,
        name: student?.name || "—",
        status: r?.status,
        initialStatus: r?.status,
        source: r?.source,
        edited: !!r?.edited,
    };
};

export const uploadClassroomImages = async ({ classId, files, sessionId } = {}) => {
    const list = Array.isArray(files) ? files : [];

    if (!classId) {
        throw new Error('classId is required');
    }

    if (list.length === 0) {
        throw new Error('Please select at least one image');
    }

    // 1) Ask backend for signed upload params
    const sig = await apiFetch('/attendance-sessions/cloudinary-signature', {
        method: 'POST',
        auth: true,
        body: { classId, count: Math.min(4, list.length) },
    });

    const uploadUrl = sig?.uploadUrl;
    const apiKey = sig?.apiKey;
    const folder = sig?.folder;
    const items = Array.isArray(sig?.items) ? sig.items : [];

    if (!uploadUrl || !apiKey || !folder || items.length === 0) {
        throw new Error('Could not prepare image upload. Please try again.');
    }

    // 2) Upload selected images directly to Cloudinary
    const uploadCount = Math.min(list.length, items.length);
    const uploads = [];

    for (let i = 0; i < uploadCount; i++) {
        const file = list[i];
        const { publicId, timestamp, signature } = items[i] || {};
        if (!publicId || !timestamp || !signature) {
            throw new Error('Could not prepare image upload. Please try again.');
        }

        const fd = new FormData();
        fd.append('file', file);
        fd.append('api_key', apiKey);
        fd.append('timestamp', String(timestamp));
        fd.append('folder', folder);
        fd.append('public_id', publicId);
        fd.append('signature', signature);

        const res = await fetch(uploadUrl, {
            method: 'POST',
            body: fd,
        });

        const json = await res.json().catch(() => null);
        if (!res.ok) {
            const message = json?.error?.message || `Cloud upload failed (${res.status})`;
            throw new Error(message);
        }

        const secureUrl = json?.secure_url;
        if (!secureUrl) {
            throw new Error('Cloud upload failed (missing URL).');
        }
        uploads.push(secureUrl);
    }

    // 3) Call backend attendance processing with imageUrls (small JSON, no multipart)
    const data = await apiFetch('/attendance-sessions/process', {
        method: 'POST',
        auth: true,
        body: {
            classId,
            sessionId,
            imageUrls: uploads,
        },
    });

    const records = Array.isArray(data?.records) ? data.records : [];
    return {
        sessionId: data?.sessionId,
        classId: data?.classId,
        total: data?.total,
        present: data?.present,
        absent: data?.absent,
        records: records.map(toUiRecord),
    };
};

export const submitAttendance = async (sessionId, updates) => {
    // updates: [{ recordId, status }]
    return apiFetch(`/attendance-records/${encodeURIComponent(sessionId)}/records`, {
        method: "PUT",
        auth: true,
        body: { updates },
    });
};
