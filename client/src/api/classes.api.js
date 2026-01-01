import { apiFetch } from "./http";

const toUiClassroom = (c) => ({
  id: c?._id || c?.id,
  name: c?.name || "—",
  educationalYear: c?.educationalYear || c?.educationalYearLabel || "—",
  std: c?.std,
  division: c?.division,
  classTeacherId: c?.classTeacherId?._id || c?.classTeacherId,
  classTeacherName: c?.classTeacherId?.name,
});

export async function listMyClassesApi() {
  // Server: GET /api/classes
  // - TEACHER: returns only their assigned classes
  // - ADMIN/PRINCIPAL: returns all classes in school
  const data = await apiFetch("/classes", { method: "GET", auth: true });
  const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  return list.map(toUiClassroom);
}
