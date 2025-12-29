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
    const form = new FormData();
    if (classId) form.append("classId", classId);
    if (sessionId) form.append("sessionId", sessionId);

    const list = Array.isArray(files) ? files : [];
    list.forEach((file) => {
        form.append("classroomImages", file);
    });

    const data = await apiFetch("/attendance-sessions/process", {
        method: "POST",
        auth: true,
        body: form,
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
